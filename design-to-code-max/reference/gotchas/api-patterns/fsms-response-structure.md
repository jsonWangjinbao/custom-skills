# FSMS API 响应结构

> 本文件记录 FSMS 项目 API 的通用响应格式，用于生成数据请求代码时的取值参考。
> 违反此规则会导致列表/详情拿到 `undefined`，页面显示空白。

---

## 通用响应格式

FSMS 所有接口（路径前缀 `/fsms/hxl.fsms.*`）的 axios response 结构为：

```jsonc
{
  "data": {
    "code": 0,
    "content": [],            // 列表数据 / 详情对象
    "total_elements": 100,    // 分页总条数（仅列表接口）
    "message": "success"      // 错误信息
  }
}
```

## 核心规则

| 场景 | 错误写法 | 正确写法 |
|------|---------|---------|
| 列表取值 | `res?.data?.data` → `undefined` | `res?.data?.content ?? []` |
| 详情取值 | `res?.data?.data` → `undefined` | `res?.data?.content ?? {}` |
| 分页总数 | `res?.data?.data?.total` → `undefined` | `res?.data?.total_elements ?? 0` |

**一句话：** `response.data` 就是顶层（直接含 `code/content`），**不要多解一层 `.data`**。

## 已工作页面的参考写法

```typescript
// FoodSafety / ProjectDelayReportNew 等已有 RN 页面
const res = await api.getList(params);
setList(res?.data?.content ?? []);       // ✅ 不是 res?.data?.data?.content
setTotal(res?.data?.total_elements ?? 0); // ✅ 不是 res?.data?.data?.total
```

## 排查方法

- 搜索 `?.data?.data` → 如果取到的是 `content` 的子属性，说明多解了一层
- 对比相同接口在已有页面（如 FoodSafety）中的取值方式
- 确认接口前缀：`/fsms/hxl.fsms.*` 的全套接口都遵循此规则
