// pages/mapPolyLine/mapLocation.js
import amapFile from "../../utils/amap-wx"
Page({

  /**
   * 页面的初始数据
   */
  data: {
    markers: [],
    distance: '',
    cost: '',
    state: 0,
    method: ['驾车', '公交', '骑行', '步行'],
    index: 0,
    TabCur: 0,
    polyline: [],
    transits: []
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let that = this;
    const eventChannel = this.getOpenerEventChannel()
    eventChannel.emit('acceptDataFromOpenedPage', {
      data: 'test'
    });
    eventChannel.emit('someEvent', {
      data: 'test'
    });
    // 监听acceptDataFromOpenerPage事件，获取上一页面通过eventChannel传送到当前页面的数据
    eventChannel.on('toMapPloyLocation', function (data) {
      that.toLocation(data)
    })
  },
  // 规划线路
  toLocation({
    start,
    end
  }) {
    console.log(start, end)
    var that = this;
    that.setData({
      startAddress:start.address,
      endAddress:end.address,
    })
    var key = "71c057de0b7266bd85a0bb48dcdde196";
    var myAmapFun = new amapFile.AMapWX({
      key: key
    });
    // 起点
    var startPoint = start.longitude + "," + start.latitude
    // 目的地
    var endPoint = end.longitude + "," + end.latitude;
    console.log(startPoint, endPoint)
    myAmapFun.getRidingRoute({
      origin: startPoint,
      destination: endPoint,
      success: function (data) {
        console.log(data);
        var points = [];
        if (data.paths && data.paths[0] && data.paths[0].rides) {
          var rides = data.paths[0].rides;
          that.setData({
            rides: data.paths[0].rides
          });
          for (var i = 0; i < rides.length; i++) {
            var poLen = rides[i].polyline.split(';');
            for (var j = 0; j < poLen.length; j++) {
              points.push({
                longitude: parseFloat(poLen[j].split(',')[0]),
                latitude: parseFloat(poLen[j].split(',')[1])
              })
            }
          }
        }
        that.setData({
          polyline: [{
            points: points,
            color: "#0091ff",
            width: 6
          }],
          markers:[{
            id: 0,
            latitude: start.latitude,
            longitude: start.longitude,
            width: 23,
            height: 33
          }, {
            id: 0,
            latitude: end.latitude,
            longitude: end.longitude,
            width: 24,
            height: 34
          }]
        });
        if (data.paths[0] && data.paths[0].distance) {
          let distance = data.paths[0].distance ? (Number(data.paths[0].distance) /1000).toFixed(2) : ''
          that.setData({
            distance: distance + '公里'
          });
        }
        if (data.paths[0] && data.paths[0].duration) {
          that.setData({
            cost: parseInt(data.paths[0].duration / 60) + '分钟'
          });
        }
      },
      fail: function (info) {
        console.error(info)
      }
    })
  },
  regionChange: function (e) {
    // 地图视野发生变化时触发
    console.log(e.type);
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