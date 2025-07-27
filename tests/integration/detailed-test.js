import dotenv from 'dotenv';
import { Client } from '@notionhq/client';

dotenv.config();

const notion = new Client({ auth: process.env.VITE_NOTION_API_KEY });

(async () => {
    console.log('🔍 Detailed Notion Integration Test\n');
    
    // 1. 测试API Key是否有效
    try {
        console.log('1️⃣ Testing API Key validity...');
        const user = await notion.users.me();
        console.log('✅ API Key valid');
        console.log(`   User: ${user.name || 'No name'}`);
        console.log(`   Type: ${user.type}`);
        console.log(`   ID: ${user.id}`);
    } catch (error) {
        console.log('❌ API Key invalid:', error.message);
        return;
    }
    
    // 2. 列出所有可访问的内容
    try {
        console.log('\n2️⃣ Listing all accessible content...');
        const search = await notion.search({});
        console.log(`   Found ${search.results.length} items total`);
        
        const databases = search.results.filter(item => item.object === 'database');
        const pages = search.results.filter(item => item.object === 'page');
        
        console.log(`   - ${databases.length} databases`);
        console.log(`   - ${pages.length} pages`);
        
        if (databases.length > 0) {
            console.log('\n📊 Accessible Databases:');
            databases.forEach((db, index) => {
                console.log(`   ${index + 1}. ${db.title?.[0]?.plain_text || 'Untitled'}`);
                console.log(`      ID: ${db.id}`);
                console.log(`      Created: ${db.created_time}`);
            });
        }
        
        if (pages.length > 0) {
            console.log('\n📄 Accessible Pages:');
            pages.slice(0, 5).forEach((page, index) => {
                console.log(`   ${index + 1}. ${page.properties?.title?.title?.[0]?.plain_text || 'Untitled'}`);
                console.log(`      ID: ${page.id}`);
            });
        }
        
    } catch (error) {
        console.log('❌ Search failed:', error.message);
    }
    
    // 3. 测试目标数据库
    try {
        console.log('\n3️⃣ Testing target database...');
        console.log(`   Database ID: ${process.env.VITE_NOTION_DATABASE_ID}`);
        
        const response = await notion.databases.query({
            database_id: process.env.VITE_NOTION_DATABASE_ID,
            page_size: 1
        });
        
        console.log('✅ Target database accessible!');
        console.log(`   Results: ${response.results.length}`);
        
    } catch (error) {
        console.log('❌ Target database not accessible:', error.message);
        console.log(`   Error code: ${error.code}`);
    }
    
    console.log('\n🎯 Diagnosis:');
    if (databases.length === 0) {
        console.log('   - Integration can connect but has no database access');
        console.log('   - Check if databases are shared with your integration');
        console.log('   - Verify integration permissions in Notion settings');
    } else {
        console.log('   - Integration can access some databases');
        console.log('   - Target database might not be shared or ID is incorrect');
    }
})();