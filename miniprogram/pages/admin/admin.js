// pages/admin/admin.js
Page({
  data: {},

  onLoad() {},

  // 查看订单列表
  viewOrders() {
    wx.navigateTo({
      url: '/pages/orderList/orderList'
    })
  },

  // 管理菜单
  manageMenu() {
    wx.navigateTo({
      url: '/pages/menuManage/menuManage'
    })
  },

  // 添加新菜品
  addNewDish() {
    wx.navigateTo({
      url: '/pages/dishEdit/dishEdit?mode=add'
    })
  }
})
