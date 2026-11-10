"""配置字典获取与范围生成行为测试，全离线：不触网、不触库、不启动任何服务。"""
import io
import json
import os
import tempfile
import unittest
from datetime import datetime
from pathlib import Path
from unittest.mock import patch
from urllib.error import HTTPError, URLError
from zoneinfo import ZoneInfo

from test_report import raw_scope
from report_core import DEFAULT_BOARD_URL, ReportError, atomic_json, build_query, build_scope, load_json, normalize_scope, sanitize_config
from report_config import API_PREFIX, LOCAL_CONFIG_SOURCE, BoardClient, BoardHttpError, board_url, discover, local_config_payload, read_apps, resolve_config


def dictionary():
    common = {"sls": {"topic": "sample", "project": "sample-project", "logstore": "sample-store"}, "apps": [{"name": "xlb-scm-web", "platform": "pc", "label": "SCM"}, {"name": "xlb-fsms-web", "platform": "pc", "label": "FSMS"}], "bizFields": raw_scope()["fields"] + ["phone", "api_response"], "chainSteps": [{"code": "enter", "name": "进入"}, {"code": "appoint", "name": "预约发货"}], "defaultProfile": {"regressiveCodes": ["revoke"], "fulfillCodes": ["confirm"], "closeCodes": [], "intentSteps": ["appoint"]}}
    nodes = [{"nodeKey": "delivery_note", "name": "发货单", "category": "SCM", "tracked": True, "pageId": "sample-page", "stepOrder": ["enter", "appoint"], "stepNames": {"enter": "进入", "appoint": "预约发货"}, "stateNames": {"INIT": "制单"}, "platforms": {"pc": {"pages": [{"pageCode": "deliveryNote", "pageName": "发货单", "eventVer": "1.0.0", "pageId": "sample-page", "events": [{"code": "view", "name": "进入发货单", "type": "view", "step": "enter"}, {"code": "confirm", "name": "预约确认", "type": "click", "step": "appoint", "terminal": True, "terminalKind": "fulfill"}, {"code": "revoke", "name": "撤销预约", "type": "click", "step": "appoint", "regressive": True}], "extraEvents": []}]}}}]
    result = sanitize_config(common, nodes)
    result["boardUrl"] = "https://board.example.com"
    result["configSource"] = {"kind": "online-http", "selected": "https://board.example.com", "fallback": False, "reason": "online"}
    # 范围生成要求来源已按 nodeKey 发现；CLI 的 scope 一律先写入该标记。
    result["appsSource"] = "observed-node-metadata"
    return result


def make_scope(d=None, node="发货单", step=None, app="SCM"):
    now = int(datetime(2026, 10, 22, 12, tzinfo=ZoneInfo("Asia/Shanghai")).timestamp())
    raw = build_scope(d or dictionary(), app, node, "近7天", "prod", step=step, now=now)
    return normalize_scope(raw, now=now)


class FakeConfigClient:
    """只读配置客户端替身：记录路径，返回固定 ping/config/apps 载荷。"""

    def __init__(self, url=DEFAULT_BOARD_URL, payload=None, error=None, **kwargs):
        self.url = url
        self.paths = []
        self.payload = payload if payload is not None else {"common": {"sls": {"topic": "sample"}}, "nodes": [{"nodeKey": "delivery_note", "name": "发货单", "tracked": True}]}
        self.error = error

    def get(self, path):
        self.paths.append(path)
        if self.error:
            raise self.error
        if path.endswith("/ping"):
            return {"api": "point-report", "version": 1, "capabilities": ["config", "apps"]}
        if "/apps" in path:
            return [{"name": "xlb-scm-web", "platform": "pc", "label": "SCM"}]
        return self.payload


def dump_runner(payload):
    """本地配置导出替身：记录命令，返回固定 stdout。"""
    calls = []

    def runner(command, cwd=None, capture_output=None, text=None, timeout=None):
        calls.append({"command": command, "cwd": str(cwd), "timeout": timeout})
        return type("Done", (), {"returncode": 0, "stdout": json.dumps(payload), "stderr": ""})()

    runner.calls = calls
    return runner


class ScopeFromConfigTests(unittest.TestCase):
    def test_entire_node_and_step_codes_come_from_config(self):
        s = make_scope()
        self.assertEqual(s["nodeKeys"], ["delivery_note"])
        # appName 只是确定性主来源展示，完整取数范围看 appNames。
        self.assertEqual(s["appNames"], ["xlb-fsms-web", "xlb-scm-web"])
        self.assertEqual(s["appName"], "xlb-fsms-web")
        self.assertEqual(s["eventCodes"], [])  # 整节点不漏字典之外的事实。
        self.assertEqual(s["pageIds"], ["sample-page"])
        self.assertNotIn("api_response", s["fields"])
        self.assertEqual(s["nodeConfig"]["regressiveCodes"], ["revoke"])
        narrow = make_scope(node="发货单-预约发货")
        self.assertEqual(narrow["step"], {"code": "appoint", "name": "预约发货"})
        self.assertEqual(narrow["eventCodes"], ["confirm", "revoke"])

    def test_state_names_reach_dictionary_for_local_compute(self):
        # 本地计算要还原展示配置，stateNames 必须随字典落盘，否则与看板配置出现漂移。
        self.assertEqual(dictionary()["nodes"][0]["stateNames"], {"INIT": "制单"})

    def test_no_synthetic_page_or_subapp_invention(self):
        with self.assertRaisesRegex(ReportError, "NODE_NOT_UNIQUE"):
            make_scope(node="发货单预约页面")
        d = dictionary()
        d["nodes"][0]["category"] = "其他业务分类"
        # 子应用只能取配置里实际存在的分组，不把 SCM 编造成分组或应用映射。
        with self.assertRaises(ReportError) as raised:
            make_scope(d)
        self.assertEqual(str(raised.exception), "SUBAPP_NOT_UNIQUE")
        self.assertEqual(raised.exception.details, [{"subApp": "其他业务分类", "nodes": 1}])
        self.assertEqual(make_scope(d, app="其他业务分类")["nodeKeys"], ["delivery_note"])
        with self.assertRaisesRegex(ReportError, "STEP_NOT_UNIQUE"):
            make_scope(step="没有这个环节")

    def test_explicit_empty_profile_does_not_fallback(self):
        d = dictionary()
        d["nodes"][0]["regressiveCodes"] = []
        s = make_scope(d)
        self.assertEqual(s["nodeConfig"]["regressiveCodes"], [])
        self.assertFalse(next(e for e in s["events"] if e["code"] == "revoke")["regressive"])

    def test_untracked_or_eventless_node_is_rejected(self):
        d = dictionary()
        d["nodes"][0]["tracked"] = False
        with self.assertRaisesRegex(ReportError, "NO_NODES_FOR_SUBAPP|NO_TRACKED_NODES_IN_CONFIG"):
            make_scope(d)
        d = dictionary()
        for page in d["nodes"][0]["pages"]:
            page["events"] = []
        with self.assertRaisesRegex(ReportError, "NO_NODES_FOR_SUBAPP|NO_TRACKED_NODES_IN_CONFIG"):
            make_scope(d)

    def test_rn_only_node_stays_selectable_for_its_subapp(self):
        # 节点按子应用分组选择，不再按应用平台收窄；纯 RN 节点同样可分析。
        d = dictionary()
        d["nodes"][0]["pages"][0]["platform"] = "rn"
        s = make_scope(d)
        self.assertEqual(s["nodeKeys"], ["delivery_note"])
        self.assertEqual(s["nodeConfig"]["category"], "SCM")

    def test_subapp_candidates_come_from_node_groups(self):
        from report_core import list_nodes, list_subapps
        d = dictionary()
        extra = json.loads(json.dumps(d["nodes"][0]))
        extra.update({"nodeKey": "quality_report", "name": "商品自检自查", "category": "FSMS"})
        extra["pages"] = [dict(extra["pages"][0], platform="rn")]
        d["nodes"].append(extra)
        self.assertEqual(list_subapps(d), [{"subApp": "FSMS", "nodes": 1}, {"subApp": "SCM", "nodes": 1}])
        nodes = list_nodes(d, "FSMS")
        self.assertEqual([n["nodeKey"] for n in nodes], ["quality_report"])
        self.assertEqual(nodes[0]["platforms"], ["rn"])
        self.assertEqual(nodes[0]["pages"][0]["events"], 3)
        # 子应用只圈定分组，不落到其他分组的同名节点。
        with self.assertRaisesRegex(ReportError, "NODE_NOT_UNIQUE"):
            make_scope(d, node="商品自检自查")
        with self.assertRaisesRegex(ReportError, "SUBAPP_NOT_UNIQUE"):
            build_scope(d, "不存在的子应用", "发货单", "今天", "prod")

    def test_ambiguous_subapp_has_visible_candidates(self):
        d = dictionary()
        extra = json.loads(json.dumps(d["nodes"][0]))
        extra.update({"nodeKey": "purchase_order", "name": "SCM采购订单", "category": "SCM供应链"})
        d["nodes"].append(extra)
        # 模糊输入「SC」命中两个分组，候选必须可见，不默认取第一个；字面相等仍优先生效。
        with self.assertRaises(ReportError) as raised:
            make_scope(d, app="SC")
        self.assertEqual(str(raised.exception), "SUBAPP_NOT_UNIQUE")
        self.assertEqual([x["subApp"] for x in raised.exception.details], ["SCM", "SCM供应链"])
        self.assertEqual(make_scope(d)["nodeKeys"], ["delivery_note"])
        self.assertEqual(make_scope(d, app="SCM供应链", node="purchase_order")["nodeKeys"], ["purchase_order"])

    def test_node_sources_must_be_node_scoped(self):
        d = dictionary()
        d.pop("appsSource")
        # 配置没有应用↔节点外键，整份应用清单不能当节点来源，必须显式失败而不是猜一个。
        with self.assertRaisesRegex(ReportError, "APP_SOURCES_NOT_NODE_SCOPED"):
            make_scope(d)
        d = dictionary()
        d["apps"] = []
        with self.assertRaisesRegex(ReportError, "NO_APPS_IN_CONFIG"):
            make_scope(d)

    def test_observed_node_sources_cover_all_apps_topics_and_platforms(self):
        d = dictionary()
        d["appsSource"] = "observed-node-metadata"
        d["apps"] = [
            {"name": "fsms_web", "platform": "pc", "topic": "xlb-fsms-web"},
            {"name": "新零帮", "platform": "rn", "topic": "xlb-fsms-web"},
            {"name": "fsms_web", "platform": "pc", "topic": "xlb-scm-web"},
        ]
        rn_page = dict(d["nodes"][0]["pages"][0])
        rn_page["platform"] = "rn"
        d["nodes"][0]["pages"].append(rn_page)
        raw = build_scope(d, "SCM", "发货单", "2026-10-20 至 2026-10-21", "prod")
        s = normalize_scope(raw)
        self.assertEqual(s["appNames"], ["fsms_web", "新零帮"])
        self.assertEqual(s["sls"]["topics"], ["xlb-fsms-web", "xlb-scm-web"])
        sql = build_query(s, s["start"], s["end"])
        self.assertIn("json_extract_scalar(app, '$.name') in ('fsms_web','新零帮')", sql)
        self.assertIn("__topic__ in ('xlb-fsms-web','xlb-scm-web')", sql)

    def test_same_event_code_across_pages_with_different_steps_is_allowed(self):
        d = dictionary()
        second = json.loads(json.dumps(d["nodes"][0]["pages"][0]))
        second.update({"pageCode": "deliveryNoteAppoint", "pageName": "发货预约"})
        second["events"] = [{"code": "goods_clear", "name": "发货单-清空预约商品", "type": "click", "step": "appoint"}]
        d["nodes"][0]["pages"].append(second)
        d["nodes"][0]["pages"][0]["events"].append({"code": "goods_clear", "name": "发货单-清空商品", "type": "click", "step": "handle"})
        s = make_scope(d)
        self.assertEqual(s["eventCodes"], [])
        self.assertEqual([e["code"] for e in s["events"] if e["code"] == "goods_clear"], ["goods_clear", "goods_clear"])
        narrow = make_scope(d, node="发货单-预约发货")
        self.assertIn("goods_clear", narrow["eventCodes"])
        sql = build_query(narrow, narrow["start"], narrow["end"])
        self.assertIn("json_extract_scalar(biz, '$.chain_step') = 'appoint'", sql)
        self.assertIn("'confirm'", sql)
        same_page = json.loads(json.dumps(d))
        same_page["nodes"][0]["pages"][0]["events"].append({"code": "goods_clear", "name": "同页冲突", "type": "click", "step": "browse"})
        with self.assertRaisesRegex(ReportError, "AMBIGUOUS_EVENT_STEP"):
            make_scope(same_page)

    def test_preflight_observed_page_id_overrides_config(self):
        d = dictionary()
        raw = build_scope(d, "SCM", "发货单", "近7天", "prod", now=1800000000,
                          page_id_overrides={"deliveryNote": "observed_page_id"})
        s = normalize_scope(raw, now=1800000000)
        self.assertIn("observed_page_id", s["pageIds"])

    def test_disabled_required_field_is_not_silently_added(self):
        d = dictionary()
        d["bizFields"].remove("event_id")
        with self.assertRaisesRegex(ReportError, "REQUIRED_ANALYSIS_FIELDS_DISABLED"):
            make_scope(d)

    def test_today_three_days_seven_days_and_custom_boundary(self):
        d = dictionary()
        tz = ZoneInfo("Asia/Shanghai")
        now = int(datetime(2026, 10, 22, 12, 30, tzinfo=tz).timestamp())
        for preset, day in (("今天", 22), ("近三天", 20), ("近 7 天", 16)):
            raw = build_scope(d, "SCM", "发货单", preset, "stage", now=now)
            s = normalize_scope(raw, now=now)
            self.assertEqual(s["start"], int(datetime(2026, 10, day, tzinfo=tz).timestamp()))
            self.assertEqual(s["end"], now)
        raw = build_scope(d, "SCM", "发货单", "2026-10-01 至 2026-10-07", "test", now=now)
        self.assertEqual(raw["to"], "2026-10-08T00:00:00+08:00")
        with self.assertRaises(ReportError):
            build_scope(d, "SCM", "发货单", "2026-10-01 至 2026-10-23", "prod", now=now)

    def test_field_whitelist_and_no_chain_type_fallback(self):
        s = make_scope()
        sql = build_query(s, s["start"], s["end"])
        self.assertIn("json_extract_scalar(biz, '$.order_type') in ('delivery_note')", sql)
        self.assertNotIn("$.chain_id", sql)  # 不增加未配置的字段或兜底过滤。
        self.assertNotIn("b_api_duration", sql)
        self.assertNotIn("offset", sql)

    def test_missing_channel_is_explicit_not_silently_guessed(self):
        from contextlib import redirect_stderr
        from point_report import main
        with tempfile.TemporaryDirectory() as folder:
            source, out = Path(folder) / "dictionary.json", Path(folder) / "scope.json"
            d = dictionary()
            d["sls"] = {}
            atomic_json(source, d)
            with redirect_stderr(io.StringIO()) as stderr:
                self.assertEqual(main(["scope", "--dictionary", str(source), "--app", "SCM", "--node", "发货单", "--range", "今天", "--env", "prod", "--out", str(out)]), 1)
            error = json.loads(stderr.getvalue())
            self.assertEqual(error["error"], "MISSING_SLS_CHANNEL_IN_CONFIG")
            self.assertIn("discover", error["hint"])
            self.assertFalse(out.exists())

    def test_observed_node_sources_reach_scope_without_app_name_matching(self):
        from contextlib import redirect_stdout
        from point_report import main
        d = dictionary()
        d["apps"] = []
        d["configSource"] = {"kind": "local-dump", "selected": LOCAL_CONFIG_SOURCE, "fallback": True, "reason": "BOARD_HTTP_404"}
        d["sls"] = {"project": "tracking-point-project", "logstore": "prod_tracking_point_log", "topic": "xlb-scm-web"}
        # 来源已按 nodeKey 发现：子应用名（SCM）与应用名（新零帮）字面不匹配也必须保留。
        observed = [{"name": "SCM供应链", "platform": "pc"}, {"name": "新零帮", "platform": "rn"}]
        runner = dump_runner({"common": {"apps": observed}, "nodes": []})
        with tempfile.TemporaryDirectory() as folder:
            source = Path(folder) / "dictionary.json"
            atomic_json(source, d)
            out = Path(folder) / "scope.json"
            with patch("report_config.local_config_payload", lambda project, apps=None, runner=None, timeout=None: {"common": {"apps": observed}, "nodes": []}):
                with redirect_stdout(io.StringIO()):
                    self.assertEqual(main(["scope", "--dictionary", str(source), "--app", "SCM", "--node", "delivery_note", "--range", "2026-10-20 至 2026-10-21", "--env", "prod", "--out", str(out)]), 0)
            generated = normalize_scope(load_json(out))
            self.assertEqual(generated["appNames"], ["SCM供应链", "新零帮"])
            self.assertEqual(generated["appName"], "SCM供应链")
            self.assertEqual(generated["nodeKeys"], ["delivery_note"])
            self.assertEqual(generated["sls"], d["sls"])
            self.assertEqual(generated["fields"], sorted(set(d["bizFields"]) - {"phone", "api_response"}))
            sql = build_query(generated, generated["start"], generated["end"])
            self.assertIn("json_extract_scalar(app, '$.name') in ('SCM供应链','新零帮')", sql)
        self.assertEqual(runner.calls, [])  # 该用例直接桩住发现函数，不真的执行 node。


class ConfigSourceTests(unittest.TestCase):
    def test_online_config_is_preferred_and_records_source(self):
        client = FakeConfigClient()
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder) / "dictionary.json"
            result = discover(None, path, project=Path("/fixture"), factory=lambda url, **kw: client)
            value = load_json(path)
        self.assertEqual(client.paths, [API_PREFIX + "/ping", API_PREFIX + "/config"])
        self.assertEqual(result["connection"], {"kind": "online-http", "selected": DEFAULT_BOARD_URL, "fallback": False, "reason": "online"})
        self.assertEqual(value["boardUrl"], DEFAULT_BOARD_URL)
        self.assertEqual(value["configSource"]["kind"], "online-http")

    def test_unavailable_online_falls_back_to_local_dump_with_reason(self):
        for status in (401, 403, 404, 503):
            payload = {"common": {"sls": {"topic": "sample"}}, "nodes": [{"nodeKey": "delivery_note", "name": "发货单", "tracked": True}]}
            runner = dump_runner(payload)

            def factory(url, **kwargs):
                raise BoardHttpError(status)

            with tempfile.TemporaryDirectory() as folder:
                path = Path(folder) / "dictionary.json"
                result = discover(None, path, project=Path("/fixture"), factory=factory, runner=runner)
                value = load_json(path)
            self.assertEqual(result["connection"]["kind"], "local-dump")
            self.assertEqual(result["connection"]["reason"], "BOARD_HTTP_" + str(status))
            self.assertTrue(result["connection"]["fallback"])
            self.assertEqual(value["boardUrl"], LOCAL_CONFIG_SOURCE)
            # 兜底路径执行的是配置导出脚本 + 配额桩，不启动任何常驻服务。
            command = " ".join(runner.calls[0]["command"])
            self.assertIn("scripts/tracking-report-config.ts", command)
            self.assertIn("scripts/quota-stub.ts", command)
            self.assertEqual(runner.calls[0]["cwd"], "/fixture")

    def test_explicit_url_error_does_not_fallback(self):
        runner = dump_runner({"common": {}, "nodes": []})

        def factory(url, **kwargs):
            raise BoardHttpError(404)

        with self.assertRaises(BoardHttpError):
            resolve_config("https://board.example.com", project=Path("/fixture"), factory=factory, runner=runner)
        self.assertEqual(runner.calls, [])

    def test_protocol_mismatch_does_not_fallback(self):
        class Client(FakeConfigClient):
            def get(self, path):
                self.paths.append(path)
                return {"api": "point-report", "version": 999}

        runner = dump_runner({"common": {}, "nodes": []})
        with self.assertRaisesRegex(ReportError, "REPORT_PROTOCOL_VERSION_MISMATCH"):
            resolve_config(None, project=Path("/fixture"), factory=lambda url, **kw: Client(url), runner=runner)
        self.assertEqual(runner.calls, [])

    def test_local_dump_failure_is_visible_not_empty_config(self):
        def runner(command, cwd=None, capture_output=None, text=None, timeout=None):
            return type("Done", (), {"returncode": 1, "stdout": "", "stderr": "CONFIG_READ_FAILED P1001"})()

        with self.assertRaisesRegex(ReportError, "LOCAL_CONFIG_DUMP_FAILED"):
            local_config_payload(Path("/fixture"), runner=runner)
        with self.assertRaisesRegex(ReportError, "LOCAL_BOARD_PROJECT_NOT_AVAILABLE"):
            local_config_payload(None, runner=runner)

    def test_discover_keeps_config_fields_but_not_secrets(self):
        payload = {"common": {"llm": {"apiKey": "do-not-save"}, "sls": {"topic": "s"}, "bizFields": [{"name": "event_code", "enabled": True}, {"name": "unused", "enabled": False}]},
                   "nodes": [{"nodeKey": "delivery_note", "name": "发货单", "category": "SCM", "tracked": True, "regressiveCodes": [], "stepOrder": ["enter"], "stateNames": {"INIT": "制单"}}]}
        client = FakeConfigClient(payload=payload)
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder) / "dictionary.json"
            discover(None, path, project=Path("/fixture"), factory=lambda url, **kw: client)
            value, raw = load_json(path), path.read_text()
            self.assertEqual(value["nodes"][0]["regressiveCodes"], [])
            self.assertEqual(value["nodes"][0]["stateNames"], {"INIT": "制单"})
            self.assertEqual(value["bizFields"], ["event_code"])
            self.assertNotIn("do-not-save", raw)

    def test_apps_discovery_follows_config_source(self):
        online = dictionary()
        client = FakeConfigClient()
        self.assertEqual(read_apps(online, {"from": 1, "to": 2, "env": "prod"}, factory=lambda url, **kw: client), [{"name": "xlb-scm-web", "platform": "pc", "label": "SCM"}])
        self.assertIn("/api/report/apps?", client.paths[-1])
        local = dictionary()
        local["configSource"] = {"kind": "local-dump", "selected": LOCAL_CONFIG_SOURCE, "fallback": True, "reason": "BOARD_HTTP_404"}
        observed = [{"name": "SCM供应链", "platform": "pc"}]
        runner = dump_runner({"common": {"apps": observed}, "nodes": []})
        self.assertEqual(read_apps(local, {"from": 1, "to": 2, "env": "prod", "orderType": "quality_report"}, project=Path("/fixture"), runner=runner), observed)
        self.assertIn("--apps", runner.calls[0]["command"])
        self.assertIn("quality_report", runner.calls[0]["command"][-1])

    def test_missing_machine_token_uses_public_read_only_bearer(self):
        import report_connection
        with tempfile.TemporaryDirectory() as folder:
            with patch.dict(os.environ, {}, clear=True), patch("report_connection.Path.home", return_value=Path(folder)):
                self.assertEqual(report_connection.machine_token("https://board.example.com"), report_connection.PUBLIC_REPORT_TOKEN)

    def test_machine_bearer_header_without_cookie(self):
        client = BoardClient("https://board.example.com", bearer="fixture")
        calls = []

        def open_request(request, timeout):
            calls.append(request)
            return io.BytesIO(b'{"success":true,"data":{"api":"point-report","version":1}}')

        client.opener.open = open_request
        with patch.dict(os.environ, {"CHAIN_BOARD_COOKIE": "ignore"}, clear=True):
            self.assertEqual(client.get(API_PREFIX + "/ping")["api"], "point-report")
        self.assertEqual(calls[0].get_header("Authorization"), "Bearer fixture")
        self.assertIsNone(calls[0].get_header("Cookie"))

    def test_login_failures_and_bad_envelope_not_empty_success(self):
        for status in (401, 403):
            client = BoardClient("https://board.example.com")
            client.opener.open = lambda req, timeout: (_ for _ in ()).throw(HTTPError(req.full_url, status, "auth", {}, None))
            with self.assertRaisesRegex(ReportError, "BOARD_HTTP_" + str(status)):
                client.get(API_PREFIX + "/config")
        client.opener.open = lambda req, timeout: io.BytesIO(b'{"success":false,"data":[]}')
        with self.assertRaisesRegex(ReportError, "INVALID_BOARD_ENVELOPE"):
            client.get(API_PREFIX + "/config")

    def test_transport_error_retries_then_fails_visibly(self):
        from test_report import Clock
        clock = Clock()
        client = BoardClient("https://board.example.com", clock=clock.read, sleep=clock.sleep)
        calls = []

        def broken(request, timeout):
            calls.append(request)
            raise URLError("transport")

        client.opener.open = broken
        with self.assertRaisesRegex(ReportError, "BOARD_TRANSPORT_ERROR"):
            client.get(API_PREFIX + "/config")
        self.assertEqual(len(calls), 3)  # GET 幂等，最多三次。

    def test_only_loopback_local_board_allowed(self):
        for url in ("http://localhost:3001", "http://127.0.0.1:3001", "http://[::1]:3001"):
            self.assertEqual(BoardClient(url, bearer="fixture").url, url)
        for url in ("https://test.localhost", "https://127.0.0.2", "https://192.168.1.10", "https://0.0.0.0"):
            with self.subTest(url=url), self.assertRaisesRegex(ReportError, "UNTRUSTED_LOCAL_BOARD"):
                BoardClient(url, bearer="fixture")

    def test_unsafe_base_urls_are_rejected(self):
        for url in ("http://board.example.com", "https://user@board.example.com", "https://board.example.com?cookie=oops", "https://board.example.com/path"):
            with self.assertRaises(ReportError):
                board_url(url)

    def test_no_local_server_launcher_remains(self):
        # 撤掉常驻本地实例后，连接模块不得再提供启动器或令牌生成。
        import report_connection
        for name in ("start_local", "prepare_local_token", "local_url"):
            self.assertFalse(hasattr(report_connection, name), name + " 应随本地服务一起移除")
        self.assertEqual(report_connection.PROJECT_MARKER, "scripts/tracking-report-compute.ts")


if __name__ == "__main__":
    unittest.main()
