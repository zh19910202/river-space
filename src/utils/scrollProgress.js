/**
 * 滚动进度条
 */

export class ScrollProgress {
  constructor() {
    this.progressBar = document.querySelector('.scroll-progress')
    this.init()
  }

  init() {
    if (!this.progressBar) return
    
    this.updateProgress()
    window.addEventListener('scroll', () => this.updateProgress())
  }

  updateProgress() {
    const scrollTop = window.pageYOffset
    const docHeight = document.documentElement.scrollHeight - window.innerHeight
    const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0
    
    this.progressBar.style.width = `${Math.min(100, Math.max(0, scrollPercent))}%`
  }
}

export default ScrollProgress
