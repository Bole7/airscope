/**
 * 两个自定义指令：
 * v-reveal      —— 元素滚动进入视口时淡入上移（IntersectionObserver）
 * v-click-outside —— 点击元素外部时触发回调（下拉菜单收起）
 */

export const reveal = {
  mounted(el, binding) {
    const delay = Number(binding.value) || 0
    el.style.setProperty('--reveal-delay', `${delay}ms`)
    el.classList.add('reveal')

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            el.classList.add('reveal-visible')
            observer.unobserve(el)
          }
        })
      },
      { threshold: 0.12 },
    )
    observer.observe(el)
    el._revealObserver = observer
  },
  unmounted(el) {
    el._revealObserver?.disconnect()
    delete el._revealObserver
  },
}

export const clickOutside = {
  mounted(el, binding) {
    el._clickOutside = (event) => {
      if (!el.contains(event.target)) binding.value?.(event)
    }
    document.addEventListener('pointerdown', el._clickOutside)
  },
  unmounted(el) {
    document.removeEventListener('pointerdown', el._clickOutside)
    delete el._clickOutside
  },
}

export function installDirectives(app) {
  app.directive('reveal', reveal)
  app.directive('click-outside', clickOutside)
}
