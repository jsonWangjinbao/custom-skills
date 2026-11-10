"""报告成品门禁（report-check）行为测试：每条规则都必须能被对应违规触发，合规样本必须通过。"""
import tempfile
import unittest
from pathlib import Path

from test_report import scope, write_kpi
from report_core import ReportError, atomic_json
from report_verify import verify_report

EVIDENCE = {
    "uniqueEvents": 900,
    "actions": [{
        "actionKey": '["delivery_note","appoint_confirm"]', "name": "发货单-预约确认",
        "metrics": {"success": 500, "fail": 40, "validate_fail": 10, "totalSubmissions": 550, "abnormal": 50,
                    "abnormalRate": 9.09, "involvedDocuments": 400, "abnormalDocuments": 40, "documentAbnormalRate": 10.0},
        "rootCauses": [{"layer": "接口", "apiCode": "2005", "reason": "api_biz_fail",
                        "message": "预占校验失败:当前预约数量超过仓库可预约上限量，可预约上限量为:9.000件，请分为多个单据重新预约",
                        "count": 34, "pctOfAbnormal": 68.0}],
        "docRetry": {"affectedDocuments": 40, "abnormalPerDocumentAvg": 1.25, "p50": 1, "p90": 2, "max": 9,
                     "topDocumentCadence": {"medianGapMs": 2233, "minGapMs": 1360, "submissions": 10}},
    }],
    "regressionTop": [{"code": "un_audit", "name": "发货单-反审核", "count": 185}],
}

REPORT = """# 发货单业务埋点报告｜2026-10-22｜prod

## 一、口径说明
1. 窗口 2026-10-22 00:00:00 至 2026-10-23 00:00:00，去重事件 900 条。

## 二、核心指标总览
| 节点 | 单量 |
|-|-|
| delivery_note | 123 |

## 三、问题清单

### 问题 1：预约确认 50 次异常，单张最高重试 9 次

1. 现象：550 次提交中异常 50 次（9.09%），涉及 400 张单据、40 张异常（10.0%）。
2. 数据证据
   1. 根因分布：`api_code=2005`「预占校验失败:当前预约数量超过仓库可预约上限量，可预约上限量为:9.000件，请分为多个单据重新预约」×34（68.0%）。
   2. 时间定位：14 时集中。
   3. 组织与人员定位：单一组织 34 次。
   4. 单据级时间线：单均 1.25 次、max 9 次、中位间隔 2.23 秒。
   5. 仓库维度：管理中心 34 次。
   6. 账号共用核验：本次未开启 IP 采集。
3. 业务影响：40 张单据当日受阻。
4. 根因归纳：直接根因为超可约上限；行为根因为连点重试；系统根因为配额未前置展示。
5. 建议：前置展示可约量，预计消减 34 次（34/50=68.0%）。
6. 为什么只有埋点能看见：接口返回 HTTP 200，仅业务码标识失败。

## 四、页面交互优化清单
| # | 交互点 | 数据证据 | 主要根因 | 优化建议 |
|-|-|-|-|-|
| 1 | 预约确认 | 异常 50 次 | 配额未前置 | 前置展示可约量 |

## 五、埋点价值小结
1. 共同点：HTTP 200，服务端无异常日志。

## 六、数据质量与受限项
1. 取数完整性：分片全部完成。
"""


class VerifyFixture(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.out = Path(self.tmp.name)
        self.scope = scope()
        write_kpi(self.scope, self.out)
        atomic_json(self.out / "evidence.json", EVIDENCE)
        atomic_json(self.out / "quality.json", {"counts": {"businessRows": 900, "rawRows": 900}})
        (self.out / "report.md").write_text(REPORT, encoding="utf-8")

    def tearDown(self):
        self.tmp.cleanup()

    def mutate(self, old, new):
        text = (self.out / "report.md").read_text(encoding="utf-8")
        self.assertIn(old, text, "夹具里没有待替换片段，测试失去意义")
        (self.out / "report.md").write_text(text.replace(old, new, 1), encoding="utf-8")

    def test_compliant_report_passes(self):
        result = verify_report(self.out)
        self.assertTrue(result["complete"])
        self.assertEqual(result["violationCount"], 0)

    def test_missing_report_file_is_explicit(self):
        (self.out / "report.md").unlink()
        with self.assertRaisesRegex(ReportError, "REPORT_FILE_REQUIRED"):
            verify_report(self.out)

    def test_each_section_is_required(self):
        titles = ["一、口径说明", "二、核心指标总览", "三、问题清单", "四、页面交互优化清单", "五、埋点价值小结", "六、数据质量与受限项"]
        for title in titles:
            with self.subTest(section=title):
                self.mutate("## " + title, "## 已删除的小节")
                with self.assertRaisesRegex(ReportError, "REPORT_SECTION_MISSING"):
                    verify_report(self.out)
                (self.out / "report.md").write_text(REPORT, encoding="utf-8")

    def test_problem_missing_sixth_point_is_rejected(self):
        self.mutate("6. 为什么只有埋点能看见：接口返回 HTTP 200，仅业务码标识失败。", "6. 其他说明：略。")
        with self.assertRaisesRegex(ReportError, "REPORT_PROBLEM_POINT_MISSING"):
            verify_report(self.out)

    def test_no_problems_requires_explicit_statement(self):
        text = (self.out / "report.md").read_text(encoding="utf-8")
        (self.out / "report.md").write_text(text.split("### 问题 1")[0] + "## 四、页面交互优化清单\n## 五、埋点价值小结\n## 六、数据质量与受限项\n", encoding="utf-8")
        with self.assertRaisesRegex(ReportError, "REPORT_NO_PROBLEMS_AND_NO_STATEMENT"):
            verify_report(self.out)

    def test_root_cause_must_reach_business_code(self):
        self.mutate("`api_code=2005`", "`fail_reason=api_biz_fail`")
        with self.assertRaisesRegex(ReportError, "REPORT_ROOT_CAUSE_NOT_DRILLED"):
            verify_report(self.out)

    def test_fabricated_message_with_count_is_rejected(self):
        self.mutate("「预占校验失败:当前预约数量超过仓库可预约上限量，可预约上限量为:9.000件，请分为多个单据重新预约」×34",
                    "「仓库配额已被系统自动释放，请稍后重试」×34")
        with self.assertRaisesRegex(ReportError, "REPORT_MESSAGE_UNTRACEABLE"):
            verify_report(self.out)

    def test_full_ip_and_phone_are_rejected(self):
        self.mutate("6. 账号共用核验：本次未开启 IP 采集。", "6. 账号共用核验：操作端 60.211.42.7 与 15809748574。")
        with self.assertRaisesRegex(ReportError, "REPORT_FULL_IP_LEAKED"):
            verify_report(self.out)
        (self.out / "report.md").write_text(REPORT.replace("6. 账号共用核验：本次未开启 IP 采集。", "6. 账号共用核验：联系方式 15809748574。"), encoding="utf-8")
        with self.assertRaisesRegex(ReportError, "REPORT_PHONE_LEAKED"):
            verify_report(self.out)

    def test_ratio_precision_over_four_decimals_is_rejected(self):
        self.mutate("550 次提交中异常 50 次（9.09%）", "550 次提交中异常 50 次（9.090909%）")
        with self.assertRaisesRegex(ReportError, "REPORT_RATIO_PRECISION"):
            verify_report(self.out)

    def test_untraceable_percent_and_integer_are_rejected(self):
        self.mutate("涉及 400 张单据、40 张异常（10.0%）", "涉及 400 张单据、40 张异常（37.88%）")
        with self.assertRaisesRegex(ReportError, "REPORT_PERCENT_UNTRACEABLE"):
            verify_report(self.out)
        (self.out / "report.md").write_text(REPORT.replace("去重事件 900 条", "去重事件 9,999 条"), encoding="utf-8")
        with self.assertRaisesRegex(ReportError, "REPORT_NUMBER_UNTRACEABLE"):
            verify_report(self.out)

    def test_self_aggregated_number_requires_visible_formula(self):
        # 185+34 两项都可溯源，写出算式后合计值才允许出现；不写算式即不可溯源。
        (self.out / "report.md").write_text(REPORT.replace("1. 共同点：HTTP 200，服务端无异常日志。", "1. 共同点：合计 219 次。"), encoding="utf-8")
        with self.assertRaisesRegex(ReportError, "REPORT_NUMBER_UNTRACEABLE"):
            verify_report(self.out)
        (self.out / "report.md").write_text(REPORT.replace("1. 共同点：HTTP 200，服务端无异常日志。", "1. 共同点：合计 219 次（185+34）。"), encoding="utf-8")
        self.assertTrue(verify_report(self.out)["complete"])

    def test_abbreviated_document_number_is_rejected(self):
        self.mutate("4. 单据级时间线：单均 1.25 次、max 9 次、中位间隔 2.23 秒。",
                    "4. 单据级时间线：FH66666340000002288 / 2289 两张单均 1.25 次、max 9 次。")
        with self.assertRaisesRegex(ReportError, "REPORT_NUMBER_UNTRACEABLE"):
            verify_report(self.out)


if __name__ == "__main__":
    unittest.main()
