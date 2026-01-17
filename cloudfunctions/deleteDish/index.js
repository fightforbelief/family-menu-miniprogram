// 云函数 - 删除菜品（软删除）
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  try {
    const { dishId } = event
    
    if (!dishId) {
      return {
        code: -1,
        message: '参数错误：缺少 dishId'
      }
    }
    
    // 软删除：设置 isAvailable 为 false
    const result = await db.collection('dish')
      .doc(dishId)
      .update({
        data: {
          isAvailable: false
        }
      })
    
    if (result.stats.updated === 0) {
      return {
        code: -4,
        message: '菜品不存在或删除失败'
      }
    }
    
    return {
      code: 0,
      message: '删除成功'
    }
  } catch (error) {
    console.error('删除菜品失败:', error)
    return {
      code: -2,
      message: '数据库错误',
      error: error.message
    }
  }
}
