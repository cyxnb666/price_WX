Component({
  properties: {
    title: { type: String, value: '请选择日期' }, // 标题
    date: { type: String, value: '' }, // 默认为空，将在 attached 中设置
    start: { type: String, value: '' },
  },

  data: {
    visible: false, // 选择器是否可见
    dateText: '',    // 显示的日期文本
    // 指定选择区间起始值
    end: '2030-09-09 12:12:12',
    filter(type, options) {
      if (type === 'year') {
        return options.sort((a, b) => b.value - a.value);
      }
      return options;
    },
    popupProps: {
      usingCustomNavbar: true,
      zIndex:99999
    },
  },
  observers: {
    'date': function (newVal) {
      this.setData({ dateText: newVal || '' });
    },
    'start': function(newVal) {
      if (newVal && this.data.end && newVal > this.data.end) {
        this.setData({ end: newVal });
      }
    },
    'end': function(newVal) {
      if (newVal && this.data.start && newVal < this.data.start) {
        wx.showToast({
          title: '结束日期必须大于或等于开始日期',
          icon: 'none'
        });
        this.setData({ end: '' });
      }
    }
  },

  methods: {
    // 显示选择器
    showPicker(e) {
      console.log(e,'----')
      this.setData({ visible: true });
    },

    // 隐藏选择器
    hidePicker() {
      this.setData({ visible: false });
    },

    // 确认选择
    onConfirm(e) {
      const selectedDate = e.detail.value;
      if (this.data.title === '结束日期' && this.data.start && selectedDate < this.data.start) {
        wx.showToast({
          title: '结束日期必须大于或等于开始日期',
          icon: 'none'
        });
        return;
      }
      this.setData({
        date: selectedDate,
        visible: false
      });
      this.triggerEvent('datechange', selectedDate); // 触发事件传递选择的日期
    },

    // 列变化（可选）
    onColumnChange(e) {
      // 处理列变化逻辑（可选）
    },

    // 关闭处理（可选）
    handleClose() {
      this.hidePicker();
    }
  }
});