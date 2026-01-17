// 云函数 - 获取菜系列表
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  try {
    // ✅ 改为 cuisine（没有s）
    const result = await db.collection('cuisine')
      .orderBy('sort_order', 'asc')
      .limit(50) // 添加 limit
      .get()
    
    return {
      code: 0,
      message: 'success',
      data: result.data
    }
  } catch (error) {
    console.error('获取菜系列表失败:', error)
    return {
      code: -2,
      message: '数据库错误',
      error: error.message
    }
  }
}
