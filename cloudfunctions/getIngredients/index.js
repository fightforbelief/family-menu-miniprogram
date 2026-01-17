// 云函数 - 获取材料清单
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  try {
    const { date } = event
    
    if (!date) {
      return {
        code: -1,
        message: '参数错误：缺少日期'
      }
    }
    
    // 1. 获取该日期的所有订单
    const ordersResult = await db.collection('order')
      .where({
        visitDate: date,
        status: db.command.neq('cancelled')
      })
      .limit(500) // 添加 limit
      .get()
    
    const orders = ordersResult.data
    
    if (orders.length === 0) {
      return {
        code: 0,
        message: 'success',
        data: {
          date,
          ingredients: [],
          totalOrders: 0
        }
      }
    }
    
    // 2. 收集所有需要的菜品ID
    const dishIds = new Set()
    const dishQuantities = {} // 记录每道菜的总数量
    
    orders.forEach(order => {
      order.dishes.forEach(dish => {
        dishIds.add(dish.dishId)
        if (!dishQuantities[dish.dishId]) {
          dishQuantities[dish.dishId] = {
            name: dish.dishName,
            quantity: 0
          }
        }
        dishQuantities[dish.dishId].quantity += dish.quantity
      })
    })
    
    // 3. 获取所有相关菜品的详细信息
    const dishesResult = await db.collection('dish')
      .where({
        _id: db.command.in(Array.from(dishIds))
      })
      .limit(1000) // 添加 limit
      .get()
    
    const dishes = dishesResult.data
    
    // 4. 汇总材料
    const ingredientsMap = new Map()
    
    dishes.forEach(dish => {
      const quantity = dishQuantities[dish._id].quantity
      
      dish.ingredients.forEach(ingredient => {
        const key = ingredient.name
        
        if (!ingredientsMap.has(key)) {
          ingredientsMap.set(key, {
            name: ingredient.name,
            totalAmount: ingredient.amount,
            unit: ingredient.unit,
            dishes: [dish.name],
            quantities: [{ dishName: dish.name, amount: ingredient.amount, count: quantity }]
          })
        } else {
          const existing = ingredientsMap.get(key)
          if (!existing.dishes.includes(dish.name)) {
            existing.dishes.push(dish.name)
          }
          existing.quantities.push({
            dishName: dish.name,
            amount: ingredient.amount,
            count: quantity
          })
          
          // 简单累加（如果需要更复杂的单位转换，需要额外处理）
          // 这里假设同一材料的单位是一致的
          const amountNum = parseFloat(ingredient.amount)
          if (!isNaN(amountNum)) {
            const totalNum = parseFloat(existing.totalAmount) || 0
            existing.totalAmount = String((totalNum + amountNum * quantity).toFixed(2))
          } else {
            existing.totalAmount = `${existing.totalAmount} + ${ingredient.amount} x${quantity}`
          }
        }
      })
    })
    
    // 5. 转换为数组
    const ingredients = Array.from(ingredientsMap.values()).map(item => {
      // 格式化总用量
      let totalAmount = item.totalAmount
      if (!isNaN(parseFloat(totalAmount))) {
        totalAmount = parseFloat(totalAmount).toFixed(0) + item.unit
      }
      
      return {
        name: item.name,
        totalAmount,
        unit: item.unit,
        dishes: item.dishes
      }
    })
    
    // 6. 按名称排序
    ingredients.sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'))
    
    return {
      code: 0,
      message: 'success',
      data: {
        date,
        ingredients,
        totalOrders: orders.length
      }
    }
  } catch (error) {
    console.error('获取材料清单失败:', error)
    return {
      code: -6,
      message: '材料计算失败',
      error: error.message
    }
  }
}
