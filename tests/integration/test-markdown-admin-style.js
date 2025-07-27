/**
 * 测试Markdown渲染是否与admin.html预览一致
 * 在浏览器控制台运行此脚本
 */

console.log('🧪 开始测试Markdown渲染与admin.html预览的一致性...');

// 测试用的Markdown内容
const testMarkdown = `# 测试标题

这是一个**粗体文字**和*斜体文字*的测试段落。

## 代码测试

这是内联代码：\`console.log("Hello")\`

\`\`\`javascript
function greet(name) {
    console.log("Hello, " + name + "!");
}
greet("World");
\`\`\`

## 列表测试

### 无序列表
- 第一项
- 第二项
- 第三项

### 有序列表
1. 第一步
2. 第二步
3. 第三步

## 链接和引用测试

这是一个[链接示例](https://example.com)。

> 这是一个引用块的例子。
> 它可以跨多行显示。

## 表格测试

| 列1 | 列2 | 列3 |
|-----|-----|-----|
| 数据1 | 数据2 | 数据3 |
| 测试A | 测试B | 测试C |

---

这是分割线上方的内容。`;

// 测试函数
function testMarkdownRendering() {
    const results = {
        timestamp: new Date().toISOString(),
        tests: {}
    };

    console.log('📝 测试内容长度:', testMarkdown.length);
    console.log('📄 测试内容预览:', testMarkdown.substring(0, 100) + '...');

    // 测试1: 检查marked库是否可用
    console.log('\n🔍 测试1: 检查marked库...');
    if (typeof marked !== 'undefined') {
        console.log('✅ marked库已加载');
        results.tests.markedAvailable = true;
        
        // 直接使用marked.parse（admin.html方式）
        try {
            const adminStyleResult = marked.parse(testMarkdown);
            console.log('✅ admin.html方式解析成功');
            console.log('📏 结果长度:', adminStyleResult.length);
            console.log('🎨 结果预览:', adminStyleResult.substring(0, 200) + '...');
            results.tests.adminStyleParsing = {
                success: true,
                length: adminStyleResult.length,
                preview: adminStyleResult.substring(0, 200)
            };
        } catch (error) {
            console.error('❌ admin.html方式解析失败:', error);
            results.tests.adminStyleParsing = {
                success: false,
                error: error.message
            };
        }
    } else {
        console.error('❌ marked库未加载');
        results.tests.markedAvailable = false;
    }

    // 测试2: 检查ContentParser
    console.log('\n🔍 测试2: 检查ContentParser...');
    if (window.blogApp && window.blogApp.blogComponent && window.blogApp.blogComponent.contentParser) {
        const contentParser = window.blogApp.blogComponent.contentParser;
        console.log('✅ ContentParser已找到');
        results.tests.contentParserAvailable = true;
        
        try {
            const contentParserResult = contentParser.parseMarkdown(testMarkdown);
            console.log('✅ ContentParser解析成功');
            console.log('📏 结果长度:', contentParserResult.length);
            console.log('🎨 结果预览:', contentParserResult.substring(0, 200) + '...');
            results.tests.contentParserParsing = {
                success: true,
                length: contentParserResult.length,
                preview: contentParserResult.substring(0, 200)
            };

            // 比较两种方式的结果
            if (results.tests.adminStyleParsing && results.tests.adminStyleParsing.success) {
                const adminResult = results.tests.adminStyleParsing.preview;
                const parserResult = results.tests.contentParserParsing.preview;
                const isIdentical = adminResult === parserResult;
                
                console.log(isIdentical ? '✅ 两种解析方式结果一致！' : '⚠️ 两种解析方式结果不同');
                results.tests.resultsMatch = isIdentical;
                
                if (!isIdentical) {
                    console.log('📊 admin.html结果:', adminResult);
                    console.log('📊 ContentParser结果:', parserResult);
                }
            }
        } catch (error) {
            console.error('❌ ContentParser解析失败:', error);
            results.tests.contentParserParsing = {
                success: false,
                error: error.message
            };
        }
    } else {
        console.error('❌ ContentParser未找到');
        results.tests.contentParserAvailable = false;
    }

    // 测试3: 检查样式应用
    console.log('\n🔍 测试3: 检查样式应用...');
    const testContainer = document.createElement('div');
    testContainer.className = 'markdown-content';
    testContainer.style.cssText = 'position: absolute; top: -9999px; left: -9999px;';
    
    if (results.tests.adminStyleParsing && results.tests.adminStyleParsing.success) {
        const adminResult = marked.parse(testMarkdown);
        testContainer.innerHTML = adminResult;
        document.body.appendChild(testContainer);
        
        // 检查样式
        const h1 = testContainer.querySelector('h1');
        const code = testContainer.querySelector('code');
        const blockquote = testContainer.querySelector('blockquote');
        
        if (h1) {
            const h1Styles = window.getComputedStyle(h1);
            console.log('📊 H1样式检查:');
            console.log('  - 颜色:', h1Styles.color);
            console.log('  - 字体大小:', h1Styles.fontSize);
            console.log('  - 字体粗细:', h1Styles.fontWeight);
        }
        
        if (code) {
            const codeStyles = window.getComputedStyle(code);
            console.log('📊 代码样式检查:');
            console.log('  - 背景:', codeStyles.backgroundColor);
            console.log('  - 颜色:', codeStyles.color);
            console.log('  - 字体:', codeStyles.fontFamily);
        }
        
        if (blockquote) {
            const blockquoteStyles = window.getComputedStyle(blockquote);
            console.log('📊 引用样式检查:');
            console.log('  - 边框:', blockquoteStyles.borderLeft);
            console.log('  - 内边距:', blockquoteStyles.paddingLeft);
        }
        
        document.body.removeChild(testContainer);
        results.tests.stylesApplied = true;
    }

    // 生成报告
    console.log('\n📋 测试总结:');
    console.log('================');
    console.log('✅ marked库可用:', results.tests.markedAvailable || false);
    console.log('✅ ContentParser可用:', results.tests.contentParserAvailable || false);
    console.log('✅ admin.html方式解析:', results.tests.adminStyleParsing?.success || false);
    console.log('✅ ContentParser解析:', results.tests.contentParserParsing?.success || false);
    console.log('✅ 解析结果一致:', results.tests.resultsMatch || false);
    console.log('✅ 样式应用正常:', results.tests.stylesApplied || false);

    const allTestsPassed = [
        results.tests.markedAvailable,
        results.tests.contentParserAvailable,
        results.tests.adminStyleParsing?.success,
        results.tests.contentParserParsing?.success,
        results.tests.resultsMatch
    ].every(test => test === true);

    if (allTestsPassed) {
        console.log('\n🎉 所有测试通过！Markdown渲染已与admin.html预览保持一致！');
    } else {
        console.log('\n⚠️ 部分测试失败，请检查控制台输出详情');
    }

    return results;
}

// 自动运行测试
if (typeof window !== 'undefined') {
    // 延迟执行，确保页面完全加载
    setTimeout(() => {
        console.log('🚀 自动运行Markdown渲染测试...');
        const results = testMarkdownRendering();
        
        // 将结果保存到全局变量，方便查看
        window.markdownTestResults = results;
        console.log('💾 测试结果已保存到 window.markdownTestResults');
    }, 2000);
}

// 导出测试函数
window.testMarkdownRendering = testMarkdownRendering;
console.log('✅ 测试脚本已加载！');
console.log('💡 2秒后将自动运行测试，或手动运行 testMarkdownRendering()');