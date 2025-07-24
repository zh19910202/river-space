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
        console.log('✅ marked配置完成')
      } catch (error) {
        console.warn('⚠️ marked配置失败，将使用基础功能:', error)
      }
    } else {
      console.log('⚠️ 未发现marked库，将使用基础解析功能')
    }
  }

  /**
   * 解析Notion块为HTML
   * @param {Array} blocks - Notion块数组
   * @returns {string} HTML字符串
   */
  parseBlocks(blocks) {
    console.log('🔄 ContentParser.parseBlocks 开始解析...')
    console.log('📊 输入块数量:', blocks?.length || 0)
    
    if (!blocks || !Array.isArray(blocks) || blocks.length === 0) {
      console.log('⚠️ 没有有效的Notion块，返回空内容提示')
      return '<p class="no-content">暂无内容</p>'
    }

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
        // 跳过错误的块，继续处理其他块
      }
    }

    // 处理最后的列表
    if (listItems.length > 0) {
      htmlParts.push(`<${listType}>${listItems.join('')}</${listType}>`)
    }

    const html = htmlParts.join('\n')
    console.log('✅ Notion块解析完成，HTML长度:', html.length)
    
    // 如果没有解析出任何内容
    if (!html || html.trim() === '') {
      console.log('⚠️ 解析结果为空，返回占位内容')
      return '<p class="empty-result">内容解析为空</p>'
    }
    
    // 使用基础HTML清理 - 不依赖DOMPurify
    const sanitizedHtml = this.sanitizeHtmlBasic(html)
    
    console.log('✅ HTML清理完成，最终长度:', sanitizedHtml.length)
    
    // 确保返回有效的HTML内容
    if (!sanitizedHtml || sanitizedHtml.trim() === '') {
      return '<p class="empty-content">暂无内容</p>'
    }
    
    return sanitizedHtml
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
        
        // 如果是markdown或plain text语言，且内容看起来像是博客内容，则直接解析为HTML
        if ((language === 'markdown' || language === 'plain text' || language === 'text') && 
            (code.includes('#') || code.includes('*') || code.includes('```') || code.includes('!['))) {
          // 尝试解析为Markdown
          try {
            const parsedMarkdown = this.parseMarkdown(code)
            return parsedMarkdown
          } catch (markdownError) {
            console.warn('⚠️ Markdown解析失败，使用基础解析:', markdownError)
            // 如果Markdown解析失败，回退到代码显示
            return `<pre><code class="language-${language}">${this.escapeHtml(code)}</code></pre>`
          }
        } else {
          // 正常的代码块显示
          return `<pre><code class="language-${language}">${this.escapeHtml(code)}</code></pre>`
        }
        
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
      console.log('📝 输入内容长度:', markdownContent?.length || 0)
      console.log('📄 输入内容预览:', markdownContent?.substring(0, 200) || 'empty')
      
      // 验证输入
      if (!markdownContent || typeof markdownContent !== 'string') {
        console.warn('⚠️ 输入内容无效或为空')
        return '<p class="empty-content">内容为空</p>'
      }
      
      // 使用与admin.html完全相同的方式：直接使用marked.parse，不做任何额外处理
      const html = marked.parse(markdownContent.trim())
      
      console.log('✅ Marked解析完成（与admin.html完全一致）')
      console.log('📏 解析后HTML长度:', html.length)
      console.log('🎨 解析后HTML预览:', html.substring(0, 300))
      
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
      
      return `<div class="markdown-error" style="padding: 20px; background: rgba(255,0,0,0.1); border: 1px solid rgba(255,0,0,0.3); border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #ff6b6b; margin-bottom: 15px;">⚠️ Markdown解析错误</h3>
        <p style="margin-bottom: 10px;"><strong>错误信息:</strong> ${this.escapeHtml(error.message)}</p>
        <details style="margin-top: 15px;">
          <summary style="cursor: pointer; color: #00ffff;">查看原始内容</summary>
          <pre style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 4px; overflow-x: auto; white-space: pre-wrap; margin-top: 10px;">${this.escapeHtml(markdownContent?.substring(0, 1000) || 'empty')}</pre>
        </details>
      </div>`
    }
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
