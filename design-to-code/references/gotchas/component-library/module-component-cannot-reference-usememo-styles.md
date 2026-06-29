# 模块级组件不能引用 useMemo 创建的 styles

**条件**：在组件外部定义了子组件函数，但 `styles` 在父组件内部通过 `useMemo(() => StyleSheet.create(...))` 创建。

**原因**：模块级子组件无法访问父组件作用域内的变量。会报 `Property 'styles' doesn't exist`。

**处理**：将 `styles` 作为 prop 传递给子组件，或将子组件定义移到父组件内部。
