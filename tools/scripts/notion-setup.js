#!/usr/bin/env node

/**
 * Notion配置设置脚本
 */

import { createInterface } from 'readline'
import { writeFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const rl = createInterface({
  input: process.stdin,
  output: process.stdout
})

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve)
  })
}

async function setupNotion() {
  console.log('🚀 River Space - Notion API 配置向导\n')

  try {
    // 检查是否已存在.env文件
    const envPath = join(__dirname, '../.env')
    if (existsSync(envPath)) {
      const override = await question('发现已存在的.env文件，是否覆盖？(y/N): ')
      if (override.toLowerCase() !== 'y') {
        console.log('配置已取消')
        rl.close()
        return
      }
    }

    console.log('请访问 https://www.notion.so/my-integrations 创建Integration\n')

    const apiKey = await question('请输入Notion API密钥: ')
    if (!apiKey.startsWith('secret_')) {
      console.log('❌ API密钥格式不正确，应该以 secret_ 开头')
      rl.close()
      return
    }

    const databaseId = await question('请输入数据库ID: ')
    if (databaseId.length !== 32) {
      console.log('❌ 数据库ID格式不正确，应该是32位字符')
      rl.close()
      return
    }

    // 生成.env文件内容
    const envContent = `# Notion API Configuration
VITE_NOTION_API_KEY=${apiKey}
VITE_NOTION_DATABASE_ID=${databaseId}

# Application Configuration
VITE_APP_TITLE=River Space
VITE_APP_DESCRIPTION=智能合约开发工程师个人网站与技术博客
VITE_APP_URL=https://your-domain.com

# Development Configuration
VITE_DEV_MODE=true
VITE_API_BASE_URL=http://localhost:3000/api

# Feature Flags
VITE_ENABLE_BLOG=true
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_PWA=false
`

    writeFileSync(envPath, envContent)
    console.log('\n✅ 配置文件已创建: .env')
    console.log('\n接下来请：')
    console.log('1. 运行 npm run dev 启动开发服务器')
    console.log('2. 在Notion中创建博客文章')
    console.log('3. 设置Published字段为已选中状态')
    console.log('\n🎉 配置完成！')

  } catch (error) {
    console.error('❌ 配置失败:', error.message)
  } finally {
    rl.close()
  }
}

setupNotion()