#!/usr/bin/env node
// submit.mjs —— 与看板同步接口交互（Node 18+，内置 fetch，无三方依赖）。
//   node submit.mjs dry-run --payload <payload.json> [--board-url <url>]   预检：返回与现网节点的 diff，不落库
//   node submit.mjs submit  --payload <payload.json>                        正式提交：沿用 dry-run 锁定的看板地址，payload 必须与 dry-run 一致
//   node submit.mjs status  --record <submission.json>                      查询审核结果
//
// 令牌：v1 与看板代码约定固定值，不需要开发者配置；它不是安全秘密，只用于拒绝无意请求。
// 地址：--board-url > 配置文件 XLB_CHAIN_BOARD_URL > 环境变量 XLB_CHAIN_BOARD_URL（显式，不回退）> 自动判断
//   自动判断：ping 线上 → 200 用线上；404/网络错误 → 回退 localhost:3001；401 表示 skill/看板版本不一致，直接报错
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const ONLINE_URL = 'https://xlb-chain-board--scm.ali-dev.xlbsoft.com';
const LOCAL_URL = 'http://localhost:3001';
const FIXED_SYNC_TOKEN = 'xlb-chain-board-auto-point-sync-v1';
const CONFIG_FILE = path.join(os.homedir(), '.config', 'xlb', 'chain-board.env');

const [cmd, ...rest] = process.argv.slice(2);
const args = Object.fromEntries(
  rest.reduce((acc, a, i, arr) => {
    if (a.startsWith('--')) acc.push([a.slice(2), arr[i + 1] ?? 'true']);
    return acc;
  }, []),
);
const fail = (msg) => {
  console.error(`✖ ${msg}`);
  process.exit(1);
};
const readJson = (f) => {
  try {
    return JSON.parse(fs.readFileSync(f, 'utf8'));
  } catch (e) {
    fail(`读取 ${f} 失败：${e.message}`);
  }
};
const writeJson = (f, v) => fs.writeFileSync(f, `${JSON.stringify(v, null, 2)}\n`);

/** 递归按 key 排序序列化（payload 指纹：dry-run 与 submit 必须一致） */
const stable = (v) =>
  Array.isArray(v)
    ? `[${v.map(stable).join(',')}]`
    : v && typeof v === 'object'
      ? `{${Object.keys(v).sort().map((k) => `${JSON.stringify(k)}:${stable(v[k])}`).join(',')}}`
      : JSON.stringify(v ?? null);
const hashOf = (payload) => crypto.createHash('sha256').update(stable(payload)).digest('hex');

// ── 配置 ──
function loadConfig() {
  const file = {};
  if (fs.existsSync(CONFIG_FILE)) {
    const mode = fs.statSync(CONFIG_FILE).mode & 0o077;
    if (mode) console.log(`⚠ ${CONFIG_FILE} 权限过宽，建议 chmod 600`);
    for (const line of fs.readFileSync(CONFIG_FILE, 'utf8').split(/\r?\n/)) {
      const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/.exec(line);
      if (m) file[m[1]] = m[2].replace(/^(['"])(.*)\1$/, '$2');
    }
  }
  let explicit = null;
  if (args['board-url'] && args['board-url'] !== 'true') explicit = { url: args['board-url'], source: '对话指定（--board-url）' };
  else if (file.XLB_CHAIN_BOARD_URL) explicit = { url: file.XLB_CHAIN_BOARD_URL, source: `配置文件 ${CONFIG_FILE}` };
  else if (process.env.XLB_CHAIN_BOARD_URL) explicit = { url: process.env.XLB_CHAIN_BOARD_URL, source: '环境变量 XLB_CHAIN_BOARD_URL' };
  if (explicit) explicit.url = explicit.url.replace(/\/+$/, '');
  return { token: FIXED_SYNC_TOKEN, explicit };
}

async function request(baseUrl, token, method, apiPath, body) {
  let res;
  try {
    res = await fetch(`${baseUrl}${apiPath}`, {
      method,
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(method === 'GET' ? 10_000 : 30_000),
    });
  } catch (e) {
    return { ok: false, status: 0, error: `网络错误：${e.cause?.code ?? e.name ?? ''} ${e.message}`.trim() };
  }
  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    // 非 JSON（网关页、Next 404 页）
  }
  if (res.ok && json?.success) return { ok: true, status: res.status, data: json.data };
  return {
    ok: false,
    status: res.status,
    code: json?.code,
    error: json?.error ?? `HTTP ${res.status}（非接口响应）`,
    requestId: json?.requestId,
  };
}

/** ping 结果分类：ok / fatal（skill/看板版本不一致，不回退）/ unavailable（可回退） */
async function ping(url, token) {
  const r = await request(url, token, 'GET', '/api/sync/ping');
  if (r.ok) return { kind: 'ok' };
  if (r.status === 401) return { kind: 'fatal', reason: `${url} 拒绝固定令牌（401）：skill 与看板版本不一致，请同步更新后重试` };
  if (r.status === 404) return { kind: 'unavailable', reason: `${url} 未部署同步接口（404）` };
  return { kind: 'unavailable', reason: `${url} 不可用：${r.error}` };
}

async function resolveBoard({ token, explicit }) {
  if (explicit) {
    const p = await ping(explicit.url, token);
    if (p.kind !== 'ok') fail(`${p.reason}\n（地址来自${explicit.source}，显式指定时不回退）`);
    return { url: explicit.url, source: explicit.source };
  }
  const tried = [];
  for (const url of [ONLINE_URL, LOCAL_URL]) {
    const p = await ping(url, token);
    if (p.kind === 'ok') {
      return { url, source: tried.length ? `自动判断（${tried.join('；')}，已回退本地）` : '自动判断（线上）' };
    }
    if (p.kind === 'fatal') fail(tried.length ? `${p.reason}\n（此前：${tried.join('；')}）` : p.reason);
    tried.push(p.reason);
  }
  fail(`看板均不可用：\n  - ${tried.join('\n  - ')}\n如需指定地址：在对话中说明，或在 ${CONFIG_FILE} 写入 XLB_CHAIN_BOARD_URL=<地址>`);
}

const printFailure = (label, r) =>
  fail(`${label}失败（HTTP ${r.status}）：${r.error}${r.requestId ? `（requestId ${r.requestId}）` : ''}`);

// ── diff 摘要（门禁展示用） ──
const FIELD = {
  name: '节点标题', category: '节点分类', desc: '节点描述', pageId: '页面标识', pageRoute: '页面路由', tracked: '已接入',
  stepOrder: '漏斗环节顺序', stepNames: '环节名称', stateNames: '单据状态名称', intentSteps: '意图环节',
};
const CHANGE = { added: '新增', modified: '变更', removed: '删除', unchanged: '无变化', dbOnly: '库内独有（保留）' };
const fmt = (v) => (v === null || v === undefined ? '（空）' : typeof v === 'string' ? v : JSON.stringify(v));

function printDiff(board, data) {
  const d = data.diff;
  console.log(`看板：${board.url}（${board.source}）`);
  console.log(`类型：${d.kind === 'create' ? '新建节点' : '更新节点'}${d.hasChanges ? '' : '（与现网一致，无变化）'}`);
  const s = d.summary;
  console.log(
    `变更：页面 +${s.pagesAdded} ~${s.pagesModified}（库内独有 ${s.pagesDbOnly}），事件 +${s.eventsAdded} ~${s.eventsModified} -${s.eventsRemoved}`,
  );
  if (d.warnings.length) {
    console.log('告警：');
    for (const w of d.warnings) console.log(`  ⚠ ${w}`);
  }
  const fields = [...d.nodeFields, ...d.analysis];
  if (fields.length) {
    console.log('节点字段 / 分析口径：');
    for (const c of fields) {
      console.log(`  - ${FIELD[c.field] ?? c.field}：${fmt(c.from)} → ${fmt(c.to)}${c.defaultApplied ? '' : '（库内已有值，默认保留，审核人可勾选覆盖）'}`);
    }
  }
  console.log('页面：');
  for (const p of d.pages) {
    console.log(`  - ${p.pageName}（${p.pageCode}）${CHANGE[p.change]}，版本 ${p.eventVer.db ?? '-'} → ${p.eventVer.code ?? '-'}`);
    if (p.change === 'added') {
      console.log(`      新增事件 ${p.events.length} 个`);
      continue;
    }
    if (p.fields.length) console.log(`      页面级变化：${p.fields.join('、')}`);
    for (const e of p.events) {
      console.log(`      ${CHANGE[e.change]} ${e.code}「${e.name}」${e.fields.length ? `：${e.fields.join('、')}` : ''}`);
    }
  }
  const dv = d.derived;
  console.log(`派生码集：回退 [${dv.regressiveCodes.join(', ')}]，履约完成 [${dv.fulfillCodes.join(', ')}]，终结 [${dv.closeCodes.join(', ')}]`);
}

// ── 命令 ──
async function dryRun() {
  if (!args.payload) fail('用法：node submit.mjs dry-run --payload <payload.json> [--board-url <url>]');
  const payload = readJson(args.payload);
  const cfg = loadConfig();
  const board = await resolveBoard(cfg);
  const r = await request(board.url, cfg.token, 'POST', '/api/sync/node-submissions', { ...payload, dryRun: true });
  if (!r.ok) printFailure('预检', r);
  const out = path.join(path.dirname(path.resolve(args.payload)), 'dry-run.json');
  writeJson(out, { boardUrl: board.url, boardSource: board.source, payloadHash: hashOf(payload), at: new Date().toISOString(), result: r.data });
  printDiff(board, r.data);
  console.log(`\n✔ 预检完成（未落库）→ ${out}`);
}

async function submit() {
  if (!args.payload) fail('用法：node submit.mjs submit --payload <payload.json>');
  const payload = readJson(args.payload);
  const dir = path.dirname(path.resolve(args.payload));
  const dryFile = path.join(dir, 'dry-run.json');
  if (!fs.existsSync(dryFile)) fail('未找到 dry-run.json，请先执行 dry-run 并经用户确认');
  const dry = readJson(dryFile);
  if (dry.payloadHash !== hashOf(payload)) fail('payload 在预检后被修改，请重新 dry-run 并确认');
  const { token } = loadConfig();
  const r = await request(dry.boardUrl, token, 'POST', '/api/sync/node-submissions', { ...payload, dryRun: false });
  if (!r.ok) printFailure('提交', r);
  const record = {
    id: r.data.id,
    status: r.data.status,
    kind: r.data.kind,
    idempotent: r.data.idempotent,
    supersededIds: r.data.supersededIds,
    boardUrl: dry.boardUrl,
    reviewUrl: `${dry.boardUrl}${r.data.reviewPath}`,
    submittedAt: new Date().toISOString(),
  };
  writeJson(path.join(dir, 'submission.json'), record);
  console.log(`✔ 已提交待审核（尚未生效）`);
  console.log(`提交 ID：${record.id}${record.idempotent ? '（与已有待办内容相同，返回原记录）' : ''}`);
  if (record.supersededIds.length) console.log(`已替代旧待办：${record.supersededIds.join('、')}`);
  console.log(`待办链接：${record.reviewUrl}`);
}

async function status() {
  if (!args.record) fail('用法：node submit.mjs status --record <submission.json>');
  const record = readJson(args.record);
  const { token } = loadConfig();
  const r = await request(record.boardUrl, token, 'GET', `/api/sync/node-submissions/${record.id}`);
  if (!r.ok) printFailure('查询', r);
  const LABEL = { pending: '待审核', merged: '已合入（已生效）', rejected: '已驳回', superseded: '已被新提交替代' };
  const d = r.data;
  console.log(`状态：${LABEL[d.status] ?? d.status}`);
  if (d.reviewerName) console.log(`审核人：${d.reviewerName}（${d.reviewedAt}）`);
  if (d.reviewComment) console.log(`${d.status === 'rejected' ? '驳回原因' : '备注'}：${d.reviewComment}`);
  if (d.notifyStatus) console.log(`飞书通知：${d.notifyStatus}${d.notifyError ? `（${d.notifyError}）` : ''}`);
  console.log(`待办链接：${record.boardUrl}${d.reviewPath}`);
  writeJson(args.record, { ...record, status: d.status, checkedAt: new Date().toISOString() });
}

const COMMANDS = { 'dry-run': dryRun, submit, status };
if (!COMMANDS[cmd]) fail('用法：node submit.mjs <dry-run|submit|status> ...');
await COMMANDS[cmd]();
