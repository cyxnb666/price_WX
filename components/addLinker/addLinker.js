// components/addLinker/addLinker.js
import { addStallLinker } from "../../utils/api"
import Toast from 'tdesign-miniprogram/toast/index';
Component({

  /**
   * 组件的属性列表
   */
  properties: {
    dialogValue:{
      type:Boolean,
      value:true,
    },
    stallId:{
      type:String,
      value:''
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    phoneError:false,
    form:{
      linkerMobile:'',
      linkerName:'',
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    toast(message, theme) {
      Toast({
          context: this,
          selector: '#t-toast',
          message: message,
          theme: theme,
          direction: 'column',
          preventScrollThrough: true,
      });
  },
    onPhoneInput(e) {
      const { phoneError } = this.data;
      const isPhoneNumber = /^[1][3,4,5,7,8,9][0-9]{9}$/.test(e.detail.value);
      if (phoneError === isPhoneNumber) {
        this.setData({
          phoneError: !isPhoneNumber,
        });
      } else {
        this.setData({
          "form.linkerMobile":e.detail.value
        })
      }
    },
    onLikerIpt(e){
      this.setData({
        "form.linkerName":e.detail.value
      })
    },
    closeDialog(e){
      
      if(e.type == 'confirm'){
        wx.showLoading({
          icon:"none",
          title: '新增协助采价员联系人中...',
        })
        let params = {
          condition:{
            ...this.data.form,
            stallId:this.data.stallId
          }
        }
        addStallLinker(params).then(res=>{
          wx.hideLoading()
          this.toast('新增成功','success')
          this.triggerEvent("addLinker",this.data.form)
          this.setData({
            form:{
              linkerMobile:'',
              linkerName:'',
            }
          })
        }).finally(()=>{
          wx.hideLoading()
        })
      } else {
        this.triggerEvent("closeDialog")
        this.setData({
          form:{
            linkerMobile:'',
            linkerName:'',
          }
        })
      }
    }
  }
})