/**
 * 品种小类详情页面
 * 用于展示和编辑单个品种小类的价格信息，包括按果径、按重量和统果三种价格类型
 * 同时支持上传价格佐证凭据和采价记录
 */

import {
    queryTypeDicts,         // 查询字典数据API
    selectVarietySpecss,    // 查询规格数据API
    saveCollectPrice,       // 保存采价数据API
    filepreview,            // 文件预览API
    softRemoveFile          // 文件删除API
} from "../../utils/api";
import { Toast } from "tdesign-miniprogram";  // 提示组件
import { env } from "../../utils/env";        // 环境配置

Page({
    /**
     * 页面的初始数据
     */
    data: {
        // 基础信息
        categoryId: '',        // 品种小类ID
        categoryName: '',      // 品种小类名称
        varietyId: '',         // 品种大类ID
        varietyName: '',       // 品种大类名称
        stallId: '',           // 采价点ID
        stallName: '',         // 采价点名称
        collectPriceId: '',    // 采价ID，有值表示更新，无值表示新增

        // 价格数据
        diameterData: [{       // 按果径价格数据
            fvSpecsMax: 0,
            fvSpecsMin: 0,
            fvSpecsUnit: "",
            saleChannelCode: "SCH_JXS", // 默认经销商渠道
            specsId: 0,
            specsType: "DIAMETER",
            unitPrice: 0,
            weight: 0,
            varietyUnit: "UG",
        }],
        weightData: [{         // 按重量价格数据
            fvSpecsMax: 0,
            fvSpecsMin: 0,
            fvSpecsUnit: "",
            saleChannelCode: "SCH_JXS", // 默认经销商渠道
            specsId: 0,
            specsType: "WEIGHT",
            unitPrice: 0,
            weight: 0,
            varietyUnit: "UG",
        }],
        bulkData: {            // 统果价格数据
            price: '',           // 价格
            weight: ''           // 重量
        },

        // 凭据文件数据
        priceFileIds: [],      // 价格佐证凭据文件ID列表
        collectFileIds: [],    // 采价记录文件ID列表

        // 规格和渠道数据
        channel: [],           // 渠道列表
        specssList: {},        // 规格列表

        // 选择器相关数据
        pickerVisible: false,  // 选择器是否可见
        pickerValue: null,     // 选择器当前值
        pickerTitle: '',       // 选择器标题
        pickerOptions: [],     // 选择器选项
        pickerKay: '',         // 选择器关键字，用于识别当前选择的是什么字段
        specssIndex: null,     // 当前操作的规格索引
        currentSection: '',    // 当前操作的区域（diameter, weight, bulk）

        // 其他控制数据
        disabled: false,       // 是否禁用编辑
        stagingLoading: false, // 暂存按钮加载状态
        submitLoading: false,  // 提交按钮加载状态
        refresherTriggered: false, // 下拉刷新状态
        varietyUnit: {         // 单位映射
            "UG": "元/斤",
            "UKG": "元/公斤",
        }
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        console.log('页面加载参数:', options);

        // 获取传递的参数
        this.setData({
            categoryId: options.categoryId || '',
            categoryName: options.categoryName || '',
            varietyId: options.varietyId || '',
            varietyName: options.varietyName || '',
            stallId: options.stallId || '',
            stallName: options.stallName || '',
            collectPriceId: options.collectPriceId || '',
            priceFileIds: ['测试价格凭据文件1.jpg', '测试价格凭据文件2.jpg'],
            collectFileIds: ['测试采价记录文件1.jpg', '测试采价记录文件2.jpg']
        });

        // 初始化数据
        this.getChannelList();  // 获取渠道列表

        if (this.data.varietyId) {
            this.getSpecsList(this.data.varietyId);  // 获取规格列表
        }

        // 如果有collectPriceId，表示编辑模式，加载已有数据
        if (this.data.collectPriceId) {
            this.loadExistingData();
        }
    },

    /**
     * 获取渠道列表
     */
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

    /**
     * 获取规格列表
     * @param {string} varietyId 品种大类ID
     */
    getSpecsList(varietyId) {
        if (!varietyId) {
            console.warn('无法获取规格列表: 品种ID为空');
            return;
        }

        const params = {
            primaryKey: varietyId
        };

        selectVarietySpecss(params).then((res) => {
            console.log('获取规格列表成功:', res);
            this.setData({
                specssList: res
            });
        }).catch(err => {
            console.error('获取规格列表失败:', err);
            this.toast('获取规格列表失败', 'error');
        });
    },

    /**
     * 加载已有数据（编辑模式）
     */
    loadExistingData() {
        console.log('加载已有数据，采价ID:', this.data.collectPriceId);

        // 在实际项目中，这里应调用API获取已有数据
        // const params = {
        //   condition: {
        //     primaryKey: this.data.collectPriceId
        //   }
        // };

        // getCollectPrice(params).then((res) => {
        //   // 处理返回的数据
        //   this.setData({
        //     diameterData: res.diameterData || this.data.diameterData,
        //     weightData: res.weightData || this.data.weightData,
        //     bulkData: res.bulkData || this.data.bulkData,
        //     priceFileIds: res.priceFileIds || [],
        //     collectFileIds: res.collectFileIds || []
        //   });
        // });

        // 暂时使用模拟数据
        setTimeout(() => {
            this.setData({
                diameterData: [...this.data.diameterData],
                weightData: [...this.data.weightData],
                bulkData: { ...this.data.bulkData },
                priceFileIds: [],
                collectFileIds: []
            });
        }, 500);
    },

    /**
     * 处理组件数据更新事件
     * 当价格输入面板组件内部数据变化时触发
     */
    handleUpdate(e) {
        const { type, data } = e.detail;

        this.setData({
            [`${type}Data`]: data
        });
        console.log(`${type}数据已更新:`, data);
    },

    /**
     * 处理组件选择项事件
     * 当需要在价格输入面板中选择渠道或规格时触发
     */
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
            // 选择规格
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

    /**
     * 处理选择器确认事件
     */
    onPickerConfirm(e) {
        const section = this.data.currentSection;
        const index = this.data.specssIndex;
        const key = this.data.pickerKay;
        const data = [...this.data[`${section}Data`]];

        // 更新选中的值
        data[index][key] = e.detail.value[0];

        // 如果是规格，还需要更新其他属性
        if (key === 'specsId') {
            const specsType = section === 'diameter' ? 'diameterSpecsVos' : 'weightSpecsVos';
            const specs = this.data.specssList[specsType]
                .find(item => item.specsId === e.detail.value[0]);

            if (specs) {
                data[index].fvSpecsMin = specs.fvSpecsMin;
                data[index].fvSpecsMax = specs.fvSpecsMax;
                data[index].fvSpecsUnit = specs.fvSpecsUnit;
                data[index].varietyUnit = specs.varietyUnit;

                // 添加规格名称显示
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
            // 添加渠道名称显示
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
    },

    /**
     * 处理选择器取消事件
     */
    onPickerCancel() {
        this.setData({
            pickerVisible: false
        });
    },

    /**
     * 显示消息提示
     * @param {string} message 提示信息
     * @param {string} theme 提示类型，可选值：success, warning, error
     */
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

    /**
     * 处理组件提示事件
     */
    handleToast(e) {
        const { message, theme } = e.detail;
        this.toast(message, theme);
    },

    /**
     * 选择媒体文件（照片/视频）
     * @param {Object} e 事件对象
     */
    chooseMedia(e) {
        if (this.data.disabled) return;

        const sourceType = e.currentTarget.dataset.type; // camera 或 album
        const key = e.currentTarget.dataset.key; // priceFileIds 或 collectFileIds
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

    /**
     * 选择微信聊天文件
     * @param {Object} e 事件对象
     */
    chooseMessageFile(e) {
        if (this.data.disabled) return;

        const key = e.currentTarget.dataset.key; // priceFileIds 或 collectFileIds
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

    /**
     * 上传文件
     * @param {string} tempFilePath 临时文件路径
     * @param {string} key 文件类型键，priceFileIds 或 collectFileIds
     */
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

    /**
     * 删除文件
     * @param {Object} e 事件对象
     */
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

        // 实际项目中应调用API删除服务器上的文件
        // const params = {
        //   condition: {
        //     primaryKeys: [id]
        //   }
        // };
        // softRemoveFile(params).then(() => {
        //   this.toast('删除成功', 'success');
        // });

        this.toast('删除成功', 'success');
    },

    /**
     * 预览文件
     * @param {Object} e 事件对象
     */
    preview(e) {
        const id = e.currentTarget.dataset.id;
        const key = e.currentTarget.dataset.key;
        const index = e.currentTarget.dataset.index;

        // 这里仅作为示例，实际项目中应根据文件类型和服务器API进行适当处理
        // const fs = wx.getFileSystemManager();
        // 
        // let params = {
        //   condition: {
        //     primaryKey: id,
        //   },
        // };
        // 
        // filepreview(params).then(res => {
        //   let filePath = wx.env.USER_DATA_PATH + "/" + id;
        //   fs.writeFileSync(filePath, res.data, "binary");
        //   
        //   wx.previewMedia({
        //     sources: [{
        //       url: filePath,
        //       type: this.isImageVideoUrl(id)
        //     }]
        //   });
        // });

        // 简化示例
        wx.previewImage({
            urls: [id],
            current: id
        });
    },

    /**
     * 判断文件类型
     * @param {string} url 文件URL或ID
     * @returns {string} 文件类型，可能值：image, video, other
     */
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

    /**
     * 暂存数据
     */
    staging() {
        this.setData({
            stagingLoading: true
        });
        this.saveData("0"); // 0表示暂存
    },

    /**
     * 提交数据
     */
    submit() {
        // 验证数据
        if (!this.validateData()) {
            return;
        }

        this.setData({
            submitLoading: true
        });
        this.saveData("1"); // 1表示提交
    },

    /**
     * 验证数据
     * @returns {boolean} 验证结果，true表示验证通过
     */
    validateData() {
        // 验证至少选择了一种类型
        if (!this.hasValidData()) {
            this.toast('请至少填写一种价格类型的数据', 'warning');
            return false;
        }

        return true;
    },

    /**
     * 检查是否有有效数据
     * @returns {boolean} 是否有有效数据
     */
    hasValidData() {
        // 检查按果径数据
        const hasDiameterData = this.data.diameterData.some(item =>
            item.saleChannelCode && item.specsId && item.unitPrice && item.weight);

        // 检查按重量数据
        const hasWeightData = this.data.weightData.some(item =>
            item.saleChannelCode && item.specsId && item.unitPrice && item.weight);

        // 检查统果数据
        const hasBulkData = this.data.bulkData.price && this.data.bulkData.weight;

        return hasDiameterData || hasWeightData || hasBulkData;
    },

    /**
     * 保存数据
     * @param {string} submitType 提交类型，0表示暂存，1表示提交
     */
    saveData(submitType) {
        // 构建保存参数
        const params = {
            condition: {
                categoryId: this.data.categoryId,
                categoryName: this.data.categoryName,
                varietyId: this.data.varietyId,
                varietyName: this.data.varietyName,
                stallId: this.data.stallId,
                stallName: this.data.stallName,
                submitType: submitType,

                // 组合所有价格数据
                diameterData: this.filterValidData(this.data.diameterData),
                weightData: this.filterValidData(this.data.weightData),
                bulkData: this.data.bulkData,

                // 文件ID列表
                priceFileIds: this.data.priceFileIds,
                collectFileIds: this.data.collectFileIds,

                // 如果有collectPriceId，表示更新已有数据
                collectPriceId: this.data.collectPriceId || ''
            }
        };

        console.log('保存数据参数:', params);

        // 这里应该调用实际的API保存数据
        // saveCollectPrice(params).then((res) => {
        //   this.toast('保存成功', 'success');
        //   
        //   // 延迟返回上一页
        //   setTimeout(() => {
        //     wx.navigateBack();
        //   }, 1500);
        // }).catch(err => {
        //   this.toast(err.message || '保存失败', 'error');
        // }).finally(() => {
        //   this.setData({
        //     stagingLoading: false,
        //     submitLoading: false
        //   });
        // });

        // 模拟保存
        setTimeout(() => {
            this.toast('保存成功', 'success');

            // 延迟返回上一页
            setTimeout(() => {
                wx.navigateBack();
            }, 1500);

            this.setData({
                stagingLoading: false,
                submitLoading: false
            });
        }, 1000);
    },

    /**
     * 过滤有效数据
     * @param {Array} dataArray 数据数组
     * @returns {Array} 过滤后的有效数据
     */
    filterValidData(dataArray) {
        return dataArray.filter(item =>
            item.saleChannelCode && item.specsId && item.unitPrice && item.weight);
    }
});