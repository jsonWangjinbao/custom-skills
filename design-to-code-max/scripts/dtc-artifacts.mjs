#!/usr/bin/env node
/**
 * design-to-code-max 产物完整性检查
 *
 * 用法:
 *   node scripts/dtc-artifacts.mjs check <需求目录> --platform <rn|h5|pc> [--mode <quick|standard|full>]
 *
 * 检查内容:
 *   1. 必需文档存在且非空（按 mode 裁剪：quick 不查 api-spec.md；full 要求 features.md 含状态矩阵）
 *   2. state.json 中 docPaths.parsedStylesDir 非空时，目录下至少一个非空 .json
 *   3. .dtc-state.json 中对应需求条目的阶段门禁：
 *      - 各阶段 checklistPassed === true（quick 跳过 api-spec）
 *      - analyze / collect-materials / feature-spec / api-spec(非 quick) / audit / design 六阶段 userConfirmed === true
 *      - build.exitGatePassed === true
 *
 * 输出: JSON { ok, mode, platform, missingArtifacts, stateIssues }
 * 退出码: ok=true 时 0，否则 1
 */
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const args = process.argv.slice(2);
const [command, reqDirArg] = args;

function getFlag(name, fallback = "") {
  const index = args.indexOf(name);
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
}

function output(result, exitCode) {
  console.log(JSON.stringify(result, null, 2));
  process.exit(exitCode);
}

function fail(message) {
  output({ ok: false, error: message }, 1);
}

if (command !== "check" || !reqDirArg) {
  fail(
    "Usage: node dtc-artifacts.mjs check <需求目录> --platform <rn|h5|pc> [--mode quick|standard|full]",
  );
}

const platform = getFlag("--platform");
if (!["rn", "h5", "pc"].includes(platform)) {
  fail("--platform 必须是 rn | h5 | pc");
}

const mode = getFlag("--mode", "standard") || "standard";
if (!["quick", "standard", "full"].includes(mode)) {
  fail("--mode 必须是 quick | standard | full");
}

const reqDir = path.resolve(reqDirArg);
if (!fs.existsSync(reqDir) || !fs.statSync(reqDir).isDirectory()) {
  fail(`需求目录不存在: ${reqDir}`);
}

// ---------- 1. 文档产物检查 ----------

const COMMON_DOCS = [
  "features.md",
  "ui-audit.md",
  "tech-design.md",
  "execution.md",
];
const MODE_EXTRA_DOCS = {
  quick: [],
  standard: ["api-spec.md"],
  full: ["api-spec.md"],
};

function fileNonEmpty(filePath) {
  return (
    fs.existsSync(filePath) &&
    fs.statSync(filePath).isFile() &&
    fs.statSync(filePath).size > 0
  );
}

const missingArtifacts = [];
for (const doc of [...COMMON_DOCS, ...MODE_EXTRA_DOCS[mode]]) {
  if (!fileNonEmpty(path.join(reqDir, doc))) missingArtifacts.push(doc);
}

// full 模式：features.md 必须包含状态矩阵章节（见 03-feature-spec.md 门禁）
if (mode === "full") {
  const featuresPath = path.join(reqDir, "features.md");
  if (fs.existsSync(featuresPath)) {
    const content = fs.readFileSync(featuresPath, "utf8");
    if (!content.includes("状态迁移矩阵")) {
      missingArtifacts.push("features.md#状态迁移矩阵 (full 模式必需章节)");
    }
  }
}

// ---------- 2. 状态机检查 ----------

const stateIssues = [];
const statePath = path.join(path.dirname(reqDir), ".dtc-state.json");
let requirement = null;

if (!fs.existsSync(statePath)) {
  stateIssues.push(`状态文件不存在: ${statePath}`);
} else {
  let state;
  try {
    state = JSON.parse(fs.readFileSync(statePath, "utf8"));
  } catch {
    stateIssues.push(`状态文件不是合法 JSON: ${statePath}`);
  }

  if (state) {
    const dirName = path.basename(reqDir);
    requirement = (state.requirements || []).find(
      (r) =>
        r.requirementName === dirName ||
        (r.docPaths &&
          Object.values(r.docPaths).some(
            (p) => typeof p === "string" && p.includes(dirName),
          )),
    );
    if (!requirement) {
      stateIssues.push(`状态文件中找不到与目录 "${dirName}" 对应的需求条目`);
    }
  }
}

if (requirement) {
  const phases = requirement.phaseOutputs || {};
  const checklistPhases =
    mode === "quick"
      ? [
          "analyze",
          "collect-materials",
          "feature-spec",
          "audit",
          "design",
          "build",
          "verify",
        ]
      : [
          "analyze",
          "collect-materials",
          "feature-spec",
          "api-spec",
          "audit",
          "design",
          "build",
          "verify",
        ];
  const confirmPhases =
    mode === "quick"
      ? ["analyze", "collect-materials", "feature-spec", "audit", "design"]
      : [
          "analyze",
          "collect-materials",
          "feature-spec",
          "api-spec",
          "audit",
          "design",
        ];

  for (const phase of checklistPhases) {
    if (phases[phase]?.checklistPassed !== true) {
      stateIssues.push(`phaseOutputs.${phase}.checklistPassed !== true`);
    }
  }
  for (const phase of confirmPhases) {
    if (phases[phase]?.userConfirmed !== true) {
      stateIssues.push(`phaseOutputs.${phase}.userConfirmed !== true`);
    }
  }
  if (phases.build?.exitGatePassed !== true) {
    stateIssues.push("phaseOutputs.build.exitGatePassed !== true");
  }

  // parsed-styles：state 声明了解析目录时才检查（材料 skipped / quick 无材料时允许为空）
  const parsedDir = requirement.docPaths?.parsedStylesDir;
  if (parsedDir) {
    const absParsedDir = path.isAbsolute(parsedDir)
      ? parsedDir
      : path.resolve(path.dirname(statePath), "..", parsedDir);
    const jsonFiles = fs.existsSync(absParsedDir)
      ? fs
          .readdirSync(absParsedDir)
          .filter(
            (f) =>
              f.endsWith(".json") &&
              fs.statSync(path.join(absParsedDir, f)).size > 0,
          )
      : [];
    if (jsonFiles.length === 0) {
      missingArtifacts.push(
        `parsed-styles/*.json (docPaths.parsedStylesDir 已声明但目录为空或不存在)`,
      );
    }
  }
}

output(
  {
    ok: missingArtifacts.length === 0 && stateIssues.length === 0,
    mode,
    platform,
    requirementDir: reqDir,
    missingArtifacts,
    stateIssues,
  },
  missingArtifacts.length === 0 && stateIssues.length === 0 ? 0 : 1,
);
