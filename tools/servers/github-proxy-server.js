/**
 * GitHub Raw 内容代理服务器
 * 解决CORS和500错误问题
 */

import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
const PORT = 3001;

// 配置CORS
app.use(cors({
  origin: ['http://localhost:6000', 'http://localhost:3000', 'https://riverspace.netlify.app'],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// GitHub代理端点
app.get('/api/github-raw/*', async (req, res) => {
  try {
    // 提取GitHub路径
    const githubPath = req.path.replace('/api/github-raw/', '');
    const githubUrl = `https://raw.githubusercontent.com/${githubPath}`;
    
    console.log(`Proxying request to: ${githubUrl}`);
    
    // 添加用户代理头
    const response = await fetch(githubUrl, {
      headers: {
        'User-Agent': 'River-Space-Blog-Proxy/1.0',
        'Accept': 'text/markdown, text/plain, */*'
      }
    });

    if (!response.ok) {
      console.error(`GitHub API error: ${response.status} ${response.statusText}`);
      return res.status(response.status).json({
        error: `GitHub API error: ${response.status}`,
        url: githubUrl
      });
    }

    const content = await response.text();
    
    // 设置正确的内容类型
    res.set('Content-Type', 'text/markdown; charset=utf-8');
    res.set('Cache-Control', 'public, max-age=3600'); // 缓存1小时
    
    res.send(content);
    
  } catch (error) {
    console.error('Proxy server error:', error);
    res.status(500).json({
      error: 'Proxy server error',
      message: error.message
    });
  }
});

// 健康检查端点
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'github-proxy' });
});

app.listen(PORT, () => {
  console.log(`🚀 GitHub Proxy Server running on port ${PORT}`);
  console.log(`📡 Proxy endpoint: http://localhost:${PORT}/api/github-raw/...`);
  console.log(`🩺 Health check: http://localhost:${PORT}/health`);
});

// 错误处理
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});