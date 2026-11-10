"""全离线行为回归：不读环境凭据，不请求 SLS 或飞书。"""
import copy
import importlib.util
import json
import os
import re
import sqlite3
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

BOARD_PROJECT = Path(os.environ.get("CHAIN_BOARD_PROJECT") or Path(__file__).resolve().parents[3] / "xlb-chain-board").resolve()
SCRIPTS = BOARD_PROJECT / "reporting"
sys.path.insert(0, str(SCRIPTS))
from report_core import ReportError, atomic_json, bind_scope, build_query, canonical, digest, expected_compute_scope, load_json, normalize_scope, sanitize_config
from report_collect import Collector, SlsClient, TransientError, iter_pieces
from report_analyze import analyze, check, mask_ip


def raw_scope():
    return {"target": "预约", "env": "prod", "from": "2026-09-21T00:00:00+08:00", "to": "2026-09-21T03:00:00+08:00", "timezone": "Asia/Shanghai", "appName": "sample-web", "nodeKeys": ["delivery_note"], "sls": {"topic": "sample", "project": "sample-project", "logstore": "sample-store"}, "eventCodes": ["confirm"], "pageIds": ["sample-page"], "includeIp": True, "events": [{"code": "confirm", "name": "预约确认", "type": "click"}], "fields": "event_code event_name event_id event_ver order_type order_fid order_fids order_no action_result trace_id chain_trace_id page_event_seq chain_seq user_id user_name company_name store_name fail_reason validate_fail_fields validate_fail_details".split(), "boardUrl": "https://board.example.com", "configFingerprint": "config-fingerprint", "nodeConfig": {"nodeKey": "delivery_note", "name": "发货单", "stepOrder": ["enter", "appoint"], "stepNames": {"appoint": "预约发货"}, "regressiveCodes": ["revoke"], "fulfillCodes": ["confirm"], "closeCodes": [], "intentSteps": ["appoint"]}}


def scope():
    return normalize_scope(raw_scope(), now=1800000000)


def kpi_fixture(s, **over):
    """本地计算产物夹具：形态与 scripts/tracking-report-compute.ts 的 kpi.json 一致，核心 KPI 固定样本值，不从本地明细重算。"""
    node = dict(s["nodeConfig"])
    node.pop("nodeKey")
    summary = {"eventCount": 900, "focusChainId": s["nodeKeys"][0],
               "docKpis": [{"orderType": s["nodeKeys"][0], "docTotal": 123, "closedCount": 100, "closeRate": 100 / 123, "edges": [], "topFailReasons": []}],
               "flowKpis": [], "funnel": [], "docTypeStats": [], "nodes": {},
               "traceStats": {"total": 0, "done": 0, "stuck": 0},
               "bottlenecks": {"stuckCount": 0, "samples": [], "regressiveByStep": [], "failByEvent": []},
               "config": {"chains": [dict(node, orderType=s["nodeConfig"]["nodeKey"], chainId=s["nodeConfig"]["nodeKey"])],
                          "docTypeOrder": list(s["nodeKeys"]), "store": "sls", "window": {"from": s["start"] * 1000, "to": s["end"] * 1000 - 1}},
               "facts": {"docTotal": 123}}
    value = {"complete": True, "fingerprint": digest(s), "computeRunId": "compute-fixture", "source": "local-compute",
             "analyzerVersion": "tracking-fixture", "analyzerDigest": "analyzer-digest-fixture", "configFingerprint": s["configFingerprint"],
             "configRetrievedAt": None, "generatedAt": "2026-10-23T06:00:00.000Z", "scope": expected_compute_scope(s),
             "quality": {"complete": True, "source": "sls", "coverage": [{"from": s["start"] * 1000, "to": s["end"] * 1000, "complete": True}],
                         "componentStatus": {"business": "ready", "compare": "unsupported", "pageStats": "unsupported", "jsErrors": "unsupported"}, "warnings": []},
             "summary": summary,
             "stats": {"eventsRead": 900, "eventsUnique": 900, "duplicatesAbsorbed": 0, "runs": 1, "checkpoints": 1, "parts": 1, "peakRssMb": 100, "summaryBytes": 1024, "seconds": 1},
             "warnings": []}
    value.update(over)
    return value


def write_kpi(s, out, value=None):
    """写入范围快照、kpi.json 与同级摘要；替代原来通过看板 HTTP 产出 board.json 的步骤。"""
    import hashlib
    import json as _json
    bind_scope(out, s)
    value = value if value is not None else kpi_fixture(s)
    payload = _json.dumps(value, ensure_ascii=False, sort_keys=True, indent=2)
    path = Path(out) / "kpi.json"
    path.write_text(payload, encoding="utf-8")
    (Path(out) / "kpi.sha256").write_text(hashlib.sha256(payload.encode("utf-8")).hexdigest(), encoding="utf-8")
    return value


def row(eid, result, seconds=1, fid="A", user="u1", **kwargs):
    s = scope()
    value = {"timestamp": str((s["start"] + seconds) * 1000), "env": "prod", "app_name": "sample-web", "topic": "sample", "page_id": "sample-page", "event_type": "CLICK", "b_order_type": "delivery_note", "b_order_fid": fid, "b_event_code": "confirm", "b_event_name": "预约确认", "b_event_id": eid, "b_event_ver": "1.0.0", "b_action_result": result, "b_user_id": user, "b_user_name": "账号", "b_company_name": "组织", "b_store_name": "仓库", "client_ip": "192.0.2.1", "b_fail_reason": "quota" if result == "fail" else "form_validate" if result == "validate_fail" else ""}
    value.update(kwargs)
    return value


class FakeClient:
    def __init__(self, rows, cap=None, errors=None):
        self.rows, self.cap, self.errors, self.calls = rows, cap, list(errors or []), []

    def query(self, start, end, query, timeout):
        self.calls.append((start, end, query))
        if self.errors:
            error = self.errors.pop(0)
            if isinstance(error, Exception):
                raise error
            if error:
                return {"progress": error, "rows": []}
        rows = [r for r in self.rows if start*1000 <= int(r["timestamp"]) < end*1000]
        cap = int(query.rsplit("limit ", 1)[1])
        return {"progress": "Complete", "rows": rows[:cap]}


class Clock:
    def __init__(self):
        self.now = 0

    def read(self):
        return self.now

    def sleep(self, n):
        self.now += n


class PipelineTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.out = Path(self.tmp.name)

    def tearDown(self):
        self.tmp.cleanup()

    def fetch(self, rows, s=None, **kwargs):
        s = s or scope()
        write_kpi(s, self.out)
        client = FakeClient(rows)
        result = Collector(s, self.out, "fetch", client, **kwargs).run()
        return client, result

    def test_time_half_open_and_timezone(self):
        s = scope()
        self.assertEqual(s["start"], 1789920000)
        self.assertEqual(s["end"]-s["start"], 3*3600)
        self.fetch([row("first", "success", 0), row("last", "success", 10799), row("outside", "fail", 10800)])
        analyze(self.out)
        evidence = load_json(self.out / "evidence.json")
        self.assertEqual(evidence["uniqueEvents"], 2)
        self.assertEqual(evidence["businessMetrics"]["fail"], 0)

    def test_input_rejects_future_env_and_naive_dates(self):
        for key, value in (("env", "production"), ("from", "2026-09-21T00:00:00"), ("to", "2999-01-01T00:00:00+08:00"), ("fields", ["api_response"]), ("fields", ["driver_phone"]), ("eventCodes", ["confirm';drop table log"]), ("budget", {"requests": 1001})):
            raw = raw_scope()
            raw[key] = value
            with self.subTest(key=key), self.assertRaises(ReportError):
                normalize_scope(raw)

    def test_sql_scoping_escape_and_no_offset(self):
        raw = raw_scope()
        raw["appName"] = "vendor's-app"
        raw["orderFids"] = ["A'B"]
        s = normalize_scope(raw)
        query = build_query(s, s["start"], s["end"])
        self.assertIn("vendor''s-app", query)
        self.assertIn("json_array_contains", query)
        self.assertIn("'A''B'", query)
        self.assertNotIn("offset", query)
        self.assertNotIn("event_type in", query)  # 单据范围不混无关联 PV。
        self.assertIn('"__tag__:__client_ip__"', query)
        self.assertNotIn('"user" as', query)

    def test_multi_source_scope_filters_all_rows_and_dedupes_per_app(self):
        raw = raw_scope()
        raw["appNames"] = ["sample-web", "sample-rn"]
        raw["sls"]["topics"] = ["sample", "sample-rn-topic"]
        s = normalize_scope(raw)
        query = build_query(s, s["start"], s["end"])
        self.assertIn("json_extract_scalar(app, '$.name') in ('sample-rn','sample-web')", query)
        self.assertIn("__topic__ in ('sample','sample-rn-topic')", query)
        self.assertEqual(expected_compute_scope(s)["apps"], ["sample-rn", "sample-web"])
        self.assertEqual(expected_compute_scope(s)["topics"], ["sample", "sample-rn-topic"])
        rn = row("same-event", "success", app_name="sample-rn", topic="sample-rn-topic")
        duplicate = row("same-event", "success", app_name="sample-web", topic="sample-rn-topic")
        self.fetch([row("same-event", "success"), rn, duplicate], s=s)
        analyze(self.out)
        evidence = load_json(self.out / "evidence.json")
        self.assertEqual(evidence["uniqueEvents"], 2)
        self.assertEqual(load_json(self.out / "quality.json")["counts"].get("scopeMismatch", 0), 0)

    def test_split_full_window_and_resume_empty_pieces(self):
        # 两行触顶拆窗，一行成功一行失败，不损失事件；另两个小时空片也复用。
        rows = [row("a", "fail", 1), row("b", "success", 1801)]
        client, result = self.fetch(rows, page_limit=2)
        self.assertGreater(result["pieces"], 3)
        self.assertEqual(sum(len(x) for x in iter_pieces(self.out)), 2)
        again = FakeClient([])
        resumed = Collector(scope(), self.out, "fetch", again, page_limit=2).run()
        self.assertEqual(again.calls, [])
        self.assertEqual(resumed["pieces"], result["pieces"])

    def test_single_second_full_fails_without_silent_success(self):
        with self.assertRaisesRegex(ReportError, "SINGLE_SECOND"):
            self.fetch([row("a", "fail"), row("b", "fail")], page_limit=2)
        self.assertFalse(load_json(self.out / "fetch.checkpoints/manifest.json")["complete"])
        with self.assertRaisesRegex(ReportError, "INCOMPLETE_COLLECTION"):
            list(iter_pieces(self.out))

    def test_incomplete_and_transient_retry_bounded(self):
        clock = Clock()
        client = FakeClient([row("a", "success")], errors=[TransientError("network"), "Incomplete", None])
        Collector(scope(), self.out, "fetch", client, clock=clock.read, sleep=clock.sleep).run()
        self.assertGreaterEqual(clock.now, 12)
        self.assertEqual(sum(len(r) for r in iter_pieces(self.out)), 1)

    def test_unknown_progress_blocked(self):
        client = FakeClient([], errors=["Unknown"])
        with self.assertRaisesRegex(ReportError, "UNKNOWN_QUERY_PROGRESS"):
            Collector(scope(), self.out, "fetch", client).run()
        self.assertFalse(load_json(self.out / "fetch.checkpoints/manifest.json")["complete"])

    def test_sls_progress_casing_normalized(self):
        # SLS 实际返回 x-log-progress: InComplete（大写 C，2026-10-26 prod 实证 3/3 复现）；
        # 按 "Incomplete" 精确比较曾把正常续扫中间态误判为 UNKNOWN_QUERY_PROGRESS 而硬失败。
        clock = Clock()
        client = FakeClient([row("a", "success")], errors=["InComplete", "incomplete", "INCOMPLETE", None])
        Collector(scope(), self.out, "fetch", client, clock=clock.read, sleep=clock.sleep).run()
        self.assertGreaterEqual(clock.now, 30)
        self.assertEqual(sum(len(r) for r in iter_pieces(self.out)), 1)

    def test_progress_normalize_only_folds_casing_not_unknown_values(self):
        # 归一只针对大小写与首尾空白；近似但未知的取值仍必须硬失败，不静默当续扫。
        client = FakeClient([], errors=["completed"])
        with self.assertRaisesRegex(ReportError, "UNKNOWN_QUERY_PROGRESS"):
            Collector(scope(), self.out, "fetch", client).run()

    def test_request_budget_visible_and_resume_partial(self):
        s = scope()
        s["budget"]["requests"] = 1
        with self.assertRaisesRegex(ReportError, "REQUESTS_BUDGET"):
            self.fetch([row("a", "success")], s)
        manifest = load_json(self.out / "fetch.checkpoints/manifest.json")
        self.assertFalse(manifest["complete"])
        self.assertEqual(len(manifest["pieces"]), 1)
        # 每次执行相同预算继续完成一个小时；完整性只在全部片完成后宣布。
        with self.assertRaises(ReportError):
            Collector(s, self.out, "fetch", FakeClient([])).run()
        Collector(s, self.out, "fetch", FakeClient([])).run()
        self.assertTrue(load_json(self.out / "fetch.checkpoints/manifest.json")["complete"])

    def test_bytes_budget_identical_on_first_run_and_resume(self):
        # 续跑不得比首跑更严：旧实现按片文件大小重计字节（含 status/fingerprint/sha256 包装），
        # 使接近上限的窗口被时间预算让出后永久超预算、断点无法推进。
        rows = [row("a", "success", 1), row("b", "fail", 3601)]
        _, first = self.fetch(rows)
        resumed = Collector(scope(), self.out, "fetch", FakeClient([])).run()
        self.assertTrue(resumed["complete"])
        self.assertEqual(resumed["usage"]["bytes"], first["usage"]["bytes"])
        self.assertEqual(resumed["usage"]["rows"], first["usage"]["rows"])

    def test_bytes_budget_counts_kept_projection_not_discarded_responses(self):
        # 字节预算等于落盘结果的 canonical 字节数：InComplete 重试与被丢弃的拆窗响应不计入。
        clock = Clock()
        client = FakeClient([row("a", "success")], errors=["InComplete", None])
        result = Collector(scope(), self.out, "fetch", client, clock=clock.read, sleep=clock.sleep).run()
        kept = sum(len(canonical(piece).encode("utf-8")) for piece in iter_pieces(self.out))
        self.assertEqual(result["usage"]["bytes"], kept)
        self.assertGreater(kept, 0)

    def test_bytes_budget_still_blocks_over_cap(self):
        # 上限仍然生效，不因口径统一而失去约束。
        s = scope()
        s["budget"]["bytes"] = 10
        with self.assertRaisesRegex(ReportError, "BYTES_BUDGET"):
            self.fetch([row("a", "success")], s)
        self.assertFalse(load_json(self.out / "fetch.checkpoints/manifest.json")["complete"])

    def test_scope_changes_never_reuse_checkpoints(self):
        self.fetch([])
        altered = scope()
        altered["env"] = "test"
        with self.assertRaisesRegex(ReportError, "SCOPE_CHANGED"):
            self.fetch([], altered)

    def test_checkpoint_corruption_and_stale_evidence_blocked(self):
        self.fetch([row("a", "success")])
        analyze(self.out)
        self.assertEqual(check(self.out)["status"], "READY_WITH_DECLARED_LIMITATIONS")
        manifest = load_json(self.out / "fetch.checkpoints/manifest.json")
        path = self.out / "fetch.checkpoints" / manifest["pieces"][0]["file"]
        value = load_json(path)
        value["rows"][0]["b_action_result"] = "fail"
        atomic_json(path, value)
        with self.assertRaisesRegex(ReportError, "CORRUPT_CHECKPOINT"):
            check(self.out)

    def test_dual_metrics_dedup_batch_and_no_top_event_id(self):
        rows = [row("a", "fail", 1), row("b", "fail", 2), row("c", "success", 3), row("d", "success", 4, "B"), row("e", "validate_fail", 5, "C", b_order_fids='["C","D"]', b_validate_fail_fields='["phone","plate_number"]'), row("f", "cancel", 6, "B")]
        duplicate = copy.deepcopy(rows[0])
        duplicate["client_ip"] = "192.0.2.2"
        duplicate["top_user_name"] = "变化快照"
        rows.append(duplicate)
        for r in rows:
            r["event_id"] = "platform-registration-constant"
        self.fetch(rows)
        analyze(self.out)
        q = load_json(self.out / "quality.json")
        e = load_json(self.out / "evidence.json")
        m = e["businessMetrics"]
        self.assertEqual(q["counts"]["duplicates"], 1)
        self.assertEqual(q["counts"]["conflicts"], 0)
        self.assertEqual(m["totalSubmissions"], 5)
        self.assertEqual(m["abnormal"], 3)
        self.assertEqual(m["abnormalRate"], 60)
        self.assertEqual(m["involvedDocuments"], 4)
        self.assertEqual(m["abnormalDocuments"], 3)
        self.assertEqual(m["documentAbnormalRate"], 75)
        a = e["actions"][0]
        self.assertEqual(a["docOutcomes"]["窗口内失败后成功"], 1)
        self.assertEqual(a["fields"]["phone"], 1)
        self.assertEqual(a["accounts"][0]["metrics"]["totalSubmissions"], 5)
        self.assertNotIn("192.0.2.1", json.dumps(e, ensure_ascii=False))
        check(self.out)

    def test_success_before_failure_not_recovery(self):
        self.fetch([row("a", "success", 1), row("b", "fail", 2)])
        analyze(self.out)
        outcome = load_json(self.out / "evidence.json")["actions"][0]["docOutcomes"]
        self.assertEqual(outcome, {"窗口内未见失败后成功": 1})

    def test_conflicting_payload_blocked(self):
        self.fetch([row("same", "fail", 1), row("same", "success", 1)])
        analyze(self.out)
        with self.assertRaisesRegex(ReportError, "conflicts"):
            check(self.out)

    def test_trace_sequence_zero_and_unkeyed_business(self):
        self.fetch([row("", "fail", 1, b_trace_id="trace", b_page_event_seq="0"), row("", "success", 2)])
        analyze(self.out)
        quality = load_json(self.out / "quality.json")
        self.assertEqual(quality["counts"]["unkeyedBusiness"], 1)
        with self.assertRaisesRegex(ReportError, "unkeyedBusiness"):
            check(self.out)

    def test_environment_rechecked_in_consumer(self):
        self.fetch([row("a", "fail", env="test"), row("b", "success")])
        analyze(self.out)
        self.assertEqual(load_json(self.out / "evidence.json")["businessMetrics"]["fail"], 0)
        with self.assertRaisesRegex(ReportError, "scopeMismatch"):
            check(self.out)

    def test_document_types_isolated_and_account_id_preferred(self):
        s = scope()
        s["nodeKeys"].append("purchase_order")
        self.fetch([row("a", "fail", 1), row("b", "success", 2, b_order_type="purchase_order"), row("c", "success", 3, user="u2")], s)
        analyze(self.out)
        evidence = load_json(self.out / "evidence.json")
        self.assertEqual(evidence["businessMetrics"]["involvedDocuments"], 2)
        self.assertEqual(evidence["businessMetrics"]["abnormalDocuments"], 1)
        db = sqlite3.connect(self.out / "evidence.sqlite")
        self.assertEqual(db.execute("select count(distinct account) from events").fetchone()[0], 2)
        db.close()

    def test_page_family_mismatch_is_declared_not_blocking(self):
        page = row("page", "success", 1, page_id="missing-page")
        page.update({"event_type": "PAGE_VIEW", "b_order_type": "delivery_note", "b_order_fid": "", "b_action_result": ""})
        self.fetch([row("a", "success"), page])
        analyze(self.out)
        quality = load_json(self.out / "quality.json")
        self.assertEqual(quality["counts"]["pageScopeMismatch"], 1)
        self.assertEqual(quality["blockers"], [])
        self.assertTrue(any("页面族" in item for item in quality["declaredLimitations"]))
        check(self.out)

    def test_low_unkeyed_business_is_declared_not_blocking(self):
        rows = [row(f"ok-{index}", "success", index + 1, fid=f"F{index}") for index in range(20)]
        rows.append(row("", "success", 30, fid="F20"))
        self.fetch(rows)
        analyze(self.out)
        quality = load_json(self.out / "quality.json")
        self.assertEqual(quality["counts"]["unkeyedBusiness"], 1)
        self.assertEqual(quality["blockers"], [])
        check(self.out)

    def test_node_key_allows_uppercase_but_event_code_does_not(self):
        raw = raw_scope()
        raw["nodeKeys"] = ["POS"]
        self.assertEqual(normalize_scope(raw, now=1800000000)["nodeKeys"], ["POS"])
        bad = raw_scope()
        bad["eventCodes"] = ["Query"]
        with self.assertRaisesRegex(ReportError, "INVALID_IDENTIFIER"):
            normalize_scope(bad, now=1800000000)

    def test_no_data_is_not_healthy_week(self):
        self.fetch([])
        analyze(self.out)
        with self.assertRaisesRegex(ReportError, "NO_BUSINESS_DATA"):
            check(self.out)

    def test_compute_fetch_analyze_check_end_to_end(self):
        rows = [row("a", "fail"), row("b", "success", 2), row("c", "success", 3, "B")]
        self.fetch(rows)
        analyze(self.out)
        self.assertEqual(check(self.out)["status"], "READY_WITH_DECLARED_LIMITATIONS")
        evidence = load_json(self.out / "evidence.json")
        kpi = load_json(self.out / "kpi.json")
        self.assertEqual(evidence["businessMetrics"]["documentAbnormalRate"], 50)
        self.assertEqual(kpi["summary"]["docKpis"][0]["docTotal"], 123)
        self.assertEqual(kpi["summary"]["eventCount"], 900)
        # 专项明细与核心 KPI 是两个分母，不得相等也不得互相覆盖。
        self.assertNotEqual(evidence["uniqueEvents"], kpi["summary"]["eventCount"])
        self.assertEqual(evidence["computeRunId"], kpi["computeRunId"])
        self.assertEqual(evidence["kpiProvenance"]["source"], "local-compute")
        self.assertEqual(evidence["kpiProvenance"]["analyzerDigest"], kpi["analyzerDigest"])
        self.assertEqual(check(self.out)["computeRunId"], kpi["computeRunId"])

    def test_full_day_window_keeps_evidence_digest_stable(self):
        # 回归：小时用整数键时，JSON 往返后变字符串键，数值序（6,20）与字典序（"20","6"）不同，
        # 导致 evidenceDigest 对不上、check 误报 STALE_OR_INCOMPLETE_ANALYSIS；小时窗因为序一致而暂露不出来。
        from report_collect import Collector
        from report_core import normalize_scope
        raw = raw_scope()
        raw.update({"from": "2026-09-21T00:00:00+08:00", "to": "2026-09-22T00:00:00+08:00"})
        s = normalize_scope(raw, now=1800000000)
        write_kpi(s, self.out)
        rows = [row("h06", "fail", 6 * 3600), row("h20", "fail", 20 * 3600), row("h23", "success", 23 * 3600)]
        Collector(s, self.out, "fetch", FakeClient(rows)).run()
        analyze(self.out)
        hours = load_json(self.out / "evidence.json")["actions"][0]["hours"]
        self.assertEqual(sorted(hours), ["06", "20"])
        self.assertEqual(check(self.out)["status"], "READY_WITH_DECLARED_LIMITATIONS")

    def test_step_narrow_excludes_same_code_from_other_step(self):
        raw = raw_scope()
        raw["step"] = {"code": "appoint", "name": "预约发货"}
        raw["eventCodes"] = ["goods_clear"]
        raw["events"] = [{"code": "goods_clear", "name": "清空商品", "type": "click", "step": "handle"}, {"code": "goods_clear", "name": "清空预约商品", "type": "click", "step": "appoint"}]
        s = normalize_scope(raw, now=1800000000)
        write_kpi(s, self.out)
        rows = [row("appoint", "success", 1, b_event_code="goods_clear", b_chain_step="appoint"), row("handle", "fail", 2, b_event_code="goods_clear", b_chain_step="handle")]
        Collector(s, self.out, "fetch", FakeClient(rows)).run()
        analyze(self.out)
        evidence = load_json(self.out / "evidence.json")
        self.assertEqual([a["actionKey"] for a in evidence["actions"]], [canonical(["delivery_note", "goods_clear"])])
        self.assertEqual(evidence["businessMetrics"]["success"], 1)
        self.assertEqual(load_json(self.out / "quality.json")["counts"]["scopeMismatch"], 1)
        with self.assertRaisesRegex(ReportError, "scopeMismatch"):
            check(self.out)

    def test_non_string_json_keys_are_rejected_before_write(self):
        from report_core import assert_string_keys
        with self.assertRaisesRegex(ReportError, "NON_STRING_JSON_KEY"):
            assert_string_keys({"hours": {6: 1}})
        with self.assertRaisesRegex(ReportError, "NON_STRING_JSON_KEY"):
            assert_string_keys({"actions": [{"days": {"2026-09-21": [(1, 2)]}, "nested": {"ok": True}}], 7: "x"})
        assert_string_keys({"hours": {"06": 1}, "actions": [{"days": {"2026-09-21": [[1, 2]]}}]})

    def test_unknown_result_withholds_rates(self):
        self.fetch([row("a", "fail"), row("b", "", 2)])
        analyze(self.out)
        metrics = load_json(self.out / "evidence.json")["businessMetrics"]
        self.assertEqual(metrics["unknown"], 1)
        self.assertIsNone(metrics["failRate"])
        self.assertEqual(metrics["resultCoveragePct"], 50)

    def test_business_page_boundary_enforced(self):
        raw = raw_scope()
        raw["businessPageIds"] = ["sample-page"]
        s = normalize_scope(raw, now=1800000000)
        self.assertIn("json_extract_scalar(page, '$.id') in ('sample-page')", build_query(s, s["start"], s["end"]))
        self.fetch([row("a", "fail", page_id="other-page"), row("b", "success", 2)], s)
        analyze(self.out)
        with self.assertRaisesRegex(ReportError, "scopeMismatch"):
            check(self.out)

    def test_dictionary_never_persists_sensitive_common(self):
        common = {"llm": {"apiKey": "do-not-save"}, "sls": {"topic": "t"}, "apps": [{"name": "xlb-scm-web", "platform": "pc", "label": "SCM", "secret": "do-not-save"}]}
        nodes = [{"nodeKey": "delivery_note", "platforms": {"pc": {"pages": [{"pageCode": "deliveryNote", "eventVer": "1.0.0", "events": [{"code": "confirm", "step": "appoint", "remark": "do-not-save"}], "extraEvents": []}]}}}]
        data = sanitize_config(common, nodes)
        self.assertNotIn("do-not-save", json.dumps(data))
        self.assertEqual(data["apps"], [{"name": "xlb-scm-web", "platform": "pc", "label": "SCM"}])
        self.assertEqual(data["nodes"][0]["pages"][0]["events"][0]["step"], "appoint")

    def test_ip_is_only_masked_source_not_people(self):
        self.assertEqual(mask_ip("192.0.2.10"), "192.0.2.*")
        self.assertEqual(mask_ip("2001:db8::1"), "2001:db8::/64")
        self.fetch([row("a", "fail"), row("b", "success", 2, client_ip="192.0.2.2")])
        analyze(self.out)
        e = load_json(self.out / "evidence.json")
        self.assertEqual(e["actions"][0]["accounts"][0]["ipCount"], 2)
        self.assertNotIn("peopleCount", json.dumps(e))

    def test_skill_links_and_progressive_structure(self):
        root = Path(__file__).resolve().parents[1]
        content = (root / "SKILL.md").read_text()
        self.assertLess(len(content.splitlines()), 500)
        self.assertIn("name: auto-generate-point-report", content)
        for link in re.findall(r"\]\(([^)]+)\)", content):
            self.assertTrue((root / link).is_file(), link)
        self.assertNotIn("/Users/", "".join(p.read_text() for p in (root / "scripts").glob("*.py")))


class AdapterTests(unittest.TestCase):
    @unittest.skipUnless(importlib.util.find_spec("aliyun"), "仅 SDK 适配器测试需要安装 requirements；其余测试标准库即可")
    def test_official_sdk_contract_no_network(self):
        from aliyun.log import GetLogsResponse
        environment = {"SLS_ENDPOINT": "cn-hangzhou.log.aliyuncs.com", "SLS_ACCESS_KEY_ID": "fixture-id", "SLS_ACCESS_KEY_SECRET": "fixture"}
        with patch.dict("os.environ", environment, clear=True):
            client = SlsClient(scope())
        response = GetLogsResponse({"meta": {"progress": "Complete", "count": 1}, "data": [{"b_event_id": "a", "timestamp": "1789920001000"}]}, {})
        with patch.object(client.client, "get_logs", return_value=response) as query:
            result = client.query(scope()["start"], scope()["end"], "* | select count(*) from log", 10)
        self.assertEqual(result["progress"], "Complete")
        self.assertEqual(result["rows"][0]["b_event_id"], "a")
        request = query.call_args[0][0]
        self.assertEqual(request.get_offset(), 0)
        self.assertEqual(request.get_from(), 1789920000)
        self.assertEqual(client.client.timeout, 10)


if __name__ == "__main__":
    unittest.main()
