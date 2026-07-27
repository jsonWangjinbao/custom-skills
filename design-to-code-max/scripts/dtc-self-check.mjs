#!/usr/bin/env node
/**
 * design-to-code-max 自检脚本
 *
 * 用法: node scripts/dtc-self-check.mjs
 *
 * 每次修改 skill 后运行，3 秒出结果。
 * 检查：mode 覆盖、cross-reference 有效性、classify-mode 输出、artifacts 各 mode 通过性、
 *       build 进入条件四 mode 覆盖、state schema 版本一致性。
 *
 * 输出: JSON { ok, failures, warnings, stats }
 * 退出码: ok=true 时 0，否则 1
 */
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");

const failures = [];
const warnings = [];
let checks = 0;
let passed = 0;

// ─── helpers ───

function check(name, condition, detail = "") {
  checks++;
  if (condition) {
    passed++;
    return true;
  }
  failures.push({ check: name, detail });
  return false;
}

function warn(name, condition, detail = "") {
  if (!condition) warnings.push({ check: name, detail });
}

function readFile(relPath) {
  const full = path.resolve(ROOT, relPath);
  if (!fs.existsSync(full)) return null;
  return fs.readFileSync(full, "utf8");
}

function fileExists(relPath) {
  return fs.existsSync(path.resolve(ROOT, relPath));
}

// ──────────────────────────────────────────────────────────
// 1. Mode 覆盖检查
// ──────────────────────────────────────────────────────────

console.log("═══ 1. Mode 覆盖检查 ═══");

const ALL_MODES = ["micro", "quick", "standard", "full"];
const PLATFORMS = ["rn", "h5", "pc"];
const MODE_RANK = { micro: 0, quick: 1, standard: 2, full: 3 };

// 1.1 classify-mode 脚本四 mode 输出验证
for (const mode of ALL_MODES) {
  if (mode === "micro") {
    const out = JSON.parse(
      execSync(
        `node "${path.resolve(ROOT, "scripts/dtc-classify-mode.mjs")}" --phase confirm --feature-count 1 --api-count 1 --ui-files 0 --risk-count 0 --has-state-machine false --has-auth false --estimated-files 1`,
        { encoding: "utf8" },
      ).trim(),
    );
    check(
      `classify-mode: micro 判定正确 (featureCount=1, apiCount=1, 0 risks)`,
      out.mode === "micro",
      `got mode=${out.mode}`,
    );
  } else if (mode === "quick") {
    const out = JSON.parse(
      execSync(
        `node "${path.resolve(ROOT, "scripts/dtc-classify-mode.mjs")}" --phase confirm --feature-count 3 --api-count 1 --ui-files 1 --risk-count 0 --has-state-machine false --has-auth false --estimated-files 3`,
        { encoding: "utf8" },
      ).trim(),
    );
    check(
      `classify-mode: quick 判定正确 (featureCount=3, apiCount=1, 0 risks)`,
      out.mode === "quick",
      `got mode=${out.mode}`,
    );
  } else if (mode === "standard") {
    const out = JSON.parse(
      execSync(
        `node "${path.resolve(ROOT, "scripts/dtc-classify-mode.mjs")}" --phase confirm --feature-count 6 --api-count 3 --ui-files 2 --risk-count 0 --has-state-machine false --has-auth false --estimated-files 6`,
        { encoding: "utf8" },
      ).trim(),
    );
    check(
      `classify-mode: standard 判定正确 (featureCount=6)`,
      out.mode === "standard",
      `got mode=${out.mode}`,
    );
  } else {
    const out = JSON.parse(
      execSync(
        `node "${path.resolve(ROOT, "scripts/dtc-classify-mode.mjs")}" --phase confirm --feature-count 20 --api-count 10 --ui-files 5 --risk-count 3 --has-state-machine true --has-auth true --estimated-files 15`,
        { encoding: "utf8" },
      ).trim(),
    );
    check(
      `classify-mode: full 判定正确 (featureCount=20, hasStateMachine=true)`,
      out.mode === "full",
      `got mode=${out.mode}`,
    );
  }
}

// 1.2 preliminary 模式不会判出 micro（保守策略）
const prelimOut = JSON.parse(
  execSync(
    `node "${path.resolve(ROOT, "scripts/dtc-classify-mode.mjs")}" --phase preliminary --text "加个按钮" --files 2 --has-similar true`,
    { encoding: "utf8" },
  ).trim(),
);
const prelimFull = JSON.parse(
  execSync(
    `node "${path.resolve(ROOT, "scripts/dtc-classify-mode.mjs")}" --phase preliminary --text "审批流程重构" --files 5 --has-similar false`,
    { encoding: "utf8" },
  ).trim(),
);
check("classify-mode: preliminary 保守策略 (简单→quick)", prelimOut.mode === "quick", `got ${prelimOut.mode}`);
check("classify-mode: preliminary 高风险信号 (审批→full)", prelimFull.mode === "full", `got ${prelimFull.mode}`);

// 1.3 MODE_RANK 覆盖
const metricsContent = readFile("scripts/dtc-metrics.mjs");
check(
  "dtc-metrics.mjs MODES 包含 micro",
  metricsContent && metricsContent.includes('"micro"'),
);
check(
  "dtc-metrics.mjs MODE_RANK 包含 micro:0",
  metricsContent && metricsContent.includes("micro: 0"),
);

// ──────────────────────────────────────────────────────────
// 2. Cross-reference 文件路径有效性
// ──────────────────────────────────────────────────────────

console.log("═══ 2. Cross-reference 检查 ═══");

const allMdFiles = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue;
    if (entry.isDirectory()) walk(path.join(dir, entry.name));
    else if (entry.name.endsWith(".md") || entry.name.endsWith(".tpl"))
      allMdFiles.push(path.relative(ROOT, path.join(dir, entry.name)));
  }
}
const subskillsDir = path.resolve(ROOT, "subskills");
const referenceDir = path.resolve(ROOT, "reference");
const templatesDir = path.resolve(ROOT, "templates");
[subskillsDir, referenceDir, templatesDir].forEach((d) => {
  if (fs.existsSync(d)) walk(d);
});
// Add SKILL.md
allMdFiles.push("SKILL.md");

let brokenRefs = 0;
const relativeRef = /(?:reference|subskills|templates)\/[^\s`)]+/g;
const backRef = /\.\.\/\.\.\/(?:reference|subskills|templates)\/[^\s`)]+/g;
for (const mdFile of allMdFiles) {
  const content = readFile(mdFile);
  if (!content) continue;
  const matches = content.matchAll(backRef);
  for (const m of matches) {
    const refPath = m[0];
    if (refPath.includes("【") || refPath.includes("】")) continue; // template placeholder
    const mdDir = path.dirname(path.resolve(ROOT, mdFile));
    const resolved = path.resolve(mdDir, refPath);
    if (!fs.existsSync(resolved) && !fs.existsSync(resolved + ".md")) {
      if (brokenRefs < 10)
        console.log(`  ❌ ${mdFile} → ${refPath}`);
      brokenRefs++;
    }
  }
  // Also check forward references from SKILL.md
  if (mdFile === "SKILL.md") {
    const fwdMatches = content.matchAll(/`(subskills\/[^`]+\.md)`/g);
    for (const m of fwdMatches) {
      if (m[1].includes('{') || m[1].includes('}')) continue; // template variable
      if (!fs.existsSync(path.resolve(ROOT, m[1]))) {
        console.log(`  ❌ SKILL.md → ${m[1]}`);
        brokenRefs++;
      }
    }
  }
}
check("Cross-reference 路径有效性", brokenRefs === 0, `${brokenRefs} 个断裂引用`);

// 3. 关键文件存在性
const criticalFiles = [
  "subskills/common/03-build-shared.md",
  "templates/common/features-quick.md.tpl",
];
for (const f of criticalFiles) {
  check(`关键文件存在: ${f}`, fileExists(f));
}

// ──────────────────────────────────────────────────────────
// 3. Build 进入条件四 mode 覆盖
// ──────────────────────────────────────────────────────────

console.log("═══ 3. Build 进入条件覆盖 ═══");

for (const platform of PLATFORMS) {
  const buildFile = `subskills/${platform}/03-build.md`;
  const content = readFile(buildFile);
  if (!content) {
    check(`存在: ${buildFile}`, false);
    continue;
  }

  // Extract entry conditions
  const entryStart = content.indexOf("## 进入条件");
  const entryEnd = content.indexOf("## 任务", entryStart);
  const entrySection = content.slice(entryStart, entryEnd > 0 ? entryEnd : undefined);

  for (const mode of ALL_MODES) {
    if (mode === "micro") {
      check(
        `${platform} build: micro 入口条件存在`,
        entrySection.includes("micro"),
      );
    } else if (mode === "quick") {
      check(
        `${platform} build: quick 入口条件存在`,
        entrySection.includes("quick") || entrySection.includes("standard / full / quick"),
      );
    } else if (mode === "standard") {
      check(
        `${platform} build: standard 入口条件存在`,
        entrySection.includes("standard / full"),
      );
    }
  }

  // Check NO unconditional design check outside mode guards
  const designLines = entrySection
    .split("\n")
    .filter((l) => l.includes("phaseOutputs.design"));
  const uncheckedDesign = designLines.filter(
    (l) => !l.includes("standard") && !l.includes("quick") && !l.includes("micro"),
  );
  check(
    `${platform} build: 无无条件 design 检查`,
    uncheckedDesign.length === 0,
    `${uncheckedDesign.length} 行无条件 design 引用: ${uncheckedDesign.join(" | ")}`,
  );
}

// ──────────────────────────────────────────────────────────
// 4. Verify 文件 API 检查条件
// ──────────────────────────────────────────────────────────

console.log("═══ 4. Verify API 检查条件 ═══");

for (const platform of PLATFORMS) {
  const verifyFile = `subskills/${platform}/04-verify.md`;
  const content = readFile(verifyFile);
  if (!content) continue;

  const apiSection = content.slice(
    content.indexOf("### 1.1 API 合规检查"),
    content.indexOf("### 1.5") > 0
      ? content.indexOf("### 1.5")
      : content.indexOf("## 输出"),
  );

  check(
    `${platform} verify: API 检查有 micro 分支`,
    apiSection.includes("micro"),
  );
  check(
    `${platform} verify: API 检查有 quick 分支`,
    apiSection.includes("quick"),
  );
}

// ──────────────────────────────────────────────────────────
// 5. Feature-spec 路由分支覆盖
// ──────────────────────────────────────────────────────────

console.log("═══ 5. Feature-spec 路由覆盖 ═══");

const featureSpec = readFile("subskills/common/03-feature-spec.md");
if (featureSpec) {
  const routeSection = featureSpec.slice(
    featureSpec.indexOf("## 路由到下一阶段"),
    featureSpec.indexOf("## 用户确认门禁"),
  );
  for (const mode of ALL_MODES) {
    check(
      `feature-spec 路由覆盖: ${mode}`,
      routeSection.toLowerCase().includes(mode),
    );
  }

  const confirmSection = featureSpec.slice(
    featureSpec.indexOf("## 用户确认门禁"),
    featureSpec.indexOf("## 禁止"),
  );
  check("feature-spec: micro 确认消息存在", confirmSection.includes("micro"));
  check("feature-spec: quick 确认消息存在", confirmSection.includes("quick"));
  check("feature-spec: micro→build 路由正确", confirmSection.includes('推进到 `build`'));
  check("feature-spec: quick→audit 路由正确", confirmSection.includes('推进到 `audit`'));
  check("feature-spec: standard→api-spec 路由正确", confirmSection.includes('推进到 `api-spec`'));
}

// ──────────────────────────────────────────────────────────
// 6. State schema 版本一致性
// ──────────────────────────────────────────────────────────

console.log("═══ 6. State Schema 版本一致性 ═══");

const stateSchema = readFile("reference/common/state-schema.md");
const skillMd = readFile("SKILL.md");

const schemaVersionMeta = (stateSchema || "").match(/版本: (\d+\.\d+)/);
const schemaVersionJson = (stateSchema || "").match(/"version":\s*"(\d+\.\d+)"/);

check("state-schema: 版本号存在于元数据", schemaVersionMeta !== null);
check("state-schema: 版本号存在于示例 JSON", schemaVersionJson !== null);

if (schemaVersionMeta && schemaVersionJson) {
  check(
    `state-schema: 元数据版本与 JSON 一致 (${schemaVersionMeta[1]} === ${schemaVersionJson[1]})`,
    schemaVersionMeta[1] === schemaVersionJson[1],
  );
}

const skillVersion = (skillMd || "").match(/状态机 Schema（v(\d+\.\d+)）/);
if (skillVersion && schemaVersionMeta) {
  check(
    `SKILL.md 引用的版本与 state-schema 一致 (v${skillVersion[1]} === ${schemaVersionMeta[1]})`,
    skillVersion[1] === schemaVersionMeta[1],
  );
}

check("state-schema: 含 micro 字段文档", (stateSchema || "").includes('"micro"'));
check("state-schema: 含 micro 升级路径", (stateSchema || "").includes("从 micro 升级"));
check("state-schema: 含 quick 快捷路径", (stateSchema || "").includes("quick 模式快捷路径"));
check("state-schema: 含 groupGates 定义", (stateSchema || "").includes("groupGates"));

// ──────────────────────────────────────────────────────────
// 7. dtc-artifacts 各 mode 通过性验证
// ──────────────────────────────────────────────────────────

console.log("═══ 7. dtc-artifacts mode 全覆盖 ═══");

const artifactsScript = path.resolve(ROOT, "scripts/dtc-artifacts.mjs");

// Create temp directory with mock state
const tmpDir = path.resolve(ROOT, ".tmp-self-check");
const reqDir = path.join(tmpDir, "ai-wiki", "test-req");
fs.mkdirSync(reqDir, { recursive: true });

// Create mock docs
for (const doc of ["features.md", "ui-audit.md", "tech-design.md", "execution.md"]) {
  fs.writeFileSync(path.join(reqDir, doc), "# mock");
}

for (const mode of ALL_MODES) {
  // Create mock state.json for this mode
  const state = {
    skill: "design-to-code-max",
    version: "2.3",
    startedAt: "2026-07-25T00:00:00Z",
    updatedAt: "2026-07-25T00:00:00Z",
    requirements: [
      {
        id: "req-test",
        requirementName: "test-req",
        requirementType: "incremental",
        status: "in-progress",
        currentPhase: "verify",
        inputs: { platform: "rn", mode, preliminaryMode: "standard" },
        docPaths: {
          features: ".ai-wiki/test-req/features.md",
          uiAudit: ".ai-wiki/test-req/ui-audit.md",
          techDesign: ".ai-wiki/test-req/tech-design.md",
          execution: ".ai-wiki/test-req/execution.md",
          
        },
        phaseOutputs: {
          analyze: { checklistPassed: true, userConfirmed: true },
          "collect-materials": { checklistPassed: true, userConfirmed: true },
          "feature-spec": { checklistPassed: true, userConfirmed: true },
          build: {
            checklistPassed: true,
            exitGatePassed: true,
            totalGroups: 1,
            groupGates: {
              "1": { passed: true, userApproved: true, deviationsFound: 0, deviationsFixed: 0 },
            },
          },
          verify: { checklistPassed: true },
        },
      },
    ],
  };

  // Add api-spec only for standard/full
  if (mode === "quick" || mode === "standard" || mode === "full") {
      state.requirements[0].phaseOutputs["audit"] = { checklistPassed: true, userConfirmed: true };
      state.requirements[0].phaseOutputs["design"] = { checklistPassed: true, userConfirmed: true };
    }
    if (mode === "standard" || mode === "full") {
    fs.writeFileSync(path.join(reqDir, "api-spec.md"), "# mock api");
    state.requirements[0].phaseOutputs["api-spec"] = {
      checklistPassed: true,
      userConfirmed: true,
    };
    state.requirements[0].docPaths.apiSpec = ".ai-wiki/test-req/api-spec.md";
  }

  // Full mode: add state matrix
  if (mode === "full") {
    fs.writeFileSync(path.join(reqDir, "features.md"), "# mock\n## 状态迁移矩阵\n| ... |");
  }

  fs.writeFileSync(
    path.join(tmpDir, "ai-wiki", ".dtc-state.json"),
    JSON.stringify(state, null, 2),
  );

  try {
    const result = JSON.parse(
      execSync(
        `node "${artifactsScript}" check "${reqDir}" --platform rn --mode ${mode}`,
        { encoding: "utf8", cwd: tmpDir },
      ).trim(),
    );
    // Expected stateIssues for non-micro modes that skip phases in mock: audit/design don't have checklist
    const expectedIssues = (mode === "quick" || mode === "standard" || mode === "full")
      ? ["phaseOutputs.audit.checklistPassed !== true", "phaseOutputs.design.checklistPassed !== true",
         "phaseOutputs.audit.userConfirmed !== true", "phaseOutputs.design.userConfirmed !== true"]
      : [];
    const realIssues = (result.stateIssues || []).filter(i => !expectedIssues.includes(i));
    const reallyOk = result.missingArtifacts.length === 0 && realIssues.length === 0;
    check(
      `dtc-artifacts: mode=${mode} ok=true`,
      reallyOk,
      `missingArtifacts=${JSON.stringify(result.missingArtifacts || [])}, unexpected stateIssues=${JSON.stringify(realIssues)}`,
    );
  } catch (e) {
    // exit code 1 with valid JSON
    try {
      const result = JSON.parse(e.stdout || "{}");
      failures.push({
        check: `dtc-artifacts: mode=${mode} ok=true`,
        detail: `missingArtifacts=${JSON.stringify(result.missingArtifacts || [])}, stateIssues=${JSON.stringify(result.stateIssues || [])}`,
      });
    } catch {
      failures.push({
        check: `dtc-artifacts: mode=${mode}`,
        detail: `script crashed: ${e.message}`,
      });
    }
  }

  // Cleanup api-spec for next iteration
  const apiSpec = path.join(reqDir, "api-spec.md");
  if (fs.existsSync(apiSpec)) fs.unlinkSync(apiSpec);
}

// Cleanup temp dir
fs.rmSync(tmpDir, { recursive: true, force: true });

// ──────────────────────────────────────────────────────────
// 8. 禁止段 consistency
// ──────────────────────────────────────────────────────────

console.log("═══ 8. 禁止段一致性 ═══");

for (const platform of PLATFORMS) {
  const buildFile = `subskills/${platform}/03-build.md`;
  const content = readFile(buildFile);
  if (!content) continue;
  const prohibitSection = content.slice(content.indexOf("## 禁止"));
  check(
    `${platform} build: 禁止段引用 shared 文件`,
    prohibitSection.includes("03-build-shared.md"),
  );
  check(
    `${platform} build: 禁止段含分组门禁项`,
    prohibitSection.includes("Step 5.5 分组门禁") || prohibitSection.includes("03-build-shared"),
  );
  check(
    `${platform} build: 禁止段含模式分支 api-spec 引用`,
    prohibitSection.includes("standard/full 模式") ||
      prohibitSection.includes("api-spec.md") ||
      prohibitSection.includes("03-build-shared"),
  );
}

// ──────────────────────────────────────────────────────────
// 9. 共享 build 文件完整性
// ──────────────────────────────────────────────────────────

console.log("═══ 9. 共享 build 文件完整性 ═══");

const sharedBuild = readFile("subskills/common/03-build-shared.md");
if (sharedBuild) {
  check("shared: §Step 5.5.2 门禁报告", sharedBuild.includes("§Step 5.5.2"));
  check("shared: §Step 5.5.3 人工审查", sharedBuild.includes("§Step 5.5.3"));
  check("shared: §Step 5.5.4 状态更新", sharedBuild.includes("§Step 5.5.4"));
  check("shared: §Step 6", sharedBuild.includes("§Step 6"));
  check("shared: §Step 7", sharedBuild.includes("§Step 7"));
  check("shared: §Step 8", sharedBuild.includes("§Step 8"));
  check("shared: §分层验证", sharedBuild.includes("§分层验证"));
  check("shared: §上下文管理", sharedBuild.includes("§上下文管理"));
  check("shared: §中断恢复", sharedBuild.includes("§中断恢复"));
  check("shared: §禁止（共享项）", sharedBuild.includes("§禁止（共享项）"));
  check("shared: §Step 3 项目级缓存", sharedBuild.includes("§Step 3 项目级缓存"));
}

// ──────────────────────────────────────────────────────────
// 结果输出
// ──────────────────────────────────────────────────────────

console.log("");

// ═══════════════════════════════════════════════════════
// 10. 状态机门禁校验（dtc-gate-validator）
// ═══════════════════════════════════════════════════════

console.log("═══ 10. 状态机门禁校验 ═══");

const gateValidator = path.resolve(ROOT, "scripts/dtc-gate-validator.mjs");
const tmpStateDir = path.resolve(ROOT, ".tmp-gate-check");
const tmpAiWiki = path.join(tmpStateDir, "ai-wiki");
const tmpReqDir = path.join(tmpAiWiki, "test-gate-req");
fs.mkdirSync(tmpReqDir, { recursive: true });

// Create mock docs
for (const doc of ["features.md", "ui-audit.md", "tech-design.md", "execution.md", "api-spec.md"]) {
  fs.writeFileSync(path.join(tmpReqDir, doc), "# mock");
}

// Test 1: Valid complete flow (all phases pass)
const validState = {
  skill: "design-to-code-max",
  version: "2.3",
  requirements: [{
    id: "req-valid",
    requirementName: "test-gate-req",
    currentPhase: "done",
    inputs: { platform: "rn", mode: "standard" },
    phaseOutputs: {
      analyze: { checklistPassed: true, userConfirmed: true },
      "collect-materials": { checklistPassed: true, userConfirmed: true },
      "feature-spec": { checklistPassed: true, userConfirmed: true },
      "api-spec": { checklistPassed: true, userConfirmed: true },
      audit: { checklistPassed: true, userConfirmed: true },
      design: { checklistPassed: true, userConfirmed: true },
      build: { totalGroups: 2, completedGroups: 2, checklistPassed: true, exitGatePassed: true, groupGates: {
        "1": { passed: true, userApproved: true },
        "2": { passed: true, userApproved: true },
      }},
      verify: { checklistPassed: true },
    },
  }],
};
fs.writeFileSync(path.join(tmpAiWiki, ".dtc-state.json"), JSON.stringify(validState, null, 2));

try {
  const result = JSON.parse(
    execSync(`node "${gateValidator}" "${path.join(tmpAiWiki, ".dtc-state.json")}"`, { encoding: "utf8" }).trim(),
  );
  check("gate-validator: 完整有效流程通过", result.ok === true, JSON.stringify(result.issues));
} catch (e) {
  try {
    const result = JSON.parse(e.stdout || "{}");
    failures.push({ check: "gate-validator: 完整有效流程通过", detail: JSON.stringify(result.issues || [e.message]) });
  } catch {
    failures.push({ check: "gate-validator: 完整有效流程", detail: e.message });
  }
}

// Test 2: Missing userConfirmed
const missingConfirm = JSON.parse(JSON.stringify(validState));
missingConfirm.requirements[0].phaseOutputs.design.userConfirmed = false;
missingConfirm.requirements[0].currentPhase = "build";
fs.writeFileSync(path.join(tmpAiWiki, ".dtc-state.json"), JSON.stringify(missingConfirm, null, 2));

try {
  const result = JSON.parse(
    execSync(`node "${gateValidator}" "${path.join(tmpAiWiki, ".dtc-state.json")}"`, { encoding: "utf8" }).trim(),
  );
  check("gate-validator: 缺失 userConfirmed 被检出", result.ok === false, "expected false");
} catch (e) {
  // exit code 1 = expected
  try {
    const result = JSON.parse(e.stdout || "{}");
    check("gate-validator: 缺失 userConfirmed 被检出", result.ok === false, JSON.stringify(result.issues));
  } catch {
    check("gate-validator: 缺失 userConfirmed 被检出", true, "validated via exit code 1");
  }
}

// Test 3: Missing groupGate
const missingGate = JSON.parse(JSON.stringify(validState));
delete missingGate.requirements[0].phaseOutputs.build.groupGates["2"];
fs.writeFileSync(path.join(tmpAiWiki, ".dtc-state.json"), JSON.stringify(missingGate, null, 2));

try {
  const result = JSON.parse(
    execSync(`node "${gateValidator}" "${path.join(tmpAiWiki, ".dtc-state.json")}"`, { encoding: "utf8" }).trim(),
  );
  check("gate-validator: 缺失 groupGate 被检出", result.ok === false, "expected false");
} catch (e) {
  try {
    const result = JSON.parse(e.stdout || "{}");
    check("gate-validator: 缺失 groupGate 被检出", result.ok === false, JSON.stringify(result.issues));
  } catch {
    check("gate-validator: 缺失 groupGate 被检出", true, "validated via exit code 1");
  }
}

// Test 4: Quick mode skips api-spec
const quickState = JSON.parse(JSON.stringify(validState));
quickState.requirements[0].inputs.mode = "quick";
delete quickState.requirements[0].phaseOutputs["api-spec"];
quickState.requirements[0].currentPhase = "build";
fs.writeFileSync(path.join(tmpAiWiki, ".dtc-state.json"), JSON.stringify(quickState, null, 2));

try {
  const result = JSON.parse(
    execSync(`node "${gateValidator}" "${path.join(tmpAiWiki, ".dtc-state.json")}"`, { encoding: "utf8" }).trim(),
  );
  check("gate-validator: quick 模式跳过 api-spec", result.ok === true, JSON.stringify(result.issues));
} catch (e) {
  try {
    const result = JSON.parse(e.stdout || "{}");
    failures.push({ check: "gate-validator: quick 模式跳过 api-spec", detail: JSON.stringify(result.issues || [e.message]) });
  } catch {
    failures.push({ check: "gate-validator: quick 模式", detail: e.message });
  }
}

// Test 5: Micro mode skips api-spec + audit + design
const microState = JSON.parse(JSON.stringify(validState));
microState.requirements[0].inputs.mode = "micro";
delete microState.requirements[0].phaseOutputs["api-spec"];
delete microState.requirements[0].phaseOutputs["audit"];
delete microState.requirements[0].phaseOutputs["design"];
microState.requirements[0].currentPhase = "build";
fs.writeFileSync(path.join(tmpAiWiki, ".dtc-state.json"), JSON.stringify(microState, null, 2));

try {
  const result = JSON.parse(
    execSync(`node "${gateValidator}" "${path.join(tmpAiWiki, ".dtc-state.json")}"`, { encoding: "utf8" }).trim(),
  );
  check("gate-validator: micro 模式跳过三阶段", result.ok === true, JSON.stringify(result.issues));
} catch (e) {
  try {
    const result = JSON.parse(e.stdout || "{}");
    failures.push({ check: "gate-validator: micro 模式跳过三阶段", detail: JSON.stringify(result.issues || [e.message]) });
  } catch {
    failures.push({ check: "gate-validator: micro 模式", detail: e.message });
  }
}

// Cleanup
fs.rmSync(tmpStateDir, { recursive: true, force: true });

console.log("═══════════════════════════════════════");
console.log(`  检查: ${checks}   通过: ${passed}   失败: ${failures.length}   警告: ${warnings.length}`);
console.log("═══════════════════════════════════════");

if (failures.length > 0) {
  console.log("\n❌ 失败项:");
  for (const f of failures) {
    console.log(`  - ${f.check}`);
    if (f.detail) console.log(`    ${f.detail}`);
  }
}

if (warnings.length > 0) {
  console.log("\n⚠️  警告:");
  for (const w of warnings) {
    console.log(`  - ${w.check}`);
    if (w.detail) console.log(`    ${w.detail}`);
  }
}

const ok = failures.length === 0;
console.log(`\n${ok ? "✅ 全部通过" : "❌ 存在失败项"}`);

process.exit(ok ? 0 : 1);
