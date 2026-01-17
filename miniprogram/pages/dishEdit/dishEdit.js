// pages/dishEdit/dishEdit.js
// 引入云存储配置
const cloudConfig = require('../../config/cloudConfig.js')
const DEFAULT_IMAGE = cloudConfig.DEFAULT_DISH_IMAGE

Page({
  data: {
    dishId: '',
    isEdit: false,
    
    // 菜系列表
    cuisines: [],
    cuisineIndex: 0,
    
    // 分类列表（根据菜系动态加载）
    categories: [],
    categoryIndex: 0,
    
    formData: {
      name: '',
      cuisine_code: '',
      category_code: '',
      description: '',
      image: DEFAULT_IMAGE,
      ingredients: [],
      isAvailable: true
    },
    
    // 临时食材输入
    ingredientInput: ''
  },

  async onLoad(options) {
    // 加载菜系列表
    await this.loadCuisines()
    
    if (options.id) {
      this.setData({ 
        dishId: options.id,
        isEdit: true
      })
      await this.loadDishDetail()
    } else {
      // 新增模式：默认选择第一个菜系
      if (this.data.cuisines.length > 0) {
        const firstCuisine = this.data.cuisines[0]
        this.setData({
          'formData.cuisine_code': firstCuisine.cuisine_code
        })
        await this.loadCategories(firstCuisine.cuisine_code)
      }
    }
  },

  // 加载菜系列表
  async loadCuisines() {
    try {
      const res = await wx.cloud.callFunction({
        name: 'getCuisines',
        data: {}
      })
      
      if (res.result.code === 0) {
        this.setData({ cuisines: res.result.data })
      }
    } catch (error) {
      console.error('加载菜系失败:', error)
    }
  },

  // 加载分类列表
  async loadCategories(cuisine_code) {
    try {
      const res = await wx.cloud.callFunction({
        name: 'getCategories',
        data: { cuisine_code }
      })
      
      if (res.result.code === 0) {
        this.setData({ 
          categories: res.result.data,
          categoryIndex: 0
        })
        
        // 如果不是编辑模式，设置默认分类
        if (!this.data.isEdit && res.result.data.length > 0) {
          this.setData({
            'formData.category_code': res.result.data[0].category_code
          })
        }
      }
    } catch (error) {
      console.error('加载分类失败:', error)
    }
  },

  // 加载菜品详情
  async loadDishDetail() {
    wx.showLoading({ title: '加载中...' })
    
    try {
      const res = await wx.cloud.callFunction({
        name: 'getDishDetail',
        data: { dishId: this.data.dishId }
      })
      
      if (res.result.code === 0) {
        const dish = res.result.data
        
        // 查找菜系和分类的索引
        const cuisineIndex = this.data.cuisines.findIndex(c => c.cuisine_code === dish.cuisine_code)
        
        // 加载对应菜系的分类
        await this.loadCategories(dish.cuisine_code)
        
        const categoryIndex = this.data.categories.findIndex(c => c.category_code === dish.category_code)
        
        this.setData({
          formData: {
            name: dish.name,
            cuisine_code: dish.cuisine_code,
            category_code: dish.category_code,
            description: dish.description || '',
            image: dish.image || DEFAULT_IMAGE,
            ingredients: dish.ingredients || [],
            isAvailable: dish.isAvailable !== false
          },
          cuisineIndex: cuisineIndex >= 0 ? cuisineIndex : 0,
          categoryIndex: categoryIndex >= 0 ? categoryIndex : 0
        })
      }
    } catch (error) {
      console.error('加载失败:', error)
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      })
    } finally {
      wx.hideLoading()
    }
  },

  // 输入处理
  onNameInput(e) {
    this.setData({ 'formData.name': e.detail.value })
  },

  onDescInput(e) {
    this.setData({ 'formData.description': e.detail.value })
  },

  // 菜系选择
  async onCuisineChange(e) {
    const index = parseInt(e.detail.value)
    const cuisine = this.data.cuisines[index]
    
    this.setData({
      cuisineIndex: index,
      'formData.cuisine_code': cuisine.cuisine_code
    })
    
    // 重新加载分类
    await this.loadCategories(cuisine.cuisine_code)
  },

  // 分类选择
  onCategoryChange(e) {
    const index = parseInt(e.detail.value)
    const category = this.data.categories[index]
    
    this.setData({
      categoryIndex: index,
      'formData.category_code': category.category_code
    })
  },

  // 上传图片
  async chooseImage() {
    try {
      const res = await wx.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera']
      })
      
      const tempFilePath = res.tempFilePaths[0]
      
      wx.showLoading({ title: '上传中...' })
      
      // 上传到云存储的 dish_image 文件夹
      const timestamp = Date.now()
      const random = Math.random().toString(36).substr(2, 9)
      const cloudPath = `dish_image/${timestamp}-${random}.jpg`
      
      const uploadRes = await wx.cloud.uploadFile({
        cloudPath,
        filePath: tempFilePath
      })
      
      this.setData({ 'formData.image': uploadRes.fileID })
      
      wx.hideLoading()
      wx.showToast({
        title: '上传成功',
        icon: 'success'
      })
    } catch (error) {
      wx.hideLoading()
      console.error('上传失败:', error)
      wx.showToast({
        title: '上传失败',
        icon: 'none'
      })
    }
  },

  // 食材输入
  onIngredientInput(e) {
    this.setData({ ingredientInput: e.detail.value })
  },

  // 添加食材
  addIngredient() {
    const ingredientInput = this.data.ingredientInput.trim()
    
    if (!ingredientInput) {
      wx.showToast({
        title: '请输入食材名称',
        icon: 'none'
      })
      return
    }
    
    const ingredients = this.data.formData.ingredients
    
    // 检查是否已存在
    if (ingredients.includes(ingredientInput)) {
      wx.showToast({
        title: '食材已存在',
        icon: 'none'
      })
      return
    }
    
    ingredients.push(ingredientInput)
    
    this.setData({
      'formData.ingredients': ingredients,
      ingredientInput: ''
    })
  },

  // 删除食材
  removeIngredient(e) {
    const index = e.currentTarget.dataset.index
    const ingredients = this.data.formData.ingredients
    ingredients.splice(index, 1)
    this.setData({ 'formData.ingredients': ingredients })
  },

  // 保存菜品
  async saveDish() {
    const { formData, isEdit, dishId } = this.data
    
    // 验证
    if (!formData.name.trim()) {
      wx.showToast({ title: '请输入菜品名称', icon: 'none' })
      return
    }
    
    if (!formData.cuisine_code) {
      wx.showToast({ title: '请选择菜系', icon: 'none' })
      return
    }
    
    if (!formData.category_code) {
      wx.showToast({ title: '请选择分类', icon: 'none' })
      return
    }
    
    if (formData.ingredients.length === 0) {
      wx.showToast({ title: '请至少添加一个食材', icon: 'none' })
      return
    }
    
    wx.showLoading({ title: '保存中...' })
    
    try {
      const data = {
        name: formData.name.trim(),
        cuisine_code: formData.cuisine_code,
        category_code: formData.category_code,
        description: formData.description.trim(),
        image: formData.image || DEFAULT_IMAGE,
        ingredients: formData.ingredients,
        isAvailable: formData.isAvailable
      }
      
      let res
      if (isEdit) {
        res = await wx.cloud.callFunction({
          name: 'updateDish',
          data: { dishId, ...data }
        })
      } else {
        res = await wx.cloud.callFunction({
          name: 'addDish',
          data
        })
      }
      
      wx.hideLoading()
      
      if (res.result.code === 0) {
        wx.showToast({
          title: isEdit ? '更新成功' : '添加成功',
          icon: 'success'
        })
        setTimeout(() => {
          wx.navigateBack()
        }, 1500)
      } else {
        wx.showToast({
          title: res.result.message || '保存失败',
          icon: 'none'
        })
      }
    } catch (error) {
      wx.hideLoading()
      console.error('保存失败:', error)
      wx.showToast({
        title: '保存失败',
        icon: 'none'
      })
    }
  }
})
