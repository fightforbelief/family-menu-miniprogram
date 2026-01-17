// pages/cart/cart.js
Page({
  data: {
    cart: [],
    totalCount: 0
  },

  onLoad() {
    this.loadCart()
  },

  onShow() {
    this.loadCart()
  },

  loadCart() {
    const cart = wx.getStorageSync('cart') || []
    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0)
    this.setData({ cart, totalCount })
  },

  // 增加数量
  increaseQuantity(e) {
    const index = e.currentTarget.dataset.index
    const { cart } = this.data
    cart[index].quantity += 1
    this.updateCart(cart)
  },

  // 减少数量
  decreaseQuantity(e) {
    const index = e.currentTarget.dataset.index
    const { cart } = this.data
    
    if (cart[index].quantity > 1) {
      cart[index].quantity -= 1
      this.updateCart(cart)
    } else {
      // 数量为1时，弹出确认删除
      this.removeItem(e)
    }
  },

  // 删除项目
  removeItem(e) {
    const index = e.currentTarget.dataset.index
    const { cart } = this.data
    
    wx.showModal({
      title: '提示',
      content: '确定要删除这道菜吗？',
      success: (res) => {
        if (res.confirm) {
          cart.splice(index, 1)
          this.updateCart(cart)
          wx.showToast({
            title: '已删除',
            icon: 'success'
          })
        }
      }
    })
  },

  // 更新购物车
  updateCart(cart) {
    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0)
    this.setData({ cart, totalCount })
    wx.setStorageSync('cart', cart)
  },

  // 清空购物车
  clearCart() {
    wx.showModal({
      title: '提示',
      content: '确定要清空购物车吗？',
      success: (res) => {
        if (res.confirm) {
          this.setData({ cart: [], totalCount: 0 })
          wx.setStorageSync('cart', [])
          wx.showToast({
            title: '已清空',
            icon: 'success'
          })
        }
      }
    })
  },

  // 提交订单
  submitOrder() {
    if (this.data.totalCount === 0) {
      wx.showToast({
        title: '购物车是空的',
        icon: 'none'
      })
      return
    }

    wx.navigateTo({
      url: '/pages/orderConfirm/orderConfirm'
    })
  }
})
