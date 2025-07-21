// 简单的markdown渲染调试脚本
// 在浏览器控制台中运行: 复制粘贴这段代码并执行

(function() {
    console.log('🔧 开始Markdown渲染调试...');
    
    // 测试内容
    const testMarkdown = `# 测试标题

这是一个**粗体**和*斜体*的测试。

## 代码测试

\`\`\`javascript
function hello() {
    console.log("Hello World");
}
\`\`\`

## 列表测试

- 项目1
- 项目2

1. 有序1
2. 有序2

> 引用测试

[链接测试](https://example.com)`;

    console.log('📝 测试内容:', testMarkdown);
    
    // 检查marked是否可用
    if (typeof marked !== 'undefined') {
        console.log('✅ marked库已加载');
        try {
            const result = marked.parse(testMarkdown);
            console.log('✅ marked解析成功');
            console.log('📄 解析结果:', result);
            
            // 在页面中显示结果
            const testDiv = document.createElement('div');
            testDiv.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                width: 400px;
                max-height: 500px;
                background: #1a1a2e;
                color: white;
                border: 2px solid #00ffff;
                border-radius: 8px;
                padding: 20px;
                overflow-y: auto;
                z-index: 10000;
                font-family: Arial, sans-serif;
            `;
            testDiv.innerHTML = `
                <h3 style="color: #00ffff; margin-top: 0;">🧪 Markdown测试结果</h3>
                <div style="background: #0f3460; padding: 10px; border-radius: 4px;">
                    ${result}
                </div>
                <button onclick="this.parentElement.remove()" style="
                    background: #ff4444;
                    color: white;
                    border: none;
                    padding: 5px 10px;
                    border-radius: 4px;
                    cursor: pointer;
                    margin-top: 10px;
                ">关闭</button>
            `;
            document.body.appendChild(testDiv);
            
        } catch (error) {
            console.error('❌ marked解析失败:', error);
        }
    } else {
        console.log('❌ marked库未加载');
    }
    
    // 检查ContentParser
    if (typeof ContentParser !== 'undefined') {
        console.log('✅ ContentParser类可用');
        try {
            const parser = new ContentParser();
            const result = parser.parseMarkdown(testMarkdown);
            console.log('✅ ContentParser解析成功');
            console.log('📄 ContentParser结果:', result);
        } catch (error) {
            console.error('❌ ContentParser解析失败:', error);
        }
    } else {
        console.log('❌ ContentParser类不可用');
    }
    
    // 检查BlogComponent
    if (typeof BlogComponent !== 'undefined') {
        console.log('✅ BlogComponent类可用');
    } else {
        console.log('❌ BlogComponent类不可用');
    }
    
    console.log('🔧 调试完成');
})();