import dotenv from 'dotenv';
import { Client } from '@notionhq/client';

dotenv.config();

const notion = new Client({ auth: process.env.VITE_NOTION_API_KEY });

// 测试两种ID格式
const originalId = process.env.VITE_NOTION_DATABASE_ID;
const formattedId = originalId.replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, '$1-$2-$3-$4-$5');

console.log('Testing both ID formats...\n');

async function testId(id, label) {
    try {
        console.log(`🧪 Testing ${label}: ${id}`);
        const response = await notion.databases.query({
            database_id: id,
        });
        
        console.log(`✅ ${label} SUCCESS!`);
        console.log(`   Found ${response.results.length} items`);
        return response;
        
    } catch (error) {
        console.log(`❌ ${label} failed: ${error.message}`);
        return null;
    }
}

(async () => {
    const result1 = await testId(originalId, 'Original format');
    const result2 = await testId(formattedId, 'Formatted format');
    
    if (!result1 && !result2) {
        console.log('\n🔍 Both formats failed. Let me try listing all accessible databases...');
        
        try {
            const search = await notion.search({
                filter: {
                    value: 'database',
                    property: 'object'
                }
            });
            
            console.log(`\n📊 Found ${search.results.length} accessible databases:`);
            search.results.forEach((db, index) => {
                console.log(`${index + 1}. ${db.title?.[0]?.plain_text || 'Untitled'}`);
                console.log(`   ID: ${db.id}`);
                console.log(`   URL: ${db.url}`);
                console.log('');
            });
            
        } catch (error) {
            console.log('❌ Could not list databases:', error.message);
        }
    }
})();