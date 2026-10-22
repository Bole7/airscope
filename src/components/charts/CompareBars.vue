<script setup>
import { computed } from 'vue'

/**
 * 横向条形排行：用于城市之间的指标对比
 */
const props = defineProps({
  items: { type: Array, default: () => [] }, // [{ label, value, color, hint }]
  unit: { type: String, default: '' },
  decimals: { type: Number, default: 0 },
})

const max = computed(() => Math.max(1, ...props.items.map((item) => Number(item.value) || 0)))

function widthOf(value) {
  return `${Math.max(3, ((Number(value) || 0) / max.value) * 100)}%`
}

function format(value) {
  return Number.isFinite(Number(value)) ? Number(value).toFixed(props.decimals) : '—'
}
</script>

<template>
  <ul class="bars">
    <li v-for="item in items" :key="item.label" class="bar-row">
      <span class="bar-label">{{ item.label }}</span>
      <div class="bar-track">
        <span class="bar-fill" :style="{ width: widthOf(item.value), background: item.color }" />
      </div>
      <span class="bar-value tnum">{{ format(item.value) }}<small>{{ unit }}</small></span>
    </li>
  </ul>
</template>

<style scoped>
.bars {
  display: flex;
  flex-direction: column;
  gap: 11px;
}

.bar-row {
  display: grid;
  grid-template-columns: 62px minmax(0, 1fr) 74px;
  align-items: center;
  gap: 10px;
}

.bar-label {
  font-size: 0.82rem;
  color: var(--text-2);
  white-space: nowrap;
}

.bar-track {
  height: 8px;
  border-radius: 999px;
  background: var(--surface-3);
  overflow: hidden;
}

.bar-fill {
  display: block;
  height: 100%;
  border-radius: 999px;
  transition: width 0.7s cubic-bezier(0.2, 0.8, 0.2, 1), background 0.3s ease;
  opacity: 0.9;
}

.bar-value {
  text-align: right;
  font-size: 0.82rem;
  font-weight: 560;
}

.bar-value small {
  font-size: 0.66rem;
  color: var(--muted);
  margin-left: 2px;
  font-weight: 500;
}
</style>
