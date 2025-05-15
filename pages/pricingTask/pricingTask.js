// pricingTask.js

import {
  selectICollectPriceTasks
} from "../../utils/api";

Page({
  data: {
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
        value: '2',
        label: '待采价',
      },
      {
        value: '3',
        label: '采价中',
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
      "0": '暂存',
      "1": '待认领',
      "2": '待采价',
      "3": '采价中',
      "4": '待审核',
      "5": '已完成',
    },
    taskStatusColor:{
      '0': 'primary',
      '1': 'danger',
      '2': 'primary',
      '3': "warning",
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
  clearIpt(){
    this.setData({
      'queryForm.condition.stallName':'',
    });
    this.onSearch(true)
  },
  bindBlur(e) {
    this.setData({
      'queryForm.condition.stallName': e.detail.value,
    });
    this.onSearch(true)
  },
  onSearch(value = true) {
    console.log('刷新')
    if (value) {
      this.setData({
        'queryForm.pageNo': 1,
      });
    }
    selectICollectPriceTasks(this.data.queryForm).then((res) => {
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
    console.log(e)
    // if (!['4', '5'].includes(e.currentTarget.dataset.taskstatus)) {
      wx.navigateTo({
        url: `/pages/pricingTaskDetail/pricingTaskDetail?id=${e.currentTarget.dataset.id}&taskStatus=${e.currentTarget.dataset.taskstatus}`,
      })
    // }

  }
})