#!/usr/bin/env node
/**
 * design-to-code-max 运行指标收集
 *
 * 用法:
 *   node scripts/dtc-metrics.mjs init <需求目录> --mode <quick|standard|full> [--platform <rn|h5|pc>] [--reason <分级依据>]
 *   node scripts/dtc-metrics.mjs mode <需求目录> <quick|standard|full> --reason <升级原因>
 *   node scripts/dtc-metrics.mjs start <需求目录> <阶段名>
 *   node scripts/dtc-metrics.mjs end <需求目录> <阶段名> [--status passed|failed] [--retries <N>] [--first-pass <true|false>]
 *   node scripts/dtc-metrics.mjs doc <需求目录> [文件1 文件2 ...]
 *   node scripts/dtc-metrics.mjs summary <需求目录>
 *   node scripts/dtc-metrics.mjs report <需求目录>
 *
 * 说明:
 *   - 数据存于 <需求目录>/.dtc-run.json；summary / report 均会生成 <需求目录>/run-metrics.md
 *   - 阶段名: analyze / collect-materials / feature-spec / api-spec / audit / design / verify；
 *     build 按分组记录，阶段名用 `build:<分组名>`（如 build:分组1-列表页）
 *   - init 时 --platform 缺省则尝试从 .dtc-state.json 的 inputs.platform 推断
 *   - mode 只升不降（quick→standard→full），降级直接报错；升级记录 modeHistory
 *   - end 带 --first-pass 时记录「首次验证是否一次通过」（verify 阶段使用）
 *   - doc 统计给定文档字符数；不传文件时自动扫描标准文档
 *     （features / api-spec / ui-audit / tech-design / execution / review / playwright-report + parsed-styles/*.json）
 *   - 本脚本替代手写「性能计时日志」的零散做法：features.md 保留人读摘要，本文件为完整记录
 *
 * 退出码: 成功 0；参数/状态错误 1
 */
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const [command, targetDirArg, subject] = process.argv.slice(2);
// flag 一律从第 4 个参数起搜索（位置参数 subject 不会以 -- 开头，不会误判为 flag）
const flagArgs = process.argv.slice(4);

function getFlag(name, fallback = "") {
  const index = flagArgs.indexOf(name);
  return index >= 0 && flagArgs[index + 1] ? flagArgs[index + 1] : fallback;
}

function fail(message) {
  console.error(JSON.stringify({ ok: false, error: message }));
  process.exit(1);
}

if (!command || !targetDirArg) {
  fail(
    "Usage: node dtc-metrics.mjs <init|mode|start|end|doc|summary|report> <需求目录> [subject] [flags]",
  );
}

const targetDir = path.resolve(targetDirArg);
const metricsPath = path.join(targetDir, ".dtc-run.json");

function readMetrics() {
  if (!fs.existsSync(metricsPath))
    fail(`指标文件不存在: ${metricsPath}（先执行 init）`);
  try {
    return JSON.parse(fs.readFileSync(metricsPath, "utf8"));
  } catch {
    fail(`指标文件不是合法 JSON: ${metricsPath}`);
  }
}

function writeMetrics(metrics) {
  fs.mkdirSync(targetDir, { recursive: true });
  fs.writeFileSync(metricsPath, `${JSON.stringify(metrics, null, 2)}\n`);
}

const MODES = ["quick", "standard", "full"];
const MODE_RANK = { quick: 1, standard: 2, full: 3 };

// ---------- run-metrics.md 生成（summary / report 共用） ----------
function buildReport(metrics) {
  const reqName = path.basename(targetDir);

  function fmtTime(iso) {
    if (!iso) return "-";
    const d = new Date(iso);
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  }
  function fmtDuration(ms) {
    if (ms == null) return "-";
    const minutes = ms / 60000;
    return minutes >= 1
      ? `${minutes.toFixed(1)} 分钟`
      : `${Math.round(ms / 1000)} 秒`;
  }

  const stageRows = Object.entries(metrics.stages).map(
    ([name, s]) =>
      `| ${name} | ${fmtTime(s.startedAt)} | ${fmtTime(s.endedAt)} | ${fmtDuration(s.durationMs)} | ${s.status ?? "-"} | ${s.retries ?? 0} |`,
  );
  const totalMs = Object.values(metrics.stages).reduce(
    (total, s) => total + (s.durationMs ?? 0),
    0,
  );
  const modeHistoryLines = (metrics.modeHistory || []).map(
    (h) => `  - ${h.mode}（${h.at}${h.reason ? `，${h.reason}` : ""}）`,
  );
  const docRows = (metrics.docStats?.docs || []).map(
    (d) => `| ${d.doc} | ${d.characters} |`,
  );
  if (metrics.docStats?.parsedStyles?.files > 0) {
    docRows.push(
      `| parsed-styles/（${metrics.docStats.parsedStyles.files} 个 JSON） | ${metrics.docStats.parsedStyles.characters} |`,
    );
  }

  return `# 运行指标 — ${reqName}

> 由 scripts/dtc-metrics.mjs 生成于 ${new Date().toISOString()}。数据文件：.dtc-run.json

## 基本信息

- 平台: ${metrics.platform ?? "未记录"}
- 复杂度分级: ${metrics.mode}
- 分级变更记录:
${modeHistoryLines.join("\n")}
- 首次验证一次通过: ${metrics.verification ? (metrics.verification.firstPass ? "是" : "否") : "未记录"}${metrics.verification?.note ? `（${metrics.verification.note}）` : ""}

## 阶段耗时

| 阶段 | 开始 | 结束 | 耗时 | 状态 | 重试次数 |
|------|------|------|------|------|---------:|
${stageRows.join("\n")}

- 总耗时: ${fmtDuration(totalMs)}
- 瓶颈提示: 单阶段耗时超过总耗时 30% 时复查该阶段流程（对照 features.md「性能计时日志」人读摘要）

## 文档规模

| 文档 | 字符数 |
|------|-------:|
${docRows.length > 0 ? docRows.join("\n") : "| （doc 未执行） | - |"}

- 合计: ${metrics.docStats?.totalCharacters ?? "-"} 字符
`;
}

function writeReport(metrics) {
  const reportPath = path.join(targetDir, "run-metrics.md");
  fs.writeFileSync(reportPath, buildReport(metrics));
  return reportPath;
}

// ---------- init ----------
if (command === "init") {
  const mode = getFlag("--mode", "standard");
  if (!MODES.includes(mode)) fail("--mode 必须是 quick | standard | full");
  let platform = getFlag("--platform");
  if (platform && !["rn", "h5", "pc"].includes(platform)) {
    fail("--platform 必须是 rn | h5 | pc");
  }
  if (!platform) {
    // 缺省时从 .dtc-state.json 推断（analyze 阶段 Q2 已写入 inputs.platform）
    const statePath = path.join(path.dirname(targetDir), ".dtc-state.json");
    if (fs.existsSync(statePath)) {
      try {
        const state = JSON.parse(fs.readFileSync(statePath, "utf8"));
        const reqName = path.basename(targetDir);
        const requirement = (state.requirements || []).find(
          (r) => r.requirementName === reqName,
        );
        platform = requirement?.inputs?.platform || null;
      } catch {
        platform = null;
      }
    }
  }
  if (fs.existsSync(metricsPath))
    fail(`指标文件已存在: ${metricsPath}（重复 init 被拒绝）`);
  writeMetrics({
    schemaVersion: 1,
    skill: "design-to-code-max",
    platform: platform || null,
    mode,
    modeHistory: [
      {
        mode,
        reason: getFlag("--reason", "initial classify"),
        at: new Date().toISOString(),
      },
    ],
    createdAt: new Date().toISOString(),
    stages: {},
    verification: null,
    docStats: null,
  });
  console.log(
    JSON.stringify({ ok: true, metricsPath, mode, platform: platform || null }),
  );
} else if (command === "mode") {
  // ---------- mode（只升不降） ----------
  if (!MODES.includes(subject)) fail("Mode 必须是 quick | standard | full");
  const metrics = readMetrics();
  if (MODE_RANK[subject] < MODE_RANK[metrics.mode]) {
    fail(
      `禁止降级: ${metrics.mode} → ${subject}（只升不降，见 dtc-classify-mode.mjs policy）`,
    );
  }
  if (subject !== metrics.mode) {
    metrics.mode = subject;
    metrics.modeHistory.push({
      mode: subject,
      reason: getFlag("--reason", ""),
      at: new Date().toISOString(),
    });
    writeMetrics(metrics);
  }
  console.log(
    JSON.stringify({
      ok: true,
      mode: metrics.mode,
      modeHistory: metrics.modeHistory,
    }),
  );
} else if (command === "start") {
  // ---------- start ----------
  if (!subject) fail("阶段名必填（analyze/.../verify 或 build:<分组名>）");
  const metrics = readMetrics();
  metrics.stages[subject] = {
    ...(metrics.stages[subject] ?? {}),
    startedAt: new Date().toISOString(),
    status: "running",
  };
  writeMetrics(metrics);
  console.log(
    JSON.stringify({
      ok: true,
      stage: subject,
      startedAt: metrics.stages[subject].startedAt,
    }),
  );
} else if (command === "end") {
  // ---------- end（支持 --first-pass 记录首次验证结果） ----------
  if (!subject) fail("阶段名必填");
  const metrics = readMetrics();
  const stage = metrics.stages[subject];
  if (!stage?.startedAt) fail(`阶段未 start: ${subject}`);
  const endedAt = new Date();
  const durationMs = endedAt.getTime() - new Date(stage.startedAt).getTime();
  metrics.stages[subject] = {
    ...stage,
    endedAt: endedAt.toISOString(),
    durationMs,
    status: getFlag("--status", "passed"),
    retries: Number(getFlag("--retries", "0")) || 0,
  };
  const firstPass = getFlag("--first-pass");
  if (["true", "false"].includes(firstPass)) {
    metrics.verification = {
      firstPass: firstPass === "true",
      at: endedAt.toISOString(),
      note: getFlag("--note", ""),
    };
  }
  writeMetrics(metrics);
  console.log(
    JSON.stringify({
      ok: true,
      stage: subject,
      durationSeconds: Math.round(durationMs / 1000),
      status: metrics.stages[subject].status,
      retries: metrics.stages[subject].retries,
      ...(metrics.verification ? { verification: metrics.verification } : {}),
    }),
  );
} else if (command === "doc" || command === "docstat") {
  // ---------- doc（各文档字符数；无文件参数时扫描标准文档） ----------
  const metrics = readMetrics();
  // doc 的文件参数为纯位置参数（subskill 契约不传 flag）；过滤 -- 前缀项兜底
  const fileArgs = process.argv
    .slice(4)
    .filter((a) => a && !a.startsWith("--"));

  let docs = [];
  if (fileArgs.length > 0) {
    for (const file of fileArgs) {
      const abs = path.resolve(file);
      if (fs.existsSync(abs) && fs.statSync(abs).isFile()) {
        docs.push({
          doc: path.relative(targetDir, abs),
          characters: fs.readFileSync(abs, "utf8").length,
        });
      }
    }
  } else {
    const DEFAULT_DOCS = [
      "features.md",
      "api-spec.md",
      "ui-audit.md",
      "tech-design.md",
      "execution.md",
      "review.md",
      "playwright-report.md",
    ];
    for (const doc of DEFAULT_DOCS) {
      const docPath = path.join(targetDir, doc);
      if (fs.existsSync(docPath) && fs.statSync(docPath).isFile()) {
        docs.push({ doc, characters: fs.readFileSync(docPath, "utf8").length });
      }
    }
  }
  // parsed-styles 目录（audit 产物）始终自动扫描
  const parsedDir = path.join(targetDir, "parsed-styles");
  const parsedStyles = { files: 0, characters: 0 };
  if (fs.existsSync(parsedDir) && fs.statSync(parsedDir).isDirectory()) {
    for (const file of fs.readdirSync(parsedDir)) {
      if (file.endsWith(".json")) {
        parsedStyles.files += 1;
        parsedStyles.characters += fs.readFileSync(
          path.join(parsedDir, file),
          "utf8",
        ).length;
      }
    }
  }
  metrics.docStats = {
    at: new Date().toISOString(),
    docs,
    parsedStyles,
    totalCharacters:
      docs.reduce((total, item) => total + item.characters, 0) +
      parsedStyles.characters,
  };
  writeMetrics(metrics);
  console.log(JSON.stringify({ ok: true, docStats: metrics.docStats }));
} else if (command === "summary") {
  // ---------- summary（打印 JSON 汇总 + 生成 run-metrics.md） ----------
  const metrics = readMetrics();
  const reportPath = writeReport(metrics);
  const durationMs = Object.values(metrics.stages).reduce(
    (total, s) => total + (s.durationMs ?? 0),
    0,
  );
  console.log(
    JSON.stringify(
      {
        ok: true,
        platform: metrics.platform,
        mode: metrics.mode,
        modeHistory: metrics.modeHistory,
        stages: metrics.stages,
        verification: metrics.verification,
        docStats: metrics.docStats,
        durationSeconds: Math.round(durationMs / 1000),
        reportPath,
      },
      null,
      2,
    ),
  );
} else if (command === "report") {
  // ---------- report（只生成 run-metrics.md） ----------
  const metrics = readMetrics();
  const reportPath = writeReport(metrics);
  console.log(JSON.stringify({ ok: true, reportPath }));
} else {
  fail(`未知命令: ${command}`);
}
