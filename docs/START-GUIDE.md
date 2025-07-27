# 🚀 River Space 启动指南

项目结构已完全优化，所有文件依赖关系已修复！

## 快速启动

### 方式一：使用npm脚本（推荐）
```bash
npm start
```

### 方式二：直接运行服务器
```bash
node tools/servers/simple-server.js
```

### 方式三：使用Vite开发服务器
```bash
npm run dev
```

## 访问地址

### Vite开发服务器（推荐）
启动后访问：http://localhost:3000

#### 页面导航（Vite）
- **主页（默认）**: http://localhost:3000/ → 直接渲染个人简历内容
- **个人简历**: http://localhost:3000/ 或 http://localhost:3000/pages/index.html
- **技术博客**: http://localhost:3000/pages/blog.html
- **管理后台**: http://localhost:3000/pages/admin.html

### 简单服务器
启动后访问：http://localhost:6000

#### 页面导航（简单服务器）
- **首页欢迎页面**: http://localhost:6000/
- **个人简历**: http://localhost:6000/public/pages/index.html
- **技术博客**: http://localhost:6000/public/pages/blog.html
- **管理后台**: http://localhost:6000/public/pages/admin.html

## ✅ 修复的问题

1. **根目录直接渲染**: 现在访问 http://localhost:3000/ 直接渲染个人简历页面内容，不是重定向
2. **博客卡片封面显示**: 修复了从Notion数据库获取封面图的逻辑，支持多种封面字段类型
3. **博客详情页内容**: 修复了博客详情页面容器查找和内容渲染问题
4. **服务器路径问题**: 修复了simple-server.js的项目根目录引用
5. **依赖关系错误**: 所有HTML、CSS、JS文件引用路径已更正
6. **package.json重复字段**: 移除了重复的devDependencies
7. **文件组织**: 所有文件按功能分类到合适目录
8. **JavaScript模块导入**: 修复了NotionService和ApiClient的路径引用问题

## 📁 当前项目结构

```
resume/
├── index.html              # 欢迎页面（导航）
├── public/pages/           # 主要页面
├── src/                    # 源代码
├── tests/                  # 测试文件
├── tools/                  # 开发工具
├── docs/                   # 项目文档
└── legacy/                 # 遗留文件
```

## 🔧 开发调试

- **集成测试**: `tests/integration/`
- **调试工具**: `tests/debug/`  
- **验证页面**: `tests/verification/`

---

**现在项目完全可以正常运行！** 🎉