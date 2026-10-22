<script setup>
import { computed } from 'vue'
import WeatherIcon from './WeatherIcon.vue'
import AnimatedNumber from '@/components/ui/AnimatedNumber.vue'
import BaseSkeleton from '@/components/ui/BaseSkeleton.vue'
import { describeWeather, windDirection, windLevel } from '@/utils/weather'
import { formatClock, formatDateShort, formatWeekday } from '@/utils/format'

const props = defineProps({
  city: { type: Object, required: true },
  data: { type: Object, default: null },
  loading: { type: Boolean, default: false },
})

const current = computed(() => props.data?.current || null)
const today = computed(() => props.data?.daily
  ? {
      tmax: props.data.daily.tmax[0],
      tmin: props.data.daily.tmin[0],
      pop: props.data.daily.pop?.[0],
    }
  : null)
const condition = computed(() => describeWeather(current.value?.code ?? 3))
const source = computed(() => props.data?.source || 'demo')
</script>

<template>
  <article class="current-card">
    <template v-if="loading && !current">
      <div class="stack">
        <BaseSkeleton width="120px" height="12px" />
        <BaseSkeleton width="180px" height="34px" />
        <BaseSkeleton width="100%" height="120px" radius="16px" />
        <BaseSkeleton width="100%" height="52px" radius="12px" />
      </div>
    </template>

    <template v-else-if="current">
      <header class="current-head">
        <div>
          <p class="eyebrow">{{ city.province }} · {{ city.name }}</p>
          <p class="current-time">
            {{ formatDateShort(current.time) }} {{ formatWeekday(current.time) }}
            · {{ formatClock(current.time) }} 观测
          </p>
        </div>
        <span class="source" :class="`source--${source}`">
          <span class="source-dot" />
          {{ source === 'live' ? '实时数据' : '示例数据' }}
        </span>
      </header>

      <div class="current-main">
        <div class="temp-block">
          <div class="temp-row">
            <span class="temp"><AnimatedNumber :value="current.temperature" :decimals="0" /></span>
            <span class="degree">°C</span>
          </div>
          <p class="condition">{{ condition.text }}，体感 {{ current.apparent?.toFixed(0) }}°</p>
          <p class="range">
            今日 {{ today?.tmax?.toFixed(0) }}° / {{ today?.tmin?.toFixed(0) }}°
            <span v-if="today?.pop !== undefined"> · 降水概率 {{ today.pop }}%</span>
          </p>
        </div>

        <div class="icon-wrap">
          <span class="icon-glow" />
          <WeatherIcon :code="current.code" :size="112" :is-day="current.isDay" />
        </div>
      </div>

      <ul class="metrics">
        <li>
          <span class="metric-label">湿度</span>
          <strong>{{ current.humidity }}<small>%</small></strong>
        </li>
        <li>
          <span class="metric-label">风速</span>
          <strong>{{ current.wind?.toFixed(1) }}<small>km/h</small></strong>
          <span class="metric-sub">{{ windLevel(current.wind) }}</span>
        </li>
        <li>
          <span class="metric-label">风向</span>
          <strong class="metric-text">{{ windDirection(current.windDirection) }}</strong>
        </li>
        <li>
          <span class="metric-label">气压</span>
          <strong>{{ current.pressure }}<small>hPa</small></strong>
        </li>
      </ul>

      <slot />
    </template>
  </article>
</template>

<style scoped>
.current-card {
  position: relative;
  padding: 24px;
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  background:
    radial-gradient(420px 200px at 88% 4%, rgba(47, 111, 237, 0.16), transparent 68%),
    radial-gradient(320px 180px at 10% 100%, rgba(15, 159, 146, 0.1), transparent 70%),
    linear-gradient(180deg, #ffffff, #f7fbff);
  box-shadow: var(--shadow-sm);
}

.current-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.current-time {
  margin-top: 4px;
  font-size: 0.76rem;
  color: var(--muted);
}

.source {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 24px;
  padding: 0 10px;
  border-radius: 999px;
  font-size: 0.7rem;
  background: var(--teal-soft);
  color: #0b7d73;
  white-space: nowrap;
}

.source--demo {
  background: #fdf3e3;
  color: #9a6a12;
}

.source-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: currentColor;
}

.current-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin: 18px 0 20px;
}

.temp-row {
  display: flex;
  align-items: flex-start;
  gap: 4px;
}

.temp {
  font-size: clamp(3.4rem, 8vw, 4.6rem);
  font-weight: 660;
  letter-spacing: -0.05em;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}

.degree {
  font-size: 1rem;
  color: var(--muted);
  margin-top: 8px;
}

.condition {
  margin-top: 6px;
  font-size: 0.95rem;
  font-weight: 520;
}

.range {
  margin-top: 2px;
  font-size: 0.78rem;
  color: var(--muted);
}

.icon-wrap {
  position: relative;
  display: grid;
  place-items: center;
  padding-right: 4px;
}

.icon-glow {
  position: absolute;
  width: 108px;
  height: 108px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.82), rgba(255, 255, 255, 0) 66%);
  opacity: 0.7;
}

.metrics {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 6px;
  padding-top: 16px;
  border-top: 1px solid rgba(213, 223, 236, 0.7);
}

.metrics li {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.metric-label {
  font-size: 0.72rem;
  color: var(--muted);
}

.metrics strong {
  font-size: 0.98rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.metrics small {
  font-size: 0.66rem;
  color: var(--muted);
  margin-left: 2px;
  font-weight: 500;
}

.metric-text {
  font-size: 0.88rem !important;
}

.metric-sub {
  font-size: 0.68rem;
  color: var(--muted);
}

@media (max-width: 480px) {
  .metrics {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px 6px;
  }
}
</style>
