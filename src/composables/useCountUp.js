import { onUnmounted, ref, unref, watch } from 'vue'

/**
 * 数字滚动动画：用 requestAnimationFrame + easeOutCubic 让数值平滑过渡
 * 传入 ref / getter / 普通数字均可
 */
export function useCountUp(source, { duration = 900, decimals = 0 } = {}) {
  const display = ref(0)
  let frame = 0

  // 支持三种入参：ref、getter 函数、普通数字
  const read = () => {
    const raw = typeof source === 'function' ? source() : unref(source)
    const parsed = Number(raw)
    return Number.isFinite(parsed) ? parsed : null
  }

  function animate(to) {
    cancelAnimationFrame(frame)
    if (to === null) {
      display.value = 0
      return
    }
    const from = Number(display.value) || 0
    const start = performance.now()

    const tick = (now) => {
      const progress = Math.min(1, (now - start) / duration)
      const eased = 1 - (1 - progress) ** 3
      const value = from + (to - from) * eased
      display.value = decimals ? Number(value.toFixed(decimals)) : Math.round(value)
      if (progress < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
  }

  watch(read, (value) => animate(value), { immediate: true })

  onUnmounted(() => cancelAnimationFrame(frame))

  return display
}
