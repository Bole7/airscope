<script setup>
import { computed, ref } from 'vue'
import WeatherIcon from '@/components/weather/WeatherIcon.vue'
import FavoriteButton from '@/components/weather/FavoriteButton.vue'
import BaseSkeleton from '@/components/ui/BaseSkeleton.vue'
import EmptyState from '@/components/ui/EmptyState.vue'

/**
 * 可排序的城市对比表格
 * 排序状态放在组件内部（sortKey / sortDir），父组件只负责提供数据
 */
const props = defineProps({
  rows: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
})

const columns = [
  { key: 'name', label: '城市', align: 'left' },
  { key: 'temperature', label: '温度', unit: '°C' },
  { key: 'humidity', label: '湿度', unit: '%' },
  { key: 'wind', label: '风速', unit: 'km/h' },
  { key: 'aqi', label: 'AQI' },
]

const sortKey = ref('aqi')
const sortDir = ref('desc')

function toggleSort(key) {
  if (sortKey.value === key) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortDir.value = key === 'name' ? 'asc' : 'desc'
  }
}

function arrowOf(key) {
  if (sortKey.value !== key) return '↕'
  return sortDir.value === 'asc' ? '↑' : '↓'
}

const sortedRows = computed(() => {
  const direction = sortDir.value === 'asc' ? 1 : -1
  return [...props.rows].sort((a, b) => {
    const left = a[sortKey.value]
    const right = b[sortKey.value]
    if (typeof left === 'string' || typeof right === 'string') {
      return String(left).localeCompare(String(right), 'zh-CN') * direction
    }
    const lv = Number.isFinite(left) ? left : -Infinity
    const rv = Number.isFinite(right) ? right : -Infinity
    return (lv - rv) * direction
  })
})
</script>

<template>
  <div class="table-card card">
    <div v-if="loading" class="table-loading">
      <div v-for="i in 6" :key="i" class="loading-row">
        <BaseSkeleton width="120px" height="14px" />
        <BaseSkeleton width="100%" height="14px" />
      </div>
    </div>

    <EmptyState
      v-else-if="!rows.length"
      title="没有匹配的城市"
      description="换一个关键词，或清空搜索条件再看看。"
    />

    <div v-else class="table-scroll">
      <table>
        <thead>
          <tr>
            <th v-for="column in columns" :key="column.key" :class="`align-${column.align || 'right'}`">
              <button type="button" class="sort-btn" @click="toggleSort(column.key)">
                {{ column.label }}
                <span class="sort-arrow" :class="{ active: sortKey === column.key }">{{ arrowOf(column.key) }}</span>
              </button>
            </th>
            <th class="align-left">天气</th>
            <th class="align-right">收藏</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="row in sortedRows" :key="row.id">
            <td>
              <RouterLink :to="`/city/${row.id}`" class="city-cell">
                <span class="city-avatar">{{ row.name.slice(0, 1) }}</span>
                <span class="city-text">
                  <strong>{{ row.name }}</strong>
                  <small>{{ row.province }}</small>
                </span>
              </RouterLink>
            </td>
            <td class="align-right tnum">
              {{ row.temperature ?? '—' }}<span class="unit">°C</span>
            </td>
            <td class="align-right tnum">
              {{ row.humidity ?? '—' }}<span class="unit">%</span>
            </td>
            <td class="align-right tnum">
              {{ row.wind ?? '—' }}<span class="unit">km/h</span>
            </td>
            <td class="align-right">
              <span class="aqi-badge" :style="{ color: row.aqiColor, background: row.aqiBg }">
                {{ row.aqi ?? '—' }}
                <small>{{ row.aqiLabel }}</small>
              </span>
            </td>
            <td class="align-left">
              <div class="weather-cell">
                <WeatherIcon :code="row.code" :size="26" />
                <span>{{ row.text }}</span>
              </div>
            </td>
            <td class="align-right">
              <FavoriteButton :city-id="row.id" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.table-card {
  overflow: hidden;
}

.table-scroll {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  min-width: 720px;
}

thead th {
  padding: 12px 14px;
  background: var(--surface-2);
  border-bottom: 1px solid var(--border);
  font-weight: 520;
  font-size: 0.76rem;
  color: var(--muted);
  white-space: nowrap;
}

tbody td {
  padding: 13px 14px;
  border-bottom: 1px solid var(--border);
  font-size: 0.87rem;
  color: var(--text-2);
}

tbody tr:last-child td {
  border-bottom: 0;
}

tbody tr:hover td {
  background: #fbfdff;
}

.align-right {
  text-align: right;
}

.align-left {
  text-align: left;
}

.sort-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border: 0;
  background: transparent;
  color: inherit;
  font-size: inherit;
  font-weight: 520;
  cursor: pointer;
  padding: 0;
}

.sort-btn:hover {
  color: var(--text);
}

.sort-arrow {
  font-size: 0.7rem;
  color: var(--border-strong);
}

.sort-arrow.active {
  color: var(--accent);
}

.city-cell {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.city-avatar {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border-radius: 10px;
  background: var(--accent-soft);
  color: var(--accent-strong);
  font-size: 0.8rem;
  font-weight: 600;
}

.city-text {
  display: flex;
  flex-direction: column;
  line-height: 1.25;
}

.city-text strong {
  font-size: 0.88rem;
  color: var(--text);
  font-weight: 560;
}

.city-text small {
  font-size: 0.7rem;
  color: var(--muted);
}

.unit {
  margin-left: 2px;
  font-size: 0.68rem;
  color: var(--muted);
}

.aqi-badge {
  display: inline-flex;
  align-items: baseline;
  gap: 4px;
  padding: 3px 9px;
  border-radius: 999px;
  font-size: 0.82rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.aqi-badge small {
  font-size: 0.66rem;
  font-weight: 500;
  opacity: 0.85;
}

.weather-cell {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.82rem;
}

.table-loading {
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.loading-row {
  display: grid;
  grid-template-columns: 140px 1fr;
  gap: 20px;
  align-items: center;
}
</style>
