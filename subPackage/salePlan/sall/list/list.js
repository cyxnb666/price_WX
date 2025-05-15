// components/listComponents/index.js
import {
  selectILargeSalePlans,
  recvSalePlans
} from "../../../../utils/api"
Page({

  /**
   * 页面的初始数据
   */
  data: {
    cellOpend: false,
    refresherTriggered: false,
    list: [],
    statusOptions: [{
        value: '',
        label: '全部',
      },
      {
        value: '0',
        label: '待提交',
      },
      {
        value: '2',
        label: '待采价',
      },
      {
        value: '3',
        label: '已完成',
      },
    ],
    queryForm: {
      condition: {
        stallName: '',
        status: '',
      },
      pageNo: 1,
      pageSize: 10,
    },
    total: 0,
    taskStatus: {
      '0': '暂存',
      '1': '待认领',
      '2': '待采价',
      '3': "采价中",
      '4': "待审核",
      '5': "已完成",
    },
    taskStatusColor:{
      '0': 'primary',
      '1': 'danger',
      '2': 'primary',
      '3': "warning",
      '4': "success",
      '5': "success",
    }
  },
  onShow(){
    this.onSearch(true)
  },

  /**
   * 组件的方法列表
   */
  onSearch(value = true) {
    if (value) {
      this.setData({
        'queryForm.pageNo': 1,
      });
    }
    selectILargeSalePlans(this.data.queryForm).then((res) => {
      let list = res.records.map(v=>{
        v.planSaleWeight = (Number(v.planSaleWeight) / 1000).toFixed(2)
        return v
      })
      this.setData({
        total: res.total,
        list: value ? list : this.data.list.concat(list)
      })
      console.log(this.data)
    }).finally(() => {
      this.setData({
        refresherTriggered: false
      })
    })
  },
  submit(){
    wx.navigateTo({
      url: '/subPackage/salePlan/sall/addSalePlan/addSalePlan',
    })
  },
  bindBlur(e) {
    this.setData({
      "queryForm.condition.stallName": e.detail.value
    })
    this.onSearch(true)
  },
  toDetail(e) {
    const {planId, stallId,stallName,taskStatus,collectPriceId} = e.currentTarget.dataset.item
    // wx.navigateTo({
    //   url: '/subPackage/salePlan/sall/addSalePlan/addSalePlan?planId=' + planId,
    // })
    console.log(e)
    if(taskStatus == '0'){
      wx.navigateTo({
        url: '/subPackage/salePlan/sall/addSalePlan/addSalePlan?planId=' + planId,
      })
    } else {
        wx.navigateTo({
          url: `/subPackage/salePlan/sall/priceSend/priceSend?planId=${planId}&stallId=${stallId}&stallName=${stallName}&collectPriceId=${collectPriceId}&taskStatus=${taskStatus}&delta=1`,
        })
    }

  },
  // 认领
  onClaim(e) {
    console.log(e)
    let params = {
      "condition": {
        "primaryKey": e.target.dataset.id
      }
    }
    recvSalePlans(params).then(res => {
      this.onSearch(true);
      this.setData({
        cellOpend: false,
      })
    }).catch(() => {
      this.setData({
        cellOpend: false,
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
  onChange(e) {
    this.setData({
      'queryForm.condition.status': e.detail.value,
    });
    this.onSearch(true)
  },
})