/**
 * 代码块复制功能
 * 为博客详情页面中的代码块添加复制按钮
 */

export class CodeBlockCopy {
    constructor() {
        this.copyButtonClass = 'code-copy-btn'
        this.copiedClass = 'copied'
        this.init()
    }

    /**
     * 初始化代码复制功能
     */
    init() {
        // 添加CSS样式
        this.addStyles()

        // 监听DOM变化，自动为新的代码块添加复制按钮
        this.observeCodeBlocks()
    }

    /**
     * 添加CSS样式 - 检查是否已在CSS文件中定义
     */
    addStyles() {
        const styleId = 'code-copy-styles'
        if (document.getElementById(styleId)) return

        // 检查是否已经存在静态CSS样式
        const existingStyles = document.querySelector('.code-copy-btn')
        if (existingStyles) {
            console.log('✅ 代码复制样式已通过CSS文件加载')
            return
        }

        // 如果没有静态样式，则动态添加（主要用于开发环境）
        const style = document.createElement('style')
        style.id = styleId
        style.textContent = `
      .code-block-wrapper {
        position: relative;
        margin: 16px 0;
        border-radius: 12px;
        overflow: hidden;
      }
      
      .code-copy-btn {
        position: absolute;
        top: 20px;
        right: 20px;
        background: none;
        color: rgba(255, 255, 255, 0.6);
        border: none;
        padding: 6px;
        cursor: pointer;
        transition: all 0.2s ease;
        z-index: 10;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0.6;
        border-radius: 4px;
      }
      
      .code-block-wrapper:hover .code-copy-btn {
        opacity: 1;
      }
      
      .code-copy-btn:hover {
        color: #00ffff;
      }
      
      .code-copy-btn.copied {
        color: #00ff80;
      }
      
      .code-copy-btn svg {
        width: 14px;
        height: 14px;
        fill: currentColor;
        transition: transform 0.2s ease;
      }
      
      .code-copy-btn:hover svg {
        transform: scale(1.1);
      }
      
      .copy-text {
        display: none;
      }
      
      /* 确保代码块有足够的右边距 */
      .code-block-wrapper pre {
        padding-right: 50px !important;
        position: relative;
      }
      
      /* Bash命令特殊样式 */
      .language-bash .code-copy-btn,
      .language-shell .code-copy-btn,
      .language-sh .code-copy-btn {
        color: rgba(0, 255, 255, 0.7);
      }
      
      .language-bash .code-copy-btn:hover,
      .language-shell .code-copy-btn:hover,
      .language-sh .code-copy-btn:hover {
        color: #00ffff;
      }
      
      /* 响应式调整 */
      @media (max-width: 768px) {
        .code-copy-btn {
          top: 16px;
          right: 16px;
          padding: 4px;
        }
        
        .code-copy-btn svg {
          width: 12px;
          height: 12px;
        }
        
        .code-block-wrapper pre {
          padding-right: 40px !important;
        }
      }
    `
        document.head.appendChild(style)
        console.log('✅ 动态添加代码复制样式')
    }

    /**
     * 监听DOM变化，为新的代码块添加复制按钮
     */
    observeCodeBlocks() {
        // 立即处理现有的代码块
        this.processExistingCodeBlocks()

        // 使用MutationObserver监听DOM变化
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        this.processCodeBlocks(node)
                    }
                })
            })
        })

        observer.observe(document.body, {
            childList: true,
            subtree: true
        })
    }

    /**
     * 处理现有的代码块
     */
    processExistingCodeBlocks() {
        this.processCodeBlocks(document.body)
    }

    /**
     * 处理指定元素内的代码块
     */
    processCodeBlocks(container) {
        const codeBlocks = container.querySelectorAll('pre code')
        codeBlocks.forEach(codeBlock => {
            this.addCopyButton(codeBlock)
        })
    }

    /**
     * 为代码块添加复制按钮
     */
    addCopyButton(codeElement) {
        const preElement = codeElement.parentElement
        if (!preElement || preElement.tagName !== 'PRE') return

        // 检查是否已经添加了复制按钮
        if (preElement.querySelector(`.${this.copyButtonClass}`)) return

        // 创建包装器
        let wrapper = preElement.parentElement
        if (!wrapper.classList.contains('code-block-wrapper')) {
            wrapper = document.createElement('div')
            wrapper.className = 'code-block-wrapper'
            preElement.parentNode.insertBefore(wrapper, preElement)
            wrapper.appendChild(preElement)
        }

        // 获取代码语言
        const language = this.getCodeLanguage(codeElement)
        const isBashCommand = this.isBashCommand(language, codeElement.textContent)

        // 创建复制按钮
        const copyButton = document.createElement('button')
        copyButton.className = this.copyButtonClass
        copyButton.innerHTML = this.getCopyIcon()

        // 添加点击事件
        copyButton.addEventListener('click', () => {
            this.copyCode(codeElement, copyButton, isBashCommand)
        })

        // 将按钮添加到包装器
        wrapper.appendChild(copyButton)
    }

    /**
     * 获取代码语言
     */
    getCodeLanguage(codeElement) {
        const classList = Array.from(codeElement.classList)
        const languageClass = classList.find(cls => cls.startsWith('language-'))
        return languageClass ? languageClass.replace('language-', '') : ''
    }

    /**
     * 判断是否为bash命令
     */
    isBashCommand(language, codeText) {
        const bashLanguages = ['bash', 'shell', 'sh', 'zsh', 'fish']
        if (bashLanguages.includes(language.toLowerCase())) return true

        // 检查代码内容是否包含常见的bash命令
        const bashPatterns = [
            /^\s*\$\s+/m,           // $ 提示符
            /^\s*(sudo|npm|yarn|git|cd|ls|mkdir|rm|cp|mv|chmod|chown)\s+/m,
            /^\s*[a-zA-Z0-9_-]+\s+--?[a-zA-Z]/m  // 命令行参数
        ]

        return bashPatterns.some(pattern => pattern.test(codeText))
    }

    /**
     * 复制代码到剪贴板
     */
    async copyCode(codeElement, button, isBashCommand) {
        let textToCopy = codeElement.textContent || codeElement.innerText

        // 如果是bash命令，清理提示符
        if (isBashCommand) {
            textToCopy = this.cleanBashCommand(textToCopy)
        }

        try {
            // 使用现代的Clipboard API
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(textToCopy)
            } else {
                // 回退到传统方法
                this.fallbackCopyTextToClipboard(textToCopy)
            }

            this.showCopySuccess(button, isBashCommand)
        } catch (err) {
            console.error('复制失败:', err)
            this.showCopyError(button)
        }
    }

    /**
     * 清理bash命令（移除提示符等）
     */
    cleanBashCommand(text) {
        return text
            // 移除 $ 提示符
            .replace(/^\s*\$\s+/gm, '')
            // 移除 # 注释行（可选）
            .replace(/^\s*#.*$/gm, '')
            // 移除空行
            .replace(/^\s*$/gm, '')
            // 清理多余的空白
            .trim()
    }

    /**
     * 传统的复制方法（兼容性）
     */
    fallbackCopyTextToClipboard(text) {
        const textArea = document.createElement('textarea')
        textArea.value = text
        textArea.style.position = 'fixed'
        textArea.style.left = '-999999px'
        textArea.style.top = '-999999px'
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()

        try {
            document.execCommand('copy')
        } finally {
            document.body.removeChild(textArea)
        }
    }

    /**
     * 显示复制成功状态
     */
    showCopySuccess(button, isBashCommand) {
        const originalContent = button.innerHTML
        button.classList.add(this.copiedClass)
        button.innerHTML = this.getCheckIcon()

        setTimeout(() => {
            button.classList.remove(this.copiedClass)
            button.innerHTML = originalContent
        }, 2000)
    }

    /**
     * 显示复制错误状态
     */
    showCopyError(button) {
        const originalContent = button.innerHTML
        button.innerHTML = this.getErrorIcon()

        setTimeout(() => {
            button.innerHTML = originalContent
        }, 2000)
    }


    /**
     * 获取复制图标SVG
     */
    getCopyIcon() {
        return `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
      </svg>
    `
    }

    /**
     * 获取成功图标SVG
     */
    getCheckIcon() {
        return `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20,6 9,17 4,12"></polyline>
      </svg>
    `
    }

    /**
     * 获取错误图标SVG
     */
    getErrorIcon() {
        return `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="15" y1="9" x2="9" y2="15"></line>
        <line x1="9" y1="9" x2="15" y2="15"></line>
      </svg>
    `
    }
}

// 自动初始化
let codeBlockCopyInstance = null

export function initCodeBlockCopy() {
    if (!codeBlockCopyInstance) {
        codeBlockCopyInstance = new CodeBlockCopy()
    }
    return codeBlockCopyInstance
}

// 导出默认实例
export default CodeBlockCopy