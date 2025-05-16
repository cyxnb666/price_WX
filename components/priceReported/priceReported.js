// subPackage/salePlan/components/priceReported/priceReported.js
import {
  buildCollectPriceId,
  getLargeCollectPrice,
  queryTypeDicts,
  regeo,
  filepreview,
  reportLargePrice,
  selectButtomVarieties,
  selectStallFruiveggies,
  selectStallLinkers,
  selectVarietySpecss,
  softRemoveFile,
  selectCurrentStall
} from "../../utils/api";
import {
  Toast
} from "tdesign-miniprogram";
import {
  env
} from "../../utils/env";

Component({

  /**
   * 组件的属性列表
   */
  properties: {
    tallInfo: {
      type: Object,
      value: () => {}
    },
    salePlanDetail: {
      type: Object,
      value: () => {}
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    refresherTriggered: false,
    stagingLoading: false,
    submitLoading: false,
    visible: false,
    pickerVisible: false,
    pickerValue: null,
    collectPriceId: null,
    disabled: false,
    busiId: null,
    delta: null,
    busiType: null,
    stallId: null,
    taskId: null,
    specssIndex: null,
    unitPrice: null,
    pickerTitle: '',
    today: '',
    pickerKay: '',
    pricingType: 'diameterSpecsVos',
    priceFormat: (v) => {
      const isNumber = /^\d+(\.\d+)?$/.test(v);
      if (isNumber) {
        return parseFloat(v).toFixed(2);
      }
      return v;
    },
    pricingDetail: {
      "categoryId": 0,
      "collectAddress": "",
      "collectDate": "",
      "collectFileIds": [],
      "collectPriceId": "",
      "latitude": "",
      "linkerMobile": "",
      "linkerName": "",
      "longitude": "",
      "planId": "",
      "priceFileIds": [],
      "specss": [{
        "fvSpecsMax": 0,
        "fvSpecsMin": 0,
        "fvSpecsUnit": "",
        "saleChannelCode": "",
        "specsId": 0,
        "specsType": "",
        "unitPrice": 0,
        "varietyUnit": ""
      }],
      "stallId": "",
      "submitType": "",
      "varietyId": 0,

    },
    varietyUnit: {
      "UG": "元/斤",
      "UKG": "元/公斤",
    },
    unit: "",
    pickerOptions: [],
    varieties: [],
    categories: [],
    channel: [],
    specssList: [],
    showWithInput: false,
    priceError: false,
    userInfo: {}
  },
  ready() {
    console.log(this.data.tallInfo, 'this.data.tallInfo')
    console.log(['4', '5'].includes(this.data.tallInfo.taskStatus))
    this.setData({
      delta: this.data.tallInfo.delta,
      stallId: this.data.tallInfo.stallId,
      collectPriceId: this.data.tallInfo.collectPriceId,
      disabled: ['4', '5'].includes(this.data.tallInfo.taskStatus),
      userInfo: wx.getStorageSync('userInfo'),
      // taskId: options.taskId,
      // busiType: options.busiType,
      // 'pricingDetail.stallName': this.data.tallInfo.stallName,
      // 'pricingDetail.stallId': this.data.tallInfo.stallId,
      pickerKay: "varietyId",
      pricingDetail: {
        ...this.data.pricingDetail,
        ...this.data.salePlanDetail
      }
    }, () => {
      if (this.data.collectPriceId != "null" && this.data.collectPriceId) {
        this.getDetails()
        this.data.pricingDetail.varietyId && this.setPickerData(this.data.pricingDetail.varietyId)
        this.setTodayDate();
      } else {
        this.data.pricingDetail.varietyId && this.setPickerData(this.data.pricingDetail.varietyId, true)
        this.setTodayDate();
        buildCollectPriceId({}).then((res) => {
          this.setData({
            busiId: res
          })
        })
        this.getCurrentLocation()
        this.selectButtomVarietiesFn();
      }
      this.getChannelList()
      this.getCurrentStall()
    })

  },
  /**
   * 组件的方法列表
   */
  methods: {
    setTodayDate() {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;
      this.setData({
        today: formattedDate,
        'pricingDetail.collectDate': formattedDate
      });
    },
    selectButtomVarietiesFn(stallId) {
      let params = {
        "condition": {
          "primaryKey": this.data.stallId || stallId
        }
      }
      selectStallFruiveggies(params).then((res) => {
        this.setData({
          varieties: res,
          categories: this.data.pricingDetail.varietyId ? res.filter(v => v.varietyId === this.data.pricingDetail.varietyId)[0].categories : []
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
          primaryKey: this.data.collectPriceId
        }
      }
      let obj = {
        "WEIGHT": 'weightSpecsVos',
        "DIAMETER": 'diameterSpecsVos',
      }
      getLargeCollectPrice(params).then((res) => {
        this.setData({
          pricingDetail: res,
          "pricingDetail.priceFileIds": res.priceFiles.map(v => v.fileId),
          "pricingDetail.collectFileIds": res.collectFiles.map(v => v.fileId),
          "pricingDetail.specss": res.specsVoList,
          pricingType: res.specsVoList.length ? obj[res.specsVoList[0].specsType] : 'diameterSpecsVos'
        })
        this.selectButtomVarietiesFn(res.stallId);
      }).finally(() => {
        this.setData({
          refresherTriggered: false
        })
      })
    },
    getCurrentStall() {
      selectCurrentStall().then(res => {
        console.log(res)
        this.setData({
          'pricingDetail.stallId': res.stallId,
          'pricingDetail.stallName': res.stallName
        })
      })
    },
    bindRefresh() {
      if (this.data.collectPriceId !== 'null') this.getDetails();
      // this.selectButtomVarietiesFn()
    },
    async getCurrentLocation() {
      const that = this
      try {
        const res = await wx.authorize({
          scope: 'scope.userLocation',
        })
        console.log('scope.userLocation', res)
        // 2. 判断手机微信App是否拥有定位访问权限
        const appAuthorizeSetting = wx.getAppAuthorizeSetting()
        if (appAuthorizeSetting.locationAuthorized === 'authorized') {
          // 3. 判断用户手机定位开关是否开启
          const systemSetting = wx.getSystemSetting()
          if (systemSetting.locationEnabled) {
            console.log('小程序可以正常使用用户位置信息')
            wx.getLocation({
              type: 'wgs84',
              success(res) {
                console.log(res)
                const params = {
                  condition: {
                    latitude: res.latitude,
                    longitude: res.longitude,
                  }
                }
                regeo(params).then((regeoRes) => {
                  that.setData({
                    'pricingDetail.latitude': res.latitude,
                    'pricingDetail.longitude': res.longitude,
                    'pricingDetail.collectAddress': regeoRes.address,
                  })
                })
              },
              fail(err) {
                console.log(err)
              }
            })
          } else {
            console.log('手机定位暂未开启')
          }
        } else {
          console.log('手机微信暂无定位权限')
        }
      } catch (err) {
        console.log('scope.userLocation', err)
        // return new Result(-1, '小程序暂无定位权限')
      }
    },
    async getLocation() {
      if (this.data.disabled) {
        return
      }
      console.log('getLocation')
      const that = this
      try {
        const res = await wx.authorize({
          scope: 'scope.userLocation',
        })
        console.log('scope.userLocation', res)
        // 2. 判断手机微信App是否拥有定位访问权限
        const appAuthorizeSetting = wx.getAppAuthorizeSetting()
        if (appAuthorizeSetting.locationAuthorized === 'authorized') {
          // 3. 判断用户手机定位开关是否开启
          const systemSetting = wx.getSystemSetting()
          if (systemSetting.locationEnabled) {
            console.log('小程序可以正常使用用户位置信息')
            wx.chooseLocation({
              type: 'wgs84',
              success(res) {
                console.log(res)
                const params = {
                  condition: {
                    latitude: res.latitude,
                    longitude: res.longitude,
                  }
                }
                regeo(params).then((regeoRes) => {
                  that.setData({
                    'pricingDetail.latitude': res.latitude,
                    'pricingDetail.longitude': res.longitude,
                    'pricingDetail.collectAddress': regeoRes.address,
                  })
                })
              },
              fail(err) {
                console.log(err)
              }
            })
          } else {
            console.log('手机定位暂未开启')
          }
        } else {
          console.log('手机微信暂无定位权限')
        }
      } catch (err) {
        console.log('scope.userLocation', err)
        // return new Result(-1, '小程序暂无定位权限')
      }
    },
    onDateChange(e) {
      if (this.data.disabled) {
        return
      }
      this.setData({
        'pricingDetail.collectDate': e.detail,
      });
    },
    handleClose(e) {
      console.log('handleClose:', e);
    },
    setPickerData(key, flag) {
      if (this.data.pickerKay === 'varietyId') {
        const params = {
          primaryKey: key
        }

        selectVarietySpecss(params).then((res) => {
          this.setData({
            specssList: res,
          })
          if (flag) {
            this.setData({
              "pricingDetail.specss": res[this.data.pricingType].map(v => {
                return {
                  fvSpecsMax: v.fvSpecsMax,
                  fvSpecsMin: v.fvSpecsMin,
                  fvSpecsUnit: v.fvSpecsUnit,
                  saleChannelCode: "SCH_JXS",
                  specsId: v.specsId,
                  specsType: v.specsType,
                  unitPrice: 0,
                  varietyUnit: v.varietyUnit,
                }
              })
            })
          }
        })
      }

    },
    onPickerConfirm(e) {
      console.log(e)
      if (this.data.pickerKay === 'linkerName') {
        const linkerMobile = e.detail.label[0].split('-')[1]
        this.setData({
          'pricingDetail.linkerMobile': linkerMobile,
        })
      }
      if (['saleChannelCode', 'specsId'].includes(this.data.pickerKay)) {
        this.data.pricingDetail.specss.forEach((item, index) => {
          if (index !== this.data.specssIndex) return;
          item[this.data.pickerKay] = e.detail.value[0];
          if (this.data.pickerKay !== 'specsId') return;
          const label = e.detail.label[0];
          const {
            fvSpecsMin,
            fvSpecsMax,
            fvSpecsUnit
          } = this.parseSpecsLabel(label);
          let specssItem = this.data.specssList[this.data.pricingType]
          const varietyUnit = specssItem.find(v => v.specsId == e.detail.value[0]) ? specssItem.find(v => v.specsId == e.detail.value[0]).varietyUnit : item.varietyUnit
          Object.assign(item, {
            fvSpecsMin,
            fvSpecsMax,
            fvSpecsUnit,
            varietyUnit
          });
        });
        this.setData({
          'pricingDetail.specss': this.data.pricingDetail.specss
        });
        console.log(this.data.pricingDetail.specss)
        return
      }
      this.setData({
        [`pricingDetail.${this.data.pickerKay}`]: e.detail.value[0],
      })

    },
    parseSpecsLabel(label) {
      if (label.includes('-')) {
        const [, min, unit, max] = label.match(/(\d+)\s*([a-zA-Z]+)\s*-\s*(\d+)\s*([a-zA-Z]+)/) || [];
        return {
          fvSpecsMin: min,
          fvSpecsMax: max,
          fvSpecsUnit: unit
        };
      }

      const [value, unit] = label.split(' ');
      return {
        fvSpecsMin: label.includes('以上') ? value : null,
        fvSpecsMax: label.includes('以下') ? value : null,
        fvSpecsUnit: unit
      };
    },
    onPickerCancel(e) {
      console.log('onPickerCancel', e)
    },
    tagClick(e) {
      if (this.data.disabled) {
        return
      }
      const key = e.target.dataset.key
      this.setData({
        pickerKay: key,
        "pricingDetail.varietyId": e.currentTarget.dataset.varietyid,
        "pricingDetail.varietyName": e.currentTarget.dataset.varietyname,
        "categories": this.data.varieties.filter(v => v.varietyId === e.currentTarget.dataset.varietyid)[0].categories
      })
      this.setPickerData(e.currentTarget.dataset.varietyid, true)
    },
    tagcategoryClick(e) {
      if (this.data.disabled) {
        return
      }
      console.log(e)
      const key = e.target.dataset.key
      this.setData({
        pickerKay: key,
        "pricingDetail.categoryId": e.currentTarget.dataset.categoryid,
        "pricingDetail.categoryName": e.currentTarget.dataset.categoryname,
      })
    },
    getVarietyId(e) {
      const key = e.target.dataset.key
      this.setData({
        pickerKay: key,
      })
      this.setData({
        pickerOptions: this.data.varieties.map(item => {
          return {
            label: item.varietyName,
            value: item.varietyId,
            linkerMobile: item.linkerMobile,
          }
        }),
        pickerValue: this.data.pricingDetail.varietyId ? [this.data.pricingDetail.varietyId] : [],
        pickerTitle: key === 'varietyId' ? '品种大类' : '品种小类',
        pickerVisible: true,
      })
    },
    getLinkerName(e) {
      if (this.data.disabled) {
        return
      }
      const key = e.target.dataset.key
      let that = this
      this.setData({
        pickerKay: key,
      })
      const params = {
        condition: {
          primaryKey: this.data.stallId
        }
      }
      console.log(this.data.pricingDetail)
      selectStallLinkers(params).then((res) => {
        this.setData({
          pickerVisible: true,
        })
        that.setData({
          pickerOptions: res.map(item => {
            return {
              label: `${item.linkerName}-${item.linkerMobile}`,
              value: item.linkerName,
            }
          }),
          pickerValue: [that.data.pricingDetail.linkerName],
          pickerTitle: '协助采价员联系人',
        }, () => {
          console.log('123123', this.data)
        })
      })
    },
    getCategoryId(e) {
      if (!this.data.pricingDetail.varietyId) {
        this.toast('请先选择品种大类', 'warning')
        return
      }
      const key = e.target.dataset.key
      this.setData({
        pickerKay: key,
      })
      const categories = this.data.varieties.find(item => item.varietyId === this.data.pricingDetail.varietyId)?.categories
      if (!categories) {
        this.toast('该品种暂无品种小类', 'warning')
        return;
      }
      this.setData({
        pickerOptions: categories.map(item => {
          return {
            label: item.categoryName,
            value: item.categoryId,
          }
        }),
        categories: categories,
        pickerValue: this.data.pricingDetail.categoryId,
        pickerTitle: key === 'varietyId' ? '品种大类' : '品种小类',
        pickerVisible: true,
      })
    },
    pricingTypeFn(e) {
      if (this.data.disabled) {
        return
      }
      this.setData({
        pricingType: e.target.dataset.type,
        "pricingDetail.specss": this.data.specssList[e.target.dataset.type].map(v => {
          return {
            fvSpecsMax: v.fvSpecsMax,
            fvSpecsMin: v.fvSpecsMin,
            fvSpecsUnit: v.fvSpecsUnit,
            saleChannelCode: "SCH_JXS",
            specsId: v.specsId,
            specsType: v.specsType,
            unitPrice: 0,
            varietyUnit: v.varietyUnit,
          }
        })
      })
    },
    getChannelList() {
      const params = {
        condition: {
          dictType: 'SALE_CHANNEL'
        }
      }
      queryTypeDicts(params).then((res) => {
        this.setData({
          channel: res,

        })
      })
    },
    getChannel(e) {
      if (this.data.disabled) {
        return
      }
      const key = e.currentTarget.dataset.key
      const index = e.currentTarget.dataset.index
      const params = {
        condition: {
          dictType: 'SALE_CHANNEL'
        }
      }
      queryTypeDicts(params).then((res) => {
        this.setData({
          pickerKay: key,
          specssIndex: Number(index),
          pickerTitle: '渠道',
          channel: res,
          pickerValue: e.target.dataset.id,
          pickerOptions: res.map(item => {
            return {
              label: item.dictValue,
              value: item.dictCode,
            }
          }),
          pickerVisible: true,
        })
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
    getSpecs(e) {
      if (this.data.disabled) {
        return
      }
      if (!this.data.pricingDetail.varietyId) {
        this.toast('请先选择品种大类', 'warning')
        return
      }
      if (!this.data.specssList[this.data.pricingType].length) {
        this.toast('暂无规格数据', 'warning')
        return
      }
      const key = e.currentTarget.dataset.key
      const index = e.currentTarget.dataset.index
      this.setData({
        pickerKay: key,
        specssIndex: Number(index),
        pickerTitle: '渠道',
        pickerValue: e.currentTarget.dataset.id,
        pickerOptions: this.data.specssList[this.data.pricingType].map(item => {
          let label = `${item.fvSpecsMin} ${item.fvSpecsUnit}-${item.fvSpecsMax} ${item.fvSpecsUnit}`
          if (item.fvSpecsMin === null) {
            label = `${item.fvSpecsMax} ${item.fvSpecsUnit} 以下`
          }
          if (item.fvSpecsMax === null) {
            label = `${item.fvSpecsMin} ${item.fvSpecsUnit} 以上`
          }
          return {
            label,
            value: item.specsId,
          }
        }),
        pickerVisible: true,
      })
    },
    showDialog(e) {
      if (this.data.disabled) {
        return
      }
      const value = e.currentTarget.dataset.value
      const index = e.currentTarget.dataset.index
      const unit = e.currentTarget.dataset.unit
      this.setData({
        showWithInput: true,
        unitPrice: value,
        unit,
        specssIndex: Number(index),
      });
    },
    closeDialog(e) {
      if (e.type === "confirm") {
        const {
          priceError
        } = this.data;
        const isNumber = /^\d+(\.\d+)?$/.test(this.data.unitPrice);
        if (priceError === isNumber) {
          this.setData({
            priceError: !isNumber,
          });
        } else {
          // if (!this.data.unitPrice) {
          //   this.toast('请输入价格', 'warning')
          //   return
          // }
          // if (!this.isNumberString(this.data.unitPrice)) {
          //   this.toast('请输入数字', 'warning')
          //   return
          // }
          this.data.pricingDetail.specss[this.data.specssIndex].unitPrice = this.data.unitPrice
          this.setData({
            'pricingDetail.specss': this.data.pricingDetail.specss,
          });
        }
      }
      this.setData({
        showWithInput: false,
        unitPrice: null
      });
    },
    isNumberString(str) {
      return typeof str === 'string' && str.trim() !== '' && !isNaN(+str);
    },
    onblurIpt(e) {
      const isNumber = /^\d+(\.\d+)?$/.test(e.detail.value);
      this.setData({
        unitPrice: isNumber ? Number(e.detail.value).toFixed(2) : e.detail.value,
      })
    },
    onInput(e) {
      this.setData({
        unitPrice: e.detail.value,
      })

    },
    onInputClear() {
      this.setData({
        unitPrice: null,
      })
    },
    removeSpecs(e) {
      if (this.data.pricingDetail.specss.length === 1) {
        return
      }
      const index = e.target.dataset.index
      this.data.pricingDetail.specss.splice(index, 1)
      this.setData({
        'pricingDetail.specss': this.data.pricingDetail.specss,
      });
    },
    addSpecs() {
      if (this.data.disabled) {
        return
      }
      this.data.pricingDetail.specss.push({
        fvSpecsMax: 0,
        fvSpecsMin: 0,
        fvSpecsUnit: "",
        saleChannelCode: "SCH_JXS",
        specsId: 0,
        specsType: "",
        unitPrice: '',
        varietyUnit: "UG",
      })
      this.setData({
        'pricingDetail.specss': this.data.pricingDetail.specss,
      });
    },
    chooseMedia(e) {
      const that = this
      const sourceType = e.target.dataset.type
      const key = e.target.dataset.key
      wx.chooseMedia({
        count: 9,
        mediaType: ['image', 'video'],
        sourceType: [sourceType],
        camera: 'back',
        success(res) {
          res.tempFiles.forEach((temp) => {
            if (temp.tempFilePath) that.uploadFile(temp.tempFilePath, key)
          })
        }
      })
    },
    chooseMessageFile(e) {
      const that = this
      const key = e.target.dataset.key
      wx.chooseMessageFile({
        count: 10,
        type: 'all',
        success(res) {
          res.tempFiles.forEach((temp) => {
            if (temp.path) that.uploadFile(temp.path, key)
          })
        }
      })
    },
    uploadFile(tempFilePaths, key) {
      const that = this
      wx.uploadFile({
        url: `${env.baseURL}/file/uploadFile`, //仅为示例，非真实的接口地址
        filePath: tempFilePaths,
        name: 'file',
        header: {
          'content-type': 'multipart/form-data',
          'X-Access-Token': wx.getStorageSync('token')
        },
        success(res) {
          const {
            retCode,
            retData,
            retMsg
          } = JSON.parse(res.data)
          if (retCode === 200) {
            that.data.pricingDetail[key].push(retData)
            that.setData({
              [`pricingDetail.${key}`]: that.data.pricingDetail[key],
            });
            that.toast('上传成功', 'success')
          } else {
            that.toast(retMsg, 'warning')
          }
        }
      })
    },
    fileDelete(e) {
      const key = e.target.dataset.key
      const index = e.target.dataset.index
      const id = e.target.dataset.id
      this.data.pricingDetail[key].splice(index, 1)
      this.setData({
        [`pricingDetail.${key}`]: this.data.pricingDetail[key],
      });
      // const params = {
      //   condition: {
      //     primaryKeys: [id]
      //   }
      // }
      // softRemoveFile(params).then((res) => {
      //   if (res) {
      //     this.data.pricingDetail[key].splice(index, 1)
      //     this.setData({
      //       [`pricingDetail.${key}`]: this.data.pricingDetail[key],
      //     });
      //     this.toast('删除成功', 'success')
      //   }
      // })

    },
    preview(e) {
      const id = e.target.dataset.id
      const key = e.target.dataset.key
      const index = e.target.dataset.index
      const fs = wx.getFileSystemManager();
      if (['image', 'video'].includes(this.isImageVideoUrl(id))) {
        let priceImg = this.data.pricingDetail[key].filter((v, i) => i === index)
        const sources = priceImg.map(item => {
          let params = {
            condition: {
              primaryKey: item,
            },
          }
          return filepreview(params)
        })
        wx.showLoading({
          title: '加载中',
        })
        Promise.all(sources).then(list => {
          const sourcesList = priceImg.map((item, index) => {
            let filePath = wx.env.USER_DATA_PATH + "/" + item;
            fs.writeFileSync(filePath, // wx.env.USER_DATA_PATH 指定临时文件存入的路径，后面字符串自定义
              list[index].data,
              "binary", //二进制流文件必须是 binary
            )
            return {
              url: filePath,
              type: this.isImageVideoUrl(item)
            }
          })
          wx.hideLoading()
          wx.previewMedia({
            sources: sourcesList,
            fail: (err) => {
              console.log(err)
            }
          })
        })
      } 
      // else {
      //   wx.downloadFile({
      //     url: `${env.ImageUrl}${id}`,
      //     // url: `https://webxtx-test-sz.oss-cn-shenzhen.aliyuncs.com/price_saas/${id}`,
      //     success: function (res) {
      //       const filePath = res.tempFilePath
      //       wx.openDocument({
      //         filePath: filePath,
      //         success: function (res) {
      //           console.log('打开文档成功')
      //         }
      //       })
      //     }
      //   })
      // }
    },
    isImageVideoUrl(url) {
      const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg'];
      const videoExtensions = ['mp4', 'avi', 'mov', 'mkv', 'flv'];
      const ext = url.split('.').pop().toLowerCase();
      if (imageExtensions.includes(ext)) {
        return 'image';
      } else if (videoExtensions.includes(ext)) {
        return 'video';
      }
      return 'other';
    },
    saveCollectPriceFn(submitType) {
      this.data.pricingDetail.specss.forEach((item) => {
        item.specsType = this.data.pricingType === 'diameterSpecsVos' ? 'DIAMETER' : 'WEIGHT'
      })
      const params = {
        condition: {
          ...this.data.pricingDetail,
          submitType: submitType,
          collectPriceId: this.data.busiId || this.data.collectPriceId,
        }
      }
      reportLargePrice(params).then((res) => {
        this.toast('保存成功', 'success')
        setTimeout(() => {
          wx.navigateBack({
            delta: this.data.delta ? Number(this.data.delta) : 1
          })
        }, 1000)

      }).finally(() => {
        this.setData({
          stagingLoading: false,
          submitLoading: false,
        })
      })
    },
    staging() {
      this.setData({
        stagingLoading: true,
      })
      this.saveCollectPriceFn("0")
    },
    submit() {
      if (!this.data.pricingDetail.varietyId) {
        this.toast('请选择品种大类', 'warning')
        return
      }
      if (!this.data.pricingDetail.categoryId) {
        this.toast('请选择品种小类', 'warning')
        return
      }
      if (!(this.data.pricingDetail.specss.length > 0 && this.data.pricingDetail.specss.every(v => v.unitPrice && v.saleChannelCode))) {
        this.toast('请填写规格', 'warning')
        return
      }
      this.setData({
        submitLoading: true,
      })
      this.saveCollectPriceFn("1")
    },
  }
})