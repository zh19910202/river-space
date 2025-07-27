// 滚动进度条
class ScrollProgress {
    constructor() {
        this.progressBar = document.querySelector('.scroll-progress');
        this.updateProgress();
        window.addEventListener('scroll', () => this.updateProgress());
    }

    updateProgress() {
        const scrollTop = window.pageYOffset;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = (scrollTop / docHeight) * 100;
        this.progressBar.style.width = scrollPercent + '%';
    }
}

// 博客应用类
class BlogApp {
    constructor() {
        this.scrollProgress = new ScrollProgress();
        this.blogs = [];
        this.isLoading = false;
        this.init();
    }

    async init() {
        // 初始化导航栏
        this.initNavigation();
        
        // 添加滚动动画观察器
        this.initScrollAnimations();
        
        // 加载博客内容
        await this.loadBlogsFromNotion();
        
        // 渲染博客内容
        this.renderBlogs();
    }

    // 从Notion加载博客数据
    async loadBlogsFromNotion() {
        this.setLoadingState(true);
        
        try {
            // 检查是否已配置Notion API
            if (!notionBlogService.apiKey || notionBlogService.apiKey === 'YOUR_NOTION_API_KEY') {
                this.showConfigurationHelp();
                return;
            }
            
            this.blogs = await notionBlogService.getBlogPosts();
            
            if (this.blogs.length === 0) {
                this.showEmptyState();
            }
        } catch (error) {
            console.error('加载博客失败:', error);
            this.showErrorState(error.message);
        } finally {
            this.setLoadingState(false);
        }
    }

    // 设置加载状态
    setLoadingState(loading) {
        this.isLoading = loading;
        const blogContainer = document.getElementById('blog-container');
        
        if (loading) {
            blogContainer.innerHTML = `
                <div class="loading-state">
                    <div class="loading-spinner"></div>
                    <p>正在从Notion加载博客文章...</p>
                </div>
            `;
        }
    }

    // 显示配置帮助
    showConfigurationHelp() {
        const blogContainer = document.getElementById('blog-container');
        blogContainer.innerHTML = `
            <div class="config-help">
                <h3>🔧 Notion API 配置</h3>
                <p>请按照以下步骤配置Notion API：</p>
                <ol>
                    <li>访问 <a href="https://www.notion.so/my-integrations" target="_blank">Notion Integrations</a> 创建新的Integration</li>
                    <li>复制获取到的API密钥</li>
                    <li>在Notion中创建博客数据库，包含以下字段：</li>
                    <ul>
                        <li><code>Title</code> (标题) - 文本</li>
                        <li><code>Summary</code> (摘要) - 文本</li>
                        <li><code>Tags</code> (标签) - 多选</li>
                        <li><code>Category</code> (分类) - 选择</li>
                        <li><code>Published</code> (发布状态) - 复选框</li>
                        <li><code>PublishDate</code> (发布日期) - 日期</li>
                        <li><code>ReadTime</code> (阅读时间) - 文本</li>
                    </ul>
                    <li>在浏览器控制台中运行：</li>
                    <pre><code>notionBlogService.setConfig('YOUR_API_KEY', 'YOUR_DATABASE_ID')</code></pre>
                    <li>刷新页面</li>
                </ol>
                <button onclick="location.reload()" class="retry-button">重新加载</button>
            </div>
        `;
    }

    // 显示空状态
    showEmptyState() {
        const blogContainer = document.getElementById('blog-container');
        blogContainer.innerHTML = `
            <div class="empty-state">
                <h3>📝 还没有发布的文章</h3>
                <p>请在Notion中创建文章并设置Published为已选中状态</p>
                <button onclick="blogApp.loadBlogsFromNotion()" class="retry-button">重新加载</button>
            </div>
        `;
    }

    // 显示错误状态
    showErrorState(errorMessage) {
        const blogContainer = document.getElementById('blog-container');
        blogContainer.innerHTML = `
            <div class="error-state">
                <h3>❌ 加载失败</h3>
                <p>无法从Notion加载博客内容</p>
                <p class="error-message">${errorMessage}</p>
                <button onclick="blogApp.loadBlogsFromNotion()" class="retry-button">重试</button>
            </div>
        `;
    }

    // 渲染博客列表
    renderBlogs() {
        const blogContainer = document.getElementById('blog-container');
        
        if (this.blogs.length === 0) {
            return;
        }

        // 清空容器
        blogContainer.innerHTML = '';
        
        this.blogs.forEach((blog, index) => {
            const blogElement = document.createElement('div');
            blogElement.className = 'blog-item';
            blogElement.style.animationDelay = `${index * 200}ms`;
            
            const tagTags = blog.tags.map(tag => 
                `<span class="blog-tag">${tag}</span>`
            ).join('');
            
            blogElement.innerHTML = `
                <div class="blog-header">
                    <div class="blog-meta">
                        <span class="blog-category">${blog.category || '未分类'}</span>
                        <span class="blog-date">${blog.publishDate}</span>
                        <span class="blog-read-time">${blog.readTime}</span>
                    </div>
                    <h3 class="blog-title">${blog.title}</h3>
                </div>
                <p class="blog-summary">${blog.summary}</p>
                <div class="blog-tags">${tagTags}</div>
                <div class="blog-actions">
                    <button class="blog-read-more" onclick="blogApp.showBlogDetail('${blog.id}')">阅读全文</button>
                    <a href="${blog.url}" target="_blank" class="blog-notion-link">在Notion中查看</a>
                </div>
            `;
            
            blogContainer.appendChild(blogElement);
        });
    }

    // 显示博客详情
    async showBlogDetail(blogId) {
        const blog = this.blogs.find(b => b.id === blogId);
        if (!blog) return;

        // 创建加载中的模态框
        const modal = document.createElement('div');
        modal.className = 'blog-modal';
        modal.innerHTML = `
            <div class="blog-modal-content">
                <div class="blog-modal-header">
                    <button class="blog-modal-close" onclick="this.closest('.blog-modal').remove()">×</button>
                    <div class="blog-modal-meta">
                        <span class="blog-category">${blog.category || '未分类'}</span>
                        <span class="blog-date">${blog.publishDate}</span>
                        <span class="blog-read-time">${blog.readTime}</span>
                    </div>
                </div>
                <div class="blog-modal-body">
                    <h1>${blog.title}</h1>
                    <div class="loading-content">
                        <div class="loading-spinner"></div>
                        <p>正在加载文章内容...</p>
                    </div>
                </div>
            </div>
            <div class="blog-modal-backdrop" onclick="this.closest('.blog-modal').remove()"></div>
        `;

        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('show'), 10);

        try {
            // 从Notion获取文章内容（block数组）
            const blocks = await notionBlogService.getBlogContent(blogId);
            // 用ContentParser解析为HTML
            if (!this.contentParser) {
                this.contentParser = new ContentParser();
            }
            const html = this.contentParser.parseBlocks(blocks);
            // 更新模态框内容
            const modalBody = modal.querySelector('.blog-modal-body');
            modalBody.innerHTML = `
                <h1>${blog.title}</h1>
                <div class="blog-content markdown-content">${html}</div>
            `;
        } catch (error) {
            console.error('加载文章内容失败:', error);
            const modalBody = modal.querySelector('.blog-modal-body');
            modalBody.innerHTML = `
                <h1>${blog.title}</h1>
                <div class="error-content">
                    <p>❌ 无法加载文章内容</p>
                    <p class="error-message">${error.message}</p>
                    <a href="${blog.url}" target="_blank" class="blog-notion-link">在Notion中查看完整文章</a>
                </div>
            `;
        }
    }

    initNavigation() {
        const navbar = document.getElementById('navbar');
        const navToggle = document.getElementById('nav-toggle');
        const navMenu = document.getElementById('nav-menu');
        
        // 导航栏滚动效果
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
        
        // 移动端菜单切换
        navToggle.addEventListener('click', () => {
            navToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }

    initScrollAnimations() {
        // 博客项目滚动动画
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate');
                }
            });
        }, { threshold: 0.1 });

        // 监听动态添加的博客项目
        const blogContainer = document.getElementById('blog-container');
        const mutationObserver = new MutationObserver(() => {
            const blogItems = document.querySelectorAll('.blog-item:not(.observed)');
            blogItems.forEach(item => {
                item.classList.add('observed');
                observer.observe(item);
            });
        });

        mutationObserver.observe(blogContainer, { childList: true });
    }
}

// 页面加载完成后初始化应用
let blogApp;
document.addEventListener('DOMContentLoaded', () => {
    blogApp = new BlogApp();
});

// 添加页面可见性检测
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        document.title = '👋 回来看看技术文章吧！';
    } else {
        document.title = '技术博客 - River Space';
    }
});