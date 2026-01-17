// 云函数 - 获取菜品列表
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  try {
    const { cuisine_code, category_code, isAvailable, keyword } = event
    
    // 构建查询条件
    let query = {}
    
    // 按菜系筛选
    if (cuisine_code) {
      query.cuisine_code = cuisine_code
    }
    
    // 按分类筛选
    if (category_code) {
      query.category_code = category_code
    }
    
    // 按上架状态筛选
    if (isAvailable !== undefined) {
      query.isAvailable = isAvailable
    }
    
    // 关键词搜索（菜品名称）
    if (keyword) {
      query.name = db.RegExp({
        regexp: keyword,
        options: 'i'
      })
    }
    
    // ✅ 关键修复：使用 limit(1000) 获取所有数据
    // 微信云数据库 .get() 默认最多返回 100 条，需要显式设置 limit
    const result = await db.collection('dish')
      .where(query)
      .limit(1000) // ← 增加限制，支持更多菜品
      .get()
    
    console.log(`查询到 ${result.data.length} 道菜品`)
    
    return {
      code: 0,
      message: 'success',
      data: result.data
    }
  } catch (error) {
    console.error('获取菜品列表失败:', error)
    return {
      code: -2,
      message: '数据库错误',
      error: error.message
    }
  }
}
