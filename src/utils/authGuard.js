/**
 * 认证守卫
 * 用于保护需要认证的页面和功能
 */

export class AuthGuard {
  constructor() {
    this.secretSequence = []
    this.secretCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'] // 经典的Konami代码
    this.clickSequence = []
    this.maxClickInterval = 1000 // 1秒内的点击才算连续
    this.lastClickTime = 0
    
    this.initSecretAccess()
  }

  /**
   * 初始化隐藏访问方式
   */
  initSecretAccess() {
    // 方式1: 键盘序列（Konami代码）
    document.addEventListener('keydown', (e) => {
      this.secretSequence.push(e.code)
      
      // 只保留最近的按键
      if (this.secretSequence.length > this.secretCode.length) {
        this.secretSequence.shift()
      }
      
      // 检查是否匹配
      if (this.secretSequence.length === this.secretCode.length) {
        const matches = this.secretSequence.every((key, index) => key === this.secretCode[index])
        if (matches) {
          this.triggerSecretAccess('konami')
          this.secretSequence = []
        }
      }
    })

    // 方式2: 连续点击页面右下角
    document.addEventListener('click', (e) => {
      const now = Date.now()
      const rect = document.documentElement.getBoundingClientRect()
      const x = e.clientX
      const y = e.clientY
      
      // 检查是否点击在右下角区域（50x50像素）
      if (x > rect.width - 50 && y > rect.height - 50) {
        if (now - this.lastClickTime < this.maxClickInterval) {
          this.clickSequence.push(now)
        } else {
          this.clickSequence = [now]
        }
        
        this.lastClickTime = now
        
        // 连续点击3次触发
        if (this.clickSequence.length >= 3) {
          this.triggerSecretAccess('click')
          this.clickSequence = []
        }
      } else {
        // 点击其他地方重置
        this.clickSequence = []
      }
    })

    // 方式3: URL参数
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('admin') === 'true' || urlParams.get('secret') === 'river2024') {
      this.triggerSecretAccess('url')
    }

    // 方式4: 控制台命令
    window.openAdmin = () => {
      this.triggerSecretAccess('console')
    }
    
    // 方式5: 特殊时间访问（开发者生日等）
    this.checkSpecialTime()
  }

  /**
   * 检查特殊时间
   */
  checkSpecialTime() {
    const now = new Date()
    const month = now.getMonth() + 1
    const day = now.getDate()
    
    // 特殊日期列表
    const specialDates = [
      { month: 2, day: 2, name: '开发者生日' },
      { month: 1, day: 1, name: '新年' },
      { month: 12, day: 25, name: '圣诞节' }
    ]
    
    const isSpecialDay = specialDates.some(date => date.month === month && date.day === day)
    if (isSpecialDay) {
      console.log('🎉 今天是特殊日子，管理面板已解锁！')
      // 可以选择自动跳转或者给出提示
    }
  }

  /**
   * 触发隐藏访问
   */
  triggerSecretAccess(method) {
    console.log(`🔓 隐藏访问已触发 (${method})`)
    
    // 显示提示
    this.showAccessNotification(method)
    
    // 延迟跳转，给用户看到提示的时间
    setTimeout(() => {
      this.redirectToAdmin()
    }, 2000)
  }

  /**
   * 显示访问通知
   */
  showAccessNotification(method) {
    const methodNames = {
      konami: '键盘密码',
      click: '连续点击',
      url: 'URL参数',
      console: '控制台命令',
      special: '特殊时间'
    }
    
    const notification = document.createElement('div')
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(45deg, #00ffff, #0080ff);
      color: #000;
      padding: 15px 20px;
      border-radius: 10px;
      font-weight: 600;
      z-index: 10000;
      box-shadow: 0 10px 30px rgba(0, 255, 255, 0.3);
      animation: slideIn 0.5s ease-out;
    `
    
    notification.innerHTML = `
      🔓 管理面板访问已解锁<br>
      <small>触发方式: ${methodNames[method] || method}</small>
    `
    
    // 添加动画样式
    const style = document.createElement('style')
    style.textContent = `
      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
    `
    document.head.appendChild(style)
    
    document.body.appendChild(notification)
    
    // 3秒后移除通知
    setTimeout(() => {
      notification.remove()
      style.remove()
    }, 3000)
  }

  /**
   * 跳转到管理页面
   */
  redirectToAdmin() {
    // 检查当前是否已经在管理页面
    if (window.location.pathname.includes('admin.html')) {
      return
    }
    
    // 跳转到管理页面
    window.location.href = 'admin.html'
  }

  /**
   * 检查管理员权限
   */
  static checkAdminAccess() {
    const authData = localStorage.getItem('admin_auth')
    if (!authData) {
      return false
    }
    
    try {
      const { expiry } = JSON.parse(authData)
      return Date.now() < expiry
    } catch (error) {
      localStorage.removeItem('admin_auth')
      return false
    }
  }

  /**
   * 保护页面访问
   */
  static protectPage() {
    // 如果是管理页面但未认证，跳转到首页
    if (window.location.pathname.includes('admin.html') && !AuthGuard.checkAdminAccess()) {
      // 给用户一个提示
      alert('访问被拒绝：需要管理员权限')
      window.location.href = 'index.html'
      return false
    }
    
    return true
  }

  /**
   * 为博客页面添加隐藏入口提示
   */
  static addHiddenEntryHints() {
    // 只在开发环境显示提示
    if (import.meta.env.DEV) {
      console.log(`
🔐 管理面板隐藏入口提示：
1. 键盘密码：↑↑↓↓←→←→BA
2. 连续点击页面右下角3次
3. URL参数：?admin=true 或 ?secret=river2024
4. 控制台命令：openAdmin()
5. 特殊日期自动解锁
      `)
    }
  }
}

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', () => {
  // 保护管理页面
  AuthGuard.protectPage()
  
  // 如果不是管理页面，初始化隐藏入口
  if (!window.location.pathname.includes('admin.html')) {
    new AuthGuard()
    AuthGuard.addHiddenEntryHints()
  }
})

export default AuthGuard
