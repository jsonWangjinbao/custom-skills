# 样式合规扫描清单（合并版）

执行 Phase 04 出口门禁和 Phase 05 自测验证时，必须逐条检查并产出结果。

**执行时机**：所有功能点实现完成、所有分组标记 ✅ 之后，再执行本清单。**不要**在执行中途为了通过本清单而简化功能。

**扫描工具**：优先使用 `Grep` 工具在项目目录内搜索上述模式；不要仅凭肉眼检查。

**修复原则**：只改样式表达，不改功能逻辑。不要把 `validationErrorsStore` 删掉来通过扫描；不要把 `SafeUpload` 简化为 `XlbUploadFile`。

---

## 颜色与 Token

1. **无硬编码 hex / rgb**：搜索 `#` 和 `rgba(` / `rgb(`。若命中，确认是否为必须保留的例外（如 SVG 属性、第三方组件透传），否则替换为 `theme['xxx']`。
2. **配置文件中的硬编码颜色**：重点扫描 `constants.ts`、`theme.ts`、`config.ts` 等常量文件中的 `color: '#...'`、`borderColor: '#...'`，统一替换为 theme key。
3. **字体规范**：字号来自 `fonts.size*` 或 `FONT.SIZE_N`；字重来自 `fontWeights` 或 `FONT.BOLD_xxx`。搜索 `fontSize: \d+`、`fontWeight: '\d+'` 检查。

## 间距与尺寸

4. **magic number 间距/圆角**：搜索 `padding: \d+`、`margin: \d+`、`borderRadius: \d+`、`gap: \d+`，替换为 `SPACE.* / BORDER.*` 或 `normalize()`。
5. **normalize 滥用**：搜索 `normalize(\d+)` 出现在 padding/margin/borderRadius/fontSize/lineHeight 场景，优先替换为 `SPACE.* / BORDER.* / FONT.*`。

## 图标与图片

6. **图标名称已映射**：搜索 `XlbIcon name=` 并对照 `iconfontGlyphMap`（见 `reference/icon-map.md`）校验，未命中则修正为最接近的 key。
7. **图标 name 前缀错误**：搜索 `name="icon_` / `name='icon_` / `name={"icon_` 等错误前缀。
8. **emoji / 文字符号代替图标**：搜索 `'⚠'`、`'✕'`、`'+'`、`'✓'` 等作为 UI 图标使用，替换为 `XlbIcon`。
9. **直接 require SVG 文件**：搜索 `require(.*\.svg)`，RN 项目中应替换为 `XlbIcon` 或标记「图标无映射」风险。

## 组件与架构

10. **RN 组件来源合规**：基础组件来自 `@xlb/components-react-native`，图标来自 `@xlb/icon-rn`，未私自引入 `antd-mobile-rn` 或其他 UI 库。
11. **深路径 import 组件库**：搜索 `from '@xlb/components-react-native/src/...'`，改为从包入口导入。
12. **自定义组件替代组件库**：确认新增 View/Text/Pressable 是否可用 `XlbCard/XlbText/XlbButton` 替代。
13. **黑盒组件差异已补偿**：`CommonFormItem` / `XlbUploadFile` 等默认渲染差异已记录并处理。引用 `reference/gotchas/component-library/blackbox-wrapper-component.md`。

## 表单安全

14. **动态表单安全**：搜索 `name={[` 检查数组 name。如有数组 name，其直接子组件必须为 `SafeInput` / `SafeUploadFile`，否则替换。引用 `reference/gotchas/component-library/safeinput-filter-id.md`。
15. **表单 name 安全**：`XlbForm.Item` 的 `name` 均为字符串，无数组 name。

## 功能完整性

16. **功能未退化**：接口字段、校验逻辑、OCR、上传、删除、事件回调全部保留。
17. **API 字段完整**：不遗漏 `id_card_encrypted`、OCR 结果、上传回调字段等。

## 路由

18. **路由已注册**：新增页面在 `src/config/route.ts` 的 `FsmsRouteKeys` 中注册，跳转使用 `getRouteName('Fsms', key)`。
19. **路由/参数一致**：新页面使用项目已有 `useParams` / navigation 模式。

## 视觉还原

20. **截图 side-by-side**：关键页面/组件已与目标截图逐块对比（卡片结构、行高、对齐方式、组件库控件默认渲染偏差）。

## 无障碍

21. **可点击区域**：按钮和表单项有足够点击区域。

## 布局完整性

22. **布局完整性检查（flex 链塌缩防护）**：
    - 所有 `XlbTabs` 的直接父 View 包含 `flex: 1` 或确定高度
    - 所有 `ScrollView` 有 `flex: 1` 或确定高度
    - 所有 `FlatList` / `XlbList` 有确定高度或 `flex: 1`
    - 绝对定位容器（`position: 'absolute'`）有确定宽高
    - 页面最外层容器有 `flex: 1`
    - **检查方式**：`Grep` 搜索 `XlbTabs|ScrollView|FlatList|XlbList`，验证其直接父容器样式
    - **未通过处理**：标记 ❌ 并补充 `flex: 1` 或确定高度，禁止为修复布局而删除功能组件
    - **参考文件**：`reference/gotchas/rn-quirks/flex-container-height-collapse.md`

---

## 项目约定例外

如果项目已建立某种约定模式（如全项目使用 `normalize()` 而非 `SPACE.*` 常量，或 `fontWeight: '500'` 而非 `fontWeights` 常量），则遵循项目约定，不强制替换。在扫描报告中标注「项目约定模式，跳过」。

## 结果输出格式

每条结果格式：

```json
{
  "item": "无硬编码 hex",
  "pass": true,
  "evidence": "所有色值来自 theme['color-xxx']",
  "fix": ""
}
```

未通过时：

```json
{
  "item": "上传组件保留删除功能",
  "pass": false,
  "evidence": "缺少 showDelete 属性",
  "fix": "XlbUploadFile 传入 showDelete=true"
}
```
