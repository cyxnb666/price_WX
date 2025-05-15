// pages/pricingDetail.js
import {
  ownergetWxCollecpriceTask,
  queryTypeDicts,
  ownersaveCollectPrice,
  regeo,
  softRemoveFile,
  selectChooseStalls,
  ownerbuildCollectPriceId,
  selectButtomVarieties,
  selectStallFruiveggies,
  selectStallLinkers,
  selectVarietySpecss
} from "../../utils/api";
import {
  Toast
} from "tdesign-miniprogram";
import {
  isImageVideoUrl
} from "../../utils/util"
import {
  env
} from "../../utils/env";
import dayjs from 'dayjs';

const now = dayjs().locale('zh-cn');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    varietyUnit: {
      "UG": "元/斤",
      "UKG": "元/公斤",
    },
    disabled: false,
    refresherTriggered: false,
    stagingLoading: false,
    submitLoading: false,
    visible: false,
    pickerVisible: false,
    pickerValue: null,
    collectPriceId: null,
    stallId: null,
    taskId: null,
    specssIndex: null,
    unitPrice: null,
    pickerTitle: '',
    today: '',
    pickerKay: '',
    selectChooseStallList: [],
    pricingType: 'diameterSpecsVos',
    unit: "",
    pricingDetail: {
      stallName: '',
      collectAddress: '',
      longitude: '',
      latitude: '',
      collectDate: '',
      categoryId: '',
      varietyId: '',
      linkerName: '',
      linkerMobile: '',
      specss: [{
        fvSpecsMax: 0,
        fvSpecsMin: 0,
        fvSpecsUnit: "",
        saleChannelCode: "",
        specsId: 0,
        specsType: "",
        unitPrice: 0,
        varietyUnit: "UG",
      }],
      priceFileIds: [],
      collectFileIds: [],
    },
    pickerOptions: [],
    varieties: [],
    categories: [],
    channel: [],
    specssList: [],
    specss: [],
    showWithInput: false,
    busiId: '',
    busiType: 'COLLECT_PRICE',
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    if (options.collectPriceId) {
      this.setData({
        collectPriceId: options.collectPriceId,
        stallId: options.stallId,
        "pricingDetail.stallId": options.stallId,
        busiType: 'COLLECT_PRICE',
        taskId: options.taskId,
        "pricingDetail.taskId": options.taskId,
        'pricingDetail.stallName': options.stallName,
      }, async () => {
        if (this.data.collectPriceId) {
          // await this.selectButtomVarietiesFn();
          this.getDetails();
          this.getChannelList()
        } else {
          this.setTodayDate()
        };
        if (options.stallId) {
          this.selectButtomVarietiesFn()
        }
        this.getCurrentStall()

      })
    } else {
      this.setTodayDate()
      this.getCurrentStall()
      this.getChannelList()
      this.getCurrentLocation()
      ownerbuildCollectPriceId({}).then((res) => {
        this.setData({
          busiId: res
        })
      })
    }


  },
  async getCurrentLocation() {

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
          wx.getLocation({
            type: 'gcj02',
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
  selectStalls() {
    if (this.data.disabled) {
      return
    }
    console.log(this.data.selectChooseStallList)
    this.setData({
      pickerOptions: this.data.selectChooseStallList.map(item => {
        return {
          label: item.stallName,
          value: item.stallId,
        }
      }),
      pickerValue: this.data.pricingDetail.stallId,
      pickerTitle: "采价点",
      pickerVisible: true,
      pickerKay: 'stallId'
    })
  },
  setTodayDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    console.log(now.format('YYYY-MM-DD'), 'formattedDate')
    this.setData({
      today: formattedDate,
      'pricingDetail.collectDate': now.format('YYYY-MM-DD')
    });
  },
  selectButtomVarietiesFn(stallId, flag) {
    let params = {
      "condition": {
        "primaryKey": this.data.stallId || stallId || this.data.pricingDetail.stallId
      }
    }
    selectStallFruiveggies(params).then((res) => {
      let varietyItems = this.data.pricingDetail.varietyId ? res.filter(v => v.varietyId === this.data.pricingDetail.varietyId) : ""
      this.setData({
        varieties: res,
        categories: varietyItems ? varietyItems.categories : []
      })
      if (flag) {
        if (res.length) {
          this.setData({
            "pricingDetail.varietyId": res[0].varietyId,
            pickerKay: "varietyId",
            categories: res[0].varietyId ? res.filter(v => v.varietyId === res[0].varietyId)[0].categories : []
          })
          res[0].varietyId && this.setPickerData(res[0].varietyId, true)
        }
      }
    }).finally(() => {
      this.setData({
        refresherTriggered: false
      })
    })
  },
  getCurrentStall() {
    selectChooseStalls().then(res => {
      console.log(res)
      this.setData({
        selectChooseStallList: res
      })
    })
  },
  setPhotos(options) {
    this.setData({
      'pricingDetail.priceFileIds': this.data.pricingDetail.priceFileIds.concat(options.priceFileIds),
      'pricingDetail.collectFileIds': this.data.pricingDetail.collectFileIds.concat(options.collectFileIds)
    })
  },
  getDetails() {
    let that = this
    const params = {
      condition: {
        primaryKey: this.data.collectPriceId
      }
    }
    ownergetWxCollecpriceTask(params).then(async (res) => {
      let obj = {
        "WEIGHT": 'weightSpecsVos',
        "DIAMETER": 'diameterSpecsVos',
      }
      res.stallId && await this.selectButtomVarietiesFn(res.stallId)
      this.setData({
        disabled: ['4', '5'].includes(res.priceStatus),
        pricingDetail: res,
        busiId: res.collectPriceId,
        "pricingDetail.specss": res.specss || [],
        pickerKay: 'varietyId',
        specss: res.specss,
        "pricingDetail.collectFileIds": res.collectFileIds.map(v => v.fileId) || [],
        "pricingDetail.priceFileIds": res.priceFileIds.map(v => v.fileId) || [],
        pricingType: res.specss.length ? obj[res.specss[0] ? res.specss[0].specsType : ''] : 'diameterSpecsVos'
      }, () => {
        setTimeout(() => {
          that.setData({
            "categories": that.data.varieties.filter(v => v.varietyId === that.data.pricingDetail.varietyId)[0] ? that.data.varieties.filter(v => v.varietyId === that.data.pricingDetail.varietyId)[0].categories : [],
          })
          console.log(that.data.categories,'categories===')
        },200)
        this.data.pricingDetail.varietyId && this.setPickerData(this.data.pricingDetail.varietyId)
        console.log(this.data.pricingDetail.specss)
      })
    }).finally(() => {
      this.setData({
        refresherTriggered: false
      })
    })
  },
  bindRefresh() {
    if (this.data.collectPriceId) this.getDetails();
    this.getCurrentStall()
    // this.selectButtomVarietiesFn()
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
            type: 'gcj02',
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
  onPickerConfirm(e) {
    console.log(e)
    if (this.data.pickerKay === 'linkerName') {
      const linkerMobile = e.detail.label[0].split('-')[1]
      this.setData({
        'pricingDetail.linkerMobile': linkerMobile,
      })
    }
    if (this.data.pickerKay === 'varietyId') {
      const params = {
        primaryKey: e.detail.value[0]
      }
      selectVarietySpecss(params).then((res) => {
        this.setData({
          specssList: res,
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
    if (this.data.pickerKay == 'stallId') {
      this.setData({
        'pricingDetail.stallId': e.detail.value[0],
        'pricingDetail.stallName': e.detail.label[0],
      });
      this.selectButtomVarietiesFn(e.detail.value[0], true);
      this.getLinkerList(e.detail.value[0])
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
      pickerValue: this.data.pricingDetail.varietyId,
      pickerTitle: key === 'varietyId' ? '品种大类' : '品种小类',
      pickerVisible: true,
    })
  },
  getLinkerList(stallId) {
    const params = {
      condition: {
        primaryKey: stallId
      }
    }
    selectStallLinkers(params).then((res) => {
      if (res.length) {
        let item = res[0]
        this.setData({
          "pricingDetail.linkerName": item.linkerName,
          "pricingDetail.linkerMobile": item.linkerMobile,
        })
      }

    })
  },
  getLinkerName(e) {
    if (this.data.disabled) {
      return
    }
    const key = e.target.dataset.key
    this.setData({
      pickerKay: key,
    })
    if (!(this.data.stallId || this.data.pricingDetail.stallId)) {
      this.toast('请选择采价点', "none")
      return
    }
    const params = {
      condition: {
        primaryKey: this.data.stallId || this.data.pricingDetail.stallId
      }
    }
    selectStallLinkers(params).then((res) => {
      this.setData({
        pickerOptions: res.map(item => {
          return {
            label: `${item.linkerName}-${item.linkerMobile}`,
            value: item.linkerName,
          }
        }),
        pickerValue: this.data.pricingDetail.linkerName,
        pickerTitle: '协助采价员联系人',
        pickerVisible: true,
      })
    })
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

  setPickerData(key, flag) {
    if (this.data.pickerKay === 'varietyId') {
      const params = {
        primaryKey: key
      }
      selectVarietySpecss(params).then((res) => {
        this.setData({
          specssList: res
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
    let priceType = {
      "diameterSpecsVos": 'mm',
      "weightSpecsVos": 'g'
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
    console.log(this.data.unitPrice)
    if (e.type === "confirm") {
      if (!this.data.unitPrice) {
        this.toast('请输入价格', 'warning')
        return
      }
      if (!this.isNumberString(this.data.unitPrice)) {
        this.toast('请输入数字', 'warning')
        return
      }
      this.data.pricingDetail.specss[this.data.specssIndex].unitPrice = this.data.unitPrice
      this.setData({
        'pricingDetail.specss': this.data.pricingDetail.specss,
      });
    }
    this.setData({
      showWithInput: false,
      unitPrice: null
    });
  },
  isNumberString(str) {
    return typeof str === 'string' && str.trim() !== '' && !isNaN(+str);
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
    if (this.data.disabled) {
      return
    }
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
      unitPrice: 0,
      varietyUnit: "UG",
    })
    this.setData({
      'pricingDetail.specss': this.data.pricingDetail.specss,
    });
  },
  chooseMedia(e) {
    if (this.data.disabled) {
      return
    }
    const sourceType = e.target.dataset.type
    const key = e.target.dataset.key
    const that = this
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
    if (this.data.disabled) {
      return
    }
    let that = this
    const key = e.target.dataset.key
    wx.chooseMessageFile({
      count: 10,
      type: 'all',
      success(res) {
        console.log(res)
        const tempFilePaths = res.tempFiles
        tempFilePaths.forEach((temp) => {
          if (temp.path) that.uploadFile(temp.path, key)
        })
        console.log(tempFilePaths)
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
          console.log(retData)
          that.data.pricingDetail[key].push(retData)
          that.setData({
            [`pricingDetail.${key}`]: that.data.pricingDetail[key],
          });
          console.log(that.data.pricingDetail[key])
        } else {
          that.toast(retMsg, 'warning')
        }
      }
    })
  },
  fileDelete(e) {
    if (this.data.disabled) {
      return
    }
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
    console.log(e)
    const id = e.target.dataset.id
    const key = e.target.dataset.key
    const index = e.target.dataset.index
    if (['image', 'video'].includes(isImageVideoUrl(id))) {
      const sources = this.data.pricingDetail[key].map(item => {
        return {
          url: `${env.ImageUrl}${item}`,
          // url: `https://webxtx-test-sz.oss-cn-shenzhen.aliyuncs.com/price_saas/${item}`,
          type: isImageVideoUrl(item)
        }
      })
      console.log(sources, 'sources')
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
  saveCollectPriceFn(submitType) {
    this.data.pricingDetail.specss.forEach((item) => {
      item.specsType = this.data.pricingType === 'diameterSpecsVos' ? 'DIAMETER' : 'WEIGHT'
    })


    const params = {
      condition: {
        ...this.data.pricingDetail,
        submitType: submitType,
        collectPriceId: this.data.pricingDetail.collectPriceId || this.data.busiId,
      }
    }
    ownersaveCollectPrice(params).then((res) => {
      console.log(res)
      this.toast('保存成功', 'success')
      wx.navigateBack()
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
    if (!this.data.pricingDetail.linkerName) {
      this.toast('请选择联系人', 'warning')
      return
    }
    if (!this.data.pricingDetail.linkerMobile) {
      this.toast('请选择联系人电话', 'warning')
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
})