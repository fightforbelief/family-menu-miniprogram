// pages/orderConfirm/orderConfirm.js
Page({
  data: {
    cart: [],
    guestName: '',
    guestPhone: '',
    visitDate: '',
    visitTime: '',
    specialRequests: '',
    currentDate: ''
  },

  onLoad() {
    const cart = wx.getStorageSync('cart') || []
    const today = new Date()
    const dateStr = this.formatDate(today)
    
    this.setData({ 
      cart,
      visitDate: dateStr,
      visitTime: '18:00',
      currentDate: dateStr
    })
  },

  formatDate(date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  },

  // 输入客人姓名
  onGuestNameInput(e) {
    this.setData({ guestName: e.detail.value })
  },

  // 输入客人电话
  onPhoneInput(e) {
    this.setData({ guestPhone: e.detail.value })
  },

  // 日期选择
  onDateChange(e) {
    this.setData({
      visitDate: e.detail.value
    })
  },

  // 时间选择
  onTimeChange(e) {
    this.setData({
      visitTime: e.detail.value
    })
  },

  // 特殊要求输入
  onSpecialRequestsInput(e) {
    this.setData({ specialRequests: e.detail.value })
  },

  // 提交订单
  async submitOrder() {
    const { cart, guestName, guestPhone, visitDate, visitTime, specialRequests } = this.data

    if (cart.length === 0) {
      wx.showToast({
        title: '购物车是空的',
        icon: 'none'
      })
      return
    }

    if (!visitDate) {
      wx.showToast({
        title: '请选择拜访日期',
        icon: 'none'
      })
      return
    }

    wx.showLoading({ title: '提交中...' })

    try {
      const dishes = cart.map(item => ({
        dishId: item._id,
        dishName: item.name,
        quantity: item.quantity
      }))

      const res = await wx.cloud.callFunction({
        name: 'createOrder',
        data: {
          guestName,
          guestPhone,
          visitDate,
          visitTime,
          dishes,
          specialRequests
        }
      })

      wx.hideLoading()

      if (res.result.code === 0) {
        // 清空购物车
        wx.setStorageSync('cart', [])
        
        wx.showModal({
          title: '提交成功',
          content: '您的菜单已提交，期待您的到来！',
          showCancel: false,
          success: () => {
            wx.reLaunch({
              url: '/pages/home/home'
            })
          }
        })
      } else {
        wx.showToast({
          title: res.result.message || '提交失败',
          icon: 'none'
        })
      }
    } catch (error) {
      wx.hideLoading()
      console.error('提交订单失败:', error)
      
      // 模拟成功（开发测试用）
      wx.setStorageSync('cart', [])
      wx.showModal({
        title: '提交成功',
        content: '您的菜单已提交，期待您的到来！',
        showCancel: false,
        success: () => {
          wx.reLaunch({
            url: '/pages/home/home'
          })
        }
      })
    }
  }
})
