// Notion API 配置文件
// 请复制此文件并重命名为 notion-config.js，然后填入您的实际配置

const NOTION_CONFIG = {
    // 您的Notion Integration API Key
    // 在 https://www.notion.so/my-integrations 中创建Integration后获取
    apiKey: 'YOUR_NOTION_API_KEY',
    
    // 您的博客数据库ID
    // 在Notion数据库页面URL中找到：https://notion.so/YOUR_DATABASE_ID?v=...
    databaseId: 'YOUR_DATABASE_ID'
};

// 如果配置文件存在，自动设置服务
if (typeof notionBlogService !== 'undefined') {
    notionBlogService.setConfig(NOTION_CONFIG.apiKey, NOTION_CONFIG.databaseId);
}

/* 
数据库字段设置指南：

在Notion中创建数据库时，请确保包含以下字段：

1. Title (title) - 标题
   - 类型：Title
   - 这是默认的标题字段

2. Summary (rich_text) - 摘要  
   - 类型：Text
   - 用于文章列表页面的简介

3. Tags (multi_select) - 标签
   - 类型：Multi-select
   - 添加选项如：JavaScript、React、区块链等

4. Category (select) - 分类
   - 类型：Select  
   - 添加选项如：技术、教程、思考等

5. Published (checkbox) - 发布状态
   - 类型：Checkbox
   - 勾选表示已发布，会在网站显示

6. PublishDate (date) - 发布日期
   - 类型：Date
   - 用于文章排序

7. ReadTime (rich_text) - 阅读时间
   - 类型：Text
   - 例如：5分钟、10分钟等

注意事项：
- 字段名称必须与上述保持一致（区分大小写）
- 文章内容直接在页面中编写，支持Notion的所有格式
- 只有Published字段勾选的文章才会显示在网站上
- 确保Integration有权限访问您的数据库
*/