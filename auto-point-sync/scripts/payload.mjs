#!/usr/bin/env node
// payload.mjs —— extract.json + supplement.json（模型补齐的人工字段）→ 看板提交 payload.json。
// 用法：node payload.mjs --extract <extract.json> --supplement <supplement.json> --out <payload.json>
//
// 确定性规则（模型不得手改 payload.json，改 supplement 后重新生成）：
// - 事件字段只来自 extract；supplement 只能补 terminalKind / remark / 节点信息 / 页面标识 / 分析口径覆盖
// - 每个终态事件必须在 terminalKinds 中给出 fulfill|close；给了非终态事件的 terminalKind 视为过期，报错
// - 分析口径默认值：stepOrder = 环节全集顺序 ∩ 已用环节（abort/leave 不进漏斗）；intentSteps = 含 handle 时 ["handle"]
// - source：git 仓库/分支/commit（工作区有未提交改动时 commit 加 -dirty）/ user.name / user.email；implAt 缺省取 verify-report.md 修改时间
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const SKILL_VERSION = 'auto-point-sync@1.0.0';

/** 环节全集（与看板 DEFAULT_CHAIN_STEPS 一致） */
const CHAIN_STEPS = [
  ['enter', '进入任务'],
  ['browse', '浏览/查询'],
  ['handle', '单据处理'],
  ['reply', '单据批复'],
  ['appoint', '发货预约'],
  ['abort', '异常/中断'],
  ['leave', '离开'],
];
const NON_FUNNEL = new Set(['abort', 'leave']);

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, a, i, arr) => {
    if (a.startsWith('--')) acc.push([a.slice(2), arr[i + 1] ?? 'true']);
    return acc;
  }, []),
);
const errors = [];
const fail = (msg) => {
  console.error(`✖ ${msg}`);
  process.exit(1);
};
if (!args.extract || !args.supplement || !args.out) {
  fail('用法：node payload.mjs --extract <extract.json> --supplement <supplement.json> --out <payload.json>');
}
const readJson = (f) => {
  try {
    return JSON.parse(fs.readFileSync(f, 'utf8'));
  } catch (e) {
    fail(`读取 ${f} 失败：${e.message}`);
  }
};
const extract = readJson(args.extract);
const sup = readJson(args.supplement);

// ── 节点与页面选择 ──
const nodeKey = sup.nodeKey;
if (!nodeKey) fail('supplement.nodeKey 必填');
if (!extract.chains.some((c) => c.nodeKey === nodeKey)) {
  fail(`nodeKey「${nodeKey}」不在代码链条中（可选：${extract.chains.map((c) => c.nodeKey).join('、')}）`);
}
const byCode = new Map(extract.pages.map((p) => [p.pageCode, p]));
let selected;
if (Array.isArray(sup.pages) && sup.pages.length) {
  for (const code of sup.pages) if (!byCode.has(code)) errors.push(`supplement.pages 中的页面 ${code} 不在提取结果中`);
  selected = sup.pages.map((c) => byCode.get(c)).filter(Boolean);
} else {
  selected = extract.pages.filter((p) => p.nodeKey === nodeKey);
}
for (const p of selected) {
  if (p.nodeKey && p.nodeKey !== nodeKey) {
    errors.push(`页面 ${p.pageCode} 在代码中归属 ${p.nodeKey}，不能提交到 ${nodeKey}`);
  }
}
if (!selected.length) fail(`没有归属 ${nodeKey} 的页面（未归属的页面需在 supplement.pages 中显式列出）`);

// ── 终态语义 / 备注 ──
const terminalKinds = sup.terminalKinds ?? {};
const remarks = sup.remarks ?? {};
const lookup = (map, page, code) => map[`${page.pageCode}.${code}`] ?? map[code];
const usedKeys = new Set();
const markUsed = (map, page, code) => {
  if (`${page.pageCode}.${code}` in map) usedKeys.add(`${page.pageCode}.${code}`);
  else if (code in map) usedKeys.add(code);
};

const pages = selected.map((p) => {
  const meta = sup.pageMeta?.[p.pageCode] ?? {};
  const decorate = (e) => {
    const out = { ...e };
    const kind = lookup(terminalKinds, p, e.code);
    if (e.terminal) {
      if (kind !== 'fulfill' && kind !== 'close') {
        errors.push(`终态事件 ${p.pageCode}.${e.code}「${e.name}」缺少 terminalKinds（fulfill=履约完成 / close=终结未履约）`);
      } else {
        out.terminalKind = kind;
        markUsed(terminalKinds, p, e.code);
      }
    } else if (kind !== undefined) {
      errors.push(`terminalKinds 中的 ${p.pageCode}.${e.code} 不是终态事件（可能已过期），请删除`);
    }
    const remark = lookup(remarks, p, e.code);
    if (typeof remark === 'string' && remark.trim()) {
      out.remark = remark.trim().slice(0, 200);
      markUsed(remarks, p, e.code);
    }
    return out;
  };
  return {
    pageCode: p.pageCode,
    pageName: p.pageName,
    pagePath: p.pagePath,
    ...(meta.pageId ? { pageId: meta.pageId } : {}),
    ...(meta.pageRoute ? { pageRoute: meta.pageRoute } : {}),
    eventVer: p.eventVer,
    events: p.events.map(decorate),
    extraEvents: p.extraEvents.map(decorate),
  };
});
for (const k of [...Object.keys(terminalKinds), ...Object.keys(remarks)]) {
  if (!usedKeys.has(k) && !errors.some((e) => e.includes(k))) {
    errors.push(`supplement 中的 ${k} 未匹配任何已选页面事件`);
  }
}

// ── 分析口径（默认值 + supplement 覆盖；显式 null = 不提供建议） ──
const used = new Set(pages.flatMap((p) => [...p.events, ...p.extraEvents].map((e) => e.step)));
used.add('leave'); // PAGE_LEAVE 由看板派生，环节恒存在
const known = new Map(CHAIN_STEPS);
const stepOrder = [
  ...CHAIN_STEPS.map(([c]) => c).filter((c) => used.has(c) && !NON_FUNNEL.has(c)),
  ...[...used].filter((c) => !known.has(c) && !NON_FUNNEL.has(c)),
];
const stepNames = Object.fromEntries([...used].filter((c) => known.has(c)).map((c) => [c, known.get(c)]));
const analysis = {
  stepOrder,
  stepNames,
  stateNames: null,
  intentSteps: used.has('handle') ? ['handle'] : null,
  ...(sup.analysis ?? {}),
};

// ── 来源 ──
const root = extract.root;
const git = (...a) => {
  try {
    return execFileSync('git', a, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return '';
  }
};
const remote = git('config', '--get', 'remote.origin.url');
const repo = (remote ? path.basename(remote).replace(/\.git$/, '') : '') || path.basename(root);
const commit = git('rev-parse', '--short', 'HEAD');
const dirty = git('status', '--porcelain') !== '';
const verifyReport = path.join(path.dirname(path.dirname(path.resolve(args.out))), 'verify-report.md');
let implAt = sup.implAt;
if (!implAt) {
  if (fs.existsSync(verifyReport)) implAt = fs.statSync(verifyReport).mtime.toISOString();
  else errors.push(`未找到 ${verifyReport}，请在 supplement.implAt 指定实施完成时间`);
}
const email = git('config', 'user.email');
const source = {
  repo,
  ...(git('rev-parse', '--abbrev-ref', 'HEAD') ? { branch: git('rev-parse', '--abbrev-ref', 'HEAD') } : {}),
  ...(commit ? { commit: dirty ? `${commit}-dirty` : commit } : {}),
  ...(sup.requirement ? { requirement: sup.requirement } : {}),
  submitter: {
    ...(git('config', 'user.name') ? { name: git('config', 'user.name') } : {}),
    ...(email ? { email } : {}),
  },
  skill: SKILL_VERSION,
  ...(implAt ? { implAt } : {}),
};

if (errors.length) {
  console.error('✖ payload 生成失败：');
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

const node = { nodeKey };
for (const k of ['name', 'category', 'desc', 'pageId', 'pageRoute']) {
  if (sup.node?.[k] !== undefined && sup.node[k] !== '') node[k] = sup.node[k];
}
const payload = { platform: extract.platform, node, profile: { pages }, analysis, source };
fs.writeFileSync(path.resolve(args.out), `${JSON.stringify(payload, null, 2)}\n`);

const count = pages.reduce((n, p) => n + p.events.length + p.extraEvents.length, 0);
console.log(`✔ payload 已生成 → ${args.out}`);
console.log(`节点 ${nodeKey}（${extract.platform.toUpperCase()}）：${pages.length} 个页面，${count} 个事件`);
console.log(`来源 ${source.repo}@${source.branch ?? '-'} · ${source.commit ?? '-'}，提交人 ${source.submitter.name ?? '-'}${email ? `（${email}）` : '（无邮箱，合入结果将无法通知）'}`);
if (dirty) console.log('⚠ 工作区有未提交改动，commit 标记为 -dirty');
