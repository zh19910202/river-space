import dotenv from 'dotenv';
import { Client } from '@notionhq/client';

dotenv.config();

const notion = new Client({ auth: process.env.VITE_NOTION_API_KEY });

(async () => {
    try {
        console.log('Testing Notion connection...');
        console.log('API Key:', process.env.VITE_NOTION_API_KEY ? 'configured' : 'missing');
        console.log('Database ID:', process.env.VITE_NOTION_DATABASE_ID ? 'configured' : 'missing');
        
        const response = await notion.databases.query({
            database_id: process.env.VITE_NOTION_DATABASE_ID,
        });
        
        console.log('\n✅ Connection successful!');
        console.log('Total results:', response.results.length);
        console.log('Has more:', response.has_more);
        
        if (response.results.length > 0) {
            console.log('\n📄 Articles found:');
            response.results.forEach((page, index) => {
                const title = page.properties.Title?.title?.[0]?.plain_text || 'No title';
                const published = page.properties.Published?.checkbox || false;
                const summary = page.properties.Summary?.rich_text?.[0]?.plain_text || 'No summary';
                const publishDate = page.properties.PublishDate?.date?.start || 'No date';
                
                console.log(`${index + 1}. ${title}`);
                console.log(`   Published: ${published ? '✅' : '❌'}`);
                console.log(`   Date: ${publishDate}`);
                console.log(`   Summary: ${summary.substring(0, 100)}...`);
                console.log('');
            });
            
            console.log('\n🔍 Database structure:');
            const properties = response.results[0]?.properties;
            if (properties) {
                Object.keys(properties).forEach(key => {
                    const prop = properties[key];
                    console.log(`   ${key}: ${prop.type}`);
                });
            }
        } else {
            console.log('\n📝 No articles found. Make sure:');
            console.log('- Database has content');
            console.log('- Published field is checked');
            console.log('- Database is shared with your integration');
        }
        
    } catch (error) {
        console.error('\n❌ Connection failed:');
        console.error('Error:', error.message);
        console.error('Code:', error.code);
        
        if (error.code === 'object_not_found') {
            console.error('\n💡 Solution: Make sure the database is shared with your Notion integration');
        } else if (error.code === 'unauthorized') {
            console.error('\n💡 Solution: Check your API key');
        }
    }
})();