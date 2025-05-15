// back-home.js
import {
  callVideo,
  sendCollectPriceCooperSms
} from "../../utils/api";
  
  import { linkSocket } from "../../utils/WebSocket.js"
var app = getApp();

Component({
  properties: {
    itemWidth: {
      type: Number,
      value: 64,
    },
    itemHeight: {
      type: Number,
      value: 170,
    },
    gapWidth: {
      type: Number,
      value: 10,
    },
    coefficientHeight: {
      type: Number,
      value: 0.72,
    },
    linkerMobile: {
      type: String,
      value: '',
    },
    linkerName: {
      type: String,
      value: '',
    },
    busiId: {
      type: String,
      value: '',
    },
    busiType: {
      type: String,
      value: 'COLLECT_PRICE',
    },
  },
  data: {
    startX: 0,
    startY: 0,
    moveX: 0,
    moveY: 0,
    top: 0,
    left: 0,
    clientWidth: 0,
    clientHeight: 0,
    visible: false,
    opacity: 1,
    socketData:{
      receiveUserId:""
    }
  },
  attached() {
    let that = this
    wx.onSocketMessage((res) => {
        console.log(res.data,'socket1212')
        if (res.data && res.data != 'pong') {
        console.log(res.data,'socket')
        const {
          code,
          data
        } = JSON.parse(res.data)
        console.log(data,code,'socket')
        if (code === '20036') {
          that.setData({
            visible:false,
          })
        }
        if(['20037','20038'].includes(code)){
          that.setData({
            visible:false,
          })
        }
      }
    })
    const systemInfo = wx.getSystemInfoSync();
    console.log(this.data.linkerMobile)
    this.setData({
      clientWidth: systemInfo.windowWidth,
      clientHeight: systemInfo.windowHeight
    })

    this.setData({
      left: this.data.clientWidth - this.data.itemWidth - this.data.gapWidth,
      top: this.data.clientHeight * this.data.coefficientHeight,
    });
  },
  methods: {
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
    handleTouchStart(e) {
      this.setData({
        startX: e.touches[0].clientX,
        startY: e.touches[0].clientY
      })
    },
    handleTouchMove(e) {
      const touch = e.touches[0];
      const offsetX = touch.clientX - this.data.startX;
      const offsetY = touch.clientY - this.data.startY;
      this.data.moveX = offsetX;
      this.data.moveY = offsetY;
      this.setData({
        left: this.data.left + offsetX,
        top: this.data.top + offsetY,
      });
      this.data.startX = touch.clientX;
      this.data.startY = touch.clientY;
    },
    handleTouchEnd() {
      this.adjustPosition();
      this.setData({
        moveX: 0,
        moveY: 0,
      });
    },
    goCreatePage(e) {
      console.log(e)
      this.triggerEvent('goManage');
    },
    adjustPosition() {
      if (this.data.left < 0 || this.data.left < this.data.clientWidth / 3) {
        this.setData({
          left: 0
        });
      } else if (this.data.left > this.data.clientWidth - this.data.itemWidth - this.data.gapWidth || this.data.left > this.data.clientWidth / 3) {
        this.setData({
          left: this.data.clientWidth - this.data.itemWidth - this.data.gapWidth
        });
      }

      if (this.data.top < 0) {
        this.setData({
          top: 0
        });
      } else if (this.data.top > this.data.clientHeight - this.data.itemHeight - this.data.gapWidth) {
        this.setData({
          top: this.data.clientHeight - this.data.itemHeight - this.data.gapWidth
        });
      }
    },
    textMessages(e) {
      console.log(e)
      const params = {
        condition: {
          busiId: this.data.busiId,
          busiType: this.data.busiType,
          linkerName: this.data.linkerName,
          linkerMobile: this.data.linkerMobile,
        }
      }
      sendCollectPriceCooperSms(params).then((res) => {
        setTimeout(() => {
          wx.showToast({
            title: '短信发送成功',
            icon: 'success',
            duration: 2000
          })
        })
      })
    },
    makePhoneCall() {
      wx.makePhoneCall({
        phoneNumber: this.data.linkerMobile
      })
    },
    hangDown() {
      this.setData({
        visible:false,
      })
      //取消会话
      const cancelVideoSurveyReqParam = {
        "code":  "20010",
        "data": {
          "receiveUserId": this.data.socketData.receiveUserId,
          "userId":  wx.getStorageSync('userInfo').accountNo
        }
      }
      console.log(cancelVideoSurveyReqParam, '----------发出的socket消息')
      wx.sendSocketMessage({
        data: JSON.stringify(cancelVideoSurveyReqParam),
        success: function (e) {},
        fail: function (e) {
          console.info('send leaveRoomReqParam fail');
        },

      });
    },
    video() {
      let that = this
      if (!this.data.linkerMobile) {
        setTimeout(() => {
          wx.showToast({
            title: '请选择协助采价员联系人',
            icon: 'none',
            duration: 2000
          })
        })
        return
      }
      const params = {
        linkerMobile: this.data.linkerMobile,
        busiId: this.data.busiId,
        busiType: this.data.busiType,
        userId: wx.getStorageSync('userInfo').accountNo
      }
      callVideo(params).then((res) => {
        let data = JSON.parse(res)
        that.setData({
          visible: true,
          "socketData.receiveUserId":data.receiveUserId
        })
        wx.navigateTo({
          url: '/pages/collVideoWait/videoWait?receiveUserId=' + data.receiveUserId,
        })
      }).catch((err) => {

      })
    }
  },
});