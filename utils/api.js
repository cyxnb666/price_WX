import instance from '../utils/request'
/**
 * @description 获取n信息
 * @returns Promise
 */
export const selectHome = () => instance.post(`/home/selectHome`)
/**
 * @description 获取用户信息
 * @returns Promise
 */
export const getFarmerByCode = (code) => instance.get(`/auth/getFarmerByCode?code=${code}`)
/**
 * @description 小程序登录接口
 * @param {Object} data
 * @returns Promise
 */
export const mobileLogin = (data) => instance.post('/auth/loginByMiniorogramCode', data)
/**
 * @description 分页查询采价任务列表
 * @param {Object} data
 * @returns Promise
 */
export const selectICollectPriceTasks = (data) => instance.post('/collect/selectICollectPriceTasks', data)
/**
 * @description 采价点任务详情
 * @param {Object} data
 * @returns Promise
 */
export const getWxCollecpriceTask = (data) => instance.post('/collect/getWxCollecpriceTask', data)
/**
 * @description 提交采价任务
 * @param {Object} data
 * @returns Promise
 */
export const submitCollectPriceTask = (data) => instance.post('/collect/submitCollectPriceTask', data)
/**
 * @description 删除关联采价点
 * @param {Object} data
 * @returns Promise
 */
export const removeStall = (data) => instance.post('/collect/removeStall', data)
/**
 * @description 查询当前采价员可选则采价点
 * @param {Object} data
 * @returns Promise
 */
export const selectChooseStalls = (data) => instance.post('/collect/selectChooseStalls', data)
/**
 * @description 新增采价任务采价点
 * @param {Object} data
 * @returns Promise
 */
export const addTaskStalls = (data) => instance.post('/collect/addTaskStalls', data)
/**
 * @description 新增采价任务采价点
 * @param {Object} data
 * @returns Promise
 */
export const calcCollectTaskRate = (data) => instance.post('/collect/calcCollectTaskRate', data)

/**
 * @description 采价任务详情
 * @param {Object} data
 * @returns Promise
 */
export const getCollectPrice = (data) => instance.post('/collect/getCollectPrice', data)
/**
 * @description 采价任务详情
 * @param {Object} data
 * @returns Promise
 */
export const ownersaveCollectPrice = (data) => instance.post('/owner/saveCollectPrice', data)
/**
 * @description 采价占比
 * @param {Object} data
 * @returns Promise
 */
export const actualCollectRate = (data) => instance.post('/collect/calcCollectTaskRate', data)

/**
 * @description 查询采价点联系人信息
 * @param {Object} data
 * @returns Promise
 */
export const selectStallLinkers = (data) => instance.post('/stall/selectStallLinkers', data)


/**
 * @description 大额出售计划分页查询
 * @param {Object} data
 * @returns Promise
 */
export const selectILargeSalePlans = (data) => instance.post('/large/selectILargeSalePlans', data)
/**
 * @description 认领任务
 * @param {Object} data
 * @returns Promise
 */
export const recvSalePlans = (data) => instance.post('/large/recv', data)
/**
 * @description 逆解析地址
 * @param {Object} data
 * @returns Promise
 */
export const regeo = (data) => instance.post('/geo/regeo', data)
/**
 * @description 查询可用果蔬品种品类
 * @param {Object} data
 * @returns Promise
 */
export const selectButtomVarieties = (data) => instance.post('/large/selectButtomVarieties', data)
/**
 * @description 查询果蔬规格
 * @param {Object} data
 * @returns Promise
 */
export const selectVarietySpecss = (data) => instance.post('/large/selectVarietySpecss', data)
/**
 * @description 数据字典
 * @param {Object} data
 * @returns Promise
 */
export const queryTypeDicts = (data) => instance.post('/dict/queryTypeDicts', data)
/**
 * @description 大额出售计划详情
 * @param {Object} data
 * @returns Promise
 */
export const getLargePlan = (data) => instance.post('/large/getLargePlan', data)
/**
 * @description 大额出售计划详情
 * @param {Object} data
 * @returns Promise
 */
export const getLargeCollectPrice = (data) => instance.post('/large/getLargeCollectPrice', data)
export const getStall = (data) => instance.post('/stall/getStall', data)
/**
 * @description 大额出售计划详情
 * @param {Object} data
 * @returns Promise
 */
export const selectStallFruiveggies = (data) => instance.post('/stall/selectStallFruiveggies', data)
/**
 * @description 大额出售计划详情
 * @param {Object} data
 * @returns Promise
 */
export const selectTaskChooseStalls = (data) => instance.post('/collect/selectTaskChooseStalls', data)


/**
 * @description 软删除附件基础信息表
 * @param {Object} data
 * @returns Promise
 */
export const softRemoveFile = (data) => instance.post('/file/softRemoveFile', data)

/**
 * @description
 * 新增采价信息
 * @param {Object} data
 * @returns Promise
 */
export const saveCollectPrice = (data) => instance.post('/collect/saveCollectPrice', data)


/**
 * @description
 * 发送短信
 * @param {Object} data
 * @returns Promise
 */
export const sendCollectPriceCooperSms = (data) => instance.post('/sms/sendCollectPriceCooperSms', data)

/**
 * @description
 * 生成任务号
 * @param {Object} data
 * @returns Promise
 */
export const buildCollectPriceId = (data) => instance.post('/collect/buildCollectPriceId', data)
/**
 * @description
 * 自主采集生成任务号
 * @param {Object} data
 * @returns Promise
 */
export const ownerbuildCollectPriceId = (data) => instance.post('/owner/buildCollectPriceId', data)
/**
 * @description
 * 查询自主采集价格任务详情
 * @param {Object} data
 * @returns Promise
 */
export const ownergetWxCollecpriceTask = (data) => instance.post('/owner/getWxCollecpriceTask', data)
/**
 * @description
 * 删除自主采集价格任务详情
 * @param {Object} data
 * @returns Promise
 */
export const withdrawCollectPrice = (data) => instance.post('/owner/withdrawCollectPrice', data)
/**
 * @description
 * 删除自主采集价格任务详情
 * @param {Object} data
 * @returns Promise
 */
export const removeOwnerCollectPrice = (data) => instance.post('/owner/removeOwnerCollectPrice', data)
/**
 * @description
 * c端发送消息
 * @param {Object} data
 * @returns Promise
 */
export const callVideo = (data) => instance.post('/miniVideo/callVideo', data)

/**
 * @description 查询当前菜价点信息
 * @param {Object} date
 * @returns Promise
 */
export const largebuildCollectPriceId = (data) => instance.post('/large/buildCollectPriceId', data)
/**
 * @description 查询农户当前菜价点信息
 * @param {Object} date
 * @returns Promise
 */
export const selectCurrentStall = (data) => instance.post('/stall/selectCurrentStall', data)

/**
 * @description 新增大额出售计划
 * @param {Object} date
 * @returns Promise
 */
export const saveLargeSalePlan = (data) => instance.post('/large/saveLargeSalePlan', data)
/**
 * @description 编辑大额出售计划
 * @param {Object} date
 * @returns Promise
 */
export const editLargeSalePlan = (data) => instance.post('/large/editLargeSalePlan', data)

/**
 * @description 大额计划价格上报
 * @param {Object} date
 * @returns Promise
 */
export const reportLargePrice = (data) => instance.post('/large/reportLargePrice', data)
/**
 * @description 大额计划价格上报
 * @param {Object} date
 * @returns Promise
 */
export const ownerselectICollectPriceTasks = (data) => instance.post('/owner/selectICollectPriceTasks', data)
/**
 * @description 菜价点添加联系人
 * @param {Object} date
 * @returns Promise
 */
export const addStallLinker = (data) => instance.post('/stall/addStallLinker', data)