// pages/orderDetail/orderDetail.js
Page({
  data: {
    order: null,
    ingredients: [], // 食材清单
    loading: true
  },

  onLoad(options) {
    const orderId = options.id
    if (orderId) {
      this.loadOrderDetail(orderId)
    } else {
      wx.showToast({
        title: '订单ID缺失',
        icon: 'none'
      })
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    }
  },

  // 加载订单详情
  async loadOrderDetail(orderId) {
    wx.showLoading({ title: '加载中...' })
    
    try {
      const res = await wx.cloud.callFunction({
        name: 'getOrders',
        data: {}
      })
      
      if (res.result.code === 0) {
        const order = res.result.data.find(o => o._id === orderId)
        
        if (order) {
          this.setData({ order })
          // 加载食材清单
          await this.loadIngredients(order)
        } else {
          wx.showToast({
            title: '订单不存在',
            icon: 'none'
          })
          setTimeout(() => {
            wx.navigateBack()
          }, 1500)
        }
      }
    } catch (error) {
      console.error('加载订单详情失败:', error)
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      })
    } finally {
      wx.hideLoading()
      this.setData({ loading: false })
    }
  },

  // 加载食材清单
  async loadIngredients(order) {
    try {
      // 获取订单中所有菜品的详细信息
      const dishIds = order.dishes.map(d => d.dishId)
      
      const res = await wx.cloud.callFunction({
        name: 'getDishes',
        data: {}
      })
      
      if (res.result.code === 0) {
        const allDishes = res.result.data
        
        // 汇总食材
        const ingredientsMap = {}
        
        order.dishes.forEach(orderDish => {
          const dishDetail = allDishes.find(d => d._id === orderDish.dishId)
          
          if (dishDetail && dishDetail.ingredients) {
            dishDetail.ingredients.forEach(ingredient => {
              if (ingredientsMap[ingredient]) {
                ingredientsMap[ingredient] += orderDish.quantity
              } else {
                ingredientsMap[ingredient] = orderDish.quantity
              }
            })
          }
        })
        
        // 转换为数组
        const ingredients = Object.keys(ingredientsMap).map(name => ({
          name,
          count: ingredientsMap[name]
        }))
        
        this.setData({ ingredients })
      }
    } catch (error) {
      console.error('加载食材失败:', error)
    }
  }
})
