/**
 * 内容解析器
 * 将Notion的块结构转换为HTML
 */

export class ContentParser {
  constructor() {
    console.log('🔧 ContentParser 初始化...')
    this.configureMarked()
  }

  /**
   * 配置marked
   * @private
   */
  configureMarked() {
    // 检查marked库是否可用（从全局变量）
    if (typeof marked !== 'undefined') {
      console.log('✅ 发现全局marked库，进行配置...')
      try {
        marked.setOptions({
          breaks: false,          // 不允许强制换行，避免标题被分割
          gfm: true,              // 启用GitHub风格Markdown
          headerIds: true,        // 为标题生成ID
          mangle: false,          // 不转义标题中的HTML
          sanitize: false,        // 不过滤HTML标签
          smartLists: true,       // 智能列表处理
          smartypants: false,     // 不转换引号
          silent: false,          // 不忽略解析错误
          pedantic: false,        // 不严格遵循markdown规范
          xhtml: false            // 不使用XHTML
        })
        
        // 简化版：不使用自定义renderer，避免兼容性问题
        console.log('✅ marked基础配置完成（无自定义renderer）')
      } catch (error) {
        console.warn('⚠️ marked配置失败，将使用基础功能:', error)
      }
    } else {
      console.log('⚠️ 未发现marked库，将使用基础解析功能')
    }
  }

  /**
   * 解析Notion块为HTML - 优先使用Markdown渲染
   * @param {Array} blocks - Notion块数组
   * @returns {string} HTML字符串
   */
  parseBlocks(blocks) {
    console.log('🔄 ContentParser.parseBlocks 开始解析...')
    console.log('📊 输入块数量:', blocks?.length || 0)
    // 打印输入块的详细信息
    console.log('📄 输入块详细信息:', JSON.stringify(blocks, null, 2))
    
    if (!blocks || !Array.isArray(blocks) || blocks.length === 0) {
      console.log('⚠️ 没有有效的Notion块，返回空内容提示')
      return '<p class="no-content">暂无内容</p>'
    }

    // 新策略：先将Notion块转换为Markdown，然后统一渲染
    try {
      console.log('🔄 使用Markdown渲染策略...')
      const markdown = this.convertBlocksToMarkdown(blocks)
      console.log('📝 转换后的Markdown长度:', markdown.length)
      console.log('📄 Markdown预览:', markdown.substring(0, 300))
      
      if (markdown && markdown.trim()) {
        const html = this.parseMarkdown(markdown)
        console.log('✅ Markdown渲染完成，HTML长度:', html.length)
        return html
      }
    } catch (error) {
      console.warn('⚠️ Markdown渲染失败，回退到直接HTML渲染:', error)
    }

    // 回退策略：直接转换为HTML
    console.log('🔄 使用直接HTML渲染策略...')
    const htmlParts = []
    let listItems = []
    let listType = null

    for (const block of blocks) {
      try {
        const html = this.parseBlock(block)
        
        // 处理列表项
        if (block.type === 'bulleted_list_item' || block.type === 'numbered_list_item') {
          const currentListType = block.type === 'bulleted_list_item' ? 'ul' : 'ol'
          
          if (listType !== currentListType) {
            // 结束之前的列表
            if (listItems.length > 0) {
              htmlParts.push(`<${listType}>${listItems.join('')}</${listType}>`)
              listItems = []
            }
            listType = currentListType
          }
          
          listItems.push(html)
        } else {
          // 结束当前列表
          if (listItems.length > 0) {
            htmlParts.push(`<${listType}>${listItems.join('')}</${listType}>`)
            listItems = []
            listType = null
          }
          
          if (html && html.trim()) {
            htmlParts.push(html)
          }
        }
      } catch (error) {
        console.warn('⚠️ 解析块时出错:', error, block)
        // 打印错误的详细信息
        console.warn('⚠️ 解析块错误详情:', error.stack)
        // 跳过错误的块，继续处理其他块
      }
    }

    // 处理最后的列表
    if (listItems.length > 0) {
      htmlParts.push(`<${listType}>${listItems.join('')}</${listType}>`)
    }

    const html = htmlParts.join('\n')
    console.log('✅ 直接HTML渲染完成，HTML长度:', html.length)
    // 打印解析后的HTML内容
    console.log('📄 解析后的HTML内容:', html)
    
    // 如果没有解析出任何内容
    if (!html || html.trim() === '') {
      console.log('⚠️ 解析结果为空，返回占位内容')
      return '<p class="empty-result">内容解析为空</p>'
    }
    
    // 使用基础HTML清理 - 不依赖DOMPurify
    const sanitizedHtml = this.sanitizeHtmlBasic(html)
    
    console.log('✅ HTML清理完成，最终长度:', sanitizedHtml.length)
    // 打印清理后的HTML内容
    console.log('📄 清理后的HTML内容:', sanitizedHtml)
    
    // 确保返回有效的HTML内容
    if (!sanitizedHtml || sanitizedHtml.trim() === '') {
      return '<p class="empty-content">暂无内容</p>'
    }
    
    return sanitizedHtml
  }

  /**
   * 将Notion块转换为Markdown格式
   * @param {Array} blocks - Notion块数组
   * @returns {string} Markdown字符串
   * @private
   */
  convertBlocksToMarkdown(blocks) {
    const markdownParts = []
    let listItemIndex = 1 // 用于跟踪有序列表的序号
    let lastListType = null
    
    for (const block of blocks) {
      try {
        // 检查是否是列表项
        if (block.type === 'numbered_list_item') {
          if (lastListType !== 'numbered_list_item') {
            listItemIndex = 1 // 重置序号
          }
          const markdown = this.convertBlockToMarkdown(block, listItemIndex)
          listItemIndex++
          lastListType = 'numbered_list_item'
          if (markdown && markdown.trim()) {
            markdownParts.push(markdown)
          }
        } else if (block.type === 'bulleted_list_item') {
          const markdown = this.convertBlockToMarkdown(block)
          lastListType = 'bulleted_list_item'
          if (markdown && markdown.trim()) {
            markdownParts.push(markdown)
          }
        } else {
          // 非列表项，重置列表状态
          listItemIndex = 1
          lastListType = null
          const markdown = this.convertBlockToMarkdown(block)
          if (markdown && markdown.trim()) {
            markdownParts.push(markdown)
          }
        }
      } catch (error) {
        console.warn('⚠️ 转换块到Markdown时出错:', error, block)
        // 跳过错误的块
      }
    }
    
    return markdownParts.join('\n\n')
  }

  /**
   * 将单个Notion块转换为Markdown
   * @param {Object} block - Notion块
   * @param {number} listIndex - 列表项索引（可选）
   * @returns {string} Markdown字符串
   * @private
   */
  convertBlockToMarkdown(block, listIndex = null) {
    const { type } = block
    const content = block[type]

    if (!content) {
      return ''
    }

    try {
      switch (type) {
        case 'paragraph':
          const text = this.parseRichTextToMarkdown(content.rich_text)
          return text || ''
          
        case 'heading_1':
          return `# ${this.parseRichTextToMarkdown(content.rich_text)}`
          
        case 'heading_2':
          return `## ${this.parseRichTextToMarkdown(content.rich_text)}`
          
        case 'heading_3':
          return `### ${this.parseRichTextToMarkdown(content.rich_text)}`
          
        case 'bulleted_list_item':
          return `- ${this.parseRichTextToMarkdown(content.rich_text)}`
          
        case 'numbered_list_item':
          const index = listIndex !== null ? listIndex : 1
          return `${index}. ${this.parseRichTextToMarkdown(content.rich_text)}`
          
        case 'code':
          const language = content.language || ''
          const code = this.parseRichTextToMarkdown(content.rich_text)
          
          // 特殊处理：如果代码块的语言是markdown并且内容看起来像博客内容
          // 直接返回内容而不是包装为代码块
          if ((language === 'markdown' || language === 'plain text' || language === 'text') && 
              (code.includes('#') || code.includes('*') || code.includes('```') || code.includes('!['))) {
            console.log('🔄 检测到Markdown内容的代码块，直接使用内容而不包装')
            return code  // 直接返回内容，不包装为代码块
          } else {
            // 正常的代码块
            return `\`\`\`${language}\n${code}\n\`\`\``
          }
          
        case 'quote':
          return `> ${this.parseRichTextToMarkdown(content.rich_text)}`
          
        case 'divider':
          return '---'
          
        case 'to_do':
          const checked = content.checked ? 'x' : ' '
          return `- [${checked}] ${this.parseRichTextToMarkdown(content.rich_text)}`
          
        case 'image':
          const imageUrl = content.file?.url || content.external?.url
          const caption = content.caption ? this.parseRichTextToMarkdown(content.caption) : ''
          return `![${caption || '图片'}](${imageUrl})`
          
        case 'bookmark':
          const url = content.url
          const linkCaption = content.caption ? this.parseRichTextToMarkdown(content.caption) : url
          return `[${linkCaption}](${url})`
          
        case 'callout':
          const icon = content.icon?.emoji || '💡'
          const calloutText = this.parseRichTextToMarkdown(content.rich_text)
          return `> ${icon} ${calloutText}`
          
        default:
          console.log(`🔍 未知块类型 "${type}"，尝试解析为段落`)
          if (content.rich_text) {
            return this.parseRichTextToMarkdown(content.rich_text)
          }
          if (content.text) {
            return content.text
          }
          return ''
      }
    } catch (error) {
      console.error(`❌ 转换块 ${type} 到Markdown时出错:`, error, content)
      return ''
    }
  }

  /**
   * 将Notion富文本转换为Markdown格式
   * @param {Array} richText - Notion富文本数组
   * @returns {string} Markdown字符串
   * @private
   */
  parseRichTextToMarkdown(richText) {
    if (!richText || !Array.isArray(richText)) {
      return ''
    }
    
    return richText.map((text) => {
      try {
        let content = text.plain_text || text.text?.content || ''
        
        if (text.annotations) {
          const { bold, italic, strikethrough, underline, code } = text.annotations
          
          if (code) content = `\`${content}\``
          if (bold) content = `**${content}**`
          if (italic) content = `*${content}*`
          if (strikethrough) content = `~~${content}~~`
          // Markdown不直接支持下划线，使用HTML标签
          if (underline) content = `<u>${content}</u>`
        }
        
        if (text.href) {
          content = `[${content}](${text.href})`
        }
        
        return content
      } catch (error) {
        console.error('❌ 解析富文本到Markdown出错:', error, text)
        return text.plain_text || text.text?.content || ''
      }
    }).join('') // 重要：确保数字序号和内容不被分开
  }

  /**
   * 基础HTML清理方法（不依赖DOMPurify）
   * @param {string} html - 原始HTML
   * @returns {string} 清理后的HTML
   * @private
   */
  sanitizeHtmlBasic(html) {
    // 基础的HTML清理，保留常用标签
    if (!html || typeof html !== 'string') return ''
    
    // 移除危险的script标签和事件处理器
    return html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, '')
      .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
      .replace(/javascript:/gi, '')
  }

  /**
   * HTML转义函数
   * @param {string} text - 需要转义的文本
   * @returns {string} 转义后的文本
   * @private
   */
  escapeHtml(text) {
    if (typeof text !== 'string') return ''
    
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
  }

  /**
   * 解析单个Notion块
   * @private
   */
  parseBlock(block) {
    const { type } = block
    const content = block[type]

    if (!content) {
      console.warn(`⚠️ 块 ${type} 没有内容`)
      return ''
    }

    try {
      switch (type) {
      case 'paragraph':
        return `<p>${this.parseRichText(content.rich_text)}</p>`
        
      case 'heading_1':
        return `<h1>${this.parseRichText(content.rich_text)}</h1>`
        
      case 'heading_2':
        return `<h2>${this.parseRichText(content.rich_text)}</h2>`
        
      case 'heading_3':
        return `<h3>${this.parseRichText(content.rich_text)}</h3>`
        
      case 'bulleted_list_item':
      case 'numbered_list_item':
        return `<li>${this.parseRichText(content.rich_text)}</li>`
        
      case 'code':
        const language = content.language || 'text'
        const code = this.parseRichText(content.rich_text)
        
        // 验证code内容是否有效
        if (!code || typeof code !== 'string' || code.trim() === '') {
          console.warn('⚠️ Code块内容为空或无效')
          return `<pre><code class="language-${language}"><!-- 空代码块 --></code></pre>`
        }
        
        // 直接显示为代码块，不进行特殊的Markdown解析
        // （Markdown解析现在由parseBlocks方法统一处理）
        return `<pre><code class="language-${language}">${this.escapeHtml(code)}</code></pre>`
        
      case 'quote':
        return `<blockquote>${this.parseRichText(content.rich_text)}</blockquote>`
        
      case 'divider':
        return '<hr>'
        
      case 'image':
        return this.parseImage(content)
        
      case 'video':
        return this.parseVideo(content)
        
      case 'callout':
        return this.parseCallout(content)
        
      case 'toggle':
        return this.parseToggle(content)
        
      case 'table':
        return this.parseTable(block)

      case 'to_do':
        const checked = content.checked ? 'checked' : ''
        const text = this.parseRichText(content.rich_text)
        return `<div class="todo-item"><input type="checkbox" ${checked} disabled> ${text}</div>`

      case 'bookmark':
        const url = content.url
        const caption = content.caption ? this.parseRichText(content.caption) : url
        return `<div class="bookmark"><a href="${this.escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${caption}</a></div>`
        
      default:
        console.log(`🔍 未知块类型 "${type}"，尝试解析为段落`)
        // 尝试解析为段落
        if (content.rich_text) {
          const text = this.parseRichText(content.rich_text)
          return text ? `<p>${text}</p>` : ''
        }
        // 如果有text属性，直接使用
        if (content.text) {
          return `<p>${this.escapeHtml(content.text)}</p>`
        }
        console.warn(`⚠️ 无法解析块类型 "${type}":`, content)
        return ''
      }
    } catch (error) {
      console.error(`❌ 解析块 ${type} 时出错:`, error, content)
      return `<p class="parse-error">解析错误: ${type}</p>`
    }

  }

  /**
   * 解析富文本
   * @private
   */
  parseRichText(richText) {
    if (!richText || !Array.isArray(richText)) {
      return ''
    }
    
    return richText.map((text, index) => {
      try {
        let content = this.escapeHtml(text.plain_text || text.text?.content || '')
        
        if (text.annotations) {
          const { bold, italic, strikethrough, underline, code } = text.annotations
          
          if (code) content = `<code>${content}</code>`
          if (bold) content = `<strong>${content}</strong>`
          if (italic) content = `<em>${content}</em>`
          if (strikethrough) content = `<del>${content}</del>`
          if (underline) content = `<u>${content}</u>`
        }
        
        if (text.href) {
          content = `<a href="${this.escapeHtml(text.href)}" target="_blank" rel="noopener noreferrer">${content}</a>`
        }
        
        return content
      } catch (error) {
        console.error(`❌ 解析富文本片段 ${index} 出错:`, error, text)
        return this.escapeHtml(text.plain_text || text.text?.content || '')
      }
    }).join('')
  }

  /**
   * 解析图片
   * @private
   */
  parseImage(content) {
    const imageUrl = content.file?.url || content.external?.url
    if (!imageUrl) return ''

    const caption = content.caption ? this.parseRichText(content.caption) : ''
    const alt = caption || '图片'

    return `
      <figure class="notion-image">
        <img src="${this.escapeHtml(imageUrl)}" alt="${this.escapeHtml(alt)}" loading="lazy" />
        ${caption ? `<figcaption>${caption}</figcaption>` : ''}
      </figure>
    `
  }

  /**
   * 解析视频
   * @private
   */
  parseVideo(content) {
    const videoUrl = content.file?.url || content.external?.url
    if (!videoUrl) return ''

    return `
      <div class="notion-video">
        <video controls>
          <source src="${this.escapeHtml(videoUrl)}">
          您的浏览器不支持视频播放。
        </video>
      </div>
    `
  }

  /**
   * 解析标注块
   * @private
   */
  parseCallout(content) {
    const icon = content.icon?.emoji || '💡'
    const text = this.parseRichText(content.rich_text)
    
    return `
      <div class="notion-callout">
        <span class="notion-callout-icon">${icon}</span>
        <div class="notion-callout-content">${text}</div>
      </div>
    `
  }

  /**
   * 解析切换块
   * @private
   */
  parseToggle(content) {
    const title = this.parseRichText(content.rich_text)
    
    return `
      <details class="notion-toggle">
        <summary>${title}</summary>
        <div class="notion-toggle-content">
          <!-- 子块内容需要递归处理 -->
        </div>
      </details>
    `
  }

  /**
   * 解析表格
   * @private
   */
  parseTable(block) {
    // Notion表格解析较复杂，这里提供基本实现
    return `
      <div class="notion-table">
        <p>表格内容（需要进一步实现）</p>
      </div>
    `
  }

  /**
   * 解析Markdown内容为HTML - 使用与admin.html相同的简单方式
   * @param {string} markdownContent - Markdown内容
   * @returns {string} HTML字符串
   */
  parseMarkdown(markdownContent) {
    try {
      console.log('🔄 ContentParser.parseMarkdown 开始解析...')
      console.log('📝 输入内容类型:', typeof markdownContent)
      console.log('📝 输入内容长度:', markdownContent?.length || 0)
      console.log('📄 输入内容预览:', markdownContent?.substring(0, 200) || 'empty')
      
      // 验证输入
      if (!markdownContent) {
        console.warn('⚠️ 输入内容为空')
        return '<p class="empty-content">内容为空</p>'
      }
      
      // 确保markdownContent是字符串且不为空
      if (typeof markdownContent !== 'string') {
        console.warn('⚠️ 输入内容不是字符串类型，尝试转换:', typeof markdownContent)
        markdownContent = String(markdownContent || '')
      }
      
      // 再次检查转换后的内容
      if (!markdownContent || markdownContent.trim() === '') {
        console.warn('⚠️ 转换后的内容仍为空')
        return '<p class="empty-content">内容为空</p>'
      }
      
      // 确保marked库可用
      if (typeof marked === 'undefined' || !marked.parse) {
        console.warn('⚠️ marked库不可用，使用基础解析')
        return `<p>${this.escapeHtml(markdownContent)}</p>`
      }
      
      // 使用与admin.html完全相同的方式：直接使用marked.parse，但添加后处理修复
      let html
      try {
        html = marked.parse(markdownContent.trim())
      } catch (markedError) {
        console.error('❌ marked.parse 调用失败:', markedError)
        console.error('❌ 输入给marked的内容:', markdownContent?.substring(0, 200))
        // 如果marked解析失败，返回转义的纯文本
        return `<p>${this.escapeHtml(markdownContent)}</p>`
      }
      
      // 后处理：修复marked可能产生的序号分离问题
      html = this.fixNumberingSeparation(html)
      
      console.log('✅ Marked解析完成（与admin.html完全一致）+ 序号修复')
      console.log('📏 解析后HTML长度:', html.length)
      console.log('🎨 解析后HTML预览:', html.substring(0, 300))
      
      // 🔍 调试：检查HTML是否正确生成
      const hasHtmlTags = html.includes('<') && html.includes('>')
      const isCodeBlock = html.includes('<pre><code') || html.includes('```')
      console.log('🔍 调试检查:')
      console.log('  - 包含HTML标签:', hasHtmlTags)
      console.log('  - 是代码块:', isCodeBlock)
      console.log('  - 开头内容:', html.substring(0, 100))
      
      // 验证解析结果
      if (!html || html.trim() === '') {
        console.warn('⚠️ Marked解析结果为空')
        return '<p class="parse-empty">解析结果为空</p>'
      }
      
      console.log('✅ ContentParser解析完成（完全与admin预览一致，无任何额外处理）')
      return html
      
    } catch (error) {
      console.error('❌ ContentParser.parseMarkdown 解析失败:', error)
      console.error('❌ 错误堆栈:', error.stack)
      console.error('❌ 输入内容类型:', typeof markdownContent)
      console.error('❌ 输入内容:', markdownContent)
      
      return `<div class="markdown-error" style="padding: 20px; background: rgba(255,0,0,0.1); border: 1px solid rgba(255,0,0,0.3); border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #ff6b6b; margin-bottom: 15px;">⚠️ Markdown解析错误</h3>
        <p style="margin-bottom: 10px;"><strong>错误信息:</strong> ${this.escapeHtml(error.message)}</p>
        <p style="margin-bottom: 10px;"><strong>输入类型:</strong> ${typeof markdownContent}</p>
        <details style="margin-top: 15px;">
          <summary style="cursor: pointer; color: #00ffff;">查看原始内容</summary>
          <pre style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 4px; overflow-x: auto; white-space: pre-wrap; margin-top: 10px;">${this.escapeHtml(String(markdownContent).substring(0, 1000) || 'empty')}</pre>
        </details>
      </div>`
    }
  }

  /**
   * 修复数字序号分离问题
   * @param {string} html - 原始HTML
   * @returns {string} 修复后的HTML
   * @private
   */
  fixNumberingSeparation(html) {
    console.log('🔧 开始修复数字序号分离问题...')
    console.log('🔍 修复前HTML片段:', html.substring(0, 500))
    
    const originalHtml = html
    
    // 步骤1: 修复最常见的情况 - 数字序号单独成标题
    html = html
      // 处理 <h4>1.</h4><h4><strong>标题</strong></h4> 的情况
      .replace(/<h([1-6])>(\d+\.)\s*<\/h\1>\s*<h\1><strong>/g, '<h$1>$2 <strong>')
      
      // 处理 <h4>1.</h4><strong>标题</strong> 的情况
      .replace(/<h([1-6])>(\d+\.)\s*<\/h\1>\s*<strong>/g, '<h$1>$2 <strong>')
      
      // 处理 <p>1.</p><h4><strong>标题</strong></h4> 的情况
      .replace(/<p>(\d+\.)\s*<\/p>\s*<h([1-6])><strong>/g, '<h$2>$1 <strong>')
      
      // 处理 <p>1.</p><strong>标题</strong> 的情况
      .replace(/<p>(\d+\.)\s*<\/p>\s*<strong>/g, '<p>$1 <strong>')
    
    console.log('🔍 第1步后HTML片段:', html.substring(0, 500))
    
    // 步骤2: 修复字母序号的类似问题
    html = html
      .replace(/<h([1-6])>([a-zA-Z]\.)\s*<\/h\1>\s*<h\1><strong>/g, '<h$1>$2 <strong>')
      .replace(/<h([1-6])>([a-zA-Z]\.)\s*<\/h\1>\s*<strong>/g, '<h$1>$2 <strong>')
      .replace(/<p>([a-zA-Z]\.)\s*<\/p>\s*<h([1-6])><strong>/g, '<h$2>$1 <strong>')
      .replace(/<p>([a-zA-Z]\.)\s*<\/p>\s*<strong>/g, '<p>$1 <strong>')
    
    // 步骤3: 处理通用的序号分离情况
    html = html
      // 数字序号基本情况
      .replace(/<h([1-6])>(\d+\.)\s*<\/h\1>\s*<h\1>/g, '<h$1>$2 ')
      .replace(/<h([1-6])>(\d+\.)\s*<\/h\1>\s*<p>/g, '<h$1>$2 ')
      .replace(/<p>(\d+\.)\s*<\/p>\s*<h([1-6])>/g, '<h$2>$1 ')
      .replace(/<p>(\d+\.)\s*<\/p>\s*<p>/g, '<p>$1 ')
      
      // 字母序号基本情况
      .replace(/<h([1-6])>([a-zA-Z]\.)\s*<\/h\1>\s*<h\1>/g, '<h$1>$2 ')
      .replace(/<h([1-6])>([a-zA-Z]\.)\s*<\/h\1>\s*<p>/g, '<h$1>$2 ')
      .replace(/<p>([a-zA-Z]\.)\s*<\/p>\s*<h([1-6])>/g, '<h$2>$1 ')
      .replace(/<p>([a-zA-Z]\.)\s*<\/p>\s*<p>/g, '<p>$1 ')
    
    console.log('🔍 第3步后HTML片段:', html.substring(0, 500))
    
    // 步骤4: 修复其他分离符号
    html = html
      // 冒号分离
      .replace(/<\/p>\s*<p>\s*:/g, ':')
      .replace(/(<p>[^<]*)<\/p>\s*<p>:/g, '$1:')
      .replace(/<\/h([1-6])>\s*<p>\s*:/g, ':</h$1>')
      
      // 括号分离
      .replace(/<\/p>\s*<p>\s*\)/g, ')')
      .replace(/<p>\(\s*<\/p>\s*<p>/g, '<p>(')
      
      // 引号分离
      .replace(/<\/p>\s*<p>\s*"/g, '"')
      .replace(/<p>"\s*<\/p>\s*<p>/g, '<p>"')
    
    // 步骤5: 清理空标签和多余空白
    html = html
      .replace(/<p>\s*<\/p>/g, '')
      .replace(/<h([1-6])>\s*<\/h\1>/g, '')
      .replace(/\s+/g, ' ')
      .replace(/>\s+</g, '><')
    
    // 检查是否有改变
    const hasChanged = originalHtml !== html
    console.log('🔍 修复后HTML片段:', html.substring(0, 500))
    console.log('✅ 数字序号分离修复完成, HTML有变化:', hasChanged)
    
    if (!hasChanged) {
      console.warn('⚠️ HTML没有发生变化，可能需要检查正则表达式匹配')
      // 搜索常见的分离模式
      const patterns = [
        /<h[1-6]>\d+\.<\/h[1-6]>/g,
        /<p>\d+\.<\/p>/g,
        /<h[1-6]><strong>/g,
        /<\/h[1-6]>\s*<strong>/g
      ]
      
      patterns.forEach((pattern, i) => {
        const matches = html.match(pattern)
        if (matches) {
          console.log(`🔍 发现模式 ${i + 1}:`, matches.slice(0, 3))
        }
      })
    }
    
    return html
  }

  /**
   * 优化Markdown转换的HTML - 简化版，只做最基本的优化
   * @param {string} html - 原始HTML
   * @returns {string} 优化后的HTML
   * @private
   */
  optimizeMarkdownHtml(html) {
    // 只做最基本的优化，保持与admin.html预览一致
    return html
      // 为外部链接添加target="_blank"
      .replace(/<a href="(https?:\/\/[^"]+)"([^>]*)>/g, (match, url, attrs) => {
        if (!attrs.includes('target=')) {
          attrs += ' target="_blank" rel="noopener noreferrer"'
        }
        return `<a href="${url}"${attrs}>`
      })
      
      // 为图片添加懒加载
      .replace(/<img([^>]+)>/g, (match, attrs) => {
        if (!attrs.includes('loading=')) {
          attrs += ' loading="lazy"'
        }
        return `<img${attrs}>`
      })
  }
}

export default ContentParser
