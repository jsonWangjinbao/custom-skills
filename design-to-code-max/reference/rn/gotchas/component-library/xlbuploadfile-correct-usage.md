---
verifiedVersion: "@xlb/components-mobile@1.0.396"
verifiedAt: "2026-07-14"
---
# XlbUploadFile / SafeUploadFile 正确用法

**条件**：需要实现文件/照片上传功能。

**核心规则**：

1. **字符串 name** → 直接用 `XlbUploadFile`
2. **数组 name**（如 `detail_infos[N].files`）→ 必须用 `SafeUploadFile`（过滤 id prop，防止 Android nativeID 崩溃）

**XlbUploadFile 默认行为**：

- 图片文件自动以**缩略图网格**渲染（非文件列表）
- 自带删除按钮、预览功能
- 无需传 `renderItem`、`thumbnailSize`、`gridMode` 等 props（**这些 props 不存在**）
- `mode` 只有 `'edit' | 'look'` 两个值（编辑/查看模式），不是渲染样式切换器

**必传 props**：

| Prop           | 说明                         | 示例         |
| -------------- | ---------------------------- | ------------ |
| `filesMax`     | 最大上传数量                 | `9`          |
| `customUpload` | 自定义上传函数（上传到云端） | 见下方示例   |
| `uploadText`   | 上传按钮文字                 | `"上传照片"` |

**正确示例（已上线代码）**：

```tsx
// 1. customUpload 函数
const customUpload = useCallback(async (files: any[]) => {
  const uploaded = await Promise.all(
    files.map(async (file: any) => {
      const rawFile = file.file || file;
      const res = await uploadStoreFile(rawFile);
      return {
        ...res,
        name: res?.name || file.name,
        url: res?.url || res?.path || file.url,
      };
    }),
  );
  return uploaded;
}, []);

// 2. 字符串 name（直接用 XlbUploadFile 或 SafeUploadFile 均可）
<View style={styles.verticalSection}>
  <FieldLabel text="上传营业执照照片" required />
  <XlbForm.Item name="files" rules={[{required: true, message: '请上传照片'}]} noStyle>
    <SafeUploadFile filesMax={9} customUpload={customUpload} uploadText="上传照片" />
  </XlbForm.Item>
</View>

// 3. 数组 name（必须用 SafeUploadFile）
<XlbForm.Item name={['detail_infos', index, 'files']} noStyle>
  <SafeUploadFile filesMax={10} customUpload={customUpload} uploadText="上传照片" />
</XlbForm.Item>
```

**OCR 场景（上传 + 识别回填）**：

```tsx
const idCardUpload = useCallback(
  async (files: any[], index: number) => {
    const uploaded = await Promise.all(
      files.map(async (file: any) => {
        const rawFile = file.file || file;
        const res = await uploadStoreFile(rawFile);
        return {
          ...res,
          name: res?.name || file.name,
          url: res?.url || res?.path || file.url,
        };
      }),
    );
    // OCR 识别 → 字段回填
    if (uploaded.length > 0 && uploaded[0]?.url) {
      try {
        const ocrRes = await ocrRecognize({
          type: "ID_CARD",
          url: uploaded[0].url,
          side: true,
        });
        const idNumber = ocrRes?.data?.id_card?.front?.id_number;
        if (idNumber) {
          const detailInfos = form?.getFieldValue("detail_infos") || [];
          detailInfos[index] = { ...detailInfos[index], id_card: idNumber };
          form?.setFieldsValue({ detail_infos: detailInfos });
        }
      } catch {
        // OCR 失败静默处理，用户可手动输入
      }
    }
    return uploaded;
  },
  [form],
);

// 使用
<SafeUploadFile
  filesMax={2}
  customUpload={(files) => idCardUpload(files, index)}
  uploadText="上传照片"
/>;
```

**布局模式**：上传区域属于「上下布局」（label 在上，上传区在下），使用 `verticalSection` 样式容器包裹。

**常见错误**：

- ❌ 传 `renderItem` prop（不存在）
- ❌ 传 `thumbnailSize` prop（不存在）
- ❌ 传 `mode="grid"` 或 `mode="thumbnail"`（mode 只有 edit/look）
- ❌ 自己写缩略图网格 UI 替代 XlbUploadFile（组件默认已是缩略图）
- ❌ 数组 name 场景用 XlbUploadFile 而非 SafeUploadFile（会导致 Android 崩溃）
