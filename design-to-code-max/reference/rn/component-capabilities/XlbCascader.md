# XlbCascader

> 数据源：`@xlb/components-react-native@1.0.0-beta.217` · `src/components/XlbCascader/index.tsx`
> 由 scripts/dtc-rn-component-cards.mjs 于 2026-08-06 生成；<!-- MANUAL:BEGIN --> 之后为人工维护区，重跑脚本保留。

## Props 能力清单（源码实证）

| Prop | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `visible` | boolean | **是** | — | 是否显示弹窗 |
| `title` | string | 否 | — | 弹窗标题 |
| `data` | CascaderNode[] | **是** | — | 数据源 |
| `value` | string[] | 否 | — | 选中的值（受控模式） |
| `defaultValue` | string[] | 否 | — | 默认值（非受控模式） |
| `multiple` | boolean | 否 | — | 是否多选 |
| `selectedArea` | 'row' \| 'checkbox' \| 'checkbox-label' | 否 | `'checkbox-label'` |  |
| `onChange` | (value: string[], selectedNodes: CascaderNode[]) => void | 否 | — | 值变化回调 |
| `onConfirm` | (value: string[], selectedNodes: CascaderNode[]) => void | 否 | — | 确定按钮回调 |
| `onClose` | () => void | 否 | — | 关闭弹窗回调 |
| `searchPlaceholder` | string | 否 | — | 搜索占位符 |
| `onSearch` | (keyword: string) => void | 否 | — | 搜索回调 |
| `fieldNames` | FieldNames | 否 | — | 字段名映射，用于自定义数据字段 |
| `checkStrictly` | boolean | 否 | `false - 关联，选中父节点会选中所有子节点` | 父子节点选中状态是否关联（仅多选模式有效） |
| `labelRender` | LabelRender | 否 | — | 自定义节点 label 渲染函数 |
| `includeParentInResult` | boolean | 否 | `false - 只返回叶子节点数据` | 选中结果是否包含父节点数据（仅多选模式、且 checkStrictly=false 时有效） |
| `selectedPrefix` | string | 否 | `'已选项：'` | 已选项前缀文字（仅单选模式有效） |
| `rootBreadcrumbText` | string | 否 | `'所有分组'` | 面包屑根节点文字（仅单选模式有效） |
| `allowSelectParent` | boolean | 否 | `false` | 是否允许选择父节点（仅单选模式有效） |
| `loadData` | (selectedOptions: CascaderNode[]) => Promise<CascaderNode[]> | 否 | — | 懒加载函数，用于异步加载子节点数据 loadData={async (selectedOptions) => { const parentId = selectedOptions[selectedOptions.length - 1].id; const response = await fetch(`/api/children/${parentId}`); return response.json(); }} |

## 附属结构

- `components/`：multiple-selected-list、multiple、single、types、utils
- `hooks/`：useCascaderSearch
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
| `data` | CascaderNode[] | **是** | — | 数据源 |
| `value` | string[] | 否 | — | 选中的值（受控模式） |
| `defaultValue` | string[] | 否 | — | 默认值（非受控模式） |
| `multiple` | boolean | 否 | — | 是否多选 |
| `selectedArea` | 'row' \| 'checkbox' \| 'checkbox-label' | 否 | `'checkbox-label'` |  |
| `onChange` | (value: string[], selectedNodes: CascaderNode[]) => void | 否 | — | 值变化回调 |
| `onConfirm` | (value: string[], selectedNodes: CascaderNode[]) => void | 否 | — | 确定按钮回调 |
| `onClose` | () => void | 否 | — | 关闭弹窗回调 |
| `searchPlaceholder` | string | 否 | — | 搜索占位符 |
| `onSearch` | (keyword: string) => void | 否 | — | 搜索回调 |
| `fieldNames` | FieldNames | 否 | — | 字段名映射，用于自定义数据字段 |
| `checkStrictly` | boolean | 否 | `false - 关联，选中父节点会选中所有子节点` | 父子节点选中状态是否关联（仅多选模式有效） |
| `labelRender` | LabelRender | 否 | — | 自定义节点 label 渲染函数 |
| `includeParentInResult` | boolean | 否 | `false - 只返回叶子节点数据` | 选中结果是否包含父节点数据（仅多选模式、且 checkStrictly=false 时有效） |
| `selectedPrefix` | string | 否 | `'已选项：'` | 已选项前缀文字（仅单选模式有效） |
| `rootBreadcrumbText` | string | 否 | `'所有分组'` | 面包屑根节点文字（仅单选模式有效） |
| `allowSelectParent` | boolean | 否 | `false` | 是否允许选择父节点（仅单选模式有效） |
| `loadData` | (selectedOptions: CascaderNode[]) => Promise<CascaderNode[]> | 否 | — | 懒加载函数，用于异步加载子节点数据 loadData={async (selectedOptions) => { const parentId = selectedOptions[selectedOptions.length - 1].id; const response = await fetch(`/api/children/${parentId}`); return response.json(); }} |

## 附属结构

- `components/`：multiple-selected-list、multiple、single、types、utils
- `hooks/`：useCascaderSearch
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
| `data` | CascaderNode[] | **是** | — | 数据源 |
| `value` | string[] | 否 | — | 选中的值（受控模式） |
| `defaultValue` | string[] | 否 | — | 默认值（非受控模式） |
| `multiple` | boolean | 否 | — | 是否多选 |
| `selectedArea` | 'row' \| 'checkbox' \| 'checkbox-label' | 否 | `'checkbox-label'` |  |
| `onChange` | (value: string[], selectedNodes: CascaderNode[]) => void | 否 | — | 值变化回调 |
| `onConfirm` | (value: string[], selectedNodes: CascaderNode[]) => void | 否 | — | 确定按钮回调 |
| `onClose` | () => void | 否 | — | 关闭弹窗回调 |
| `searchPlaceholder` | string | 否 | — | 搜索占位符 |
| `onSearch` | (keyword: string) => void | 否 | — | 搜索回调 |
| `fieldNames` | FieldNames | 否 | — | 字段名映射，用于自定义数据字段 |
| `checkStrictly` | boolean | 否 | `false - 关联，选中父节点会选中所有子节点` | 父子节点选中状态是否关联（仅多选模式有效） |
| `labelRender` | LabelRender | 否 | — | 自定义节点 label 渲染函数 |
| `includeParentInResult` | boolean | 否 | `false - 只返回叶子节点数据` | 选中结果是否包含父节点数据（仅多选模式、且 checkStrictly=false 时有效） |
| `selectedPrefix` | string | 否 | `'已选项：'` | 已选项前缀文字（仅单选模式有效） |
| `rootBreadcrumbText` | string | 否 | `'所有分组'` | 面包屑根节点文字（仅单选模式有效） |
| `allowSelectParent` | boolean | 否 | `false` | 是否允许选择父节点（仅单选模式有效） |
| `loadData` | (selectedOptions: CascaderNode[]) => Promise<CascaderNode[]> | 否 | — | 懒加载函数，用于异步加载子节点数据 loadData={async (selectedOptions) => { const parentId = selectedOptions[selectedOptions.length - 1].id; const response = await fetch(`/api/children/${parentId}`); return response.json(); }} |

## 附属结构

- `components/`：multiple-selected-list、multiple、single、types、utils
- `hooks/`：useCascaderSearch
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
| `data` | CascaderNode[] | **是** | — | 数据源 |
| `value` | string[] | 否 | — | 选中的值（受控模式） |
| `defaultValue` | string[] | 否 | — | 默认值（非受控模式） |
| `multiple` | boolean | 否 | — | 是否多选 |
| `selectedArea` | 'row' \| 'checkbox' \| 'checkbox-label' | 否 | `'checkbox-label'` |  |
| `onChange` | (value: string[], selectedNodes: CascaderNode[]) => void | 否 | — | 值变化回调 |
| `onConfirm` | (value: string[], selectedNodes: CascaderNode[]) => void | 否 | — | 确定按钮回调 |
| `onClose` | () => void | 否 | — | 关闭弹窗回调 |
| `searchPlaceholder` | string | 否 | — | 搜索占位符 |
| `onSearch` | (keyword: string) => void | 否 | — | 搜索回调 |
| `fieldNames` | FieldNames | 否 | — | 字段名映射，用于自定义数据字段 |
| `checkStrictly` | boolean | 否 | `false - 关联，选中父节点会选中所有子节点` | 父子节点选中状态是否关联（仅多选模式有效） |
| `labelRender` | LabelRender | 否 | — | 自定义节点 label 渲染函数 |
| `includeParentInResult` | boolean | 否 | `false - 只返回叶子节点数据` | 选中结果是否包含父节点数据（仅多选模式、且 checkStrictly=false 时有效） |
| `selectedPrefix` | string | 否 | `'已选项：'` | 已选项前缀文字（仅单选模式有效） |
| `rootBreadcrumbText` | string | 否 | `'所有分组'` | 面包屑根节点文字（仅单选模式有效） |
| `allowSelectParent` | boolean | 否 | `false` | 是否允许选择父节点（仅单选模式有效） |
| `loadData` | (selectedOptions: CascaderNode[]) => Promise<CascaderNode[]> | 否 | — | 懒加载函数，用于异步加载子节点数据 loadData={async (selectedOptions) => { const parentId = selectedOptions[selectedOptions.length - 1].id; const response = await fetch(`/api/children/${parentId}`); return response.json(); }} |

## 附属结构

- `components/`：multiple-selected-list、multiple、single、types、utils
- `hooks/`：useCascaderSearch
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
| `data` | CascaderNode[] | **是** | — | 数据源 |
| `value` | string[] | 否 | — | 选中的值（受控模式） |
| `defaultValue` | string[] | 否 | — | 默认值（非受控模式） |
| `multiple` | boolean | 否 | — | 是否多选 |
| `selectedArea` | 'row' \| 'checkbox' \| 'checkbox-label' | 否 | `'checkbox-label'` |  |
| `onChange` | (value: string[], selectedNodes: CascaderNode[]) => void | 否 | — | 值变化回调 |
| `onConfirm` | (value: string[], selectedNodes: CascaderNode[]) => void | 否 | — | 确定按钮回调 |
| `onClose` | () => void | 否 | — | 关闭弹窗回调 |
| `searchPlaceholder` | string | 否 | — | 搜索占位符 |
| `onSearch` | (keyword: string) => void | 否 | — | 搜索回调 |
| `fieldNames` | FieldNames | 否 | — | 字段名映射，用于自定义数据字段 |
| `checkStrictly` | boolean | 否 | `false - 关联，选中父节点会选中所有子节点` | 父子节点选中状态是否关联（仅多选模式有效） |
| `labelRender` | LabelRender | 否 | — | 自定义节点 label 渲染函数 |
| `includeParentInResult` | boolean | 否 | `false - 只返回叶子节点数据` | 选中结果是否包含父节点数据（仅多选模式、且 checkStrictly=false 时有效） |
| `selectedPrefix` | string | 否 | `'已选项：'` | 已选项前缀文字（仅单选模式有效） |
| `rootBreadcrumbText` | string | 否 | `'所有分组'` | 面包屑根节点文字（仅单选模式有效） |
| `allowSelectParent` | boolean | 否 | `false` | 是否允许选择父节点（仅单选模式有效） |
| `loadData` | (selectedOptions: CascaderNode[]) => Promise<CascaderNode[]> | 否 | — | 懒加载函数，用于异步加载子节点数据 loadData={async (selectedOptions) => { const parentId = selectedOptions[selectedOptions.length - 1].id; const response = await fetch(`/api/children/${parentId}`); return response.json(); }} |

## 附属结构

- `components/`：multiple-selected-list、multiple、single、types、utils
- `hooks/`：useCascaderSearch
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
