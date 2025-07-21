import { defineConfig, loadEnv } from 'vite'
import legacy from '@vitejs/plugin-legacy'
import { resolve } from 'path'

export default defineConfig(({ mode }) => {
  // 加载环境变量
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
  // 根目录
  root: '.',
  
  // 构建配置
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        blog: resolve(__dirname, 'blog.html'),
        admin: resolve(__dirname, 'admin.html')
      },
      output: {
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]'
      }
    }
  },

  // 开发服务器配置
  server: {
    port: 3000,
    open: true,
    cors: true,
    proxy: {
      // 代理Notion API解决CORS问题
      '/api/notion': {
        target: 'https://api.notion.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => '/v1' + path.replace(/^\/api\/notion/, ''),
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            // 必需的Notion API头部
            proxyReq.setHeader('Authorization', `Bearer ${env.VITE_NOTION_API_KEY}`);
            proxyReq.setHeader('Notion-Version', '2022-06-28');
            proxyReq.setHeader('Content-Type', 'application/json');
            proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (compatible; Vite-Proxy/1.0)');
            
            console.log(`[Proxy] ${req.method} ${req.url} -> https://api.notion.com${proxyReq.path}`);
            console.log(`[Proxy] Headers:`, {
              'Authorization': `Bearer ${env.VITE_NOTION_API_KEY?.substring(0, 10)}...`,
              'Notion-Version': '2022-06-28',
              'Content-Type': 'application/json'
            });
          });
          
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log(`[Proxy] Response ${proxyRes.statusCode} for ${req.url}`);
            if (proxyRes.statusCode !== 200) {
              console.log(`[Proxy] Error headers:`, proxyRes.headers);
            }
            
            // 添加CORS头
            proxyRes.headers['Access-Control-Allow-Origin'] = '*';
            proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
            proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, Notion-Version';
          });
          
          proxy.on('error', (err, req, res) => {
            console.error(`[Proxy] Error for ${req.url}:`, err.message);
            if (!res.headersSent) {
              res.writeHead(500, {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
              });
              res.end(JSON.stringify({ 
                error: 'Proxy Error', 
                message: err.message 
              }));
            }
          });
        }
      },
      
      // 代理GitHub raw文件解决CORS问题
      '/api/github-raw': {
        target: 'https://raw.githubusercontent.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/github-raw/, ''),
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log(`[GitHub Proxy] ${req.method} ${req.url} -> https://raw.githubusercontent.com${proxyReq.path}`);
          });
          
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log(`[GitHub Proxy] Response ${proxyRes.statusCode} for ${req.url}`);
            
            // 添加CORS头
            proxyRes.headers['Access-Control-Allow-Origin'] = '*';
            proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
            proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type';
          });
          
          proxy.on('error', (err, req, res) => {
            console.error(`[GitHub Proxy] Error for ${req.url}:`, err.message);
            if (!res.headersSent) {
              res.writeHead(500, {
                'Content-Type': 'text/plain',
                'Access-Control-Allow-Origin': '*'
              });
              res.end('GitHub Proxy Error: ' + err.message);
            }
          });
        }
      }
    }
  },

  // 插件配置
  plugins: [
    // 兼容旧浏览器
    legacy({
      targets: ['defaults', 'not IE 11']
    })
  ],

  // 路径别名
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@services': resolve(__dirname, 'src/services'),
      '@utils': resolve(__dirname, 'src/utils'),
      '@styles': resolve(__dirname, 'src/styles'),
      '@assets': resolve(__dirname, 'src/assets')
    }
  },

  // CSS配置
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@styles/variables.scss";`
      }
    },
    devSourcemap: true
  },

  // 环境变量配置
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString())
  },

  // 优化配置
  optimizeDeps: {
    include: ['axios', 'marked', 'highlight.js', 'dompurify']
  }
}
})