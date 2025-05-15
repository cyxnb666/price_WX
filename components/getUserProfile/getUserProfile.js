// getUserProfile.js
const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'

Component({
    data: {
        visible: false,
        title: '授权登录',
        userInfo: {
            avatarUrl: defaultAvatarUrl,
            nickName: '',
        },
        hasUserInfo: false,
        canIUseGetUserProfile: wx.canIUse('getUserProfile'),
        canIUseNicknameComp: wx.canIUse('input.type.nickname'),
        options: {
            title: '授权登录',
        }
    },
    methods: {
        onVisibleChange(e) {
            this.setData({
                visible: e.detail.visible,
            })
        },
        showPop(options) {
            return new Promise((resolve, reject) => {
                this.setData({
                    options: options,
                    visible: true,
                });
            });
        },
        onChooseAvatar(e) {
            const {avatarUrl} = e.detail
            const {nickName} = this.data.userInfo;
            let base64 = 'data:image/jpeg;base64,' + wx.getFileSystemManager().readFileSync(avatarUrl,'base64')
            this.setData({
                "userInfo.avatarUrl": base64,
                hasUserInfo: nickName && avatarUrl && avatarUrl !== defaultAvatarUrl,
            })
            // base64(avatarUrl, "jpeg").then(res => {
            //     that.setData({
            //         "userInfo.avatarUrl": res,
            //         hasUserInfo: nickName && avatarUrl && avatarUrl !== defaultAvatarUrl,
            //     })
            // })
            //     .catch(err => {
            //         console.log('err', err)
            //     })

        },
        onInputChange(e) {
            const nickName = e.detail.value
            const {avatarUrl} = this.data.userInfo
            this.setData({
                "userInfo.nickName": nickName,
                hasUserInfo: nickName && avatarUrl && avatarUrl !== defaultAvatarUrl,
            })
        },
        getUserProfile(e) {
            // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认，开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
            wx.getUserProfile({
                desc: '展示用户信息', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
                success: (res) => {
                    console.log(res)
                    this.setData({
                        userInfo: res.userInfo,
                        hasUserInfo: true
                    })
                }
            })
        },
        onCancel() {
            this.data.options.fail && this.data.options.fail(Error("用户点击取消"));
            this.setData({
                visible: false,
            });
        },
        onConfirm() {
            if (this.data.hasUserInfo) {
                this.data.options.success && this.data.options.success(this.data.userInfo);
            } else {
                this.data.options.fail && this.data.options.fail(Error("用户未授权"));
            }
            this.setData({
                visible: false,
            });
        },
    },
})
