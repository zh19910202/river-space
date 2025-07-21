/**
 * 博客页面入口
 */

console.log('🔄 Loading Blog App...')

// 先加载基础配置
import('./config/index.js').then(async ({ config }) => {
  console.log('✅ Config loaded')
  
  try {
    // 动态导入所有依赖
    const [
      { BlogComponent },
      { NavigationComponent },
      { ScrollProgress }
    ] = await Promise.all([
      import('./components/BlogComponent.js'),
      import('./components/NavigationComponent.js'),
      import('./utils/scrollProgress.js')
    ])
    
    console.log('✅ All components loaded')

    class BlogApp {
      constructor() {
        this.blogComponent = null
        this.navigationComponent = null
        this.scrollProgress = new ScrollProgress()
        
        this.init()
      }

      async init() {
        console.log('🚀 Initializing Blog App...')

        // 初始化导航组件
        this.navigationComponent = new NavigationComponent()
        
        // 初始化博客组件
        const blogContainer = document.getElementById('blog-container')
        if (blogContainer) {
          console.log('📝 Initializing blog component...')
          console.log('📦 Blog container found:', blogContainer)
          this.blogComponent = new BlogComponent(blogContainer)
          
          // 确保容器可见
          blogContainer.style.display = 'block'
          blogContainer.style.visibility = 'visible'
          blogContainer.style.opacity = '1'
          
          console.log('🔄 Loading blogs...')
          await this.blogComponent.loadBlogs()
          console.log('✅ Blogs loaded successfully')
        } else {
          console.error('❌ Blog container not found')
          // 尝试查找其他可能的容器
          const possibleContainers = ['blog-container', 'blogs-container', 'blog-content', 'main-content']
          for (const containerId of possibleContainers) {
            const container = document.getElementById(containerId)
            if (container) {
              console.log(`🔄 Found alternative container: ${containerId}`)
              break
            }
          }
        }

        console.log('✅ Blog App initialized successfully')
        
        // 检查URL参数，如果有预览参数则自动打开对应文章
        this.checkPreviewParam()
      }

      // 检查预览参数
      checkPreviewParam() {
        const urlParams = new URLSearchParams(window.location.search)
        const previewId = urlParams.get('preview')
        
        if (previewId && this.blogComponent) {
          console.log('🔍 检测到预览参数，自动打开文章:', previewId)
          // 延迟一下确保博客列表已加载
          setTimeout(() => {
            this.blogComponent.showBlogDetail(previewId)
          }, 2000)
        }
      }

      // 代理方法供全局调用
      async showBlogDetail(blogId) {
        if (this.blogComponent) {
          return this.blogComponent.showBlogDetail(blogId)
        }
      }

      async loadBlogs() {
        if (this.blogComponent) {
          return this.blogComponent.loadBlogs()
        }
      }
    }

    // 页面加载完成后初始化
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        window.blogApp = new BlogApp()
      })
    } else {
      window.blogApp = new BlogApp()
    }

    // 页面可见性检测
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        document.title = '👋 回来看看技术文章吧！'
      } else {
        document.title = '技术博客 - River Space'
      }
    })
    
  } catch (error) {
    console.error('❌ Failed to load blog app:', error)
    
    // 显示错误信息给用户
    const blogContainer = document.getElementById('blog-container')
    if (blogContainer) {
      blogContainer.innerHTML = `
        <div style="text-align: center; padding: 60px 40px; color: #ff6b6b;">
          <h3>❌ 页面加载失败</h3>
          <p>无法加载博客组件: ${error.message}</p>
          <button onclick="location.reload()" style="
            background: linear-gradient(45deg, #00ffff, #0080ff);
            color: #000;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 500;
            cursor: pointer;
            margin-top: 20px;
          ">重新加载</button>
        </div>
      `
    }
  }
}).catch(error => {
  console.error('❌ Failed to load config:', error)
  
  // 如果连配置都加载不了，显示基础错误页面
  const blogContainer = document.getElementById('blog-container')
  if (blogContainer) {
    blogContainer.innerHTML = `
      <div style="text-align: center; padding: 60px 40px; color: #ff6b6b;">
        <h3>❌ 系统初始化失败</h3>
        <p>无法加载基础配置: ${error.message}</p>
        <p>请检查网络连接或联系管理员</p>
        <button onclick="location.reload()" style="
          background: linear-gradient(45deg, #00ffff, #0080ff);
          color: #000;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 500;
          cursor: pointer;
          margin-top: 20px;
        ">重新加载</button>
      </div>
    `
  }
})
