/**
 * API 客户端
 * 统一处理HTTP请求，包含错误处理、重试机制等
 */

import { config } from '@/config'

export class ApiClient {
  constructor() {
    this.baseURL = config.notion.baseUrl
    this.retryCount = 3
    this.retryDelay = 1000
  }

  /**
   * 通用请求方法
   * @private
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    
    // 代理已经处理认证，这里只需要基本头部
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    }

    const requestOptions = {
      ...options,
      headers
    }

    let lastError

    for (let attempt = 1; attempt <= this.retryCount; attempt++) {
      try {
        config.log(`API Request (attempt ${attempt}):`, url)

        const response = await fetch(url, requestOptions)

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new ApiError(
            response.status,
            errorData.message || response.statusText,
            errorData
          )
        }

        const data = await response.json()
        config.log('API Response:', data)
        return data

      } catch (error) {
        lastError = error
        config.error(`API request failed (attempt ${attempt}):`, error)

        // 如果是最后一次尝试或者是不可重试的错误，直接抛出
        if (attempt === this.retryCount || !this.isRetryableError(error)) {
          break
        }

        // 等待后重试
        await this.delay(this.retryDelay * attempt)
      }
    }

    throw lastError
  }

  /**
   * GET请求
   */
  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString()
    const url = queryString ? `${endpoint}?${queryString}` : endpoint

    return this.request(url, {
      method: 'GET'
    })
  }

  /**
   * POST请求
   */
  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  /**
   * PUT请求
   */
  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }
  
  /**
   * PATCH请求
   */
  async patch(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data)
    })
  }

  /**
   * DELETE请求
   */
  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE'
    })
  }

  /**
   * 判断是否为可重试的错误
   * @private
   */
  isRetryableError(error) {
    if (error instanceof ApiError) {
      // 500系列错误和429限流错误可以重试
      return error.status >= 500 || error.status === 429
    }
    
    // 网络错误可以重试
    return error.name === 'TypeError' && error.message.includes('fetch')
  }

  /**
   * 延迟函数
   * @private
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

/**
 * API错误类
 */
export class ApiError extends Error {
  constructor(status, message, details = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
  }

  /**
   * 获取用户友好的错误信息
   */
  getUserMessage() {
    switch (this.status) {
    case 401:
      return 'API密钥无效，请检查配置'
    case 403:
      return '权限不足，请检查Integration权限设置'
    case 404:
      return '找不到指定的数据库或页面'
    case 429:
      return '请求频率过高，请稍后重试'
    case 500:
    case 502:
    case 503:
    case 504:
      return 'Notion服务暂时不可用，请稍后重试'
    default:
      return this.message || '未知错误'
    }
  }
}

export default ApiClient
