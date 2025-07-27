require('dotenv').config()
const express = require('express');
const cors = require('cors');
const { Client } = require('@notionhq/client');

const app = express();
const PORT = 3001;

// 初始化Notion客户端
const notion = new Client({ 
  auth: process.env.NOTION_API_KEY 
});

// 启用CORS
app.use(cors());
app.use(express.json());

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'Notion API Proxy' });
});

// 获取博客列表
app.get('/api/blogs', async (req, res) => {
  try {
    console.log('Fetching blog posts from Notion...');
    
    const response = await notion.databases.query({
      database_id: process.env.NOTION_DATABASE_ID,
      filter: {
        property: 'Published',
        checkbox: { equals: true }
      },
      sorts: [{
        property: 'Published Date',
        direction: 'descending'
      }]
    });
    
    // 格式化数据
    const blogs = response.results.map(page => ({
      id: page.id,
      title: extractText(page.properties.Title),
      summary: extractText(page.properties.Summary),
      category: extractSelect(page.properties.Category),
      tags: extractMultiSelect(page.properties.Tags),
      publishDate: extractDate(page.properties['Published Date']),
      readTime: extractText(page.properties.ReadTime) || '5分钟',
      url: page.url,
      createdTime: page.created_time,
      lastEditedTime: page.last_edited_time
    }));
    
    console.log(`Successfully fetched ${blogs.length} blog posts`);
    res.json({
      posts: blogs,
      total: blogs.length,
      hasMore: response.has_more,
      nextCursor: response.next_cursor
    });
    
  } catch (error) {
    console.error('Error fetching blogs:', error);
    res.status(500).json({ 
      error: 'Failed to fetch blogs',
      message: error.message 
    });
  }
});

// 获取单篇文章内容
app.get('/api/blogs/:pageId/content', async (req, res) => {
  try {
    const { pageId } = req.params;
    console.log(`Fetching content for page: ${pageId}`);
    
    // 获取页面属性
    const page = await notion.pages.retrieve({ page_id: pageId });
    
    // 检查是否有MarkdownURL
    const markdownUrl = extractMarkdownUrl(page.properties);
    
    if (markdownUrl) {
      // 如果有markdown URL，获取markdown内容
      const markdownResponse = await fetch(markdownUrl);
      const markdownContent = await markdownResponse.text();
      
      res.json({
        type: 'markdown',
        content: markdownContent,
        source: 'external_markdown'
      });
    } else {
      // 否则获取Notion块内容
      const blocks = await notion.blocks.children.list({
        block_id: pageId
      });
      
      res.json({
        type: 'notion_blocks',
        content: blocks.results,
        source: 'notion_blocks'
      });
    }
    
  } catch (error) {
    console.error('Error fetching blog content:', error);
    res.status(500).json({ 
      error: 'Failed to fetch blog content',
      message: error.message 
    });
  }
});

// 搜索文章
app.get('/api/blogs/search', async (req, res) => {
  try {
    const { q } = req.query;
    
    const response = await notion.search({
      query: q,
      filter: {
        value: 'page',
        property: 'object'
      }
    });
    
    res.json(response.results);
  } catch (error) {
    console.error('Error searching blogs:', error);
    res.status(500).json({ 
      error: 'Failed to search blogs',
      message: error.message 
    });
  }
});

// 辅助函数
function extractText(property) {
  if (!property) return '';
  if (property.rich_text) {
    return property.rich_text.map(text => text.plain_text).join('');
  }
  if (property.title) {
    return property.title.map(text => text.plain_text).join('');
  }
  return '';
}

function extractSelect(property) {
  if (!property || !property.select) return '';
  return property.select.name;
}

function extractMultiSelect(property) {
  if (!property || !property.multi_select) return [];
  return property.multi_select.map(option => option.name);
}

function extractDate(property) {
  if (!property || !property.date) return '';
  return new Date(property.date.start).toLocaleDateString('zh-CN');
}

function extractMarkdownUrl(properties) {
  const markdownFields = ['MarkdwonURL', 'MarkdownURL', 'markdownURL'];
  
  for (const fieldName of markdownFields) {
    const field = properties[fieldName];
    if (field && field.url) {
      return field.url;
    }
  }
  return null;
}

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 Notion API服务已启动:`);
  console.log(`   ➜ 本地地址: http://localhost:${PORT}`);
  console.log(`   ➜ 健康检查: http://localhost:${PORT}/health`);
  console.log(`   ➜ 博客API: http://localhost:${PORT}/api/blogs`);
  console.log('');
  console.log('📝 可用端点:');
  console.log('   GET  /api/blogs              - 获取博客列表');
  console.log('   GET  /api/blogs/:id/content  - 获取文章内容');
  console.log('   GET  /api/blogs/search?q=... - 搜索文章');
});

// 错误处理
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});