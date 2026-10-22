<script setup>
import { computed } from 'vue'
import WeatherIcon from './WeatherIcon.vue'
import { formatDateShort, formatWeekday } from '@/utils/format'

/**
 * 7 天预报条：用"温度区间条"表达每天的最低~最高温，比纯数字更直观
 */
const props = defineProps({
  days: { type: Object, default: null },
})

const range = computed(() => {
  if (!props.days?.tmin?.length) return { min: 0, max: 1 }
  const min = Math.min(...props.days.tmin)
  const max = Math.max(...props.days.tmax)
  return { min: min - 1, max: max + 1 }
})

function barStyle(index) {
  const { min, max } = range.value
  const span = Math.max(1, max - min)
  const low = props.days.tmin[index]
  const high = props.days.tmax[index]
  return {
    left: `${((low - min) / span) * 100}%`,
    width: `${Math.max(8, ((high - low) / span) * 100)}%`,
  }
}
</script>

<template>
  <div v-if="days" class="forecast">
    <div v-for="(time, index) in days.time" :key="time" class="day">
      <p class="day-name">{{ index === 0 ? '今天' : formatWeekday(time) }}</p>
      <p class="day-date">{{ formatDateShort(time) }}</p>

      <WeatherIcon :code="days.code[index]" :size="38" class="day-icon" />

      <p class="day-pop">
        <svg viewBox="0 0 12 14" width="9" height="10" aria-hidden="true">
          <path d="M6 1.2S1.6 5.8 1.6 8.4a4.4 4.4 0 0 0 8.8 0C10.4 5.8 6 1.2 6 1.2Z" fill="currentColor" opacity=".7" />
        </svg>
        {{ days.pop[index] ?? 0 }}%
      </p>

      <div class="day-temps">
        <span class="tmax">{{ Math.round(days.tmax[index]) }}°</span>
        <div class="temp-bar">
          <span class="temp-bar-fill" :style="barStyle(index)" />
        </div>
        <span class="tmin">{{ Math.round(days.tmin[index]) }}°</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.forecast {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 4px;
}

.day {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 10px 4px;
  border-radius: 14px;
  transition: background 0.2s ease;
}

.day:hover {
  background: var(--surface-2);
}

.day-name {
  font-size: 0.82rem;
  font-weight: 560;
}

.day-date {
  font-size: 0.7rem;
  color: var(--muted);
}

.day-icon {
  margin: 4px 0 2px;
}

.day-pop {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  font-size: 0.68rem;
  color: #4c82c8;
}

.day-temps {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 4px;
}

.tmax,
.tmin {
  font-size: 0.78rem;
  font-variant-numeric: tabular-nums;
  width: 22px;
}

.tmax {
  text-align: right;
  font-weight: 600;
  color: var(--text);
}

.tmin {
  text-align: left;
  color: var(--muted);
}

.temp-bar {
  position: relative;
  flex: 1;
  height: 5px;
  border-radius: 999px;
  background: var(--surface-3);
  overflow: hidden;
}

.temp-bar-fill {
  position: absolute;
  top: 0;
  bottom: 0;
  border-radius: 999px;
  background: linear-gradient(90deg, #6fc0b6, #e9b45a);
  transition: left 0.6s ease, width 0.6s ease;
}

@media (max-width: 720px) {
  .forecast {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    row-gap: 8px;
  }
}
</style>
