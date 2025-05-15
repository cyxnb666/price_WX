// pages/main/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    visibleDialog: false,
    confirmBtn: { content: '确定', variant: 'base' },
    userInfo: {},
    avatar:'/pages/images/avatar.jpg'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

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
    let that = this;
    this.setData({
      userInfo:wx.getStorageSync('userInfo')
    })
  },
  logout(){
    this.setData({
      visibleDialog:true
    })
  },
  confirm(){

  },
  cancel(){
    this.setData({
      visibleDialog:false
    })
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