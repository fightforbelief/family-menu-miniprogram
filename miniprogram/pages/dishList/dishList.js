// pages/dishList/dishList.js
Page({
  data: {
    cuisines: [], // 菜系列表
    categories: [], // 当前菜系的分类列表
    activeCuisine: '', // 当前选中的菜系编码
    activeCategory: '', // 当前选中的分类编码（用于左侧导航高亮）
    dishesGroupedByCategory: [], // 按分类分组的菜品
    cart: [], // 购物车
    totalCount: 0,
    loading: false,
    
    // 滚动相关
    scrollTop: 0, // 右侧滚动位置
    scrollIntoView: '', // 滚动到指定视图
    categoryPositions: {}, // 每个分类的位置信息
  },

  onLoad() {
    this.loadCuisines()
  },

  onShow() {
    // 从本地存储恢复购物车
    const cart = wx.getStorageSync('cart') || []
    this.setData({ cart })
    this.updateTotalCount()
  },

  // 加载菜系列表
  async loadCuisines() {
    this.setData({ loading: true })
    
    try {
      const res = await wx.cloud.callFunction({
        name: 'getCuisines',
        data: {}
      })
      
      if (res.result.code === 0 && res.result.data.length > 0) {
        const cuisines = res.result.data
        this.setData({ cuisines })
        
        // 默认选中第一个菜系
        const firstCuisine = cuisines[0]
        this.setData({ activeCuisine: firstCuisine.cuisine_code })
        
        // 加载该菜系的分类和菜品
        await this.loadCategoriesAndDishes(firstCuisine.cuisine_code)
      } else {
        wx.showToast({
          title: '暂无菜系数据',
          icon: 'none'
        })
      }
    } catch (error) {
      console.error('加载菜系失败:', error)
      this.loadMockData()
    } finally {
      this.setData({ loading: false })
    }
  },

  // 加载分类和菜品
  async loadCategoriesAndDishes(cuisine_code) {
    this.setData({ loading: true })
    
    try {
      // 并行加载分类和菜品
      const [categoriesRes, dishesRes] = await Promise.all([
        wx.cloud.callFunction({
          name: 'getCategories',
          data: { cuisine_code }
        }),
        wx.cloud.callFunction({
          name: 'getDishes',
          data: { 
            cuisine_code,
            isAvailable: true
          }
        })
      ])
      
      if (categoriesRes.result.code === 0 && dishesRes.result.code === 0) {
        const categories = categoriesRes.result.data
        const dishes = dishesRes.result.data
        
        // 按分类分组菜品
        const dishesGroupedByCategory = this.groupDishesByCategory(categories, dishes)
        
        this.setData({
          categories,
          dishesGroupedByCategory,
          activeCategory: categories.length > 0 ? categories[0].category_code : '',
          scrollTop: 0, // 重置滚动位置
          scrollIntoView: '' // 清除滚动目标
        })
        
        // 计算每个分类的位置（延迟执行，等DOM渲染完成）
        setTimeout(() => {
          this.calculateCategoryPositions()
        }, 300)
      }
    } catch (error) {
      console.error('加载分类和菜品失败:', error)
      this.loadMockData()
    } finally {
      this.setData({ loading: false })
    }
  },

  // 按分类分组菜品
  groupDishesByCategory(categories, dishes) {
    return categories.map(category => {
      const categoryDishes = dishes.filter(dish => dish.category_code === category.category_code)
      return {
        ...category,
        dishes: categoryDishes
      }
    }).filter(group => group.dishes.length > 0) // 只保留有菜品的分类
  },

  // 计算每个分类的位置
  calculateCategoryPositions() {
    const query = wx.createSelectorQuery()
    const positions = {}
    
    this.data.dishesGroupedByCategory.forEach((group, index) => {
      query.select(`#category-${group.category_code}`).boundingClientRect()
    })
    
    query.selectViewport().scrollOffset()
    
    query.exec((res) => {
      if (!res || res.length === 0) return
      
      const viewportOffset = res[res.length - 1]
      
      res.slice(0, -1).forEach((rect, index) => {
        if (rect) {
          const group = this.data.dishesGroupedByCategory[index]
          positions[group.category_code] = {
            top: rect.top + viewportOffset.scrollTop,
            height: rect.height
          }
        }
      })
      
      this.setData({ categoryPositions: positions })
    })
  },

  // 加载模拟数据（开发测试用）
  loadMockData() {
    const mockCuisines = [
      { cuisine: '中餐', cuisine_code: 'CN', sort_order: 10 },
      { cuisine: '日料', cuisine_code: 'JP', sort_order: 20 }
    ]
    
    const mockCategories = [
      { cuisine_code: 'CN', category: '凉菜', category_code: 'CN_COLD_DISHES', sort_order: 10 },
      { cuisine_code: 'CN', category: '热菜', category_code: 'CN_HOT_DISHES', sort_order: 20 }
    ]
    
    const mockDishes = [
      {
        _id: 'dish_001',
        name: '红油猪耳',
        cuisine_code: 'CN',
        category_code: 'CN_COLD_DISHES',
        description: '',
        image: 'default',
        ingredients: ['猪耳', '辣椒油'],
        isAvailable: true
      },
      {
        _id: 'dish_002',
        name: '夫妻肺片',
        cuisine_code: 'CN',
        category_code: 'CN_COLD_DISHES',
        description: '',
        image: 'default',
        ingredients: ['牛肉', '牛肚', '辣椒油'],
        isAvailable: true
      },
      {
        _id: 'dish_003',
        name: '宫保鸡丁',
        cuisine_code: 'CN',
        category_code: 'CN_HOT_DISHES',
        description: '可选辣度',
        image: 'default',
        ingredients: ['鸡腿肉', '花生', '青椒'],
        isAvailable: true
      },
      {
        _id: 'dish_004',
        name: '红烧肉',
        cuisine_code: 'CN',
        category_code: 'CN_HOT_DISHES',
        description: '',
        image: 'default',
        ingredients: ['五花肉', '酱油', '冰糖'],
        isAvailable: true
      }
    ]
    
    const dishesGroupedByCategory = this.groupDishesByCategory(mockCategories, mockDishes)
    
    this.setData({
      cuisines: mockCuisines,
      categories: mockCategories,
      activeCuisine: 'CN',
      activeCategory: 'CN_COLD_DISHES',
      dishesGroupedByCategory
    })
  },

  // 切换菜系
  async switchCuisine(e) {
    const cuisine_code = e.currentTarget.dataset.code
    if (cuisine_code === this.data.activeCuisine) return
    
    this.setData({ 
      activeCuisine: cuisine_code,
      scrollTop: 0,
      scrollIntoView: ''
    })
    
    // 加载该菜系的分类和菜品
    await this.loadCategoriesAndDishes(cuisine_code)
  },

  // 点击左侧分类导航 - 滚动到对应分类
  scrollToCategory(e) {
    const category_code = e.currentTarget.dataset.code
    
    // 更新左侧高亮
    this.setData({ 
      activeCategory: category_code,
      scrollIntoView: `category-${category_code}` // 使用 scroll-into-view 跳转
    })
    
    // 清除 scrollIntoView，避免影响后续手动滚动
    setTimeout(() => {
      this.setData({ scrollIntoView: '' })
    }, 500)
  },

  // 右侧滚动时更新左侧高亮
  onScroll(e) {
    const scrollTop = e.detail.scrollTop
    const { categoryPositions, dishesGroupedByCategory } = this.data
    
    // 找到当前滚动位置对应的分类
    let currentCategory = ''
    
    for (let i = 0; i < dishesGroupedByCategory.length; i++) {
      const group = dishesGroupedByCategory[i]
      const position = categoryPositions[group.category_code]
      
      if (position && scrollTop >= position.top - 100) {
        currentCategory = group.category_code
      } else {
        break
      }
    }
    
    // 更新左侧高亮（避免频繁更新）
    if (currentCategory && currentCategory !== this.data.activeCategory) {
      this.setData({ activeCategory: currentCategory })
    }
  },

  // 查看菜品详情
  viewDetail(e) {
    const dishId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/dishDetail/dishDetail?id=${dishId}`
    })
  },

  // 添加到购物车
  addToCart(e) {
    const dish = e.currentTarget.dataset.dish
    const { cart } = this.data
    
    // 检查是否已在购物车中
    const index = cart.findIndex(item => item._id === dish._id)
    
    if (index > -1) {
      cart[index].quantity += 1
    } else {
      cart.push({
        ...dish,
        quantity: 1
      })
    }
    
    this.setData({ cart })
    this.updateTotalCount()
    
    // 保存到本地存储
    wx.setStorageSync('cart', cart)
    
    // 轻量提示
    wx.showToast({
      title: '已添加',
      icon: 'success',
      duration: 800
    })
  },

  // 更新总数量
  updateTotalCount() {
    const { cart } = this.data
    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0)
    this.setData({ totalCount })
  },

  // 去购物车
  goToCart() {
    if (this.data.totalCount === 0) {
      wx.showToast({
        title: '购物车是空的',
        icon: 'none'
      })
      return
    }
    
    wx.navigateTo({
      url: '/pages/cart/cart'
    })
  }
})
