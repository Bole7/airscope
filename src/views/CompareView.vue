<script setup>
import { computed, onActivated, onMounted, ref } from 'vue'
import { loadCityBundle } from '@/api/openMeteo'
import { useCityStore } from '@/stores/city'
import { useToast } from '@/composables/useToast'
import { levelOf } from '@/utils/aqi'
import { describeWeather } from '@/utils/weather'
import { average, round } from '@/utils/format'

import BaseCard from '@/components/ui/BaseCard.vue'
import WeatherIcon from '@/components/weather/WeatherIcon.vue'
import FavoriteButton from '@/components/weather/FavoriteButton.vue'

// 让 KeepAlive 能通过 include 精确缓存这个页面
defineOptions({ name: 'CompareView' })

const cityStore = useCityStore()
const toast = useToast()

const rows = ref([])
const loading = ref(true)
const keyword = ref('')
const rankMetric = ref('aqi')
const lastLoadedAt = ref(0)

const rankOptions = [
  { value: 'aqi', label: '空气质量（越低越好）' },
  { value: 'temperature', label: '气温（高到低）' },
  { value: 'humidity', label: '湿度（高到低）' },
]

async function loadAll(force = false) {
  loading.value = true
  const results = await Promise.all(
    cityStore.cities.map(async (city) => {
      try {
        const bundle = await loadCityBundle(city.id, { force })
        return { city, bundle }
      } catch {
        return { city, bundle: null }
      }
    }),
  )

  rows.value = results
    .filter((item) => item.bundle?.current)
    .map(({ city, bundle }) => {
      const level = levelOf(bundle.air?.aqi)
      return {
        id: city.id,
        name: city.name,
        province: city.province,
        tag: city.tag,
        temperature: round(bundle.current.temperature, 0),
        humidity: bundle.current.humidity,
        wind: round(bundle.current.wind, 1),
        aqi: bundle.air?.aqi ?? null,
        aqiLabel: level.label,
        aqiColor: level.color,
        aqiBg: `${level.color}18`,
        code: bundle.current.code,
        text: describeWeather(bundle.current.code).text,
        source: bundle.source,
      }
    })

  lastLoadedAt.value = Date.now()
  loading.value = false
}

onMounted(() => loadAll())

// KeepAlive 缓存后再次进入：超过 5 分钟才重新拉取，避免每次切换都请求
onActivated(() => {
  if (lastLoadedAt.value && Date.now() - lastLoadedAt.value > 5 * 60 * 1000) {
    loadAll()
    toast.push('已自动刷新对比数据', { type: 'info' })
  }
})

const filteredRows = computed(() => {
  const key = keyword.value.trim()
  if (!key) return rows.value
  return rows.value.filter((row) => row.name.includes(key) || row.province.includes(key))
})

// ---------- 表格排序（原 CityCompareTable 组件内联） ----------
const columns = [
  { key: 'name', label: '城市', align: 'left' },
  { key: 'temperature', label: '温度' },
  { key: 'humidity', label: '湿度' },
  { key: 'wind', label: '风速' },
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
  return [...filteredRows.value].sort((a, b) => {
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

// ---------- 指标排行（原 CompareBars 组件内联） ----------
const rankItems = computed(() => {
  const metric = rankMetric.value
  const sorted = [...filteredRows.value]
    .filter((row) => Number.isFinite(row[metric]))
    .sort((a, b) => (metric === 'aqi' ? a[metric] - b[metric] : b[metric] - a[metric]))
  return sorted.map((row) => ({
    label: row.name,
    value: row[metric],
    color: metric === 'aqi' ? row.aqiColor : '#2F6FED',
  }))
})

const rankUnit = computed(() =>
  rankMetric.value === 'aqi' ? '' : rankMetric.value === 'temperature' ? '°C' : '%',
)

const rankMax = computed(() => Math.max(1, ...rankItems.value.map((item) => Number(item.value) || 0)))

function barWidth(value) {
  return `${Math.max(3, ((Number(value) || 0) / rankMax.value) * 100)}%`
}

const insight = computed(() => {
  const list = filteredRows.value.filter((row) => Number.isFinite(row.aqi))
  if (!list.length) return null
  const sorted = [...list].sort((a, b) => a.aqi - b.aqi)
  const temps = list.map((row) => row.temperature).filter(Number.isFinite)
  return {
    best: sorted[0],
    worst: sorted[sorted.length - 1],
    avgAqi: Math.round(average(list.map((row) => row.aqi))),
    spread: temps.length ? Math.max(...temps) - Math.min(...temps) : null,
  }
})

const sourceLabel = computed(() => {
  if (!rows.value.length) return '加载中'
  return rows.value.every((row) => row.source === 'live') ? '实时数据' : '部分示例数据'
})

function refreshAll() {
  loadAll(true)
  toast.push('正在刷新全部城市…', { type: 'info' })
}
</script>

<template>
  <div class="container">
    <header class="page-header">
      <div class="page-header-text">
        <p class="eyebrow">Compare</p>
        <p class="description">
          同一套观测标准下横向对比温度、湿度、风速与空气质量。点击表头可以排序，星标可以把城市固定到收藏夹。
        </p>
      </div>
      <div class="page-header-actions">
        <span class="tag" :class="sourceLabel === '实时数据' ? 'tag--teal' : 'tag--accent'">{{ sourceLabel }}</span>
        <button type="button" class="btn btn--ghost btn--sm" @click="refreshAll">刷新全部</button>
      </div>
    </header>

    <section class="toolbar">
      <label class="field search-field">
        <svg viewBox="0 0 16 16" width="14" height="14" class="search-icon" aria-hidden="true">
          <circle cx="7" cy="7" r="4.6" fill="none" stroke="currentColor" stroke-width="1.6" />
          <path d="M10.6 10.6L14 14" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
        </svg>
        <input v-model="keyword" type="search" placeholder="搜索城市或省份" />
        <button v-if="keyword" type="button" class="clear" aria-label="清空搜索" @click="keyword = ''">×</button>
      </label>
      <div class="toolbar-right">
        <span class="text-sm muted">共 {{ filteredRows.length }} 座城市</span>
        <RouterLink to="/trend" class="btn btn--primary btn--sm">去看趋势 →</RouterLink>
      </div>
    </section>

    <!-- 对比表格：只服务本页，内联以减少跨文件跳转 -->
    <section class="section--tight">
      <div class="table-card card">
        <div v-if="loading" class="table-loading">
          <div v-for="i in 6" :key="i" class="loading-row">
            <div class="skeleton" style="width: 120px; height: 14px" />
            <div class="skeleton" style="width: 100%; height: 14px" />
          </div>
        </div>

        <div v-else-if="!filteredRows.length" class="empty">
          <p class="empty-title">没有匹配的城市</p>
          <p class="empty-desc">换一个关键词，或清空搜索条件再看看。</p>
        </div>

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
    </section>

    <section class="grid grid--2 section--tight">
      <BaseCard title="指标排行" subtitle="条形长度按当前筛选结果归一化">
        <template #actions>
          <select v-model="rankMetric" class="select">
            <option v-for="option in rankOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </template>

        <ul v-if="rankItems.length" class="bars">
          <li v-for="item in rankItems" :key="item.label" class="bar-row">
            <span class="bar-label">{{ item.label }}</span>
            <div class="bar-track">
              <span class="bar-fill" :style="{ width: barWidth(item.value), background: item.color }" />
            </div>
            <span class="bar-value tnum">
              {{ item.value.toFixed(0) }}<small>{{ rankUnit }}</small>
            </span>
          </li>
        </ul>
        <div v-else class="empty">
          <p class="empty-title">暂无可排行的数据</p>
          <p class="empty-desc">调整搜索条件后再试。</p>
        </div>
      </BaseCard>

      <BaseCard title="一眼洞察" subtitle="基于当前筛选出的城市实时计算">
        <ul v-if="insight" class="insight-list">
          <li>
            <span class="insight-label">空气最好</span>
            <span class="insight-value">
              {{ insight.best.name }}
              <small :style="{ color: insight.best.aqiColor }">AQI {{ insight.best.aqi }}</small>
            </span>
          </li>
          <li>
            <span class="insight-label">污染最重</span>
            <span class="insight-value">
              {{ insight.worst.name }}
              <small :style="{ color: insight.worst.aqiColor }">AQI {{ insight.worst.aqi }}</small>
            </span>
          </li>
          <li>
            <span class="insight-label">平均 AQI</span>
            <span class="insight-value">{{ insight.avgAqi }}</span>
          </li>
          <li>
            <span class="insight-label">温差跨度</span>
            <span class="insight-value">{{ insight.spread?.toFixed(0) ?? '—' }} °C</span>
          </li>
        </ul>
        <div v-else class="empty">
          <p class="empty-title">暂无洞察</p>
          <p class="empty-desc">数据加载完成后自动计算。</p>
        </div>
      </BaseCard>
    </section>

    <section class="section--tight">
      <div class="section-head">
        <div>
          <p class="eyebrow">Favorites</p>
          <h2>我的收藏</h2>
        </div>
        <span class="text-sm muted">收藏会保存在浏览器本地</span>
      </div>

      <TransitionGroup tag="div" name="list" class="favorites">
        <div v-for="city in cityStore.favoriteCities" :key="city.id" class="fav-card card">
          <div>
            <h3>{{ city.name }}</h3>
            <p class="muted text-sm">{{ city.province }} · {{ city.tag }}</p>
          </div>
          <div class="fav-actions">
            <FavoriteButton :city-id="city.id" />
            <RouterLink :to="`/city/${city.id}`" class="btn btn--ghost btn--sm">详情</RouterLink>
          </div>
        </div>
      </TransitionGroup>

      <div v-if="!cityStore.favoriteCities.length" class="empty">
        <p class="empty-title">还没有收藏</p>
        <p class="empty-desc">在表格里点任意一行的星标即可收藏。</p>
      </div>
    </section>
  </div>
</template>

<style scoped>
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  flex-wrap: wrap;
  padding-bottom: 18px;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* 搜索框（原 SearchInput 组件内联） */
.search-field {
  min-width: 220px;
  height: 38px;
}

.search-icon {
  color: var(--muted);
  flex-shrink: 0;
}

.clear {
  display: grid;
  place-items: center;
  width: 18px;
  height: 18px;
  border: 0;
  border-radius: 50%;
  background: var(--surface-3);
  color: var(--text-2);
  font-size: 0.85rem;
  line-height: 1;
  cursor: pointer;
}

.clear:hover {
  background: var(--border-strong);
}

input::-webkit-search-cancel-button {
  display: none;
}

/* 对比表格（原 CityCompareTable 组件内联） */
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

/* 指标排行条（原 CompareBars 组件内联） */
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
  opacity: 0.9;
  transition: width 0.7s cubic-bezier(0.2, 0.8, 0.2, 1), background 0.3s ease;
}

.bar-value {
  text-align: right;
  font-size: 0.82rem;
  font-weight: 560;
}

.bar-value small {
  margin-left: 2px;
  font-size: 0.66rem;
  font-weight: 500;
  color: var(--muted);
}

.insight-list {
  display: flex;
  flex-direction: column;
}

.insight-list li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 11px 0;
  border-bottom: 1px dashed var(--border);
}

.insight-list li:last-child {
  border-bottom: 0;
}

.insight-label {
  font-size: 0.83rem;
  color: var(--muted);
}

.insight-value {
  font-size: 0.9rem;
  font-weight: 560;
}

.insight-value small {
  margin-left: 6px;
  font-size: 0.75rem;
  font-weight: 500;
}

.section-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.section-head h2 {
  margin-top: 6px;
}

.favorites {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 14px;
}

.fav-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 18px;
}

.fav-card h3 {
  font-size: 1rem;
}

.fav-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.list-enter-active,
.list-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: scale(0.97);
}

.list-move {
  transition: transform 0.3s ease;
}
</style>
