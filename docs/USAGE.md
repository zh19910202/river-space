# 使用说明

## 快速开始

1. 直接用浏览器打开 `index.html` 文件即可查看网站
2. 或者使用本地服务器：
   ```bash
   python3 -m http.server 8000
   ```
   然后在浏览器中访问 `http://localhost:8000`

## 自定义个人信息

### 方式一：修改 script.js 文件

在 `script.js` 文件顶部找到 `personalData` 对象，修改其中的信息：

```javascript
const personalData = {
    name: "您的姓名",
    position: "您的职位",
    experience: "工作年限",
    location: "所在城市",
    skills: [...],
    projects: [...],
    contacts: [...]
};
```

### 方式二：使用 config.js 文件

`config.js` 文件提供了更详细的配置选项，包括：
- 个人基本信息
- 技能详情
- 项目经验
- 工作经历
- 教育背景
- 联系方式
- 主题设置

## 功能特性

### 🎨 科技感设计
- 终端风格界面
- 霓虹色彩搭配
- 动态背景效果

### ⌨️ 打字机效果
- 模拟终端输入
- 流式文字加载
- 可自定义打字速度

### 🎯 滚动动画
- 平滑的滚动触发动画
- 技能进度条动画
- 项目卡片滑入效果

### 📱 响应式设计
- 完美适配桌面端
- 平板端优化
- 移动端友好

## 自定义样式

### 颜色主题
在 `styles.css` 中修改 CSS 变量：

```css
:root {
    --primary-color: #00ffff;    /* 主色调 */
    --secondary-color: #0080ff;  /* 次要色 */
    --accent-color: #ff0080;     /* 强调色 */
    --bg-dark: #0a0a0a;         /* 背景色 */
}
```

### 动画速度
调整动画持续时间：

```css
.info-section {
    transition: all 0.8s ease-out; /* 修改这个值 */
}
```

## 部署建议

### GitHub Pages
1. 将代码推送到 GitHub 仓库
2. 在仓库设置中启用 GitHub Pages
3. 选择主分支作为源

### Netlify
1. 将文件夹拖拽到 Netlify
2. 自动部署完成

### Vercel
1. 连接 GitHub 仓库
2. 自动构建和部署

## 浏览器兼容性
- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+

## 性能优化建议

1. **压缩图片**：如果添加头像或项目图片，请压缩以提高加载速度
2. **CDN 加速**：考虑使用 CDN 加速字体和库文件
3. **代码压缩**：生产环境建议压缩 CSS 和 JavaScript 文件

## 故障排除

### 字体加载问题
如果 Google Fonts 加载失败，可以下载字体文件到本地：
1. 下载 Orbitron 和 Roboto 字体
2. 将字体文件放在 `fonts/` 目录
3. 修改 CSS 中的字体引用

### 动画性能问题
如果在低端设备上动画卡顿：
1. 减少动画复杂度
2. 调整动画帧率
3. 可以在 `config.js` 中关闭某些动画效果

## 联系与支持

如果遇到问题或需要帮助，请参考 README.md 文件或提交 Issue。