# 图标映射表 — HTML/截图 → `@xlb/icon-rn` XlbIcon

> 本表用于 design-to-code 流程中将设计稿（HTML、截图、CSS 类名）中的图标语义映射到项目实际可用的 `XlbIcon` name。
> 任何从 UI 材料中提取到的图标，必须在本表或 `node_modules/@xlb/icon-rn/src/stories/icons/index.ts` 的 `iconfontGlyphMap` 中找到对应 key，否则按「图标缺失」流程处理。

## 核心规则

1. **name 必须来自 `iconfontGlyphMap`**：不允许凭空编造、不允许带 `icon_` 前缀、不允许大小写不一致。
2. **禁止直接 require SVG**：RN 的 `<Image>` 默认不支持 SVG，项目图标统一走 `XlbIcon`。
3. **图标尺寸优先走 `SPACE.*`**：如 `SPACE.SPACE_16`、`SPACE.SPACE_24`。
4. **图标颜色必须走 `theme['color-xxx']`**：禁止写死 hex。
5. **图标缺失时必须标记风险**，禁止用 emoji 或文字符号代替，禁止直接丢弃。

## 图标来源识别

| HTML / CSS 形式                                | 处理方式                                             |
| ---------------------------------------------- | ---------------------------------------------------- |
| `<i class="icon-xxx"></i>`                     | 提取语义，映射为 `XlbIcon name`                      |
| `<img src=".../xxx.svg">`                      | 视为图标，映射为 `XlbIcon name`，不要 `require`      |
| `<svg>...</svg>` 内联                          | 视为图标，映射为 `XlbIcon name`                      |
| `<span class="iconfont">&#xe6xx;</span>`       | 字体图标，提取语义映射为 `XlbIcon name`              |
| 截图中的矢量小图标（无对应 glyph）             | 标记「图标无映射」，选择替代/新增/SVG 兜底方案       |
| `<img src=".../photo.jpg">`                    | 真实图片，使用 `Image` / `XlbImage` + `require`      |
| 照片、头像、证件扫描件、装饰性插画             | 真实图片，使用 `Image` / `XlbImage` + `require`      |

## 常见语义映射表

### 导航与方向

| 设计稿语义         | 推荐 `name`        | 备选 `name`   |
| ------------------ | ------------------ | ------------- |
| 返回 / 左箭头      | `Back`             | `Left`        |
| 右箭头 / 进入      | `a-OutlineRight`   | `Right-1`     |
| 向上 / 展开        | `Up-1` / `Expand`  | `Top`         |
| 向下 / 收起        | `Down-1` / `Collapse` | `Drodownexpand` |
| 更多 / 省略号      | `More`             | —             |
| 菜单 / 列表        | `List` / `Reorder` | —             |

### 操作与状态

| 设计稿语义         | 推荐 `name`        | 备选 `name`      |
| ------------------ | ------------------ | ---------------- |
| 搜索 / 放大镜      | `Search`           | —                |
| 添加 / 加号        | `Add`              | `AddCircle`      |
| 删除 / 垃圾桶      | `Delete`           | `Delete-2`       |
| 编辑 / 笔          | `Edit`             | `Edit-2` / `Edit-3` |
| 关闭 / 叉          | `Close`            | `CloseCircle`    |
| 勾选 / 完成        | `Check`            | `CheckCircle`    |
| 复选框（未选中）   | `Checkbox`         | —                |
| 复选框（选中）     | `Checkbox1`        | `CheckCircle`    |
| 单选框（未选中）   | `Radio`            | —                |
| 减号 / 移除        | `Minus`            | `MinusCircle`    |
| 刷新               | `Refresh`          | `RefreshTime`    |
| 上传               | `Upload`           | `AddPicture`     |
| 下载               | `Download`         | —                |
| 复制               | `Copy`             | —                |
| 全屏               | `Fullscreen`       | `ExitFullscreen` |
| 暂停               | `Pause`            | —                |
| 停止               | `Stop`             | —                |
| 拖拽               | `Drag`             | —                |
| 过滤 / 筛选        | `Filter-1`         | —                |
| 排序升序           | `Asc`              | —                |
| 排序降序           | `Desc`             | —                |

### 信息与提示

| 设计稿语义         | 推荐 `name`        | 备选 `name`   |
| ------------------ | ------------------ | ------------- |
| 提示 / 感叹号      | `Tips`             | `Information` |
| 信息 / 详情        | `Information`      | `FillInformation` |
| 必填 / 红星        | `Required`         | —             |
| 帮助 / 问号        | `QuestionCircle`   | —             |
| 等待 / 加载中      | `WaitCircle`       | `RefreshTime` |

### 业务对象

| 设计稿语义         | 推荐 `name`        | 备选 `name`   |
| ------------------ | ------------------ | ------------- |
| 店铺 / 门店        | `Shop`             | —             |
| 组织 / 部门        | `Org`              | —             |
| 人员 / 用户        | `admin`            | —             |
| 电话               | `Phone`            | `Phone1`      |
| 邮件               | `Mail`             | —             |
| 位置 / 定位        | `Location`         | `Location1`   |
| 日历 / 日期        | `Calendar`         | `Time`        |
| 时间 / 时钟        | `Time`             | `RefreshTime` |
| 文件               | `File`             | `File1`       |
| 文件夹             | `Folder`           | —             |
| 图片               | `Picture`          | `Pic`         |
| 相机 / 拍照        | `Camera`           | —             |
| 扫描               | `Scan`             | —             |
| 发送               | `Send-1`           | `Send-2`      |
| 置顶               | `Pin`              | `Top`         |
| 收藏 / 星标        | `Star`             | `Star1`       |
| 点赞               | `Like`             | `Heart`       |
| 心形 / 喜欢        | `Heart`            | `Heart1`      |
| 银行卡 / 支付      | `Bankcard`         | `PayCircle`   |
| 锁 / 安全          | `Lock`             | `Unlock`      |
| 公告 / 广播        | `Announcement`     | —             |
| 设置               | `Set`              | —             |
| 图层 / 分类        | `Layer`            | —             |
| 模板               | `Template`         | —             |
| 计划               | `Plan`             | `Plan1`       |
| 待办               | `To-Do`            | —             |
| 图表 / 饼图        | `Pie`              | —             |
| 声音 / 音量        | `Sound`            | `SoundMute`   |
| 链接               | `Link`             | —             |
| 点 / 标记          | `Point`            | —             |
| 协作 / 共享        | `Collaborate`      | —             |

### 文件类型

| 设计稿语义         | 推荐 `name`        |
| ------------------ | ------------------ |
| Word 文档          | `Word`             |
| Excel 表格         | `Excel`            |
| PPT 演示文稿       | `PPT`              |
| PDF 文档           | `PDF`              |
| 视频               | `Video`            |
| 音乐 / 音频        | `Music`            |
| 未知文件           | `Unknown`          |
| 确认文件           | `ConfirmFile`      |
| 删除文件           | `DeleteFile`       |

## 图标缺失处理流程

当设计稿中的图标无法在本表或 `iconfontGlyphMap` 中找到精确对应时：

1. **第一步：语义降级匹配**
   - 例如设计稿是「健康证」图标，icon-rn 中无此图标 → 降级为 `File` 或 `ConfirmFile`，并在代码注释中说明
2. **第二步：记录到 ui-audit.md**
   - 格式：`图标无映射：{HTML 元素/截图位置/语义} → 降级为 {name} / 待补充`
3. **第三步：在技术设计阶段决策**
   - 方案 A：接受降级替代（推荐，快速交付）
   - 方案 B：新增本地 SVG 资源（需确认 RN SVG 环境，且代码中使用 `react-native-svg`）
   - 方案 C：推动 UI 将图标补充到 `@xlb/icon-rn`（最规范，但周期长）
4. **第四步：禁止行为**
   - 禁止编造 `name`
   - 禁止用 emoji（`⚠`、`✕`、`+` 等）或文字符号代替
   - 禁止直接丢弃导致 UI 缺元素

## 校验命令

生成代码后，用以下方式自查图标合规：

```bash
# 检查是否有 icon_ 前缀的错误 name
grep -R "name=\"icon_" src/

# 检查是否直接 require svg
grep -R "require(.*\.svg" src/

# 检查是否用 emoji 或文字符号代替图标
grep -R "'⚠'\\|'✕'\\|'+'\\|'✓'\\|'>'" src/
```

> 优先使用 Qoder 的 `Grep` 工具执行上述扫描。
