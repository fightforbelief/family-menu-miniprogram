// 云函数 - 获取分类列表
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  try {
    const { cuisine_code } = event
    
    let query = {}
    
    // 如果指定了菜系，只返回该菜系的分类
    if (cuisine_code) {
      query.cuisine_code = cuisine_code
    }
    
    // 查询分类，按 sort_order 排序
    const result = await db.collection('cuisine_category')
      .where(query)
      .orderBy('sort_order', 'asc')
      .limit(100) // 添加 limit，避免数据被截断
      .get()
    
    return {
      code: 0,
      message: 'success',
      data: result.data
    }
  } catch (error) {
    console.error('获取分类列表失败:', error)
    return {
      code: -2,
      message: '数据库错误',
      error: error.message
    }
  }
}
