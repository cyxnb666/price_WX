Component({
  properties: {
    // 接收父组件传递的数据
    diameterData: {
      type: Array,
      value: []
    },
    weightData: {
      type: Array,
      value: []
    },
    bulkData: {
      type: Object,
      value: {
        price: '',
        weight: ''
      }
    },
    channel: {
      type: Array,
      value: []
    },
    diameterSpecs: {
      type: Array,
      value: []
    },
    weightSpecs: {
      type: Array,
      value: []
    },
    disabled: {
      type: Boolean,
      value: false
    },
    varietyUnit: {
      type: Object,
      value: {
        "UG": "元/斤",
        "UKG": "元/公斤"
      }
    }
  },
  
  data: {
    showDiameter: false,
    showWeight: false,
    showBulk: false,
    showWithInput: false,
    unitPrice: null,
    weight: null,
    unit: '',
    specssIndex: null,
    inputType: '', // price 或 weight
    inputSection: '', // diameter, weight 或 bulk
  },
  
  methods: {
    // 切换显示状态
    toggleSection(e) {
      const section = e.currentTarget.dataset.section;
      this.setData({
        [`show${section}`]: !this.data[`show${section}`]
      });
    },
    
    // 添加规格行
    addSpecs(e) {
      const section = e.currentTarget.dataset.section;
      let data = [...this.data[`${section}Data`]];
      data.push({
        fvSpecsMax: 0,
        fvSpecsMin: 0,
        fvSpecsUnit: "",
        saleChannelCode: "SCH_JXS",
        specsId: 0,
        specsType: section === "diameter" ? "DIAMETER" : "WEIGHT",
        unitPrice: 0,
        weight: 0,
        varietyUnit: "UG",
      });
      
      this.triggerEvent('update', {
        type: section,
        data: data
      });
    },
    
    // 删除规格行
    removeSpecs(e) {
      const section = e.currentTarget.dataset.section;
      const index = e.currentTarget.dataset.index;
      let data = [...this.data[`${section}Data`]];
      
      if (data.length <= 1) return;
      
      data.splice(index, 1);
      this.triggerEvent('update', {
        type: section,
        data: data
      });
    },
    
    // 显示输入对话框
    showInputDialog(e) {
      const value = e.currentTarget.dataset.value;
      const index = e.currentTarget.dataset.index;
      const unit = e.currentTarget.dataset.unit;
      const type = e.currentTarget.dataset.type;
      const section = e.currentTarget.dataset.section;
      
      this.setData({
        showWithInput: true,
        unitPrice: value,
        unit,
        specssIndex: Number(index),
        inputType: type,
        inputSection: section
      });
    },
    
    // 处理输入变化
    onInput(e) {
      this.setData({
        [this.data.inputType === 'price' ? 'unitPrice' : 'weight']: e.detail.value
      });
    },
    
    // 清除输入
    onInputClear() {
      this.setData({
        [this.data.inputType === 'price' ? 'unitPrice' : 'weight']: null
      });
    },
    
    // 关闭对话框
    closeDialog(e) {
      if (e.type === "confirm") {
        const type = this.data.inputType;
        const section = this.data.inputSection;
        const value = type === 'price' ? this.data.unitPrice : this.data.weight;
        
        if (!value) {
          this.triggerEvent('toast', {
            message: `请输入${type === 'price' ? '价格' : '重量'}`,
            theme: 'warning'
          });
          return;
        }
        
        if (!/^\d+(\.\d+)?$/.test(value)) {
          this.triggerEvent('toast', {
            message: '请输入有效的数字',
            theme: 'warning'
          });
          return;
        }
        
        if (section === 'bulk') {
          // 更新统果数据
          let bulkData = {...this.data.bulkData};
          bulkData[type === 'price' ? 'price' : 'weight'] = value;
          
          this.triggerEvent('update', {
            type: 'bulk',
            data: bulkData
          });
        } else {
          // 更新规格数据
          let data = [...this.data[`${section}Data`]];
          data[this.data.specssIndex][type === 'price' ? 'unitPrice' : 'weight'] = value;
          
          this.triggerEvent('update', {
            type: section,
            data: data
          });
        }
      }
      
      this.setData({
        showWithInput: false,
        unitPrice: null,
        weight: null
      });
    },
    
    // 选择渠道
    selectChannel(e) {
      const section = e.currentTarget.dataset.section;
      const index = e.currentTarget.dataset.index;
      
      this.triggerEvent('selectItem', {
        type: 'channel',
        section: section,
        index: index
      });
    },
    
    // 选择规格
    selectSpecs(e) {
      const section = e.currentTarget.dataset.section;
      const index = e.currentTarget.dataset.index;
      
      this.triggerEvent('selectItem', {
        type: 'specs',
        section: section,
        index: index
      });
    }
  }
});