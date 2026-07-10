# 样式合规扫描清单

执行 `05-verify.md` 时必须逐条检查并产出结果。

1. **无硬编码 hex / magic number**：所有色值/字号/间距来自 `theme['color-...']`、`normalize()`、`fonts.size*`；禁止硬编码。
2. **图标名称已映射**：所有 `XlbIcon` 的 `name` 在 iconfont 映射中存在。
3. **黑盒组件差异已补偿**：`CommonFormItem` / `XlbUploadFile` 等默认渲染差异已记录并处理。
4. **动态表单安全**：数组 `name` 已转字符串，无 nativeID 崩溃风险。
5. **功能未退化**：接口字段、校验逻辑、OCR、上传、删除、事件回调全部保留。
6. **字体规范**：字号来自 `fonts.size*`；字重来自 `fontWeights`。
7. **间距规范**：无随意 `margin/Padding` 数值，优先使用 `normalize()` 或项目 SPACE 常量。
8. **截图 side-by-side**：关键页面/组件已与目标截图逐块对比。
9. **路由/参数一致**：新页面使用项目已有 `useParams` / navigation 模式。
10. **无障碍/可点击区域**：按钮和表单项有足够点击区域。
11. **RN 组件来源合规**：基础组件来自 `@xlb/components-react-native`，图标来自 `@xlb/icon-rn`，未私自引入其他 UI 库。
12. **路由已注册**：新增页面在 `src/config/route.ts` 的 `FsmsRouteKeys` 中注册，跳转使用 `getRouteName('Fsms', key)`。
13. **表单 name 安全**：`XlbForm.Item` 的 `name` 均为字符串，无数组 name。

每条结果格式：

```json
{ "item": "无硬编码 hex", "pass": true, "evidence": "...", "fix": "..." }
```
