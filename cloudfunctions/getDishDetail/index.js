// 云函数 - 获取菜品详情
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
    
    // 查询菜品详情
    const result = await db.collection('dish')
      .doc(dishId)
      .get()
    
    if (!result.data) {
      return {
        code: -4,
        message: '菜品不存在'
      }
    }
    
    return {
      code: 0,
      message: 'success',
      data: result.data
    }
  } catch (error) {
    console.error('获取菜品详情失败:', error)
    return {
      code: -2,
      message: '数据库错误',
      error: error.message
    }
  }
}
