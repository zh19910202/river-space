// 全面诊断脚本 - 在浏览器控制台运行
console.log('🔍 开始全面诊断...\n');

async function fullDiagnosis() {
  // 1. 检查环境
  console.log('1️⃣ 环境检查:');
  console.log('   当前URL:', window.location.href);
  console.log('   开发模式:', import.meta?.env?.DEV);
  
  // 2. 检查配置
  console.log('\n2️⃣ 配置检查:');
  try {
    const { config } = await import('/src/config/index.js');
    console.log('   ✅ 配置加载成功');
    console.log('   API Key:', config.notion.apiKey ? `${config.notion.apiKey.substring(0,10)}...` : '❌ 未配置');
    console.log('   Database ID:', config.notion.databaseId);
    console.log('   Base URL:', config.notion.baseUrl);
    console.log('   已配置:', config.isNotionConfigured());
  } catch (error) {
    console.error('   ❌ 配置加载失败:', error);
    return;
  }
  
  // 3. 测试代理连通性
  console.log('\n3️⃣ 代理连通性测试:');
  try {
    const testResponse = await fetch('/api/notion/', {
      method: 'GET'
    });
    console.log('   代理状态:', testResponse.status);
  } catch (error) {
    console.error('   ❌ 代理连接失败:', error);
  }
  
  // 4. 测试完整API调用
  console.log('\n4️⃣ 完整API调用测试:');
  try {
    const response = await fetch('/api/notion/databases/22e64c0b37ed80d3bf96e7fcea7efa10/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        filter: {
          property: 'Published',
          checkbox: { equals: true }
        },
        page_size: 1
      })
    });
    
    console.log('   响应状态:', response.status, response.statusText);
    console.log('   响应头:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const data = await response.json();
      console.log('   ✅ API调用成功');
      console.log('   数据类型:', typeof data);
      console.log('   结果数量:', data.results?.length || 0);
      
      if (data.results && data.results.length > 0) {
        const firstResult = data.results[0];
        console.log('   第一条数据:', {
          id: firstResult.id,
          title: firstResult.properties?.Title?.title?.[0]?.plain_text,
          published: firstResult.properties?.Published?.checkbox
        });
      }
    } else {
      const errorText = await response.text();
      console.error('   ❌ API调用失败:', errorText);
    }
    
  } catch (error) {
    console.error('   ❌ API调用异常:', error);
  }
  
  // 5. 检查BlogApp状态
  console.log('\n5️⃣ BlogApp状态检查:');
  if (window.blogApp) {
    console.log('   ✅ BlogApp已初始化');
    console.log('   BlogComponent:', !!window.blogApp.blogComponent);
    console.log('   容器元素:', !!document.getElementById('blog-container'));
    console.log('   当前博客数量:', window.blogApp.blogComponent?.blogs?.length || 0);
  } else {
    console.log('   ❌ BlogApp未初始化');
  }
  
  console.log('\n🎯 诊断完成！');
}

// 运行诊断
fullDiagnosis();