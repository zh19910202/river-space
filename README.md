# 科技风个人简历网站

一个具有科技感和流式文字加载效果的个人简历网站，专为技术人员设计。

## ✨ 特性

- 🚀 **科技感设计**: 终端风格界面，霓虹色彩搭配
- ⌨️ **打字机效果**: 流式文字加载，模拟终端输入
- 🎯 **滚动动画**: 平滑的滚动触发动画效果
- 📱 **响应式设计**: 完美适配桌面端和移动端
- 🎨 **动态背景**: 星空和网格动画背景
- 📊 **进度指示**: 技能水平可视化展示
- 🔗 **项目展示**: 优雅的项目卡片布局
- 📈 **滚动进度**: 顶部滚动进度条

## 🛠️ 技术栈

- **HTML5**: 语义化结构
- **CSS3**: 现代样式和动画
- **JavaScript**: 原生JS，无依赖
- **字体**: Orbitron (科技感) + Roboto (可读性)

## 📁 文件结构

```
portfolio-website/
├── index.html          # 主页面
├── styles.css          # 样式文件
├── script.js           # 主要逻辑
├── config.js           # 配置文件
└── README.md           # 说明文档
```

## 🚀 快速开始

### 1. 下载文件
将所有文件下载到本地文件夹

### 2. 自定义信息
编辑 `script.js` 文件中的 `personalData` 对象，或者使用 `config.js` 进行配置：

```javascript
const personalData = {
    name: "您的姓名",
    position: "您的职位",
    experience: "工作年限",
    location: "所在城市",
    // ... 更多配置
};
```

### 3. 运行网站
- 直接双击 `index.html` 在浏览器中打开
- 或使用本地服务器：`python -m http.server 8000`

## 🎨 自定义指南

### 修改个人信息

在 `script.js` 中找到 `personalData` 对象，修改以下内容：

```javascript
const personalData = {
    // 基本信息
    name: "您的姓名",
    position: "您的职位", 
    experience: "5年+",
    location: "北京市",
    
    // 技能列表
    skills: [
        {
            name: "技能名称",
            level: 90, // 0-100
            description: "技能描述"
        }
        // 添加更多技能...
    ],
    
    // 项目经验
    projects: [
        {
            title: "项目名称",
            status: "已完成",
            description: "项目描述...",
            technologies: ["React", "Node.js"],
            links: [
                { text: "GitHub", url: "项目链接" }
            ]
        }
        // 添加更多项目...
    ],
    
    // 联系方式
    contacts: [
        {
            type: "邮箱",
            value: "your@email.com",
            icon: "📧"
        }
        // 添加更多联系方式...
    ]
};
```

### 修改颜色主题

在 `styles.css` 中的 `:root` 部分修改颜色变量：

```css
:root {
    --primary-color: #00ffff;    /* 主色调 */
    --secondary-color: #0080ff;  /* 次要色 */
    --accent-color: #ff0080;     /* 强调色 */
    --bg-dark: #0a0a0a;         /* 背景色 */
    /* ... 更多颜色变量 */
}
```

### 调整动画速度

修改CSS中的动画持续时间：

```css
/* 打字机速度 */
@keyframes typing {
    from { width: 0; }
    to { width: 100%; }
}

/* 滚动动画速度 */
.info-section {
    transition: all 0.8s ease-out; /* 调整这个值 */
}
```

## 🎯 功能说明

### 终端启动动画
页面加载时会模拟终端启动过程，显示系统初始化信息。

### 滚动触发动画
当用户滚动到不同区域时，会触发相应的动画效果：
- 个人信息：打字机效果
- 技能展示：进度条动画
- 项目经验：卡片滑入
- 联系方式：图标缩放

### 响应式布局
网站在不同设备上都能良好显示：
- 桌面端：多列布局
- 平板：适中布局
- 手机：单列布局

## 🔧 高级自定义

### 添加新的动画效果

1. 在CSS中定义关键帧：
```css
@keyframes yourAnimation {
    0% { /* 起始状态 */ }
    100% { /* 结束状态 */ }
}
```

2. 在JavaScript中触发：
```javascript
element.style.animation = 'yourAnimation 1s ease-out';
```

### 添加新的页面区域

1. 在HTML中添加新的section
2. 在CSS中添加对应样式
3. 在JavaScript中添加数据和动画逻辑

### 集成第三方库

可以轻松集成其他库来增强功能：
- **Three.js**: 3D背景效果
- **AOS**: 更多滚动动画
- **Chart.js**: 数据可视化
- **Particles.js**: 粒子背景

## 📱 浏览器兼容性

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+

## 🚀 部署指南

### GitHub Pages
1. 将代码推送到GitHub仓库
2. 在仓库设置中启用GitHub Pages
3. 选择主分支作为源

### Netlify
1. 将文件夹拖拽到Netlify
2. 自动部署完成

### Vercel
1. 连接GitHub仓库
2. 自动构建和部署

## 🎨 设计理念

这个网站采用了现代科技感设计：

- **色彩**: 以青色和蓝色为主，营造科技氛围
- **字体**: 使用Orbitron等宽字体增强科技感
- **动画**: 流畅的过渡和打字机效果
- **布局**: 卡片式设计，层次分明
- **交互**: 悬停效果和滚动动画

## 🤝 贡献

欢迎提交Issue和Pull Request来改进这个项目！

## 📄 许可证

MIT License - 可自由使用和修改

## 💡 使用建议

1. **个性化**: 根据自己的专业领域调整技能和项目
2. **内容质量**: 确保项目描述准确且有吸引力
3. **定期更新**: 保持信息的时效性
4. **性能优化**: 压缩图片，优化加载速度
5. **SEO优化**: 添加合适的meta标签

---

**祝您求职顺利！** 🚀