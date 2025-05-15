// subPackage/salePlan/sall/priceSend/priceSend.js
import {
  getLargePlan
} from "../../../../utils/api"
Page({

  /**
   * 页面的初始数据
   */
  data: {
    salePlanDetail:{},
    tallInfo:{},
    tabValue:'0',
    delta:1,
    tabsList: [
      {
        id: 0,
        value: "出售计划详情",
        isActive: true,
      },
      {
        id: 1,
        value: "计划价格上报",
        isActive: false,
      },
    ],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log(options,'options--')
    this.getLargePlan(options.planId);
    this.setData({
      tallInfo:options,
      delta:options.delta || 2
    })
  },
  onTabsChange(e){
    this.setData({
      tabValue: e.detail.value
    })
  },

  // 获取从子组件传回来的数据
  getTabsItemChange (e) {
    // 1 获取传过来的被点击的标题索引
    const { index } = e.detail;
    // 2 修改顶部横向tabs切换栏目 源数组
    // 拿到data中叫做 tabsList 数据，复制出一份用来修改
    let { tabsList } = this.data;
    // 通过循环，将当前传过来的index的tabs的isActive设置为true，就有选中的样式了
    tabsList.forEach((v, i) =>
      i === index ? (v.isActive = true) : (v.isActive = false)
    );
    // 3 赋值修改过后的数据到data中本来的tabs数据源
    this.setData({
      tabsList,
      // 等价于===》tabsList:tabsList  (同名变量可以简写)
    });
  },
  getLargePlan(planId) {
    let params = {
      "condition": {
        "primaryKey": planId
      }
    }
    getLargePlan(params).then(res => {
      this.setData({
        salePlanDetail:res
      })
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