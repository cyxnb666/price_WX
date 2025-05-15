Component({
  options: {
    multipleSlots: true // 在组件定义时的选项中启用多slot支持
  },
  /**
   * 组件的属性列表
   */
  properties: {
    title: {
      type: String,
      value: ''
    },
    back: {
      type: Boolean,
      value: true
    },
    path: {
      type: String,
      value: ''
    },
    delta:{
      type:Number,
      value:1
    }
  },
  /**
   * 组件的初始数据
   */
  data: {},
  /**
   * 组件的方法列表
   */
  methods: {
    handleBack(e) {
      let page = getCurrentPages()
      console.log(e, this.data.path,page)
      let pathUrl = ['/pages/home/home']
      if (this.data.path) {
        if (pathUrl.includes(this.data.path)) {
          wx.switchTab({
            url: this.data.path,
            success: (res) => {
              console.log(res)
            },
            fail: (res) => {
              console.log(res)
            },
            complete: (res) => {
              console.log(res)
            },
          })
        } else {
          wx.navigateTo({
            url: this.data.path,
            success: (res) => {
              console.log(res)
            },
            fail: (res) => {
              console.log(res)
            },
            complete: (res) => {
              console.log(res)
            },
          })
        }

      } else {
        wx.navigateBack({
          delta: 1,
          success: (res) => {
            console.log(res)
          },
          fail: (res) => {
            console.log(res)
          },
          complete: (res) => {
            console.log(res)
          },
        })
      }
    }
  },
})