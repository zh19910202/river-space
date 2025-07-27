// 测试Notion API连接
import { config } from '/src/config/index.js';
import { ApiClient } from '/src/utils/apiClient.js';

window.testNotionConnection = async function() {
  try {
    console.log('Testing Notion connection...');
    console.log('Config:', {
      apiKey: config.notion.apiKey ? 'configured' : 'missing',
      databaseId: config.notion.databaseId ? 'configured' : 'missing',
      baseUrl: config.notion.baseUrl
    });

    const client = new ApiClient();
    
    // 测试数据库查询
    const response = await client.post(`/databases/${config.notion.databaseId}/query`, {
      filter: {
        property: 'Published',
        checkbox: {
          equals: true
        }
      },
      page_size: 5
    });

    console.log('✅ Notion connection successful!');
    console.log('Found posts:', response.results.length);
    console.log('Posts:', response.results);
    
    return response;
  } catch (error) {
    console.error('❌ Notion connection failed:', error);
    throw error;
  }
};

console.log('Test function available: window.testNotionConnection()');