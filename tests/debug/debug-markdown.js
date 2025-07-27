/**
 * Markdown渲染调试脚本
 * 用于测试博客详情页面的markdown解析和渲染
 */

// 测试markdown内容
const testMarkdown = `
# 测试文章标题

这是一段测试内容，包含**粗体文字**和*斜体文字*。

## 代码示例

\`\`\`javascript
function hello() {
    console.log("Hello, World!");
    return "success";
}
\`\`\`

## 列表示例

- 第一个列表项
- 第二个列表项
- 第三个列表项

## 引用示例

> 这是一个引用块
> 它可以包含多行内容

## 链接示例

[这是一个链接](https://example.com)

## 内联代码

这是 \`console.log()\` 内联代码示例。
`;

async function debugMarkdownRendering() {
    console.log('🔍 开始调试Markdown渲染...');
    
    // 1. 测试ContentParser是否可以正确导入
    try {
        console.log('📦 导入ContentParser...');
        const { ContentParser } = await import('./src/utils/contentParser.js');
        console.log('✅ ContentParser导入成功');
        
        // 2. 创建ContentParser实例
        const parser = new ContentParser();
        console.log('✅ ContentParser实例创建成功');
        
        // 3. 测试parseMarkdown方法
        console.log('🔄 测试parseMarkdown方法...');
        const htmlResult = parser.parseMarkdown(testMarkdown);
        console.log('📄 原始Markdown:', testMarkdown);
        console.log('🎨 解析后的HTML:', htmlResult);
        
        // 4. 检查HTML是否包含预期的标签
        const expectedTags = ['<h1>', '<h2>', '<p>', '<code>', '<strong>', '<em>', '<ul>', '<li>', '<blockquote>', '<a>'];
        const foundTags = expectedTags.filter(tag => htmlResult.includes(tag));
        console.log('🏷️  找到的HTML标签:', foundTags);
        console.log('❌ 缺失的HTML标签:', expectedTags.filter(tag => !htmlResult.includes(tag)));
        
        // 5. 模拟博客详情页面的渲染过程
        console.log('🎭 模拟博客详情页面渲染...');
        
        // 创建一个测试容器
        const testContainer = document.createElement('div');
        testContainer.className = 'blog-article-content markdown-content';
        testContainer.innerHTML = htmlResult;
        
        // 添加到页面中进行视觉检查
        testContainer.style.cssText = `
            position: fixed;
            top: 50px;
            right: 50px;
            width: 400px;
            height: 600px;
            background: rgba(26, 26, 46, 0.95);
            border: 2px solid #00ffff;
            border-radius: 8px;
            padding: 20px;
            color: white;
            overflow-y: auto;
            z-index: 10000;
            font-size: 14px;
            line-height: 1.6;
        `;
        
        // 添加关闭按钮
        const closeBtn = document.createElement('button');
        closeBtn.textContent = '关闭调试窗口';
        closeBtn.style.cssText = `
            position: absolute;
            top: 10px;
            right: 10px;
            background: #ff4444;
            color: white;
            border: none;
            padding: 5px 10px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
        `;
        closeBtn.onclick = () => testContainer.remove();
        
        testContainer.appendChild(closeBtn);
        document.body.appendChild(testContainer);
        
        console.log('✅ 调试窗口已添加到页面右侧');
        
        return {
            success: true,
            parser,
            originalMarkdown: testMarkdown,
            htmlResult,
            foundTags,
            testContainer
        };
        
    } catch (error) {
        console.error('❌ 调试过程中出现错误:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// 检查BlogComponent中的内容更新方法
async function debugBlogComponent() {
    console.log('🔍 调试BlogComponent...');
    
    try {
        // 检查BlogComponent是否存在
        if (window.blogApp && window.blogApp.blogComponent) {
            const blogComponent = window.blogApp.blogComponent;
            console.log('✅ 找到BlogComponent实例');
            
            // 测试updateDetailPageContent方法
            const testBlog = {
                id: 'test-123',
                title: 'Markdown测试文章',
                category: '技术',
                publishDate: '2025-01-20',
                readTime: '5分钟'
            };
            
            const testHtmlContent = `
                <h1>测试标题</h1>
                <p>这是一段<strong>粗体</strong>文字。</p>
                <code>console.log('test')</code>
            `;
            
            // 创建模拟的详情页面容器
            const mockContainer = document.createElement('div');
            mockContainer.className = 'blog-detail-content';
            document.body.appendChild(mockContainer);
            
            // 调用updateDetailPageContent方法
            blogComponent.updateDetailPageContent(testBlog, testHtmlContent);
            
            console.log('✅ updateDetailPageContent方法调用完成');
            console.log('📄 容器内容:', mockContainer.innerHTML);
            
            // 检查是否包含HTML标签
            const containerHasHtml = mockContainer.innerHTML.includes('<h1>') && 
                                   mockContainer.innerHTML.includes('<strong>') &&
                                   mockContainer.innerHTML.includes('<code>');
            
            console.log('🎨 容器是否包含HTML标签:', containerHasHtml);
            
            // 清理
            setTimeout(() => mockContainer.remove(), 5000);
            
            return {
                success: true,
                containerHasHtml,
                containerContent: mockContainer.innerHTML
            };
            
        } else {
            console.warn('⚠️  未找到BlogComponent实例');
            return {
                success: false,
                error: 'BlogComponent实例未找到'
            };
        }
        
    } catch (error) {
        console.error('❌ 调试BlogComponent时出现错误:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// 综合调试函数
async function runFullDebug() {
    console.log('🚀 开始完整的Markdown渲染调试...');
    
    const results = {
        contentParser: await debugMarkdownRendering(),
        blogComponent: await debugBlogComponent()
    };
    
    console.log('📊 调试结果汇总:', results);
    
    // 生成调试报告
    const report = `
=== Markdown渲染调试报告 ===

ContentParser测试:
- 导入成功: ${results.contentParser.success}
- HTML标签解析: ${results.contentParser.foundTags ? results.contentParser.foundTags.length + '个标签' : '失败'}

BlogComponent测试:
- 实例存在: ${results.blogComponent.success}
- HTML渲染: ${results.blogComponent.containerHasHtml ? '正常' : '异常'}

问题诊断:
${!results.contentParser.success ? '- ContentParser导入或初始化失败' : ''}
${!results.blogComponent.success ? '- BlogComponent实例未找到' : ''}
${results.blogComponent.success && !results.blogComponent.containerHasHtml ? '- HTML内容被错误转义或过滤' : ''}

建议解决方案:
1. 确保ContentParser正确导入和使用
2. 检查updateDetailPageContent方法中的内容处理
3. 验证CSS样式是否正确应用
    `;
    
    console.log(report);
    
    return results;
}

// 如果在浏览器环境中，添加到全局作用域
if (typeof window !== 'undefined') {
    window.debugMarkdown = {
        debugMarkdownRendering,
        debugBlogComponent,
        runFullDebug
    };
    
    console.log('🛠️  调试工具已准备就绪！');
    console.log('使用方法:');
    console.log('- debugMarkdown.runFullDebug() - 运行完整调试');
    console.log('- debugMarkdown.debugMarkdownRendering() - 测试ContentParser');
    console.log('- debugMarkdown.debugBlogComponent() - 测试BlogComponent');
}

export { debugMarkdownRendering, debugBlogComponent, runFullDebug };