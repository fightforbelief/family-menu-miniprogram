// pages/dishDetail/dishDetail.js
Page({
  data: {
    dish: null,
    dishId: ''
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ dishId: options.id })
      this.loadDishDetail()
    }
  },

  async loadDishDetail() {
    wx.showLoading({ title: '加载中...' })
    
    try {
      const res = await wx.cloud.callFunction({
        name: 'getDishDetail',
        data: {
          dishId: this.data.dishId
        }
      })
      
      if (res.result.code === 0) {
        this.setData({ dish: res.result.data })
      } else {
        wx.showToast({
          title: res.result.message || '加载失败',
          icon: 'none'
        })
      }
    } catch (error) {
      console.error('加载菜品详情失败:', error)
      // 使用模拟数据
      this.loadMockDetail()
    } finally {
      wx.hideLoading()
    }
  },

  loadMockDetail() {
    const mockDish = {
      _id: this.data.dishId,
      name: '红烧肉',
      description: '经典家常菜，肥而不腻，色泽红亮，味道醇厚',
      image: '/images/default-dish.png',
      category: '肉菜',
      cookingTime: 60,
      difficulty: '中等',
      ingredients: [
        { name: '五花肉', amount: '500g', unit: '克' },
        { name: '酱油', amount: '3勺', unit: '勺' },
        { name: '冰糖', amount: '50g', unit: '克' },
        { name: '料酒', amount: '2勺', unit: '勺' },
        { name: '葱姜', amount: '适量', unit: '' }
      ],
      tags: ['荤菜', '下饭', '经典']
    }
    this.setData({ dish: mockDish })
  },

  addToCart() {
    const { dish } = this.data
    const cart = wx.getStorageSync('cart') || []
    
    const index = cart.findIndex(item => item._id === dish._id)
    if (index > -1) {
      cart[index].quantity += 1
    } else {
      cart.push({ ...dish, quantity: 1 })
    }
    
    wx.setStorageSync('cart', cart)
    
    wx.showToast({
      title: '已添加到购物车',
      icon: 'success'
    })
  }
})
