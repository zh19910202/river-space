# River Space - Notion博客集成设置指南

## 🎯 概述

您的网站现在支持通过Notion API直接管理博客内容。这意味着您可以：
- 在Notion中编写和管理文章
- 自动同步到您的网站
- 支持富文本、代码块、图片等所有Notion格式
- 无需手动更新代码

## 📋 设置步骤

### 1. 创建Notion Integration

1. 访问 [Notion Integrations](https://www.notion.so/my-integrations)
2. 点击 **"+ New integration"**
3. 填写基本信息：
   - **Name**: River Space Blog
   - **Associated workspace**: 选择您的工作区
   - **Type**: Internal
4. 点击 **"Submit"** 创建
5. 复制生成的 **"Internal Integration Token"**（以 `secret_` 开头）

### 2. 创建博客数据库

1. 在Notion中创建新页面
2. 选择 **"Database"** → **"Table"**
3. 添加以下属性（字段名必须完全一致）：

| 字段名 | 类型 | 说明 |
|--------|------|------|
| `Title` | Title | 文章标题（默认字段） |
| `Summary` | Text | 文章摘要，显示在列表页 |
| `Tags` | Multi-select | 文章标签，如：区块链、DeFi等 |
| `Category` | Select | 文章分类，如：技术、教程等 |
| `Published` | Checkbox | 发布状态，勾选后显示在网站 |
| `PublishDate` | Date | 发布日期，用于排序 |
| `ReadTime` | Text | 阅读时间，如：8分钟 |

### 3. 授权Integration访问数据库

1. 在数据库页面，点击右上角 **"..."**
2. 选择 **"Connect to"**
3. 找到并选择您刚创建的Integration（River Space Blog）

### 4. 配置网站

1. 复制数据库ID：
   - 在数据库页面URL中找到：`https://notion.so/YOUR_DATABASE_ID?v=...`
   - 复制 `YOUR_DATABASE_ID` 部分

2. 在浏览器中打开您的博客页面（blog.html）

3. 打开浏览器开发者工具（F12）

4. 在控制台中运行以下命令：
   ```javascript
   notionBlogService.setConfig('您的API密钥', '您的数据库ID')
   ```

5. 刷新页面，应该能看到从Notion加载的内容

## ✍️ 写作指南

### 创建新文章

1. 在Notion数据库中点击 **"New"** 创建新条目
2. 填写文章信息：
   - **Title**: 文章标题
   - **Summary**: 简短摘要（1-2句话）
   - **Tags**: 选择相关标签
   - **Category**: 选择文章分类
   - **PublishDate**: 设置发布日期
   - **ReadTime**: 估算阅读时间
   - **Published**: ❌ 先不勾选（草稿状态）

3. 点击标题进入页面，开始编写文章内容

### 支持的格式

您可以在Notion中使用所有标准格式：

- **标题**: `# 一级标题`、`## 二级标题`、`### 三级标题`
- **文本格式**: **粗体**、*斜体*、~~删除线~~、`代码`
- **列表**: 有序列表、无序列表
- **代码块**: 支持语法高亮
- **引用**: 引用块
- **图片**: 直接插入图片
- **链接**: 自动识别链接
- **分割线**: 分割线

### 发布文章

1. 文章编写完成后
2. 返回数据库视图
3. 勾选 **"Published"** 字段
4. 文章将自动出现在您的网站上

## 🔒 安全建议

### 生产环境配置

目前的配置方式仅适用于个人网站。如果需要更高的安全性：

1. **环境变量方式**：
   - 创建 `.env` 文件
   - 将API密钥存储在环境变量中
   - 使用构建工具注入配置

2. **后端代理方式**：
   - 创建简单的后端API
   - 在后端调用Notion API
   - 前端通过您的API获取数据

3. **静态生成方式**：
   - 使用构建时生成静态文件
   - 定期重新构建网站

### API密钥保护

- ✅ API密钥仅在客户端使用（个人网站可接受）
- ✅ 确保Integration权限最小化
- ✅ 定期更换API密钥
- ❌ 不要在公共仓库中提交API密钥

## 🚀 使用技巧

### 文章管理

1. **草稿管理**: 不勾选Published的文章为草稿
2. **标签分类**: 使用Tags进行内容分类
3. **发布计划**: 设置未来的PublishDate实现定时发布
4. **内容更新**: 直接在Notion中修改，网站会自动同步

### 性能优化

1. **图片优化**: 使用压缩后的图片
2. **内容长度**: 合理控制文章长度
3. **缓存策略**: 浏览器会缓存已加载的内容

## 🛠️ 故障排除

### 常见问题

**Q: 页面显示"配置帮助"信息**
- A: 检查API密钥和数据库ID是否正确设置

**Q: 文章列表为空**
- A: 确保至少有一篇文章的Published字段被勾选

**Q: 文章内容加载失败**
- A: 检查Integration是否有权限访问对应页面

**Q: CORS错误**
- A: 这是正常的，Notion API需要在HTTPS环境下访问

### 调试方法

1. 打开浏览器开发者工具
2. 查看Console面板的错误信息
3. 检查Network面板的API请求
4. 验证API密钥和数据库ID格式

## 📞 技术支持

如需帮助，请检查：
1. Notion Integration配置是否正确
2. 数据库字段名称是否匹配
3. API密钥是否有效
4. 网络连接是否正常

---

现在您可以在Notion中愉快地编写技术博客了！🎉