/**
 * River Space - 主入口文件
 * 初始化应用和全局配置
 */

import { config } from './config'
import './styles/main.css'

// 应用信息
console.log(`%c🚀 ${config.app.title} %cv${config.app.version}`, 
  'color: #00ffff; font-size: 16px; font-weight: bold;',
  'color: #666; font-size: 12px;'
)

console.log(`%cBuild Time: ${config.app.buildTime}`, 'color: #666; font-size: 10px;')

if (config.dev.mode) {
  console.log('%c🔧 Development Mode', 'color: #ffa500; font-weight: bold;')
}

// 全局错误处理
window.addEventListener('error', (event) => {
  config.error('Global error:', event.error)
})

window.addEventListener('unhandledrejection', (event) => {
  config.error('Unhandled promise rejection:', event.reason)
  event.preventDefault()
})

// 导出配置供全局使用
window.RiverSpace = {
  config,
  version: config.app.version
}
