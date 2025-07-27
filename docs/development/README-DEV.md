# River Space - 开发文档

## 📁 项目结构

```
river-space/
├── src/                          # 源代码目录
│   ├── components/               # UI组件
│   │   ├── BlogComponent.js      # 博客组件
│   │   └── NavigationComponent.js # 导航组件
│   ├── services/                 # 服务层
│   │   └── notionService.js      # Notion API服务
│   ├── utils/                    # 工具函数
│   │   ├── apiClient.js          # API客户端
│   │   ├── contentParser.js      # 内容解析器
│   │   └── scrollProgress.js     # 滚动进度条
│   ├── config/                   # 配置管理
│   │   └── index.js              # 应用配置
│   ├── styles/                   # 样式文件
│   │   └── main.css              # 主样式入口
│   ├── assets/                   # 静态资源
│   ├── main.js                   # 应用入口
│   └── blog.js                   # 博客页面入口
├── scripts/                      # 构建脚本
│   └── notion-setup.js           # Notion配置向导
├── dist/                         # 构建输出目录
├── public/                       # 公共文件
├── package.json                  # 项目配置
├── vite.config.js               # Vite配置
├── .env.example                 # 环境变量示例
└── README.md                    # 项目说明
```

## 🚀 快速开始

### 环境要求

- Node.js >= 16.0.0
- npm >= 8.0.0

### 安装依赖

```bash
npm install
```

### 配置Notion API

#### 方法1：使用配置向导（推荐）

```bash
npm run notion:setup
```

#### 方法2：手动配置

1. 复制环境变量模板：
   ```bash
   cp .env.example .env
   ```

2. 编辑 `.env` 文件，填入您的Notion配置：
   ```env
   VITE_NOTION_API_KEY=your_notion_api_key
   VITE_NOTION_DATABASE_ID=your_database_id
   ```

### 开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

## 🛠️ 开发工具

### 代码格式化

```bash
npm run format      # 格式化代码
npm run lint        # 检查代码质量
```

### 项目清理

```bash
npm run clean       # 清理构建文件
```

## 🏗️ 架构设计

### 模块化设计

项目采用ES6模块化架构，主要模块包括：

1. **配置层** (`src/config/`)
   - 统一管理环境变量
   - 提供配置验证和默认值
   - 支持运行时配置更新

2. **服务层** (`src/services/`)
   - NotionService: 处理Notion API交互
   - 提供统一的数据接口

3. **工具层** (`src/utils/`)
   - ApiClient: HTTP请求封装
   - ContentParser: Notion内容解析
   - 其他通用工具函数

4. **组件层** (`src/components/`)
   - BlogComponent: 博客功能组件
   - NavigationComponent: 导航功能组件

### 错误处理

- 全局错误捕获和日志记录
- API错误的用户友好提示
- 网络重试机制
- 降级处理策略

### 性能优化

- Vite构建优化
- 代码分割和懒加载
- 图片懒加载
- 滚动虚拟化（计划中）

## 🔧 配置说明

### Vite配置 (`vite.config.js`)

- **代理配置**: 解决Notion API的CORS问题
- **构建优化**: 代码压缩、分包策略
- **开发服务器**: 热更新、端口配置
- **路径别名**: 简化import路径

### 环境变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `VITE_NOTION_API_KEY` | Notion API密钥 | - |
| `VITE_NOTION_DATABASE_ID` | 博客数据库ID | - |
| `VITE_APP_TITLE` | 应用标题 | "River Space" |
| `VITE_ENABLE_BLOG` | 启用博客功能 | true |
| `VITE_DEV_MODE` | 开发模式 | true |

## 📝 内容管理

### Notion数据库结构

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| Title | Title | ✅ | 文章标题 |
| Summary | Text | ✅ | 文章摘要 |
| Tags | Multi-select | ❌ | 文章标签 |
| Category | Select | ❌ | 文章分类 |
| Published | Checkbox | ✅ | 发布状态 |
| PublishDate | Date | ✅ | 发布日期 |
| ReadTime | Text | ❌ | 阅读时间 |

### 内容编写规范

1. **标题**: 使用清晰、描述性的标题
2. **摘要**: 1-2句话概括文章内容
3. **标签**: 使用相关的技术标签
4. **分类**: 选择合适的文章分类
5. **发布**: 完成后勾选Published字段

## 🔒 安全考虑

### API密钥管理

- 使用环境变量存储敏感信息
- 不要在代码中硬编码API密钥
- 生产环境考虑使用后端代理

### 内容安全

- 使用DOMPurify清理HTML内容
- XSS防护
- 输入验证和转义

## 🚀 部署指南

### 静态部署

1. 构建项目：
   ```bash
   npm run build
   ```

2. 将 `dist/` 目录部署到静态服务器

### 环境变量配置

生产环境需要设置以下环境变量：
- `VITE_NOTION_API_KEY`
- `VITE_NOTION_DATABASE_ID`
- `VITE_APP_URL`

### GitHub Pages部署

1. 在GitHub仓库设置中配置环境变量
2. 使用GitHub Actions自动部署
3. 配置自定义域名（可选）

## 🧪 测试

### 单元测试（计划中）

```bash
npm run test        # 运行测试
npm run test:watch  # 监听模式
npm run test:coverage # 覆盖率报告
```

### E2E测试（计划中）

```bash
npm run test:e2e    # 端到端测试
```

## 📈 性能监控

### 构建分析

```bash
npm run build:analyze  # 分析构建包大小
```

### 性能指标

- 首屏加载时间
- API响应时间
- 用户交互延迟

## 🤝 贡献指南

### 代码规范

- 使用ESLint和Prettier
- 遵循模块化设计原则
- 编写有意义的注释
- 保持代码简洁易读

### 提交规范

```
feat: 添加新功能
fix: 修复bug
docs: 更新文档
style: 代码格式调整
refactor: 重构代码
test: 添加测试
chore: 构建工具或辅助工具的变动
```

### 开发流程

1. Fork项目
2. 创建功能分支
3. 开发和测试
4. 提交代码审查
5. 合并到主分支

## 📞 技术支持

### 常见问题

1. **构建失败**: 检查Node.js版本和依赖安装
2. **API错误**: 验证Notion配置和网络连接
3. **样式问题**: 检查CSS导入和构建配置

### 日志调试

开发模式下在浏览器控制台查看详细日志：
- 配置信息
- API请求响应
- 错误堆栈

---

## 🔄 版本历史

### v1.0.0 (Current)
- ✅ 基础项目结构
- ✅ Notion API集成
- ✅ 博客功能
- ✅ 响应式设计
- ✅ 构建工具配置

### 计划功能
- 🔄 搜索功能
- 🔄 RSS订阅
- 🔄 PWA支持
- 🔄 国际化
- 🔄 性能优化

---

*最后更新: 2024-01-15*