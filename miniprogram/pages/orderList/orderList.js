// pages/orderList/orderList.js
Page({
  data: {
    orders: [],
    loading: false
  },

  onLoad() {
    this.loadAllOrders()
  },

  onShow() {
    // 每次显示页面时刷新订单列表
    this.loadAllOrders()
  },

  // 加载所有订单（从新到旧）
  async loadAllOrders() {
    this.setData({ loading: true })
    wx.showLoading({ title: '加载中...' })
    
    try {
      const res = await wx.cloud.callFunction({
        name: 'getOrders',
        data: {} // 不传 date，获取所有订单
      })
      
      if (res.result.code === 0) {
        // 订单已经在云函数中按 createTime 降序排序
        this.setData({ orders: res.result.data })
      } else {
        wx.showToast({
          title: res.result.message || '加载失败',
          icon: 'none'
        })
      }
    } catch (error) {
      console.error('加载订单失败:', error)
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      })
    } finally {
      wx.hideLoading()
      this.setData({ loading: false })
    }
  },

  // 查看订单详情
  viewOrderDetail(e) {
    const orderId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/orderDetail/orderDetail?id=${orderId}`
    })
  },

  // 删除订单
  deleteOrder(e) {
    const orderId = e.currentTarget.dataset.id
    const orderIndex = e.currentTarget.dataset.index
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个订单吗？',
      success: async (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '删除中...' })
          
          try {
            const result = await wx.cloud.callFunction({
              name: 'deleteOrder',
              data: { orderId }
            })
            
            wx.hideLoading()
            
            if (result.result.code === 0) {
              wx.showToast({
                title: '删除成功',
                icon: 'success'
              })
              
              // 从列表中移除
              const orders = this.data.orders
              orders.splice(orderIndex, 1)
              this.setData({ orders })
            } else {
              wx.showToast({
                title: result.result.message || '删除失败',
                icon: 'none'
              })
            }
          } catch (error) {
            console.error('删除失败:', error)
            wx.hideLoading()
            wx.showToast({
              title: '删除失败',
              icon: 'none'
            })
          }
        }
      }
    })
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.loadAllOrders().then(() => {
      wx.stopPullDownRefresh()
    })
  }
})
