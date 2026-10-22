<script setup>
import { computed } from 'vue'
import { useCityStore } from '@/stores/city'
import { useToast } from '@/composables/useToast'

/**
 * 收藏按钮：Pinia store + 全局提示 + Transition 动画
 */
const props = defineProps({
  cityId: { type: String, required: true },
  showLabel: { type: Boolean, default: false },
})

const cityStore = useCityStore()
const toast = useToast()

const active = computed(() => cityStore.isFavorite(props.cityId))

function toggle() {
  const added = cityStore.toggleFavorite(props.cityId)
  const name = cityStore.cityById(props.cityId)?.name || '城市'
  toast.push(added ? `已收藏 ${name}` : `已取消收藏 ${name}`, {
    type: added ? 'success' : 'info',
  })
}
</script>

<template>
  <button
    type="button"
    class="fav"
    :class="{ 'is-active': active }"
    :aria-pressed="active"
    :aria-label="active ? '取消收藏' : '收藏城市'"
    @click.stop.prevent="toggle"
  >
    <span class="fav-icon">
      <svg viewBox="0 0 20 20" width="16" height="16">
        <path
          d="M10 2.6l2.2 4.5 5 .7-3.6 3.5.9 5-4.5-2.4-4.5 2.4.9-5L2.8 7.8l5-.7L10 2.6Z"
          :fill="active ? 'currentColor' : 'none'"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linejoin="round"
        />
      </svg>
    </span>
    <span v-if="showLabel" class="fav-text">{{ active ? '已收藏' : '收藏' }}</span>
  </button>
</template>

<style scoped>
.fav {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 30px;
  padding: 0 10px;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: var(--surface);
  color: var(--muted);
  font-size: 0.78rem;
  cursor: pointer;
  transition: color 0.2s ease, border-color 0.2s ease, background 0.2s ease, transform 0.2s ease;
}

.fav:hover {
  color: #e0a02e;
  border-color: rgba(224, 160, 46, 0.5);
}

.fav.is-active {
  color: #d99a25;
  border-color: rgba(217, 154, 37, 0.35);
  background: #fdf6e6;
}

.fav:active {
  transform: scale(0.94);
}

.fav-icon {
  display: grid;
  place-items: center;
}

.fav-icon svg path {
  transition: fill 0.2s ease;
}
</style>
