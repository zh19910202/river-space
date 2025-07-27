import dotenv from 'dotenv';
import { Client } from '@notionhq/client';

dotenv.config();

const notion = new Client({ auth: process.env.VITE_NOTION_API_KEY });

(async () => {
    const response = await notion.databases.query({
        database_id: process.env.VITE_NOTION_DATABASE_ID,
    });
    
    console.log('=== DETAILED PROPERTIES ANALYSIS ===\n');
    
    response.results.forEach((page, index) => {
        console.log(`📄 Page ${index + 1}:`);
        console.log(`   ID: ${page.id}`);
        console.log(`   URL: ${page.url}`);
        console.log(`   Properties:`, JSON.stringify(page.properties, null, 2));
        console.log('---\n');
    });
})();