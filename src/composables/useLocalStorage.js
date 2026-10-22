import { ref, watch } from 'vue'

/**
 * 把 ref 与 localStorage 双向同步（组合式函数示例）
 * 页面刷新后收藏城市、当前城市等偏好依然保留。
 */
export function useLocalStorage(key, defaultValue) {
  const read = () => {
    try {
      const raw = window.localStorage.getItem(key)
      return raw === null ? defaultValue : JSON.parse(raw)
    } catch {
      return defaultValue
    }
  }

  const state = ref(read())

  watch(
    state,
    (value) => {
      try {
        window.localStorage.setItem(key, JSON.stringify(value))
      } catch {
        // 隐私模式下写入可能失败，忽略即可
      }
    },
    { deep: true },
  )

  return state
}
