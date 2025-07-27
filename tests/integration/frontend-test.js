// 前端测试脚本 - 在浏览器控制台运行
console.log('🧪 Testing frontend Notion integration...');

// 测试配置
import('/src/config/index.js').then(({ config }) => {
  console.log('✅ Config loaded');
  console.log('Notion configured:', config.isNotionConfigured());
  console.log('Database ID:', config.notion.databaseId);
  console.log('Base URL:', config.notion.baseUrl);
  
  // 测试API客户端
  return import('/src/utils/apiClient.js');
}).then(({ ApiClient }) => {
  console.log('✅ API Client loaded');
  
  const client = new ApiClient();
  
  // 测试数据库查询
  return client.post('/databases/22e64c0b37ed80d3bf96e7fcea7efa10/query', {
    filter: {
      property: 'Published',
      checkbox: {
        equals: true
      }
    },
    page_size: 5
  });
}).then(response => {
  console.log('✅ API request successful!');
  console.log('Results:', response.results.length);
  
  if (response.results.length > 0) {
    console.log('📄 Found articles:');
    response.results.forEach((page, index) => {
      const title = page.properties.Title?.title?.[0]?.plain_text || 'No title';
      const published = page.properties.Published?.checkbox || false;
      console.log(`${index + 1}. ${title} (Published: ${published})`);
    });
  }
  
}).catch(error => {
  console.error('❌ Test failed:', error);
});

console.log('Test initiated. Check results above...');