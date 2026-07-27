# RN 代码模式参考

> 本文件包含 RN 平台 build 阶段 Step 4 的代码约束要点和平台特有模式。
> 由 `subskills/rn/03-build.md` 的 `### 2. 读取规范` 步骤引用。

---

## 核心约束

| 约束                     | 说明                                                                                     |
| ------------------------ | ---------------------------------------------------------------------------------------- |
| 组件选择                 | 按「组件选择决策表」选择组件；若标注「需要额外定制」必须在代码中实现补偿方案             |
| Token 唯一来源           | 所有色值/字号/间距必须来自 `token-map.json` 或 theme；禁止硬编码 hex/px                  |
| 优先 parsed-styles       | 使用 parsed-styles 中的 token 映射值，而非从 HTML 重新提取                               |
| 功能完整性优先           | 保留所有已有功能字段、事件、校验、OCR、上传逻辑                                          |
| 表单 name 为字符串       | 不使用数组 name                                                                          |
| 禁止 dependencies prop   | `XlbForm.Item` / `CommonFormItem` 不得传 `dependencies` / `shouldUpdate`                 |
| 联动用 getFieldValue     | 联动校验用 `form.getFieldValue(path)` 在 validator 内；条件渲染用 `useWatch`             |
| 禁止数组 name            | `XlbForm.Item` 的 name 必须为字符串                                                      |

## API 响应取值

standard/full：读 `api-spec.md` 取值路径配置。quick/micro：参考 `features.md` §接口补充。

`response.data` 可能就是顶层，不要再解一层 `.data`。
**注意**：`page` 列表接口返回 `content`，`read` 详情接口可能返回 `data`，两者路径不同，必须按接口逐一确认。

## XlbForm 水平内边距

若 ui-audit.md / parsed-styles 记录了表单项存在水平 padding，必须通过 `XlbForm` 的 `cellTheme` prop 全局设置，而非加到每个 Item 的 style。

## XlbForm.useWatch 调用位置

`useWatch` 必须在 `<XlbForm>` 内部调用，不能在 Form 挂载前或 Form 外部调用。

## onLayout 回调保护

任何 `onLayout` 回调中访问 `e.nativeEvent.layout` 前必须加 null guard：`e?.nativeEvent?.layout?.y`。

## gotchas 按需加载

写代码前用本分组组件列表查 `gotchas-manifest.json`，按 `components` / `keywords` 匹配，只 Read 命中条目。

## 必须添加注释的场景

- 与 H5 源码逻辑对应但 API/实现方式不同的转换函数（标注 H5 原实现方式）
- 绕过框架 bug 的 workaround（标注 bug 原因和修复原理）
- 动态数组操作的边界处理（标注为何需要特殊处理）
- stripPrefix 类的数据变换函数（标注转换规则和调用时机）

## 设计偏差记录

当实现方案与设计稿/UI 审计存在偏差时，在 execution.md 对应分组中记录偏差项、偏差原因和决策依据。
