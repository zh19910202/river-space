# River Space - 个人网站与技术博客

## 📁 最终优化的项目结构

```
resume/
├── 📚 docs/                      # 项目文档
│   ├── setup/                   # 环境设置和配置文档
│   │   ├── NOTION-SETUP.md     # Notion API 设置指南
│   │   ├── NOTION_API_FIX.md   # Notion API 修复说明
│   │   └── USAGE.md            # 使用说明
│   ├── development/            # 开发相关文档
│   │   ├── ADMIN_SYSTEM_GUIDE.md    # 管理系统指南
│   │   ├── BLOG_FIX_SUMMARY.md      # 博客修复总结
│   │   ├── MARKDOWN_FIX_SUMMARY.md  # Markdown 修复总结
│   │   ├── README-DEV.md            # 开发说明
│   │   ├── SEARCH_PAGINATION_FEATURES.md # 搜索分页功能
│   │   ├── TERMINAL_SYMBOL_FIX.md   # 终端符号修复
│   │   └── test-edit-functionality.md # 编辑功能测试
│   └── api/                    # API 文档 (预留)
├── 🌐 public/                    # 静态资源和页面
│   ├── pages/                  # 主要页面
│   │   ├── index.html         # 主页
│   │   ├── admin.html         # 管理页面
│   │   └── blog.html          # 博客页面
│   └── assets/                # 静态资源
│       ├── favicon.svg        # 网站图标
│       └── styles.css         # 全局样式
├── 💻 src/                       # 源代码
│   ├── admin/                 # 管理功能
│   │   └── adminManager.js    # 管理器
│   ├── assets/                # 源代码资源
│   │   ├── icons/             # 图标
│   │   └── images/            # 图片
│   ├── components/            # 组件
│   │   ├── BlogComponent.js   # 博客组件
│   │   └── NavigationComponent.js # 导航组件
│   ├── config/                # 配置
│   │   └── index.js          # 主配置文件
│   ├── services/              # 服务
│   │   ├── githubService.js   # GitHub服务
│   │   ├── notionService.js   # Notion服务
│   │   └── notionWriteService.js # Notion写入服务
│   ├── styles/                # 样式
│   │   ├── components/        # 组件样式
│   │   │   ├── blog-detail.css
│   │   │   ├── blog.css
│   │   │   ├── markdown.css
│   │   │   ├── modal.css
│   │   │   └── navigation.css
│   │   ├── utils/             # 工具样式
│   │   │   ├── animations.css
│   │   │   └── loading.css
│   │   ├── homepage.css       # 主页样式
│   │   └── main.css          # 主样式文件
│   ├── types/                 # 类型定义
│   ├── utils/                 # 工具函数
│   │   ├── apiClient.js       # API客户端
│   │   ├── authGuard.js       # 认证守卫
│   │   ├── contentParser.js   # 内容解析器
│   │   └── scrollProgress.js  # 滚动进度
│   ├── main.js               # 主入口
│   ├── blog.js               # 博客入口
│   └── script.js             # 脚本文件
├── 🧪 tests/                     # 测试相关文件
│   ├── integration/           # 集成测试
│   │   ├── check-properties.js
│   │   ├── detailed-test.js
│   │   ├── frontend-test.js
│   │   ├── test-both-formats.js
│   │   ├── test-id-format.js
│   │   ├── test-markdown-admin-style.js
│   │   └── test-notion.js
│   ├── debug/                 # 调试工具
│   │   ├── debug-markdown-rendering.js
│   │   ├── debug-markdown-simple.js
│   │   ├── debug-markdown.js
│   │   ├── debug-notion.html
│   │   ├── debug-script.js
│   │   └── notion-debug.html
│   └── verification/          # 验证页面
│       ├── demo-admin-access.html
│       ├── fix-verification.html
│       ├── pagination-demo.html
│       ├── test-blog-*.html (多个测试页面)
│       ├── test-colon-fix-verification.html
│       ├── test-content-rendering-fix.html
│       ├── test-inline-content-fix-comprehensive.html
│       └── 其他测试验证页面
├── 🔧 tools/                     # 开发工具和脚本
│   ├── servers/               # 服务器脚本
│   │   ├── notion-api-server.js
│   │   ├── github-proxy-server.js
│   │   ├── simple-server.js
│   │   └── static-server.py
│   ├── build/                 # 构建工具
│   │   └── vite.config.js
│   └── config/                # 配置文件
│       ├── config.js
│       └── notion-config-template.js
├── 📦 legacy/                    # 遗留文件（已废弃）
│   ├── pages/                 # 遗留页面
│   └── scripts/               # 遗留脚本
│       ├── notion-service.js
│       └── notion-test.js
├── scripts/                   # 安装脚本
│   └── notion-setup.js
├── dist/                      # 构建输出
├── node_modules/              # 依赖包
├── README.md                  # 项目主说明
├── PROJECT_STRUCTURE.md       # 项目结构说明
├── package.json               # 项目配置
└── vite.config.js            # Vite 配置
```

## ✨ 最终优化成果

### 1. 文件组织完全优化
- ✅ **根目录整洁**：移除所有散乱的JS和HTML文件
- ✅ **功能分类清晰**：按用途将文件分组到合适的目录
- ✅ **测试文件规范**：集成测试、调试工具、验证页面分离
- ✅ **文档结构化**：设置文档和开发文档分离

### 2. 目录职责明确
- `src/` - 核心源代码，包含所有业务逻辑
- `public/` - 静态资源和页面文件
- `tests/` - 所有测试相关文件，按类型分组
- `tools/` - 开发工具和配置文件
- `docs/` - 项目文档，按类型分组
- `legacy/` - 遗留文件，避免丢失历史代码

### 3. 依赖关系清晰
- 所有import路径已更新
- HTML文件资源引用正确
- 构建配置路径准确
- 无循环依赖或死链接

## 🚀 使用说明

### 开发环境启动
```bash
# 使用 Vite 开发服务器
npm run dev

# 或使用 Node.js 服务器
node tools/servers/simple-server.js

# 或使用 Python 服务器
python tools/servers/static-server.py
```

### 访问页面
- 主页: http://localhost:3000/public/pages/index.html
- 博客页面: http://localhost:3000/public/pages/blog.html
- 管理页面: http://localhost:3000/public/pages/admin.html

### 测试调试
- 集成测试: `tests/integration/`
- 调试工具: `tests/debug/`
- 验证页面: `tests/verification/`

## 📖 维护指南

1. **添加新功能**：在 `src/` 对应目录下创建
2. **添加新页面**：放置在 `public/pages/`
3. **添加新测试**：放置在 `tests/` 对应分类目录
4. **添加新工具**：放置在 `tools/` 对应子目录
5. **更新文档**：修改 `docs/` 中对应文档

## 🔧 文件引用规范

### 在HTML中引用资源
```html
<!-- 样式文件 -->
<link rel="stylesheet" href="../assets/styles.css">

<!-- 脚本文件 -->
<script type="module" src="../../src/main.js"></script>
```

### 在JS中引用模块
```javascript
// 相对路径引用
import { config } from '../config/index.js'
import { BlogComponent } from '../components/BlogComponent.js'
```

---

*项目结构终极优化完成于 2025-07-27*