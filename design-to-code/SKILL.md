---
name: design-to-code
description: Convert MasterGo/Figma exported HTML into pixel-perfect React Native or Web React components. Optionally accepts a design screenshot for cross-validation. Use when users provide HTML files and want high-fidelity style and layout restoration without interaction logic.
---

# design-to-code

将 MasterGo/Figma 导出的 HTML 文件精准还原为 React Native 或 Web React 组件代码。**聚焦样式和布局双精准还原**，不处理交互逻辑。

## 输入要求

1. **HTML 文件**（必需） — MasterGo 导出的 HTML，含内联 style 属性
2. **assets 目录**（可选） — 与 HTML 同级，包含图片/SVG 资源
3. **设计截图**（可选） — PNG/JPG，本地文件路径或粘贴到对话中。提供时会与 HTML 交叉验证，不提供则以 HTML 为准
4. **目标平台**（可选） — `rn` 或 `web`，不指定则提问确认

## 工作流

### 步骤 1：收集输入

- 确认用户已提供 HTML 文件路径
- 检查是否提供了设计截图 → 决定后续是否走交叉验证分支
- 如果用户未指定目标平台，提问：「目标平台是 React Native 还是 Web？」
- 如果有图片引用但未提供 assets 目录，提醒用户确认图片资源路径

### 步骤 2：解析 HTML

读取 HTML 文件，提取以下信息的结构化表示：

1. **元素树**：DOM 层级结构，每个节点记录标签名和文本内容
2. **布局属性**：每个节点的 `display`, `flex-direction`, `justify-content`, `align-items`, `gap`, `flex-wrap`, `flex`, `position`, `z-index`
3. **盒模型**：`width`, `height`, `padding-*`, `margin`
4. **视觉样式**：`background`, `border-radius`, `border`, `box-shadow`, `overflow`
5. **文字样式**：`color`, `font-size`, `font-family`, `font-weight`, `line-height`, `text-align`
6. **CSS 变量列表**：所有 `var(--*)` 引用
7. **图片引用**：所有 `<img src="...">` 路径

### 步骤 3：解析 CSS 变量

对 HTML 中出现的每个 `var(--*)`：

1. 查阅 `references/token-map.json` 的 `colors` 映射表
2. 命中 → 记录主题 key（如 `color-text-icon-0`），后续代码中直接使用 `getColor('color-text-icon-0')`
3. 未命中：
   - 如果有截图 → 尝试从截图中推断颜色
   - 如果无截图或无法推断 → 触发提问，向用户确认色值

> `token-map.json` 的 `colors` 字段已将 MasterGo 调色板（Gray-1、Blue-2 等）直接映射到主题 key，无需中间 hex 步骤。

### 步骤 4：歧义检测与交叉验证

**通用歧义检测**（始终生效）→ `references/ambiguity-rules.md` 基础规则：
- CSS 变量未解析 → 提问
- 字体目标平台不可用 → 提问
- 复杂定位语义不清 → 提问
- 元素用途不明确 → 提问

**场景化检索** → 按需检索 `references/gotchas/`：
- 目标平台为 RN → 检索 `gotchas/rn-quirks/` 全部文件
- 代码使用了 XlbForm/XlbDatePicker/XlbUpload 等组件 → 检索 `gotchas/component-library/` 对应文件
- HTML 中有 `<img>` 且尺寸为 0 → 检索 `gotchas/html-parsing/img-zero-size-svg-fallback.md`
- HTML 中有 `gap` 属性 → 检索 `gotchas/html-parsing/flex-gap-exact-token.md`
- 所有场景 → 检索 `gotchas/html-parsing/force-full-element-mapping.md`

**截图交叉验证**（仅当提供了截图）→ `references/ambiguity-rules.md` 截图规则：
- 调用 `image-recognize` skill 分析截图
- 偏差 ≤ 5px / 颜色偏差 ≤ 3% → 自动以截图为准
- 偏差超阈值 → 提问确认

### 步骤 4.5：主题环境检测（RN 专属）

生成代码前，检测目标项目是否已有主题基础设施：

1. 搜索已有 hook：
   - `grep -r "useThemeColor" <目标页面目录>/`
2. **已存在** → 记录其 import 路径（如 `src/hooks/useThemeColor` 或 `../../hooks/useThemeColor`），跳过创建
3. **不存在** → 从 `references/theme-templates/` 读取模板，在目标目录下创建：
   - `<pageDir>/theme/fallback.ts`
   - `<pageDir>/theme/keys.ts`
   - `<pageDir>/theme/resolveThemeColor.ts`
   - `<pageDir>/theme/index.ts`
   - `<pageDir>/hooks/useThemeColor.ts`
4. 创建后确认所有文件落盘，计算正确的 import 相对路径

### 步骤 5：生成代码

根据确认后的样式数据，生成目标平台代码。生成前先读取对应平台的规范文件。

**React Native** → 读 `references/rn-guidelines.md`：
- 组件使用 `View`、`Text`、`Image` 等 RN 核心组件
- 样式使用 `createStyles(getColor)` 工厂函数 + `useMemo` 模式，所有属性 camelCase
- **所有颜色通过 `getColor('color-xxx')` 获取，禁止硬编码 hex 值**
- **导入主题**：`import { useThemeColor } from '<相对路径>/hooks/useThemeColor';`
- **共享样式**：使用 `createSharedStyles(getColor)` 工厂函数
- `flexDirection` 默认值处理：HTML 未声明则显式设置 `flexDirection: 'row'`
- `box-shadow` 转为 `shadowColor/shadowOffset/shadowOpacity/shadowRadius/elevation`
- 图片引用使用 `require('./asset/...')` 或远程 URL
- `gap` 优先使用，标注依赖 RN 0.71+
- **XlbDatePicker**：必须用 Pressable + visible/onClose + useWatch，不能裸放在 Form.Item 里
- **动态数组表单**：每项抽独立子组件管理 hooks，XlbUpload 加 `initialValue={[]}`
- **模块级子组件**：styles 通过 props 传递，不能直接引用 useMemo 创建的变量

**Web React** → 读 `references/web-guidelines.md`：
- 组件使用 HTML 原生元素（div、span、img）
- 样式使用 CSS Module（`Component.module.css`）
- 保留 CSS 原生属性名
- 图片引用使用 `import ... from '...'`
- 字体加系统 fallback

**通用规则：**
- 每个元素添加 `data-design-id` 属性，标注来源层级
- 文本内容从 HTML 提取，用变量名包裹（如 `{titleText}`）
- 代码注释标注关键样式值的来源（📐HTML / 📸截图修正 / 👤用户确认）

### 步骤 6：输出结果

最终交付：

1. **组件代码**：完整的 JSX/TSX 文件（直接修改现有代码）
2. **样式文件**：`StyleSheet.create()` 或 `Component.module.css`（内联在组件文件中）
3. **对话中输出样式差异总结**：标注每项修改的来源（📐HTML / 👤用户确认），**不写入文件到代码仓库**

## 关键原则

- **HTML 是基础数据源**，截图是可选校对，没有截图就以 HTML 为准不纠结
- **不确定就提问**，绝不猜测
- **样式和布局同样重要**，不因布局复杂而降级处理
- **对齐属性不可跨 DOM 层级平移**：HTML 的嵌套结构可能与 RN 的扁平结构不同，翻译前必须先对齐层级
- **组件库默认样式不可信**：XlbButton 等三方组件的内置样式可能与设计稿值不同，必须用 `style` / `textStyle` 显式覆盖
- **font-weight 在 RN 中偏细**：HTML 的 500 在 RN PingFang SC 中几乎看不出加粗，通常需 600~700
- **生成代码可以直接用**，不是伪代码
- **所有用户交互使用中文**
