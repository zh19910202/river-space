/**
 * 导航组件
 * 处理导航栏的交互逻辑
 */

export class NavigationComponent {
  constructor() {
    this.navbar = document.getElementById('navbar')
    this.navToggle = document.getElementById('nav-toggle')
    this.navMenu = document.getElementById('nav-menu')
    
    this.init()
  }

  init() {
    this.setupScrollEffect()
    this.setupMobileMenu()
  }

  /**
   * 设置滚动效果
   */
  setupScrollEffect() {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        this.navbar?.classList.add('scrolled')
      } else {
        this.navbar?.classList.remove('scrolled')
      }
    })
  }

  /**
   * 设置移动端菜单
   */
  setupMobileMenu() {
    this.navToggle?.addEventListener('click', () => {
      this.navToggle.classList.toggle('active')
      this.navMenu?.classList.toggle('active')
    })

    // 点击菜单项后关闭移动端菜单
    this.navMenu?.addEventListener('click', (e) => {
      if (e.target.tagName === 'A') {
        this.navToggle?.classList.remove('active')
        this.navMenu?.classList.remove('active')
      }
    })

    // 点击外部关闭菜单
    document.addEventListener('click', (e) => {
      if (!this.navbar?.contains(e.target)) {
        this.navToggle?.classList.remove('active')
        this.navMenu?.classList.remove('active')
      }
    })
  }
}

export default NavigationComponent
