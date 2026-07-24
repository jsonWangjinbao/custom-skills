---
verifiedVersion: "@xlb/components-mobile@1.0.396"
verifiedAt: "2026-07-14"
---
# 禁止在需要显示 label 的 XlbForm.Item 上传 dependencies prop

**条件**：`XlbForm.Item` 或 `CommonFormItem`（通过 `formItemProps`）收到 `dependencies` 属性。

**现象**：该 Form.Item 的 `label` 不渲染（视觉上标题/字段名消失），但表单值收集正常。

**原因**：`XlbForm.Item` 内部实现中，收到 `dependencies` 属性时会进入 `shouldUpdate` 模式（与 rc-field-form 一致），此模式下 Item 使用 render prop 协议，外层容器**不再渲染**默认的 label 区域。这是组件库的黑盒行为——TypeScript 类型不会报错，编译通过，但运行时 label 消失。

**影响范围**：

- 直接传入：`<XlbForm.Item name="x" label="标题" dependencies={['y']}>` → label "标题" 不显示
- 通过 CommonFormItem：`<CommonFormItem label="有效期止" formItemProps={{dependencies: [...]}}>` → label 不显示
- XlbForm.List 内嵌场景同样受影响

**处理（按场景）**：

1. **联动校验（如结束日期 ≥ 开始日期）**：
   - ❌ 错误：传 `dependencies` 让 validator 拿到关联字段
   - ✅ 正确：在 `rules` 的 validator 中直接用 `form.getFieldValue(path)` 获取关联值，**不传 dependencies**

```tsx
// ❌ 错误 — label 消失
<CommonFormItem
  type="date"
  name={[name, 'end_date']}
  label="有效期止"
  formItemProps={{
    dependencies: [['detail_infos', name, 'start_date']],
  }}
  rules={[{
    validator: (_, val) => {
      const start = form.getFieldValue(['detail_infos', name, 'start_date']);
      return !start || !val || val >= start ? Promise.resolve() : Promise.reject('止≥始');
    }
  }]}
/>

// ✅ 正确 — label 正常显示，validator 直接 getFieldValue
<CommonFormItem
  type="date"
  name={[name, 'end_date']}
  label="有效期止"
  rules={[{
    validator: (_, val) => {
      const start = form.getFieldValue(['detail_infos', name, 'start_date']);
      return !start || !val || val >= start ? Promise.resolve() : Promise.reject('止≥始');
    }
  }]}
/>
```

2. **条件显示/隐藏字段**：使用 `XlbForm.useWatch` 替代 `dependencies`，参照 `usewatch-instead-of-dependencies.md`。

3. **切换时清空字段**：使用 `useWatch` + `useEffect` + `skipClear` 模式，参照 `dependencies-setfieldsvalue-conflict.md`。

**核心规则**：在本项目中，`XlbForm.Item` 的 `dependencies` prop **永远不应出现**。所有需要跨字段联动的场景都必须用 `form.getFieldValue` / `useWatch` 替代。

**检测方法**：

```bash
# 扫描代码中是否存在 dependencies 传入
grep -rn "dependencies" --include="*.tsx" src/pages/
```

出现任何匹配项均视为违规，必须修复。
