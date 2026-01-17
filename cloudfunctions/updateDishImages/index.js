// 云函数 - 批量更新所有菜品的图片为云存储地址
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

// 云存储中默认图片的 File ID
// 🔧 请替换为你自己的云存储 File ID
const DEFAULT_IMAGE_FILE_ID = 'cloud://your-env-id.xxxx/dish_image/default-dish.png'

exports.main = async (event, context) => {
  try {
    console.log('开始批量更新菜品图片...')
    
    // 1. 获取所有菜品
    const dishesRes = await db.collection('dish')
      .limit(1000)
      .get()
    
    const dishes = dishesRes.data
    console.log(`共找到 ${dishes.length} 道菜品`)
    
    if (dishes.length === 0) {
      return {
        code: 0,
        message: '没有需要更新的菜品',
        data: {
          total: 0,
          updated: 0
        }
      }
    }
    
    // 2. 批量更新
    let updateCount = 0
    let skipCount = 0
    const errors = []
    
    for (let dish of dishes) {
      try {
        // 如果 image 字段是 'default' 或不存在，更新为云存储地址
        if (!dish.image || dish.image === 'default' || dish.image.startsWith('/images/')) {
          await db.collection('dish')
            .doc(dish._id)
            .update({
              data: {
                image: DEFAULT_IMAGE_FILE_ID
              }
            })
          
          updateCount++
          console.log(`✅ 已更新: ${dish.name} (${dish._id})`)
        } else {
          skipCount++
          console.log(`⏭️ 跳过: ${dish.name} (已有云存储图片)`)
        }
      } catch (error) {
        errors.push({
          dishId: dish._id,
          dishName: dish.name,
          error: error.message
        })
        console.error(`❌ 更新失败: ${dish.name}`, error)
      }
    }
    
    // 3. 返回结果
    const result = {
      code: 0,
      message: '批量更新完成',
      data: {
        total: dishes.length,
        updated: updateCount,
        skipped: skipCount,
        errors: errors.length,
        errorDetails: errors
      }
    }
    
    console.log('更新结果:', result)
    return result
    
  } catch (error) {
    console.error('批量更新失败:', error)
    return {
      code: -1,
      message: '批量更新失败',
      error: error.message
    }
  }
}
