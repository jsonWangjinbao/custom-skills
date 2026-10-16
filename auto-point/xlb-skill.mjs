#!/usr/bin/env node
// xlb-skill —— XLB Skills 市场 CLI：安装/更新/上架技能。
// 依赖：Node 18+（内置 fetch）；zip 技能安装需要系统 unzip；publish 打包优先用系统 zip，
// 无 zip 时降级为仅上传 SKILL.md 单文件。
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const HELP = `xlb-skill —— XLB Skills 市场 CLI

用法:
  xlb-skill install <slug> [--target qoder|claude|codex|all] [--dir <目录>] [--base <url>] [--force]
  xlb-skill update <slug> [--target qoder|claude|codex|all] [--dir <目录>] [--base <url>]
  xlb-skill publish <本地skill目录> [--name 覆盖名] [--desc 简介] [--tags a,b] [--category 场景分类] [--base <url>]
  xlb-skill list [--base <url>]

选项:
  --base <url>   市场站点地址，默认取环境变量 XLB_MARKET_BASE 或 http://localhost:4174
  --target       安装目标平台：qoder（~/.qoder/skills，默认）| claude（~/.claude/skills）| codex（~/.codex/skills）| all（检测本机已存在的目标逐个安装）
  --dir <目录>   自定义安装目录（优先于 --target，可用于其他未内置的工作台）
  --force        目标目录已存在时先删除再安装（等价于 update）
  --category     场景分类（上架必选）：需求与设计 / 开发实现 / 质量保障 / 测试验收 / 构建发布与规范 / 性能与优化 / 数据与埋点 / 协作与文档 / 环境与工具 / 办公效率
  -h, --help     显示帮助

示例:
  xlb-skill install pdf-toolkit --base https://your-site.example.com
  xlb-skill install pdf-toolkit --target claude
  xlb-skill update pdf-toolkit --base https://your-site.example.com
  xlb-skill publish ~/.qoder/skills/my-tool --name 我的工具 --tags 提效,自动化
`;

// 平台 → 技能目录映射；其他未统一目录形态的工作台走 --dir 自定义兜底。
const TARGET_ROOTS = {
  qoder: () => path.join(os.homedir(), '.qoder', 'skills'),
  claude: () => path.join(os.homedir(), '.claude', 'skills'),
  codex: () => path.join(os.homedir(), '.codex', 'skills'),
};
const PLATFORM_LABEL = { qoder: 'Qoder', claude: 'Claude Code', codex: 'Codex' };

function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const item = argv[i];
    if (item === '--base') args.base = argv[(i += 1)];
    else if (item === '--target') args.target = argv[(i += 1)];
    else if (item === '--dir') args.dir = argv[(i += 1)];
    else if (item === '--name') args.name = argv[(i += 1)];
    else if (item === '--desc') args.desc = argv[(i += 1)];
    else if (item === '--tags') args.tags = argv[(i += 1)];
    else if (item === '--category') args.category = argv[(i += 1)];
    else if (item === '--force') args.force = true;
    else if (item === '-h' || item === '--help') args.help = true;
    else args._.push(item);
  }
  return args;
}

function resolveBase(args) {
  return (args.base || process.env.XLB_MARKET_BASE || 'http://localhost:4174').replace(/\/$/, '');
}

// 解析安装目标列表：--dir 优先；--target all 检测已存在的平台目录（都不存在时回退 qoder）。
function resolveInstallRoots(args) {
  if (args.dir) return [{ platform: 'custom', root: path.resolve(args.dir) }];
  const target = args.target || 'qoder';
  if (target === 'all') {
    const existed = Object.entries(TARGET_ROOTS)
      .map(([platform, resolve]) => ({ platform, root: resolve() }))
      .filter((item) => fs.existsSync(item.root));
    return existed.length ? existed : [{ platform: 'qoder', root: TARGET_ROOTS.qoder() }];
  }
  if (!TARGET_ROOTS[target]) throw new Error(`未知 target "${target}"，可选 qoder|claude|codex|all，或用 --dir 自定义目录。`);
  return [{ platform: target, root: TARGET_ROOTS[target]() }];
}

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`请求失败 ${res.status}: ${url}`);
  return res.json();
}

async function download(url, dest) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`下载失败 ${res.status}: ${url}`);
  fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
}

function platformFlags(skill) {
  const platforms = Array.isArray(skill.platforms) && skill.platforms.length ? [...skill.platforms] : ['qoder', 'claude', 'codex'];
  // 旧版全平台标记为 ['qoder','claude']，等价于含 Codex 的全平台，避免安装到 Codex 时误报警告。
  if (platforms.includes('qoder') && platforms.includes('claude') && !platforms.includes('codex')) platforms.push('codex');
  return platforms;
}

function platformBadge(skill) {
  return platformFlags(skill).length >= 2 ? '' : '  [仅Qoder]';
}

async function cmdList(args) {
  const base = resolveBase(args);
  const data = await fetchJson(`${base}/api/market/skills`);
  const skills = data.skills || [];
  if (!skills.length) {
    console.log('市场暂无技能。');
    return;
  }
  for (const skill of skills) {
    const flag = skill.fileUrl ? '' : '  [无文件]';
    console.log(`${skill.slug.padEnd(24)} ${skill.name}  (⬇${skill.downloads} ★${skill.stars})${platformBadge(skill)}${flag}`);
  }
}

// 安装到单个目标目录；返回最终安装路径。
async function installToRoot({ base, skill, root, force }) {
  const slug = skill.slug;
  const targetDir = path.join(root, slug);
  const existed = fs.existsSync(targetDir);
  if (existed) {
    if (!force) return { targetDir, skipped: true };
    fs.rmSync(targetDir, { recursive: true, force: true });
  }
  fs.mkdirSync(targetDir, { recursive: true });

  const ext = path.extname(skill.fileUrl).toLowerCase();
  const tmp = path.join(os.tmpdir(), `xlb-skill-${slug}-${Date.now()}${ext}`);
  await download(`${base}${skill.fileUrl}`, tmp);

  if (ext === '.zip') {
    try {
      execFileSync('unzip', ['-o', tmp, '-d', targetDir], { stdio: 'ignore' });
    } catch {
      fs.rmSync(tmp, { force: true });
      throw new Error('解压失败，请确认系统已安装 unzip 命令。');
    }
    // zip 内若自带单个顶层目录（如 <slug>/SKILL.md），需上提一层，
    // 否则 SKILL.md 位于 targetDir/<slug>/ 下，宿主扫不到该技能。
    flattenSingleTopDir(targetDir);
  } else {
    fs.copyFileSync(tmp, path.join(targetDir, 'SKILL.md'));
  }
  fs.rmSync(tmp, { force: true });

  // 安装校验：SKILL.md 必须直接位于技能根目录，否则视为安装失败并回滚。
  if (!fs.existsSync(path.join(targetDir, 'SKILL.md'))) {
    fs.rmSync(targetDir, { recursive: true, force: true });
    throw new Error('安装包内未找到 SKILL.md（应位于技能根目录），已回滚，请检查上传的 zip 结构。');
  }
  return { targetDir, skipped: false, existed };
}

async function cmdInstall(args) {
  const base = resolveBase(args);
  const slug = args._[1];
  if (!slug) throw new Error('缺少 <slug>，用法: xlb-skill install <slug>');

  const data = await fetchJson(`${base}/api/market/skills`);
  const skill = (data.skills || []).find((item) => item.slug === slug);
  if (!skill) throw new Error(`未找到 slug 为 "${slug}" 的技能，可先运行 xlb-skill list 查看。`);
  if (!skill.fileUrl) throw new Error(`技能 "${skill.name}" 未上传文件，无法安装。`);

  const roots = resolveInstallRoots(args);
  // 平台校验提示：skill 标记了平台范围而目标不在其中时给出警告（仍继续安装，纯提示词可能可用）。
  const supported = platformFlags(skill);
  console.log(`↓ 下载 ${skill.name} ...`);
  const results = [];
  for (const item of roots) {
    if (item.platform !== 'custom' && !supported.includes(item.platform)) {
      console.log(`⚠ 「${skill.name}」标记为 ${supported.map((p) => PLATFORM_LABEL[p] || p).join('/')} 专用，安装到 ${PLATFORM_LABEL[item.platform] || item.platform} 后部分能力（如插件 hooks 引用）可能静默失效。`);
    }
    const result = await installToRoot({ base, skill, root: item.root, force: Boolean(args.force) });
    results.push({ ...result, platform: item.platform });
  }

  // 计入一次安装（失败不影响安装结果）
  try {
    await fetch(`${base}/api/market/skills/${slug}/download`, { method: 'POST' });
  } catch {
    /* 忽略计数失败 */
  }

  for (const result of results) {
    const label = result.platform === 'custom' ? result.targetDir : `${PLATFORM_LABEL[result.platform] || result.platform}（${result.targetDir}）`;
    if (result.skipped) {
      console.log(`「${skill.name}」已安装在 ${label}，未做改动。`);
      console.log(`  如需更新到最新版，请执行: xlb-skill update ${slug} --base ${base}`);
    } else {
      console.log(result.existed ? `✓ 已更新到 ${label}` : `✓ 已安装到 ${label}`);
    }
  }
  console.log('  重启或重载对应工作台后即可在技能列表看到该 Skill。');
}

// 若目录下只有一个顶层子目录且其中包含 SKILL.md，则把内容上提到 targetDir。
function flattenSingleTopDir(targetDir) {
  if (fs.existsSync(path.join(targetDir, 'SKILL.md'))) return;
  const entries = fs
    .readdirSync(targetDir)
    .filter((name) => name !== '__MACOSX' && !name.startsWith('.'));
  if (entries.length !== 1) return;
  const inner = path.join(targetDir, entries[0]);
  if (!fs.statSync(inner).isDirectory()) return;
  if (!fs.existsSync(path.join(inner, 'SKILL.md'))) return;
  for (const name of fs.readdirSync(inner)) {
    fs.renameSync(path.join(inner, name), path.join(targetDir, name));
  }
  fs.rmdirSync(inner);
}

// ---------- publish：本地 skill 一键上架（预填链接 + 浏览器确认，零新鉴权面） ----------

// 从 SKILL.md frontmatter 提取 name/description；frontmatter 缺失时回退到首个一级标题。
function parseSkillMeta(skillMd) {
  const meta = {};
  const fm = skillMd.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (fm) {
    for (const line of fm[1].split(/\r?\n/)) {
      const match = line.match(/^([a-zA-Z_-]+):\s*(.+)$/);
      if (!match) continue;
      const key = match[1].trim().toLowerCase();
      if (key === 'name' || key === 'description') meta[key] = match[2].trim().replace(/^["']|["']$/g, '');
    }
  }
  if (!meta.name) {
    const heading = skillMd.match(/^#\s+(.+)$/m);
    if (heading) meta.name = heading[1].trim();
  }
  return meta;
}

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'skill';
}

// 打包 skill 目录为 zip（排除隐藏文件与 node_modules）；无系统 zip 时返回 null 由调用方降级。
function packSkillDir(dir, outFile) {
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.rmSync(outFile, { force: true });
  try {
    execFileSync('zip', ['-r', '-q', outFile, '.', '-x', '.*', 'node_modules/*', '__MACOSX/*'], { cwd: dir, stdio: 'ignore' });
    return outFile;
  } catch {
    return null;
  }
}

function openBrowser(url) {
  const cmd = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'cmd' : 'xdg-open';
  const cmdArgs = process.platform === 'win32' ? ['/c', 'start', '', url] : [url];
  try {
    execFileSync(cmd, cmdArgs, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

async function cmdPublish(args) {
  const base = resolveBase(args);
  const dir = args._[1] ? path.resolve(args._[1]) : '';
  if (!dir || !fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) {
    throw new Error('缺少有效的 <本地skill目录>，用法: xlb-skill publish <目录> [--name 覆盖名]');
  }
  const skillMdPath = path.join(dir, 'SKILL.md');
  if (!fs.existsSync(skillMdPath)) {
    throw new Error(`目录 ${dir} 内未找到 SKILL.md，无法上架。`);
  }

  const meta = parseSkillMeta(fs.readFileSync(skillMdPath, 'utf8'));
  const name = (args.name || meta.name || path.basename(dir)).trim();
  const description = (args.desc || meta.description || '').trim();
  // 打包文件名优先取目录名（通常是 slug 形式）；中文名 slugify 后会被过滤空，目录名更可靠
  const slug = slugify(path.basename(dir)) !== 'skill' ? slugify(path.basename(dir)) : slugify(name);

  // 打包：有 zip 打成 ~/.xlb/publish/<slug>.zip；无 zip 降级为直接使用 SKILL.md 单文件。
  const packed = packSkillDir(dir, path.join(os.homedir(), '.xlb', 'publish', `${slug}.zip`));
  const uploadPath = packed || skillMdPath;

  // 预填草稿走 URL 参数（base64url 编码 JSON，控制在 2KB 内），浏览器端确认后提交。
  const draft = {
    name,
    description,
    tags: (args.tags || '').split(/[,，]/).map((tag) => tag.trim()).filter(Boolean).slice(0, 4),
    category: (args.category || '').trim(),
  };
  const encoded = Buffer.from(JSON.stringify(draft), 'utf8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  if (encoded.length > 1800) {
    throw new Error('草稿内容过长（名称/简介/标签合计超出 URL 安全长度），请精简后重试或直接在网页表单填写。');
  }
  const url = `${base}/?view=marketplace&publishDraft=${encoded}`;

  console.log(`✓ 已生成上架草稿「${name}」`);
  console.log(`  打包文件: ${uploadPath}${packed ? '' : '（系统无 zip 命令，降级为 SKILL.md 单文件）'}`);
  console.log(`  确认链接: ${url}`);
  if (openBrowser(url)) {
    console.log('  已在浏览器打开预填表单：请核对信息，选择上方打包文件后点击「发布到市场」。');
  } else {
    console.log('  请手动复制链接到浏览器打开，核对信息并选择打包文件后提交。');
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const command = args._[0];
  if (args.help || !command) {
    console.log(HELP);
    return;
  }
  if (command === 'install') await cmdInstall(args);
  else if (command === 'update') {
    args.force = true;
    await cmdInstall(args);
  }
  else if (command === 'publish') await cmdPublish(args);
  else if (command === 'list') await cmdList(args);
  else {
    console.error(`未知命令: ${command}\n`);
    console.log(HELP);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(`✗ ${error.message || error}`);
  process.exit(1);
});
