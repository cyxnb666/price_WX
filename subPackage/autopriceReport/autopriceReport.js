// pricingTask.js

import {
  ownerselectICollectPriceTasks,
  removeOwnerCollectPrice,
  withdrawCollectPrice
} from "../../utils/api";
import {
  Toast
} from "tdesign-miniprogram";

Page({
  data: {
    disabled: false,
    cellOpend: false,
    showConfirm: false,
    autoPriceItem: {},
    confirmBtn: {
      content: '确定',
      variant: 'base'
    },
    queryForm: {
      condition: {
        stallName: '',
        status: '',
      },
      pageNo: 1,
      pageSize: 10,
    },
    statusOptions: [{
        value: '',
        label: '全部',
      },
      {
        value: '3',
        label: '暂存',
      },
      {
        value: '4',
        label: '待审核',
      },
      {
        value: '5',
        label: '已完成',
      },
    ],
    taskStatus: {
      "3": "暂存",
      "4": "待审核",
      "5": "已完成",
    },
    taskStatusColor: {
      '3': "primary",
      '4': "success",
      '5': "success",
    },
    pricingTaskList: [],
    refresherTriggered: false,
    total: 0,
  },
  onShow() {
    this.onSearch(true)
  },
  onChange(e) {
    this.setData({
      'queryForm.condition.status': e.detail.value,
    });
    this.onSearch(true)
  },
  toast(message, theme) {
    Toast({
      context: this,
      selector: '#t-toast',
      message: message,
      theme: theme,
      direction: 'column',
      preventScrollThrough: true,
    });
  },
  submit() {
    wx.navigateTo({
      url: `/subPackage/auroPriceDetail/auroPriceDetail`,
    })
  },
  bindBlur(e) {
    this.setData({
      'queryForm.condition.stallName': e.detail.value,
    });
    this.onSearch(true)
  },
  closeDialog(e) {
    let that = this
    console.log(e, '---', that.data.autoPriceItem)
    if (e.type == 'confirm') {
      let params = {}
      if (that.data.autoPriceItem.priceStatus === '3') {
        params = {
          "condition": {
            "primaryKeys": [that.data.autoPriceItem.collectPriceId]
          }
        }
      } else {
        params = {
          "condition": {
            "primaryKey": that.data.autoPriceItem.collectPriceId
          }
        }
      }
      let RequestUrl = that.data.autoPriceItem.priceStatus === '3' ? removeOwnerCollectPrice : withdrawCollectPrice
      RequestUrl(params).then(res => {
        that.toast(that.data.autoPriceItem.priceStatus === '3' ? '删除成功' : '取消审核成功', 'warning')
        this.onSearch(true)
      }).finally(() => {
        that.setData({
          showConfirm: false,
          cellOpend: false,
          autoPriceItem: {},
        })
      })
    } else {
      this.setData({
        showConfirm: false,
        cellOpend: false
      })
    }

  },
  onDelete(e) {
    const {
      item
    } = e.currentTarget.dataset
    this.setData({
      showConfirm: true,
      autoPriceItem: item
    })
  },
  onSearch(value = true) {
    console.log('刷新')
    if (value) {
      this.setData({
        'queryForm.pageNo': 1,
      });
    }
    ownerselectICollectPriceTasks(this.data.queryForm).then((res) => {
      this.setData({
        total: res.total,
        pricingTaskList: value ? res.records : this.data.pricingTaskList.concat(res.records)
      })
    }).finally(() => {
      this.setData({
        refresherTriggered: false
      })
    })
  },
  pageTurning() {
    console.log('翻页')
    if (this.data.queryForm.pageNo < (this.data.total / this.data.queryForm.pageSize)) {
      this.setData({
        'queryForm.pageNo': this.data.queryForm.pageNo + 1,
      }, () => {
        this.onSearch(false)
      })
    }
  },
  toDetail(e) {
    const {
      collectPriceId,
      priceStatus
    } = e.currentTarget.dataset.item;
    // if(priceStatus == '3'){
    wx.navigateTo({
      url: `/subPackage/auroPriceDetail/auroPriceDetail?collectPriceId=${collectPriceId}`,
    })
    // }

  }
})