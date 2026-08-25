# RN 组件库使用清单（能力卡索引）

> 数据源：`@xlb/components-react-native@1.0.0-beta.217`（业务项目 node_modules 实际版本）
> 由 scripts/dtc-rn-component-cards.mjs 于 2026-08-06 生成，每次组件库升级后必须重跑。
> ✅ 标记表示该卡片的人工维护区（能力边界/易混淆对比/场景绑定）已填写。

## 使用规则（audit 阶段 Step 5 强制）

1. 为 UI 块选组件前，先读本清单定位候选组件，再读对应能力卡的 **Props 能力清单** 与 **关联 Gotchas**
2. 组件选择决策表中必须填写「能力举证」：设计稿要求的交互/功能由哪个 prop/事件承接（引用能力卡条目）
3. 能力卡「场景绑定」区已填写的组件：设计稿特征命中时直接选用，禁止自由发挥
4. 卡片缺失或 Props 与记忆不符时，以 `node_modules/@xlb/components-react-native/src/components/` 源码为准，禁止凭记忆编写

| 组件 | Props 数 | 关联 Gotchas | 卡片 |
| --- | --- | --- | --- |
| `XlbActionSheet` | 0 | — | [卡片](./XlbActionSheet.md) |
| `XlbAppProvider` | 6 | — | [卡片](./XlbAppProvider.md) |
| `XlbBadge` | 11 | — | [卡片](./XlbBadge.md) |
| `XlbBreadcrumb` | 9 | — | [卡片](./XlbBreadcrumb.md) |
| `XlbButton` | 25 | [component-library-style-override](../gotchas/rn-quirks/component-library-style-override.md) | [卡片](./XlbButton.md) |
| `XlbCalendarPicker` | 0 | — | [卡片](./XlbCalendarPicker.md) |
| `XlbCalendarPickerView` | 0 | — | [卡片](./XlbCalendarPickerView.md) |
| `XlbCard` | 5 | — | [卡片](./XlbCard.md) |
| `XlbCascader` | 20 | — | [卡片](./XlbCascader.md) |
| `XlbCell` | 1 | [xlbform-celltheme-horizontal-padding](../gotchas/component-library/xlbform-celltheme-horizontal-padding.md) | [卡片](./XlbCell.md) |
| `XlbCheckList` | 0 | — | [卡片](./XlbCheckList.md) |
| `XlbCheckbox` | 6 | — | [卡片](./XlbCheckbox.md) |
| `XlbCollapse` | 1 | [flex-container-height-collapse](../gotchas/rn-quirks/flex-container-height-collapse.md) | [卡片](./XlbCollapse.md) |
| `XlbCompactDatePicker` | 0 | — | [卡片](./XlbCompactDatePicker.md) |
| `XlbDatePicker` | 8 | [blackbox-wrapper-component](../gotchas/component-library/blackbox-wrapper-component.md)<br>[datepicker-onchange-conflict](../gotchas/component-library/datepicker-onchange-conflict.md)<br>[dynamic-list-independent-component](../gotchas/component-library/dynamic-list-independent-component.md) | ✅ [卡片](./XlbDatePicker.md) |
| `XlbDatePickerView` | 0 | — | [卡片](./XlbDatePickerView.md) |
| `XlbDateRangePicker` | 8 | — | [卡片](./XlbDateRangePicker.md) |
| `XlbDateRangePickerView` | 6 | — | [卡片](./XlbDateRangePickerView.md) |
| `XlbDescription` | 3 | — | [卡片](./XlbDescription.md) |
| `XlbDialog` | 0 | — | [卡片](./XlbDialog.md) |
| `XlbDropdown` | 0 | — | [卡片](./XlbDropdown.md) |
| `XlbDropdownContainer` | 0 | — | [卡片](./XlbDropdownContainer.md) |
| `XlbEllipsis` | 12 | — | [卡片](./XlbEllipsis.md) |
| `XlbEmpty` | 6 | — | [卡片](./XlbEmpty.md) |
| `XlbErrorBoundary` | 1 | — | [卡片](./XlbErrorBoundary.md) |
| `XlbForm` | 5 | [blackbox-wrapper-component](../gotchas/component-library/blackbox-wrapper-component.md)<br>[clearable-input-ios-shadow-value](../gotchas/component-library/clearable-input-ios-shadow-value.md)<br>[datepicker-onchange-conflict](../gotchas/component-library/datepicker-onchange-conflict.md)<br>[dependencies-kills-label](../gotchas/component-library/dependencies-kills-label.md)<br>[dependencies-setfieldsvalue-conflict](../gotchas/component-library/dependencies-setfieldsvalue-conflict.md)<br>[dynamic-list-independent-component](../gotchas/component-library/dynamic-list-independent-component.md)<br>[form-item-render-prop-unreliable](../gotchas/component-library/form-item-render-prop-unreliable.md)<br>[safeinput-filter-id](../gotchas/component-library/safeinput-filter-id.md)<br>[upload-dynamic-array-initial-value](../gotchas/component-library/upload-dynamic-array-initial-value.md)<br>[usewatch-instead-of-dependencies](../gotchas/component-library/usewatch-instead-of-dependencies.md)<br>[xlbform-celltheme-horizontal-padding](../gotchas/component-library/xlbform-celltheme-horizontal-padding.md)<br>[xlbuploadfile-correct-usage](../gotchas/component-library/xlbuploadfile-correct-usage.md)<br>[font-weight-cross-platform-visual-diff](../gotchas/rn-quirks/font-weight-cross-platform-visual-diff.md) | ✅ [卡片](./XlbForm.md) |
| `XlbIcon` | 3 | [datepicker-onchange-conflict](../gotchas/component-library/datepicker-onchange-conflict.md)<br>[icon-name-mismatch](../gotchas/component-library/icon-name-mismatch.md)<br>[icon-overlay-pattern](../gotchas/component-library/icon-overlay-pattern.md)<br>[force-full-element-mapping](../gotchas/html-parsing/force-full-element-mapping.md) | ✅ [卡片](./XlbIcon.md) |
| `XlbImage` | 15 | — | [卡片](./XlbImage.md) |
| `XlbInput` | 31 | [blackbox-wrapper-component](../gotchas/component-library/blackbox-wrapper-component.md)<br>[clearable-input-ios-shadow-value](../gotchas/component-library/clearable-input-ios-shadow-value.md)<br>[dependencies-setfieldsvalue-conflict](../gotchas/component-library/dependencies-setfieldsvalue-conflict.md)<br>[safeinput-filter-id](../gotchas/component-library/safeinput-filter-id.md)<br>[text-input-explicit-fontfamily](../gotchas/rn-quirks/text-input-explicit-fontfamily.md) | ✅ [卡片](./XlbInput.md) |
| `XlbInputNumber` | 18 | — | [卡片](./XlbInputNumber.md) |
| `XlbLoading` | 4 | — | [卡片](./XlbLoading.md) |
| `XlbNavbar` | 13 | [component-library-style-override](../gotchas/rn-quirks/component-library-style-override.md) | [卡片](./XlbNavbar.md) |
| `XlbNoticeBar` | 3 | — | [卡片](./XlbNoticeBar.md) |
| `XlbPageContainer` | 12 | — | [卡片](./XlbPageContainer.md) |
| `XlbPicker` | 8 | [datepicker-onchange-conflict](../gotchas/component-library/datepicker-onchange-conflict.md) | [卡片](./XlbPicker.md) |
| `XlbPickerView` | 11 | — | [卡片](./XlbPickerView.md) |
| `XlbPopover` | 0 | — | [卡片](./XlbPopover.md) |
| `XlbPopup` | 17 | — | [卡片](./XlbPopup.md) |
| `XlbPreview` | 0 | — | [卡片](./XlbPreview.md) |
| `XlbPrice` | 14 | — | [卡片](./XlbPrice.md) |
| `XlbProgress` | 0 | — | [卡片](./XlbProgress.md) |
| `XlbSearchBar` | 13 | [text-input-explicit-fontfamily](../gotchas/rn-quirks/text-input-explicit-fontfamily.md) | [卡片](./XlbSearchBar.md) |
| `XlbSegmented` | 7 | — | [卡片](./XlbSegmented.md) |
| `XlbSelector` | 16 | [blackbox-wrapper-component](../gotchas/component-library/blackbox-wrapper-component.md)<br>[dependencies-setfieldsvalue-conflict](../gotchas/component-library/dependencies-setfieldsvalue-conflict.md)<br>[safeinput-filter-id](../gotchas/component-library/safeinput-filter-id.md) | ✅ [卡片](./XlbSelector.md) |
| `XlbShow` | 0 | — | [卡片](./XlbShow.md) |
| `XlbSidebar` | 10 | — | [卡片](./XlbSidebar.md) |
| `XlbSteps` | 0 | — | [卡片](./XlbSteps.md) |
| `XlbSwipeListView` | 2 | — | [卡片](./XlbSwipeListView.md) |
| `XlbSwiper` | 10 | — | [卡片](./XlbSwiper.md) |
| `XlbSwitch` | 17 | — | [卡片](./XlbSwitch.md) |
| `XlbTabBar` | 0 | [flex-container-height-collapse](../gotchas/rn-quirks/flex-container-height-collapse.md) | [卡片](./XlbTabBar.md) |
| `XlbTabs` | 0 | [flex-container-height-collapse](../gotchas/rn-quirks/flex-container-height-collapse.md) | [卡片](./XlbTabs.md) |
| `XlbTag` | 5 | — | [卡片](./XlbTag.md) |
| `XlbText` | 6 | [datepicker-onchange-conflict](../gotchas/component-library/datepicker-onchange-conflict.md)<br>[form-item-render-prop-unreliable](../gotchas/component-library/form-item-render-prop-unreliable.md)<br>[force-full-element-mapping](../gotchas/html-parsing/force-full-element-mapping.md)<br>[flex-start-text-align-center-conflict](../gotchas/rn-quirks/flex-start-text-align-center-conflict.md)<br>[text-input-explicit-fontfamily](../gotchas/rn-quirks/text-input-explicit-fontfamily.md) | [卡片](./XlbText.md) |
| `XlbTimeLine` | 6 | — | [卡片](./XlbTimeLine.md) |
| `XlbToast` | 0 | — | [卡片](./XlbToast.md) |
| `XlbToastRoot` | 12 | — | [卡片](./XlbToastRoot.md) |
| `XlbTree` | 18 | — | [卡片](./XlbTree.md) |
| `XlbUpload` | 0 | [datepicker-onchange-conflict](../gotchas/component-library/datepicker-onchange-conflict.md)<br>[icon-overlay-pattern](../gotchas/component-library/icon-overlay-pattern.md)<br>[upload-dynamic-array-initial-value](../gotchas/component-library/upload-dynamic-array-initial-value.md)<br>[xlbuploadfile-correct-usage](../gotchas/component-library/xlbuploadfile-correct-usage.md) | [卡片](./XlbUpload.md) |
| `XlbUploadFile` | 0 | [blackbox-wrapper-component](../gotchas/component-library/blackbox-wrapper-component.md)<br>[safeinput-filter-id](../gotchas/component-library/safeinput-filter-id.md)<br>[xlbuploadfile-correct-usage](../gotchas/component-library/xlbuploadfile-correct-usage.md) | ✅ [卡片](./XlbUploadFile.md) |
