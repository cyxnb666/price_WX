Component({
  properties: {
    selected: {
      type: Number,
      value: 0
    }
  },
  data: {
    showConfirm:false,
    confirmBtn: { content: '去登录', variant: 'base' },
    color: "#7A7E83",
    selectedColor: "#1AAD19",
    list: [{
      pagePath: "/pages/home/home",
      iconPath: "/pages/images/homeNot.svg",
      selectedIconPath: "/pages/images/home.svg",
      text: "首页"
    }, {
      pagePath: "/pages/mine/index",
      iconPath: "/pages/images/main.svg",
      selectedIconPath: "/pages/images/mineActive.svg",
      text: "个人中心"
    }]
  },
  attached() {},
  methods: {
    closeDialog(){
      this.setData({
        showConfirm:false
      })
    },
    confirmDelete(){
      this.setData({
        showConfirm:false
      })
      wx.redirectTo({
        url: '/pages/login/login',
      })
    },
    switchTab(e) {
      let { token} = wx.getStorageSync('userInfo')
      if(token){
        const data = e.currentTarget.dataset
        const url = data.path
        wx.switchTab({
          url
        })
      } else {
        this.setData({
          showConfirm:true
        })
      }

    }
  }
})