/**
 * 博客组件
 * 处理博客相关的UI逻辑
 */

import { notionService } from '../services/notionService.js'
import { config } from '../config/index.js'
import { ContentParser } from '../utils/contentParser.js'

export class BlogComponent {
  constructor(container) {
    this.container = container
    this.blogs = []
    this.allBlogs = [] // 存储所有博客用于搜索
    this.filteredBlogs = [] // 存储过滤后的博客
    this.loading = false
    this.hasMore = true
    this.nextCursor = null
    this.currentPage = 1
    this.pageSize = 6 // 每页显示6篇文章
    this.totalPages = 1
    this.searchQuery = ''
    this.selectedCategory = ''
    this.selectedTag = ''
    
    // 初始化ContentParser
    this.contentParser = new ContentParser()

    this.initEventListeners()
    this.createSearchAndPagination()
  }

  /**
   * 初始化事件监听
   * @private
   */
  initEventListeners() {
    // 移除滚动加载，改用分页
    // 可以保留滚动到顶部的功能
    window.addEventListener('scroll', this.throttle(() => {
      this.updateScrollToTop()
    }, 200))
  }

  /**
   * 创建搜索和分页界面
   * @private
   */
  createSearchAndPagination() {
    // 创建搜索和过滤区域
    const searchContainer = document.createElement('div')
    searchContainer.className = 'blog-search-container'
    searchContainer.innerHTML = `
      <div class="search-filters">
        <div class="search-input-group">
          <input type="text" id="blogSearch" class="search-input" placeholder="搜索文章标题、内容..." />
          <button class="search-button" onclick="blogApp.blogComponent.performSearch()">
            🔍 搜索
          </button>
          <button class="clear-button" onclick="blogApp.blogComponent.clearSearch()">
            ✖️ 清除
          </button>
        </div>
        
        <div class="filter-group">
          <select id="categoryFilter" class="filter-select" onchange="blogApp.blogComponent.applyFilters()">
            <option value="">所有分类</option>
          </select>
          
          <select id="tagFilter" class="filter-select" onchange="blogApp.blogComponent.applyFilters()">
            <option value="">所有标签</option>
          </select>
          
          <select id="sortFilter" class="filter-select" onchange="blogApp.blogComponent.applyFilters()">
            <option value="date-desc">最新发布</option>
            <option value="date-asc">最早发布</option>
            <option value="title-asc">标题 A-Z</option>
            <option value="title-desc">标题 Z-A</option>
          </select>
        </div>
      </div>
      
      <div class="search-results-info" id="searchResultsInfo" style="display: none;">
        <span id="resultsCount">0</span> 篇文章
        <span id="searchTerm"></span>
      </div>
    `
    
    // 在容器前插入搜索区域
    this.container.parentNode.insertBefore(searchContainer, this.container)
    
    // 创建分页区域
    const paginationContainer = document.createElement('div')
    paginationContainer.className = 'blog-pagination-container'
    paginationContainer.innerHTML = `
      <div class="pagination-info">
        <span id="paginationInfo">第 1 页，共 1 页</span>
        <span id="totalArticles">共 0 篇文章</span>
      </div>
      <div class="pagination-controls" id="paginationControls">
        <!-- 分页按钮将动态生成 -->
      </div>
    `
    
    // 在容器后插入分页区域
    this.container.parentNode.insertBefore(paginationContainer, this.container.nextSibling)
    
    // 绑定搜索框回车事件
    document.getElementById('blogSearch').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.performSearch()
      }
    })
  }

  /**
   * 加载博客列表
   */
  async loadBlogs() {
    if (this.loading) return

    this.setLoadingState(true)

    try {
      if (!config.isNotionConfigured()) {
        this.showConfigurationHelp()
        return
      }

      // 加载所有博客文章用于分页和搜索
      const result = await notionService.getBlogPosts({
        pageSize: 100 // 一次性加载更多文章
      })

      // 过滤掉无标题的文章
      this.allBlogs = (result.posts || []).filter(blog => 
        blog.title && 
        blog.title.trim() !== '' && 
        blog.title !== '无标题' &&
        blog.title !== '数据解析错误'
      )

      console.log('✅ 加载的博客总数:', this.allBlogs.length)
      
      // 调试：检查第一篇博客的封面图情况
      if (this.allBlogs.length > 0) {
        const firstBlog = this.allBlogs[0]
        console.log('🔍 第一篇博客调试信息:', {
          title: firstBlog.title,
          hasCoverImage: !!firstBlog.coverImage,
          coverImageUrl: firstBlog.coverImage,
          coverImageLength: firstBlog.coverImage ? firstBlog.coverImage.length : 0
        })
      }
      
      // 初始化过滤器选项
      this.initializeFilters()
      
      // 应用当前过滤条件
      this.applyFilters()

    } catch (error) {
      config.error('Failed to load blogs:', error)
      this.showErrorState(error.message)
    } finally {
      this.setLoadingState(false)
    }
  }

  /**
   * 初始化过滤器选项
   * @private
   */
  initializeFilters() {
    // 获取所有分类
    const categories = [...new Set(this.allBlogs.map(blog => blog.category).filter(cat => cat))]
    const categorySelect = document.getElementById('categoryFilter')
    categorySelect.innerHTML = '<option value="">所有分类</option>'
    categories.forEach(category => {
      categorySelect.innerHTML += `<option value="${category}">${category}</option>`
    })

    // 获取所有标签
    const allTags = this.allBlogs.flatMap(blog => blog.tags || [])
    const uniqueTags = [...new Set(allTags)].filter(tag => tag)
    const tagSelect = document.getElementById('tagFilter')
    tagSelect.innerHTML = '<option value="">所有标签</option>'
    uniqueTags.forEach(tag => {
      tagSelect.innerHTML += `<option value="${tag}">${tag}</option>`
    })
  }

  /**
   * 执行搜索
   */
  performSearch() {
    this.searchQuery = document.getElementById('blogSearch').value.trim()
    this.currentPage = 1
    this.applyFilters()
  }

  /**
   * 清除搜索
   */
  clearSearch() {
    document.getElementById('blogSearch').value = ''
    document.getElementById('categoryFilter').value = ''
    document.getElementById('tagFilter').value = ''
    document.getElementById('sortFilter').value = 'date-desc'
    this.searchQuery = ''
    this.selectedCategory = ''
    this.selectedTag = ''
    this.currentPage = 1
    this.applyFilters()
  }

  /**
   * 应用过滤条件
   */
  applyFilters() {
    // 获取过滤条件
    this.searchQuery = document.getElementById('blogSearch').value.trim()
    this.selectedCategory = document.getElementById('categoryFilter').value
    this.selectedTag = document.getElementById('tagFilter').value
    const sortOrder = document.getElementById('sortFilter').value

    // 开始过滤
    let filtered = [...this.allBlogs]

    // 搜索过滤
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase()
      filtered = filtered.filter(blog => 
        blog.title.toLowerCase().includes(query) ||
        blog.summary.toLowerCase().includes(query) ||
        (blog.tags && blog.tags.some(tag => tag.toLowerCase().includes(query)))
      )
    }

    // 分类过滤
    if (this.selectedCategory) {
      filtered = filtered.filter(blog => blog.category === this.selectedCategory)
    }

    // 标签过滤
    if (this.selectedTag) {
      filtered = filtered.filter(blog => 
        blog.tags && blog.tags.includes(this.selectedTag)
      )
    }

    // 排序
    filtered.sort((a, b) => {
      switch (sortOrder) {
      case 'date-asc':
        return new Date(a.publishDate || a.createdTime) - new Date(b.publishDate || b.createdTime)
      case 'title-asc':
        return a.title.localeCompare(b.title)
      case 'title-desc':
        return b.title.localeCompare(a.title)
      case 'date-desc':
      default:
        return new Date(b.publishDate || b.createdTime) - new Date(a.publishDate || a.createdTime)
      }
    })

    this.filteredBlogs = filtered
    this.totalPages = Math.ceil(this.filteredBlogs.length / this.pageSize)
    
    // 确保当前页不超出范围
    if (this.currentPage > this.totalPages) {
      this.currentPage = Math.max(1, this.totalPages)
    }

    this.updateSearchResults()
    this.renderCurrentPage()
    this.renderPagination()
  }

  /**
   * 更新搜索结果信息
   * @private
   */
  updateSearchResults() {
    const resultsInfo = document.getElementById('searchResultsInfo')
    const resultsCount = document.getElementById('resultsCount')
    const searchTerm = document.getElementById('searchTerm')
    const totalArticles = document.getElementById('totalArticles')

    resultsCount.textContent = this.filteredBlogs.length
    totalArticles.textContent = `共 ${this.filteredBlogs.length} 篇文章`

    if (this.searchQuery || this.selectedCategory || this.selectedTag) {
      let searchText = ''
      if (this.searchQuery) searchText += `搜索"${this.searchQuery}"`
      if (this.selectedCategory) searchText += `${searchText ? '，' : ''}分类"${this.selectedCategory}"`
      if (this.selectedTag) searchText += `${searchText ? '，' : ''}标签"${this.selectedTag}"`
      
      searchTerm.textContent = `（${searchText}）`
      resultsInfo.style.display = 'block'
    } else {
      resultsInfo.style.display = 'none'
    }
  }

  /**
   * 渲染当前页的博客
   * @private
   */
  renderCurrentPage() {
    const startIndex = (this.currentPage - 1) * this.pageSize
    const endIndex = startIndex + this.pageSize
    const currentPageBlogs = this.filteredBlogs.slice(startIndex, endIndex)

    this.blogs = currentPageBlogs
    this.renderBlogs()

    // 更新分页信息
    const paginationInfo = document.getElementById('paginationInfo')
    paginationInfo.textContent = `第 ${this.currentPage} 页，共 ${this.totalPages} 页`

    // 滚动到顶部
    this.container.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  /**
   * 渲染分页控件
   * @private
   */
  renderPagination() {
    const paginationControls = document.getElementById('paginationControls')
    
    if (this.totalPages <= 1) {
      paginationControls.innerHTML = ''
      return
    }

    let paginationHTML = ''

    // 上一页按钮
    if (this.currentPage > 1) {
      paginationHTML += `
        <button class="pagination-btn" onclick="blogApp.blogComponent.goToPage(${this.currentPage - 1})">
          ← 上一页
        </button>
      `
    }

    // 页码按钮
    const maxVisiblePages = 5
    let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2))
    const endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1)

    // 调整起始页
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }

    // 第一页
    if (startPage > 1) {
      paginationHTML += `
        <button class="pagination-btn" onclick="blogApp.blogComponent.goToPage(1)">1</button>
      `
      if (startPage > 2) {
        paginationHTML += '<span class="pagination-ellipsis">...</span>'
      }
    }

    // 页码范围
    for (let i = startPage; i <= endPage; i++) {
      paginationHTML += `
        <button class="pagination-btn ${i === this.currentPage ? 'active' : ''}" 
                onclick="blogApp.blogComponent.goToPage(${i})">
          ${i}
        </button>
      `
    }

    // 最后一页
    if (endPage < this.totalPages) {
      if (endPage < this.totalPages - 1) {
        paginationHTML += '<span class="pagination-ellipsis">...</span>'
      }
      paginationHTML += `
        <button class="pagination-btn" onclick="blogApp.blogComponent.goToPage(${this.totalPages})">
          ${this.totalPages}
        </button>
      `
    }

    // 下一页按钮
    if (this.currentPage < this.totalPages) {
      paginationHTML += `
        <button class="pagination-btn" onclick="blogApp.blogComponent.goToPage(${this.currentPage + 1})">
          下一页 →
        </button>
      `
    }

    paginationControls.innerHTML = paginationHTML
  }

  /**
   * 跳转到指定页面
   */
  goToPage(page) {
    if (page < 1 || page > this.totalPages || page === this.currentPage) {
      return
    }
    
    this.currentPage = page
    this.renderCurrentPage()
    this.renderPagination()
  }

  /**
   * 更新滚动到顶部按钮
   * @private
   */
  updateScrollToTop() {
    // 可以在这里添加滚动到顶部按钮的逻辑
  }

  /**
   * 渲染博客列表
   */
  renderBlogs() {
    if (!this.container) {
      console.error('❌ 博客容器不存在')
      return
    }

    console.log(`📝 开始渲染 ${this.blogs.length} 篇博客`)

    // 如果是首次渲染，清空容器
    if (!this.nextCursor) {
      this.container.innerHTML = ''
      console.log('🧹 清空容器，准备首次渲染')
    }

    if (this.blogs.length === 0) {
      console.log('📭 没有博客数据可渲染')
      return
    }

    this.blogs.forEach((blog, index) => {
      // 跳过已渲染的博客
      if (this.container.querySelector(`[data-blog-id="${blog.id}"]`)) {
        console.log(`⏭️ 跳过已渲染的博客: ${blog.title}`)
        return
      }

      console.log(`🎨 渲染博客 ${index + 1}/${this.blogs.length}: ${blog.title}`)
      console.log(`🖼️ 封面图: ${blog.coverImage ? '有' : '无'}`)
      if (blog.coverImage) {
        console.log(`🖼️ 封面图URL: ${blog.coverImage}`)
      }

      const blogElement = this.createBlogElement(blog, index)
      this.container.appendChild(blogElement)

      // 添加滚动动画
      this.observeElement(blogElement)
    })

    console.log('✅ 博客列表渲染完成')
  }

  /**
   * 创建博客元素 - YouTube风格
   * @private
   */
  createBlogElement(blog, index) {
    const blogElement = document.createElement('div')
    blogElement.className = 'blog-item'
    blogElement.setAttribute('data-blog-id', blog.id)
    blogElement.style.animationDelay = `${index * 50}ms` // 更快的动画

    // 构建封面图HTML - 专门针对Notion图片
    const coverImageHtml = blog.coverImage ? `
      <div class="blog-cover">
        <img src="${this.escapeHtml(blog.coverImage)}" 
             alt="${this.escapeHtml(blog.title)}" 
             class="blog-cover-image"
             loading="lazy"
             style="width: 100%; height: 100%; object-fit: cover; border: none; outline: none; box-shadow: none; opacity: 0; transition: opacity 0.3s ease;"
             onload="this.style.opacity='1'; console.log('✅ Notion封面图加载成功:', this.src);"
             onerror="console.log('❌ Notion封面图加载失败:', this.src); this.style.display='none'; this.parentElement.innerHTML='<div class=&quot;cover-error-placeholder&quot;><div class=&quot;placeholder-icon&quot;>🖼️</div><div class=&quot;placeholder-text&quot;>封面加载失败</div></div>'; if (window.retryImageLoad) window.retryImageLoad(this, this.src);">
      </div>
    ` : `
      <div class="blog-cover-placeholder">
        <div class="placeholder-icon">📄</div>
        <div class="placeholder-text">暂无封面</div>
      </div>
    `

    // YouTube风格：点击整个卡片打开文章
    blogElement.innerHTML = `
      <article class="blog-card" onclick="blogApp.showBlogDetail('${blog.id}')">
        ${coverImageHtml}
        <div class="blog-content-wrapper">
          <h3 class="blog-title">
            ${this.escapeHtml(blog.title)}
          </h3>
          
          <div class="blog-meta">
            <span class="blog-category">${this.escapeHtml(blog.category || '技术')}</span>
            <span class="blog-date">${blog.publishDate}</span>
            <span class="blog-read-time">${this.escapeHtml(blog.readTime)}</span>
          </div>
          
          <p class="blog-summary">${this.escapeHtml(blog.summary)}</p>
        </div>
      </article>
    `

    return blogElement
  }

  /**
   * 显示博客详情 - 完整页面模式
   */
  async showBlogDetail(blogId) {
    const blog = this.blogs.find(b => b.id === blogId)
    if (!blog) {
      console.error('❌ Blog not found:', blogId)
      console.log('Available blog IDs:', this.blogs.map(b => ({ id: b.id, title: b.title })))
      return
    }

    console.log('✅ 显示博客详情:', { title: blog.title, id: blogId, hasCover: !!blog.coverImage })
    // 打印博客原始数据
    console.log('📄 博客原始数据:', JSON.stringify(blog, null, 2))

    // 隐藏博客列表，显示博客详情页面
    this.showBlogDetailPage(blog)

    try {
      console.log('🔄 开始加载文章内容...', { blogId, title: blog.title })
      
      // 显示加载状态
      this.showDetailPageLoading(blog)
      
      // 加载文章内容（已经是HTML格式）
      const processedContent = await notionService.getBlogContent(blogId)
      console.log('✅ 获取到已处理的文章内容，长度:', processedContent.length)
      console.log('🎨 内容预览（前500字符）:', processedContent?.substring(0, 500) || 'empty')
      
      // 打印处理后的内容数据
      console.log('📄 处理后的内容数据:', processedContent)
      
      this.updateDetailPageContent(blog, processedContent)
    } catch (error) {
      console.error('❌ 加载文章内容失败:', error)
      config.error('Failed to load blog content:', error)
      
      // 安全地处理错误消息
      const errorMessage = error?.message || '未知错误'
      this.showDetailPageError(blog, errorMessage)
    }
  }

  /**
   * 显示博客详情页面
   * @private
   */
  showBlogDetailPage(blog) {
    // 找到主容器 - 改进查找逻辑
    const mainContainer = document.querySelector('main') || 
                         document.querySelector('.main-container') || 
                         document.querySelector('.container') ||
                         document.querySelector('body > div') ||
                         document.body
    
    console.log('🎯 找到的主容器:', mainContainer.tagName, mainContainer.className)
    
    // 保存原始内容（只保存一次）
    if (!window.originalPageContent) {
      window.originalPageContent = mainContainer.innerHTML
      window.originalScrollPosition = window.pageYOffset
      console.log('✅ 已保存原始页面内容')
    }

    // 完全替换页面内容为博客详情页
    mainContainer.innerHTML = `
      <style>
        .blog-detail-page-wrapper {
          min-height: 100vh;
          background: var(--bg-dark, #0a0a0a);
          color: var(--text-primary, #ffffff);
        }
        .blog-detail-header {
          padding: 20px;
          border-bottom: 1px solid var(--border-color, #333);
          display: flex;
          align-items: center;
          gap: 20px;
        }
        .back-button {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          background: var(--primary-color, #00ffff);
          color: #000;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.3s ease;
        }
        .back-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 255, 255, 0.3);
        }
        .blog-detail-nav h1 {
          margin: 0;
          color: var(--primary-color, #00ffff);
        }
        .blog-detail-main {
          padding: 40px 20px;
          max-width: 800px;
          margin: 0 auto;
        }
        .blog-detail-content {
          line-height: 1.8;
        }
      </style>
      <div class="blog-detail-page-wrapper">
        <header class="blog-detail-header">
          <button class="back-button" onclick="window.blogApp?.blogComponent?.goBackToBlogList() || window.location.reload()" aria-label="返回博客列表">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            返回
          </button>
          <div class="blog-detail-nav">
            <h1>River Space</h1>
          </div>
        </header>
        
        <main class="blog-detail-main">
          <div class="blog-detail-content">
            <!-- 内容将在这里动态加载 -->
          </div>
        </main>
      </div>
    `

    // 滚动到顶部并添加页面切换效果
    window.scrollTo(0, 0)
    document.body.style.overflow = 'auto'
    
    console.log('✅ 博客详情页面已显示')
  }

  /**
   * 显示详情页面加载状态
   * @private
   */
  showDetailPageLoading(blog) {
    const contentContainer = document.querySelector('.blog-detail-content')
    if (!contentContainer) return

    const safeTitle = this.escapeHtml(blog.title || '')
    
    contentContainer.innerHTML = `
      <div class="loading-content" style="text-align: center; padding: 100px 20px;">
        <div class="loading-spinner" style="width: 60px; height: 60px; border: 4px solid rgba(0, 255, 255, 0.2); border-top: 4px solid #00ffff; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 30px;"></div>
        <h2 style="color: rgba(255, 255, 255, 0.9); font-size: 24px; margin-bottom: 15px;">正在加载《${safeTitle}》</h2>
        <p style="color: rgba(255, 255, 255, 0.6); font-size: 16px;">请稍候，正在获取文章内容...</p>
      </div>
    `
  }

  /**
   * 更新详情页面内容
   * @private
   */
  updateDetailPageContent(blog, content) {
    const contentContainer = document.querySelector('.blog-detail-content')
    if (!contentContainer) return

    console.log('✅ 正在更新详情页面内容，内容长度:', content?.length || 0)
    console.log('📄 内容预览（前200字符）:', content?.substring(0, 200) || 'empty')
    console.log('🔍 内容类型检查:', typeof content)
    console.log('🔍 是否包含HTML标签:', content && (content.includes('<') && content.includes('>')))
    console.log('🔍 是否被包装为代码块:', content && content.includes('```markdown'))
    
    // 创建编辑按钮（如果管理员已认证）
    const editButton = this.createEditButton(blog.id)
    
    // 安全地获取博客属性
    const safeTitle = this.escapeHtml(blog.title || '')
    const safeCategory = this.escapeHtml(blog.category || '技术')
    const safeDate = blog.publishDate || ''
    const safeReadTime = this.escapeHtml(blog.readTime || '5分钟')
    
    // 改进内容处理逻辑
    let htmlContent
    if (!content || content.trim() === '') {
      console.log('⚠️ 内容为空，使用占位符')
      htmlContent = '<p style="color: rgba(255,255,255,0.6); text-align: center; padding: 60px;">📝 此文章暂无内容</p>'
    } else if (content.includes('<p class="no-content">') || 
               content.includes('<p class="empty-result">') || 
               content.includes('<p class="empty-content">') ||
               content.includes('<p class="parse-empty">')) {
      console.log('⚠️ 内容解析失败，使用友好提示')
      htmlContent = `
        <div style="text-align: center; padding: 60px 20px;">
          <h3 style="color: rgba(255,255,255,0.8); margin-bottom: 20px;">📄 内容加载中...</h3>
          <p style="color: rgba(255,255,255,0.6); margin-bottom: 20px;">
            文章内容正在处理中，请稍后再试
          </p>
          ${blog.url ? `
            <a href="${blog.url}" target="_blank" rel="noopener noreferrer" 
               style="color: #00ffff; text-decoration: underline;">
              在Notion中查看原文 →
            </a>
          ` : ''}
        </div>
      `
    } else {
      htmlContent = content
    }
    
    console.log('🔍 最终内容类型分析...')
    console.log('📏 最终内容长度:', htmlContent?.length || 0)
    
    // 检查内容是否已经是HTML格式（更准确的判断）
    const hasHtmlTags = htmlContent && (htmlContent.includes('<p>') || htmlContent.includes('<h') || 
                         htmlContent.includes('<div') || htmlContent.includes('<span') ||
                         htmlContent.includes('<ul') || htmlContent.includes('<ol') ||
                         htmlContent.includes('<pre') || htmlContent.includes('<blockquote'))
    console.log('🎨 内容是否包含HTML标签:', hasHtmlTags)
    
    // 只有在确定是纯文本时才进行段落包装
    if (!hasHtmlTags && htmlContent && htmlContent.trim() && 
        !htmlContent.startsWith('<') && htmlContent.indexOf('<') === -1) {
      console.log('⚠️ 内容看起来是纯文本，进行段落包装...')
      // 简单的段落包装处理纯文本
      htmlContent = htmlContent.split('\n\n').filter(line => line.trim()).map(para => `<p>${para.trim().replace(/\n/g, '<br>')}</p>`).join('')
      console.log('✅ 段落包装完成')
    } else {
      console.log('✅ 内容已经是HTML格式或不需要包装，直接使用')
    }
    
    this.updateContentDisplay(contentContainer, htmlContent, blog, editButton, safeTitle, safeCategory, safeDate, safeReadTime)
  }

  /**
   * 更新内容显示的通用方法
   * @private
   */
  updateContentDisplay(contentContainer, htmlContent, blog, editButton, safeTitle, safeCategory, safeDate, safeReadTime) {
    console.log('🖥️ 开始更新内容显示...')
    console.log('📄 htmlContent 长度:', htmlContent?.length || 0)
    console.log('📝 htmlContent 前200字符:', htmlContent?.substring(0, 200) || 'empty')
    
    // 创建文章容器
    const articleElement = document.createElement('article')
    articleElement.className = 'blog-article'
    
    // 创建标题部分
    const headerElement = document.createElement('header')
    headerElement.className = 'blog-article-header'
    headerElement.innerHTML = `
      <h1 class="blog-article-title">${safeTitle}</h1>
      <div class="blog-article-meta">
        <span class="blog-article-category">${safeCategory}</span>
        <span class="blog-article-date">${safeDate}</span>
        <span class="blog-article-read-time">${safeReadTime}</span>
      </div>
    `
    
    // 创建内容部分
    const contentElement = document.createElement('div')
    contentElement.className = 'blog-article-content markdown-content'
    contentElement.style.cssText = `
      color: rgba(255, 255, 255, 0.9) !important; 
      line-height: 1.8 !important; 
      font-size: 16px !important;
    `
    
    // 安全地设置HTML内容
    contentElement.innerHTML = htmlContent
    
    // 添加CSS样式来修复序号分离问题
    const styleElement = document.createElement('style')
    styleElement.textContent = `
      .blog-article-content h1,
      .blog-article-content h2,
      .blog-article-content h3,
      .blog-article-content h4,
      .blog-article-content h5,
      .blog-article-content h6 {
        display: block !important;
        width: 100% !important;
      }
      
      .blog-article-content h1 strong,
      .blog-article-content h2 strong,
      .blog-article-content h3 strong,
      .blog-article-content h4 strong,
      .blog-article-content h5 strong,
      .blog-article-content h6 strong {
        display: inline !important;
        word-break: keep-all !important;
        white-space: normal !important;
      }
      
      .blog-article-content h4 {
        font-size: 18px !important;
        margin: 16px 0 8px 0 !important;
        font-weight: 600 !important;
        line-height: 1.4 !important;
      }
      
      .blog-article-content strong {
        display: inline !important;
        font-weight: bold !important;
      }
      
      /* 确保数字序号和标题内容保持在一起 */
      .blog-article-content h4:has(strong),
      .blog-article-content h3:has(strong),
      .blog-article-content h2:has(strong),
      .blog-article-content h1:has(strong) {
        text-indent: 0 !important;
        padding-left: 0 !important;
      }
    `
    
    // 将样式添加到文档头部
    if (!document.querySelector('#blog-content-fix-styles')) {
      styleElement.id = 'blog-content-fix-styles'
      document.head.appendChild(styleElement)
    }
    
    // 组装文章
    articleElement.appendChild(headerElement)
    
    // 添加编辑按钮（如果有）
    if (editButton && editButton.trim()) {
      const editButtonElement = document.createElement('div')
      editButtonElement.innerHTML = editButton
      articleElement.appendChild(editButtonElement)
    }
    
    articleElement.appendChild(contentElement)
    
    // 清空并添加到容器
    contentContainer.innerHTML = ''
    contentContainer.appendChild(articleElement)
    
    console.log('✅ 详情页面内容已更新')
    
    // 验证DOM中的内容
    setTimeout(() => {
      const renderedContent = contentContainer.querySelector('.markdown-content')
      if (renderedContent) {
        console.log('🔍 DOM中的渲染内容预览:', renderedContent.innerHTML.substring(0, 200))
        console.log('📊 DOM内容统计:')
        console.log('  - 段落数量:', renderedContent.querySelectorAll('p').length)
        console.log('  - 标题数量:', renderedContent.querySelectorAll('h1,h2,h3,h4,h5,h6').length)
        console.log('  - 代码块数量:', renderedContent.querySelectorAll('pre,code').length)
        console.log('  - 列表数量:', renderedContent.querySelectorAll('ul,ol').length)
        console.log('  - 链接数量:', renderedContent.querySelectorAll('a').length)
        
        // 检查是否还有未解析的markdown语法
        const text = renderedContent.textContent || ''
        const hasUnparsedMarkdown = /^#{1,6}\s+|^\*\*.*\*\*|\`\`\`|^\*\s+|^\d+\.\s+/.test(text)
        if (hasUnparsedMarkdown) {
          console.warn('⚠️ 检测到未解析的Markdown语法，可能存在渲染问题')
        } else {
          console.log('✅ 未发现未解析的Markdown语法')
        }
      } else {
        console.warn('❌ 未找到markdown-content元素')
      }
    }, 100)
  }

  /**
   * 显示详情页面错误
   * @private
   */
  showDetailPageError(blog, errorMessage) {
    const contentContainer = document.querySelector('.blog-detail-content')
    if (!contentContainer) return

    const safeTitle = this.escapeHtml(blog.title || '')
    const safeError = this.escapeHtml(errorMessage)
    
    contentContainer.innerHTML = `
      <div class="error-content" style="text-align: center; padding: 100px 20px;">
        <div style="font-size: 48px; margin-bottom: 20px;">😕</div>
        <h2 style="color: rgba(255, 255, 255, 0.9); margin-bottom: 15px;">加载失败</h2>
        <p style="color: rgba(255, 255, 255, 0.7); margin-bottom: 10px;">无法加载《${safeTitle}》的内容</p>
        <p style="color: rgba(255, 255, 255, 0.5); font-size: 14px;">错误信息：${safeError}</p>
        <button onclick="blogApp.showBlogDetail('${blog.id}')" 
                style="margin-top: 20px; padding: 10px 20px; background: rgba(0, 255, 255, 0.2); border: 1px solid #00ffff; color: #00ffff; border-radius: 5px; cursor: pointer;">
          重试
        </button>
      </div>
    `
  }

  /**
   * 返回博客列表 - 简化版本
   */
  goBackToBlogList() {
    console.log('🔄 返回博客列表...')
    
    // 简单的解决方案：重新加载页面
    try {
      // 尝试使用浏览器历史记录返回
      if (window.history.length > 1) {
        window.history.back()
        return
      }
      
      // 如果没有历史记录，重新加载当前页面
      window.location.reload()
      
    } catch (error) {
      console.error('❌ 返回博客列表失败:', error)
      // 最后的备选方案：跳转到博客页面
      window.location.href = window.location.pathname
    }
  }

  /**
   * 全局方法：返回博客列表（供HTML调用）
   */
  static goBackToBlogList() {
    // 尝试找到当前的博客组件实例
    if (window.blogApp && window.blogApp.blogComponent) {
      window.blogApp.blogComponent.goBackToBlogList()
    } else {
      // 如果没有实例，直接重新加载页面
      window.location.reload()
    }
  }

  /**
   * 创建模态框
   * @private
   */
  createModal(blog) {
    const modal = document.createElement('div')
    modal.className = 'blog-modal'
    modal.innerHTML = `
      <div class="blog-modal-content">
        <button class="blog-modal-close" onclick="this.closest('.blog-modal').remove()" aria-label="关闭">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
        
        <div class="blog-modal-body">
          <div class="loading-content" style="text-align: center; padding: 40px;">
            <div class="loading-spinner" style="width: 40px; height: 40px; border: 3px solid rgba(0, 255, 255, 0.2); border-top: 3px solid #00ffff; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 15px;"></div>
            <p style="color: rgba(255, 255, 255, 0.6);">正在加载文章内容...</p>
          </div>
        </div>
      </div>
      <div class="blog-modal-backdrop" onclick="this.closest('.blog-modal').remove()"></div>
    `

    return modal
  }

  /**
   * 更新模态框内容
   * @private
   */
  updateModalContent(modal, blog, content) {
    console.log('✅ 正在更新模态框内容，内容长度:', content?.length || 0)
    console.log('📄 内容预览:', content?.substring(0, 200) || 'empty')
    
    const modalBody = modal.querySelector('.blog-modal-body')
    if (!modalBody) {
      console.error('❌ 未找到模态框主体元素')
      return
    }
    
    // 创建编辑按钮（如果管理员已认证）
    const editButton = this.createEditButton(blog.id)
    
    // 安全地获取博客属性
    const safeTitle = this.escapeHtml(blog.title || '')
    const safeCategory = this.escapeHtml(blog.category || '技术')
    const safeDate = blog.publishDate || ''
    const safeReadTime = this.escapeHtml(blog.readTime || '5分钟')
    
    // 添加标题和元信息
    const headerHtml = `
      <div class="blog-modal-header">
        <h2 class="blog-modal-title">${safeTitle}</h2>
        <div class="blog-modal-meta">
          <span class="blog-modal-category">${safeCategory}</span>
          <span class="blog-modal-date">${safeDate}</span>
          <span class="blog-modal-read-time">${safeReadTime}</span>
        </div>
      </div>
    `
    
    // 改进内容处理逻辑（与详情页面保持一致）
    let htmlContent
    if (!content || content.trim() === '') {
      console.log('⚠️ 模态框内容为空，使用占位符')
      htmlContent = '<p style="color: rgba(255,255,255,0.6); text-align: center; padding: 40px;">📝 此文章暂无内容</p>'
    } else if (content.includes('<p class="no-content">') || 
               content.includes('<p class="empty-result">') || 
               content.includes('<p class="empty-content">') ||
               content.includes('<p class="parse-empty">')) {
      console.log('⚠️ 模态框内容解析失败，使用友好提示')
      htmlContent = '<p style="color: rgba(255,255,255,0.6); text-align: center; padding: 40px;">📝 文章内容解析中...</p>'
    } else {
      htmlContent = content
    }
    
    console.log('📄 模态框内容预览（前200字符）:', htmlContent?.substring(0, 200) || 'empty')
    
    // 检查内容是否已经是HTML格式（更准确的判断）
    const hasHtmlTags = htmlContent && (htmlContent.includes('<p>') || htmlContent.includes('<h') || 
                         htmlContent.includes('<div') || htmlContent.includes('<span') ||
                         htmlContent.includes('<ul') || htmlContent.includes('<ol') ||
                         htmlContent.includes('<pre') || htmlContent.includes('<blockquote'))
    console.log('🎨 模态框内容是否包含HTML标签:', hasHtmlTags)
    
    // 只有在确定是纯文本时才进行段落包装
    if (!hasHtmlTags && htmlContent && htmlContent.trim() && 
        !htmlContent.startsWith('<') && htmlContent.indexOf('<') === -1) {
      console.log('⚠️ 模态框内容看起来是纯文本，进行段落包装...')
      // 简单的段落包装处理纯文本
      htmlContent = htmlContent.split('\n\n').filter(line => line.trim()).map(para => `<p>${para.trim().replace(/\n/g, '<br>')}</p>`).join('')
      console.log('✅ 模态框段落包装完成')
    } else {
      console.log('✅ 模态框内容已经是HTML格式或不需要包装，直接使用')
    }
    
    // 显示标题、元信息、内容和编辑按钮
    modalBody.innerHTML = `
      ${headerHtml}
      ${editButton}
      <div class="blog-content markdown-content" style="display: block !important; visibility: visible !important; opacity: 1 !important;">
        ${htmlContent}
      </div>
    `
    
    console.log('✅ 模态框内容已更新')
    
    // 确保模态框和内容完全可见
    requestAnimationFrame(() => {
      const modalElement = modal.querySelector('.blog-modal-content')
      const contentElement = modal.querySelector('.blog-content')
      
      if (modalElement) {
        modalElement.style.display = 'block'
        modalElement.style.visibility = 'visible'
        modalElement.style.opacity = '1'
        modalElement.style.transform = 'scale(1) translateY(0)'
      }
      
      if (contentElement) {
        contentElement.style.display = 'block'
        contentElement.style.visibility = 'visible'
        contentElement.style.opacity = '1'
        console.log('✅ 强制显示模态框内容完成')
      }
    })
  }

  /**
   * 创建编辑按钮
   * @private
   */
  createEditButton(blogId) {
    // 检查是否有管理员权限
    const isAdmin = window.adminManager?.isAuthenticated
    
    if (!isAdmin) {
      return '' // 没有管理员权限，不显示编辑按钮
    }
    
    return `
      <div class="blog-modal-actions">
        <button 
          class="edit-blog-btn" 
          onclick="window.adminManager.editArticle('${blogId}'); this.closest('.blog-modal').remove();"
          title="编辑文章"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
          编辑文章
        </button>
      </div>
    `
  }

  /**
   * 显示模态框错误
   * @private
   */
  showModalError(modal, blog, errorMessage) {
    const modalBody = modal.querySelector('.blog-modal-body')
    if (!modalBody) return
    
    // 安全地处理错误消息
    const safeErrorMessage = this.escapeHtml(errorMessage || '未知错误')
    
    // 安全地获取博客URL
    const notionUrl = blog && blog.url ? blog.url : '#'
    
    modalBody.innerHTML = `
      <div class="error-content" style="text-align: center; padding: 40px 20px;">
        <div style="margin-bottom: 30px;">
          <h3 style="color: #ff6b6b; margin-bottom: 15px;">⚠️ 内容加载遇到问题</h3>
          <p style="color: rgba(255, 255, 255, 0.7); margin-bottom: 20px;">
            ${safeErrorMessage}
          </p>
        </div>
        
        <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
          <a href="${notionUrl}" target="_blank" rel="noopener noreferrer"
             style="background: rgba(255, 255, 255, 0.1); color: white; padding: 12px 24px; border-radius: 25px; text-decoration: none; border: 1px solid rgba(255, 255, 255, 0.3); transition: all 0.3s ease;"
             onmouseover="this.style.background='rgba(255, 255, 255, 0.2)'" 
             onmouseout="this.style.background='rgba(255, 255, 255, 0.1)'"
          >
            🏠 在Notion中查看
          </a>
        </div>
        
        <div style="margin-top: 30px; padding: 20px; background: rgba(0, 255, 255, 0.05); border-radius: 8px; border-left: 3px solid var(--primary-color);">
          <h4 style="color: var(--primary-color); margin-bottom: 10px;">💡 提示</h4>
          <p style="color: rgba(255, 255, 255, 0.8); font-size: 14px; margin: 0;">
            请尝试刷新页面或稍后再试。
          </p>
        </div>
      </div>
    `
  }

  /**
   * 设置加载状态
   */
  setLoadingState(loading) {
    this.loading = loading
    
    if (loading && this.blogs.length === 0) {
      this.container.innerHTML = `
        <div class="loading-state">
          <div class="loading-spinner"></div>
          <p>正在从Notion加载博客文章...</p>
        </div>
      `
    }
  }

  /**
   * 显示配置帮助
   */
  showConfigurationHelp() {
    this.container.innerHTML = `
      <div class="config-help">
        <h3>🔧 Notion API 配置</h3>
        <p>请按照<a href="./NOTION-SETUP.md" target="_blank">设置指南</a>配置Notion API</p>
        <button onclick="location.reload()" class="retry-button">重新加载</button>
      </div>
    `
  }

  /**
   * 显示空状态
   */
  showEmptyState() {
    this.container.innerHTML = `
      <div class="empty-state">
        <h3>📝 还没有发布的文章</h3>
        <p>请在Notion中创建文章并设置Published为已选中状态</p>
        <button onclick="blogApp.loadBlogs()" class="retry-button">重新加载</button>
      </div>
    `
  }

  /**
   * 显示错误状态
   */
  showErrorState(errorMessage) {
    this.container.innerHTML = `
      <div class="error-state">
        <h3>❌ 加载失败</h3>
        <p>无法从Notion加载博客内容</p>
        <p class="error-message">${this.escapeHtml(errorMessage)}</p>
        <button onclick="blogApp.loadBlogs()" class="retry-button">重试</button>
      </div>
    `
  }

  /**
   * 观察元素滚动动画
   * @private
   */
  observeElement(element) {
    // 直接添加animate类，避免IntersectionObserver问题
    // 使用setTimeout确保DOM已完全渲染
    setTimeout(() => {
      element.classList.add('animate')
    }, 100)
    
    // 备用方案：如果还是有问题，直接设置样式
    setTimeout(() => {
      if (!element.classList.contains('animate')) {
        element.style.opacity = '1'
        element.style.transform = 'translateY(0)'
      }
    }, 200)
  }

  /**
   * 节流函数
   * @private
   */
  throttle(func, limit) {
    let inThrottle
    return function() {
      const args = arguments
      const context = this
      if (!inThrottle) {
        func.apply(context, args)
        inThrottle = true
        setTimeout(() => inThrottle = false, limit)
      }
    }
  }

  /**
   * HTML转义
   * @private
   */
  escapeHtml(text) {
    const div = document.createElement('div')
    div.textContent = text || ''
    return div.innerHTML
  }

  /**
   * 安全解析纯文本为基础的markdown HTML（不转义HTML字符）
   * @private
   */
  parseAsMarkdownSafe(text) {
    if (!text || !text.trim()) return '<p>暂无内容</p>'
    
    console.log('🔄 开始安全解析纯文本为markdown（不转义HTML）...')
    
    // 检查是否已经是HTML
    if (text.includes('<') && text.includes('>')) {
      console.log('✅ 内容已经是HTML格式，直接返回')
      return text
    }
    
    // 基础的markdown解析（改进版，更好地处理换行和段落）
    let html = text
      // 先处理代码块（避免被其他规则影响）
      .replace(/```([\s\S]*?)```/g, '<pre><code class="hljs">$1</code></pre>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      
      // 处理标题
      .replace(/^### (.*$)/gm, '<h3>$1</h3>')
      .replace(/^## (.*$)/gm, '<h2>$1</h2>')
      .replace(/^# (.*$)/gm, '<h1>$1</h1>')
      
      // 处理粗体和斜体
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      
      // 处理链接
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
      
      // 处理列表项
      .replace(/^[\*\-\+]\s+(.+)$/gm, '<li>$1</li>')
      
      // 处理引用
      .replace(/^>\s+(.+)$/gm, '<blockquote>$1</blockquote>')
      
      // 处理水平线
      .replace(/^---+$/gm, '<hr>')
    
    // 将连续的列表项包装在ul标签中
    html = html.replace(/(<li>.*?<\/li>)(\s*<li>.*?<\/li>)*/gs, (match) => {
      return `<ul>${match}</ul>`
    })
    
    // 处理段落 - 按双换行分割，每个段落用p标签包装
    const paragraphs = html.split(/\n\s*\n/).filter(para => para.trim())
    html = paragraphs.map(para => {
      const trimmed = para.trim()
      // 如果已经是块级元素，不要包装p标签
      if (trimmed.match(/^<(h[1-6]|ul|ol|blockquote|pre|hr)/)) {
        return trimmed
      }
      
      // 改进的换行处理：
      // 1. 先处理可能的数字序号和内容的连接（如 "1.\n标题" -> "1. 标题"）
      // 2. 处理冒号前后的连接（如 "前部分\n:" -> "前部分:"）
      let processedContent = trimmed
        // 修复数字序号与内容的分离（数字+点+可选空格+换行+内容）
        .replace(/(\d+\.\s*)\n+(.)/g, '$1 $2')
        // 修复字母序号与内容的分离（字母+点+可选空格+换行+内容）
        .replace(/([a-zA-Z]\.\s*)\n+(.)/g, '$1 $2')
        // 修复冒号前的分离（内容+换行+冒号）
        .replace(/(.)\n+(:)/g, '$1$2')
        // 修复冒号后的分离（冒号+换行+内容）
        .replace(/(:\s*)\n+(.)/g, '$1 $2')
        // 修复括号内容的分离
        .replace(/(\()\n+(.)/g, '$1$2')
        .replace(/(.)\n+(\))/g, '$1$2')
        // 修复引号内容的分离
        .replace(/(")\n+(.)/g, '$1$2')
        .replace(/(.)\n+(")/g, '$1$2')
        // 其他单换行转换为br标签（但保留已修复的内容）
        .replace(/\n/g, '<br>')
      
      return `<p>${processedContent}</p>`
    }).join('\n')
    
    console.log('✅ 安全markdown解析完成')
    return html
  }

  /**
   * 解析纯文本为基础的markdown HTML
   * @private
   * @deprecated 使用 parseAsMarkdownSafe 替代
   */
  parseAsMarkdown(text) {
    console.warn('⚠️ parseAsMarkdown已废弃，使用parseAsMarkdownSafe替代')
    return this.parseAsMarkdownSafe(text)
  }
}

export default BlogComponent
