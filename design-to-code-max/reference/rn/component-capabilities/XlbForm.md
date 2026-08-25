# XlbForm

> 数据源：`@xlb/components-react-native@1.0.0-beta.217` · `src/components/XlbForm/index.tsx`
> 由 scripts/dtc-rn-component-cards.mjs 于 2026-08-06 生成；<!-- MANUAL:BEGIN --> 之后为人工维护区，重跑脚本保留。

## Props 能力清单（源码实证）

> ⚠️ 本接口继承 `FormProps`，下表仅为本组件**扩展**的 Props；其余 Props 见继承来源的定义（本文件或外部依赖）。

| Prop                   | 类型                              | 必填 | 默认值         | 说明                                                                 |
| ---------------------- | --------------------------------- | ---- | -------------- | -------------------------------------------------------------------- |
| `hasFeedback`          | boolean                           | 否   | `true`         | 是否展示错误反馈信息 hasFeedback={false}                             |
| `layout`               | 'horizontal' \| 'vertical'        | 否   | `'horizontal'` | 表单布局样式 layout="vertical"                                       |
| `requiredMarkPosition` | 'before' \| 'after'               | 否   | `'after'`      | 必填标记位置 requiredMarkPosition="before"                           |
| `cellTheme`            | import('./context').CellThemeType | 否   | —              | XlbCell 主题配置 cellTheme={{ cell_padding_horizontal: 16 }}         |
| `childrenWrapperStyle` | ViewStyle                         | 否   | —              | 子项包裹样式 childrenWrapperStyle={{ justifyContent: 'flex-start' }} |

## 附属结构

- `components/`：formItem、formItemContainer
- `hooks/`：useFormScrollToError
- `index.stories.tsx`（用法示例）

## 关联 Gotchas

- [blackbox-wrapper-component](../gotchas/component-library/blackbox-wrapper-component.md)
- [clearable-input-ios-shadow-value](../gotchas/component-library/clearable-input-ios-shadow-value.md)
- [datepicker-onchange-conflict](../gotchas/component-library/datepicker-onchange-conflict.md)
- [dependencies-kills-label](../gotchas/component-library/dependencies-kills-label.md)
- [dependencies-setfieldsvalue-conflict](../gotchas/component-library/dependencies-setfieldsvalue-conflict.md)
- [dynamic-list-independent-component](../gotchas/component-library/dynamic-list-independent-component.md)
- [form-item-render-prop-unreliable](../gotchas/component-library/form-item-render-prop-unreliable.md)
- [safeinput-filter-id](../gotchas/component-library/safeinput-filter-id.md)
- [upload-dynamic-array-initial-value](../gotchas/component-library/upload-dynamic-array-initial-value.md)
- [usewatch-instead-of-dependencies](../gotchas/component-library/usewatch-instead-of-dependencies.md)
- [xlbform-celltheme-horizontal-padding](../gotchas/component-library/xlbform-celltheme-horizontal-padding.md)
- [xlbuploadfile-correct-usage](../gotchas/component-library/xlbuploadfile-correct-usage.md)
- [font-weight-cross-platform-visual-diff](../gotchas/rn-quirks/font-weight-cross-platform-visual-diff.md)

<!-- AUTO:END -->

<!-- MANUAL:BEGIN --> 之后为人工维护区，重跑脚本保留。

## Props 能力清单（源码实证）

> ⚠️ 本接口继承 `FormProps`（外部依赖），下表仅为本组件**扩展**的 Props；基础 Props（如表单三件套 form/initialValues/onFinish）见继承来源。

| Prop                   | 类型                              | 必填 | 默认值         | 说明                                                                 |
| ---------------------- | --------------------------------- | ---- | -------------- | -------------------------------------------------------------------- |
| `hasFeedback`          | boolean                           | 否   | `true`         | 是否展示错误反馈信息 hasFeedback={false}                             |
| `layout`               | 'horizontal' \| 'vertical'        | 否   | `'horizontal'` | 表单布局样式 layout="vertical"                                       |
| `requiredMarkPosition` | 'before' \| 'after'               | 否   | `'after'`      | 必填标记位置 requiredMarkPosition="before"                           |
| `cellTheme`            | import('./context').CellThemeType | 否   | —              | XlbCell 主题配置 cellTheme={{ cell_padding_horizontal: 16 }}         |
| `childrenWrapperStyle` | ViewStyle                         | 否   | —              | 子项包裹样式 childrenWrapperStyle={{ justifyContent: 'flex-start' }} |

## 附属结构

- `components/`：formItem、formItemContainer
- `hooks/`：useFormScrollToError
- `index.stories.tsx`（用法示例）

## 关联 Gotchas

- [blackbox-wrapper-component](../gotchas/component-library/blackbox-wrapper-component.md)
- [clearable-input-ios-shadow-value](../gotchas/component-library/clearable-input-ios-shadow-value.md)
- [datepicker-onchange-conflict](../gotchas/component-library/datepicker-onchange-conflict.md)
- [dependencies-kills-label](../gotchas/component-library/dependencies-kills-label.md)
- [dependencies-setfieldsvalue-conflict](../gotchas/component-library/dependencies-setfieldsvalue-conflict.md)
- [dynamic-list-independent-component](../gotchas/component-library/dynamic-list-independent-component.md)
- [form-item-render-prop-unreliable](../gotchas/component-library/form-item-render-prop-unreliable.md)
- [safeinput-filter-id](../gotchas/component-library/safeinput-filter-id.md)
- [upload-dynamic-array-initial-value](../gotchas/component-library/upload-dynamic-array-initial-value.md)
- [usewatch-instead-of-dependencies](../gotchas/component-library/usewatch-instead-of-dependencies.md)
- [xlbform-celltheme-horizontal-padding](../gotchas/component-library/xlbform-celltheme-horizontal-padding.md)
- [xlbuploadfile-correct-usage](../gotchas/component-library/xlbuploadfile-correct-usage.md)
- [font-weight-cross-platform-visual-diff](../gotchas/rn-quirks/font-weight-cross-platform-visual-diff.md)

<!-- AUTO:END -->

<!-- MANUAL:BEGIN --> 之后为人工维护区，重跑脚本保留。

## Props 能力清单（源码实证）

> ⚠️ 本接口继承 `FormProps`（外部依赖），下表仅为本组件**扩展**的 Props；基础 Props（如表单三件套 form/initialValues/onFinish）见继承来源。

| Prop                   | 类型                              | 必填 | 默认值         | 说明                                                                 |
| ---------------------- | --------------------------------- | ---- | -------------- | -------------------------------------------------------------------- |
| `hasFeedback`          | boolean                           | 否   | `true`         | 是否展示错误反馈信息 hasFeedback={false}                             |
| `layout`               | 'horizontal' \| 'vertical'        | 否   | `'horizontal'` | 表单布局样式 layout="vertical"                                       |
| `requiredMarkPosition` | 'before' \| 'after'               | 否   | `'after'`      | 必填标记位置 requiredMarkPosition="before"                           |
| `cellTheme`            | import('./context').CellThemeType | 否   | —              | XlbCell 主题配置 cellTheme={{ cell_padding_horizontal: 16 }}         |
| `childrenWrapperStyle` | ViewStyle                         | 否   | —              | 子项包裹样式 childrenWrapperStyle={{ justifyContent: 'flex-start' }} |

## 附属结构

- `components/`：formItem、formItemContainer
- `hooks/`：useFormScrollToError
- `index.stories.tsx`（用法示例）

## 关联 Gotchas

- [blackbox-wrapper-component](../gotchas/component-library/blackbox-wrapper-component.md)
- [clearable-input-ios-shadow-value](../gotchas/component-library/clearable-input-ios-shadow-value.md)
- [datepicker-onchange-conflict](../gotchas/component-library/datepicker-onchange-conflict.md)
- [dependencies-kills-label](../gotchas/component-library/dependencies-kills-label.md)
- [dependencies-setfieldsvalue-conflict](../gotchas/component-library/dependencies-setfieldsvalue-conflict.md)
- [dynamic-list-independent-component](../gotchas/component-library/dynamic-list-independent-component.md)
- [form-item-render-prop-unreliable](../gotchas/component-library/form-item-render-prop-unreliable.md)
- [safeinput-filter-id](../gotchas/component-library/safeinput-filter-id.md)
- [upload-dynamic-array-initial-value](../gotchas/component-library/upload-dynamic-array-initial-value.md)
- [usewatch-instead-of-dependencies](../gotchas/component-library/usewatch-instead-of-dependencies.md)
- [xlbform-celltheme-horizontal-padding](../gotchas/component-library/xlbform-celltheme-horizontal-padding.md)
- [xlbuploadfile-correct-usage](../gotchas/component-library/xlbuploadfile-correct-usage.md)
- [font-weight-cross-platform-visual-diff](../gotchas/component-library/font-weight-cross-platform-visual-diff.md)

<!-- AUTO:END -->

<!-- MANUAL:BEGIN --> 之后为人工维护区，重跑脚本保留。

## Props 能力清单（源码实证）

> ⚠️ 本接口继承 `FormProps`（外部依赖），下表仅为本组件**扩展**的 Props；基础 Props（如表单三件套 form/initialValues/onFinish）见继承来源。

| Prop                   | 类型                              | 必填 | 默认值         | 说明                                                                 |
| ---------------------- | --------------------------------- | ---- | -------------- | -------------------------------------------------------------------- |
| `hasFeedback`          | boolean                           | 否   | `true`         | 是否展示错误反馈信息 hasFeedback={false}                             |
| `layout`               | 'horizontal' \| 'vertical'        | 否   | `'horizontal'` | 表单布局样式 layout="vertical"                                       |
| `requiredMarkPosition` | 'before' \| 'after'               | 否   | `'after'`      | 必填标记位置 requiredMarkPosition="before"                           |
| `cellTheme`            | import('./context').CellThemeType | 否   | —              | XlbCell 主题配置 cellTheme={{ cell_padding_horizontal: 16 }}         |
| `childrenWrapperStyle` | ViewStyle                         | 否   | —              | 子项包裹样式 childrenWrapperStyle={{ justifyContent: 'flex-start' }} |

## 附属结构

- `components/`：formItem、formItemContainer
- `hooks/`：useFormScrollToError
- `index.stories.tsx`（用法示例）

## 关联 Gotchas

- [blackbox-wrapper-component](../gotchas/component-library/blackbox-wrapper-component.md)
- [clearable-input-ios-shadow-value](../gotchas/component-library/clearable-input-ios-shadow-value.md)
- [datepicker-onchange-conflict](../gotchas/component-library/datepicker-onchange-conflict.md)
- [dependencies-kills-label](../gotchas/component-library/dependencies-kills-label.md)
- [dependencies-setfieldsvalue-conflict](../gotchas/component-library/dependencies-setfieldsvalue-conflict.md)
- [dynamic-list-independent-component](../gotchas/component-library/dynamic-list-independent-component.md)
- [form-item-render-prop-unreliable](../gotchas/component-library/form-item-render-prop-unreliable.md)
- [safeinput-filter-id](../gotchas/component-library/safeinput-filter-id.md)
- [upload-dynamic-array-initial-value](../gotchas/component-library/upload-dynamic-array-initial-value.md)
- [usewatch-instead-of-dependencies](../gotchas/component-library/usewatch-instead-of-dependencies.md)
- [xlbform-celltheme-horizontal-padding](../gotchas/component-library/xlbform-celltheme-horizontal-padding.md)
- [xlbuploadfile-correct-usage](../gotchas/component-library/xlbuploadfile-correct-usage.md)
- [font-weight-cross-platform-visual-diff](../gotchas/component-library/font-weight-cross-platform-visual-diff.md)

<!-- AUTO:END -->

<!-- MANUAL:BEGIN --> 之后为人工维护区，重跑脚本保留。

## Props 能力清单（源码实证）

| Prop                   | 类型                              | 必填 | 默认值         | 说明                                                                 |
| ---------------------- | --------------------------------- | ---- | -------------- | -------------------------------------------------------------------- |
| `hasFeedback`          | boolean                           | 否   | `true`         | 是否展示错误反馈信息 hasFeedback={false}                             |
| `layout`               | 'horizontal' \| 'vertical'        | 否   | `'horizontal'` | 表单布局样式 layout="vertical"                                       |
| `requiredMarkPosition` | 'before' \| 'after'               | 否   | `'after'`      | 必填标记位置 requiredMarkPosition="before"                           |
| `cellTheme`            | import('./context').CellThemeType | 否   | —              | XlbCell 主题配置 cellTheme={{ cell_padding_horizontal: 16 }}         |
| `childrenWrapperStyle` | ViewStyle                         | 否   | —              | 子项包裹样式 childrenWrapperStyle={{ justifyContent: 'flex-start' }} |

## 附属结构

- `components/`：formItem、formItemContainer
- `hooks/`：useFormScrollToError
- `index.stories.tsx`（用法示例）

## 关联 Gotchas

- [blackbox-wrapper-component](../gotchas/component-library/blackbox-wrapper-component.md)
- [clearable-input-ios-shadow-value](../gotchas/component-library/clearable-input-ios-shadow-value.md)
- [datepicker-onchange-conflict](../gotchas/component-library/datepicker-onchange-conflict.md)
- [dependencies-kills-label](../gotchas/component-library/dependencies-kills-label.md)
- [dependencies-setfieldsvalue-conflict](../gotchas/component-library/dependencies-setfieldsvalue-conflict.md)
- [dynamic-list-independent-component](../gotchas/component-library/dynamic-list-independent-component.md)
- [form-item-render-prop-unreliable](../gotchas/component-library/form-item-render-prop-unreliable.md)
- [safeinput-filter-id](../gotchas/component-library/safeinput-filter-id.md)
- [upload-dynamic-array-initial-value](../gotchas/component-library/upload-dynamic-array-initial-value.md)
- [usewatch-instead-of-dependencies](../gotchas/component-library/usewatch-instead-of-dependencies.md)
- [xlbform-celltheme-horizontal-padding](../gotchas/component-library/xlbform-celltheme-horizontal-padding.md)
- [xlbuploadfile-correct-usage](../gotchas/component-library/xlbuploadfile-correct-usage.md)

<!-- AUTO:END -->

<!-- MANUAL:BEGIN -->

## 能力边界（人工维护）

- **`XlbForm.Item` 禁止传 `dependencies` / `shouldUpdate` / render prop（children as function）**——任一存在 label 都不会渲染；跨字段联动一律 `XlbForm.useWatch` + `useEffect`（见 dependencies-kills-label、usewatch-instead-of-dependencies、form-item-render-prop-unreliable）
- **子组件的 `onChange` prop 会被 FormItemContainer 克隆时覆盖**：在 `XlbForm.Item` 内给子组件传 onChange 不生效，自定义联动必须走 useWatch（见 dependencies-setfieldsvalue-conflict）
- **水平内边距不能加到单个 `XlbForm.Item` 的 style 上**，必须通过 `cellTheme` prop 全局设置（如 `cell_group_title_padding_horizontal`）（见 xlbform-celltheme-horizontal-padding）
- **数组 name（`name={[...]}`）时直接子组件必须过滤 `id` prop**：XlbInput → SafeInput、XlbUploadFile → SafeUploadFile，否则 Android nativeID 崩溃（见 safeinput-filter-id）
- **动态列表字段必须封装为独立组件**（见 dynamic-list-independent-component）
- 基础 props（form/initialValues/onFinish 等）继承自外部 `FormProps`，见上方继承标注

## 易混淆对比（人工维护）

- **vs `CommonFormItem`（业务封装黑盒）**：CommonFormItem 内部组合 XlbForm.Item + XlbInput/XlbSelector/XlbDatePicker，行高/分隔线/对齐由默认样式决定、props 不可控。**设计稿要求精确控制行高/分隔线/对齐时，用 `XlbForm.Item` + 原生控件自定义实现，不用 CommonFormItem**（见 blackbox-wrapper-component）

## 场景绑定（人工维护）

- 表单页/表单卡：label 左、value 右的水平布局表单行（行高 48px、space-between）→ `XlbForm` + `XlbForm.Item` 默认形态直接覆盖
- 上下布局块（上传区、单选组、动态列表块）→ `XlbForm.Item noStyle` + 自定义容器（label 独立一行）
