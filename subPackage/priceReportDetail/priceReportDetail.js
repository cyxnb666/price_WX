// priceReportDetail.js
import {
  selectButtomVarieties,
  regeo,
  buildRecordId,
  savePriceReport,
  getPriceReportDetail,
  selectVarietySpecss,
  queryTypeDicts,
  filepreview,
  softRemoveFile,
} from "../../utils/api";
import {
  Toast
} from "tdesign-miniprogram";
import {
  isImageVideoUrl
} from "../../utils/util";
import {
  env
} from "../../utils/env";
import dayjs from 'dayjs';

const now = dayjs().locale('zh-cn');

Page({
  data: {
    orderId: '',
    busiId: '',
    disabled: false,
    refresherTriggered: false,
    stagingLoading: false,
    submitLoading: false,
    pickerVisible: false,
    pickerValue: null,
    pickerTitle: '',
    pickerKay: '',
    pickerOptions: [],
    specssIndex: null,
    currentSection: '',
    today: '',
    
    priceTypes: {
      'FARM_PRICE': '离地价',
      'ORDER_PRICE': '订购价'
    },
    
    priceReportDetail: {
      gardenAddress: '',
      longitude: '',
      latitude: '',
      harvestDate: '',
      priceType: 'FARM_PRICE',
      varietyId: '',
      varietyName: '',
      categoryId: '',
      categoryName: ''
    },
    
    varieties: [],
    categories: [],
    
    // 价格输入面板相关数据
    diameterData: [{
      fvSpecsMax: 0,
      fvSpecsMin: 0,
      fvSpecsUnit: "",
      saleChannelCode: "SCH_JXS",
      specsId: 0,
      specsType: "DIAMETER",
      unitPrice: 0,
      weight: 0,
      varietyUnit: "UG",
    }],
    weightData: [{
      fvSpecsMax: 0,
      fvSpecsMin: 0,
      fvSpecsUnit: "",
      saleChannelCode: "SCH_JXS",
      specsId: 0,
      specsType: "WEIGHT",
      unitPrice: 0,
      weight: 0,
      varietyUnit: "UG",
    }],
    bulkData: {
      price: '',
      weight: ''
    },
    
    // 凭据文件数据
    priceFileIds: [],
    
    // 规格和渠道数据
    channel: [],
    specssList: {},
    
    // 显示控制
    showDiameter: true,
    showWeight: false,
    showBulk: false,
    
    varietyUnit: {
      "UG": "元/斤",
      "UKG": "元/公斤",
    }
  },
  
  onLoad(options) {
    this.setTodayDate();
    this.getCurrentLocation();
    this.getChannelList();
    
    if (options.orderId) {
      // 编辑模式
      this.setData({
        orderId: options.orderId
      });
      this.getOrderDetail();
    } else {
      // 新增模式
      this.initNewReport();
    }
  },
  
  async initNewReport() {
    try {
      // 1. 生成唯一ID
      const busiId = await buildRecordId({});
      this.setData({ busiId });
      
      // 2. 获取当前农户的果园信息和品种大类
      await this.getVarietiesList();
      
    } catch (err) {
      console.error('初始化失败:', err);
      this.toast('初始化失败', 'error');
    }
  },
  
  setTodayDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    
    this.setData({
      today: formattedDate,
      'priceReportDetail.harvestDate': now.format('YYYY-MM-DD')
    });
  },
  
  async getCurrentLocation() {
    console.log('获取当前位置');
    const that = this;
    try {
      const res = await wx.authorize({
        scope: 'scope.userLocation',
      });
      
      const appAuthorizeSetting = wx.getAppAuthorizeSetting();
      if (appAuthorizeSetting.locationAuthorized === 'authorized') {
        const systemSetting = wx.getSystemSetting();
        if (systemSetting.locationEnabled) {
          wx.getLocation({
            type: 'gcj02',
            success(res) {
              const params = {
                condition: {
                  latitude: res.latitude,
                  longitude: res.longitude,
                }
              };
              regeo(params).then((regeoRes) => {
                that.setData({
                  'priceReportDetail.latitude': res.latitude,
                  'priceReportDetail.longitude': res.longitude,
                  'priceReportDetail.gardenAddress': regeoRes.address,
                });
              });
            },
            fail(err) {
              console.log(err);
            }
          });
        }
      }
    } catch (err) {
      console.log('定位权限获取失败', err);
    }
  },
  
async getVarietiesList() {
    try {
      const params = {
        condition: {}
      };
      const varietiesRes = await selectButtomVarieties(params);
      
      this.setData({
        varieties: varietiesRes
      });
      
      // 默认选择第一个品种大类
      if (varietiesRes.length > 0) {
        const firstVariety = varietiesRes[0];
        this.setData({
          'priceReportDetail.varietyId': firstVariety.varietyId,
          'priceReportDetail.varietyName': firstVariety.varietyName,
          categories: firstVariety.categories || []
        });
        
        // 获取规格数据
        await this.getSpecsList(firstVariety.varietyId);
      }
    } catch (err) {
      console.error('获取品种列表失败:', err);
      this.toast('获取品种数据失败', 'error');
    }
  },
  
  async getSpecsList(varietyId) {
    if (!varietyId) {
      console.warn('无法获取规格列表: 品种ID为空');
      return;
    }
    
    const params = {
      primaryKey: varietyId
    };
    
    try {
      const res = await selectVarietySpecss(params);
      this.setData({
        specssList: res
      });
    } catch (err) {
      console.error('获取规格列表失败:', err);
      this.toast('获取规格列表失败', 'error');
    }
  },
  
  getChannelList() {
    const params = {
      condition: {
        dictType: 'SALE_CHANNEL'
      }
    };
    
    queryTypeDicts(params).then((res) => {
      console.log('获取渠道列表成功:', res);
      this.setData({
        channel: res
      });
    }).catch(err => {
      console.error('获取渠道列表失败:', err);
      this.toast('获取渠道列表失败', 'error');
    });
  },
  
  getOrderDetail() {
    const params = {
      condition: {
        primaryKey: this.data.orderId
      }
    };
    
    getPriceReportDetail(params).then((res) => {
      this.setData({
        priceReportDetail: {
          ...this.data.priceReportDetail,
          ...res
        },
        disabled: ['3', '4'].includes(res.orderStatus), // 已完成和已取消状态不可操作
        busiId: res.collectPriceId || res.orderId
      });
      
      // 加载对应的品种和规格数据
      if (res.varietyId) {
        this.getSpecsList(res.varietyId);
      }
    }).catch(err => {
      this.toast('获取详情失败', 'error');
    }).finally(() => {
      this.setData({
        refresherTriggered: false
      });
    });
  },
  
  bindRefresh() {
    this.getCurrentLocation();
    if (this.data.orderId) {
      this.getOrderDetail();
    } else {
      this.getVarietiesList();
    }
  },
  
  async getLocation() {
    if (this.data.disabled) return;
    
    const that = this;
    try {
      const res = await wx.authorize({
        scope: 'scope.userLocation',
      });
      
      const appAuthorizeSetting = wx.getAppAuthorizeSetting();
      if (appAuthorizeSetting.locationAuthorized === 'authorized') {
        const systemSetting = wx.getSystemSetting();
        if (systemSetting.locationEnabled) {
          wx.chooseLocation({
            success(res) {
              const params = {
                condition: {
                  latitude: res.latitude,
                  longitude: res.longitude,
                }
              };
              regeo(params).then((regeoRes) => {
                that.setData({
                  'priceReportDetail.latitude': res.latitude,
                  'priceReportDetail.longitude': res.longitude,
                  'priceReportDetail.gardenAddress': regeoRes.address,
                });
              });
            },
            fail(err) {
              console.log(err);
            }
          });
        }
      }
    } catch (err) {
      console.log('定位权限获取失败', err);
    }
  },
  
  onDateChange(e) {
    if (this.data.disabled) return;
    
    this.setData({
      'priceReportDetail.harvestDate': e.detail,
    });
  },
  
  selectPriceType() {
    if (this.data.disabled) return;
    
    const priceTypeOptions = Object.entries(this.data.priceTypes).map(([value, label]) => {
      return {
        value: value,
        label: label
      };
    });
    
    this.setData({
      pickerOptions: priceTypeOptions,
      pickerValue: this.data.priceReportDetail.priceType,
      pickerTitle: "价格类型",
      pickerVisible: true,
      pickerKay: 'priceType'
    });
  },
  
  async tagClick(e) {
    if (this.data.disabled) return;
    
    const varietyId = e.currentTarget.dataset.varietyid;
    const varietyName = e.currentTarget.dataset.varietyname;
    
    // 找到对应品种的小类
    const selectedVariety = this.data.varieties.find(v => v.varietyId === varietyId);
    const categories = selectedVariety ? selectedVariety.categories || [] : [];
    
    this.setData({
      'priceReportDetail.varietyId': varietyId,
      'priceReportDetail.varietyName': varietyName,
      'priceReportDetail.categoryId': '', // 重置小类选择
      'priceReportDetail.categoryName': '',
      categories: categories
    });
    
    // 获取新的规格数据
    await this.getSpecsList(varietyId);
  },
  
  categoryTagClick(e) {
    if (this.data.disabled) return;
    
    const categoryId = e.currentTarget.dataset.categoryid;
    const categoryName = e.currentTarget.dataset.categoryname;
    
    this.setData({
      'priceReportDetail.categoryId': categoryId,
      'priceReportDetail.categoryName': categoryName,
    });
  },
  
  // 价格输入面板相关方法
  handleUpdate(e) {
    const { type, data } = e.detail;
    this.setData({
      [`${type}Data`]: data
    });
    console.log(`${type}数据已更新:`, data);
  },
  
  handleSelectItem(e) {
    const { type, section, index } = e.detail;
    
    this.setData({
      currentSection: section,
      specssIndex: index,
      pickerKay: type === 'channel' ? 'saleChannelCode' : 'specsId'
    });
    
    if (type === 'channel') {
      // 选择渠道
      this.setData({
        pickerOptions: this.data.channel.map(item => {
          return {
            label: item.dictValue,
            value: item.dictCode
          };
        }),
        pickerTitle: '渠道',
        pickerValue: this.data[`${section}Data`][index].saleChannelCode,
        pickerVisible: true
      });
    } else {
      const specType = section === 'diameter' ? 'diameterSpecsVos' : 'weightSpecsVos';
      
      if (!this.data.specssList[specType] || this.data.specssList[specType].length === 0) {
        this.toast('暂无规格数据', 'warning');
        return;
      }
      
      const specsList = this.data.specssList[specType];
      
      this.setData({
        pickerOptions: specsList.map(item => {
          let label = `${item.fvSpecsMin} ${item.fvSpecsUnit}-${item.fvSpecsMax} ${item.fvSpecsUnit}`;
          if (item.fvSpecsMin === null) {
            label = `${item.fvSpecsMax} ${item.fvSpecsUnit} 以下`;
          }
          if (item.fvSpecsMax === null) {
            label = `${item.fvSpecsMin} ${item.fvSpecsUnit} 以上`;
          }
          return {
            label,
            value: item.specsId
          };
        }),
        pickerTitle: '规格',
        pickerValue: this.data[`${section}Data`][index].specsId,
        pickerVisible: true
      });
    }
  },
  
  handleToast(e) {
    const { message, theme } = e.detail;
    this.toast(message, theme);
  },
  
  handleSectionToggle(e) {
    const { section, show } = e.detail;
    this.setData({
      [`show${section}`]: show
    });
    console.log(`${section}显示状态已更新为: ${show}`);
  },
  
  onPickerConfirm(e) {
    if (this.data.currentSection && this.data.specssIndex !== null) {
      // 处理价格面板的选择
      const section = this.data.currentSection;
      const index = this.data.specssIndex;
      const key = this.data.pickerKay;
      const data = [...this.data[`${section}Data`]];
      
      data[index][key] = e.detail.value[0];
      
      if (key === 'specsId') {
        const specsType = section === 'diameter' ? 'diameterSpecsVos' : 'weightSpecsVos';
        const specs = this.data.specssList[specsType]
          .find(item => item.specsId === e.detail.value[0]);
          
        if (specs) {
          data[index].fvSpecsMin = specs.fvSpecsMin;
          data[index].fvSpecsMax = specs.fvSpecsMax;
          data[index].fvSpecsUnit = specs.fvSpecsUnit;
          data[index].varietyUnit = specs.varietyUnit;
          
          let specsName = `${specs.fvSpecsMin} ${specs.fvSpecsUnit}-${specs.fvSpecsMax} ${specs.fvSpecsUnit}`;
          if (specs.fvSpecsMin === null) {
            specsName = `${specs.fvSpecsMax} ${specs.fvSpecsUnit} 以下`;
          }
          if (specs.fvSpecsMax === null) {
            specsName = `${specs.fvSpecsMin} ${specs.fvSpecsUnit} 以上`;
          }
          data[index].specsName = specsName;
        }
      } else if (key === 'saleChannelCode') {
        const channel = this.data.channel.find(item => item.dictCode === e.detail.value[0]);
        if (channel) {
          data[index].saleChannelName = channel.dictValue;
        }
      }
      
      this.setData({
        [`${section}Data`]: data,
        pickerVisible: false
      });
      
      console.log(`${section}数据已更新:`, data);
    } else {
      // 处理普通选择器
      this.setData({
        [`priceReportDetail.${this.data.pickerKay}`]: e.detail.value[0],
        pickerVisible: false
      });
    }
  },
  
  onPickerCancel() {
    this.setData({
      pickerVisible: false
    });
  },
  
  // 文件上传相关方法
  chooseMedia(e) {
    if (this.data.disabled) return;
    
    const sourceType = e.currentTarget.dataset.type;
    const key = e.currentTarget.dataset.key;
    const that = this;
    
    wx.chooseMedia({
      count: 9,
      mediaType: ['image', 'video'],
      sourceType: [sourceType],
      camera: 'back',
      success(res) {
        res.tempFiles.forEach((temp) => {
          if (temp.tempFilePath) that.uploadFile(temp.tempFilePath, key);
        });
      }
    });
  },
  
  chooseMessageFile(e) {
    if (this.data.disabled) return;
    
    const key = e.currentTarget.dataset.key;
    const that = this;
    
    wx.chooseMessageFile({
      count: 10,
      type: 'all',
      success(res) {
        res.tempFiles.forEach((temp) => {
          if (temp.path) that.uploadFile(temp.path, key);
        });
      }
    });
  },
  
  uploadFile(tempFilePath, key) {
    const that = this;
    
    wx.uploadFile({
      url: `${env.baseURL || ''}/file/uploadFile`,
      filePath: tempFilePath,
      name: 'file',
      header: {
        'content-type': 'multipart/form-data',
        'X-Access-Token': wx.getStorageSync('token')
      },
      success(res) {
        const { retCode, retData, retMsg } = JSON.parse(res.data);
        
        if (retCode === 200) {
          that.setData({
            [key]: that.data[key].concat(retData)
          });
          that.toast('上传成功', 'success');
        } else {
          that.toast(retMsg || '上传失败', 'warning');
        }
      },
      fail() {
        that.toast('上传失败', 'error');
      }
    });
  },
  
  fileDelete(e) {
    if (this.data.disabled) return;
    
    const key = e.currentTarget.dataset.key;
    const index = e.currentTarget.dataset.index;
    const id = e.currentTarget.dataset.id;
    
    let files = [...this.data[key]];
    files.splice(index, 1);
    
    this.setData({
      [key]: files
    });
    
    this.toast('删除成功', 'success');
  },
  
  preview(e) {
    console.log(e);
    const id = e.currentTarget.dataset.id;
    const key = e.currentTarget.dataset.key;
    const index = e.currentTarget.dataset.index;
    
    const fs = wx.getFileSystemManager();
    if (['image', 'video'].includes(isImageVideoUrl(id))) {
      let fileIds = this.data[key].filter((v, i) => i === index);
      const sources = fileIds.map(item => {
        let params = {
          condition: {
            primaryKey: item,
          },
        };
        return filepreview(params);
      });
      
      wx.showLoading({
        title: '加载中',
      });
      
      Promise.all(sources).then(list => {
        const sourcesList = fileIds.map((item, i) => {
          let filePath = wx.env.USER_DATA_PATH + "/" + item;
          fs.writeFileSync(
            filePath,
            list[i].data,
            "binary"
          );
          return {
            url: filePath,
            type: isImageVideoUrl(item)
          };
        });
        
        wx.hideLoading();
        wx.previewMedia({
          sources: sourcesList,
          fail: (err) => {
            console.log(err);
          }
        });
      }).catch(err => {
        wx.hideLoading();
        console.error('预览失败:', err);
        this.toast('预览失败', 'error');
      });
    } else {
      this.toast('不支持的文件类型', 'warning');
    }
  },
  
  isImageVideoUrl(url) {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg'];
    const videoExtensions = ['mp4', 'avi', 'mov', 'mkv', 'flv'];
    const ext = (url || '').split('.').pop().toLowerCase();
    
    if (imageExtensions.includes(ext)) {
      return 'image';
    } else if (videoExtensions.includes(ext)) {
      return 'video';
    }
    return 'other';
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
  
  staging() {
    this.setData({
      stagingLoading: true
    });
    this.saveData("0"); // 0表示暂存
  },
  
  submit() {
    // 验证必填字段
    if (!this.validateData()) {
      return;
    }
    
    this.setData({
      submitLoading: true
    });
    this.saveData("1"); // 1表示提交
  },
  
  validateData() {
    if (!this.data.priceReportDetail.varietyId) {
      this.toast('请选择品种大类', 'warning');
      return false;
    }
    if (!this.data.priceReportDetail.categoryId) {
      this.toast('请选择品种小类', 'warning');
      return false;
    }
    if (!this.data.priceReportDetail.harvestDate) {
      this.toast('请选择预计采摘时间', 'warning');
      return false;
    }
    if (!this.hasValidPriceData()) {
      this.toast('请至少填写一种价格类型的数据', 'warning');
      return false;
    }
    return true;
  },
  
  hasValidPriceData() {
    // 检查按果径数据
    const hasDiameterData = this.data.showDiameter && this.data.diameterData.some(item =>
      item.saleChannelCode && item.specsId && item.unitPrice && item.weight);
    
    // 检查按重量数据
    const hasWeightData = this.data.showWeight && this.data.weightData.some(item =>
      item.saleChannelCode && item.specsId && item.unitPrice && item.weight);
    
    // 检查统果数据
    const hasBulkData = this.data.showBulk && this.data.bulkData.price && this.data.bulkData.weight;
    
    return hasDiameterData || hasWeightData || hasBulkData;
  },
  
  saveData(submitType) {
    let specss = [];
    
    if (this.data.showDiameter) {
      const validDiameterData = this.filterValidData(this.data.diameterData);
      if (validDiameterData.length > 0) {
        validDiameterData.forEach(item => {
          item.specsType = "DIAMETER";
        });
        specss = specss.concat(validDiameterData);
      }
    }
    
    if (this.data.showWeight) {
      const validWeightData = this.filterValidData(this.data.weightData);
      if (validWeightData.length > 0) {
        validWeightData.forEach(item => {
          item.specsType = "WEIGHT";
        });
        specss = specss.concat(validWeightData);
      }
    }
    
    if (this.data.showBulk && this.data.bulkData.price && this.data.bulkData.weight) {
      specss.push({
        specsType: "WHOLE",
        unitPrice: this.data.bulkData.price,
        weight: this.data.bulkData.weight,
      });
    }
    
    const params = {
      condition: {
        ...this.data.priceReportDetail,
        collectPriceId: this.data.busiId,
        specss: specss,
        priceFileIds: this.data.priceFileIds,
        submitType: submitType
      }
    };
    
    console.log('保存数据参数:', params);
    
    savePriceReport(params).then((res) => {
      this.toast('保存成功', 'success');
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    }).catch(err => {
      this.toast(err.message || '保存失败', 'error');
    }).finally(() => {
      this.setData({
        stagingLoading: false,
        submitLoading: false
      });
    });
  },
  
  filterValidData(dataArray) {
    return dataArray.filter(item =>
      item.saleChannelCode && item.specsId && item.unitPrice && item.weight);
  }
});