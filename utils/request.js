import {
  env
} from "./env";
import {
  Toast
} from "tdesign-miniprogram";
class WxRequest {
  // 默认参数对象
  defaults = {
    baseURL: "", // 请求基准地址
    url: "", // 开发者服务器接口地址
    data: null, // 请求参数
    method: "GET", // 默认请求方法
    // 请求头
    header: {
      "Content-type": "application/json", // 设置数据的交互格式
    },
    timeout: 60000, // 小程序默认超时时间是 60000，一分钟
    isLoading: true, // 是否显示 loading 提示框
  };

  // 定义拦截器对象，包含请求拦截器和响应拦截器方法，方便在请求或响应之前进行处理。
  interceptors = {
    // 请求拦截器
    request: (config) => config,
    // 响应拦截器
    response: (response) => response,
  };

  // 定义数组队列，用来存储请求队列、存储请求标识
  queue = [];

  /**
   * @description 定义 constructor 构造函数，用于创建和初始化类的属性和方法
   * @param {*} params 用户传入的请求配置项
   */
  constructor(params) {
    // 使用 Object.assign 合并默认参数以及传递的请求参数
    this.defaults = Object.assign({}, this.defaults, params);
  }

  /**
   * @description 发起请求的方法
   * @param { Object} options 请求配置选项，同 wx.request 请求配置选项
   * @returns Promise
   */
  request(options) {
    // 如果有新的请求，就清除上一次的定时器
    this.timerId && clearTimeout(this.timerId);

    // 拼接完整的请求地址
    options.url = this.defaults.baseURL + options.url;
    // 合并请求参数
    options = {
      ...this.defaults,
      ...options
    };

    // 控制 loading 的显示与隐藏
    if (options.isLoading && options.method !== "UPLOAD") {
      //如果不是空就显示loading
      this.queue.length === 0 &&
        wx.showLoading({
          title: "加载中...",
          mask: true,
        });

      // 然后立刻向队列中添加请求标识
      this.queue.push("request");
    }

    // 在发送请求之前调用请求拦截器
    options = this.interceptors.request(options);

    // 实例方法：需要使用 promise 封装 wx.request，处理异步请求
    return new Promise((resolve, reject) => {
      // 如果 method 等于 UPLOAD 说明需要调用 wx.uploadFile() 方法
      // 否则调用的是 wx.request() 方法
      if (options.method === "UPLOAD") {
        wx.uploadFile({
          ...options,

          success: (res) => {
            // 需要将服务器返回的 JSON 字符串 通过 JSON.parse 转成对象
            res.data = JSON.parse(res.data);

            // 合并参数
            const mergeRes = Object.assign({}, res, {
              config: options,
              isSuccess: true,
            });

            resolve(this.interceptors.response(mergeRes));
          },

          fail: (err) => {
            // 合并参数
            const mergeErr = Object.assign({}, err, {
              config: options,
              isSuccess: false,
            });

            reject(this.interceptors.response(mergeErr));
          },
        });
      } else if (options.responseType == "arraybuffer") {
        wx.request({
          ...options,

          // 接口调用成功的回调函数
          success: (res) => {
            resolve(res);
          },

          // 接口调用失败的回调函数
          fail: (err) => {
            // 不管接口成功还是失败，都需要调用响应拦截器
            const mergeRes = Object.assign({}, err, {
              config: options, //请求参数
              isSuccess: false, //执行了fail
            });
            reject(this.interceptors.response(mergeRes));
          },
          complete: () => {
            // 如果需要显示 loading ，那么就需要控制 loading 的隐藏
            if (options.isLoading) {
              // 在每一个请求结束以后，都会执行 complete 回调函数
              // 每次从 queue 队列中删除一个标识
              this.queue.pop();
              // 解决并发请求，loading 闪烁问题
              this.queue.length === 0 && this.queue.push("request");
              this.timerId = setTimeout(() => {
                this.queue.pop();
                this.queue.length === 0 && wx.hideLoading();
                clearTimeout(this.timerId);
              }, 1);
            }
          },
        });
      } else {
        wx.request({
          ...options,

          // 接口调用成功的回调函数
          success: (res) => {
            // 不管接口成功还是失败，都需要调用响应拦截器
            const mergeRes = Object.assign({}, res, {
              config: options, //请求参数
              isSuccess: true, //执行了isSuccess
            });
            resolve(this.interceptors.response(mergeRes));
          },

          // 接口调用失败的回调函数
          fail: (err) => {
            // 不管接口成功还是失败，都需要调用响应拦截器
            const mergeRes = Object.assign({}, err, {
              config: options, //请求参数
              isSuccess: false, //执行了fail
            });
            reject(this.interceptors.response(mergeRes));
          },
          complete: () => {
            // 如果需要显示 loading ，那么就需要控制 loading 的隐藏
            if (options.isLoading) {
              // 在每一个请求结束以后，都会执行 complete 回调函数
              // 每次从 queue 队列中删除一个标识
              this.queue.pop();
              // 解决并发请求，loading 闪烁问题
              this.queue.length === 0 && this.queue.push("request");
              this.timerId = setTimeout(() => {
                this.queue.pop();
                this.queue.length === 0 && wx.hideLoading();
                clearTimeout(this.timerId);
              }, 1);
            }
          },
        });
      }
    });
  }

  /**
   * @description 封装 GET 实例方法
   * @param {*} url 请求地址
   * @param {*} data 请求参数
   * @param {*} config 其他请求配置项
   * @returns Promise
   */
  get(url, data = {}, config = {}) {
    return this.request(Object.assign({
      url,
      data,
      method: "GET"
    }, config));
  }

  /**
   * @description 封装 POST 实例方法
   * @param {*} url 请求地址
   * @param {*} data 请求参数
   * @param {*} config 其他请求配置项
   * @returns Promise
   */
  post(url, data = {}, config = {}) {
    return this.request(Object.assign({
      url,
      data,
      method: "POST"
    }, config));
  }

  /**
   * @description 封封装 PUT 实例方法
   * @param {*} url 请求地址
   * @param {*} data 请求参数
   * @param {*} config 其他请求配置项
   * @returns Promise
   */
  put(url, data = {}, config = {}) {
    return this.request(Object.assign({
      url,
      data,
      method: "PUT"
    }, config));
  }

  /**
   * @description 封装 DELETE 实例方法
   * @param {*} url 请求地址
   * @param {*} data 请求参数
   * @param {*} config 其他请求配置项
   * @returns Promise
   */
  delete(url, data = {}, config = {}) {
    return this.request(Object.assign({
      url,
      data,
      method: "DELETE"
    }, config));
  }

  /**
   * @description upload 实例方法，用来对 wx.uploadFile 进行封装
   * @param {*} url 文件的上传地址、接口地址
   * @param {*} filePath 要上传的文件资源路径
   * @param {*} name 文件对应的 key
   * @param {*} config 其他配置项
   */
  upload(url, filePath, name = "file", config = {}) {
    return this.request(
      Object.assign({
        url,
        filePath,
        name,
        method: "UPLOAD"
      }, config)
    );
  }

  /**
   * @description 处理并发请求
   * @param  {...promise} promise 传入的每一项需要是 Promise
   * @returns Promise
   */
  all(...promise) {
    // 通过展开运算符结束参数 会将传入的参数转为数组
    return Promise.all(promise);
  }
}

// 对 WxRequest 进行实例化
const instance = new WxRequest({
  baseURL: env.baseURL,
  timeout: 15000
})
// 添加请求拦截器
instance.interceptors.request = (config) => {
  // 在请求发送之前做点什么……
  // 新增请求头
  const token = wx.getStorageSync('token')
  if (token) {
    config.header['X-Access-Token'] = token
  }
  return config
}
// 添加响应拦截器
instance.interceptors.response = async (response) => {
  // 对响应数据做点什么
  // 从 response 中解构 isSuccess
  const {
    isSuccess,
    data,
    config,
    statusCode
  } = response
  console.log(data)
  const NotToastURl = ['submitCollectPriceTask']
  if (statusCode !== 200) {
    wx.showLoading();
    wx.hideLoading();
    setTimeout(() => {
      wx.showToast({
        title: '接口异常，请稍后重试 !',
        icon: 'none',
        duration: 2000
      })
    }, 200);
    return response
  }
  // 如果 isSuccess 为 false，说明执行了 fail 回调函数
  // 这时候就说明网络异常，需要给用户提示网络异常
  if (!isSuccess) {
    wx.showLoading();
    wx.hideLoading();
    setTimeout(() => {
      wx.showToast({
        title: '网络异常，请稍后重试 !',
        icon: 'none'
      })
    }, 200);
    return response
  }
  // 对业务状态码进行处理
  if (data.retCode !== 200) {
    if (data.retCode === 504) {
      // 判断用户是否点击了确定
      const modalStatus = await wx.showModal({
        title: '提示',
        content: '登录授权过期，请重新授权',
        duration: 2000
      })
      // 如果点击了确定，先清空本地的 token，然后跳转到登录页面
      wx.removeStorageSync('token')
      wx.reLaunch({
        url: '/pages/login/login'
      })

      return
    }
    // if (data.retCode === 403)
    wx.showLoading();
    wx.hideLoading();
    console.log(NotToastURl.every(v => config.url.indexOf(v) == -1), 'NotToastURl.every(v => config.url.indexOf(v) == -1)')
    if (NotToastURl.every(v => config.url.indexOf(v) == -1)) {
      setTimeout(() => {
        wx.showToast({
          title: data.retMsg,
          icon: 'none',
          duration: 2000
        })
      }, 1000)
      return Promise.reject(data.retMsg)
    } else {
      return Promise.resolve(data)
    }
  } else {
    // 将服务器响应的数据返回
    return data.retData
  }

}
// 将 WxRequest 的实例通过模块化的方式暴露出去
export default instance