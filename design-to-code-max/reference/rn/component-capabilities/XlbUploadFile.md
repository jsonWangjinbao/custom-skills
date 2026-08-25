# XlbUploadFile

> 数据源：`@xlb/components-react-native@1.0.0-beta.217` · `src/components/XlbUploadFile/index.tsx`
> 由 scripts/dtc-rn-component-cards.mjs 于 2026-08-06 生成；<!-- MANUAL:BEGIN --> 之后为人工维护区，重跑脚本保留。

## Props 能力清单（源码实证）

> 主文件中未提取到 Props interface（可能为复合导出或定义在 types.ts），请人工查看源码。

## 附属结构

- `components/`：FileIcon、FileItem、index
- `hooks/`：index、useFilePicker、useUploadFile
- `index.stories.tsx`（用法示例）

## 关联 Gotchas

- [blackbox-wrapper-component](../gotchas/component-library/blackbox-wrapper-component.md)
- [safeinput-filter-id](../gotchas/component-library/safeinput-filter-id.md)
- [xlbuploadfile-correct-usage](../gotchas/component-library/xlbuploadfile-correct-usage.md)

<!-- AUTO:END -->

<!-- MANUAL:BEGIN --> 之后为人工维护区，重跑脚本保留。

## Props 能力清单（源码实证）

> 主文件中未提取到 Props interface（可能为复合导出或定义在 types.ts），请人工查看源码。

## 附属结构

- `components/`：FileIcon、FileItem、index
- `hooks/`：index、useFilePicker、useUploadFile
- `index.stories.tsx`（用法示例）

## 关联 Gotchas

- [blackbox-wrapper-component](../gotchas/component-library/blackbox-wrapper-component.md)
- [safeinput-filter-id](../gotchas/component-library/safeinput-filter-id.md)
- [xlbuploadfile-correct-usage](../gotchas/component-library/xlbuploadfile-correct-usage.md)

<!-- AUTO:END -->

<!-- MANUAL:BEGIN --> 之后为人工维护区，重跑脚本保留。

## Props 能力清单（源码实证）

> 主文件中未提取到 Props interface（可能为复合导出或定义在 types.ts），请人工查看源码。

## 附属结构

- `components/`：FileIcon、FileItem、index
- `hooks/`：index、useFilePicker、useUploadFile
- `index.stories.tsx`（用法示例）

## 关联 Gotchas

- [blackbox-wrapper-component](../gotchas/component-library/blackbox-wrapper-component.md)
- [safeinput-filter-id](../gotchas/component-library/safeinput-filter-id.md)
- [xlbuploadfile-correct-usage](../gotchas/component-library/xlbuploadfile-correct-usage.md)

<!-- AUTO:END -->

<!-- MANUAL:BEGIN --> 之后为人工维护区，重跑脚本保留。

## Props 能力清单（源码实证）

> 主文件中未提取到 Props interface（可能为复合导出或定义在 types.ts），请人工查看源码。

## 附属结构

- `components/`：FileIcon、FileItem、index
- `hooks/`：index、useFilePicker、useUploadFile
- `index.stories.tsx`（用法示例）

## 关联 Gotchas

- [blackbox-wrapper-component](../gotchas/component-library/blackbox-wrapper-component.md)
- [safeinput-filter-id](../gotchas/component-library/safeinput-filter-id.md)
- [xlbuploadfile-correct-usage](../gotchas/component-library/xlbuploadfile-correct-usage.md)

<!-- AUTO:END -->

<!-- MANUAL:BEGIN --> 之后为人工维护区，重跑脚本保留。

## Props 能力清单（源码实证）

> 主文件中未提取到 Props interface（可能为复合导出或定义在 types.ts），请人工查看源码。

## 附属结构

- `components/`：FileIcon、FileItem、index
- `hooks/`：index、useFilePicker、useUploadFile
- `index.stories.tsx`（用法示例）

## 关联 Gotchas

- [blackbox-wrapper-component](../gotchas/component-library/blackbox-wrapper-component.md)
- [safeinput-filter-id](../gotchas/component-library/safeinput-filter-id.md)
- [xlbuploadfile-correct-usage](../gotchas/component-library/xlbuploadfile-correct-usage.md)

<!-- AUTO:END -->

<!-- MANUAL:BEGIN -->

## 能力边界（人工维护）

- 图片文件**自动以缩略图网格渲染**（非文件列表），自带删除按钮与预览；`renderItem` / `thumbnailSize` / `gridMode` **这些 props 不存在**，传了无效（见 xlbuploadfile-correct-usage）
- `mode` 只有 `'edit' | 'look'`（编辑/查看），不是渲染样式切换器
- **必传 props**：`filesMax`（最大数量）、`customUpload`（自定义上传函数，返回值需含 `name`/`url`）、`uploadText`（按钮文案）
- **数组 name 场景必须用 SafeUploadFile**（过滤 id prop），直接用本组件导致 Android nativeID 崩溃（见 safeinput-filter-id）
- 动态数组字段初始值问题见 upload-dynamic-array-initial-value

## 易混淆对比（人工维护）

- **vs `XlbUpload`**：同族底层组件；业务表单的照片/证件/执照上传一律用本组件，不要自写缩略图网格 UI
- **OCR 场景**：在 `customUpload` 内完成上传后调 OCR 识别并 `form.setFieldsValue` 回填；OCR 失败静默处理，允许手动输入（标准写法见 xlbuploadfile-correct-usage）

## 场景绑定（人工维护）

- 照片/证件/执照上传区（label 在上的上下布局块）→ 本组件 + `verticalSection` 样式容器 + 独立 FieldLabel
