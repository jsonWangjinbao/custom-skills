# 组件容器 flex 链塌缩导致内容不显示

## 现象

生成的 RN 页面中，某些组件（如 XlbTabs、ScrollView、列表）内容完全不显示，只有外壳或标签栏可见。

## 根因

RN 布局默认 `flexDirection: 'column'`，当容器或其祖先缺少确定的高度或 `flex: 1` 约束时，其计算高度变为 0。

## 案例 1：XlbTabs 内容白屏

**症状**：Tab 标签栏可见，但 TabView 内容区完全空白。

**原因**：

- XlbTabs 底层 Tabs 组件使用 React Fragment（`<>...</>`）渲染 TabBar + TabView[]，不创建自己的 flex 容器
- TabView 使用 `flex: 1` 填充父容器，但若父容器无高度约束，flex: 1 解析为 0

**修复**：

```tsx
// ❌ 错误：父 View 无高度约束
<View style={{ backgroundColor: '#fff' }}>
  <XlbTabs ... />
</View>

// ✅ 正确：父 View 有 flex: 1
<View style={{ flex: 1, backgroundColor: '#fff' }}>
  <XlbTabs ... />
</View>
```

## 案例 2：ScrollView 内容不显示

**修复**：为 ScrollView 或其父容器添加 `flex: 1` 或确定高度。

## 案例 3：FlatList/XlbList 无项显示

**修复**：为列表添加 `flex: 1` 或确定高度。

## 案例 4：绝对定位容器不可见

**修复**：为绝对定位容器明确指定宽高。

## 生成代码时防止清单

- [ ] XlbTabs 的直接父容器有 `flex: 1`
- [ ] ScrollView 有高度约束
- [ ] FlatList/XlbList 有高度约束
- [ ] 绝对定位有宽高
- [ ] 页面最外层 View 有 `flex: 1`
