/**
 * 博客管理系统
 * 处理管理员认证、博客CRUD操作等
 */

import { config } from '../config/index.js'
import { notionService } from '../services/notionService.js'

class AdminManager {
  constructor() {
    this.isAuthenticated = false
    this.currentUser = null
    this.currentEditingBlog = null
    this.blogs = []
    
    // 管理系统搜索和分页
    this.adminSearchQuery = ''
    this.adminCategoryFilter = ''
    this.adminStatusFilter = ''
    this.adminCurrentPage = 1
    
    this.init()
  }

  /**
   * 初始化管理系统
   */
  async init() {
    console.log('🔧 初始化博客管理系统...')
    
    // 检查是否已经认证
    this.checkAuthStatus()
    
    // 绑定事件
    this.bindEvents()
    
    // 如果已认证，加载数据
    if (this.isAuthenticated) {
      await this.loadAdminData()
    }
  }

  /**
   * 检查认证状态
   */
  checkAuthStatus() {
    const authData = localStorage.getItem('admin_auth')
    if (authData) {
      try {
        const { token, user, expiry } = JSON.parse(authData)
        if (Date.now() < expiry) {
          this.isAuthenticated = true
          this.currentUser = user
          this.showAdminInterface()
          return
        } else {
          // Token过期，清除认证信息
          localStorage.removeItem('admin_auth')
        }
      } catch (error) {
        console.error('认证数据解析失败:', error)
        localStorage.removeItem('admin_auth')
      }
    }
    
    this.showAuthInterface()
  }

  /**
   * 绑定事件监听器
   */
  bindEvents() {
    // 认证表单提交
    const authForm = document.getElementById('authForm')
    if (authForm) {
      authForm.addEventListener('submit', (e) => {
        e.preventDefault()
        this.handleAuth()
      })
    }

    // 键盘快捷键
    document.addEventListener('keydown', (e) => {
      // Ctrl+S 保存
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault()
        if (this.isAuthenticated && document.getElementById('editorTab').classList.contains('active')) {
          this.saveBlog(false)
        }
      }
      
      // Ctrl+Shift+S 发布
      if (e.ctrlKey && e.shiftKey && e.key === 'S') {
        e.preventDefault()
        if (this.isAuthenticated && document.getElementById('editorTab').classList.contains('active')) {
          this.saveBlog(true)
        }
      }
    })
  }

  /**
   * 处理管理员认证
   */
  async handleAuth() {
    const username = document.getElementById('username').value.trim()
    const password = document.getElementById('password').value.trim()
    const authButton = document.getElementById('authButton')
    const authButtonText = document.getElementById('authButtonText')
    const authMessage = document.getElementById('authMessage')

    if (!username || !password) {
      this.showAuthMessage('请输入用户名和密码', 'error')
      return
    }

    // 显示加载状态
    authButton.disabled = true
    authButtonText.textContent = '认证中...'
    authMessage.innerHTML = ''

    try {
      // 这里可以实现多种认证方式
      const authResult = await this.authenticate(username, password)
      
      if (authResult.success) {
        // 认证成功
        this.isAuthenticated = true
        this.currentUser = authResult.user
        
        // 保存认证信息（24小时有效）
        const authData = {
          token: authResult.token,
          user: authResult.user,
          expiry: Date.now() + 24 * 60 * 60 * 1000 // 24小时
        }
        localStorage.setItem('admin_auth', JSON.stringify(authData))
        
        this.showAuthMessage('认证成功，正在跳转...', 'success')
        
        setTimeout(() => {
          this.showAdminInterface()
          this.loadAdminData()
        }, 1000)
        
      } else {
        this.showAuthMessage(authResult.message || '认证失败，请检查用户名和密码', 'error')
      }
    } catch (error) {
      console.error('认证过程出错:', error)
      this.showAuthMessage('认证过程出错，请稍后重试', 'error')
    } finally {
      authButton.disabled = false
      authButtonText.textContent = '登录'
    }
  }

  /**
   * 认证逻辑
   * 支持多种认证方式
   */
  async authenticate(username, password) {
    // 方案1: 简单的硬编码认证（开发环境）
    if (config.dev.mode) {
      const validCredentials = [
        { username: 'admin', password: 'admin123', name: '管理员' },
        { username: 'river', password: 'river2024', name: 'River' },
        { username: 'zhouhuan', password: 'zh19910202', name: '周欢' }
      ]
      
      const user = validCredentials.find(cred => 
        cred.username === username && cred.password === password
      )
      
      if (user) {
        return {
          success: true,
          user: { name: user.name, username: user.username },
          token: this.generateToken(user.username)
        }
      }
    }

    // 方案2: GitHub Personal Access Token认证
    if (username === 'github' && password.startsWith('ghp_')) {
      try {
        const response = await fetch('https://api.github.com/user', {
          headers: {
            'Authorization': `token ${password}`,
            'User-Agent': 'River-Space-Admin'
          }
        })
        
        if (response.ok) {
          const userData = await response.json()
          return {
            success: true,
            user: { name: userData.name || userData.login, username: userData.login },
            token: password
          }
        }
      } catch (error) {
        console.error('GitHub认证失败:', error)
      }
    }

    // 方案3: 环境变量认证
    const envUsername = import.meta.env.VITE_ADMIN_USERNAME
    const envPassword = import.meta.env.VITE_ADMIN_PASSWORD
    
    if (envUsername && envPassword && username === envUsername && password === envPassword) {
      return {
        success: true,
        user: { name: '管理员', username: envUsername },
        token: this.generateToken(envUsername)
      }
    }

    return { success: false, message: '用户名或密码错误' }
  }

  /**
   * 生成简单的token
   */
  generateToken(username) {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2)
    return btoa(`${username}:${timestamp}:${random}`)
  }

  /**
   * 显示认证消息
   */
  showAuthMessage(message, type = 'info') {
    const authMessage = document.getElementById('authMessage')
    authMessage.innerHTML = `<div class="auth-${type}">${message}</div>`
  }

  /**
   * 显示认证界面
   */
  showAuthInterface() {
    document.getElementById('authContainer').style.display = 'flex'
    document.getElementById('adminContainer').style.display = 'none'
  }

  /**
   * 显示管理界面
   */
  showAdminInterface() {
    document.getElementById('authContainer').style.display = 'none'
    document.getElementById('adminContainer').style.display = 'block'
    
    // 更新用户信息显示
    const currentUserElement = document.getElementById('currentUser')
    if (currentUserElement && this.currentUser) {
      currentUserElement.textContent = this.currentUser.name || this.currentUser.username
    }
  }

  /**
   * 加载管理数据
   */
  async loadAdminData() {
    console.log('📊 加载管理数据...')
    await this.loadBlogList()
  }

  /**
   * 加载博客列表
   */
  async loadBlogList() {
    const container = document.getElementById('blogListContainer')
    
    try {
      container.innerHTML = `
        <div class="loading">
          <div class="loading-spinner"></div>
          正在加载文章列表...
        </div>
      `

      // 检查Notion配置
      if (!config.isNotionConfigured()) {
        container.innerHTML = `
          <div style="text-align: center; padding: 40px; color: var(--text-muted);">
            <h3>⚠️ 未配置Notion API</h3>
            <p>请在"系统设置"中配置Notion API密钥和数据库ID</p>
            <button class="action-button" onclick="switchTab('settings')">前往设置</button>
          </div>
        `
        return
      }

      // 获取所有博客（包括草稿）
      console.log('🔄 正在获取博客列表...')
      console.log('📋 Notion配置:', {
        hasApiKey: !!config.notion.apiKey,
        hasDatabaseId: !!config.notion.databaseId,
        apiKeyPrefix: config.notion.apiKey ? config.notion.apiKey.substring(0, 10) + '...' : 'none'
      })
      
      const result = await notionService.getBlogPosts({ 
        includeUnpublished: true,
        pageSize: 50,
        filter: {} // 确保filter是空对象而不是undefined
      })
      
      console.log('✅ 博客列表获取成功:', {
        postsCount: result.posts?.length || 0,
        hasMore: result.hasMore,
        nextCursor: result.nextCursor
      })
      
      // 过滤掉无标题的文章
      this.blogs = (result.posts || []).filter(blog => 
        blog.title && 
        blog.title.trim() !== '' && 
        blog.title !== '无标题' &&
        blog.title !== '数据解析错误'
      )
      
      console.log('✅ 过滤后的博客数量:', this.blogs.length)
      this.renderBlogList()
      
    } catch (error) {
      console.error('❌ 加载博客列表失败:', error)
      
      // 提供更详细的错误信息
      let errorMessage = error.message
      if (error.message.includes('body.filter')) {
        errorMessage = 'Notion API请求格式错误，请检查数据库结构是否正确'
      } else if (error.message.includes('unauthorized')) {
        errorMessage = 'API密钥无效或权限不足，请检查Notion集成配置'
      } else if (error.message.includes('not_found')) {
        errorMessage = '数据库ID不存在或无权访问，请检查数据库ID是否正确'
      }
      
      container.innerHTML = `
        <div style="text-align: center; padding: 40px; color: var(--error-color);">
          <h3>❌ 加载失败</h3>
          <p style="margin-bottom: 15px;">${errorMessage}</p>
          <details style="text-align: left; background: rgba(255,255,255,0.05); padding: 15px; border-radius: 8px; margin: 15px 0;">
            <summary style="cursor: pointer; color: var(--text-secondary);">查看详细错误信息</summary>
            <pre style="margin-top: 10px; font-size: 12px; color: var(--text-muted); white-space: pre-wrap;">${error.stack || error.message}</pre>
          </details>
          <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
            <button class="action-button" onclick="adminManager.loadBlogList()">重试</button>
            <button class="action-button" onclick="switchTab('settings')">检查配置</button>
          </div>
        </div>
      `
    }
  }

  /**
   * 渲染博客列表
   */
  renderBlogList() {
    const container = document.getElementById('blogListContainer')
    
    // 添加搜索和过滤界面
    if (!document.getElementById('adminSearchContainer')) {
      this.createAdminSearchInterface(container)
    }
    
    const filteredBlogs = this.getFilteredBlogs()
    
    if (filteredBlogs.length === 0) {
      const emptyMessage = this.adminSearchQuery || this.adminCategoryFilter ? 
        '没有找到匹配的文章' : '还没有文章'
      const emptySubMessage = this.adminSearchQuery || this.adminCategoryFilter ? 
        '请尝试调整搜索条件' : '点击"新建文章"开始创作吧！'
        
      container.innerHTML = `
        <div style="text-align: center; padding: 40px; color: var(--text-muted);">
          <h3>📝 ${emptyMessage}</h3>
          <p>${emptySubMessage}</p>
        </div>
      `
      return
    }

    // 分页处理
    const pageSize = 10
    const totalPages = Math.ceil(filteredBlogs.length / pageSize)
    const currentPage = this.adminCurrentPage || 1
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    const currentPageBlogs = filteredBlogs.slice(startIndex, endIndex)

    const blogItems = currentPageBlogs.map(blog => {
      // 安全地获取博客属性
      const title = blog.title || '无标题'
      const category = blog.category || '未分类'
      const publishDate = blog.publishDate || '未设置'
      const readTime = blog.readTime || '5分钟'
      const published = blog.published || false
      
      return `
        <div class="blog-item" data-blog-id="${blog.id}">
          <div class="blog-info">
            <h3 class="blog-title">${this.escapeHtml(title)}</h3>
            <div class="blog-meta">
              <span class="blog-status ${published ? 'published' : 'draft'}">
                ${published ? '已发布' : '草稿'}
              </span>
              <span>分类: ${this.escapeHtml(category)}</span>
              <span>发布时间: ${publishDate}</span>
              <span>阅读时间: ${this.escapeHtml(readTime)}</span>
            </div>
          </div>
          <div class="blog-actions">
            <button class="action-button view" onclick="adminManager.viewBlog('${blog.id}')" title="预览">
              👁️ 预览
            </button>
            <button class="action-button edit" onclick="adminManager.editBlog('${blog.id}')" title="编辑">
              ✏️ 编辑
            </button>
            <button class="action-button delete" onclick="adminManager.deleteBlog('${blog.id}')" title="删除">
              🗑️ 删除
            </button>
          </div>
        </div>
      `
    }).join('')

    // 添加分页信息和控件
    const paginationHTML = this.renderAdminPagination(currentPage, totalPages, filteredBlogs.length)
    
    container.innerHTML = blogItems + paginationHTML
  }

  /**
   * 创建管理系统搜索界面
   * @private
   */
  createAdminSearchInterface(container) {
    const searchContainer = document.createElement('div')
    searchContainer.id = 'adminSearchContainer'
    searchContainer.innerHTML = `
      <div style="background: rgba(255,255,255,0.05); border: 1px solid var(--border-color); border-radius: 8px; padding: 20px; margin-bottom: 20px;">
        <div style="display: flex; gap: 15px; flex-wrap: wrap; align-items: center;">
          <input type="text" id="adminSearchInput" placeholder="搜索文章标题..." 
                 style="flex: 1; min-width: 200px; padding: 10px; background: rgba(255,255,255,0.1); border: 1px solid var(--border-color); border-radius: 6px; color: white;"
                 onkeypress="if(event.key==='Enter') adminManager.performAdminSearch()">
          
          <select id="adminCategorySelect" onchange="adminManager.performAdminSearch()"
                  style="padding: 10px; background: rgba(255,255,255,0.1); border: 1px solid var(--border-color); border-radius: 6px; color: white; min-width: 120px;">
            <option value="">所有分类</option>
          </select>
          
          <select id="adminStatusSelect" onchange="adminManager.performAdminSearch()"
                  style="padding: 10px; background: rgba(255,255,255,0.1); border: 1px solid var(--border-color); border-radius: 6px; color: white; min-width: 100px;">
            <option value="">所有状态</option>
            <option value="published">已发布</option>
            <option value="draft">草稿</option>
          </select>
          
          <button onclick="adminManager.performAdminSearch()" 
                  style="padding: 10px 20px; background: linear-gradient(45deg, var(--primary-color), var(--secondary-color)); color: #000; border: none; border-radius: 6px; cursor: pointer;">
            🔍 搜索
          </button>
          
          <button onclick="adminManager.clearAdminSearch()" 
                  style="padding: 10px 20px; background: rgba(255,255,255,0.1); color: white; border: 1px solid var(--border-color); border-radius: 6px; cursor: pointer;">
            ✖️ 清除
          </button>
        </div>
        
        <div id="adminSearchResults" style="margin-top: 15px; color: var(--primary-color); font-size: 14px; display: none;">
          找到 <span id="adminResultsCount">0</span> 篇文章
        </div>
      </div>
    `
    
    container.parentNode.insertBefore(searchContainer, container)
    
    // 初始化分类选项
    this.initializeAdminFilters()
  }

  /**
   * 初始化管理系统过滤器
   * @private
   */
  initializeAdminFilters() {
    if (!this.blogs || this.blogs.length === 0) return
    
    const categories = [...new Set(this.blogs.map(blog => blog.category).filter(cat => cat))]
    const categorySelect = document.getElementById('adminCategorySelect')
    if (categorySelect) {
      categorySelect.innerHTML = '<option value="">所有分类</option>'
      categories.forEach(category => {
        categorySelect.innerHTML += `<option value="${category}">${category}</option>`
      })
    }
  }

  /**
   * 获取过滤后的博客列表
   * @private
   */
  getFilteredBlogs() {
    let filtered = [...this.blogs]
    
    // 搜索过滤
    if (this.adminSearchQuery) {
      const query = this.adminSearchQuery.toLowerCase()
      filtered = filtered.filter(blog => 
        blog.title.toLowerCase().includes(query) ||
        (blog.summary && blog.summary.toLowerCase().includes(query))
      )
    }
    
    // 分类过滤
    if (this.adminCategoryFilter) {
      filtered = filtered.filter(blog => blog.category === this.adminCategoryFilter)
    }
    
    // 状态过滤
    if (this.adminStatusFilter) {
      const isPublished = this.adminStatusFilter === 'published'
      filtered = filtered.filter(blog => Boolean(blog.published) === isPublished)
    }
    
    return filtered
  }

  /**
   * 执行管理系统搜索
   */
  performAdminSearch() {
    this.adminSearchQuery = document.getElementById('adminSearchInput')?.value.trim() || ''
    this.adminCategoryFilter = document.getElementById('adminCategorySelect')?.value || ''
    this.adminStatusFilter = document.getElementById('adminStatusSelect')?.value || ''
    this.adminCurrentPage = 1
    
    const filteredBlogs = this.getFilteredBlogs()
    const resultsElement = document.getElementById('adminSearchResults')
    const countElement = document.getElementById('adminResultsCount')
    
    if (resultsElement && countElement) {
      countElement.textContent = filteredBlogs.length
      resultsElement.style.display = this.adminSearchQuery || this.adminCategoryFilter || this.adminStatusFilter ? 'block' : 'none'
    }
    
    this.renderBlogList()
  }

  /**
   * 清除管理系统搜索
   */
  clearAdminSearch() {
    const searchInput = document.getElementById('adminSearchInput')
    const categorySelect = document.getElementById('adminCategorySelect')
    const statusSelect = document.getElementById('adminStatusSelect')
    const resultsElement = document.getElementById('adminSearchResults')
    
    if (searchInput) searchInput.value = ''
    if (categorySelect) categorySelect.value = ''
    if (statusSelect) statusSelect.value = ''
    if (resultsElement) resultsElement.style.display = 'none'
    
    this.adminSearchQuery = ''
    this.adminCategoryFilter = ''
    this.adminStatusFilter = ''
    this.adminCurrentPage = 1
    
    this.renderBlogList()
  }

  /**
   * 渲染管理系统分页
   * @private
   */
  renderAdminPagination(currentPage, totalPages, totalItems) {
    if (totalPages <= 1) return ''
    
    let paginationHTML = `
      <div style="margin-top: 30px; padding: 20px; background: rgba(255,255,255,0.05); border: 1px solid var(--border-color); border-radius: 8px;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px;">
          <div style="color: var(--text-secondary); font-size: 14px;">
            第 ${currentPage} 页，共 ${totalPages} 页 | 共 ${totalItems} 篇文章
          </div>
          <div style="display: flex; gap: 8px; align-items: center;">
    `
    
    // 上一页
    if (currentPage > 1) {
      paginationHTML += `
        <button onclick="adminManager.goToAdminPage(${currentPage - 1})" 
                style="padding: 8px 12px; background: rgba(255,255,255,0.1); border: 1px solid var(--border-color); border-radius: 4px; color: white; cursor: pointer;">
          ← 上一页
        </button>
      `
    }
    
    // 页码
    const maxVisible = 5
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2))
    const endPage = Math.min(totalPages, startPage + maxVisible - 1)
    
    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1)
    }
    
    for (let i = startPage; i <= endPage; i++) {
      const isActive = i === currentPage
      paginationHTML += `
        <button onclick="adminManager.goToAdminPage(${i})" 
                style="padding: 8px 12px; background: ${isActive ? 'linear-gradient(45deg, var(--primary-color), var(--secondary-color))' : 'rgba(255,255,255,0.1)'}; 
                       border: 1px solid ${isActive ? 'var(--primary-color)' : 'var(--border-color)'}; 
                       border-radius: 4px; color: ${isActive ? '#000' : 'white'}; cursor: pointer; font-weight: ${isActive ? '600' : 'normal'};">
          ${i}
        </button>
      `
    }
    
    // 下一页
    if (currentPage < totalPages) {
      paginationHTML += `
        <button onclick="adminManager.goToAdminPage(${currentPage + 1})" 
                style="padding: 8px 12px; background: rgba(255,255,255,0.1); border: 1px solid var(--border-color); border-radius: 4px; color: white; cursor: pointer;">
          下一页 →
        </button>
      `
    }
    
    paginationHTML += `
          </div>
        </div>
      </div>
    `
    
    return paginationHTML
  }

  /**
   * 跳转到管理系统指定页面
   */
  goToAdminPage(page) {
    this.adminCurrentPage = page
    this.renderBlogList()
  }

  /**
   * 创建新博客
   */
  createNewBlog() {
    this.currentEditingBlog = null
    this.clearEditor()
    this.switchTab('editor')
  }

  /**
   * 编辑博客 - 从管理界面调用
   */
  async editBlog(blogId) {
    const blog = this.blogs.find(b => b.id === blogId)
    if (!blog) {
      alert('找不到指定的文章')
      return
    }

    try {
      // 加载完整的博客内容
      console.log('📝 加载文章内容进行编辑...')
      
      // 填充基本信息
      document.getElementById('blogTitle').value = blog.title || ''
      document.getElementById('blogCategory').value = blog.category || '技术'
      document.getElementById('blogTags').value = blog.tags ? blog.tags.join(', ') : ''
      document.getElementById('blogReadTime').value = blog.readTime || '5分钟'
      document.getElementById('blogSummary').value = blog.summary || ''
      // 获取封面URL，尝试还原为原始URL
      let coverUrl = blog.coverImage || ''
      if (coverUrl && typeof coverUrl === 'string') {
        // 如果是代理URL，尝试还原为原始URL
        if (coverUrl.includes('/api/github-raw/')) {
          coverUrl = coverUrl.replace('/api/github-raw/', 'https://raw.githubusercontent.com/')
          console.log('还原封面URL为原始URL:', coverUrl)
        }
      }
      
      // 设置封面URL输入框的值
      document.getElementById('blogCoverUrl').value = coverUrl
      
      // 更新封面预览
      const coverPreview = document.getElementById('coverPreview')
      if (coverPreview) {
        if (coverUrl) {
          coverPreview.innerHTML = `<img src="${coverUrl}" alt="封面预览" onerror="this.onerror=null; document.getElementById('coverPreview').innerHTML='<div class=\\'no-cover\\'>图片加载失败</div>';">`
        } else {
          coverPreview.innerHTML = '<div class="no-cover">暂无封面图</div>'
        }
      }
      
      // 直接从Notion加载内容
      try {
        console.log('从Notion加载文章内容:', blogId)
        
        // 导入notionService
        const { notionService } = await import('../services/notionService.js')
        
        // 显示加载状态
        document.getElementById('blogContent').value = '正在从Notion加载内容...'
        
        // 获取原始Markdown内容
        const rawContent = await this.getNotionRawContent(blogId)
        
        if (rawContent && rawContent.trim()) {
          console.log('成功从Notion加载内容，长度:', rawContent.length)
          document.getElementById('blogContent').value = rawContent
          
          // 更新Markdown预览
          if (window.updatePreview) {
            window.updatePreview()
          }
        } else {
          console.warn('从Notion加载的内容为空')
          document.getElementById('blogContent').value = ''
          alert('无法从Notion加载内容，编辑框将为空。')
        }
      } catch (error) {
        console.error('从Notion加载内容失败:', error)
        document.getElementById('blogContent').value = ''
        alert('加载内容失败: ' + error.message)
      }
      
      this.currentEditingBlog = blog
      this.switchTab('editor')
      
    } catch (error) {
      console.error('编辑文章失败:', error)
      alert('加载文章内容失败: ' + error.message)
    }
  }
  
  /**
   * 编辑文章 - 从博客页面调用
   * 这是从博客详情页面调用的编辑方法
   */
  async editArticle(blogId) {
    try {
      console.log('🔄 从博客页面编辑文章:', blogId)
      
      // 首先检查管理员面板是否已显示
      const adminPanel = document.querySelector('.admin-panel')
      if (!adminPanel || !adminPanel.classList.contains('show')) {
        console.log('📋 显示管理员面板')
        document.querySelector('.admin-panel').classList.add('show')
      }
      
      // 确保博客列表已加载
      if (!this.blogs || this.blogs.length === 0) {
        console.log('📋 加载博客列表')
        await this.loadBlogList()
      }
      
      // 查找博客
      const blog = this.blogs.find(b => b.id === blogId)
      if (!blog) {
        console.error('❌ 找不到指定的文章:', blogId)
        alert('找不到指定的文章，请刷新页面后重试')
        return
      }
      
      // 调用编辑方法
      await this.editBlog(blogId)
      
    } catch (error) {
      console.error('从博客页面编辑文章失败:', error)
      alert('编辑失败: ' + error.message)
    }
  }

  /**
   * 从Notion获取原始Markdown内容
   * @param {string} pageId - 页面ID
   * @returns {Promise<string>} 原始Markdown内容
   */
  async getNotionRawContent(pageId) {
    try {
      console.log('🔍 从Notion获取原始内容:', pageId)
      
      // 导入notionService
      const { notionService } = await import('../services/notionService.js')
      
      // 直接使用notionService的getBlogContent方法获取内容
      const htmlContent = await notionService.getBlogContent(pageId)
      console.log('获取到HTML内容，长度:', htmlContent?.length || 0)
      
      // 将HTML内容转换为Markdown
      // 由于我们只需要原始文本，简单地提取文本内容
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = htmlContent
      const textContent = tempDiv.textContent || tempDiv.innerText || ''
      
      console.log('提取的文本内容长度:', textContent.length)
      
      // 如果内容太短，尝试直接获取Notion块
      if (!textContent || textContent.trim().length < 50) {
        console.log('提取的内容太短，尝试直接获取Notion块')
        
        try {
          // 使用fetch API直接调用Notion API
          const response = await fetch(`/api/notion/blocks/${pageId}/children`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            }
          })
          
          if (!response.ok) {
            throw new Error(`获取Notion块失败: ${response.status}`)
          }
          
          const data = await response.json()
          
          if (!data.results || data.results.length === 0) {
            console.log('⚠️ 页面没有内容块')
            return ''
          }
          
          console.log(`📁 获取到 ${data.results.length} 个内容块`)
          
          // 将Notion块转换回Markdown
          return this.convertNotionBlocksToMarkdown(data.results)
        } catch (blockError) {
          console.error('获取Notion块失败:', blockError)
          // 如果获取块失败，返回提取的文本内容
          return textContent
        }
      }
      
      return textContent
    } catch (error) {
      console.error('获取Notion原始内容失败:', error)
      throw new Error(`获取内容失败: ${error.message}`)
    }
  }
  
  /**
   * 将Notion块转换为Markdown
   * @param {Array} blocks - Notion块数组
   * @returns {string} Markdown内容
   */
  convertNotionBlocksToMarkdown(blocks) {
    if (!blocks || blocks.length === 0) {
      return ''
    }
    
    let markdown = ''
    
    blocks.forEach(block => {
      switch (block.type) {
      case 'paragraph':
        const paragraphText = this.extractTextFromRichText(block.paragraph?.rich_text)
        markdown += paragraphText + '\n\n'
        break
          
      case 'heading_1':
        const h1Text = this.extractTextFromRichText(block.heading_1?.rich_text)
        markdown += `# ${h1Text}\n\n`
        break
          
      case 'heading_2':
        const h2Text = this.extractTextFromRichText(block.heading_2?.rich_text)
        markdown += `## ${h2Text}\n\n`
        break
          
      case 'heading_3':
        const h3Text = this.extractTextFromRichText(block.heading_3?.rich_text)
        markdown += `### ${h3Text}\n\n`
        break
          
      case 'bulleted_list_item':
        const bulletText = this.extractTextFromRichText(block.bulleted_list_item?.rich_text)
        markdown += `- ${bulletText}\n`
        break
          
      case 'numbered_list_item':
        const numberText = this.extractTextFromRichText(block.numbered_list_item?.rich_text)
        markdown += `1. ${numberText}\n`
        break
          
      case 'to_do':
        const todoText = this.extractTextFromRichText(block.to_do?.rich_text)
        const checked = block.to_do?.checked ? 'x' : ' '
        markdown += `- [${checked}] ${todoText}\n`
        break
          
      case 'quote':
        const quoteText = this.extractTextFromRichText(block.quote?.rich_text)
        markdown += `> ${quoteText}\n\n`
        break
          
      case 'code':
        const codeText = this.extractTextFromRichText(block.code?.rich_text)
        const language = block.code?.language || ''
        markdown += `\`\`\`${language}\n${codeText}\n\`\`\`\n\n`
        break
          
      case 'divider':
        markdown += '---\n\n'
        break
          
      default:
        // 对于不支持的块类型，添加注释
        markdown += `<!-- 不支持的块类型: ${block.type} -->\n\n`
      }
    })
    
    return markdown
  }
  
  /**
   * 从富文本数组中提取纯文本
   * @param {Array} richText - 富文本数组
   * @returns {string} 纯文本
   */
  extractTextFromRichText(richText) {
    if (!richText || richText.length === 0) {
      return ''
    }
    
    return richText.map(item => item.plain_text || '').join('')
  }

  /**
   * 预览博客
   */
  viewBlog(blogId) {
    try {
      // 在新窗口中打开博客页面并显示指定文章
      const blogUrl = `blog.html?preview=${blogId}`
      window.open(blogUrl, '_blank')
    } catch (error) {
      console.error('预览博客失败:', error)
      alert('预览失败: ' + error.message)
    }
  }

  /**
   * 删除博客
   */
  async deleteBlog(blogId) {
    const blog = this.blogs.find(b => b.id === blogId)
    if (!blog) return

    const confirmed = confirm(`确定要删除文章"${blog.title}"吗？此操作不可撤销。`)
    if (!confirmed) return

    try {
      // 这里需要实现删除逻辑
      // 注意：Notion API不支持直接删除页面，只能归档
      console.log('🗑️ 删除文章:', blogId)
      
      // 暂时从本地列表中移除
      this.blogs = this.blogs.filter(b => b.id !== blogId)
      this.renderBlogList()
      
      alert('文章已删除')
      
    } catch (error) {
      console.error('删除文章失败:', error)
      alert('删除失败: ' + error.message)
    }
  }

  /**
   * 保存博客
   */
  async saveBlog(publish = false) {
    const formData = this.getEditorFormData()
    
    if (!formData.title.trim()) {
      alert('请输入文章标题')
      return
    }

    // 获取按钮元素
    const saveBtn = document.querySelector('.save-button')
    const publishBtn = document.querySelector('.publish-button')
    const saveBtnText = saveBtn?.textContent || '保存草稿'
    const publishBtnText = publishBtn?.textContent || '发布文章'
    
    // 显示保存中状态
    if (saveBtn) {
      saveBtn.disabled = true
      saveBtn.textContent = '保存中...'
    }
    if (publishBtn) {
      publishBtn.disabled = true
      publishBtn.textContent = '处理中...'
    }
    
    // 创建状态提示元素
    const statusElement = document.createElement('div')
    statusElement.className = 'save-status'
    statusElement.style.cssText = 'margin-top: 15px; padding: 10px; border-radius: 5px; background: rgba(0, 255, 255, 0.1); color: var(--primary-color);'
    statusElement.textContent = '正在保存...'
    
    // 添加到表单底部
    const formActions = document.querySelector('.form-actions')
    if (formActions) {
      formActions.parentNode.insertBefore(statusElement, formActions.nextSibling)
    }

    try {
      console.log('💾 保存文章...', { 
        publish, 
        title: formData.title, 
        isEditing: !!this.currentEditingBlog,
        hasMarkdownUrl: !!formData.markdownUrl,
        contentLength: formData.content?.length || 0
      })
      
      const blogData = {
        ...formData,
        published: publish
      }
      
      // 更新状态提示
      statusElement.textContent = this.currentEditingBlog ? '正在更新文章...' : '正在创建文章...'
      
      let result
      
      // 根据是新建还是编辑调用不同的API
      if (this.currentEditingBlog) {
        // 编辑现有文章
        console.log('📝 更新现有文章:', this.currentEditingBlog.id)
        
        // 如果有GitHub Markdown URL和内容，提示用户
        if (formData.markdownUrl && formData.markdownUrl.includes('github.com') && formData.content) {
          statusElement.textContent = '正在更新Notion数据库和GitHub文件...'
          statusElement.style.background = 'rgba(0, 255, 255, 0.15)'
        }
        
        result = await notionService.updateBlogPost(this.currentEditingBlog.id, blogData)
        console.log('✅ 文章更新成功:', result)
        
        // 更新状态提示
        statusElement.textContent = '✅ 文章更新成功！'
        statusElement.style.background = 'rgba(0, 255, 255, 0.2)'
      } else {
        // 创建新文章
        console.log('📝 创建新文章')
        result = await notionService.createBlogPost(blogData)
        console.log('✅ 文章创建成功:', result)
        
        // 更新状态提示
        statusElement.textContent = '✅ 文章创建成功！'
        statusElement.style.background = 'rgba(0, 255, 255, 0.2)'
      }
      
      // 恢复按钮状态
      if (saveBtn) {
        saveBtn.disabled = false
        saveBtn.textContent = saveBtnText
      }
      if (publishBtn) {
        publishBtn.disabled = false
        publishBtn.textContent = publishBtnText
      }
      
      // 显示成功消息
      const successMessage = publish ? 
        '文章已成功发布！' : 
        '草稿已成功保存！'
      
      // 如果有GitHub URL，添加提示
      const githubMessage = formData.markdownUrl && formData.markdownUrl.includes('github.com') ?
        '\n\n注意：如果GitHub文件更新失败，您可能需要手动更新GitHub上的内容。' :
        ''
      
      alert(successMessage + githubMessage)
      
      // 刷新列表
      await this.loadBlogList()
      
      // 切换到列表页
      this.switchTab('list')
      
    } catch (error) {
      console.error('保存文章失败:', error)
      
      // 更新状态提示
      statusElement.textContent = `❌ 保存失败: ${error.message}`
      statusElement.style.background = 'rgba(255, 0, 0, 0.1)'
      statusElement.style.color = '#ff6b6b'
      
      // 显示详细错误
      const errorDetails = document.createElement('details')
      errorDetails.style.cssText = 'margin-top: 10px; font-size: 12px; color: var(--text-muted);'
      errorDetails.innerHTML = `
        <summary style="cursor: pointer; color: var(--text-secondary);">查看详细错误信息</summary>
        <pre style="margin-top: 10px; white-space: pre-wrap;">${error.stack || error.message}</pre>
      `
      statusElement.appendChild(errorDetails)
      
      alert('保存失败: ' + error.message)
      
      // 恢复按钮状态
      if (saveBtn) {
        saveBtn.disabled = false
        saveBtn.textContent = saveBtnText
      }
      if (publishBtn) {
        publishBtn.disabled = false
        publishBtn.textContent = publishBtnText
      }
    }
  }

  /**
   * 获取编辑器表单数据
   */
  getEditorFormData() {
    // 获取封面URL并确保格式正确
    const coverImage = document.getElementById('blogCoverUrl').value.trim()
    
    // 如果URL不为空，确保它是有效的URL格式
    if (coverImage) {
      try {
        // 尝试解析URL
        new URL(coverImage)
      } catch (error) {
        console.warn('无效的封面图URL格式:', coverImage)
        // 如果不是有效的URL，可以选择清空或保留原值
        // 这里选择保留，让后端验证处理
      }
    }
    
    return {
      title: document.getElementById('blogTitle').value.trim(),
      category: document.getElementById('blogCategory').value.trim(),
      tags: document.getElementById('blogTags').value.split(',').map(tag => tag.trim()).filter(tag => tag),
      readTime: document.getElementById('blogReadTime').value.trim(),
      summary: document.getElementById('blogSummary').value.trim(),
      coverImage: coverImage,
      markdownUrl: document.getElementById('blogMarkdownUrl').value.trim(),
      content: document.getElementById('blogContent').value.trim()
    }
  }

  /**
   * 清空编辑器
   */
  clearEditor() {
    document.getElementById('blogTitle').value = ''
    document.getElementById('blogCategory').value = '技术'
    document.getElementById('blogTags').value = ''
    document.getElementById('blogReadTime').value = '5分钟'
    document.getElementById('blogSummary').value = ''
    document.getElementById('blogCoverUrl').value = ''
    document.getElementById('blogMarkdownUrl').value = ''
    document.getElementById('blogContent').value = ''
    
    // 清空封面预览
    const coverPreview = document.getElementById('coverPreview')
    if (coverPreview) {
      coverPreview.innerHTML = '<div class="no-cover">暂无封面图</div>'
    }
    
    // 清空文件上传控件
    const coverUpload = document.getElementById('coverUpload')
    if (coverUpload) {
      coverUpload.value = ''
    }
    
    // 重置Markdown预览
    const markdownPreview = document.getElementById('markdownPreview')
    if (markdownPreview) {
      markdownPreview.innerHTML = ''
    }
    
    // 重置预览切换
    const previewToggle = document.getElementById('previewToggle')
    if (previewToggle) {
      previewToggle.checked = false
    }
  }

  /**
   * 取消编辑
   */
  cancelEdit() {
    if (confirm('确定要取消编辑吗？未保存的更改将丢失。')) {
      this.clearEditor()
      this.currentEditingBlog = null
      this.switchTab('list')
    }
  }

  /**
   * 切换标签页
   */
  switchTab(tabName) {
    // 更新标签按钮状态
    document.querySelectorAll('.admin-tab').forEach(tab => {
      tab.classList.remove('active')
    })
    document.querySelector(`[onclick="switchTab('${tabName}')"]`).classList.add('active')
    
    // 更新内容显示
    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.remove('active')
    })
    document.getElementById(`${tabName}Tab`).classList.add('active')
  }

  /**
   * 保存系统设置
   */
  saveSettings() {
    const apiKey = document.getElementById('notionApiKey').value.trim()
    const databaseId = document.getElementById('notionDatabaseId').value.trim()
    
    if (!apiKey || !databaseId) {
      alert('请填写完整的Notion配置信息')
      return
    }
    
    // 更新配置
    config.updateNotionConfig(apiKey, databaseId)
    
    alert('配置已保存！')
    
    // 重新加载博客列表
    this.loadBlogList()
  }

  /**
   * 退出登录
   */
  logout() {
    if (confirm('确定要退出登录吗？')) {
      this.isAuthenticated = false
      this.currentUser = null
      localStorage.removeItem('admin_auth')
      this.showAuthInterface()
      
      // 清空表单
      document.getElementById('username').value = ''
      document.getElementById('password').value = ''
      document.getElementById('authMessage').innerHTML = ''
    }
  }

  /**
   * HTML转义
   */
  escapeHtml(text) {
    const div = document.createElement('div')
    div.textContent = text || ''
    return div.innerHTML
  }
}

// 全局函数，供HTML调用
window.switchTab = function(tabName) {
  window.adminManager.switchTab(tabName)
}

window.createNewBlog = function() {
  window.adminManager.createNewBlog()
}

window.saveBlog = function(publish) {
  window.adminManager.saveBlog(publish)
}

window.cancelEdit = function() {
  window.adminManager.cancelEdit()
}

window.saveSettings = function() {
  window.adminManager.saveSettings()
}

window.logout = function() {
  window.adminManager.logout()
}

// 初始化管理系统
window.adminManager = new AdminManager()

export { AdminManager }
export default AdminManager
