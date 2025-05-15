// components/listComponents/index.js
import {
  selectILargeSalePlans,
  recvSalePlans
} from "../../../../../utils/api"
Component({

  /**
   * 页面的初始数据
   */
  data: {
    cellOpend:false,
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
      '0': '待提交',
      '1': '待认领',
      '2': '待采价',
      '3': "采价中",
      '4': "待审核",
    },
    taskStatusColor:{
      '0': 'default',
      '1': 'danger',
      '2': 'primary',
      '3': "success",
      '4': "success",
      '5': "success",
    }
  },
  /**
   * 组件的属性列表
   */
  properties: {
    taskType: {
      type: String,
      value: ''
    }
  },
  lifetimes: {
    attached() {
      this.onSearch(true)
    },
  },
  /**
   * 组件的方法列表
   */
  methods: {
    onSearch(value = true) {
      if (value) {
        this.setData({
          'queryForm.pageNo': 1,
        });
      }
      if (this.data.taskType == '1') {
        this.setData({
          "queryForm.condition.status": this.data.taskType,
          "queryForm.condition.excludeStatus":'' ,
        })
      } else {
        this.setData({
          "queryForm.condition.excludeStatus":this.data.taskType != '1' ? '1' : '' ,
        })
      }
      selectILargeSalePlans(this.data.queryForm).then((res) => {
        let list = res.records
        this.setData({
          total: res.total,
          list: value ? list : this.data.pricingTaskList.concat(list)
        })
        console.log(this.data)
      }).finally(() => {
        this.setData({
          refresherTriggered: false
        })
      })
    },
    bindBlur(e) {
      this.setData({
        "queryForm.condition.stallName": e.detail.value
      })
      this.onSearch(true)
    },
    toDetail(e) {
      const {planId ,collectPriceId,stallId,taskId,stallName,taskStatus} = e.currentTarget.dataset.item
      if(this.data.taskType != '1'){
        wx.navigateTo({
          url: `/subPackage/salePlan/minPrice/sallpriceDetail/sallpriceDetail?planId=${ planId}&collectPriceId=${collectPriceId}&stallId=${stallId}&stallName=${stallName}&taskId=${taskId}`,
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
      recvSalePlans(params).then(res=>{
          this.onSearch(true);
          this.setData({
            cellOpend:false,
          })
      }).catch(()=>{
        this.setData({
          cellOpend:false,
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
  },
})