/**
 * Notion API 服务
 * 处理与Notion API的所有交互
 */

import { config } from '../config/index.js'
import { ContentParser } from '../utils/contentParser.js'
import { ApiClient } from '../utils/apiClient.js'

export class NotionService {
  constructor() {
    this.apiClient = new ApiClient()
    this.contentParser = new ContentParser()
  }

  /**
   * 获取博客文章列表
   * @param {Object} options - 查询选项
   * @returns {Promise<Array>} 文章列表
   */
  async getBlogPosts(options = {}) {
    const {
      pageSize = 10,
      cursor = null,
      filter = {},
      includeUnpublished = false
    } = options

    try {
      config.log('Fetching blog posts from Notion...')

      const requestBody = {
        sorts: [
          {
            property: 'Published Date',
            direction: 'descending'
          }
        ],
        page_size: pageSize
      }

      // 只有在不包含未发布文章时才添加过滤器
      if (!includeUnpublished) {
        requestBody.filter = {
          property: 'Published',
          checkbox: {
            equals: true
          }
        }
      }

      // 添加额外的过滤条件
      if (Object.keys(filter).length > 0) {
        const additionalFilters = Object.entries(filter)
          .filter(([property, value]) => value !== undefined && value !== null && value !== '')
          .map(([property, value]) => ({
            property,
            [this.getFilterType(value)]: value
          }))

        if (additionalFilters.length > 0) {
          if (requestBody.filter) {
            requestBody.filter = {
              and: [
                requestBody.filter,
                ...additionalFilters
              ]
            }
          } else {
            requestBody.filter = additionalFilters.length === 1 ? additionalFilters[0] : {
              and: additionalFilters
            }
          }
        }
      }

      if (cursor) {
        requestBody.start_cursor = cursor
      }

      const response = await this.apiClient.post(
        `/databases/${config.notion.databaseId}/query`,
        requestBody
      )

      const posts = this.formatBlogList(response.results)

      config.log(`Successfully fetched ${posts.length} blog posts`)

      return {
        posts,
        hasMore: response.has_more,
        nextCursor: response.next_cursor
      }
    } catch (error) {
      config.error('Failed to fetch blog posts:', error)
      throw new Error(`获取博客文章失败: ${error.message}`)
    }
  }

  /**
   * 创建新的博客文章
   * @param {Object} blogData - 博客数据
   * @returns {Promise<Object>} 创建的文章信息
   */
  async createBlogPost(blogData) {
    try {
      config.log('Creating new blog post:', blogData.title)
      config.log('Blog data:', JSON.stringify({ ...blogData, content: blogData.content ? `${blogData.content.substring(0, 100)}...` : null }, null, 2))

      const requestBody = {
        parent: {
          database_id: config.notion.databaseId
        },
        properties: {
          Title: {
            title: [
              {
                text: {
                  content: blogData.title
                }
              }
            ]
          },
          Summary: {
            rich_text: [
              {
                text: {
                  content: blogData.summary || ''
                }
              }
            ]
          },
          Category: {
            select: {
              name: blogData.category || '技术'
            }
          },
          Tags: {
            multi_select: (blogData.tags || []).map(tag => ({ name: tag }))
          },
          ReadTime: {
            rich_text: [
              {
                text: {
                  content: blogData.readTime || '5分钟'
                }
              }
            ]
          },
          Published: {
            checkbox: blogData.published || false
          },
          'Published Date': blogData.published ? {
            date: {
              start: new Date().toISOString().split('T')[0]
            }
          } : null
        }
      }

      // 如果有封面图，添加封面
      if (blogData.coverImage && blogData.coverImage.trim() !== '') {
        try {
          // 验证URL格式
          new URL(blogData.coverImage)
          
          // 确保URL是HTTPS或HTTP
          if (blogData.coverImage.startsWith('http://') || blogData.coverImage.startsWith('https://')) {
            requestBody.cover = {
              type: 'external',
              external: {
                url: blogData.coverImage
              }
            }
            console.log('设置封面图URL:', blogData.coverImage)
          } else {
            console.warn('封面图URL必须以http://或https://开头，跳过设置:', blogData.coverImage)
          }
        } catch (error) {
          console.warn('无效的封面图URL，跳过设置:', blogData.coverImage)
        }
      }

      // 创建Notion页面
      const response = await this.apiClient.post('/pages', requestBody)
      config.log('Successfully created blog post in Notion:', response.id)
      
      // 如果有内容，添加到Notion页面
      if (blogData.content) {
        try {
          config.log('添加内容到Notion页面...')
          await this.addContentToPage(response.id, blogData.content)
          config.log('内容添加成功')
        } catch (error) {
          console.error('添加内容到Notion页面失败:', error)
          
          // 提示用户
          alert(`添加内容到Notion页面失败: ${error.message}`)
          
          // 不阻止后续操作
        }
      }

      return this.formatBlogList([response])[0]

    } catch (error) {
      config.error('Failed to create blog post:', error)
      throw new Error(`创建博客文章失败: ${error.message}`)
    }
  }

  /**
   * 更新博客文章
   * @param {string} pageId - 页面ID
   * @param {Object} blogData - 更新的博客数据
   * @returns {Promise<Object>} 更新的文章信息
   */
  async updateBlogPost(pageId, blogData) {
    try {
      config.log('Updating blog post:', pageId)
      config.log('Blog data:', JSON.stringify({ ...blogData, content: blogData.content ? `${blogData.content.substring(0, 100)}...` : null }, null, 2))

      const requestBody = {
        properties: {}
      }

      // 更新标题
      if (blogData.title !== undefined) {
        requestBody.properties.Title = {
          title: [
            {
              text: {
                content: blogData.title
              }
            }
          ]
        }
      }

      // 更新摘要
      if (blogData.summary !== undefined) {
        requestBody.properties.Summary = {
          rich_text: [
            {
              text: {
                content: blogData.summary
              }
            }
          ]
        }
      }

      // 更新分类
      if (blogData.category !== undefined) {
        requestBody.properties.Category = {
          select: {
            name: blogData.category
          }
        }
      }

      // 更新标签
      if (blogData.tags !== undefined) {
        requestBody.properties.Tags = {
          multi_select: blogData.tags.map(tag => ({ name: tag }))
        }
      }

      // 更新阅读时间
      if (blogData.readTime !== undefined) {
        requestBody.properties.ReadTime = {
          rich_text: [
            {
              text: {
                content: blogData.readTime
              }
            }
          ]
        }
      }

      // 更新发布状态
      if (blogData.published !== undefined) {
        requestBody.properties.Published = {
          checkbox: blogData.published
        }

        // 如果发布，更新发布日期
        if (blogData.published) {
          requestBody.properties['Published Date'] = {
            date: {
              start: new Date().toISOString().split('T')[0]
            }
          }
        }
      }

      // 更新封面图
      if (blogData.coverImage !== undefined) {
        if (blogData.coverImage && blogData.coverImage.trim() !== '') {
          try {
            // 验证URL格式
            new URL(blogData.coverImage)
            
            // 确保URL是HTTPS或HTTP
            if (blogData.coverImage.startsWith('http://') || blogData.coverImage.startsWith('https://')) {
              requestBody.cover = {
                type: 'external',
                external: {
                  url: blogData.coverImage
                }
              }
              console.log('设置封面图URL:', blogData.coverImage)
            } else {
              console.warn('封面图URL必须以http://或https://开头:', blogData.coverImage)
              // 不设置封面图，避免错误
            }
          } catch (error) {
            console.warn('无效的封面图URL，跳过设置:', blogData.coverImage)
            // 不设置封面图，避免错误
          }
        } else {
          // 如果URL为空，移除封面图
          requestBody.cover = null
          console.log('移除封面图')
        }
      }

      // 如果有内容，更新Notion页面内容
      if (blogData.content) {
        try {
          // 将内容添加到Notion页面
          await this.addContentToPage(pageId, blogData.content)
          config.log('Notion页面内容已更新')
        } catch (error) {
          console.error('更新Notion内容失败:', error)
          // 提示用户
          alert(`更新Notion内容失败: ${error.message}`)
          // 不阻止其他更新继续进行
        }
      }

      // 更新Notion数据库
      const response = await this.apiClient.patch(`/pages/${pageId}`, requestBody)
      config.log('Successfully updated blog post in Notion:', pageId)
      
      return this.formatBlogList([response])[0]

    } catch (error) {
      config.error('Failed to update blog post:', error)
      throw new Error(`更新博客文章失败: ${error.message}`)
    }
  }

  /**
   * 删除博客文章（归档）
   * @param {string} pageId - 页面ID
   * @returns {Promise<void>}
   */
  async deleteBlogPost(pageId) {
    try {
      config.log('Archiving blog post:', pageId)

      // Notion API不支持真正删除，只能归档
      await this.apiClient.patch(`/pages/${pageId}`, {
        archived: true
      })

      config.log('Successfully archived blog post:', pageId)

    } catch (error) {
      config.error('Failed to archive blog post:', error)
      throw new Error(`删除博客文章失败: ${error.message}`)
    }
  }

  /**
   * 向页面添加内容块
   * @param {string} pageId - 页面ID
   * @param {string} content - Markdown内容
   * @returns {Promise<void>}
   */
  async addContentToPage(pageId, content) {
    try {
      config.log(`开始向页面 ${pageId} 添加内容...`)
      
      // 首先尝试清除现有内容
      try {
        const existingBlocks = await this.apiClient.get(`/blocks/${pageId}/children`)
        
        // 如果有现有内容，删除它们
        if (existingBlocks && existingBlocks.results && existingBlocks.results.length > 0) {
          config.log(`清除页面现有内容: ${existingBlocks.results.length} 个块`)
          
          // Notion API不支持批量删除，需要逐个删除
          for (const block of existingBlocks.results) {
            try {
              await this.apiClient.delete(`/blocks/${block.id}`)
            } catch (deleteError) {
              console.warn(`删除块 ${block.id} 失败:`, deleteError)
              // 继续删除其他块
            }
          }
          
          config.log('现有内容清除完成')
        } else {
          config.log('页面没有现有内容，无需清除')
        }
      } catch (clearError) {
        console.warn('清除现有内容失败:', clearError)
        // 继续添加新内容
      }
      
      // 验证内容不为空
      if (!content || content.trim() === '') {
        config.log('内容为空，跳过添加')
        return
      }
      
      // 将Markdown转换为Notion块
      config.log('开始将Markdown转换为Notion块...')
      const blocks = this.convertMarkdownToBlocks(content)
      config.log(`转换完成，生成了 ${blocks.length} 个内容块`)

      if (blocks.length > 0) {
        // Notion API有请求大小限制，分批添加内容
        const batchSize = 50 // Notion API建议的批量操作大小
        const totalBatches = Math.ceil(blocks.length / batchSize)
        
        config.log(`将分 ${totalBatches} 批添加内容，每批最多 ${batchSize} 个块`)
        
        for (let i = 0; i < blocks.length; i += batchSize) {
          const batch = blocks.slice(i, i + batchSize)
          const batchNumber = Math.floor(i / batchSize) + 1
          
          config.log(`添加第 ${batchNumber}/${totalBatches} 批，包含 ${batch.length} 个块...`)
          
          try {
            await this.apiClient.patch(`/blocks/${pageId}/children`, {
              children: batch
            })
            
            config.log(`第 ${batchNumber} 批添加成功`)
          } catch (batchError) {
            console.error(`添加第 ${batchNumber} 批内容失败:`, batchError)
            throw batchError // 重新抛出错误，中断处理
          }
          
          // 添加短暂延迟，避免API限制
          if (i + batchSize < blocks.length) {
            await new Promise(resolve => setTimeout(resolve, 300))
          }
        }
        
        config.log(`成功添加 ${blocks.length} 个内容块到页面`)
      } else {
        config.log('没有内容块需要添加')
      }

    } catch (error) {
      config.error('Failed to add content to page:', error)
      throw new Error(`添加内容到页面失败: ${error.message}`)
    }
  }

  /**
   * 将Markdown转换为Notion块
   * @param {string} markdown - Markdown内容
   * @returns {Array} Notion块数组
   */
  convertMarkdownToBlocks(markdown) {
    if (!markdown || !markdown.trim()) {
      return []
    }
    
    config.log('开始转换Markdown到Notion块...')
    
    // 更强大的Markdown到Notion块转换
    const lines = markdown.split('\n')
    const blocks = []
    
    // 用于处理代码块和引用块
    let inCodeBlock = false
    let codeBlockContent = []
    let codeBlockLanguage = ''
    let inQuoteBlock = false
    let quoteBlockContent = []
    let inListBlock = false
    let listItems = []
    let listType = ''
    
    // 处理每一行
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const trimmedLine = line.trim()
      
      // 处理代码块
      if (trimmedLine.startsWith('```')) {
        if (inCodeBlock) {
          // 结束代码块
          blocks.push({
            object: 'block',
            type: 'code',
            code: {
              rich_text: [{
                type: 'text',
                text: {
                  content: codeBlockContent.join('\n')
                }
              }],
              language: codeBlockLanguage || 'plain text'
            }
          })
          inCodeBlock = false
          codeBlockContent = []
          codeBlockLanguage = ''
        } else {
          // 开始代码块
          inCodeBlock = true
          codeBlockLanguage = trimmedLine.substring(3).trim().toLowerCase() || 'plain text'
          
          // 处理常见语言名称
          if (codeBlockLanguage === 'js') codeBlockLanguage = 'javascript'
          if (codeBlockLanguage === 'ts') codeBlockLanguage = 'typescript'
          if (codeBlockLanguage === 'py') codeBlockLanguage = 'python'
          if (codeBlockLanguage === 'sh') codeBlockLanguage = 'shell'
          if (codeBlockLanguage === 'bash') codeBlockLanguage = 'shell'
          if (codeBlockLanguage === 'json') codeBlockLanguage = 'javascript'
          if (codeBlockLanguage === 'md') codeBlockLanguage = 'markdown'
          if (codeBlockLanguage === 'html') codeBlockLanguage = 'html'
          if (codeBlockLanguage === 'css') codeBlockLanguage = 'css'
          if (codeBlockLanguage === 'java') codeBlockLanguage = 'java'
          if (codeBlockLanguage === 'c') codeBlockLanguage = 'c'
          if (codeBlockLanguage === 'cpp') codeBlockLanguage = 'c++'
          if (codeBlockLanguage === 'c++') codeBlockLanguage = 'c++'
          if (codeBlockLanguage === 'go') codeBlockLanguage = 'go'
          if (codeBlockLanguage === 'rust') codeBlockLanguage = 'rust'
          if (codeBlockLanguage === 'ruby') codeBlockLanguage = 'ruby'
          if (codeBlockLanguage === 'php') codeBlockLanguage = 'php'
          if (codeBlockLanguage === 'swift') codeBlockLanguage = 'swift'
          if (codeBlockLanguage === 'kotlin') codeBlockLanguage = 'kotlin'
          if (codeBlockLanguage === 'sql') codeBlockLanguage = 'sql'
        }
        continue
      }
      
      // 收集代码块内容
      if (inCodeBlock) {
        codeBlockContent.push(line)
        continue
      }
      
      // 处理引用块
      if (trimmedLine.startsWith('> ')) {
        if (!inQuoteBlock) {
          inQuoteBlock = true
        }
        quoteBlockContent.push(trimmedLine.substring(2))
        
        // 检查下一行是否还是引用
        if (i === lines.length - 1 || !lines[i + 1].trim().startsWith('> ')) {
          // 结束引用块
          blocks.push({
            object: 'block',
            type: 'quote',
            quote: {
              rich_text: [{
                type: 'text',
                text: {
                  content: quoteBlockContent.join('\n')
                }
              }]
            }
          })
          inQuoteBlock = false
          quoteBlockContent = []
        }
        continue
      }
      
      // 处理水平分割线
      if (trimmedLine === '---' || trimmedLine === '***' || trimmedLine === '___') {
        blocks.push({
          object: 'block',
          type: 'divider',
          divider: {}
        })
        continue
      }
      
      // 处理列表
      if (trimmedLine.match(/^[*\-+]\s/) || trimmedLine.match(/^\d+\.\s/)) {
        const isOrderedList = trimmedLine.match(/^\d+\.\s/) !== null
        const currentListType = isOrderedList ? 'numbered_list_item' : 'bulleted_list_item'
        
        if (!inListBlock || listType !== currentListType) {
          // 如果之前有列表，先结束它
          if (inListBlock) {
            // 列表项已经添加到blocks中了
            inListBlock = false
            listItems = []
          }
          
          // 开始新列表
          inListBlock = true
          listType = currentListType
        }
        
        // 提取列表项内容
        const content = isOrderedList 
          ? trimmedLine.replace(/^\d+\.\s/, '') 
          : trimmedLine.replace(/^[*\-+]\s/, '')
        
        // 添加列表项
        blocks.push({
          object: 'block',
          type: listType,
          [listType]: {
            rich_text: [{
              type: 'text',
              text: {
                content: content
              }
            }]
          }
        })
        
        // 检查下一行是否还是列表项
        if (i === lines.length - 1 || 
            !(lines[i + 1].trim().match(/^[*\-+]\s/) || lines[i + 1].trim().match(/^\d+\.\s/))) {
          inListBlock = false
          listItems = []
        }
        continue
      }
      
      // 处理标题
      if (trimmedLine.startsWith('# ')) {
        blocks.push({
          object: 'block',
          type: 'heading_1',
          heading_1: {
            rich_text: [{
              type: 'text',
              text: {
                content: trimmedLine.substring(2)
              }
            }]
          }
        })
      } else if (trimmedLine.startsWith('## ')) {
        blocks.push({
          object: 'block',
          type: 'heading_2',
          heading_2: {
            rich_text: [{
              type: 'text',
              text: {
                content: trimmedLine.substring(3)
              }
            }]
          }
        })
      } else if (trimmedLine.startsWith('### ')) {
        blocks.push({
          object: 'block',
          type: 'heading_3',
          heading_3: {
            rich_text: [{
              type: 'text',
              text: {
                content: trimmedLine.substring(4)
              }
            }]
          }
        })
      } else if (trimmedLine.startsWith('#### ')) {
        // Notion只支持三级标题，所以四级及以上都转为加粗段落
        blocks.push({
          object: 'block',
          type: 'paragraph',
          paragraph: {
            rich_text: [{
              type: 'text',
              text: {
                content: trimmedLine.substring(5)
              },
              annotations: {
                bold: true
              }
            }]
          }
        })
      } else if (trimmedLine === '') {
        // 空行，添加一个空段落
        if (i > 0 && i < lines.length - 1 && lines[i-1].trim() !== '' && lines[i+1].trim() !== '') {
          blocks.push({
            object: 'block',
            type: 'paragraph',
            paragraph: {
              rich_text: []
            }
          })
        }
      } else {
        // 处理任务列表
        const taskMatch = trimmedLine.match(/^\s*- \[([ x])\]\s+(.+)$/i)
        if (taskMatch) {
          const checked = taskMatch[1].toLowerCase() === 'x'
          const content = taskMatch[2]
          
          blocks.push({
            object: 'block',
            type: 'to_do',
            to_do: {
              rich_text: [{
                type: 'text',
                text: {
                  content: content
                }
              }],
              checked: checked
            }
          })
        } else {
          // 普通段落
          blocks.push({
            object: 'block',
            type: 'paragraph',
            paragraph: {
              rich_text: [{
                type: 'text',
                text: {
                  content: line
                }
              }]
            }
          })
        }
      }
    }
    
    // 处理未闭合的代码块
    if (inCodeBlock && codeBlockContent.length > 0) {
      blocks.push({
        object: 'block',
        type: 'code',
        code: {
          rich_text: [{
            type: 'text',
            text: {
              content: codeBlockContent.join('\n')
            }
          }],
          language: codeBlockLanguage || 'plain text'
        }
      })
    }
    
    // 处理未闭合的引用块
    if (inQuoteBlock && quoteBlockContent.length > 0) {
      blocks.push({
        object: 'block',
        type: 'quote',
        quote: {
          rich_text: [{
            type: 'text',
            text: {
              content: quoteBlockContent.join('\n')
            }
          }]
        }
      })
    }

    config.log(`Markdown转换完成，生成了 ${blocks.length} 个Notion块`)
    return blocks
  }

  /**
   * 获取单篇文章内容
   * @param {string} pageId - 页面ID
   * @returns {Promise<string>} HTML内容
   */
  async getBlogContent(pageId) {
    try {
      config.log(`📖 开始获取文章内容: ${pageId}`)

      const response = await this.apiClient.get(`/blocks/${pageId}/children`)

      config.log(`📁 获取到 ${response.results?.length || 0} 个内容块`)

      if (!response.results || response.results.length === 0) {
        config.log('⚠️ 页面没有内容块')
        return '<div style="text-align: center; padding: 60px 20px;"><h3 style="color: rgba(255,255,255,0.8);">📝 此文章暂无内容</h3><p style="color: rgba(255,255,255,0.6);">该文章在Notion中暂时没有内容块</p></div>'
      }

      // 使用ContentParser解析Notion块
      try {
        const content = this.contentParser.parseBlocks(response.results)
        config.log('✅ 成功解析Notion块内容，长度:', content?.length || 0)
        
        if (content && content.trim().length > 0) {
          return content
        } else {
          config.log('⚠️ Notion块内容解析结果为空')
          return `<div style="text-align: center; padding: 60px 20px;">
            <h3 style="color: rgba(255,255,255,0.8);">📝 文章内容解析中</h3>
            <p style="color: rgba(255,255,255,0.6);">检测到 ${response.results.length} 个内容块，但暂时无法显示</p>
          </div>`
        }
      } catch (parseError) {
        console.error('❌ 解析Notion块失败:', parseError)
        return '<div style="text-align: center; padding: 60px 20px; color: rgba(255,0,0,0.8);"><h3>❌ 内容解析失败</h3><p>无法解析Notion内容块</p></div>'
      }
    } catch (error) {
      config.error('❌ 获取文章内容失败:', error)
      return '<div style="text-align: center; padding: 60px 20px; color: rgba(255,0,0,0.8);"><h3>❌ 加载失败</h3><p>无法加载文章内容，请稍后重试</p></div>'
    }
  }








  /**
   * 搜索文章
   * @param {string} query - 搜索关键词
   * @returns {Promise<Array>} 搜索结果
   */
  async searchPosts(query) {
    try {
      const response = await this.apiClient.post('/search', {
        query,
        filter: {
          value: 'page',
          property: 'object'
        },
        sort: {
          direction: 'descending',
          timestamp: 'last_edited_time'
        }
      })

      return this.formatBlogList(response.results)
    } catch (error) {
      config.error('Search failed:', error)
      throw new Error(`搜索失败: ${error.message}`)
    }
  }

  /**
   * 格式化博客列表
   * @private
   */
  formatBlogList(results) {
    if (!Array.isArray(results)) {
      console.warn('formatBlogList: results is not an array:', results)
      return []
    }

    console.log(`📊 格式化 ${results.length} 个Notion页面...`)

    return results.map((page, index) => {
      try {
        const properties = page.properties || {}

        console.log(`🔍 处理页面 ${index + 1}/${results.length}:`, page.id)
        console.log('📋 页面属性键列表:', Object.keys(properties))
        
        // 只在第一个页面打印详细的cover信息
        if (index === 0) {
          console.log('🖼️ 第一个页面的详细cover信息:')
          console.log('  - page.cover:', page.cover)
          console.log('  - page.cover 类型:', page.cover?.type)
          if (page.cover?.type === 'external') {
            console.log('  - external URL:', page.cover.external?.url)
          }
          if (page.cover?.type === 'file') {
            console.log('  - file URL:', page.cover.file?.url)
          }
        }

        // 增强的封面图提取 - 优先使用Notion页面封面
        let coverImage = this.extractCoverImage(page.cover)
        
        // 如果页面没有设置封面，尝试从属性中提取（备选方案）
        if (!coverImage) {
          console.log('🔍 页面未设置封面，尝试从属性中查找...')
          console.log('🔍 可用属性列表:', Object.keys(properties))
          
          const coverProps = ['CoverImage', 'coverImage', 'Cover', 'cover', 'Thumbnail', 'thumbnail', 'Image', 'image']
          for (const propName of coverProps) {
            if (properties[propName]) {
              console.log(`🔍 检查属性 "${propName}":`, properties[propName])
              const propCover = this.extractFileUrl(properties[propName])
              if (propCover) {
                console.log(`✅ 从属性 "${propName}" 提取到封面:`, propCover)
                coverImage = propCover
                break
              }
            }
          }
        }

        // 确保URL是有效的
        if (coverImage) {
          console.log('📸 原始封面URL:', coverImage)
          // 对于显示用途，使用原始URL
          coverImage = this.normalizeImageUrl(coverImage, true)
          console.log('📸 处理后封面URL:', coverImage)
        } else {
          console.log('❌ 未找到任何封面图片')
        }

        // 安全地提取所有字段，不给无标题设置默认值
        const title = this.extractText(properties.Title || properties.title)
        const summary = this.extractText(properties.Summary || properties.summary) || ''
        const tags = this.extractMultiSelect(properties.Tags || properties.tags) || []
        const category = this.extractSelect(properties.Category || properties.category) || '未分类'
        const publishDate = this.extractDate(properties['Published Date'] || properties.PublishDate || properties.publishDate) || ''
        const readTime = this.extractText(properties.ReadTime || properties.readTime) || '5分钟'
        const published = this.extractCheckbox(properties.Published || properties.published) || false

        // 如果没有标题，返回null，后面会被过滤掉
        if (!title || title.trim() === '') {
          console.log('跳过无标题页面:', page.id)
          return null
        }

        // 提取其他博客信息，不再需要MarkdownURL
        return {
          id: page.id || '',
          title: title.trim(),
          summary,
          tags,
          category,
          publishDate,
          readTime,
          published,
          coverImage: coverImage || null,
          url: page.url || '',
          lastEditedTime: page.last_edited_time || '',
          createdTime: page.created_time || ''
        }
      } catch (error) {
        console.error('Error formatting blog item:', error, page)
        // 出错的页面也不显示
        return null
      }
    }).filter(blog => blog !== null && blog.id && blog.title) // 过滤掉无效的项目
  }

  /**
   * 获取过滤器类型
   * @private
   */
  getFilterType(value) {
    if (value === null || value === undefined) return 'rich_text'
    if (typeof value === 'string') return 'rich_text'
    if (typeof value === 'boolean') return 'checkbox'
    if (typeof value === 'number') return 'number'
    if (value instanceof Date) return 'date'
    if (Array.isArray(value)) return 'multi_select'
    return 'rich_text'
  }

  // 辅助方法
  extractText(property) {
    if (!property) return ''
    try {
      if (property.rich_text && Array.isArray(property.rich_text)) {
        return property.rich_text.map(text => text.plain_text || '').join('')
      }
      if (property.title && Array.isArray(property.title)) {
        return property.title.map(text => text.plain_text || '').join('')
      }
    } catch (error) {
      console.warn('Error extracting text:', error)
    }
    return ''
  }

  extractMultiSelect(property) {
    if (!property || !property.multi_select || !Array.isArray(property.multi_select)) return []
    try {
      return property.multi_select.map(option => option.name || '').filter(name => name)
    } catch (error) {
      console.warn('Error extracting multi-select:', error)
      return []
    }
  }

  extractSelect(property) {
    if (!property || !property.select) return ''
    try {
      return property.select.name || ''
    } catch (error) {
      console.warn('Error extracting select:', error)
      return ''
    }
  }

  extractDate(property) {
    if (!property || !property.date) return ''
    try {
      return new Date(property.date.start).toLocaleDateString('zh-CN')
    } catch (error) {
      console.warn('Error extracting date:', error)
      return ''
    }
  }

  extractCheckbox(property) {
    if (!property) return false
    try {
      return Boolean(property.checkbox)
    } catch (error) {
      console.warn('Error extracting checkbox:', error)
      return false
    }
  }

  /**
   * 提取封面图URL - 专门处理Notion页面封面
   * @param {Object} cover - Notion页面的cover对象
   * @returns {string} 封面图URL
   * @private
   */
  extractCoverImage(cover) {
    console.log('📸 提取封面图，cover对象:', cover)
    
    if (!cover) {
      console.log('❌ 页面没有设置封面图')
      return null
    }

    // 处理外部链接封面（用户在Notion中设置的外部图片URL）
    if (cover.type === 'external' && cover.external?.url) {
      console.log('✅ 找到外部链接封面:', cover.external.url)
      return cover.external.url
    }

    // 处理上传到Notion的文件封面
    if (cover.type === 'file' && cover.file?.url) {
      console.log('✅ 找到Notion文件封面:', cover.file.url)
      return cover.file.url
    }

    // 处理其他可能的封面类型
    if (cover.type && cover[cover.type]?.url) {
      console.log(`✅ 找到${cover.type}类型封面:`, cover[cover.type].url)
      return cover[cover.type].url
    }

    console.log('❌ 无法从cover对象提取URL，cover类型:', cover.type)
    return null
  }

  /**
   * 提取文件URL（从属性中）- 专门针对Notion存储的图片
   * @param {Object} property - Notion属性对象
   * @returns {string} 文件URL
   * @private
   */
  extractFileUrl(property) {
    if (!property) return null

    let url = null

    // 处理文件类型属性
    if (property.files && property.files.length > 0) {
      const file = property.files[0]
      if (file.type === 'external' && file.external?.url) {
        url = file.external.url
      }
      if (file.type === 'file' && file.file?.url) {
        url = file.file.url
      }
    }

    // 处理URL类型属性
    if (property.url) {
      url = property.url
    }

    // 处理富文本类型属性（可能包含图片URL）
    if (property.rich_text && property.rich_text.length > 0) {
      url = property.rich_text[0].plain_text
    }

    console.log('📎 从属性提取到URL:', url)
    return url
  }

  /**
   * 标准化图片URL - 专门针对Notion图片
   * @param {string} url - 原始图片URL
   * @param {boolean} forDisplay - 是否用于显示（true）或编辑（false）
   * @returns {string} 标准化后的URL
   * @private
   */
  normalizeImageUrl(url, forDisplay = true) {
    if (!url) return url
    
    console.log('🖼️ 处理图片URL:', url)
    
    // 对于Notion内部图片，直接返回原始URL
    // Notion的图片URL通常是预签名的，可以直接使用
    if (url.includes('amazonaws.com') || 
        url.includes('notion-static.com') || 
        url.includes('s3.us-west-2.amazonaws.com') ||
        url.includes('prod-files-secure')) {
      console.log('✅ Notion内部图片，直接使用:', url)
      return url
    }

    // 如果是外部URL（比如用户直接在Notion中设置的外部图片链接）
    console.log('🔗 外部图片URL，直接使用:', url)
    return url
  }
}

// 导出单例实例
export const notionService = new NotionService()
export default notionService
