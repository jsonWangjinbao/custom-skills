#!/usr/bin/env node
/**
 * design-to-code-max 复杂度分级（两阶段）
 *
 * 用法:
 *   # Phase 01 预判（保守，宁可高估）
 *   node scripts/dtc-classify-mode.mjs --phase preliminary --text "<需求名+描述>" --files <N> --has-similar <true|false|unknown>
 *
 *   # Phase 03 确认（基于真实数据，决定流程裁剪）
 *   node scripts/dtc-classify-mode.mjs --phase confirm --feature-count <N> --api-count <N> --ui-files <N> --risk-count <N> --has-state-machine <true|false> --has-auth <true|false> --estimated-files <N>
 *
 * 分级规则（只升不降）:
 *   full     — 命中任一高风险信号
 *   quick    — 预判阶段保守默认 standard，确认阶段基于真实数据可判 quick
 *   standard — 默认（证据不足以判 quick 时选 standard）
 *
 * 输出: JSON { mode, phase, reasons, evidence }
 * 退出码: 恒为 0
 */
import process from "node:process";

const args = process.argv.slice(2);

function getFlag(name, fallback = "") {
  const index = args.indexOf(name);
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
}

function getFlagBool(name) {
  const v = getFlag(name);
  if (v === "true") return true;
  if (v === "false") return false;
  return null; // unknown
}

const phase = getFlag("--phase", "preliminary");

// ============ Phase 01: 预判（保守策略） ============
if (phase === "preliminary") {
  const text = getFlag("--text").toLowerCase();
  const files = Number(getFlag("--files", "0")) || 0;
  const hasSimilar = getFlag("--has-similar", "unknown");
  const reasons = [];

  // 高风险信号 → full（保守：宁可判 full 也不漏掉）
  const fullSignals = [
    "审批", "审核流", "状态流转", "状态机", "状态变更",
    "撤回", "撤销", "退回", "作废", "回滚",
    "权限", "鉴权", "数据隔离",
    "并发", "幂等", "缓存一致性",
    "跨项目", "跨应用", "基座路由", "公共组件源码", "接口契约",
    "workflow", "state machine", "permission", "rollback",
  ];

  for (const signal of fullSignals) {
    if (text.includes(signal)) reasons.push(`high-risk signal: ${signal}`);
  }

  // 预判阶段 quick 条件非常苛刻：用户明确说简单 + 极少量文件 + 有参照
  // 不满足时一律 standard
  const quickExplicitSignals = [
    "简单", "就改一下", "改个文案", "加个按钮", "小改动",
    "修个bug", "改个样式", "微调", "小调整",
  ];
  const isExplicitlySimple = quickExplicitSignals.some((s) => text.includes(s));

  let mode;
  if (reasons.length > 0) {
    mode = "full";
  } else if (isExplicitlySimple && files >= 1 && files <= 2 && hasSimilar === "true") {
    mode = "quick";
    reasons.push("explicitly simple + 1-2 files + verified similar");
  } else {
    mode = "standard";
    if (!isExplicitlySimple && files <= 3) {
      reasons.push("conservative: insufficient evidence for quick, default to standard");
    } else if (files > 3) {
      reasons.push(`${files} files exceeds quick threshold`);
    }
  }

  console.log(JSON.stringify({
    mode,
    phase: "preliminary",
    reasons,
    evidence: { files, hasSimilar },
    policy: "preliminary-only: 不裁剪流程，仅供参考。confirmed mode 在 feature-spec 完成后重新判定。",
  }, null, 2));

// ============ Phase 03: 确认（基于真实数据） ============
} else if (phase === "confirm") {
  const featureCount = Number(getFlag("--feature-count", "0")) || 0;
  const apiCount = Number(getFlag("--api-count", "0")) || 0;
  const uiFiles = Number(getFlag("--ui-files", "0")) || 0;
  const riskCount = Number(getFlag("--risk-count", "0")) || 0;
  const hasStateMachine = getFlagBool("--has-state-machine");
  const hasAuth = getFlagBool("--has-auth");
  const estimatedFiles = Number(getFlag("--estimated-files", "0")) || 0;
  const reasons = [];

  // === full 判定 ===

  // 高风险信号
  if (hasStateMachine === true) reasons.push("has state machine transitions");
  if (riskCount >= 3) reasons.push(`high risk count: ${riskCount}`);

  // 规模信号
  if (featureCount > 15) reasons.push(`large feature scope: ${featureCount} features`);
  if (apiCount > 8) reasons.push(`large API surface: ${apiCount} APIs`);
  if (estimatedFiles > 10) reasons.push(`large file scope: ${estimatedFiles} files`);

  // 权限类需求 → 至少 standard，结合其他因素可能升级 full
  // （权限本身不直接判 full，但如果叠加其他信号则升级）
  if (hasAuth === true && reasons.length === 0) {
    reasons.push("auth required; at least standard");
  }

  let mode;
  if (
    hasStateMachine === true ||
    riskCount >= 3 ||
    featureCount > 15 ||
    apiCount > 8 ||
    estimatedFiles > 10
  ) {
    mode = "full";
  } else if (
    featureCount <= 2 &&
    apiCount <= 1 &&
    estimatedFiles <= 2 &&
    riskCount === 0 &&
    hasStateMachine !== true &&
    hasAuth !== true
  ) {
    mode = "micro";
    reasons.push(`trivial: ${featureCount} features, ${apiCount} APIs, ${estimatedFiles} files, 0 risks, no auth/state-machine`);
  } else if (
    featureCount <= 3 &&
    apiCount <= 2 &&
    estimatedFiles <= 3 &&
    riskCount === 0 &&
    hasStateMachine !== true
  ) {
    mode = "quick";
    reasons.push(`${featureCount} features, ${apiCount} APIs, ${estimatedFiles} files, 0 risks`);
  } else {
    mode = "standard";
    if (reasons.length === 0) {
      reasons.push("moderate scope; standard flow appropriate");
    }
  }

  // 只升不降策略也适用于 micro：micro→quick→standard→full
  const modeRank = { micro: 0, quick: 1, standard: 2, full: 3 };

  console.log(JSON.stringify({
    mode,
    phase: "confirmed",
    reasons,
    evidence: {
      featureCount, apiCount, uiFiles, riskCount,
      hasStateMachine: hasStateMachine ?? "n/a",
      hasAuth: hasAuth ?? "n/a",
      estimatedFiles,
    },
    policy: "upgrade-only: 后续发现新风险可升级，禁止降级；升级需记录 modeHistory",
  }, null, 2));

} else {
  console.log(JSON.stringify({
    mode: "standard",
    phase: "unknown",
    reasons: [`invalid phase: ${phase}`],
    evidence: {},
  }, null, 2));
}
