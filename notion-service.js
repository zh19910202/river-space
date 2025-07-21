// Notion API 服务类
class NotionBlogService {
    constructor() {
        // 注意：在生产环境中，API密钥应该通过环境变量或后端代理来管理
        // 这里为了演示，我们先使用这种方式
        this.apiKey = 'YOUR_NOTION_API_KEY'; // 替换为您的API密钥
        this.databaseId = 'YOUR_DATABASE_ID'; // 替换为您的数据库ID
        this.apiVersion = '2022-06-28';
        this.baseUrl = 'https://api.notion.com/v1';
    }

    // 设置API配置
    setConfig(apiKey, databaseId) {
        this.apiKey = apiKey;
        this.databaseId = databaseId;
    }

    // 获取请求头
    getHeaders() {
        return {
            'Authorization': `Bearer ${this.apiKey}`,
            'Notion-Version': this.apiVersion,
            'Content-Type': 'application/json'
        };
    }

    // 获取博客文章列表
    async getBlogPosts() {
        try {
            const response = await fetch(`${this.baseUrl}/databases/${this.databaseId}/query`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({
                    filter: {
                        property: 'Published',
                        checkbox: {
                            equals: true
                        }
                    },
                    sorts: [
                        {
                            property: 'PublishDate',
                            direction: 'descending'
                        }
                    ]
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return this.formatBlogList(data.results);
        } catch (error) {
            console.error('Error fetching blog posts:', error);
            throw error;
        }
    }

    // 获取单篇文章的详细内容
    async getBlogContent(pageId) {
        try {
            const response = await fetch(`${this.baseUrl}/blocks/${pageId}/children`, {
                method: 'GET',
                headers: this.getHeaders()
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return this.formatBlogContent(data.results);
        } catch (error) {
            console.error('Error fetching blog content:', error);
            throw error;
        }
    }

    // 格式化博客列表数据
    formatBlogList(results) {
        return results.map(page => {
            const properties = page.properties;
            return {
                id: page.id,
                title: this.extractText(properties.Title || properties.title),
                summary: this.extractText(properties.Summary || properties.summary),
                tags: this.extractMultiSelect(properties.Tags || properties.tags),
                category: this.extractSelect(properties.Category || properties.category),
                publishDate: this.extractDate(properties.PublishDate || properties.publishDate),
                readTime: this.extractText(properties.ReadTime || properties.readTime) || '5分钟',
                url: page.url
            };
        });
    }

    // 格式化博客内容
    formatBlogContent(blocks) {
        return blocks.map(block => this.parseBlock(block)).join('');
    }

    // 解析Notion块为HTML
    parseBlock(block) {
        const { type } = block;
        const content = block[type];

        switch (type) {
            case 'paragraph':
                return `<p>${this.parseRichText(content.rich_text)}</p>`;
            
            case 'heading_1':
                return `<h1>${this.parseRichText(content.rich_text)}</h1>`;
            
            case 'heading_2':
                return `<h2>${this.parseRichText(content.rich_text)}</h2>`;
            
            case 'heading_3':
                return `<h3>${this.parseRichText(content.rich_text)}</h3>`;
            
            case 'bulleted_list_item':
                return `<li>${this.parseRichText(content.rich_text)}</li>`;
            
            case 'numbered_list_item':
                return `<li>${this.parseRichText(content.rich_text)}</li>`;
            
            case 'code':
                const language = content.language || '';
                const code = this.parseRichText(content.rich_text);
                return `<pre><code class="language-${language}">${code}</code></pre>`;
            
            case 'quote':
                return `<blockquote>${this.parseRichText(content.rich_text)}</blockquote>`;
            
            case 'divider':
                return '<hr>';
            
            case 'image':
                const imageUrl = content.file?.url || content.external?.url;
                const caption = content.caption ? this.parseRichText(content.caption) : '';
                return `<img src="${imageUrl}" alt="${caption}" />`;
            
            default:
                return `<p>${this.parseRichText(content.rich_text || [])}</p>`;
        }
    }

    // 解析富文本
    parseRichText(richText) {
        if (!richText || !Array.isArray(richText)) return '';
        
        return richText.map(text => {
            let content = text.plain_text;
            
            if (text.annotations) {
                const { bold, italic, strikethrough, underline, code } = text.annotations;
                
                if (code) content = `<code>${content}</code>`;
                if (bold) content = `<strong>${content}</strong>`;
                if (italic) content = `<em>${content}</em>`;
                if (strikethrough) content = `<del>${content}</del>`;
                if (underline) content = `<u>${content}</u>`;
            }
            
            if (text.href) {
                content = `<a href="${text.href}" target="_blank">${content}</a>`;
            }
            
            return content;
        }).join('');
    }

    // 辅助方法：提取文本
    extractText(property) {
        if (!property) return '';
        if (property.rich_text) {
            return property.rich_text.map(text => text.plain_text).join('');
        }
        if (property.title) {
            return property.title.map(text => text.plain_text).join('');
        }
        return '';
    }

    // 辅助方法：提取多选
    extractMultiSelect(property) {
        if (!property || !property.multi_select) return [];
        return property.multi_select.map(option => option.name);
    }

    // 辅助方法：提取选择
    extractSelect(property) {
        if (!property || !property.select) return '';
        return property.select.name;
    }

    // 辅助方法：提取日期
    extractDate(property) {
        if (!property || !property.date) return '';
        return new Date(property.date.start).toLocaleDateString('zh-CN');
    }
}

// 导出服务实例
const notionBlogService = new NotionBlogService();