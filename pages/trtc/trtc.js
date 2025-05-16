//trtc.js
import TRTC from "./utils/trtc-wx"
import {
  env
} from "../../utils/env";
import {
  sendData
} from "../../utils/WebSocket";
import dayjs from 'dayjs';

const TAG_NAME = 'TRTC-ROOM'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isSmallWindow: false,
    pusher: null,
    streamList: [], // 用于渲染player列表,存储stram
    debug: false, // 是否打开player pusher 的调试信息
    cameraPosition: 'back', // 摄像头位置，用于debug
    isAudio: false,
    trtcConfig: {
      sdkAppID: '', // 开通实时音视频服务创建应用后分配的 SDKAppID
      userID: '', // 用户 ID，可以由您的帐号系统指定
      userSig: '', // 身份签名，相当于登录密码的作用
      template: '1v1', // 画面排版模式
      roomID: '', //房间号
      debugMode: false,
      enableMic: true,
      enableCamera: true,
    },
    receiveUserId: null,
    userId: null,
    page: null,
    address: '',
    date: '',
    roleCode: wx.getStorageSync('userInfo').roleCode,
    priceFileIds: [],
    collectFileIds: [],
    selectedType: 'priceFileIds',
    linkerName: '',
    linkerMobile: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const data = JSON.parse(options.data);

    this.setData({
      'trtcConfig.sdkAppID': data.sdkAppId,
      'trtcConfig.userSig': data.userSig,
      'trtcConfig.roomID': data.roomId,
      'trtcConfig.userID': wx.getStorageSync('userInfo').accountNo,
      receiveUserId: data.receiveUserId,
      userId: data.userId,
      page: options.page,
      linkerName: options.linkerName,
      linkerMobile: options.linkerMobile,
    })
    // 设置屏幕常亮
    wx.setKeepScreenOn({
      keepScreenOn: true,
    })
    this.TRTC = new TRTC(this);

    // 创建pusher
    this.createPusher();
    // 绑定事件
    this.bindEvent();
    // 初始化页面状态
    this.initStatus();
    // 进入房间
    this.enterRoom()
    const that = this;
    wx.onSocketMessage((res) => {
      console.log(res, '收到socket消息')
      if (res.data && res.data != 'pong') {
        const {
          code,
          data
        } = JSON.parse(res.data)
        if (code === '20035') {
          const now = dayjs();
          that.setData({
            address: data.address,
            date: now.format('YYYY-MM-DD HH:mm:ss')
          })
        }
        // if (code === '20007') {
        //   console.log('收到农户挂断电话退出房间')
        //   const photos = {
        //     priceFileIds: that.data.priceFileIds,
        //     collectFileIds: that.data.collectFileIds
        //   }
        //   wx.navigateBack({
        //     delta: 1,
        //     success: () => {
        //       if (that.data.page === 'home') return;
        //       const pages = getCurrentPages();
        //       const prevPage = pages[pages.length - 2];
        //       console.log(prevPage, 'prevPage---')
        //       console.log(pages, 'pages---')
        //       prevPage.setPhotos(photos)
        //     }
        //   })
        //   that.exitRoom();
        // }
      }
    })
  },
  changeSmallWindow() {
    this.setData({
      isSmallWindow: !this.data.isSmallWindow,

    }, () => {
      if (!this.data.isSmallWindow) {
        this.setData({
          'pusher.videoWidth': 180,
          'pusher.videoHeight': 106,
        })
      } else {
        this.setData({
          'pusher.videoWidth': 700,
          'pusher.videoHeight': 1080,
        })
      }
    })

  },
  /**
   * @description: 数据初始化
   * @return: void
   */
  createPusher() {
    // pusher 初始化参数
    const pusherConfig = {
      beautyLevel: 0,
      mode: "FHD",
      frontCamera: "back",
      videoWidth: 700,
      videoHeight: 1080,
      minBitrate: 2000, // 最小码率
      maxBitrate: 3000, // 最大码率
      videoOrientation: "vertical",
    }
    const pusher = this.TRTC.createPusher(pusherConfig)
    this.setData({
      pusher: pusher.pusherAttributes,
    })
  },
  /**
   * @description: 发布本地流，订阅事件。进入房间
   * @return: void
   */
  enterRoom: function () {
    if (!this.checkParam(this.data.trtcConfig)) {
      console.log('checkParam false: 缺少必要参数, 进房未执行')
      return
    }
    this.setData({
      pusher: this.TRTC.enterRoom(this.data.trtcConfig),
    }, () => {
      // 开始进行推流
      this.TRTC.getPusherInstance().start({
        success: function (event) {
          console.log("推流成功--------", event)
        },
        fail: function (err) {
          console.log("推流失败--------", err)
        }
      })
      this.status.isPush = true;
    })
  },
  /**
   * @description: 退房，停止推流和拉流，并重置数据
   * @return: void
   */
  exitRoom() {
    const result = this.TRTC.exitRoom()
    this.setData({
      pusher: result.pusher,
      streamList: result.playerList,
    })
  },
  /**
   * @description: 初始化页面状态
   * @return: void
   */
  initStatus() {
    this.status = {
      isPush: false, // 推流状态
      isPending: false, // 挂起状态，触发5000事件标记为true，onShow后标记为false
    }
  },
  /**
   * @description: 绑定事件 监听 trtc 状态
   * @return: void
   */
  bindEvent() {
    const EVENT = this.TRTC.EVENT;
    // 本地用户进房
    this.TRTC.on(EVENT.LOCAL_JOIN, this.onLocalJoin, this);
    // 本地用户离开
    this.TRTC.on(EVENT.LOCAL_LEAVE, this.onLocalLeave, this);
    // 远端用户进房
    this.TRTC.on(EVENT.REMOTE_USER_JOIN, this.onRemoteJoin, this)
    // 远端用户离开
    this.TRTC.on(EVENT.REMOTE_USER_LEAVE, this.onRemoteLeave, this)
    // 视频状态 true
    this.TRTC.on(EVENT.REMOTE_VIDEO_ADD, this.onRemoteChange, this)
    // 视频状态 false
    this.TRTC.on(EVENT.REMOTE_VIDEO_REMOVE, this.onRemoteChange, this)
    // 音频可用
    this.TRTC.on(EVENT.REMOTE_AUDIO_ADD, this.onRemoteChange, this)
    // 音频不可用
    this.TRTC.on(EVENT.REMOTE_AUDIO_REMOVE, this.onRemoteChange, this)
    // 错误处理
    this.TRTC.on(EVENT.ERROR, this.onTrtrError)
    // 本地推流网络状态变更
    this.TRTC.on(EVENT.LOCAL_NET_STATE_UPDATE, this.onLocalNetStateChange)
    // 远端推流网络状态变更
    this.TRTC.on(EVENT.REMOTE_NET_STATE_UPDATE, this.onRemoteNetStateUpdate)
  },
  /**
   * @description: trtc 事件监听绑定函数
   * @param {*} event
   * @return: void
   */
  onRemoteJoin(event) {
    this.log("远端用户进房", event)
    const {
      data
    } = event;
    const {
      playerList
    } = data;
    this.setData({
      streamList: playerList,
    }, () => {
      // 接通后业务
      this.getLocating()

    })
  },
  onRemoteLeave(event) {
    this.log("远端用户离开", event)
    const {
      data,
      eventCode
    } = event;
    const {
      playerList,
      userID
    } = data;
    const _this = this;
    if (userID) {
      this.setList({
        streamList: playerList
      }).then(() => {
        const photos = {
          priceFileIds: _this.data.priceFileIds,
          collectFileIds: _this.data.collectFileIds
        }
        _this.exitRoom()
        // 执行用户离开逻辑
      })
    }
  },
  onRemoteChange(event) {
    const {
      data,
      eventCode
    } = event;
    const {
      player
    } = data;
    let option = {}
    switch (eventCode) {
      case "REMOTE_AUDIO_REMOVE":
        Object.assign(option, {
          muteAudio: true
        })
        this.log("远端音频移除", event)
        break;
      case "REMOTE_AUDIO_ADD":
        Object.assign(option, {
          muteAudio: false
        })
        this.log("远端音频可用", event)
        break;
      case "REMOTE_VIDEO_REMOVE":
        Object.assign(option, {
          muteVideo: true
        })
        this.log("远端视频移除", event)
        break;
      case "REMOTE_VIDEO_ADD":
        Object.assign(option, {
          muteVideo: false
        })
        this.log("远端视频可用", event)
        break;
    }
    this.setPlayerAttributesHandler(player, option)
  },
  onLocalJoin(event) {
    this.log("本地用户进房", event)
  },
  onLocalLeave(event) {
    this.log("本地用户离开", event)
  },
  onTrtrError(event) {
    this.log("Trtr Error", event)
  },
  onLocalNetStateChange(event) {
    this.log("本地网络变化", event)
    const pusher = event.data.pusher
    this.setData({
      pusher: pusher
    })
  },
  onRemoteNetStateUpdate(event) {
    this.log("远端网络变化", event)
    const {
      playerList
    } = event.data;
    this.setData({
      streamList: playerList
    })
  },
  /**
   * @description 设置某个 player 属性
   * @param {*} player
   * @param {*} options { muteAudio: true/false , muteVideo: true/false }
   * @return: void
   */
  setPlayerAttributesHandler(player, options) {
    this.setData({
      streamList: this.TRTC.setPlayerAttributes(player.streamID, options),
    })
  },
  /**
   * @description 切换前后摄像头
   */
  _switchCamera() {
    if (!this.data.cameraPosition) {
      // this.data.pusher.cameraPosition 是初始值，不支持动态设置
      this.data.cameraPosition = this.data.pusher.frontCamera
    }
    console.log(TAG_NAME, 'switchCamera', this.data.cameraPosition)
    this.data.cameraPosition = this.data.cameraPosition === 'front' ? 'back' : 'front'
    this.setData({
      cameraPosition: this.data.cameraPosition,
    }, () => {
      console.log(TAG_NAME, 'switchCamera success', this.data.cameraPosition)
    })
    // wx 7.0.9 不支持动态设置 pusher.frontCamera ，只支持调用 API switchCamer() 设置，这里修改 cameraPosition 是为了记录状态
    this.TRTC.getPusherInstance().switchCamera()
  },
  /**
   * @description 点击挂断通话按钮 退出通话
   */
  _hangUp() {
    const _this = this;
    let params = {
      "code": wx.getStorageSync('userInfo').roleCode === "STALL_LINKER" ? "20006" : "20007",
      "data": {
        "receiveUserId": this.data.userId,
        "userId": wx.getStorageSync('userInfo').accountNo
      }
    }
    if (wx.getStorageSync('userInfo').roleCode === "STALL_LINKER") {
      params = {
        "code": "20006",
        "data": {
          "receiveUserId": this.data.userId,
          "userId": wx.getStorageSync('userInfo').accountNo
        }
      }
      wx.showToast({
        title: '视频已挂断',
        icon: 'none',
        success: () => {
          let pages = getCurrentPages();
          if (pages[pages.length - 2].route == "pages/videowait/videowait") {
            wx.navigateBack({
              delta: 2,
            });
          } else {
            wx.navigateBack();
          }
        }
      });
    } else {
      params = {
        "code": "20007",
        "data": {
          "receiveUserId": wx.getStorageSync('userInfo').accountNo,
          "userId": this.data.receiveUserId
        }
      }
      wx.showToast({
        title: '视频已挂断',
        icon: 'none',
        success: () => {
          let pages = getCurrentPages();
          if (pages[pages.length - 2].route == "pages/collVideoWait/videoWait") {
            const photos = {
              priceFileIds: _this.data.priceFileIds,
              collectFileIds: _this.data.collectFileIds
            }
            console.log(photos,'photos==')
            wx.navigateBack({
              delta: 2,
              success: () => {
                console.log(_this.data.page,'_this.data.page')
                if (_this.data.page === 'home') return;
                const pages = getCurrentPages();
                const prevPage = pages[pages.length - 3];
                console.log(prevPage, 'prevPage---')
                console.log(pages, 'pages---')
                prevPage.setPhotos(photos)
              }
            });
          } else {
            wx.navigateBack();
          }
        }
      });
    }
    sendData(params)
    const photos = {
      priceFileIds: this.data.priceFileIds,
      collectFileIds: this.data.collectFileIds
    }
    _this.exitRoom();



  },
  onUnload() {
    const _this = this;
    // let params = {
    //   "code": wx.getStorageSync('userInfo').roleCode === "STALL_LINKER" ? "20006" : "20007",
    //   "data": {
    //     "receiveUserId": this.data.userId,
    //     "userId": wx.getStorageSync('userInfo').accountNo
    //   }
    // }
    // if (wx.getStorageSync('userInfo').roleCode === "STALL_LINKER") {
    //   params = {
    //     "code": "20006",
    //     "data": {
    //       "receiveUserId": this.data.userId,
    //       "userId": wx.getStorageSync('userInfo').accountNo
    //     }
    //   }
    //   wx.showToast({
    //     title: '视频已挂断',
    //     icon: 'none',
    //     success: () => {
    //       let pages = getCurrentPages();
    //       if (pages[pages.length - 2].route == "pages/videowait/videowait") {
    //         wx.navigateBack({
    //           delta: 2,
    //         });
    //       } else {
    //         wx.navigateBack();
    //       }
    //     }
    //   });
    // } else {
    //   params = {
    //     "code": "20007",
    //     "data": {
    //       "receiveUserId": wx.getStorageSync('userInfo').accountNo,
    //       "userId": this.data.receiveUserId
    //     }
    //   }
    //   wx.showToast({
    //     title: '视频已挂断',
    //     icon: 'none',
    //     success: () => {
    //       let pages = getCurrentPages();
    //       if (pages[pages.length - 2].route == "pages/collVideoWait/videoWait") {
    //         wx.navigateBack({
    //           delta: 2,
    //         });
    //       } else {
    //         wx.navigateBack();
    //       }
    //     }
    //   });
    // }
    // sendData(params)
    _this.exitRoom();

  },
  /**
   * @description 设置列表数据，并触发页面渲染
   * @param {Object} params include  stramList
   * @returns {Promise}
   */
  setList(params) {
    console.log(TAG_NAME, 'setList', params, this.data.template)
    const {
      streamList
    } = params
    return new Promise((resolve, reject) => {
      const data = {
        streamList: streamList || this.data.streamList,
      }
      this.setData(data, () => {
        resolve(params)
      })
    })
  },
  /**
   * @description trtc 初始化room 必选参数检测
   * @param {Object} rtcConfig rtc参数
   * @returns {Boolean}
   */
  checkParam(rtcConfig) {
    console.log(TAG_NAME, 'checkParam config:', rtcConfig)
    if (!rtcConfig.sdkAppID) {
      console.error('未设置 sdkAppID')
      return false
    }
    if (rtcConfig.roomID === undefined) {
      console.error('未设置 roomID')
      return false
    }
    if (rtcConfig.roomID < 1 || rtcConfig.roomID > 4294967296) {
      console.error('roomID 超出取值范围 1 ~ 4294967295')
      return false
    }
    if (!rtcConfig.userID) {
      console.error('未设置 userID')
      return false
    }
    if (!rtcConfig.userSig) {
      console.error('未设置 userSig')
      return false
    }
    if (!rtcConfig.template) {
      console.error('未设置 template')
      return false
    }
    return true
  },
  /**
   * @description pusher event handler
   * @param {*} event 事件实例
   */
  _pusherStateChangeHandler(event) {
    console.log(event, "pusherEventHandler")
    this.TRTC.pusherEventHandler(event)
    const code = event.detail.code
    const message = event.detail.message
    switch (code) {
      case 5000:
        console.log(TAG_NAME, '小程序被挂起: ', code)
        break
      case 5001:
        // 20200421 仅有 Android 微信会触发该事件
        console.log(TAG_NAME, '小程序悬浮窗被关闭: ', code)
        console.log(this.status.isPush, "this.status.isPush")
        this.status.isPending = true
        if (this.status.isPush) {
          this.exitRoom()
        }
        break
    }
  },
  audioSwitch() {
    this.setData({
      'pusher.enableMic': !this.data.pusher.enableMic,
      isAudio: !this.data.isAudio
    })
  },
  async takingPictures() {
    if (!this.data.address) {
      wx.showToast({
        title: '请先定位',
        icon: 'error'
      })
      return
    }
    const player = this.data.streamList[0]
    const that = this
    if (player) {
      const videoContext = wx.createLivePlayerContext(player.id);
      videoContext.snapshot({
        success(e) {
          console.log('success', e.tempImagePath)
          that.uploadFile(e.tempImagePath)
        },
        fail(e) {
          console.log('fail', e)
        }
      })
    }
  },
  uploadFile(tempFilePaths, key) {
    console.log(this.data.receiveUserId, 'this.data.receiveUserId')
    const that = this
    wx.uploadFile({
      url: `${env.baseURL}/file/uploadFileWithWater`, //仅为示例，非真实的接口地址
      filePath: tempFilePaths,
      name: 'file',
      formData: {
        address: this.data.address,
        receiveUserId: this.data.receiveUserId
      },
      header: {
        'content-type': 'multipart/form-data',
        'X-Access-Token': wx.getStorageSync('token')
      },
      success(res) {
        console.log(res, 'uploadres')
        const {
          retCode,
          retData,
          retMsg
        } = JSON.parse(res.data)
        if (retCode === 200) {
          setTimeout(() => {
            wx.showToast({
              title: '上传成功',
              icon: 'success'
            })
          })
          that.setData({
            [that.data.selectedType]: [...that.data[that.data.selectedType], retData]
          })
          console.log(that.data, '上传成功')
        } else {
          setTimeout(() => {
            wx.showToast({
              title: retMsg,
              icon: 'none'
            })
          })
        }
      }
    })
  },
  switchFlash() {
    const pusher = wx.createLivePusherContext('rtcpusher')
    pusher.toggleTorch()
  },
  getLocating() {
    console.log('getLocating')
    const params = {
      "code": "20034",
      "data": {
        "userId": wx.getStorageSync('userInfo').accountNo,
        "receiveUserId": this.data.receiveUserId
      }
    }
    sendData(params)
  },
  shootingType(e) {
    const key = e.currentTarget.dataset.key
    this.setData({
      selectedType: key
    })
  },
  _pusherNetStatusHandler(event) {
    this.warnLog('NetStatus', event)
    this.TRTC.pusherNetStatusHandler(event)
  },
  _pusherErrorHandler(event) {
    this.warnLog('pusherErro', event)
    this.TRTC.pusherErrorHandler(event)
  },
  _pusherBGMStartHandler(event) {
    this.warnLog('pusherBGMStart', event)
    this.TRTC.pusherBGMStartHandler(event)
  },
  _pusherBGMProgressHandler(event) {
    this.warnLog('BGMProgress', event)
    this.TRTC.pusherBGMProgressHandler(event)
  },
  _pusherBGMCompleteHandler(event) {
    this.warnLog('BGMComplete', event)
    this.TRTC.pusherBGMCompleteHandler(event)
  },
  _pusherAudioVolumeNotify(event) {
    this.warnLog('AudioVolume', event)
    this.TRTC.pusherAudioVolumeNotify(event)
  },
  _playerStateChange(event) {
    this.warnLog('playerStateChange', event)
    this.TRTC.playerEventHandler(event)
  },
  _playerFullscreenChange(event) {
    this.warnLog('Fullscreen', event)
    this.TRTC.playerFullscreenChange(event)
  },
  _playerNetStatus(event) {
    this.warnLog('playerNetStatus', event)
    this.TRTC.playerNetStatus(event)
  },
  _playerAudioVolumeNotify(event) {
    this.warnLog('playerAudioVolume', event)
    this.TRTC.playerAudioVolumeNotify(event)
  },
  /**
   * @description console.warn 方法
   * @param {*} msg: message detail string
   * @param {*} event : event object
   */
  warnLog(msg, event) {
    console.warn(TAG_NAME, msg, event)
  },
  /**
   * @description console.log 方法
   * @param {*} msg: message detail string
   * @param {*} event : event object
   * @return: void
   */
  log(msg, event) {
    console.log(TAG_NAME, msg, event)
  },
})