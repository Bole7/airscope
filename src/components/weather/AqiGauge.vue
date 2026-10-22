<script setup>
import { computed } from 'vue'
import { gaugePercent, levelOf } from '@/utils/aqi'

/**
 * 空气质量仪表盘：SVG 半圆弧 + pathLength 归一化 + stroke-dashoffset 动画
 */
const props = defineProps({
  value: { type: [Number, String], default: null },
  max: { type: Number, default: 300 },
  label: { type: String, default: 'US AQI' },
})

const numeric = computed(() => {
  const parsed = Number(props.value)
  return Number.isFinite(parsed) ? parsed : null
})

const level = computed(() => levelOf(numeric.value))

const percent = computed(() => gaugePercent(numeric.value, props.max))

const dashOffset = computed(() => 100 - percent.value)
</script>

<template>
  <div class="gauge">
    <svg viewBox="0 0 220 160" class="gauge-svg" role="img" :aria-label="`空气质量指数 ${numeric ?? '暂无'}`">
      <!-- 底槽 -->
      <path
        d="M32 122 A78 78 0 0 1 188 122"
        fill="none"
        stroke="#eef2f8"
        stroke-width="14"
        stroke-linecap="round"
      />
      <!-- 进度弧：pathLength=100 让偏移量直接等于百分比 -->
      <path
        d="M32 122 A78 78 0 0 1 188 122"
        fill="none"
        :stroke="level.color"
        stroke-width="14"
        stroke-linecap="round"
        pathLength="100"
        stroke-dasharray="100"
        :stroke-dashoffset="dashOffset"
        class="gauge-progress"
      />

      <text x="32" y="146" class="scale">0</text>
      <text x="188" y="146" class="scale" text-anchor="end">{{ max }}</text>

      <text x="110" y="96" text-anchor="middle" class="value" :fill="level.color">
        {{ numeric ?? '—' }}
      </text>
      <text x="110" y="118" text-anchor="middle" class="level">{{ level.label }}</text>
      <text x="110" y="136" text-anchor="middle" class="unit">{{ label }}</text>
    </svg>

    <p v-if="level.advice" class="gauge-advice">{{ level.advice }}</p>
  </div>
</template>

<style scoped>
.gauge {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.gauge-svg {
  width: 100%;
  max-width: 250px;
  height: auto;
}

.gauge-progress {
  transition: stroke-dashoffset 0.9s cubic-bezier(0.2, 0.8, 0.2, 1), stroke 0.4s ease;
}

.value {
  font-size: 34px;
  font-weight: 660;
  letter-spacing: -0.03em;
  font-variant-numeric: tabular-nums;
}

.level {
  font-size: 13px;
  font-weight: 560;
  fill: var(--text-2);
}

.unit {
  font-size: 10px;
  letter-spacing: 0.12em;
  fill: var(--muted);
}

.scale {
  font-size: 10px;
  fill: var(--muted);
}

.gauge-advice {
  max-width: 260px;
  text-align: center;
  font-size: 0.76rem;
  color: var(--muted);
  line-height: 1.5;
}
</style>
