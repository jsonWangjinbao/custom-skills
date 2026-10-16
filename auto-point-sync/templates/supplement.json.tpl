{
  "nodeKey": "delivery_note",
  "pages": [
    "deliveryNote"
  ],
  "node": {
    "name": "发货单",
    "category": "SCM",
    "desc": "SCM 发货单（xlb_scm_web PC 业务埋点，chain_id / order_type = delivery_note）",
    "pageId": "xlb_scm_DeliveryNote",
    "pageRoute": "/xlb_scm/deliveryNote/index"
  },
  "pageMeta": {
    "deliveryNote": {
      "pageId": null,
      "pageRoute": null
    }
  },
  "terminalKinds": {
    "deliveryNote.appoint_confirm": "fulfill",
    "deliveryNote.invalid": "close",
    "deliveryNote.batch_delete": "close"
  },
  "remarks": {
    "deliveryNote.doc_relation": "清单外补充：上下游单据关系"
  },
  "analysis": {
    "stateNames": null
  },
  "requirement": "发货单埋点",
  "implAt": "2026-10-14T08:00:00.000Z"
}
