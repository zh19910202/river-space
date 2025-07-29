# 博客代码复制功能

## 功能概述

为博客详情页面中的代码块添加了快捷复制功能，特别针对 bash 命令进行了优化。

## 主要特性

### 1. 自动识别代码类型
- **Bash 命令**: 自动识别 `bash`, `shell`, `sh`, `zsh`, `fish` 等语言标识
- **智能检测**: 即使没有语言标识，也能通过内容特征识别 bash 命令
- **通用代码**: 支持所有其他编程语言的代码块

### 2. 智能复制处理
- **Bash 命令清理**: 自动移除 `$` 提示符和注释行
- **原始代码**: 其他语言保持原始格式
- **空白处理**: 自动清理多余的空白字符

### 3. 用户体验优化
- **悬浮按钮**: 代码块右上角显示复制按钮
- **视觉反馈**: 复制成功后显示确认状态
- **错误处理**: 复制失败时显示错误提示
- **响应式设计**: 适配不同屏幕尺寸

## 技术实现

### 文件结构
```
src/utils/codeBlockCopy.js    # 核心功能实现
src/components/BlogComponent.js    # 集成到博客组件
src/utils/contentParser.js    # 代码块解析优化
```

### 核心类: CodeBlockCopy

#### 主要方法
- `init()`: 初始化功能，添加样式和监听器
- `addCopyButton()`: 为代码块添加复制按钮
- `copyCode()`: 执行复制操作
- `cleanBashCommand()`: 清理 bash 命令格式
- `isBashCommand()`: 智能识别 bash 命令

#### 样式特性
- **极简设计**: 无背景、无边框，只显示纯文字
- **智能显示**: 默认半透明，悬停时完全显示
- **颜色区分**: Bash 命令使用青色，其他代码使用白色
- **简洁交互**: 点击后显示 "copied" 状态
- **响应式**: 适配各种屏幕尺寸

## 使用方法

### 自动初始化
功能会在博客详情页面加载时自动初始化，无需手动调用。

### 手动初始化（如需要）
```javascript
import { initCodeBlockCopy } from './src/utils/codeBlockCopy.js';

// 初始化代码复制功能
const codeBlockCopy = initCodeBlockCopy();
```

## 支持的代码语言

### Bash 相关（特殊处理）
- `bash`
- `shell` 
- `sh`
- `zsh`
- `fish`
- `terminal`
- `console`
- `command`

### 通用语言（标准处理）
- JavaScript, Python, Java, C++, Go 等所有其他语言

## 示例效果

### Bash 命令复制前
```bash
$ npm install -g vercel
$ vercel login
# 这是注释
$ vercel deploy
```

### Bash 命令复制后
```
npm install -g vercel
vercel login
vercel deploy
```

### 其他代码（保持原样）
```javascript
function copyToClipboard(text) {
    navigator.clipboard.writeText(text);
}
```

## 浏览器兼容性

- **现代浏览器**: 使用 `navigator.clipboard` API
- **旧版浏览器**: 自动回退到 `document.execCommand` 方法
- **HTTPS 要求**: Clipboard API 需要 HTTPS 环境

## 测试

可以使用项目根目录下的 `test-code-copy.html` 文件进行功能测试：

```bash
# 启动本地服务器
npm run dev

# 访问测试页面
http://localhost:3000/test-code-copy.html
```

## 自定义配置

### 修改样式
编辑 `src/utils/codeBlockCopy.js` 中的 `addStyles()` 方法。

### 修改 Bash 识别规则
编辑 `isBashCommand()` 和 `cleanBashCommand()` 方法。

### 添加新的语言支持
在 `normalizeBashLanguage()` 方法中添加新的语言别名。

## 注意事项

1. **HTTPS 环境**: 现代浏览器的剪贴板 API 需要 HTTPS 环境
2. **权限要求**: 某些浏览器可能需要用户授权剪贴板访问
3. **内容安全**: 复制的内容会经过基本的清理处理
4. **性能优化**: 使用 MutationObserver 监听 DOM 变化，自动处理动态添加的代码块

## 更新日志

### v1.0.0 (2025-01-29)
- ✅ 初始版本发布
- ✅ 支持 Bash 命令智能识别和清理
- ✅ 支持所有编程语言的代码复制
- ✅ 极简 UI 设计（纯文字，无装饰）
- ✅ 智能显示逻辑（悬停激活）
- ✅ 响应式设计和移动端优化
- ✅ 自动集成到博客详情页面