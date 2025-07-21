import { createServer } from 'http';
import { readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = 6000;

const server = createServer(async (req, res) => {
  try {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    
    let filePath = req.url === '/' ? '/index.html' : req.url;
    
    // 处理文件扩展名
    if (!filePath.includes('.')) {
      filePath += '.html';
    }
    
    const fullPath = join(__dirname, filePath);
    
    // 设置MIME类型
    const ext = filePath.split('.').pop();
    const mimeTypes = {
      'html': 'text/html',
      'css': 'text/css',
      'js': 'application/javascript',
      'json': 'application/json',
      'png': 'image/png',
      'jpg': 'image/jpeg',
      'svg': 'image/svg+xml'
    };
    
    res.setHeader('Content-Type', mimeTypes[ext] || 'text/plain');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    const content = await readFile(fullPath);
    res.writeHead(200);
    res.end(content);
    
  } catch (error) {
    console.error(`Error serving ${req.url}:`, error.message);
    res.writeHead(404);
    res.end(`File not found: ${req.url}`);
  }
});

server.listen(PORT, () => {
  console.log(`🚀 Server running at:`);
  console.log(`   ➜ Local:   http://localhost:${PORT}/`);
  console.log(`   ➜ Blog:    http://localhost:${PORT}/blog.html`);
  console.log(`\nPress Ctrl+C to stop`);
});

process.on('SIGINT', () => {
  console.log('\n👋 Server stopped');
  process.exit(0);
});