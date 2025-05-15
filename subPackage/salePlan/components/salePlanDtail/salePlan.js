// back-home.js
import {
  getLargePlan,
  selectButtomVarieties,
  selectStallFruiveggies
} from "../../../../utils/api"
import {
  env
} from "../../../../utils/env";
import {
  isImageVideoUrl
} from "../../../../utils/util"
Component({
  properties: {
    tallInfo: {
      type: Object,
      value: () => {},
    },
  },
  data: {
    salePalnDetail: {
      "categoryId": '',
      "fileIds": [],
      "latitude": "",
      "linkerMobile": "",
      "linkerName": "",
      "longitude": "",
      "planSaleDate": '',
      "planSaleWeight": '',
      "registAddress": "",
      "stallId": "",
      "submitType": "",
      "varietyId": ''
    },
    buttomVariet: [],
    categoryList: [],
  },
  lifetimes: {
    ready() {
      this.getLargePlan(this.data.tallInfo.planId);
    },
  },

  methods: {
    getButtomVarietiesl(salePalnDetail) {
      let params = {
          "condition": {
            "primaryKey":  salePalnDetail.stallId
          }
      }
      selectStallFruiveggies(params).then(res => {
        console.log(res)
        this.setData({
          buttomVariet: res,
          categoryList: res.filter(v => v.varietyId === salePalnDetail.varietyId)[0].categories
        })
      })
    },
    preview(e) {
      const id = e.target.dataset.id
      const key = e.target.dataset.key
      const index = e.target.dataset.index
      if (['image', 'video'].includes(isImageVideoUrl(id))) {
        const sources = this.data.salePalnDetail[key].filter((v,i)=>i === index).map(item => {
          return {
            url: `${env.ImageUrl}${item}`,
            // url: `https://webxtx-test-sz.oss-cn-shenzhen.aliyuncs.com/price_saas/${item}`,
            type: isImageVideoUrl(item)
          }
        })
        wx.previewMedia({
          sources: sources,
          current: index,
          fail: (err) => {
            console.log(err)
          }
        })
      } else {
        wx.downloadFile({
          url: `${env.ImageUrl}${id}`,
          // url: `https://webxtx-test-sz.oss-cn-shenzhen.aliyuncs.com/price_saas/${id}`,
          success: function (res) {
            const filePath = res.tempFilePath
            wx.openDocument({
              filePath: filePath,
              success: function (res) {
                console.log('打开文档成功')
              }
            })
          }
        })
      }
    },
    getLargePlan(planId) {
      let params = {
        "condition": {
          "primaryKey": planId
        }
      }
      getLargePlan(params).then(res => {
        this.setData({
          salePalnDetail: res
        })
        console.log(res,'detail')
        this.getButtomVarietiesl(res);
      })
    }
  },
});