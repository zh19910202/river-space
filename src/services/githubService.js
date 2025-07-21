/**
 * GitHub API 服务
 * 处理与GitHub API的交互，用于更新博客Markdown文件
 */

import { config } from '@/config'

export class GitHubService {
  constructor() {
    this.baseUrl = 'https://api.github.com'
  }

  /**
   * 从GitHub URL中提取仓库信息
   * @param {string} url - GitHub URL
   * @returns {Object} 仓库信息
   */
  parseGitHubUrl(url) {
    try {
      // 支持多种GitHub URL格式
      // 例如: https://github.com/username/repo/blob/main/path/to/file.md
      // 或者: https://raw.githubusercontent.com/username/repo/main/path/to/file.md
      
      let match
      
      if (url.includes('github.com')) {
        match = url.match(/github\.com\/([^\/]+)\/([^\/]+)\/blob\/([^\/]+)\/(.+)/)
      } else if (url.includes('raw.githubusercontent.com')) {
        match = url.match(/raw\.githubusercontent\.com\/([^\/]+)\/([^\/]+)\/([^\/]+)\/(.+)/)
      }
      
      if (!match) {
        throw new Error('无效的GitHub URL格式')
      }
      
      const [, owner, repo, branch, path] = match
      
      return {
        owner,
        repo,
        branch,
        path
      }
    } catch (error) {
      console.error('解析GitHub URL失败:', error)
      throw new Error(`无法解析GitHub URL: ${error.message}`)
    }
  }

  /**
   * 更新GitHub文件内容
   * @param {string} url - GitHub文件URL
   * @param {string} content - 新内容
   * @param {string} message - 提交消息
   * @param {string} token - GitHub令牌
   * @returns {Promise<Object>} 更新结果
   */
  async updateFile(url, content, message = 'Update from River Space', token) {
    try {
      if (!token) {
        throw new Error('缺少GitHub令牌')
      }
      
      const { owner, repo, path, branch } = this.parseGitHubUrl(url)
      
      // 1. 首先获取当前文件信息，包括SHA
      const fileInfoUrl = `${this.baseUrl}/repos/${owner}/${repo}/contents/${path}?ref=${branch}`
      const fileResponse = await fetch(fileInfoUrl, {
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'River-Space-Blog'
        }
      })
      
      if (!fileResponse.ok) {
        throw new Error(`获取文件信息失败: ${fileResponse.status} ${fileResponse.statusText}`)
      }
      
      const fileInfo = await fileResponse.json()
      const sha = fileInfo.sha
      
      // 2. 更新文件
      const updateUrl = `${this.baseUrl}/repos/${owner}/${repo}/contents/${path}`
      const updateResponse = await fetch(updateUrl, {
        method: 'PUT',
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
          'User-Agent': 'River-Space-Blog'
        },
        body: JSON.stringify({
          message,
          content: btoa(unescape(encodeURIComponent(content))), // Base64编码
          sha,
          branch
        })
      })
      
      if (!updateResponse.ok) {
        throw new Error(`更新文件失败: ${updateResponse.status} ${updateResponse.statusText}`)
      }
      
      return await updateResponse.json()
      
    } catch (error) {
      console.error('更新GitHub文件失败:', error)
      throw new Error(`更新GitHub文件失败: ${error.message}`)
    }
  }
}

// 导出单例实例
export const githubService = new GitHubService()
export default githubService
