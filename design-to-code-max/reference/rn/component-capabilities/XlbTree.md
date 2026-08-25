# XlbTree

> 数据源：`@xlb/components-react-native@1.0.0-beta.217` · `src/components/XlbTree/index.tsx`
> 由 scripts/dtc-rn-component-cards.mjs 于 2026-08-06 生成；<!-- MANUAL:BEGIN --> 之后为人工维护区，重跑脚本保留。

## Props 能力清单（源码实证）

| Prop | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `visible` | boolean | **是** | — | 是否显示弹窗 |
| `title` | string | 否 | — | 弹窗标题 |
| `data` | TreeNode[] | **是** | — | 树形数据源 |
| `value` | string[] | 否 | — | 选中的值（受控模式） |
| `defaultValue` | string[] | 否 | — | 默认值（非受控模式） |
| `multiple` | boolean | 否 | — | 是否多选 |
| `selectedArea` | 'row' \| 'checkbox' | 否 | `'checkbox'` |  |
| `onChange` | (value: string[], selectedNodes: TreeNode[]) => void | 否 | — | 值变化回调 |
| `onConfirm` | (value: string[], selectedNodes: TreeNode[]) => void | 否 | — | 确定按钮回调 |
| `onClose` | () => void | 否 | — | 关闭弹窗回调 |
| `searchPlaceholder` | string | 否 | — | 搜索占位符 |
| `onSearch` | (keyword: string) => void | 否 | — | 搜索回调 |
| `separator` | string | 否 | — | 已选项分隔符 |
| `selectedPrefix` | string | 否 | — | 已选项前缀文本 |
| `fieldNames` | FieldNames | 否 | — | 字段名映射，用于自定义数据字段 |
| `checkStrictly` | boolean | 否 | `false - 关联，选中父节点会选中所有子节点` | 父子节点选中状态是否关联（仅多选模式有效） |
| `labelRender` | LabelRender | 否 | — | 自定义节点 label 渲染函数 |
| `includeParentInResult` | boolean | 否 | `false - 只返回叶子节点数据` | 选中结果是否包含父节点数据（仅多选模式、且 checkStrictly=false 时有效） |

## 附属结构

- `components/`：multiple-selected-list、multiple、single、types、utils
- `hooks/`：useTreeSearch
- `index.stories.tsx`（用法示例）

## 关联 Gotchas

- （无匹配记录）

<!-- AUTO:END -->

<!-- MANUAL:BEGIN --> 之后为人工维护区，重跑脚本保留。

## Props 能力清单（源码实证）

| Prop | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `visible` | boolean | **是** | — | 是否显示弹窗 |
| `title` | string | 否 | — | 弹窗标题 |
| `data` | TreeNode[] | **是** | — | 树形数据源 |
| `value` | string[] | 否 | — | 选中的值（受控模式） |
| `defaultValue` | string[] | 否 | — | 默认值（非受控模式） |
| `multiple` | boolean | 否 | — | 是否多选 |
| `selectedArea` | 'row' \| 'checkbox' | 否 | `'checkbox'` |  |
| `onChange` | (value: string[], selectedNodes: TreeNode[]) => void | 否 | — | 值变化回调 |
| `onConfirm` | (value: string[], selectedNodes: TreeNode[]) => void | 否 | — | 确定按钮回调 |
| `onClose` | () => void | 否 | — | 关闭弹窗回调 |
| `searchPlaceholder` | string | 否 | — | 搜索占位符 |
| `onSearch` | (keyword: string) => void | 否 | — | 搜索回调 |
| `separator` | string | 否 | — | 已选项分隔符 |
| `selectedPrefix` | string | 否 | — | 已选项前缀文本 |
| `fieldNames` | FieldNames | 否 | — | 字段名映射，用于自定义数据字段 |
| `checkStrictly` | boolean | 否 | `false - 关联，选中父节点会选中所有子节点` | 父子节点选中状态是否关联（仅多选模式有效） |
| `labelRender` | LabelRender | 否 | — | 自定义节点 label 渲染函数 |
| `includeParentInResult` | boolean | 否 | `false - 只返回叶子节点数据` | 选中结果是否包含父节点数据（仅多选模式、且 checkStrictly=false 时有效） |

## 附属结构

- `components/`：multiple-selected-list、multiple、single、types、utils
- `hooks/`：useTreeSearch
- `index.stories.tsx`（用法示例）

## 关联 Gotchas

- （无匹配记录）

<!-- AUTO:END -->

<!-- MANUAL:BEGIN --> 之后为人工维护区，重跑脚本保留。

## Props 能力清单（源码实证）

| Prop | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `visible` | boolean | **是** | — | 是否显示弹窗 |
| `title` | string | 否 | — | 弹窗标题 |
| `data` | TreeNode[] | **是** | — | 树形数据源 |
| `value` | string[] | 否 | — | 选中的值（受控模式） |
| `defaultValue` | string[] | 否 | — | 默认值（非受控模式） |
| `multiple` | boolean | 否 | — | 是否多选 |
| `selectedArea` | 'row' \| 'checkbox' | 否 | `'checkbox'` |  |
| `onChange` | (value: string[], selectedNodes: TreeNode[]) => void | 否 | — | 值变化回调 |
| `onConfirm` | (value: string[], selectedNodes: TreeNode[]) => void | 否 | — | 确定按钮回调 |
| `onClose` | () => void | 否 | — | 关闭弹窗回调 |
| `searchPlaceholder` | string | 否 | — | 搜索占位符 |
| `onSearch` | (keyword: string) => void | 否 | — | 搜索回调 |
| `separator` | string | 否 | — | 已选项分隔符 |
| `selectedPrefix` | string | 否 | — | 已选项前缀文本 |
| `fieldNames` | FieldNames | 否 | — | 字段名映射，用于自定义数据字段 |
| `checkStrictly` | boolean | 否 | `false - 关联，选中父节点会选中所有子节点` | 父子节点选中状态是否关联（仅多选模式有效） |
| `labelRender` | LabelRender | 否 | — | 自定义节点 label 渲染函数 |
| `includeParentInResult` | boolean | 否 | `false - 只返回叶子节点数据` | 选中结果是否包含父节点数据（仅多选模式、且 checkStrictly=false 时有效） |

## 附属结构

- `components/`：multiple-selected-list、multiple、single、types、utils
- `hooks/`：useTreeSearch
- `index.stories.tsx`（用法示例）

## 关联 Gotchas

- （无匹配记录）

<!-- AUTO:END -->

<!-- MANUAL:BEGIN --> 之后为人工维护区，重跑脚本保留。

## Props 能力清单（源码实证）

| Prop | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `visible` | boolean | **是** | — | 是否显示弹窗 |
| `title` | string | 否 | — | 弹窗标题 |
| `data` | TreeNode[] | **是** | — | 树形数据源 |
| `value` | string[] | 否 | — | 选中的值（受控模式） |
| `defaultValue` | string[] | 否 | — | 默认值（非受控模式） |
| `multiple` | boolean | 否 | — | 是否多选 |
| `selectedArea` | 'row' \| 'checkbox' | 否 | `'checkbox'` |  |
| `onChange` | (value: string[], selectedNodes: TreeNode[]) => void | 否 | — | 值变化回调 |
| `onConfirm` | (value: string[], selectedNodes: TreeNode[]) => void | 否 | — | 确定按钮回调 |
| `onClose` | () => void | 否 | — | 关闭弹窗回调 |
| `searchPlaceholder` | string | 否 | — | 搜索占位符 |
| `onSearch` | (keyword: string) => void | 否 | — | 搜索回调 |
| `separator` | string | 否 | — | 已选项分隔符 |
| `selectedPrefix` | string | 否 | — | 已选项前缀文本 |
| `fieldNames` | FieldNames | 否 | — | 字段名映射，用于自定义数据字段 |
| `checkStrictly` | boolean | 否 | `false - 关联，选中父节点会选中所有子节点` | 父子节点选中状态是否关联（仅多选模式有效） |
| `labelRender` | LabelRender | 否 | — | 自定义节点 label 渲染函数 |
| `includeParentInResult` | boolean | 否 | `false - 只返回叶子节点数据` | 选中结果是否包含父节点数据（仅多选模式、且 checkStrictly=false 时有效） |

## 附属结构

- `components/`：multiple-selected-list、multiple、single、types、utils
- `hooks/`：useTreeSearch
- `index.stories.tsx`（用法示例）

## 关联 Gotchas

- （无匹配记录）

<!-- AUTO:END -->

<!-- MANUAL:BEGIN --> 之后为人工维护区，重跑脚本保留。

## Props 能力清单（源码实证）

| Prop | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `visible` | boolean | **是** | — | 是否显示弹窗 |
| `title` | string | 否 | — | 弹窗标题 |
| `data` | TreeNode[] | **是** | — | 树形数据源 |
| `value` | string[] | 否 | — | 选中的值（受控模式） |
| `defaultValue` | string[] | 否 | — | 默认值（非受控模式） |
| `multiple` | boolean | 否 | — | 是否多选 |
| `selectedArea` | 'row' \| 'checkbox' | 否 | `'checkbox'` |  |
| `onChange` | (value: string[], selectedNodes: TreeNode[]) => void | 否 | — | 值变化回调 |
| `onConfirm` | (value: string[], selectedNodes: TreeNode[]) => void | 否 | — | 确定按钮回调 |
| `onClose` | () => void | 否 | — | 关闭弹窗回调 |
| `searchPlaceholder` | string | 否 | — | 搜索占位符 |
| `onSearch` | (keyword: string) => void | 否 | — | 搜索回调 |
| `separator` | string | 否 | — | 已选项分隔符 |
| `selectedPrefix` | string | 否 | — | 已选项前缀文本 |
| `fieldNames` | FieldNames | 否 | — | 字段名映射，用于自定义数据字段 |
| `checkStrictly` | boolean | 否 | `false - 关联，选中父节点会选中所有子节点` | 父子节点选中状态是否关联（仅多选模式有效） |
| `labelRender` | LabelRender | 否 | — | 自定义节点 label 渲染函数 |
| `includeParentInResult` | boolean | 否 | `false - 只返回叶子节点数据` | 选中结果是否包含父节点数据（仅多选模式、且 checkStrictly=false 时有效） |

## 附属结构

- `components/`：multiple-selected-list、multiple、single、types、utils
- `hooks/`：useTreeSearch
- `index.stories.tsx`（用法示例）

## 关联 Gotchas

- （无匹配记录）

<!-- AUTO:END -->

<!-- MANUAL:BEGIN -->

## 能力边界（人工维护）

> 该组件**不能**做什么、常见误用场景。（待补充）

## 易混淆对比（人工维护)

> 与最易误选的组件对比：看到什么特征用本组件，看到什么特征用对方。（待补充）

## 场景绑定（人工维护）

> 命中即直接选用本组件的设计稿特征，禁止自由发挥。（待补充）
