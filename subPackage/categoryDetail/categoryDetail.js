import {
    queryTypeDicts,
    selectVarietySpecss,
    saveCollectPrice,
    filepreview,
    softRemoveFile,
    saveOwnerCollectCategoryPrice,
    getOwnerCollectCategory
} from "../../utils/api";
import { Toast } from "tdesign-miniprogram";
import { env } from "../../utils/env";

Page({
    data: {
        // 基础信息
        categoryId: '',
        categoryName: '',
        varietyId: '',
        varietyName: '',
        stallId: '',
        stallName: '',
        collectPriceId: '',

        // 价格数据
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
        collectFileIds: [],

        // 规格和渠道数据
        channel: [],
        specssList: {},

        // 选择器相关数据
        pickerVisible: false,
        pickerValue: null,
        pickerTitle: '',
        pickerOptions: [],
        pickerKay: '',
        specssIndex: null,
        currentSection: '',

        // 其他控制数据
        disabled: false,
        stagingLoading: false,
        submitLoading: false,
        refresherTriggered: false,
        varietyUnit: {
            "UG": "元/斤",
            "UKG": "元/公斤",
        }
    },
    onLoad(options) {
        console.log('页面加载参数:', options);
        this.setData({
            showDiameter: true,
            showWeight: false,
            showBulk: false,
            categoryId: options.categoryId || '',
            categoryName: options.categoryName || '',
            varietyId: options.varietyId || '',
            varietyName: options.varietyName || '',
            stallId: options.stallId || '',
            stallName: options.stallName || '',
            collectCategoryId: options.collectCategoryId || '',
            priceFileIds: [],
            collectFileIds: []
        });

        // 初始化数据
        this.getChannelList();

        if (this.data.varietyId) {
            this.getSpecsList(this.data.varietyId);
        }

        // 如果有collectPriceId，表示编辑模式，加载已有数据
        if (this.data.collectCategoryId) {
            this.loadExistingData();
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
    loadExistingData() {
        console.log('加载已有数据，collectCategoryId:', this.data.collectCategoryId);
        wx.showLoading({
            title: '加载中...'
        });

        const params = {
            condition: {
                primaryKey: this.data.collectCategoryId
            }
        };

        getOwnerCollectCategory(params).then((res) => {
            console.log('获取小类采价信息成功:', res);

            if (!res || !res.specss) {
                console.log('没有找到采价数据或数据为空');
                wx.hideLoading();
                return;
            }

            // 初始化三种价格类型的数据
            let diameterData = [];
            let weightData = [];
            let bulkData = { price: '', weight: '' };
            let showDiameter = false;
            let showWeight = false;
            let showBulk = false;

            // 处理规格数据
            if (res.specss && res.specss.length > 0) {
                res.specss.forEach(item => {
                    // 为每个规格添加显示所需的附加字段
                    if (item.saleChannelCode) {
                        item.saleChannelName = item.saleChannelCnm;
                    }

                    // 生成规格名称
                    if (item.specsId && (item.specsType === 'DIAMETER' || item.specsType === 'WEIGHT')) {
                        let specsName = '';
                        if (item.fvSpecsMin !== null && item.fvSpecsMax !== null) {
                            specsName = `${item.fvSpecsMin} ${item.fvSpecsUnit}-${item.fvSpecsMax} ${item.fvSpecsUnit}`;
                        } else if (item.fvSpecsMin === null) {
                            specsName = `${item.fvSpecsMax} ${item.fvSpecsUnit} 以下`;
                        } else if (item.fvSpecsMax === null) {
                            specsName = `${item.fvSpecsMin} ${item.fvSpecsUnit} 以上`;
                        }
                        item.specsName = specsName;
                    }

                    // 按类型分类数据
                    if (item.specsType === 'DIAMETER') {
                        diameterData.push(item);
                        showDiameter = true;
                    } else if (item.specsType === 'WEIGHT') {
                        weightData.push(item);
                        showWeight = true;
                    } else if (item.specsType === 'WHOLE') {
                        bulkData = {
                            price: item.unitPrice,
                            weight: item.weight
                        };
                        showBulk = true;
                    }
                });
            }

            // 如果某种类型没有数据，添加一个默认项
            if (diameterData.length === 0) {
                diameterData.push({
                    fvSpecsMax: 0,
                    fvSpecsMin: 0,
                    fvSpecsUnit: "",
                    saleChannelCode: "SCH_JXS",
                    specsId: 0,
                    specsType: "DIAMETER",
                    unitPrice: 0,
                    weight: 0,
                    varietyUnit: "UG",
                });
            }

            if (weightData.length === 0) {
                weightData.push({
                    fvSpecsMax: 0,
                    fvSpecsMin: 0,
                    fvSpecsUnit: "",
                    saleChannelCode: "SCH_JXS",
                    specsId: 0,
                    specsType: "WEIGHT",
                    unitPrice: 0,
                    weight: 0,
                    varietyUnit: "UG",
                });
            }

            // 更新界面数据
            this.setData({
                diameterData: diameterData,
                weightData: weightData,
                bulkData: bulkData,
                showDiameter: showDiameter,
                showWeight: showWeight,
                showBulk: showBulk,
                priceFileIds: res.priceFileIds || [],
                collectFileIds: res.collectFileIds || []
            }, () => {
                console.log('设置显示状态:', {
                    showDiameter: this.data.showDiameter,
                    showWeight: this.data.showWeight,
                    showBulk: this.data.showBulk
                });
            });

            console.log('数据加载完成，各部分状态:', {
                showDiameter,
                showWeight,
                showBulk,
                diameterData,
                weightData,
                bulkData
            });

        }).catch(err => {
            console.error('获取小类采价信息失败:', err);
            this.toast('加载数据失败', 'error');
        }).finally(() => {
            wx.hideLoading();
        });
    },
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
    onPickerConfirm(e) {
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
    },
    onPickerCancel() {
        this.setData({
            pickerVisible: false
        });
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
    handleToast(e) {
        const { message, theme } = e.detail;
        this.toast(message, theme);
    },
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

    preview(e) {
        console.log(e);
        const id = e.currentTarget.dataset.id;
        const key = e.currentTarget.dataset.key;
        const index = e.currentTarget.dataset.index;

        const fs = wx.getFileSystemManager();
        if (['image', 'video'].includes(this.isImageVideoUrl(id))) {
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
                        "binary" // 二进制流文件必须是binary
                    );
                    return {
                        url: filePath,
                        type: this.isImageVideoUrl(item)
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
    staging() {
        this.setData({
            stagingLoading: true
        });
        this.saveData("0");
    },
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
    validateData() {
        if (!this.hasValidData()) {
            this.toast('请至少填写一种价格类型的数据', 'warning');
            return false;
        }

        return true;
    },
    hasValidData() {
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
                collectCategoryId: this.data.collectCategoryId,
                priceFileIds: this.data.priceFileIds,
                collectFileIds: this.data.collectFileIds,
                specss: specss,
                submitType: submitType
            }
        };

        console.log('保存数据参数:', params);

        saveOwnerCollectCategoryPrice(params).then((res) => {
            this.toast('保存成功', 'success');
            const pages = getCurrentPages();
            const prevPage = pages[pages.length - 2];

            if (prevPage && prevPage.fetchCategories) {
                prevPage.fetchCategories(this.data.varietyId);
            }
            // 延迟返回上一页
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
    },
    handleSectionToggle(e) {
        const { section, show } = e.detail;
        this.setData({
            [`show${section}`]: show
        });
        console.log(`${section}显示状态已更新为: ${show}`);
    }
});