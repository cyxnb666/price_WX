import {
  regeo
} from "./api";

const socketUrl = {
  develop: 'wss://www.zhixunchelian.com/price_backend', // 开发版本地后端
  // develop: 'ws://192.168.8.174:8099/price_backend', // 开发版本地后端
  // trial: 'wss://www.zhixunchelian.com/price_backend', // 正式版
  trial: 'wss://uat.zhixunchelian.com/price_backend', // 体验版
  // trial: 'ws://192.168.8.174:8099/price_backend', // 体验版
  release: 'wss://www.zhixunchelian.com/price_backend' // 正式版
}
const {
  miniProgram
} = wx.getAccountInfoSync()
// 获取小程序当前版本
const {
  envVersion
} = miniProgram
const accountNo = wx.getStorageSync('userInfo').accountNo
let socket = null
let time = null;
let loadingInstance = null;
const linkSocket = () => {
  if (socket) {
    console.log('socket已连接')
    return
  }
  socket = wx.connectSocket({
    url: `${socketUrl[envVersion]}/websocket/${accountNo}`
  });
  socket.onOpen(function (res) {
    console.log('WebSocket连接已打开！');
    keepAlive();
  });
  socket.onMessage(function (res) {
    console.log('收到服务器内容：' + res.data);
    console.log(res.data, 'res.data')
    var app = getApp()
    if (res.data && res.data != 'pong') {
      const {
        code,
        data
      } = JSON.parse(res.data);
      if (code === '20001') {
        app.globalData.socketData = data;
        if (data) {
          wx.navigateTo({
            url: `/pages/videowait/videowait?data=${JSON.stringify(data)}`
          })
        } else {
          wx.navigateTo({
            url: `/pages/videowait/videowait`
          })
        }
      }
      if (code === '20036') {
        wx.navigateBack({
          delta: 1,
          success: (res) => {},
          fail: (res) => {},
          complete: (res) => {},
        })
      }
      if (['20037', '20038'].includes(code)) {
          const pages = getCurrentPages();
          const currentPagePath = pages.length > 0 ? pages[pages.length - 1].route : '';
          const page = currentPagePath.split('/')[1]
          console.log(page)
          console.log(page,'page-------20038')
          wx.navigateTo({
            url: `/pages/trtc/trtc?data=${JSON.stringify(data)}&page=${page}`,
            fail(err){
              console.log('跳转视频页面报错',err)
            }
          })
 
      }
      // if (['20038'].includes(code)) {
      //   const pages = getCurrentPages();
      //   const currentPagePath = pages.length > 0 ? pages[pages.length - 1].route : '';
      //   const page = currentPagePath.split('/')[1]
      //   console.log(page)

      //   wx.navigateTo({
      //     // url: `/pages/trtc/trtc?data=${JSON.stringify(data)}&page=${page}`
      //     url: `/pages/videowait/videowait?data=${JSON.stringify(data)}&page=${page}`
      //   })
      // }
      if (['20006', '20007'].includes(code)) {
        setTimeout(() => {
          wx.showToast({
            title: '视频已挂断',
            icon: 'none',
            success: () => {
              let pages = getCurrentPages();
              console.log(pages, 'pages')
              if (wx.getStorageSync('userInfo').roleCode === "STALL_LINKER") {
                if (pages[pages.length - 2].route == "pages/videowait/videowait") {
                  wx.navigateBack({
                    delta: 2,
                  });
                } else {
                  wx.navigateBack();
                }
              } else {
                if (pages[pages.length - 2].route == "pages/collVideoWait/videoWait") {
                  wx.navigateBack({
                    delta: 2,
                  });
                } else {
                  wx.navigateBack();
                }
              }
            }
          });
        })
      }
      if (code === "20010") {
        setTimeout(() => {
          wx.showToast({
            title: '视频已挂断',
            icon: 'none'
          });
        })
        wx.navigateBack()
      }
      if (code === '20034') {
        wx.getLocation({
          type: 'gcj02',
          success(res) {
            const params = {
              condition: {
                latitude: res.latitude,
                longitude: res.longitude,
              }
            }
            regeo(params).then((regeoRes) => {
              const location = {
                "code": "20035",
                "data": {
                  "longitude": res.longitude,
                  "latitude": res.latitude,
                  "address": regeoRes.address,
                  "userId": data.userId,
                  "receiveUserId": wx.getStorageSync('userInfo').accountNo
                }
              }
              sendData(location)
            })
          },
          fail(err) {
            console.log(err)
          }
        })
      }
    }
  });
  socket.onClose(function () {
    console.log('WebSocket已关闭！');
    if (loadingInstance) {
      loadingInstance.close();
    }
    if (time) {
      clearInterval(time);
    }
    setTimeout(() => {
      socket = null;
      linkSocket();
    }, 10000);
  })
}
// 保持连接
const keepAlive = (data = "ping") => {
  if (time) {
    clearInterval(time);
  }
  time = setInterval(() => {
    console.log("send:" + data);
    socket.send({
      data
    });
  }, 10 * 1000);
}
// 发送消息到服务器
const sendData = (params) => {
  if (socket) {
    console.log("发送消息", params, JSON.stringify(params));
    socket.send({
      data: JSON.stringify(params),
      success: function () {
        console.log("发送成功");
      },
    });
  } else {
    console.log("未连接");
  }
}
export {
  linkSocket,
  sendData,
  socket
}