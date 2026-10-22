import { onUnmounted, ref } from 'vue'

/** 响应式媒体查询：让 JS 也能感知屏幕断点（与 CSS 媒体查询配合使用） */
export function useMediaQuery(query = '(max-width: 720px)') {
  const matches = ref(false)
  let mql = null

  if (typeof window !== 'undefined' && window.matchMedia) {
    mql = window.matchMedia(query)
    matches.value = mql.matches
    const handler = (event) => {
      matches.value = event.matches
    }
    mql.addEventListener('change', handler)
    onUnmounted(() => mql.removeEventListener('change', handler))
  }

  return matches
}
