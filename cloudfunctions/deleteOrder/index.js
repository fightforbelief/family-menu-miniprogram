// 云函数 - 删除订单
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  try {
    const { orderId } = event
    
    if (!orderId) {
      return {
        code: -1,
        message: '参数错误：缺少 orderId'
      }
    }
    
    // 删除订单
    const result = await db.collection('order')
      .doc(orderId)
      .remove()
    
    if (result.stats.removed === 0) {
      return {
        code: -5,
        message: '订单不存在或删除失败'
      }
    }
    
    return {
      code: 0,
      message: '删除成功'
    }
  } catch (error) {
    console.error('删除订单失败:', error)
    return {
      code: -2,
      message: '数据库错误',
      error: error.message
    }
  }
}
