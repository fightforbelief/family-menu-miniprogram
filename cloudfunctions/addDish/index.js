// 云函数 - 添加菜品
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  try {
    const { name, cuisine_code, category_code, description, image, ingredients } = event
    
    // 参数验证
    if (!name) {
      return {
        code: -1,
        message: '参数错误：菜品名称不能为空'
      }
    }
    
    if (!cuisine_code) {
      return {
        code: -1,
        message: '参数错误：菜系编码不能为空'
      }
    }
    
    if (!category_code) {
      return {
        code: -1,
        message: '参数错误：分类编码不能为空'
      }
    }
    
    if (!ingredients || ingredients.length === 0) {
      return {
        code: -1,
        message: '参数错误：至少需要一个食材'
      }
    }
    
    // 构建菜品数据
    const dishData = {
      name,
      cuisine_code,
      category_code,
      description: description || '',
      image: image || 'default',
      ingredients: ingredients || [],
      isAvailable: true
    }
    
    // 添加到数据库
    const result = await db.collection('dish').add({
      data: dishData
    })
    
    return {
      code: 0,
      message: '添加成功',
      data: {
        _id: result._id
      }
    }
  } catch (error) {
    console.error('添加菜品失败:', error)
    return {
      code: -2,
      message: '数据库错误',
      error: error.message
    }
  }
}
