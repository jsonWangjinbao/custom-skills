---
verifiedVersion: "n/a"
verifiedAt: "2026-07-14"
---
# UI 结构变更时字段映射遗漏

## 问题描述

当需求涉及 UI 结构变更（如旧 H5 的 4 个 Tab 重构为新 RN 的 5 个锚点 section），build 阶段在将 `features.md` 的旧分区字段映射到新 UI 结构时，容易**整体遗漏某个子区块的字段**。

## 典型案例（FSMS-商品自检自查详情页）

### 旧 H5 结构（features.md 中记录的分区）
```
Tab1 基本信息: F-40, F-41, F-42, F-42-a
Tab2 质量提报: F-43, F-44
Tab3 问题处理: F-45 ◀── 包含「处理信息」和「相关人信息」两个逻辑子区块
Tab4 审批记录: F-46
```

### 新 RN 结构（ui-audit.md 识别的设计变更）
```
Section 0 商品信息 (原 Tab1 子集)
Section 1 基本信息 (原 Tab1 子集)
Section 2 提报信息 (原 Tab2)
Section 3 问题处理 (原 Tab3 子集) ◀── 只映射了「处理信息」子块
Section 4 审批记录 (原 Tab4)
```

### 遗漏的字段
F-45 "相关人信息"子区块的全部字段被遗漏：
- `find_name`（发现人，SELF 显示）
- `customer_name`（顾客姓名，CUSTOMER 显示）
- `tel`（联系电话）
- `alipay_account`（支付宝账号，SELF 显示）
- `amount`（金额，SELF 显示）
- `custom_demand`（诉求，CUSTOMER 显示）
- 供应商处理凭证（HANDLE_PASS 显示）

### 根本原因
1. `features.md` 按**旧代码**的分区结构组织字段，一个功能点（F-45）包含多个逻辑子区块
2. build 阶段 agent 在"旧分区 → 新分区"重映射时，只映射了主区块，**子区块字段被静默丢弃**
3. 没有强制 agent 逐字段枚举并确认归属——agent 凭直觉做映射

## 修复方案

### 在 build Step 4 强制执行字段分配表（已加入 04-build.md）

```markdown
在 UI 结构变更场景下，写代码前必须输出字段分配表，格式：
| 功能点 ID | 字段 | features.md 原归属 | → 新 UI section | 条件显示 |
```

零遗漏规则：
- 正向：features.md 每个字段都必须在表中有一行
- 反向：表中每个字段都必须在代码中出现

### 额外检查清单

生成详情页/列表页等"展示型"页面时额外检查：
- [ ] `features.md` 中所有条件显隐表的条目是否在代码中有对应的条件渲染
- [ ] `parsed-styles` JSON 中每个有业务语义的容器元素是否有代码对应
- [ ] 一个功能点包含多个逻辑子区块时，是否每个子区块都被映射

## 发现时间

2026-07-09 — FSMS-商品自检自查详情页 build 阶段遗漏 11 个字段
