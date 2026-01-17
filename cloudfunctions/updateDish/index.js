// 云函数 - 更新菜品
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  try {
    const { dishId, ...updateData } = event
    
    if (!dishId) {
      return {
        code: -1,
        message: '参数错误：缺少 dishId'
      }
    }
    
    // 更新菜品
    const result = await db.collection('dish')
      .doc(dishId)
      .update({
        data: updateData
      })
    
    if (result.stats.updated === 0) {
      return {
        code: -4,
        message: '菜品不存在或更新失败'
      }
    }
    
    return {
      code: 0,
      message: '更新成功',
      data: {
        _id: dishId
      }
    }
  } catch (error) {
    console.error('更新菜品失败:', error)
    return {
      code: -2,
      message: '数据库错误',
      error: error.message
    }
  }
}
