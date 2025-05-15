// login.js
import {getFarmerByCode, mobileLogin} from "../../utils/api";

Page({
    data: {
        showDialog: false
    },
    authorizedLogin(e) {
        if (e.detail.errMsg === "getPhoneNumber:ok") {
            const {code} = e.detail;
            getFarmerByCode(code).then((res) => {
                const {avatar, nickname, mobile} = res
                if ( nickname) {
                    this.formLogin({nickname, avatar}, mobile);
                } else {
                    this.selectComponent('#getUserProfile').showPop(
                        {
                            title: "授权登录",
                            success: (userInfo) => {
                                console.log(userInfo)
                                this.formLogin({nickname:userInfo.nickName,avatar:userInfo.avatarUrl}, mobile);
                            },
                            fail: (err) => {
                                console.log("err", err);
                            },
                        }
                    )
                }
            });
        } else {
            // 用户拒绝授权或获取手机号失败
            this.setData({
                showDialog: true
            });
        }
    },
    submit(){
      wx.switchTab({
        url: '/pages/home/home',
        success: (res) => {},
        fail: (res) => {},
        complete: (res) => {},
      })
    },
    closeDialog() {
        const {dialogKey} = this.data;
        this.setData({[dialogKey]: false});
    },
    formLogin(userInfo, mobile) {
        console.log(userInfo)
        wx.login({
            success: async (res) => {
                let {code} = res
                const result = await mobileLogin({...userInfo, mobile, loginCode: code})
                console.log(result)
                wx.setStorageSync('token', result.token)
                wx.setStorageSync('userInfo', result)
                wx.switchTab({
                  url: '/pages/home/home',
                })
            },
            fail: (res) => {
                console.log('登录失败', res)
            }
        })
    }
})
