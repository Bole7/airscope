<script setup>
import { computed, ref } from 'vue'
import { findCity } from '@/data/cities'
import { useCityStore } from '@/stores/city'
import { useWeather } from '@/composables/useWeather'
import { buildWindow } from '@/utils/series'
import { levelOf } from '@/utils/aqi'
import { describeWeather } from '@/utils/weather'
import { formatClock } from '@/utils/format'

import CurrentWeather from '@/components/weather/CurrentWeather.vue'
import AqiGauge from '@/components/weather/AqiGauge.vue'
import ForecastStrip from '@/components/weather/ForecastStrip.vue'
import FavoriteButton from '@/components/weather/FavoriteButton.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseTabs from '@/components/ui/BaseTabs.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import BaseSkeleton from '@/components/ui/BaseSkeleton.vue'
import TrendChart from '@/components/charts/TrendChart.vue'

// 路由配置了 props: true，这里直接声明即可接收 /city/:id 的参数
const props = defineProps({
  id: { type: String, required: true },
})

const cityStore = useCityStore()
const city = computed(() => findCity(props.id))
const { data, loading, error } = useWeather(() => props.id)

const air = computed(() => data.value?.air || null)
const level = computed(() => levelOf(air.value?.aqi))
const condition = computed(() => describeWeather(data.value?.current?.code ?? 0))

const chartMetric = ref('temperature')
const chartTabs = [
  { value: 'temperature', label: '气温' },
  { value: 'aqi', label: '空气质量' },
]

const chartData = computed(() => {
  const bundle = data.value
  if (!bundle) return { labels: [], values: [] }
  const isAir = chartMetric.value === 'aqi'
  const source = isAir ? bundle.airHourly : bundle.hourly
  return buildWindow({
    times: source?.time,
    values: source?.[isAir ? 'aqi' : 'temperature'],
    currentIndex: bundle.currentIndex,
    range: '24h',
  })
})

const series = computed(() => [
  {
    name: chartMetric.value === 'aqi' ? 'AQI' : '气温',
    color: chartMetric.value === 'aqi' ? level.value.color : '#2F6FED',
    values: chartData.value.values,
  },
])

const pollutants = computed(() => {
  const source = data.value?.air
  if (!source) return []
  return [
    { label: 'PM2.5', value: source.pm25, unit: 'μg/m³' },
    { label: 'PM10', value: source.pm10, unit: 'μg/m³' },
    { label: 'O₃', value: source.o3, unit: 'μg/m³' },
    { label: 'NO₂', value: source.no2, unit: 'μg/m³' },
    { label: 'SO₂', value: source.so2, unit: 'μg/m³' },
    { label: 'CO', value: source.co, unit: 'mg/m³' },
  ]
})

const nearby = computed(() => cityStore.cities.filter((item) => item.id !== props.id).slice(0, 6))
const sunTimes = computed(() => {
  const daily = data.value?.daily
  if (!daily) return null
  return {
    sunrise: daily.sunrise?.[0]?.slice(11, 16),
    sunset: daily.sunset?.[0]?.slice(11, 16),
  }
})
</script>

<template>
  <div v-if="!city" class="container">
    <EmptyState title="没有找到这座城市" description="它可能不在当前支持的城市列表里。">
      <template #action>
        <RouterLink to="/compare" class="btn btn--ghost btn--sm">返回城市对比</RouterLink>
      </template>
    </EmptyState>
  </div>

  <div v-else class="container">
    <nav class="breadcrumb" aria-label="面包屑">
      <RouterLink to="/">概览</RouterLink>
      <span>/</span>
      <RouterLink to="/compare">城市对比</RouterLink>
      <span>/</span>
      <span class="current">{{ city.name }}</span>
    </nav>

    <header class="city-header">
      <div>
        <div class="row title-row">
          <h1>{{ city.name }}</h1>
          <span class="tag tag--accent">{{ city.tag }}</span>
        </div>
        <p class="muted text-sm">
          {{ city.province }} · 纬度 {{ city.lat }} / 经度 {{ city.lon }} ·
          当前{{ condition.text }} · 观测时间 {{ formatClock(data?.current?.time) }}
        </p>
      </div>

      <div class="header-actions">
        <FavoriteButton :city-id="city.id" show-label />
        <RouterLink :to="`/trend`" class="btn btn--primary btn--sm">趋势分析 →</RouterLink>
      </div>
    </header>

    <p v-if="error" class="inline-notice">{{ error }}</p>

    <section class="grid grid--sidebar section--tight">
      <CurrentWeather :city="city" :data="data" :loading="loading" />

      <BaseCard title="空气质量" :subtitle="`US AQI · ${level.label}`">
        <AqiGauge :value="air?.aqi" />
        <div class="sun-row">
          <div>
            <span class="sun-label">日出</span>
            <strong>{{ sunTimes?.sunrise || '—' }}</strong>
          </div>
          <div>
            <span class="sun-label">日落</span>
            <strong>{{ sunTimes?.sunset || '—' }}</strong>
          </div>
        </div>
      </BaseCard>
    </section>

    <section class="grid grid--2 section--tight">
      <BaseCard title="24 小时曲线" subtitle="气温与空气质量可以切换查看">
        <template #actions>
          <BaseTabs v-model="chartMetric" :tabs="chartTabs" size="sm" />
        </template>

        <BaseSkeleton v-if="loading && !data" width="100%" height="240px" radius="14px" />
        <TrendChart
          v-else
          :labels="chartData.labels"
          :series="series"
          :unit="chartMetric === 'aqi' ? 'AQI' : '°C'"
          :height="240"
          :decimals="0"
        />
      </BaseCard>

      <BaseCard title="污染物浓度" subtitle="数值为当前小时观测值">
        <BaseSkeleton v-if="loading && !data" width="100%" height="180px" radius="14px" />
        <ul v-else class="pollutants">
          <li v-for="item in pollutants" :key="item.label">
            <span class="pollutant-name">{{ item.label }}</span>
            <span class="pollutant-value tnum">{{ item.value ?? '—' }}</span>
            <span class="pollutant-unit">{{ item.unit }}</span>
          </li>
        </ul>
        <EmptyState v-if="!loading && !pollutants.length" title="暂无空气质量数据" description="该城市当前没有返回污染物监测值。" />
      </BaseCard>
    </section>

    <section class="section--tight">
      <BaseCard title="未来 7 天" subtitle="温度区间条越长，昼夜温差越大">
        <ForecastStrip v-if="data?.daily" :days="data.daily" />
        <BaseSkeleton v-else width="100%" height="120px" radius="14px" />
      </BaseCard>
    </section>

    <section class="section--tight other-cities">
      <h2>看看别的城市</h2>
      <div class="city-chips">
        <RouterLink
          v-for="item in nearby"
          :key="item.id"
          :to="`/city/${item.id}`"
          class="city-chip"
        >
          {{ item.name }}
          <small>{{ item.province }}</small>
        </RouterLink>
      </div>
    </section>
  </div>
</template>

<style scoped>
.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-top: 26px;
  font-size: 0.78rem;
  color: var(--muted);
}

.breadcrumb a:hover {
  color: var(--accent);
}

.breadcrumb .current {
  color: var(--text-2);
}

.city-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;
  padding: 18px 0 24px;
}

.title-row {
  gap: 12px;
}

.city-header h1 {
  font-size: clamp(2rem, 4vw, 2.8rem);
}

.city-header p {
  margin-top: 6px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.inline-notice {
  margin-bottom: 12px;
  padding: 8px 12px;
  border-radius: 10px;
  background: #fdf6e7;
  color: #8a6412;
  font-size: 0.76rem;
}

.sun-row {
  display: flex;
  justify-content: space-around;
  margin-top: 10px;
  padding-top: 12px;
  border-top: 1px solid var(--border);
  font-size: 0.8rem;
  text-align: center;
}

.sun-label {
  display: block;
  font-size: 0.7rem;
  color: var(--muted);
}

.sun-row strong {
  font-weight: 560;
  font-variant-numeric: tabular-nums;
}

.pollutants {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.pollutants li {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 12px;
  border-radius: 12px;
  background: var(--surface-2);
}

.pollutant-name {
  font-size: 0.74rem;
  color: var(--muted);
}

.pollutant-value {
  font-size: 1.25rem;
  font-weight: 620;
  letter-spacing: -0.02em;
}

.pollutant-unit {
  font-size: 0.65rem;
  color: var(--muted);
}

.other-cities h2 {
  font-size: 1.15rem;
  margin-bottom: 14px;
}

.city-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.city-chip {
  display: inline-flex;
  align-items: baseline;
  gap: 5px;
  padding: 8px 14px;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: var(--surface);
  font-size: 0.84rem;
  transition: border-color 0.2s ease, color 0.2s ease, transform 0.2s ease;
}

.city-chip small {
  font-size: 0.68rem;
  color: var(--muted);
}

.city-chip:hover {
  border-color: var(--accent);
  color: var(--accent);
  transform: translateY(-1px);
}

@media (max-width: 560px) {
  .pollutants {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
