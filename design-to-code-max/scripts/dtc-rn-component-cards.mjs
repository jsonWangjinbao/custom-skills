#!/usr/bin/env node
/**
 * design-to-code-max · RN 组件能力卡生成器
 *
 * 用法:
 *   node scripts/dtc-rn-component-cards.mjs scan <packageRoot> [--out <dir>] [--gotchas <dir>]
 *
 * 说明:
 *   - packageRoot: @xlb/components-react-native 包根目录（含 package.json 与 src/components）。
 *     必须指向业务项目 node_modules 中实际使用的版本，不要指向组件库源码仓库（版本可能滞后）。
 *   - --out: 能力卡输出目录，默认 <skill>/reference/rn/component-capabilities
 *   - --gotchas: gotchas 目录，默认 <skill>/reference/rn/gotchas
 *   - 每个组件生成一张能力卡（Props 清单从 TS 源码 interface 提取，带 JSDoc 说明与 @default）。
 *   - 卡片 `<!-- MANUAL:BEGIN -->` 标记之后为人工维护区（能力边界/易混淆对比），重跑脚本保留。
 *   - 同时生成 _index.md（组件库使用清单），供 audit 阶段 Step 5 选型引用。
 *
 * 退出码: 成功 0；参数/解析错误 1
 */
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const [command, packageRootArg] = process.argv.slice(2);
const flagArgs = process.argv.slice(3);

function getFlag(name, fallback = "") {
  const index = flagArgs.indexOf(name);
  return index >= 0 && flagArgs[index + 1] ? flagArgs[index + 1] : fallback;
}

function fail(message) {
  console.error(JSON.stringify({ ok: false, error: message }));
  process.exit(1);
}

if (command !== "scan" || !packageRootArg) {
  fail(
    "Usage: node dtc-rn-component-cards.mjs scan <packageRoot> [--out <dir>] [--gotchas <dir>]",
  );
}

const skillRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const packageRoot = path.resolve(packageRootArg);
const outDir = path.resolve(
  getFlag("--out", path.join(skillRoot, "reference/rn/component-capabilities")),
);
const gotchasDir = path.resolve(
  getFlag("--gotchas", path.join(skillRoot, "reference/rn/gotchas")),
);

const componentsDir = path.join(packageRoot, "src/components");
if (!fs.existsSync(componentsDir)) {
  fail(`组件目录不存在: ${componentsDir}`);
}
const pkg = JSON.parse(
  fs.readFileSync(path.join(packageRoot, "package.json"), "utf8"),
);
const pkgVersion = pkg.version ?? "unknown";

// ---------- TS 源码提取工具 ----------

/** 从 source 的 startIndex（指向 '{'）开始做括号平衡，返回块结束位置（'}' 的下一位）。 */
function matchBlock(source, startIndex) {
  let depth = 0;
  let i = startIndex;
  let inString = null; // ' " `
  let inLineComment = false;
  let inBlockComment = false;
  while (i < source.length) {
    const ch = source[i];
    const next = source[i + 1];
    if (inLineComment) {
      if (ch === "\n") inLineComment = false;
    } else if (inBlockComment) {
      if (ch === "*" && next === "/") {
        inBlockComment = false;
        i++;
      }
    } else if (inString) {
      if (ch === "\\") i++;
      else if (ch === inString) inString = null;
    } else if (ch === "/" && next === "/") {
      inLineComment = true;
      i++;
    } else if (ch === "/" && next === "*") {
      inBlockComment = true;
      i++;
    } else if (ch === "'" || ch === '"' || ch === "`") {
      inString = ch;
    } else if (ch === "{") {
      depth++;
    } else if (ch === "}") {
      depth--;
      if (depth === 0) return i + 1;
    }
    i++;
  }
  return -1;
}

/** 提取文件中所有 `export interface Xxx` / `export type Xxx =` 声明块（含 extends 子句）。 */
function extractDeclarations(source) {
  const decls = [];
  const re = /export\s+(interface|type)\s+([A-Za-z_$][\w$]*)([^{=]*?)(\{|=)/g;
  let m;
  while ((m = re.exec(source)) !== null) {
    const [, kind, name, clause, opener] = m;
    const extendsMatch = clause.match(/extends\s+(.+)/);
    const extendsText = extendsMatch ? extendsMatch[1].trim() : "";
    if (opener === "{") {
      const braceIndex = source.indexOf("{", m.index);
      const end = matchBlock(source, braceIndex);
      if (end > 0) {
        decls.push({
          kind,
          name,
          body: source.slice(braceIndex, end),
          start: m.index,
          extendsText,
        });
        re.lastIndex = end;
      }
    } else {
      // export type X = ...;  取到分号为止（跨行）
      let i = m.index;
      let depth = 0;
      while (i < source.length) {
        const ch = source[i];
        if ("({[<".includes(ch)) depth++;
        else if (")}]>".includes(ch)) depth--;
        else if (ch === ";" && depth <= 0) break;
        i++;
      }
      decls.push({
        kind,
        name,
        body: source.slice(m.index, i + 1),
        start: m.index,
        inline: true,
        extendsText,
      });
      re.lastIndex = i + 1;
    }
  }
  return decls;
}

/** 解析 JSDoc 注释块，返回 { description, defaultValue, deprecated }。 */
function parseJsdoc(raw) {
  const lines = raw
    .replace(/^\/\*\*|\*\/$/g, "")
    .split("\n")
    .map((l) => l.replace(/^\s*\*\s?/, "").trim());
  const descLines = [];
  let defaultValue = "";
  let deprecated = false;
  for (const line of lines) {
    if (line.startsWith("@default")) {
      defaultValue = line.replace(/^@default\s*/, "").trim();
    } else if (line.startsWith("@deprecated")) {
      deprecated = true;
      const note = line.replace(/^@deprecated\s*/, "").trim();
      if (note) descLines.push(`⚠️ 已废弃：${note}`);
    } else if (!line.startsWith("@") && line) {
      descLines.push(line);
    }
  }
  return { description: descLines.join(" ").trim(), defaultValue, deprecated };
}

/** 解析 interface 块体内的 props 行。 */
function parseProps(interfaceBody) {
  // 去掉首尾花括号
  const inner = interfaceBody.trim().replace(/^\{/, "").replace(/\}$/, "");
  const lines = inner.split("\n");
  const props = [];
  let pendingJsdoc = null;
  let collecting = null; // { name, optional, typeLines }
  let depth = 0;

  function flush() {
    if (!collecting) return;
    const type = collecting.typeLines
      .join(" ")
      .replace(/\s+/g, " ")
      .replace(/;$/, "")
      .trim();
    const doc = pendingJsdoc
      ? parseJsdoc(pendingJsdoc)
      : { description: "", defaultValue: "", deprecated: false };
    props.push({
      name: collecting.name,
      optional: collecting.optional,
      type,
      description: doc.description,
      defaultValue: doc.defaultValue,
      deprecated: doc.deprecated,
    });
    collecting = null;
    pendingJsdoc = null;
  }

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!collecting) {
      if (line.startsWith("/**")) {
        pendingJsdoc = line.endsWith("*/") ? line : line;
        if (!line.endsWith("*/")) {
          // 多行 JSDoc：继续吞直到 */
          let idx = lines.indexOf(rawLine);
          // 用标记法在主循环里处理，见下方 inJsdoc 逻辑——简化为在此处不累加，主循环逐行都会进入此分支
        }
        if (line.endsWith("*/")) {
          // 单行 JSDoc
        }
        continue;
      }
      if (line.startsWith("*") || line.startsWith("*/")) {
        if (pendingJsdoc != null) pendingJsdoc += "\n" + line;
        continue;
      }
      if (line === "" || line.startsWith("//")) continue;
      const m = line.match(/^([a-zA-Z_$][\w$]*)(\?)?\s*:\s*(.*)$/);
      if (m) {
        collecting = { name: m[1], optional: !!m[2], typeLines: [m[3]] };
        depth = 0;
        for (const ch of m[3]) {
          if ("({[<".includes(ch)) depth++;
          else if (")}]>".includes(ch)) depth--;
        }
        if (depth <= 0 && m[3].trimEnd().endsWith(";")) flush();
      }
      // 索引签名/调用签名等无法匹配行直接跳过
    } else {
      collecting.typeLines.push(line);
      for (const ch of line) {
        if ("({[<".includes(ch)) depth++;
        else if (")}]>".includes(ch)) depth--;
      }
      if (depth <= 0 && line.endsWith(";")) flush();
    }
  }
  flush();
  return props;
}

/** 类型简写：过长类型收敛，保留可读性。 */
function shortenType(type) {
  if (type.length <= 72) return type.replace(/\|/g, "\\|");
  if (type.includes("=>")) {
    const sig = type.slice(0, type.indexOf("=>") + 2);
    return `${sig} …`.replace(/\|/g, "\\|");
  }
  return `${type.slice(0, 69)}…`.replace(/\|/g, "\\|");
}

function escapeCell(text) {
  return (text || "").replace(/\|/g, "\\|").replace(/\n/g, " ");
}

// ---------- gotchas 关联 ----------

function collectGotchaFiles(dir) {
  const files = [];
  if (!fs.existsSync(dir)) return files;
  const walk = (d) => {
    for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
      const full = path.join(d, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith(".md")) files.push(full);
    }
  };
  walk(dir);
  return files;
}

function matchGotchas(componentName, gotchaFiles) {
  const bare = componentName.replace(/^Xlb/, "");
  const hits = [];
  for (const file of gotchaFiles) {
    const content = fs.readFileSync(file, "utf8");
    // 内容匹配大小写敏感（避免 type="selector" 之类误报）；文件名忽略大小写兜底
    const reExact = new RegExp(`\\b${componentName}\\b`);
    const reBare = new RegExp(`\\b${bare}\\b`);
    const reFile = new RegExp(bare, "i");
    if (
      reExact.test(content) ||
      reBare.test(content) ||
      reFile.test(path.basename(file))
    ) {
      // 保留相对 gotchas 根目录的子路径（component-library / rn-quirks / ...）
      hits.push(path.relative(gotchasDir, file).replace(/\.md$/, ""));
    }
  }
  return hits;
}

// ---------- 主流程 ----------

const gotchaFiles = collectGotchaFiles(gotchasDir);
const componentDirs = fs
  .readdirSync(componentsDir, { withFileTypes: true })
  .filter((e) => e.isDirectory() && /^Xlb[A-Z]/.test(e.name))
  .map((e) => e.name)
  .sort();

fs.mkdirSync(outDir, { recursive: true });

const AUTO_END = "<!-- AUTO:END -->";
const MANUAL_BEGIN = "<!-- MANUAL:BEGIN -->";
const generatedAt = new Date().toISOString().slice(0, 10);

const indexRows = [];
let generated = 0;
let skippedNoProps = 0;

for (const name of componentDirs) {
  const dir = path.join(componentsDir, name);
  const mainFile = ["index.tsx", "index.ts"]
    .map((f) => path.join(dir, f))
    .find((f) => fs.existsSync(f));
  if (!mainFile) {
    skippedNoProps++;
    continue;
  }
  const source = fs.readFileSync(mainFile, "utf8");
  const decls = extractDeclarations(source);
  const propsDecl =
    decls.find((d) => d.kind === "interface" && d.name === `${name}Props`) ||
    decls.find((d) => d.kind === "interface" && /Props$/.test(d.name));

  const props = propsDecl ? parseProps(propsDecl.body) : [];
  const extendsText = propsDecl?.extendsText || "";
  const relatedTypes = decls
    .filter((d) => d !== propsDecl)
    .map((d) => (d.inline ? d.body : `export ${d.kind} ${d.name} ${d.body}`));

  // 附属文件线索（子组件、类型文件、stories）
  const extras = [];
  for (const sub of ["components", "hooks"]) {
    const subDir = path.join(dir, sub);
    if (fs.existsSync(subDir)) {
      const items = fs
        .readdirSync(subDir, { withFileTypes: true })
        .map((e) => e.name.replace(/\.(tsx?|jsx?)$/, ""));
      if (items.length) extras.push(`- \`${sub}/\`：${items.join("、")}`);
    }
  }
  if (fs.existsSync(path.join(dir, "types.ts")))
    extras.push("- `types.ts`（补充类型定义）");
  if (fs.existsSync(path.join(dir, "index.stories.tsx")))
    extras.push("- `index.stories.tsx`（用法示例）");

  const gotchaHits = matchGotchas(name, gotchaFiles);

  // 人工维护区保留
  const cardPath = path.join(outDir, `${name}.md`);
  let manualSection = "";
  if (fs.existsSync(cardPath)) {
    const old = fs.readFileSync(cardPath, "utf8");
    const idx = old.indexOf(MANUAL_BEGIN);
    if (idx >= 0) manualSection = old.slice(idx);
  }
  if (!manualSection) {
    manualSection = `${MANUAL_BEGIN}

## 能力边界（人工维护）

> 该组件**不能**做什么、常见误用场景。（待补充）

## 易混淆对比（人工维护）

> 与最易误选的组件对比：看到什么特征用本组件，看到什么特征用对方。（待补充）

## 场景绑定（人工维护）

> 命中即直接选用本组件的设计稿特征，禁止自由发挥。（待补充）
`;
  }

  const extendsNote = extendsText
    ? `\n> ⚠️ 本接口继承 \`${extendsText}\`，下表仅为本组件**扩展**的 Props；其余 Props 见继承来源的定义（本文件或外部依赖）。\n`
    : "";

  const propsTable = props.length
    ? [
        "| Prop | 类型 | 必填 | 默认值 | 说明 |",
        "| --- | --- | --- | --- | --- |",
        ...props.map((p) => {
          const deprecatedMark = p.deprecated ? " ⚠️" : "";
          return `| \`${p.name}\` | ${shortenType(p.type)} | ${p.optional ? "否" : "**是**"} | ${p.defaultValue ? `\`${p.defaultValue}\`` : "—"} | ${escapeCell(p.description)}${deprecatedMark} |`;
        }),
      ].join("\n")
    : "> 主文件中未提取到 Props interface（可能为复合导出或定义在 types.ts），请人工查看源码。";

  const gotchaList = gotchaHits.length
    ? gotchaHits
        .map((g) => `- [${path.basename(g)}](../gotchas/${g}.md)`)
        .join("\n")
    : "- （无匹配记录）";

  const relatedBlock = relatedTypes.length
    ? `\n## 相关类型\n\n\`\`\`ts\n${relatedTypes.join("\n\n")}\n\`\`\`\n`
    : "";

  const extrasBlock = extras.length
    ? `\n## 附属结构\n\n${extras.join("\n")}\n`
    : "";

  const card = `# ${name}

> 数据源：\`@xlb/components-react-native@${pkgVersion}\` · \`src/components/${name}/index.tsx\`
> 由 scripts/dtc-rn-component-cards.mjs 于 ${generatedAt} 生成；${MANUAL_BEGIN} 之后为人工维护区，重跑脚本保留。

## Props 能力清单（源码实证）
${extendsNote}
${propsTable}
${relatedBlock}${extrasBlock}
## 关联 Gotchas

${gotchaList}

${AUTO_END}

${manualSection}`;

  fs.writeFileSync(cardPath, card);
  generated++;
  const manualFilled = manualSection.includes("（待补充）") ? "" : " ✅";
  indexRows.push(
    `| \`${name}\` | ${props.length} | ${gotchaHits.length ? gotchaHits.map((g) => `[${path.basename(g)}](../gotchas/${g}.md)`).join("<br>") : "—"} |${manualFilled} [卡片](./${name}.md) |`,
  );
}

// ---------- _index.md（组件库使用清单） ----------

const indexDoc = `# RN 组件库使用清单（能力卡索引）

> 数据源：\`@xlb/components-react-native@${pkgVersion}\`（业务项目 node_modules 实际版本）
> 由 scripts/dtc-rn-component-cards.mjs 于 ${generatedAt} 生成，每次组件库升级后必须重跑。
> ✅ 标记表示该卡片的人工维护区（能力边界/易混淆对比/场景绑定）已填写。

## 使用规则（audit 阶段 Step 5 强制）

1. 为 UI 块选组件前，先读本清单定位候选组件，再读对应能力卡的 **Props 能力清单** 与 **关联 Gotchas**
2. 组件选择决策表中必须填写「能力举证」：设计稿要求的交互/功能由哪个 prop/事件承接（引用能力卡条目）
3. 能力卡「场景绑定」区已填写的组件：设计稿特征命中时直接选用，禁止自由发挥
4. 卡片缺失或 Props 与记忆不符时，以 \`node_modules/@xlb/components-react-native/src/components/\` 源码为准，禁止凭记忆编写

| 组件 | Props 数 | 关联 Gotchas | 卡片 |
| --- | --- | --- | --- |
${indexRows.join("\n")}
`;

fs.writeFileSync(path.join(outDir, "_index.md"), indexDoc);

console.log(
  JSON.stringify({
    ok: true,
    packageVersion: pkgVersion,
    outDir,
    generated,
    skippedNoMainFile: skippedNoProps,
    gotchaFiles: gotchaFiles.length,
  }),
);
