<script setup>
import { computed } from 'vue'
import { useCountUp } from '@/composables/useCountUp'

const props = defineProps({
  label: { type: String, required: true },
  value: { type: [Number, String], default: null },
  unit: { type: String, default: '' },
  decimals: { type: Number, default: 0 },
  hint: { type: String, default: '' },
  tone: { type: String, default: 'default' }, // default | accent | green | amber | rose
  accentColor: { type: String, default: '' },
})

const toneColor = computed(() => props.accentColor || `var(--${props.tone === 'default' ? 'text' : props.tone})`)

// 数值可能是 null / undefined / '—'，先归一化再交给滚动动画
const numeric = computed(() => {
  const raw = props.value
  if (raw === null || raw === undefined || raw === '') return null
  const parsed = Number(raw)
  return Number.isFinite(parsed) ? parsed : null
})

const animated = useCountUp(() => numeric.value ?? 0, {
  duration: 900,
  decimals: props.decimals,
})

const display = computed(() =>
  numeric.value === null ? '—' : animated.value.toFixed(props.decimals),
)
</script>

<template>
  <article class="stat-card card" :style="{ '--stat-color': toneColor }">
    <div class="stat-top">
      <span class="stat-label">{{ label }}</span>
      <slot name="icon" />
    </div>

    <p class="stat-value">
      <span class="tnum">{{ display }}</span>
      <span v-if="unit" class="stat-unit">{{ unit }}</span>
    </p>

    <p v-if="hint" class="stat-hint">{{ hint }}</p>
    <slot />
  </article>
</template>

<style scoped>
.stat-card {
  position: relative;
  padding: 18px 18px 16px;
  overflow: hidden;
}

.stat-card::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: var(--stat-color);
  opacity: 0.85;
}

.stat-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.stat-label {
  font-size: 0.78rem;
  color: var(--muted);
  letter-spacing: 0.02em;
}

.stat-value {
  margin-top: 6px;
  font-size: 1.95rem;
  line-height: 1.15;
  font-weight: 640;
  letter-spacing: -0.03em;
  color: var(--stat-color);
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.stat-unit {
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--muted);
  letter-spacing: 0;
}

.stat-hint {
  margin-top: 4px;
  font-size: 0.76rem;
  color: var(--muted);
}
</style>
