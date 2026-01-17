// pages/home/home.js
Page({
  data: {
    appName: '我想吃...'
  },

  onLoad() {
    // 页面加载
  },

  // 开始点菜
  startOrdering() {
    wx.navigateTo({
      url: '/pages/dishList/dishList'
    })
  },

  // 进入管理员模式
  goToAdmin() {
    // 简单密码验证
    wx.showModal({
      title: '大厨身份验证',
      editable: true,
      placeholderText: '请输入大厨的密码',
      success: (res) => {
        if (res.confirm) {
          const password = res.content || ''
          // 🔒 请在这里修改为你自己的管理员密码
          if (password === 'your-admin-password') {
            wx.navigateTo({
              url: '/pages/admin/admin'
            })
          } else {
            wx.showToast({
              title: '密码错误',
              icon: 'none'
            })
          }
        }
      }
    })
  }
})
