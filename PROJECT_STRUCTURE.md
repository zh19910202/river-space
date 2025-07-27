# 项目目录结构

重新组织后的项目结构如下：

## 📁 目录说明

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
│   ├── assets/                # 源代码资源
│   ├── components/            # 组件
│   ├── config/                # 配置
│   ├── services/              # 服务
│   ├── styles/                # 样式
│   ├── types/                 # 类型定义
│   ├── utils/                 # 工具函数
│   ├── main.js               # 主入口
│   └── blog.js               # 博客入口
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
├── 🗂️ temp/                      # 临时文件
├── scripts/                   # 脚本 (保持原有结构)
├── dist/                      # 构建输出 (保持原有结构)
├── node_modules/              # 依赖包 (保持原有结构)
├── README.md                  # 项目主说明
├── package.json               # 项目配置
└── package-lock.json          # 依赖锁定文件
```

## 🔄 路径更新说明

### 主要页面路径变更
- `index.html` → `public/pages/index.html`
- `admin.html` → `public/pages/admin.html`
- `blog.html` → `public/pages/blog.html`

### 配置文件路径变更
- `config.js` → `tools/config/config.js`
- `vite.config.js` → `tools/build/vite.config.js`

### 服务器脚本路径变更
- `notion-api-server.js` → `tools/servers/notion-api-server.js`
- `simple-server.js` → `tools/servers/simple-server.js`

### 测试文件路径变更
- 所有 `test-*.html` → `tests/verification/`
- 所有 `debug-*.js` → `tests/debug/`
- 所有集成测试脚本 → `tests/integration/`

## 📖 使用说明

1. **开发环境启动**：
   ```bash
   # 启动开发服务器
   node tools/servers/simple-server.js
   
   # 或使用Python服务器
   python tools/servers/static-server.py
   ```

2. **访问页面**：
   - 主页: http://localhost:3000/public/pages/index.html
   - 管理页面: http://localhost:3000/public/pages/admin.html
   - 博客页面: http://localhost:3000/public/pages/blog.html

3. **测试页面**：
   - 验证页面在 `tests/verification/` 目录下
   - 调试工具在 `tests/debug/` 目录下

## ✨ 改进效果

1. **更清晰的结构**：按功能和类型组织文件
2. **更好的维护性**：相关文件集中管理
3. **更容易理解**：新人可以快速理解项目结构
4. **更好的扩展性**：为未来功能预留了合理的目录结构

---
*重组日期: 2025-07-24*