#!/usr/bin/env node
/**
 * dtc-artifacts.mjs 回归测试
 * 用法: node scripts/dtc-artifacts.test.mjs
 * 在 scripts/.tmp-fixture/ 下构造合成需求目录，覆盖 standard / quick / full 三种模式与典型失败场景。
 */
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const fixtureRoot = path.join(scriptDir, ".tmp-fixture");
const scriptPath = path.join(scriptDir, "dtc-artifacts.mjs");

const ALL_DOCS = [
  "features.md",
  "api-spec.md",
  "ui-audit.md",
  "tech-design.md",
  "execution.md",
];
const PHASES = [
  "analyze",
  "collect-materials",
  "feature-spec",
  "api-spec",
  "audit",
  "design",
  "build",
  "verify",
];
const CONFIRM_PHASES = [
  "analyze",
  "collect-materials",
  "feature-spec",
  "api-spec",
  "audit",
  "design",
];

function makeState(
  reqName,
  { quick = false, breakConfirm = false, withParsedDir = false } = {},
) {
  const phaseOutputs = {};
  for (const p of PHASES) {
    phaseOutputs[p] = {
      checklistPassed: true,
      ...(CONFIRM_PHASES.includes(p)
        ? { userConfirmed: !(breakConfirm && p === "audit") }
        : {}),
    };
  }
  phaseOutputs.build.exitGatePassed = true;
  return {
    skill: "design-to-code-max",
    version: "2.0",
    startedAt: "2026-07-23T00:00:00Z",
    updatedAt: "2026-07-23T01:00:00Z",
    requirements: [
      {
        id: "req-test",
        requirementName: reqName,
        requirementType: "incremental",
        status: "in-progress",
        currentPhase: "verify",
        inputs: { platform: "pc", mode: quick ? "quick" : "standard" },
        docPaths: {
          features: `.ai-wiki/${reqName}/features.md`,
          ...(withParsedDir
            ? { parsedStylesDir: `.ai-wiki/${reqName}/parsed-styles/` }
            : {}),
        },
        phaseOutputs,
        performanceLog: [],
        changeLog: [],
      },
    ],
  };
}

function setup(
  reqName,
  { docs = ALL_DOCS, stateOpts = {}, featuresContent = "# features" } = {},
) {
  const aiWiki = path.join(fixtureRoot, ".ai-wiki");
  const reqDir = path.join(aiWiki, reqName);
  fs.mkdirSync(reqDir, { recursive: true });
  for (const doc of docs) {
    fs.writeFileSync(
      path.join(reqDir, doc),
      doc === "features.md" ? featuresContent : `# ${doc}`,
    );
  }
  fs.writeFileSync(
    path.join(aiWiki, ".dtc-state.json"),
    JSON.stringify(makeState(reqName, stateOpts)),
  );
  return reqDir;
}

function run(args) {
  try {
    const stdout = execFileSync("node", [scriptPath, ...args], {
      encoding: "utf8",
    });
    return { code: 0, result: JSON.parse(stdout) };
  } catch (e) {
    return { code: e.status, result: JSON.parse(e.stdout) };
  }
}

let passed = 0;
let failed = 0;
function assertCase(name, condition, detail) {
  if (condition) {
    passed++;
    console.log(`  PASS ${name}`);
  } else {
    failed++;
    console.error(`  FAIL ${name}: ${detail}`);
  }
}

fs.rmSync(fixtureRoot, { recursive: true, force: true });

// 1. standard 全量产物 + 状态合规 → ok
let dir = setup("req-standard-ok");
let r = run(["check", dir, "--platform", "pc", "--mode", "standard"]);
assertCase(
  "standard 全量通过",
  r.code === 0 && r.result.ok === true,
  JSON.stringify(r.result),
);

// 2. standard 缺 api-spec.md → fail
dir = setup("req-standard-missing-api", {
  docs: ALL_DOCS.filter((d) => d !== "api-spec.md"),
});
r = run(["check", dir, "--platform", "pc", "--mode", "standard"]);
assertCase(
  "standard 缺 api-spec 拦截",
  r.code === 1 && r.result.missingArtifacts.includes("api-spec.md"),
  JSON.stringify(r.result),
);

// 3. quick 无 api-spec.md → ok（mode 联动裁剪）
dir = setup("req-quick-ok", {
  docs: ALL_DOCS.filter((d) => d !== "api-spec.md"),
  stateOpts: { quick: true },
});
r = run(["check", dir, "--platform", "rn", "--mode", "quick"]);
assertCase(
  "quick 免查 api-spec",
  r.code === 0 && r.result.ok === true,
  JSON.stringify(r.result),
);

// 4. full 缺状态矩阵章节 → fail
dir = setup("req-full-no-matrix");
r = run(["check", dir, "--platform", "pc", "--mode", "full"]);
assertCase(
  "full 缺状态矩阵拦截",
  r.code === 1 &&
    r.result.missingArtifacts.some((a) => a.includes("状态迁移矩阵")),
  JSON.stringify(r.result),
);

// 5. full 含状态矩阵章节 → ok
dir = setup("req-full-ok", {
  featuresContent:
    "# features\n\n## 状态迁移矩阵\n\n| 当前状态 | 动作 | 目标状态 |",
});
r = run(["check", dir, "--platform", "h5", "--mode", "full"]);
assertCase(
  "full 含状态矩阵通过",
  r.code === 0 && r.result.ok === true,
  JSON.stringify(r.result),
);

// 6. userConfirmed 缺失 → fail
dir = setup("req-no-confirm", { stateOpts: { breakConfirm: true } });
r = run(["check", dir, "--platform", "pc", "--mode", "standard"]);
assertCase(
  "audit 未确认拦截",
  r.code === 1 &&
    r.result.stateIssues.some((s) => s.includes("audit.userConfirmed")),
  JSON.stringify(r.result),
);

// 7. parsedStylesDir 已声明但目录为空 → fail
dir = setup("req-parsed-empty", { stateOpts: { withParsedDir: true } });
r = run(["check", dir, "--platform", "pc", "--mode", "standard"]);
assertCase(
  "parsed-styles 空目录拦截",
  r.code === 1 &&
    r.result.missingArtifacts.some((a) => a.includes("parsed-styles")),
  JSON.stringify(r.result),
);

// 8. parsedStylesDir 已声明且有 JSON → ok
dir = setup("req-parsed-ok", { stateOpts: { withParsedDir: true } });
fs.mkdirSync(path.join(dir, "parsed-styles"), { recursive: true });
fs.writeFileSync(
  path.join(dir, "parsed-styles", "page.json"),
  '{"elements":[]}',
);
r = run(["check", dir, "--platform", "pc", "--mode", "standard"]);
assertCase(
  "parsed-styles 正常通过",
  r.code === 0 && r.result.ok === true,
  JSON.stringify(r.result),
);

// 9. 空文档（size=0）→ fail
dir = setup("req-empty-doc");
fs.writeFileSync(path.join(dir, "execution.md"), "");
r = run(["check", dir, "--platform", "pc", "--mode", "standard"]);
assertCase(
  "空文档拦截",
  r.code === 1 && r.result.missingArtifacts.includes("execution.md"),
  JSON.stringify(r.result),
);

fs.rmSync(fixtureRoot, { recursive: true, force: true });
console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
