// 获取 小程序帐号信息
const {
  miniProgram
} = wx.getAccountInfoSync();

// 获取小程序当前开发环境
// develop 开发版, trial 体验版, release 正式版
const {
  envVersion
} = miniProgram;

let env = {
  baseURL: "",
};

switch (envVersion) {
  case "develop":
    env.baseURL = "https://www.zhixunchelian.com/price_backend/weixin";
    // env.baseURL = "https:///uat.zhixunchelian.com/price_backend/weixin";
    // env.baseURL = "http://192.168.8.174:8099/price_backend/weixin";
    env.ImageUrl = 'https://webxtx-test-sz.oss-cn-shenzhen.aliyuncs.com/price_saas/'
    break;

  case "trial":
    // env.baseURL = "http://192.168.8.174:8099/price_backend/weixin";
    env.baseURL = "https://uat.zhixunchelian.com/price_backend/weixin";
    env.ImageUrl = 'https://webxtx-test-sz.oss-cn-shenzhen.aliyuncs.com/price_saas/'
    break;

  case "release":
    env.baseURL = "https://www.zhixunchelian.com/price_backend/weixin";
    env.ImageUrl = 'https://webxtx-prd.oss-cn-shenzhen.aliyuncs.com/price_saas/'
    break;

  default:
    console.log("当前环境异常");
    env.baseURL = "";
}

export {
  env
};