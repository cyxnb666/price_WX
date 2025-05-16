// pages/collVideoWait/videoWait.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    opacity: 1,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.setData({
      receiveUserId:options.receiveUserId
    })
  },
  hangDown() {
    //取消会话
    const cancelVideoSurveyReqParam = {
      "code":  "20010",
      "data": {
        "receiveUserId": this.data.receiveUserId,
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
    wx.navigateBack({
      delta: 1,
      success: (res) => {},
      fail: (res) => {},
      complete: (res) => {},
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})