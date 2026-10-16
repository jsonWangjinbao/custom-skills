#!/usr/bin/env node
// extract.mjs —— 从目标项目埋点事件字典提取页面/事件/链条（只读，不改目标项目）。
// 需要 TS 运行时：npx -y tsx <skill>/scripts/extract.mjs --root <项目根> --platform rn|pc --out <extract.json>
// 可选：--tracking-dir <相对路径>（默认 PC=src/tracking/business，RN=src/tracking）
//
// 识别规则（按导出值形状，不依赖命名）：
// - 页面：含 pageCode/pageName/pagePath 的对象（每个字典文件恰好 1 个）
// - 字典版本：名称以 EVENT_VER 结尾的 semver 字符串
// - 事件字典：值全部为 TrackEventDef 的对象；含 view+enter 事件的为清单事件，其余字典（EXTRA/REPORT 等）并入清单外补充
// - 单个 TrackEventDef 导出（PAGE_LEAVE）跳过：看板侧派生，不入配置
// - 链条：含 chainId + idleTimeout 的对象；nodeKey = orderType ?? chainId
// - 页面 → 链条：仅 1 条链条时全部归属；多条时解析入口文件 register({ page: X, chain: Y }) 配对，未配对的标 null
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, a, i, arr) => {
    if (a.startsWith('--')) acc.push([a.slice(2), arr[i + 1]?.startsWith('--') ? 'true' : (arr[i + 1] ?? 'true')]);
    return acc;
  }, []),
);
const fail = (msg) => {
  console.error(`✖ ${msg}`);
  process.exit(1);
};
if (!args.root || !['pc', 'rn'].includes(args.platform) || !args.out) {
  fail('用法：npx -y tsx extract.mjs --root <项目根> --platform rn|pc --out <extract.json> [--tracking-dir <dir>]');
}

const root = path.resolve(args.root);
const trackingDir = path.join(root, args['tracking-dir'] ?? (args.platform === 'pc' ? 'src/tracking/business' : 'src/tracking'));
const eventsDir = path.join(trackingDir, 'events');
if (!fs.existsSync(eventsDir)) fail(`未找到事件字典目录：${path.relative(root, eventsDir)}（可用 --tracking-dir 指定）`);

const isTsSource = (f) => /\.tsx?$/.test(f) && !/\.d\.ts$|\.test\.tsx?$/.test(f) && !/^index\.tsx?$/.test(path.basename(f));
const isObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const isEventDef = (v) =>
  isObj(v) && typeof v.code === 'string' && typeof v.name === 'string' && ['view', 'click', 'chain'].includes(v.type) && typeof v.step === 'string';
const isEventDict = (v) => isObj(v) && Object.keys(v).length > 0 && Object.values(v).every(isEventDef);
const isPage = (v) => isObj(v) && ['pageCode', 'pageName', 'pagePath'].every((k) => typeof v[k] === 'string');
const isChain = (v) => isObj(v) && typeof v.chainId === 'string' && typeof v.idleTimeout === 'number';
const SEMVER = /^\d+\.\d+\.\d+$/;

/** 只保留看板 TrackEventCfg 认可的字段；false/空值省略 */
const pickEvent = (e) => ({
  code: e.code,
  name: e.name,
  type: e.type,
  step: e.step,
  ...(e.regressive ? { regressive: true } : {}),
  ...(e.terminal ? { terminal: true } : {}),
  ...(typeof e.qingniaoId === 'string' && e.qingniaoId.trim() ? { qingniaoId: e.qingniaoId.trim() } : {}),
});

const rel = (f) => path.relative(root, f);
const load = async (file) => {
  try {
    return await import(pathToFileURL(file).href);
  } catch (e) {
    fail(`加载 ${rel(file)} 失败：${e.message}`);
  }
};

const warnings = [];

// ── 链条 ──
const chainFiles = [];
const chainsTs = ['chains.ts', 'chains.tsx'].map((f) => path.join(trackingDir, f)).find((f) => fs.existsSync(f));
if (chainsTs) chainFiles.push(chainsTs);
const chainsDir = path.join(trackingDir, 'chains');
if (fs.existsSync(chainsDir)) {
  chainFiles.push(...fs.readdirSync(chainsDir).map((f) => path.join(chainsDir, f)).filter(isTsSource));
}
const chains = [];
for (const file of chainFiles) {
  const mod = await load(file);
  for (const [exportName, v] of Object.entries(mod)) {
    if (isChain(v)) {
      chains.push({ file: rel(file), exportName, chainId: v.chainId, orderType: v.orderType ?? null, nodeKey: v.orderType ?? v.chainId });
    }
  }
}
if (!chains.length) fail(`未找到链条定义（${rel(trackingDir)}/chains.ts 或 chains/*.ts 中含 chainId + idleTimeout 的导出）`);

// ── 页面 → 链条配对（多链条时解析 register 调用） ──
const pageChain = new Map();
if (chains.length > 1) {
  const entry = ['index.ts', 'index.tsx'].map((f) => path.join(trackingDir, f)).find((f) => fs.existsSync(f));
  const src = entry ? fs.readFileSync(entry, 'utf8') : '';
  for (const m of src.matchAll(/\{[^{}]*?\bpage:\s*(\w+)[^{}]*?\bchain:\s*(\w+)[^{}]*?\}/g)) {
    pageChain.set(m[1], m[2]);
  }
}

// ── 页面字典 ──
const pages = [];
for (const file of fs.readdirSync(eventsDir).map((f) => path.join(eventsDir, f)).filter(isTsSource).sort()) {
  const mod = await load(file);
  const entries = Object.entries(mod);
  const pageExports = entries.filter(([, v]) => isPage(v));
  if (pageExports.length !== 1) {
    warnings.push(`${rel(file)}：页面定义导出 ${pageExports.length} 个（应为 1），已跳过该文件`);
    continue;
  }
  const [pageExport, page] = pageExports[0];
  const verExport = entries.find(([k, v]) => /EVENT_VER$/.test(k) && typeof v === 'string');
  if (!verExport || !SEMVER.test(verExport[1])) fail(`${rel(file)}：缺少 semver 格式的 *_EVENT_VER 导出`);

  const dicts = entries.filter(([, v]) => isEventDict(v));
  const hasPageView = ([, v]) => Object.values(v).some((e) => e.type === 'view' && e.step === 'enter');
  const primary = dicts.filter(hasPageView);
  if (primary.length > 1) fail(`${rel(file)}：多个事件字典含 PAGE_VIEW（${primary.map(([k]) => k).join('、')}），无法判定清单事件`);
  const extras = dicts.filter((d) => d !== primary[0]);
  const folded = extras.map(([k]) => k).filter((k) => !/EXTRA/.test(k));
  if (folded.length) warnings.push(`${rel(file)}：${folded.join('、')} 并入清单外补充（extraEvents）`);
  if (!primary.length) warnings.push(`${rel(file)}：无含 PAGE_VIEW 的字典，看板合入时将自动补 view 事件`);

  const events = primary.length ? Object.values(primary[0][1]).map(pickEvent) : [];
  const extraEvents = extras.flatMap(([, v]) => Object.values(v).map(pickEvent));
  const seen = new Set();
  for (const e of [...events, ...extraEvents]) {
    if (seen.has(e.code)) fail(`${rel(file)}：页面内事件码重复 ${e.code}`);
    seen.add(e.code);
  }

  const chainExport = chains.length === 1 ? chains[0].exportName : (pageChain.get(pageExport) ?? null);
  const chain = chains.find((c) => c.exportName === chainExport) ?? null;
  if (!chain) warnings.push(`${rel(file)}：未能确定 ${pageExport} 归属的链条，需人工指定`);

  pages.push({
    file: rel(file),
    pageExport,
    pageCode: page.pageCode,
    pageName: page.pageName,
    pagePath: page.pagePath,
    eventVer: verExport[1],
    nodeKey: chain?.nodeKey ?? null,
    events,
    extraEvents,
    terminalEvents: [...events, ...extraEvents].filter((e) => e.terminal).map((e) => e.code),
  });
}
if (!pages.length) fail(`${rel(eventsDir)} 下未提取到任何页面字典`);

const out = {
  root,
  platform: args.platform,
  trackingDir: rel(trackingDir),
  extractedAt: new Date().toISOString(),
  chains,
  pages,
  warnings,
};
fs.mkdirSync(path.dirname(path.resolve(args.out)), { recursive: true });
fs.writeFileSync(path.resolve(args.out), `${JSON.stringify(out, null, 2)}\n`);

console.log(`✔ 提取完成 → ${args.out}`);
console.log(`链条：${chains.map((c) => `${c.nodeKey}（${c.exportName}）`).join('、')}`);
for (const p of pages) {
  console.log(
    `页面 ${p.pageCode}「${p.pageName}」 v${p.eventVer} → ${p.nodeKey ?? '未归属'}：清单 ${p.events.length} / 补充 ${p.extraEvents.length}` +
      (p.terminalEvents.length ? `，终态事件 ${p.terminalEvents.join('、')}` : ''),
  );
}
for (const w of warnings) console.log(`⚠ ${w}`);
