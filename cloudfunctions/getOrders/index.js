// 云函数 - 获取订单列表
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  try {
    const { date, status } = event
    
    // 构建查询条件
    let query = {}
    
    if (date) {
      query.visitDate = date
    }
    
    if (status) {
      query.status = status
    }
    
    // 查询订单
    const result = await db.collection('order')
      .where(query)
      .orderBy('createTime', 'desc')
      .limit(500) // 添加 limit，支持更多订单
      .get()
    
    return {
      code: 0,
      message: 'success',
      data: result.data
    }
  } catch (error) {
    console.error('获取订单列表失败:', error)
    return {
      code: -2,
      message: '数据库错误',
      error: error.message
    }
  }
}
