<script setup>
import { computed, onActivated, onMounted, ref } from 'vue'
import { loadCityBundle } from '@/api/openMeteo'
import { useCityStore } from '@/stores/city'
import { useToast } from '@/composables/useToast'
import { levelOf } from '@/utils/aqi'
import { describeWeather } from '@/utils/weather'
import { average, round } from '@/utils/format'

import PageHeader from '@/components/layout/PageHeader.vue'
import CityCompareTable from '@/components/weather/CityCompareTable.vue'
import CompareBars from '@/components/charts/CompareBars.vue'
import SearchInput from '@/components/ui/SearchInput.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
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
    <PageHeader
      eyebrow="Compare"
      title="八座城市，同一时刻"
      description="同一套观测标准下横向对比温度、湿度、风速与空气质量。点击表头可以排序，星标可以把城市固定到收藏夹。"
    >
      <template #actions>
        <span class="tag" :class="sourceLabel === '实时数据' ? 'tag--teal' : 'tag--accent'">{{ sourceLabel }}</span>
        <button type="button" class="btn btn--ghost btn--sm" @click="refreshAll">刷新全部</button>
      </template>
    </PageHeader>

    <section class="toolbar">
      <SearchInput v-model="keyword" placeholder="搜索城市或省份" />
      <div class="toolbar-right">
        <span class="text-sm muted">共 {{ filteredRows.length }} 座城市</span>
        <RouterLink to="/trend" class="btn btn--primary btn--sm">去看趋势 →</RouterLink>
      </div>
    </section>

    <section class="section--tight">
      <CityCompareTable :rows="filteredRows" :loading="loading" />
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

        <CompareBars
          v-if="rankItems.length"
          :items="rankItems"
          :unit="rankMetric === 'aqi' ? '' : rankMetric === 'temperature' ? '°C' : '%'"
          :decimals="0"
        />
        <EmptyState v-else title="暂无可排行的数据" description="调整搜索条件后再试。" />
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
        <EmptyState v-else title="暂无洞察" description="数据加载完成后自动计算。" />
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

      <EmptyState
        v-if="!cityStore.favoriteCities.length"
        title="还没有收藏"
        description="在表格里点任意一行的星标即可收藏。"
      />
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
