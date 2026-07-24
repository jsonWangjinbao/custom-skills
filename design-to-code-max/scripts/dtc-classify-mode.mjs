#!/usr/bin/env node
/**
 * design-to-code-max 复杂度分级
 *
 * 用法:
 *   node scripts/dtc-classify-mode.mjs --text "<需求描述>" --files <预计文件数> --has-similar <true|false|unknown>
 *
 * 分级规则（只升不降：执行中出现新风险时允许 quick→standard→full 升级，禁止降级）:
 *   full     — 命中任一高风险信号（撤回/审批/状态流转/权限/并发/幂等等），或预计 >10 个文件，或无同类实现可参照
 *   quick    — 预计 1-3 个文件 + 有已验证同类实现 + 无 standard/full 信号
 *   standard — 默认（证据不足以判 quick 时选 standard）
 *
 * 输出: JSON { mode, reasons, evidence }
 * 退出码: 恒为 0（分级是建议性输出，由 Agent 写入 state.json inputs.mode）
 */
import process from "node:process";

const args = process.argv.slice(2);

function getFlag(name, fallback = "") {
  const index = args.indexOf(name);
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
}

const text = getFlag("--text").toLowerCase();
const files = Number(getFlag("--files", "0")) || 0;
const hasSimilar = getFlag("--has-similar", "unknown");
const reasons = [];

// 高风险信号 → full（状态流转类需求还需在 feature-spec 强制状态矩阵，见 03-feature-spec.md）
const fullSignals = [
  "撤回",
  "撤销",
  "退回",
  "作废",
  "回滚",
  "取消流程",
  "新流程",
  "审批",
  "审核流",
  "状态流转",
  "状态变更",
  "状态机",
  "权限",
  "鉴权",
  "数据隔离",
  "并发",
  "幂等",
  "缓存一致性",
  "跨项目",
  "跨应用",
  "基座路由",
  "公共组件源码",
  "接口契约",
  "workflow",
  "state machine",
  "permission",
  "rollback",
];

// 常规迭代信号 → 至少 standard
const standardSignals = [
  "新页面",
  "新路由",
  "新增接口",
  "新表单",
  "新列表",
  "重构",
  "new page",
  "new route",
  "refactor",
];

for (const signal of fullSignals) {
  if (text.includes(signal)) reasons.push(`high-risk signal: ${signal}`);
}
if (files > 10) reasons.push(`large file scope: ${files} files`);
if (hasSimilar === "false") reasons.push("no verified similar implementation");

let mode = reasons.length > 0 ? "full" : "standard";

if (mode !== "full") {
  const standardMatches = standardSignals.filter((signal) =>
    text.includes(signal),
  );
  if (standardMatches.length > 0)
    reasons.push(`standard signal: ${standardMatches.join(", ")}`);

  const quickEligible =
    files >= 1 &&
    files <= 3 &&
    hasSimilar === "true" &&
    standardMatches.length === 0;
  if (quickEligible) {
    mode = "quick";
    reasons.push("1-3 files with verified similar implementation");
  } else if (reasons.length === 0) {
    reasons.push("insufficient evidence for quick; default to standard");
  }
}

console.log(
  JSON.stringify(
    {
      mode,
      reasons,
      evidence: { files, hasSimilar },
      policy:
        "upgrade-only: 执行中出现新风险时允许升级，禁止降级；升级需记录 modeHistory",
    },
    null,
    2,
  ),
);
