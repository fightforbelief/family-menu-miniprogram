// pages/ingredientList/ingredientList.js
Page({
  data: {
    selectedDate: '',
    ingredients: [],
    totalOrders: 0
  },

  onLoad() {
    const today = this.formatDate(new Date())
    this.setData({ selectedDate: today })
    this.loadIngredients()
  },

  formatDate(date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  },

  async loadIngredients() {
    wx.showLoading({ title: '计算中...' })
    
    try {
      const res = await wx.cloud.callFunction({
        name: 'getIngredients',
        data: {
          date: this.data.selectedDate
        }
      })
      
      if (res.result.code === 0) {
        const data = res.result.data
        this.setData({
          ingredients: data.ingredients || [],
          totalOrders: data.totalOrders || 0
        })
      } else {
        wx.showToast({
          title: res.result.message || '加载失败',
          icon: 'none'
        })
      }
    } catch (error) {
      console.error('加载材料清单失败:', error)
      // 使用模拟数据
      this.loadMockData()
    } finally {
      wx.hideLoading()
    }
  },

  loadMockData() {
    const mockIngredients = [
      {
        name: '五花肉',
        totalAmount: '1000g',
        unit: '克',
        dishes: ['红烧肉', '回锅肉']
      },
      {
        name: '青菜',
        totalAmount: '500g',
        unit: '克',
        dishes: ['清炒青菜']
      },
      {
        name: '鱼',
        totalAmount: '2条',
        unit: '条',
        dishes: ['清蒸鱼', '红烧鱼']
      }
    ]
    this.setData({
      ingredients: mockIngredients,
      totalOrders: 2
    })
  },

  // 日期选择
  onDateChange(e) {
    this.setData({
      selectedDate: e.detail.value
    })
    this.loadIngredients()
  },

  // 复制购物清单
  copyList() {
    const { ingredients, selectedDate, totalOrders } = this.data
    
    if (ingredients.length === 0) {
      wx.showToast({
        title: '暂无材料',
        icon: 'none'
      })
      return
    }
    
    let text = `【${selectedDate} 购物清单】\n`
    text += `共 ${totalOrders} 个订单\n\n`
    
    ingredients.forEach((item, index) => {
      text += `${index + 1}. ${item.name}：${item.totalAmount}\n`
      text += `   用于：${item.dishes.join('、')}\n\n`
    })
    
    wx.setClipboardData({
      data: text,
      success: () => {
        wx.showToast({
          title: '已复制到剪贴板',
          icon: 'success'
        })
      }
    })
  }
})
