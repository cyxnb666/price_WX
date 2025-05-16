const innerAudioContext = wx.createInnerAudioContext({
  useWebAudioImplement: false // 是否使用 WebAudio 作为底层音频驱动，默认关闭。对于短音频、播放频繁的音频建议开启此选项，开启后将获得更优的性能表现。由于开启此选项后也会带来一定的内存增长，因此对于长音频建议关闭此选项
})
import {
  sendData
} from "../../utils/WebSocket";
Page({

  /**
   * 页面的初始数据
   */
  data: {
    countdown: '0',
    setIntervalObj: {},
    opacity: 1,
    options: null,
    srcMic: 'https://y.qq.com/n/ryqq/songDetail/002nSyAF4Ynjtu',
    timer: null,
    num: 1
  },
  onMessage(res) {
    let that = this;

    console.info("vedeorecivemsg:" + res);
    if (res.code == '20017') {
      wx.showToast({
        title: '查勘员拒接通话.',
        icon: 'success',
        duration: 2000
      })
      that.cancelVideoSurvey(); //退出吧；顺便告诉服务器取消；虽然告诉服务器取消没啥用
      return;
    }
  },
  hangUp() {
    const params = {
      code: "20002",
      data:this.data.options 
    }
    sendData(params)
    //      //接听
    //   const cancelVideoSurveyReqParam = {
    //     "code": wx.getStorageSync('userInfo').roleCode == "STALL_LINKER" ? "20006" : "20007",
    //     "data": {
    //         "receiveUserId": wx.getStorageSync('userInfo').accountNo,
    //         "userId": this.data.options.receiveUserId
    //     }
    // }
    //   console.log(cancelVideoSurveyReqParam,'----------发出的socket消息')
    //   wx.sendSocketMessage({
    //     data: JSON.stringify(cancelVideoSurveyReqParam),
    //     success : function(e){
    //     },
    //     fail : function(e){
    //         console.info('send leaveRoomReqParam fail');
    //     },

    //   });
  },
  /**
   * 挂断视频
   */
  hangDown: function () {
    let that = this
    wx.showModal({
      title: '提示',
      content: '确定挂断？',
      confirmColor: '#2f2fc0',
      success: function (res) {
        if (res.confirm) {
          that.cancelVideoSurvey();
          wx.navigateBack({
            delta: 1
          })
        }
      }
    })
  },
  cancelVideoSurvey: function () {
    //取消会话
    const cancelVideoSurveyReqParam = {
      "code":"20036",
      "data": {
        "receiveUserId":  wx.getStorageSync('userInfo').accountNo,
        "userId": this.data.options.userId
      }
    }
    console.log(cancelVideoSurveyReqParam, '----------发出的socket消息')
    wx.sendSocketMessage({
      data: JSON.stringify(cancelVideoSurveyReqParam),
      success: function (e) {
        wx.navigateBack()

      },
      fail: function (e) {
        console.info('send leaveRoomReqParam fail');
      },

    });
  },
  addOp() {
    let t2 = setInterval(() => {
      this.data.opacity = this.data.opacity + 0.1;
      if (this.data.opacity >= 1) {
        clearInterval(t2)
        this.reduceOp()
      }
      this.setData({
        opacity: this.data.opacity
      })
    }, 100)
  },
  reduceOp() {
    let t1 = setInterval(() => {
      this.data.opacity = this.data.opacity - 0.1;
      if (this.data.opacity <= 0.1) {
        clearInterval(t1)
        this.addOp()
      }
      this.setData({
        opacity: this.data.opacity
      })
    }, 100)
  },
  // 注册音频

  registerAudioContext: function () {

    this.innerAudioContext = wx.createInnerAudioContext();
    this.innerAudioContext.src = '../../static/mp3/sansung_xy_note.mp3'
    console.log('准备播放', this.innerAudioContext);
    this.innerAudioContext.onEnded((res) => {

    })
    this.innerAudioContext.onPlay(() => {
      console.log('开始播放')
    })
    this.innerAudioContext.onError((res) => {

      // 播放音频失败的回调

      console.log('播放音频失败' + res);

    })

    this.innerAudioContext.onStop((res) => {

      console.log('播放结束!');

    })

  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(JSON.parse(options.data))
    console.log(options)
    this.setData({
      options: JSON.parse(options.data)
    })
    // this.registerAudioContext();


    this.data.timer = setInterval(() => {
      if (this.data.num > 30) {
        wx.showToast({
          title: '视频无人接听.',
          icon: 'none',
          duration: 2000
        })
        wx.navigateBack()
      }
      this.setData({
        num: this.data.num += 1
      })
      wx.vibrateLong()
    }, 1000)
    this.reduceOp()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    const innerAudioContext = wx.createInnerAudioContext();
    this.innerAudioContext = innerAudioContext;
    innerAudioContext.src = 'https://img.tukuppt.com/newpreview_music/09/01/92/5c8a204c2d0621739.mp3'; // 配置音频播放路径
    innerAudioContext.play(); // 播放
    innerAudioContext.loop = true // 是否循环播放
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    this.innerAudioContext.stop()
    clearInterval(this.data.timer);
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    this.innerAudioContext.stop()
    clearInterval(this.data.timer);
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})