// pages/menuManage/menuManage.js
Page({
  data: {
    allDishes: [],  // 所有菜品
    dishes: [],     // 筛选后的菜品
    
    // 菜系筛选
    cuisines: [],
    activeCuisine: 'all'  // 'all' 表示全部
  },

  async onLoad() {
    await this.loadCuisines()
    await this.loadDishes()
  },

  onShow() {
    this.loadDishes()
  },

  // 加载菜系列表
  async loadCuisines() {
    try {
      const res = await wx.cloud.callFunction({
        name: 'getCuisines',
        data: {}
      })
      
      if (res.result.code === 0) {
        // 添加"全部"选项
        const cuisines = [
          { cuisine: '全部', cuisine_code: 'all' },
          ...res.result.data
        ]
        this.setData({ cuisines })
      }
    } catch (error) {
      console.error('加载菜系失败:', error)
    }
  },

  // 加载菜品列表
  async loadDishes() {
    wx.showLoading({ title: '加载中...' })
    
    try {
      const res = await wx.cloud.callFunction({
        name: 'getDishes',
        data: {}
      })
      
      if (res.result.code === 0) {
        this.setData({ 
          allDishes: res.result.data 
        })
        this.filterDishes()
      } else {
        wx.showToast({
          title: res.result.message || '加载失败',
          icon: 'none'
        })
      }
    } catch (error) {
      console.error('加载菜品失败:', error)
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      })
    } finally {
      wx.hideLoading()
    }
  },

  // 筛选菜品
  filterDishes() {
    const { allDishes, activeCuisine } = this.data
    
    let filteredDishes = allDishes
    
    // 按菜系筛选
    if (activeCuisine !== 'all') {
      filteredDishes = allDishes.filter(dish => dish.cuisine_code === activeCuisine)
    }
    
    this.setData({ dishes: filteredDishes })
  },

  // 切换菜系
  switchCuisine(e) {
    const cuisineCode = e.currentTarget.dataset.code
    this.setData({ activeCuisine: cuisineCode })
    this.filterDishes()
  },

  // 添加菜品
  addDish() {
    wx.navigateTo({
      url: '/pages/dishEdit/dishEdit'
    })
  },

  // 编辑菜品
  editDish(e) {
    const dishId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/dishEdit/dishEdit?id=${dishId}`
    })
  },

  // 切换上架/下架状态
  async toggleAvailable(e) {
    const dishId = e.currentTarget.dataset.id
    const isAvailable = e.currentTarget.dataset.available
    
    try {
      const res = await wx.cloud.callFunction({
        name: 'updateDish',
        data: {
          dishId,
          isAvailable: !isAvailable
        }
      })
      
      if (res.result.code === 0) {
        wx.showToast({
          title: isAvailable ? '已下架' : '已上架',
          icon: 'success'
        })
        this.loadDishes()
      }
    } catch (error) {
      console.error('更新失败:', error)
      wx.showToast({
        title: '操作失败',
        icon: 'none'
      })
    }
  }
})
