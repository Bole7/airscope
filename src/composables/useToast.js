import { inject, ref } from 'vue'

// provide / inject 的 key，用 Symbol 避免命名冲突
export const TOAST_KEY = Symbol('airscope-toast')

/**
 * 在根组件创建一份全局提示服务，通过 provide 向下传递
 */
export function createToastService() {
  const items = ref([])
  let seed = 0

  function remove(id) {
    items.value = items.value.filter((item) => item.id !== id)
  }

  function push(message, options = {}) {
    const id = ++seed
    const type = options.type || 'info'
    items.value.push({ id, message, type })
    const duration = options.duration ?? 2800
    if (duration > 0) setTimeout(() => remove(id), duration)
    return id
  }

  return { items, push, remove }
}

/** 任意子组件调用：const toast = useToast(); toast.push('已收藏') */
export function useToast() {
  return inject(TOAST_KEY, { items: ref([]), push: () => {}, remove: () => {} })
}
