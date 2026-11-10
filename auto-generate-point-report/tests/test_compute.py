"""本地核心指标计算（compute）编排与 kpi.json 校验测试，全离线：node 子进程一律用替身。"""
import io
import json
import tempfile
import unittest
from contextlib import redirect_stdout
from pathlib import Path
from unittest.mock import patch

from test_report import Clock, FakeClient, kpi_fixture, raw_scope, row, scope, write_kpi
from test_config import dictionary
from report_analyze import analyze, check
from report_collect import Collector
from report_core import ReportError, atomic_json, digest, load_json, normalize_scope
from report_compute import RESUME_EXIT, compute_command, heap_mb, run_compute, validate_kpi


def prepared(scope_value, out, kpi=None):
    """准备 compute 所需输入：范围快照、字典，以及可选的已完成 kpi.json。"""
    atomic_json(Path(out) / "dictionary.json", dictionary())
    if kpi is not None:
        write_kpi(scope_value, out, kpi)  # 同时写出范围快照、产物与同级摘要
    return scope_value


class ComputeCommandTests(unittest.TestCase):
    def test_command_preloads_quota_stub_before_analyzer(self):
        s = scope()
        command = compute_command(Path("/fixture"), Path("/out/dictionary.json"), Path("/out/scope.snapshot.json"), Path("/out"), heap_mb(s))
        text = " ".join(str(part) for part in command)
        self.assertIn("scripts/tracking-report-compute.ts", text)
        self.assertIn("./scripts/quota-stub.ts", text)
        # 配额桩必须早于分析器脚本加载，否则会去抢数据库共享租约。
        self.assertLess(text.index("quota-stub.ts"), text.index("tracking-report-compute.ts"))
        self.assertIn("--max-old-space-size=", text)
        self.assertIn("--memory-mb", text)

    def test_heap_scales_with_window_and_is_capped(self):
        base = scope()
        self.assertEqual(heap_mb(base), 4096)  # 3 小时窗
        long_window = dict(base, end=base["start"] + 72 * 3600)
        self.assertEqual(heap_mb(long_window), 16384)
        huge = dict(base, end=base["start"] + 31 * 86400)
        self.assertEqual(heap_mb(huge), 16384)  # 封顶，不无界申请


class RunComputeTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.out = Path(self.tmp.name)
        self.scope = scope()

    def tearDown(self):
        self.tmp.cleanup()

    def test_finished_kpi_is_reused_offline_without_spawning_node(self):
        prepared(self.scope, self.out, kpi_fixture(self.scope))
        calls = []

        def runner(command, project, timeout):
            calls.append(command)
            return 0, ""

        result = run_compute(self.scope, self.out, project=Path("/fixture"), runner=runner)
        self.assertEqual(calls, [])
        self.assertTrue(result["complete"])
        self.assertEqual(result["computeRunId"], "compute-fixture")

    def test_changed_scope_refuses_to_reuse_previous_kpi(self):
        prepared(self.scope, self.out, kpi_fixture(self.scope))
        other = normalize_scope({**raw_scope(), "to": "2026-09-21T04:00:00+08:00"}, now=1800000000)
        # 范围快照先拦住：换窗口必须换新目录，不允许在同一目录里改口。
        with self.assertRaisesRegex(ReportError, "SCOPE_CHANGED_USE_NEW_DIRECTORY"):
            run_compute(other, self.out, project=Path("/fixture"), runner=lambda *a: self.fail("不应启动 node"))
        # 快照一致但产物来自别的范围：由 kpi 指纹拦住，同样不启动 node。
        (self.out / "scope.snapshot.json").unlink()
        write_kpi(self.scope, self.out, kpi_fixture(other))
        with self.assertRaisesRegex(ReportError, "KPI_SCOPE_CHANGED_USE_NEW_DIRECTORY"):
            run_compute(self.scope, self.out, project=Path("/fixture"), runner=lambda *a: self.fail("不应启动 node"))

    def test_resume_exit_code_keeps_same_run_until_success(self):
        prepared(self.scope, self.out)
        attempts = []

        def runner(command, project, timeout):
            attempts.append(timeout)
            if len(attempts) < 3:
                return RESUME_EXIT, ""
            write_kpi(self.scope, self.out)  # 子进程成功时会同时写出产物与同级摘要
            return 0, json.dumps({"ok": True, "data": {"computeRunId": "compute-fixture", "events": 900}})

        result = run_compute(self.scope, self.out, project=Path("/fixture"), runner=runner)
        self.assertEqual(len(attempts), 3)
        self.assertEqual(result["invocations"], 3)
        self.assertEqual(result["computeSummary"]["events"], 900)
        self.assertTrue(result["complete"])

    def test_failure_exit_is_visible_with_detail(self):
        prepared(self.scope, self.out)
        with self.assertRaisesRegex(ReportError, "COMPUTE_FAILED") as raised:
            run_compute(self.scope, self.out, project=Path("/fixture"), runner=lambda *a: (1, '{"ok":false,"error":"EVENT_ID_CONFLICT"}'))
        self.assertIn("EVENT_ID_CONFLICT", str(raised.exception.details))

    def test_budget_exhaustion_asks_for_resume_not_silent_success(self):
        prepared(self.scope, self.out)
        clock = Clock()
        calls = []

        def runner(command, project, timeout):
            calls.append(timeout)
            clock.sleep(3600)  # 每次调用都耗尽预算
            return RESUME_EXIT, ""

        with patch("report_compute.time.monotonic", clock.read):
            with self.assertRaisesRegex(ReportError, "COMPUTE_BUDGET_RESUME_SAME_RUN"):
                run_compute(self.scope, self.out, project=Path("/fixture"), runner=runner)
        self.assertEqual(len(calls), 1)
        self.assertFalse((self.out / "kpi.json").exists())

    def test_missing_project_or_inputs_are_explicit(self):
        prepared(self.scope, self.out)
        # 不依赖测试进程的 cwd：显式把仓库定位桩成空，才能验证「找不到看板仓库」这条路径。
        with patch("report_compute.board_project", return_value=None):
            with self.assertRaisesRegex(ReportError, "LOCAL_BOARD_PROJECT_NOT_AVAILABLE"):
                run_compute(self.scope, self.out, project=None, runner=lambda *a: self.fail("不应启动 node"))
        with tempfile.TemporaryDirectory() as empty:
            with self.assertRaisesRegex(ReportError, "COMPUTE_INPUT_MISSING"):
                run_compute(self.scope, empty, project=Path("/fixture"), runner=lambda *a: self.fail("不应启动 node"))

    def test_dry_run_prints_command_without_touching_network(self):
        from point_report import main
        with tempfile.TemporaryDirectory() as folder:
            spath = Path(folder) / "scope.json"
            atomic_json(spath, {k: v for k, v in self.scope.items() if k not in ("schemaVersion", "start", "end")})
            with patch("point_report.board_project", return_value=Path("/fixture")), redirect_stdout(io.StringIO()) as stdout:
                self.assertEqual(main(["compute", "--scope", str(spath), "--out", folder, "--dry-run"]), 0)
            result = json.loads(stdout.getvalue())["data"]
            self.assertFalse(result["networkCalled"])
            self.assertIsNone(result["query"])
            self.assertIn("scripts/tracking-report-compute.ts", " ".join(result["command"]))


class KpiValidationTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.out = Path(self.tmp.name)
        self.scope = scope()

    def tearDown(self):
        self.tmp.cleanup()

    def validate(self, kpi, scope_value=None):
        write_kpi(scope_value or self.scope, self.out, kpi)
        return validate_kpi(self.out, scope_value or self.scope)

    def test_missing_result_is_not_treated_as_zero(self):
        with self.assertRaisesRegex(ReportError, "KPI_RESULT_REQUIRED_RUN_COMPUTE_FIRST"):
            validate_kpi(self.out, self.scope)

    def test_board_shaped_or_paginated_result_is_rejected(self):
        with self.assertRaisesRegex(ReportError, "INVALID_KPI_VIEW"):
            self.validate(kpi_fixture(self.scope, source="board-query"))
        with self.assertRaisesRegex(ReportError, "KPI_PAGINATED_INCOMPLETE"):
            self.validate(kpi_fixture(self.scope, summary={**kpi_fixture(self.scope)["summary"], "dimensions": {"docKpis": {"total": 40, "shown": 20}}}))
        with self.assertRaisesRegex(ReportError, "KPI_PAGINATED_INCOMPLETE"):
            self.validate(kpi_fixture(self.scope, summary={**kpi_fixture(self.scope)["summary"], "displayPage": {"parts": 3, "bytes": 999}}))
        truncated = kpi_fixture(self.scope)
        truncated["summary"]["docKpis"][0]["edgePage"] = {"total": 23, "shown": 6}
        with self.assertRaisesRegex(ReportError, "KPI_PAGINATED_INCOMPLETE"):
            self.validate(truncated)

    def test_scope_and_target_mismatch_are_rejected(self):
        shifted = kpi_fixture(self.scope)
        shifted["scope"]["to"] += 1000
        with self.assertRaisesRegex(ReportError, "KPI_SCOPE_MISMATCH"):
            self.validate(shifted)
        other = kpi_fixture(self.scope)
        other["scope"]["orderTypes"] = ["purchase_order"]
        with self.assertRaisesRegex(ReportError, "KPI_TARGET_MISMATCH"):
            self.validate(other)
        compared = kpi_fixture(self.scope)
        compared["scope"]["compare"] = {"from": 1, "to": 2}
        with self.assertRaisesRegex(ReportError, "UNEXPECTED_KPI_SCOPE"):
            self.validate(compared)

    def test_multi_source_and_legacy_scope_mismatch_are_rejected(self):
        legacy = kpi_fixture(self.scope)
        legacy["scope"].pop("topics")
        with self.assertRaisesRegex(ReportError, "KPI_SCOPE_MISMATCH"):
            self.validate(legacy)
        self.out = self.out / "multi"
        raw = raw_scope()
        raw["appNames"] = ["sample-web", "sample-rn"]
        raw["sls"]["topics"] = ["sample", "sample-rn-topic"]
        multi = normalize_scope(raw, now=1800000000)
        for field, value in (("apps", None), ("topics", ["sample"])):
            fixture = kpi_fixture(multi)
            if value is None:
                fixture["scope"].pop(field)
            else:
                fixture["scope"][field] = value
            with self.subTest(field=field), self.assertRaisesRegex(ReportError, "KPI_SCOPE_MISMATCH"):
                self.validate(fixture, multi)

    def test_coverage_gap_or_undeclared_components_block(self):
        gapped = kpi_fixture(self.scope)
        gapped["quality"]["coverage"] = [{"from": self.scope["start"] * 1000, "to": self.scope["start"] * 1000 + 3600_000, "complete": True}]
        with self.assertRaisesRegex(ReportError, "KPI_COVERAGE_INCOMPLETE"):
            self.validate(gapped)
        undeclared = kpi_fixture(self.scope)
        undeclared["quality"]["componentStatus"]["pageStats"] = "loading"
        with self.assertRaisesRegex(ReportError, "KPI_COMPONENT_STATUS_UNDECLARED"):
            self.validate(undeclared)
        incomplete = kpi_fixture(self.scope)
        incomplete["quality"]["complete"] = False
        with self.assertRaisesRegex(ReportError, "KPI_BUSINESS_INCOMPLETE"):
            self.validate(incomplete)

    def test_config_drift_and_tampering_are_visible(self):
        drifted = kpi_fixture(self.scope, configFingerprint="another-config")
        with self.assertRaisesRegex(ReportError, "CONFIG_CHANGED_REDISCOVER"):
            self.validate(drifted)
        profile = kpi_fixture(self.scope)
        profile["summary"]["config"]["chains"][0]["fulfillCodes"] = ["something_else"]
        with self.assertRaisesRegex(ReportError, "CONFIG_CHANGED_REDISCOVER"):
            self.validate(profile)
        # 篡改产物但不刷新同级摘要：字节摘要对不上即判陈旧，不进入语义判定。
        tampered = kpi_fixture(self.scope)
        tampered["summary"]["docKpis"][0]["docTotal"] = 999
        atomic_json(self.out / "kpi.json", tampered)
        with self.assertRaisesRegex(ReportError, "STALE_OR_INCOMPLETE_KPI_RESULT"):
            validate_kpi(self.out, self.scope)

    def test_missing_dimension_is_not_zero_filled(self):
        broken = kpi_fixture(self.scope)
        broken["summary"]["docTypeStats"] = None
        with self.assertRaisesRegex(ReportError, "KPI_DIMENSION_MISSING"):
            self.validate(broken)
        broken2 = kpi_fixture(self.scope)
        broken2["summary"]["bottlenecks"].pop("failByEvent")
        with self.assertRaisesRegex(ReportError, "KPI_DIMENSION_MISSING"):
            self.validate(broken2)

    def test_single_fid_scope_uses_compound_key(self):
        s = normalize_scope({**raw_scope(), "orderFids": ["F1"]}, now=1800000000)
        write_kpi(s, self.out)
        kpi = load_json(self.out / "kpi.json")
        self.assertEqual(kpi["scope"]["orderFids"], ["delivery_note:F1"])
        self.assertEqual(validate_kpi(self.out, s)["complete"], True)

    def test_analyze_check_reject_kpi_swapped_after_analysis(self):
        s = self.scope
        write_kpi(s, self.out)
        Collector(s, self.out, "fetch", FakeClient([row("a", "fail"), row("b", "success", 2)])).run()
        analyze(self.out)
        self.assertEqual(check(self.out)["analyzerVersion"], "tracking-fixture")
        # 只改产物不刷新同级摘要：直接被当作陈旧结果，不进入后续判定。
        atomic_json(self.out / "kpi.json", kpi_fixture(s, summary={**kpi_fixture(s)["summary"], "eventCount": 1}))
        with self.assertRaisesRegex(ReportError, "STALE_OR_INCOMPLETE_KPI_RESULT"):
            check(self.out)
        # 完整重算（产物与摘要同步）但分析未重跑：必须要求重新 analyze，不混用旧证据。
        swapped = kpi_fixture(s)
        swapped["summary"]["docKpis"][0]["docTotal"] = 456
        write_kpi(s, self.out, swapped)
        with self.assertRaisesRegex(ReportError, "KPI_CHANGED_REANALYZE"):
            check(self.out)


class KpiSemanticsTests(unittest.TestCase):
    """从原看板客户端测试迁移的行为约束：范围映射、回退口径、告警透传。"""

    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.out = Path(self.tmp.name)
        self.scope = scope()

    def tearDown(self):
        self.tmp.cleanup()

    def test_window_is_millisecond_half_open_and_has_no_compare(self):
        from report_core import expected_compute_scope
        body = expected_compute_scope(self.scope)
        self.assertEqual(body["from"], self.scope["start"] * 1000)
        self.assertEqual(body["to"], self.scope["end"] * 1000)  # 排他端点，不含结束毫秒
        self.assertEqual(body["store"], "sls")
        self.assertEqual(body["topics"], [self.scope["sls"]["topic"]])
        self.assertNotIn("compareFrom", body)
        self.assertNotIn("compareTo", body)
        self.assertNotIn("chain", body)
        with self.assertRaisesRegex(ReportError, "COMPUTE_SAMPLE_REQUIRES_FID_NOT_ORDER_NUMBER"):
            expected_compute_scope(normalize_scope({**raw_scope(), "orderNos": ["DN001"]}, now=1800000000))

    def test_config_fallback_regression_profile_is_used(self):
        s = dict(self.scope, eventCodes=[], nodeConfig={**self.scope["nodeConfig"], "regressiveCodes": None})
        fixture = kpi_fixture(s)
        fixture["summary"]["config"]["chains"][0]["regressiveCodes"] = ["server_default_revoke"]
        write_kpi(s, self.out, fixture)
        Collector(s, self.out, "fetch", FakeClient([row("a", "success", b_event_code="server_default_revoke")])).run()
        analyze(self.out)
        # 回退码来自同一份冻结配置，不在 Python 重写一套默认值。
        self.assertEqual(load_json(self.out / "evidence.json")["successfulRegressionCount"], 1)
        check(self.out)

    def test_successful_regression_uses_node_codes_not_failure_result(self):
        s = dict(self.scope, eventCodes=[])
        write_kpi(s, self.out)
        rows = [row("a", "success", b_event_code="revoke"), row("b", "fail", 2, b_event_code="revoke"), row("c", "success", 3)]
        Collector(s, self.out, "fetch", FakeClient(rows)).run()
        analyze(self.out)
        self.assertEqual(load_json(self.out / "evidence.json")["successfulRegressionCount"], 1)
        check(self.out)

    def test_step_and_provenance_limits_reach_report_warnings(self):
        s = dict(self.scope, step={"code": "appoint", "name": "预约发货"})
        fixture = kpi_fixture(s, warnings=["核心指标为整节点口径；范围里的环节（预约发货）只约束 SLS 专项明细，两者分母不可混用",
                                           "本地计算复用看板分析器，未经看板服务与数据库；未验证实时上报完整性"])
        write_kpi(s, self.out, fixture)
        Collector(s, self.out, "fetch", FakeClient([row("a", "success")])).run()
        analyze(self.out)
        joined = "".join(check(self.out)["warnings"])
        self.assertIn("整节点", joined)
        self.assertIn("未验证实时上报完整性", joined)


if __name__ == "__main__":
    unittest.main()
