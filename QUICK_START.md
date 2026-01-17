# 快速开始指南

本指南将帮助你快速部署和运行家宴点菜小程序。

## 前提条件

- 微信开发者账号
- 微信开发者工具
- 已开通云开发

## 部署步骤

### 第一步：克隆项目

```bash
git clone https://github.com/yourusername/family-menu-miniprogram.git
cd family-menu-miniprogram
```

### 第二步：配置小程序

1. 使用微信开发者工具打开项目
2. 在工具栏点击"云开发"按钮
3. 开通云开发环境（如果还没有）
4. 记录你的环境 ID

### 第三步：修改配置

修改以下三个文件中的环境 ID：

1. `miniprogram/app.js` - 找到 `env: 'your-env-id'`
2. `miniprogram/config/cloudConfig.js` - 找到云存储 File ID
3. `project.config.json` - 找到 `"env": "your-env-id"`

### 第四步：创建数据库

在云开发控制台创建以下集合：

- **cuisines** - 菜系
- **cuisine_category** - 分类
- **dish** - 菜品
- **orders** - 订单

### 第五步：导入数据

在云开发控制台，为每个集合导入 `database_init/` 目录下对应的 JSON 文件：

- `cuisine.json` → cuisines 集合
- `cuisine_category.json` → cuisine_category 集合
- `dish.json` → dish 集合

### 第六步：上传云函数

右键点击 `cloudfunctions/` 下的每个文件夹，选择"上传并部署：云端安装依赖"：

- getDishes
- getDishDetail
- getCategories
- getCuisines
- addDish
- updateDish
- updateDishImages
- deleteDish
- createOrder
- getOrders
- deleteOrder
- getIngredients

### 第七步：上传默认图片

1. 在云开发控制台打开"云存储"
2. 创建文件夹 `dish_image/`
3. 上传 `miniprogram/images/default-dish.png`
4. 右键获取该文件的 File ID
5. 更新到 `miniprogram/config/cloudConfig.js`

### 第八步：设置管理员密码

编辑 `miniprogram/pages/home/home.js`，找到：

```javascript
if (password === 'your-admin-password') {
```

将 `your-admin-password` 改为你想要的密码。

### 第九步：编译运行

点击微信开发者工具的"编译"按钮，在模拟器中预览。

## 测试功能

### 用户端测试

1. 点击"开始点菜"
2. 选择一个菜系
3. 浏览菜品，添加到购物车
4. 填写订单信息并提交

### 管理员端测试

1. 点击"管理员模式"
2. 输入你设置的密码
3. 测试菜单管理和订单查看功能

## 常见问题

### 云函数调用失败

- 检查云函数是否上传成功
- 查看云开发控制台的日志
- 确认环境 ID 配置正确

### 图片无法显示

- 确认默认图片已上传到云存储
- 确认 File ID 配置正确
- 检查云存储权限设置

### 数据库查询为空

- 确认数据已正确导入
- 检查集合名称是否正确
- 查看云开发控制台的数据库

## 下一步

- 自定义菜品数据
- 修改主题样式
- 添加更多功能

如有问题，请查看 [完整 README](README.md) 或提交 Issue。
