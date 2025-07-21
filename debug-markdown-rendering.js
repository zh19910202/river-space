/**
 * Markdown渲染调试脚本 - 修复版本
 * 用于诊断和修复博客详情页面的markdown渲染问题
 */

// 在浏览器控制台运行这个脚本来调试markdown渲染问题

function debugMarkdownRendering() {
    console.log('🔍 开始调试Markdown渲染问题...');
    
    const results = {
        timestamp: new Date().toISOString(),
        checks: {},
        recommendations: []
    };
    
    // 1. 检查ContentParser
    console.log('📦 检查ContentParser...');
    try {
        if (window.contentParser || (window.blogApp && window.blogApp.blogComponent && window.blogApp.blogComponent.contentParser)) {
            const parser = window.contentParser || window.blogApp.blogComponent.contentParser;
            results.checks.contentParser = {
                available: true,
                hasParseMarkdown: typeof parser.parseMarkdown === 'function',
                isConfigured: parser.constructor.name === 'ContentParser'
            };
            console.log('✅ ContentParser可用');
        } else {
            results.checks.contentParser = {
                available: false,
                error: 'ContentParser实例未找到'
            };
            console.log('❌ ContentParser不可用');
            results.recommendations.push('确保ContentParser正确导入和初始化');
        }
    } catch (error) {
        results.checks.contentParser = {
            available: false,
            error: error.message
        };
        console.error('❌ ContentParser检查失败:', error);
    }
    
    // 2. 检查BlogComponent
    console.log('🧩 检查BlogComponent...');
    try {
        if (window.blogApp && window.blogApp.blogComponent) {
            const blogComp = window.blogApp.blogComponent;
            results.checks.blogComponent = {
                available: true,
                hasUpdateMethod: typeof blogComp.updateDetailPageContent === 'function',
                hasContentParser: !!blogComp.contentParser,
                hasParseMethod: typeof blogComp.parseAsMarkdownSafe === 'function'
            };
            console.log('✅ BlogComponent可用');
        } else {
            results.checks.blogComponent = {
                available: false,
                error: 'BlogComponent实例未找到'
            };
            console.log('❌ BlogComponent不可用');
            results.recommendations.push('确保BlogComponent正确初始化');
        }
    } catch (error) {
        results.checks.blogComponent = {
            available: false,
            error: error.message
        };
        console.error('❌ BlogComponent检查失败:', error);
    }
    
    // 3. 检查DOM中的内容
    console.log('🎭 检查页面中的markdown内容...');
    const markdownContainers = document.querySelectorAll('.markdown-content');
    results.checks.domContent = {
        markdownContainers: markdownContainers.length,
        containers: []
    };
    
    markdownContainers.forEach((container, index) => {
        const content = container.innerHTML;
        const analysis = {
            index,
            hasContent: content.length > 0,
            hasHtmlTags: content.includes('<') && content.includes('>'),
            hasEscapedHtml: content.includes('&lt;') || content.includes('&gt;'),
            hasMarkdownSyntax: content.includes('**') || content.includes('##') || content.includes('```'),
            contentLength: content.length,
            contentPreview: content.substring(0, 100) + (content.length > 100 ? '...' : '')
        };
        
        results.checks.domContent.containers.push(analysis);
        
        console.log(`📄 容器 ${index}:`, analysis);
        
        if (analysis.hasEscapedHtml) {
            console.log(`❌ 容器 ${index} 包含转义的HTML`);
            results.recommendations.push(`修复容器 ${index} 中的HTML转义问题`);
        }
        
        if (analysis.hasMarkdownSyntax && !analysis.hasHtmlTags) {
            console.log(`⚠️ 容器 ${index} 包含未解析的Markdown`);
            results.recommendations.push(`重新解析容器 ${index} 中的Markdown内容`);
        }
    });
    
    // 4. 测试Markdown解析
    console.log('🧪 测试Markdown解析...');
    const testMarkdown = `# 测试标题\n\n这是**粗体**和*斜体*文字。\n\n\`\`\`javascript\nconsole.log("test");\n\`\`\``;
    
    try {
        if (results.checks.contentParser.available) {
            const parser = window.contentParser || window.blogApp.blogComponent.contentParser;
            const htmlResult = parser.parseMarkdown(testMarkdown);
            
            results.checks.markdownTest = {
                success: true,
                inputLength: testMarkdown.length,
                outputLength: htmlResult.length,
                hasProperHtml: htmlResult.includes('<h1>') && htmlResult.includes('<strong>'),
                hasEscaping: htmlResult.includes('&lt;') || htmlResult.includes('&gt;'),
                result: htmlResult
            };
            
            console.log('✅ Markdown解析测试成功');
            console.log('📊 解析结果:', htmlResult.substring(0, 200) + '...');
            
            if (results.checks.markdownTest.hasEscaping) {
                console.log('❌ 解析结果包含HTML转义');
                results.recommendations.push('修复ContentParser中的HTML转义问题');
            }
        } else {
            results.checks.markdownTest = {
                success: false,
                error: 'ContentParser不可用'
            };
        }
    } catch (error) {
        results.checks.markdownTest = {
            success: false,
            error: error.message
        };
        console.error('❌ Markdown解析测试失败:', error);
    }
    
    // 5. 生成诊断报告
    console.log('📋 生成诊断报告...');
    
    const report = `
=== Markdown渲染诊断报告 ===
时间: ${results.timestamp}

组件状态:
- ContentParser: ${results.checks.contentParser.available ? '✅ 可用' : '❌ 不可用'}
- BlogComponent: ${results.checks.blogComponent.available ? '✅ 可用' : '❌ 不可用'}

DOM内容:
- Markdown容器数量: ${results.checks.domContent.markdownContainers}
- 有问题的容器: ${results.checks.domContent.containers.filter(c => c.hasEscapedHtml || (c.hasMarkdownSyntax && !c.hasHtmlTags)).length}

Markdown解析测试:
- 解析功能: ${results.checks.markdownTest?.success ? '✅ 正常' : '❌ 异常'}
- HTML转义: ${results.checks.markdownTest?.hasEscaping ? '❌ 有问题' : '✅ 正常'}

建议修复措施:
${results.recommendations.map(rec => `- ${rec}`).join('\n')}

${results.recommendations.length === 0 ? '🎉 未发现明显问题！' : ''}
    `;
    
    console.log(report);
    
    // 6. 提供修复函数
    window.fixMarkdownRendering = function() {
        console.log('🔧 尝试修复Markdown渲染问题...');
        
        const containers = document.querySelectorAll('.markdown-content');
        let fixCount = 0;
        
        containers.forEach((container, index) => {
            const content = container.innerHTML;
            
            // 检查是否需要修复
            if (content.includes('&lt;') || content.includes('&gt;')) {
                console.log(`🔧 修复容器 ${index} 中的HTML转义...`);
                
                // 简单的反转义
                const unescaped = content
                    .replace(/&lt;/g, '<')
                    .replace(/&gt;/g, '>')
                    .replace(/&amp;/g, '&');
                
                container.innerHTML = unescaped;
                fixCount++;
                console.log(`✅ 容器 ${index} 修复完成`);
            }
            
            // 检查是否有未解析的Markdown
            else if ((content.includes('**') || content.includes('##') || content.includes('```')) && !content.includes('<')) {
                console.log(`🔧 重新解析容器 ${index} 中的Markdown...`);
                
                try {
                    if (window.blogApp && window.blogApp.blogComponent && window.blogApp.blogComponent.contentParser) {
                        const parser = window.blogApp.blogComponent.contentParser;
                        const parsed = parser.parseMarkdown(content);
                        container.innerHTML = parsed;
                        fixCount++;
                        console.log(`✅ 容器 ${index} 重新解析完成`);
                    }
                } catch (error) {
                    console.error(`❌ 容器 ${index} 重新解析失败:`, error);
                }
            }
        });
        
        console.log(`🎉 修复完成！共修复了 ${fixCount} 个容器`);
        
        if (fixCount > 0) {
            console.log('💡 建议刷新页面以确保修复生效');
        }
    };
    
    console.log('🛠️ 调试完成！');
    console.log('💡 如果发现问题，可以运行 fixMarkdownRendering() 尝试修复');
    
    return results;
}

// 如果在浏览器环境中，自动运行
if (typeof window !== 'undefined') {
    window.debugMarkdownRendering = debugMarkdownRendering;
    
    // 延迟运行，确保页面完全加载
    setTimeout(() => {
        console.log('🔍 Markdown渲染调试工具已准备就绪！');
        console.log('运行 debugMarkdownRendering() 开始诊断');
        console.log('如果发现问题，运行 fixMarkdownRendering() 尝试修复');
    }, 1000);
}

export { debugMarkdownRendering };