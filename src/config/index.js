/**
 * 应用配置管理
 * 统一管理环境变量和应用配置
 */

class AppConfig {
  constructor() {
    this.loadConfig()
  }

  loadConfig() {
    // Notion API配置
    this.notion = {
      apiKey: import.meta.env.VITE_NOTION_API_KEY || '',
      databaseId: import.meta.env.VITE_NOTION_DATABASE_ID || '',
      apiVersion: '2022-06-28',
      // Use Vite proxy in dev, serverless functions in production
      baseUrl: import.meta.env.PROD ? '/api/notion' : '/api/notion'
    }

    // 应用基本配置
    this.app = {
      title: import.meta.env.VITE_APP_TITLE || 'River Space',
      description: import.meta.env.VITE_APP_DESCRIPTION || '智能合约开发工程师个人网站',
      url: import.meta.env.VITE_APP_URL || window.location.origin,
      version: import.meta.env.VITE_APP_VERSION || '1.0.0',
      buildTime: import.meta.env.VITE_BUILD_TIME || new Date().toISOString()
    }

    // 开发配置
    this.dev = {
      mode: import.meta.env.DEV,
      apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '/api'
    }

    // 功能开关
    this.features = {
      blog: import.meta.env.VITE_ENABLE_BLOG !== 'false',
      analytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
      pwa: import.meta.env.VITE_ENABLE_PWA === 'true'
    }

    // 分析工具
    this.analytics = {
      googleAnalyticsId: import.meta.env.VITE_GOOGLE_ANALYTICS_ID || ''
    }
  }

  // 检查Notion配置是否完整
  isNotionConfigured() {
    return this.notion.apiKey && 
           this.notion.databaseId && 
           this.notion.apiKey !== 'your_notion_api_key_here' &&
           this.notion.databaseId !== 'your_database_id_here'
  }

  // 更新Notion配置（用于动态配置）
  updateNotionConfig(apiKey, databaseId) {
    this.notion.apiKey = apiKey
    this.notion.databaseId = databaseId
    
    // 持久化到localStorage（可选）
    if (typeof window !== 'undefined') {
      localStorage.setItem('notion_config', JSON.stringify({
        apiKey, databaseId
      }))
    }
  }

  // 从localStorage恢复配置
  loadFromStorage() {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('notion_config')
      if (stored) {
        try {
          const config = JSON.parse(stored)
          this.updateNotionConfig(config.apiKey, config.databaseId)
        } catch (e) {
          console.warn('Failed to load config from storage:', e)
        }
      }
    }
  }

  // 获取API请求头
  getNotionHeaders() {
    return {
      'Authorization': `Bearer ${this.notion.apiKey}`,
      'Notion-Version': this.notion.apiVersion,
      'Content-Type': 'application/json'
    }
  }

  // 开发环境日志
  log(message, ...args) {
    if (this.dev.mode) {
      console.log(`[${this.app.title}]`, message, ...args)
    }
  }

  // 错误日志
  error(message, ...args) {
    console.error(`[${this.app.title}] ERROR:`, message, ...args)
  }
}

// 导出单例实例
export const config = new AppConfig()

// 初始化时从存储恢复配置
config.loadFromStorage()

export default config
