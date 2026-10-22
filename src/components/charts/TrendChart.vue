<script setup>
import { computed, ref, useId, watch } from 'vue'
import { clamp } from '@/utils/format'

/**
 * 纯手写 SVG 折线图
 * 关键点：数据 → 坐标映射 → 平滑贝塞尔路径 → 鼠标位置反查索引 → 悬浮提示
 */
const props = defineProps({
  labels: { type: Array, default: () => [] },
  series: { type: Array, default: () => [] }, // [{ name, color, values: number[] }]
  unit: { type: String, default: '' },
  height: { type: Number, default: 300 },
  decimals: { type: Number, default: 0 },
  fill: { type: Boolean, default: true },
  showLegend: { type: Boolean, default: true },
})

const WIDTH = 860
const pad = { top: 18, right: 16, bottom: 34, left: 48 }
const uid = useId()

const innerW = WIDTH - pad.left - pad.right
const innerH = computed(() => props.height - pad.top - pad.bottom)
const count = computed(() => props.labels.length)
const step = computed(() => (count.value > 1 ? innerW / (count.value - 1) : 0))

// 纵轴范围：留 15% 余量，避免曲线贴边
const bounds = computed(() => {
  const all = props.series.flatMap((s) => s.values).filter((v) => Number.isFinite(v))
  if (!all.length) return { min: 0, max: 1 }
  let min = Math.min(...all)
  let max = Math.max(...all)
  if (min === max) {
    min -= 1
    max += 1
  }
  const padding = (max - min) * 0.15
  return { min: min - padding, max: max + padding }
})

function x(index) {
  return pad.left + index * step.value
}

function y(value) {
  if (!Number.isFinite(value)) return null
  const { min, max } = bounds.value
  return pad.top + innerH.value - ((value - min) / (max - min)) * innerH.value
}

const yTicks = computed(() => {
  const { min, max } = bounds.value
  return [0, 1, 2, 3].map((i) => max - ((max - min) / 3) * i)
})

const xTicks = computed(() => {
  const total = count.value
  if (!total) return []
  if (total === 1) return [0]
  const tickCount = Math.min(7, total)
  const list = []
  for (let i = 0; i < tickCount; i += 1) {
    const index = Math.round((i * (total - 1)) / (tickCount - 1))
    if (!list.includes(index)) list.push(index)
  }
  return list
})

function pointsOf(values) {
  return values
    .map((value, index) => ({ x: x(index), y: y(value), value }))
    .filter((point) => point.y !== null)
}

// Catmull-Rom 近似：用相邻点斜率算控制点，得到平滑曲线
function smoothPath(points) {
  if (!points.length) return ''
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`
  let d = `M ${points[0].x} ${points[0].y}`
  for (let i = 0; i < points.length - 1; i += 1) {
    const p0 = points[i - 1] || points[i]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[i + 2] || p2
    const tension = 0.16
    const c1x = p1.x + (p2.x - p0.x) * tension
    const c1y = p1.y + (p2.y - p0.y) * tension
    const c2x = p2.x - (p3.x - p1.x) * tension
    const c2y = p2.y - (p3.y - p1.y) * tension
    d += ` C ${c1x.toFixed(2)} ${c1y.toFixed(2)}, ${c2x.toFixed(2)} ${c2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`
  }
  return d
}

function areaOf(line, points) {
  if (!line || points.length < 2) return ''
  const bottom = pad.top + innerH.value
  const first = points[0]
  const last = points[points.length - 1]
  return `${line} L ${last.x.toFixed(2)} ${bottom} L ${first.x.toFixed(2)} ${bottom} Z`
}

const geometry = computed(() =>
  props.series.map((item, index) => {
    const points = pointsOf(item.values || [])
    const line = smoothPath(points)
    return {
      name: item.name,
      color: item.color,
      line,
      area: props.fill && index === 0 ? areaOf(line, points) : '',
    }
  }),
)

const pathKey = computed(
  () => `${count.value}-${props.labels[0] || ''}-${props.series[0]?.values?.[0] ?? ''}`,
)

function formatValue(value) {
  if (!Number.isFinite(value)) return '—'
  return Number(value).toFixed(props.decimals)
}

// ---- 交互：鼠标横坐标反查最近的数据点 ----
const chartRef = ref(null)
const hoverIndex = ref(-1)

const active = computed(
  () => hoverIndex.value >= 0 && hoverIndex.value < count.value,
)
const activeX = computed(() => (active.value ? x(hoverIndex.value) : 0))
const tooltipStyle = computed(() => ({ left: `${clamp((activeX.value / WIDTH) * 100, 10, 90)}%` }))

function locate(clientX) {
  const el = chartRef.value
  if (!el || count.value < 2) return
  const rect = el.getBoundingClientRect()
  const ratio = (clientX - rect.left) / rect.width
  const viewX = ratio * WIDTH
  const index = Math.round((viewX - pad.left) / step.value)
  hoverIndex.value = clamp(index, 0, count.value - 1)
}

function onMove(event) {
  locate(event.clientX)
}

function onTouch(event) {
  const touch = event.touches?.[0]
  if (touch) locate(touch.clientX)
}

function onLeave() {
  hoverIndex.value = -1
}

watch(count, () => {
  hoverIndex.value = -1
})
</script>

<template>
  <div class="chart">
    <div v-if="showLegend" class="legend">
      <span v-for="item in series" :key="item.name" class="legend-item">
        <i :style="{ background: item.color }" />
        {{ item.name }}
      </span>
      <span v-if="unit" class="legend-unit">单位：{{ unit }}</span>
    </div>

    <div v-if="!labels.length" class="chart-empty">暂无可绘制的数据</div>

    <div
      v-else
      ref="chartRef"
      class="chart-canvas"
      @mousemove="onMove"
      @mouseleave="onLeave"
      @touchstart.passive="onTouch"
      @touchmove.passive="onTouch"
    >
      <svg :viewBox="`0 0 ${WIDTH} ${height}`" class="chart-svg" role="img">
        <defs>
          <linearGradient
            v-for="(item, index) in series"
            :id="`grad-${uid}-${index}`"
            :key="item.name"
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop offset="0%" :stop-color="item.color" stop-opacity="0.22" />
            <stop offset="100%" :stop-color="item.color" stop-opacity="0" />
          </linearGradient>
        </defs>

        <!-- 横向网格与纵轴刻度 -->
        <g class="grid">
          <g v-for="tick in yTicks" :key="tick">
            <line :x1="pad.left" :x2="WIDTH - pad.right" :y1="y(tick)" :y2="y(tick)" />
            <text :x="pad.left - 10" :y="y(tick) + 4" text-anchor="end">{{ formatValue(tick) }}</text>
          </g>
        </g>

        <!-- 数据曲线 -->
        <g v-for="(item, index) in geometry" :key="item.name">
          <path v-if="item.area" :d="item.area" :fill="`url(#grad-${uid}-${index})`" class="area" />
          <path
            :key="`${item.name}-${pathKey}`"
            :d="item.line"
            fill="none"
            :stroke="item.color"
            stroke-width="2.4"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="line"
          />
        </g>

        <!-- 横轴标签 -->
        <g class="x-axis">
          <text v-for="index in xTicks" :key="index" :x="x(index)" :y="height - 10" text-anchor="middle">
            {{ labels[index] }}
          </text>
        </g>

        <!-- 悬浮十字线与数据点 -->
        <g v-if="active" class="crosshair">
          <line
            :x1="activeX"
            :x2="activeX"
            :y1="pad.top"
            :y2="height - pad.bottom"
            stroke="#94a3b8"
            stroke-width="1"
            stroke-dasharray="4 4"
          />
          <circle
            v-for="item in series"
            :key="item.name"
            :cx="activeX"
            :cy="y(item.values[hoverIndex])"
            r="4"
            :fill="item.color"
            stroke="#fff"
            stroke-width="2"
          />
        </g>
      </svg>

      <div v-if="active" class="tooltip" :style="tooltipStyle">
        <p class="tooltip-label">{{ labels[hoverIndex] }}</p>
        <p v-for="item in series" :key="item.name" class="tooltip-row">
          <i :style="{ background: item.color }" />
          <span class="tooltip-name">{{ item.name }}</span>
          <strong>{{ formatValue(item.values[hoverIndex]) }}<small>{{ unit }}</small></strong>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chart {
  width: 100%;
}

.legend {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 6px;
}

.legend-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.78rem;
  color: var(--text-2);
}

.legend-item i,
.tooltip-row i {
  width: 8px;
  height: 8px;
  border-radius: 3px;
  display: inline-block;
}

.legend-unit {
  margin-left: auto;
  font-size: 0.72rem;
  color: var(--muted);
}

.chart-canvas {
  position: relative;
  width: 100%;
}

.chart-svg {
  width: 100%;
  height: auto;
  display: block;
  overflow: visible;
}

.grid line {
  stroke: #edf1f7;
  stroke-width: 1;
}

.grid text {
  font-size: 10px;
  fill: #94a3b8;
  font-variant-numeric: tabular-nums;
}

.x-axis text {
  font-size: 10px;
  fill: #94a3b8;
}

.line {
  stroke-dasharray: 3200;
  stroke-dashoffset: 3200;
  animation: draw 1.15s cubic-bezier(0.3, 0.8, 0.3, 1) forwards;
}

.area {
  animation: fade 0.9s ease 0.15s both;
}

@keyframes draw {
  to {
    stroke-dashoffset: 0;
  }
}

@keyframes fade {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.tooltip {
  position: absolute;
  top: 6px;
  transform: translateX(-50%);
  min-width: 132px;
  padding: 9px 11px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: var(--shadow-md);
  pointer-events: none;
  backdrop-filter: blur(6px);
}

.tooltip-label {
  font-size: 0.72rem;
  color: var(--muted);
  margin-bottom: 4px;
}

.tooltip-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.76rem;
  color: var(--text-2);
}

.tooltip-row strong {
  margin-left: auto;
  color: var(--text);
  font-variant-numeric: tabular-nums;
}

.tooltip-row small {
  font-size: 0.68rem;
  color: var(--muted);
  margin-left: 1px;
}

.chart-empty {
  padding: 60px 0;
  text-align: center;
  color: var(--muted);
  font-size: 0.85rem;
}

@media (max-width: 640px) {
  .tooltip {
    min-width: 110px;
  }
}
</style>
