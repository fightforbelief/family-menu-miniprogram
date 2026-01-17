// 云函数 - 创建订单
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  try {
    const { guestName, guestPhone, visitDate, visitTime, dishes, specialRequests } = event
    
    // 参数验证
    if (!visitDate) {
      return {
        code: -1,
        message: '参数错误：拜访日期不能为空'
      }
    }
    
    if (!dishes || dishes.length === 0) {
      return {
        code: -1,
        message: '参数错误：至少需要点一道菜'
      }
    }
    
    // 计算总菜品数
    const totalDishes = dishes.reduce((sum, item) => sum + item.quantity, 0)
    
    // 构建订单数据
    const orderData = {
      guestName: guestName || '',
      guestPhone: guestPhone || '',
      visitDate,
      visitTime: visitTime || '18:00',
      dishes,
      totalDishes,
      specialRequests: specialRequests || '',
      status: 'pending',
      createTime: new Date(),
      updateTime: new Date()
    }
    
    // 添加到数据库
    const result = await db.collection('order').add({
      data: orderData
    })
    
    return {
      code: 0,
      message: '订单创建成功',
      data: {
        _id: result._id
      }
    }
  } catch (error) {
    console.error('创建订单失败:', error)
    return {
      code: -2,
      message: '数据库错误',
      error: error.message
    }
  }
}
