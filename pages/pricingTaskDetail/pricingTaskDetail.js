// pricingTaskDetail.js
import {
  addTaskStalls,
  getWxCollecpriceTask,
  removeStall,
  selectTaskChooseStalls,
  submitCollectPriceTask,
  actualCollectRate
} from "../../utils/api";
import {
  Toast
} from "tdesign-miniprogram";

Page({
  data: {
    refresherTriggered: false,
    pricingTaskDetail: {
      areaname: null,
      varietyName: null,
      collectTypeCnm: null,
      collectRate: null,
      collectBgnDate: null,
      actualCollectRate: null,
      stalls: []
    },
    taskId: null,
    submitLoading: false,
    confirmLoading: false,
    visible: false,
    pricingPoint: [],
    selectedPricingPoint: [],
    disabled:false,
    stallName:'',
    taskStatus: {
      "0": '暂存',
      // "1": '待认领',
      // "2": '待采价',
      "3": '暂存',
      "4": '待审核',
      "5": '已完成',
    },
  },
  onShow(){
    this.data.taskId && this.getDetails()
  },
  onLoad: function (options) {
    console.log(options,'op')
    this.setData({
      taskId: options.id,
      disabled:['4','5'].includes(options.taskStatus)
    }, () => {
      // this.getDetails()
    })
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
  searchStall(){
    let params = {
      condition: {
        primaryKey:this.data.pricingTaskDetail.taskId,
        stallName:this.data.stallName
      }
    }
    selectTaskChooseStalls(params).then((res) => {
      this.setData({
        pricingPoint: res.length ? res.map((item) => {
          return {
            label: item.stallName,
            value: item.stallId
          }
        }) : [],
      })
      console.log(this.data.pricingPoint)
    })
    console.log('sousuo ')
  },
  actionHandle(){
    console.log('sou11suo ')
    this.setData({
      stallName:'',
    });
    this.searchStall()
  },
  changeHandle(e) {
    const { value } = e.detail;
    this.setData({
      stallName:value,
    });
  },
  getCollectRate() {
    const params = {
      condition: {
        primaryKey: this.data.taskId
      }
    }
    actualCollectRate(params).then((res) => {
      this.setData({
        "pricingTaskDetail.actualCollectRate": res || 0
      })
    }).finally(() => {
      this.setData({
        refresherTriggered: false
      })
    })
  },
  getDetails() {
    const params = {
      condition: {
        primaryKey: this.data.taskId
      }
    }
    getWxCollecpriceTask(params).then((res) => {
      this.setData({
        pricingTaskDetail: res
      })
    }).finally(() => {
      this.setData({
        refresherTriggered: false
      })
      this.getCollectRate()
    })
  },
  goBack() {
    wx.navigateBack({
      delta: 1,
      success: (res) => {},
      fail: (res) => {},
      complete: (res) => {},
    })
    // wx.navigateTo({
    //   url: '/pages/pricingTask/pricingTask'
    // })
  },
  toPricingDetail(e) {
    console.log(e.currentTarget.dataset)
    // if (!['4', '5'].includes(e.currentTarget.dataset.collectstatus)) {
      wx.navigateTo({
        url: `/pages/pricingDetail/pricingDetail?stallId=${e.currentTarget.dataset.stallid}&collectPriceId=${e.currentTarget.dataset.collectpriceid}&taskId=${this.data.taskId}&stallName=${e.currentTarget.dataset.stallname}&busiType=COLLECT_PRICE&varietyId=${e.currentTarget.dataset.varietyid}&collectStatus=${e.currentTarget.dataset.collectstatus}`
      })
    // }

  },
  submit() {
    console.log('submit')
    this.setData({
      submitLoading: true
    })
    const params = {
      condition: {
        primaryKey: this.data.taskId
      }
    }
    submitCollectPriceTask(params).then((res) => {
      console.log(res,'res')
      if(res === true){
        this.toast('提交成功', 'success')
        setTimeout(()=>{
          this.goBack()
        },2000)
      } else {
        this.toast(res.retMsg, 'none')
      }
    })
    .catch((err)=>{
      console.log(err,'err')
    })
    .finally(() => {
      this.setData({
        submitLoading: false
      })
    })
  },
  removeStallFn(e) {
    const params = {
      condition: {
        primaryKey: e.currentTarget.dataset.id
      }
    }
    removeStall(params).then(() => {
      this.toast('删除成功', 'success')
      this.getDetails()

    })
  },
  addPricingPoint() {
    let params = {
      condition: {
        primaryKey:this.data.pricingTaskDetail.taskId
      }
    }
    selectTaskChooseStalls(params).then((res) => {
      this.setData({
        pricingPoint: res.length ? res.map((item) => {
          return {
            label: item.stallName,
            value: item.stallId
          }
        }) : [],
        visible: true,
      })
      console.log(this.data.pricingPoint)
    })
  },
  onVisibleChange(e) {
    this.setData({
      visible: e.detail.visible,
      selectedPricingPoint: [],
    });
  },
  handleGroupChange(event) {
    this.setData({
      selectedPricingPoint: event.detail.value,
    });
  },
  confirmSelection() {
    if (this.data.selectedPricingPoint.length === 0) {
      this.toast('请选择采价点', 'warning')
      return
    }
    const params = {
      condition: {
        stallIds: this.data.selectedPricingPoint,
        taskId: this.data.taskId
      }
    }
    addTaskStalls(params).then(() => {
      this.toast('新增成功', 'success')
      this.getDetails()
      this.setData({
        visible: false,
        selectedPricingPoint: [],
        pricingPoint:[]
      })
    })
  },
})