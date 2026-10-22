<script setup>
import { computed } from 'vue'
import { useCountUp } from '@/composables/useCountUp'

/**
 * 数字滚动组件：props 变化时用 requestAnimationFrame 平滑过渡
 */
const props = defineProps({
  value: { type: [Number, String], default: 0 },
  decimals: { type: Number, default: 0 },
  suffix: { type: String, default: '' },
  duration: { type: Number, default: 900 },
})

const numeric = computed(() => {
  const parsed = Number(props.value)
  return Number.isFinite(parsed) ? parsed : null
})

const animated = useCountUp(() => numeric.value ?? 0, {
  duration: props.duration,
  decimals: props.decimals,
})

const text = computed(() => {
  if (numeric.value === null) return props.value ?? '—'
  return animated.value.toFixed(props.decimals)
})
</script>

<template>
  <span class="tnum">{{ text }}<span v-if="suffix" class="suffix">{{ suffix }}</span></span>
</template>

<style scoped>
.suffix {
  margin-left: 2px;
  font-size: 0.55em;
  font-weight: 500;
  color: var(--muted);
}
</style>
