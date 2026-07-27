#!/usr/bin/env node
/**
 * design-to-code-max 状态机门禁校验器
 *
 * 用法:
 *   node scripts/dtc-gate-validator.mjs <state.json路径>
 *
 * 对每个需求条目逐项验证:
 *   - 阶段推进顺序合法（不能跳阶段）
 *   - 已完成阶段 checklistPassed === true
 *   - 需确认阶段的 userConfirmed === true
 *   - build 阶段 groupGates 完整性
 *   - build→verify 前 exitGatePassed === true
 *
 * 输出: JSON { ok, issues, warnings }
 * 退出码: ok=true 时 0，否则 1
 */
import fs from "node:fs";

const [,, statePath] = process.argv;
if (!statePath) {
  console.log(JSON.stringify({ ok: false, error: "Usage: node dtc-gate-validator.mjs <state.json路径>" }));
  process.exit(1);
}

const content = fs.readFileSync(statePath, "utf8");
let state;
try {
  state = JSON.parse(content);
} catch {
  console.log(JSON.stringify({ ok: false, error: "state.json 不是合法 JSON" }));
  process.exit(1);
}

if (state.skill !== "design-to-code-max") {
  console.log(JSON.stringify({ ok: false, error: `skill 字段不匹配: ${state.skill}` }));
  process.exit(1);
}

const issues = [];
const warnings = [];

// ─── Phase order ───
const PHASE_ORDER = [
  "init", "analyze", "collect-materials", "feature-spec", "api-spec",
  "audit", "design", "build", "verify", "done",
];
const PHASE_INDEX = {};
PHASE_ORDER.forEach((p, i) => { PHASE_INDEX[p] = i; });

// Phases that require user confirmation (per state-schema §5.1)
const CONFIRM_PHASES = ["analyze", "collect-materials", "feature-spec", "api-spec", "audit", "design"];

for (const req of (state.requirements || [])) {
  const rname = req.requirementName || req.id;
  const mode = req.inputs?.mode || "standard";
  const phase = req.currentPhase;
  const phaseOutputs = req.phaseOutputs || {};

  if (!PHASE_ORDER.includes(phase)) {
    issues.push(`${rname}: unknown currentPhase "${phase}"`);
    continue;
  }

  // Check all phases up to currentPhase
  for (let i = 0; PHASE_ORDER[i] !== phase && i < PHASE_ORDER.length; i++) {
    const p = PHASE_ORDER[i];
    if (p === "init") continue;

    // Micro mode skips api-spec, audit, design
    if (mode === "micro" && (p === "api-spec" || p === "audit" || p === "design")) continue;
    // Quick mode skips api-spec
    if ((mode === "quick" || mode === "micro") && p === "api-spec") continue;

    const po = phaseOutputs[p];
    if (!po) {
      issues.push(`${rname}: phaseOutputs.${p} 缺失`);
      continue;
    }

    if (po.checklistPassed !== true) {
      issues.push(`${rname}: phaseOutputs.${p}.checklistPassed !== true`);
    }

    if (CONFIRM_PHASES.includes(p) && po.userConfirmed !== true) {
      issues.push(`${rname}: phaseOutputs.${p}.userConfirmed !== true (需要用户确认)`);
    }
  }

  // Build-specific checks
  if (PHASE_INDEX[phase] >= PHASE_INDEX.verify) {
    const build = phaseOutputs.build;
    if (!build) {
      issues.push(`${rname}: 缺少 phaseOutputs.build`);
      continue;
    }

    if (build.exitGatePassed !== true) {
      issues.push(`${rname}: build.exitGatePassed !== true`);
    }

    if (build.checklistPassed !== true) {
      issues.push(`${rname}: build.checklistPassed !== true`);
    }

    // Check groupGates
    const totalGroups = build.totalGroups || 0;
    const groupGates = build.groupGates || {};
    for (let g = 1; g <= totalGroups; g++) {
      const gate = groupGates[String(g)];
      if (!gate) {
        issues.push(`${rname}: build.groupGates.${g} 缺失 (totalGroups=${totalGroups})`);
        continue;
      }
      if (gate.passed !== true) {
        issues.push(`${rname}: build.groupGates.${g}.passed !== true`);
      }
      if (gate.userApproved !== true) {
        issues.push(`${rname}: build.groupGates.${g}.userApproved !== true (分组 ${g} 人工审查未确认)`);
      }
    }
  }

  // Skip check: if mode is micro and verify is the current phase, we can skip audit/design checks above
  // already handled by the mode skip logic above

  // Warn if completedGroups mismatch
  if (phaseOutputs.build) {
    const totalGroups = phaseOutputs.build.totalGroups || 0;
    const completedGroups = phaseOutputs.build.completedGroups || 0;
    const groupGates = phaseOutputs.build.groupGates || {};
    const gateCount = Object.keys(groupGates).length;

    if (phase === "verify" || phase === "done") {
      if (completedGroups < totalGroups) {
        warnings.push(`${rname}: totalGroups=${totalGroups} but completedGroups=${completedGroups}`);
      }
      if (gateCount < completedGroups) {
        warnings.push(`${rname}: ${completedGroups} groups completed but only ${gateCount} groupGates entries`);
      }
    }
  }
}

const ok = issues.length === 0;

console.log(JSON.stringify({
  ok,
  issues,
  warnings,
  summary: `${issues.length} issues, ${warnings.length} warnings`,
}, null, 2));

process.exit(ok ? 0 : 1);
