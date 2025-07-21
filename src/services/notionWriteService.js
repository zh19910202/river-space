/**
 * Notion写入服务
 * 扩展现有的NotionService，添加创建和更新功能
 */

import { config } from '../config/index.js'

export class NotionWriteService {
  constructor() {
    this.apiBaseUrl = config.notion.baseUrl
  }

  /**
   * 创建新的博客页面
   * @param {Object} pageData - 页面数据
   * @returns {Promise<Object>} 创建的页面对象
   */
  async createBlogPage(pageData) {
    try {
      console.log('Creating Notion page:', pageData)
      
      const response = await fetch(`${this.apiBaseUrl}/pages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(pageData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`创建页面失败: ${errorData.message || response.statusText}`)
      }

      const result = await response.json()
      console.log('Page created successfully:', result.id)
      
      return result
    } catch (error) {
      console.error('Create page error:', error)
      throw error
    }
  }

  /**
   * 更新页面内容
   * @param {string} pageId - 页面ID
   * @param {Array} blocks - 内容块数组
   */
  async updatePageContent(pageId, blocks) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/blocks/${pageId}/children`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          children: blocks
        })
      })

      if (!response.ok) {
        throw new Error(`更新内容失败: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Update content error:', error)
      throw error
    }
  }

  /**
   * 将Markdown转换为Notion块
   * @param {string} markdown - Markdown内容
   * @returns {Array} Notion块数组
   */
  markdownToNotionBlocks(markdown) {
    const blocks = []
    const lines = markdown.split('\n')
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      
      if (!line) continue
      
      // 标题
      if (line.startsWith('# ')) {
        blocks.push({
          object: 'block',
          type: 'heading_1',
          heading_1: {
            rich_text: [{
              type: 'text',
              text: { content: line.substring(2) }
            }]
          }
        })
      } else if (line.startsWith('## ')) {
        blocks.push({
          object: 'block',
          type: 'heading_2',
          heading_2: {
            rich_text: [{
              type: 'text',
              text: { content: line.substring(3) }
            }]
          }
        })
      } else if (line.startsWith('### ')) {
        blocks.push({
          object: 'block',
          type: 'heading_3',
          heading_3: {
            rich_text: [{
              type: 'text',
              text: { content: line.substring(4) }
            }]
          }
        })
      }
      // 代码块
      else if (line.startsWith('```')) {
        const language = line.substring(3) || 'plain text'
        const codeLines = []
        i++
        
        while (i < lines.length && !lines[i].trim().startsWith('```')) {
          codeLines.push(lines[i])
          i++
        }
        
        blocks.push({
          object: 'block',
          type: 'code',
          code: {
            language: language,
            rich_text: [{
              type: 'text',
              text: { content: codeLines.join('\n') }
            }]
          }
        })
      }
      // 引用
      else if (line.startsWith('> ')) {
        blocks.push({
          object: 'block',
          type: 'quote',
          quote: {
            rich_text: [{
              type: 'text',
              text: { content: line.substring(2) }
            }]
          }
        })
      }
      // 列表
      else if (line.startsWith('- ') || line.startsWith('* ')) {
        blocks.push({
          object: 'block',
          type: 'bulleted_list_item',
          bulleted_list_item: {
            rich_text: [{
              type: 'text',
              text: { content: line.substring(2) }
            }]
          }
        })
      }
      // 有序列表
      else if (/^\d+\.\s/.test(line)) {
        blocks.push({
          object: 'block',
          type: 'numbered_list_item',
          numbered_list_item: {
            rich_text: [{
              type: 'text',
              text: { content: line.replace(/^\d+\.\s/, '') }
            }]
          }
        })
      }
      // 普通段落
      else {
        blocks.push({
          object: 'block',
          type: 'paragraph',
          paragraph: {
            rich_text: this.parseRichText(line)
          }
        })
      }
    }
    
    return blocks
  }

  /**
   * 解析富文本格式
   * @param {string} text - 文本内容
   * @returns {Array} 富文本数组
   */
  parseRichText(text) {
    const richText = []
    const currentText = text
    
    // 简单的格式解析（粗体、斜体、代码）
    const parts = currentText.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g)
    
    parts.forEach(part => {
      if (!part) return
      
      if (part.startsWith('**') && part.endsWith('**')) {
        // 粗体
        richText.push({
          type: 'text',
          text: { content: part.slice(2, -2) },
          annotations: { bold: true }
        })
      } else if (part.startsWith('*') && part.endsWith('*')) {
        // 斜体
        richText.push({
          type: 'text',
          text: { content: part.slice(1, -1) },
          annotations: { italic: true }
        })
      } else if (part.startsWith('`') && part.endsWith('`')) {
        // 代码
        richText.push({
          type: 'text',
          text: { content: part.slice(1, -1) },
          annotations: { code: true }
        })
      } else {
        // 普通文本
        richText.push({
          type: 'text',
          text: { content: part }
        })
      }
    })
    
    return richText.length > 0 ? richText : [{
      type: 'text',
      text: { content: text }
    }]
  }

  /**
   * 更新现有页面
   * @param {string} pageId - 页面ID
   * @param {Object} formData - 表单数据
   * @returns {Promise<Object>} 更新的页面对象
   */
  async updateBlogPage(pageId, formData) {
    try {
      console.log('Updating Notion page:', pageId, formData)
      
      const updateData = this.buildUpdateData(formData)
      
      const response = await fetch(`${this.apiBaseUrl}/pages/${pageId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`更新页面失败: ${errorData.message || response.statusText}`)
      }

      const result = await response.json()
      console.log('Page updated successfully:', result.id)
      
      return result
    } catch (error) {
      console.error('Update page error:', error)
      throw error
    }
  }

  /**
   * 替换页面内容
   * @param {string} pageId - 页面ID
   * @param {Array} blocks - 新的内容块数组
   */
  async replacePageContent(pageId, blocks) {
    try {
      // 首先获取现有的子块
      const childrenResponse = await fetch(`${this.apiBaseUrl}/blocks/${pageId}/children`, {
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (childrenResponse.ok) {
        const childrenData = await childrenResponse.json()
        const existingBlocks = childrenData.results || []

        // 删除现有的内容块
        for (const block of existingBlocks) {
          try {
            await fetch(`${this.apiBaseUrl}/blocks/${block.id}`, {
              method: 'DELETE',
              headers: {
                'Content-Type': 'application/json'
              }
            })
          } catch (deleteError) {
            console.warn('删除块失败:', block.id, deleteError)
          }
        }
      }

      // 添加新的内容块
      if (blocks.length > 0) {
        await this.updatePageContent(pageId, blocks)
      }

      return true
    } catch (error) {
      console.error('Replace content error:', error)
      throw error
    }
  }

  /**
   * 构建页面数据
   * @param {Object} formData - 表单数据
   * @returns {Object} Notion页面数据
   */
  buildPageData(formData) {
    const databaseId = config.notion.databaseId
    
    if (!databaseId) {
      throw new Error('Notion数据库ID未配置')
    }

    const pageData = {
      parent: { database_id: databaseId },
      properties: {
        Title: {
          title: [{ text: { content: formData.title } }]
        },
        Summary: {
          rich_text: [{ text: { content: formData.summary || '' } }]
        },
        Category: {
          select: { name: formData.category || '技术' }
        },
        Published: {
          checkbox: true
        },
        'Published Date': {
          date: { start: new Date().toISOString().split('T')[0] }
        },
        ReadTime: {
          rich_text: [{ text: { content: (formData.readTime || '5') + '分钟' } }]
        }
      }
    }

    // 添加标签
    if (formData.tags) {
      const tags = formData.tags.split(',').map(tag => ({ name: tag.trim() })).filter(tag => tag.name)
      if (tags.length > 0) {
        pageData.properties.Tags = {
          multi_select: tags
        }
      }
    }

    // 添加封面图 - 只有在有URL时才添加
    if (formData.coverImage) {
      pageData.properties.CoverImage = {
        url: formData.coverImage
      }
      pageData.cover = {
        type: 'external',
        external: { url: formData.coverImage }
      }
    }

    return pageData
  }

  /**
   * 构建更新数据（不包含parent）
   * @param {Object} formData - 表单数据
   * @returns {Object} Notion更新数据
   */
  buildUpdateData(formData) {
    const updateData = {
      properties: {
        Title: {
          title: [{ text: { content: formData.title } }]
        },
        Summary: {
          rich_text: [{ text: { content: formData.summary || '' } }]
        },
        Category: {
          select: { name: formData.category || '技术' }
        },
        ReadTime: {
          rich_text: [{ text: { content: (formData.readTime || '5') + '分钟' } }]
        }
      }
    }

    // 添加标签
    if (formData.tags) {
      const tags = formData.tags.split(',').map(tag => ({ name: tag.trim() })).filter(tag => tag.name)
      if (tags.length > 0) {
        updateData.properties.Tags = {
          multi_select: tags
        }
      }
    }

    // 添加封面图 - 只有在有URL时才添加
    if (formData.coverImage) {
      updateData.properties.CoverImage = {
        url: formData.coverImage
      }
      updateData.cover = {
        type: 'external',
        external: { url: formData.coverImage }
      }
    }

    return updateData
  }
}

// 创建实例并导出
export const notionWriteService = new NotionWriteService()
export default notionWriteService
