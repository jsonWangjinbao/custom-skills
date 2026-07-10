# 禁止对需批量回填的字段使用 dependencies；用 useWatch + skipClear 替代

**条件**：表单字段 A 的值需要在「切换字段 B 时清空」，同时 `form.setFieldsValue` 会批量回填所有字段。

**原因**：`XlbForm.Item` 的 `dependencies={['fieldB']}` 在 rc-field-form 内部会注册依赖关系。当 `form.setFieldsValue({ fieldB: 'xxx', fieldA: 'yyy' })` 被调用时，rc-field-form 检测到 `fieldB` 被设置，触发 `fieldA` 的依赖重建，**丢弃**了同批次刚设入的 `fieldA` 值。现象：`fieldA` 在接口有返回值的情况下页面始终显示为空。

**处理**：
1. 去掉 `XlbForm.Item` 上的 `dependencies={['card_type']}`
2. 用 `useWatch('card_type')` + `useEffect` 手动监听变化
3. 用 ref 标记初始化阶段（如 `setTimeout(() => skipClear = false, 500)`），**跳过数据回填期间的误触发**
4. 初始化完成后，检测到 `card_type` 变化才执行清空逻辑

**正确示例**：
```tsx
// ❌ 错误：dependencies 会在批量 setFieldsValue 时丢弃值
<XlbForm.Item name="foodname" dependencies={['card_type']} rules={[...]}>
  <XlbInput ... />
</XlbForm.Item>

// ✅ 正确：useWatch + useEffect + skipClear
const cardType = XlbForm.useWatch('card_type');
const prevCardType = useRef<string | undefined>(undefined);
const skipClear = useRef(true);
useEffect(() => {
  const timer = setTimeout(() => { skipClear.current = false; }, 500);
  return () => clearTimeout(timer);
}, []);
useEffect(() => {
  if (skipClear.current) { prevCardType.current = cardType; return; }
  if (prevCardType.current !== undefined && prevCardType.current !== cardType) {
    form.setFieldsValue({ foodname: '', foodcredit_code: '', foodlegal_person: '', foodbusiness_scopes: '', foodfiles: [] });
  }
  prevCardType.current = cardType;
}, [cardType]);

// Form.Item 上不写 dependencies
<XlbForm.Item name="foodname" rules={[...]}>
  <XlbInput ... />
</XlbForm.Item>
```

**FormItemContainer 的 onChange 覆盖问题**（配套规则）：`FormItemContainer` 在克隆子元素时会执行 `[trigger]: onChange`，这会**覆盖**子组件上用户自定义的 `onChange` prop，替换为 rc-field-form 的内部 `onChange`。因此 **XlbSelector 的 onChange prop 实际上不会被执行**，所有需要通过 onChange 实现的逻辑都必须改用 `useWatch` + `useEffect`。
