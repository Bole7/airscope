<script setup>
import { computed } from 'vue'
import { useCityStore } from '@/stores/city'
import { useWeather } from '@/composables/useWeather'
import { useToast } from '@/composables/useToast'
import { buildWindow } from '@/utils/series'
import { AQI_LEVELS, levelOf } from '@/utils/aqi'
import { formatClock } from '@/utils/format'

import CityPicker from '@/components/weather/CityPicker.vue'
import CurrentWeather from '@/components/weather/CurrentWeather.vue'
import AqiGauge from '@/components/weather/AqiGauge.vue'
import ForecastStrip from '@/components/weather/ForecastStrip.vue'
import FavoriteButton from '@/components/weather/FavoriteButton.vue'
import StatCard from '@/components/ui/StatCard.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseSkeleton from '@/components/ui/BaseSkeleton.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import TrendChart from '@/components/charts/TrendChart.vue'

const cityStore = useCityStore()
const toast = useToast()

// 城市切换：v-model 写回 store，watch 会自动触发 useWeather 重新请求
const cityId = computed({
  get: () => cityStore.currentId,
  set: (value) => cityStore.setCurrent(value),
})

const { data, loading, error, reload } = useWeather(() => cityStore.currentId)

const air = computed(() => data.value?.air || null)
const airLevel = computed(() => levelOf(air.value?.aqi))
const today = computed(() => {
  const daily = data.value?.daily
  if (!daily) return null
  return { tmax: daily.tmax[0], tmin: daily.tmin[0], pop: daily.pop?.[0] }
})

const tempWindow = computed(() =>
  buildWindow({
    times: data.value?.hourly?.time,
    values: data.value?.hourly?.temperature,
    currentIndex: data.value?.currentIndex,
    range: '24h',
  }),
)

const aqiWindow = computed(() =>
  buildWindow({
    times: data.value?.airHourly?.time,
    values: data.value?.airHourly?.aqi,
    currentIndex: data.value?.currentIndex,
    range: '24h',
  }),
)

const aqiSeries = computed(() => [
  { name: 'AQI', color: airLevel.value.color, values: aqiWindow.value.values },
])

// AQI 分档区间文字
const bands = computed(() => {
  let start = 0
  return AQI_LEVELS.map((level) => {
    const range = level.max === Infinity ? `${start}+` : `${start}–${level.max}`
    start = level.max + 1
    return { ...level, range }
  })
})

function refresh() {
  reload()
  toast.push('正在刷新数据…', { type: 'info' })
}
</script>

<template>
  <div>
    <!-- ============ 首屏 ============ -->
    <section class="hero container">
      <div class="hero-copy">
        <p class="eyebrow">Web 全栈开发实验 · Vue 3 单页应用</p>
        <h1>看见一座城市的<br /><em>呼吸与温度</em></h1>
        <p class="hero-desc">
          温度、湿度、风力与空气质量，全部来自开放气象接口。切换城市、悬停曲线、翻动 7 天预报——
          你看到的每个数字，都能在源码里找到它走过的路。
        </p>

        <div class="hero-actions">
          <RouterLink to="/trend" class="btn btn--primary">查看趋势分析 →</RouterLink>
          <RouterLink to="/compare" class="btn btn--ghost">对比 8 座城市</RouterLink>
        </div>

        <ul class="hero-meta">
          <li><strong>5</strong><span>页面路由</span></li>
          <li><strong>28</strong><span>组件</span></li>
          <li><strong>6</strong><span>可切换指标</span></li>
        </ul>
      </div>

      <div class="hero-panel">
        <div class="panel-bar">
          <CityPicker
            v-model="cityId"
            :cities="cityStore.cities"
            :recent="cityStore.recentCities"
            @change="(city) => toast.push(`已切换到 ${city.name}`)"
          />
          <div class="panel-tools">
            <button type="button" class="icon-btn" :class="{ spinning: loading }" aria-label="刷新数据" @click="refresh">
              <svg viewBox="0 0 16 16" width="14" height="14">
                <path
                  d="M13 8a5 5 0 1 1-1.6-3.7M13 2.5V5h-2.5"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.6"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </button>
            <FavoriteButton :city-id="cityId" show-label />
          </div>
        </div>

        <CurrentWeather :city="cityStore.currentCity" :data="data" :loading="loading" />

        <Transition name="page">
          <p v-if="error" class="notice">
            <span class="notice-dot" />
            {{ error }}
          </p>
        </Transition>
      </div>
    </section>

    <!-- ============ 关键指标 ============ -->
    <section class="container section--tight">
      <div class="grid grid--4">
        <StatCard
          v-reveal="0"
          label="空气质量指数"
          :value="air?.aqi"
          :hint="`${airLevel.label} · 数值越低越好`"
          :accent-color="airLevel.color"
        />
        <StatCard
          v-reveal="60"
          label="PM2.5"
          :value="air?.pm25"
          unit="μg/m³"
          :decimals="1"
          :hint="air?.pm25 > 75 ? '高于日均标准' : '处于可接受范围'"
          tone="rose"
        />
        <StatCard
          v-reveal="120"
          label="今日最高温"
          :value="today?.tmax"
          :decimals="0"
          unit="°C"
          :hint="`最低 ${today?.tmin?.toFixed(0) ?? '—'}°C`"
          tone="amber"
        />
        <StatCard
          v-reveal="180"
          label="降水概率"
          :value="today?.pop"
          unit="%"
          :hint="(today?.pop ?? 0) > 60 ? '出门记得带伞' : '今天大概率不下雨'"
          tone="accent"
        />
      </div>
    </section>

    <!-- ============ 24 小时 + 空气质量 ============ -->
    <section class="container section--tight">
      <div class="grid grid--sidebar">
        <BaseCard title="24 小时气温" subtitle="把鼠标放到曲线上，可以查看每个整点的读数">
          <template #actions>
            <span class="tag">逐小时</span>
          </template>

          <BaseSkeleton v-if="loading && !data" width="100%" height="260px" radius="14px" />
          <TrendChart
            v-else
            :labels="tempWindow.labels"
            :series="[{ name: '气温', color: '#2F6FED', values: tempWindow.values }]"
            unit="°C"
            :height="276"
            :decimals="0"
          />

          <template #footer>
            <p class="footnote">
              观测点：{{ cityStore.currentCity.name }}（{{ cityStore.currentCity.lat }},
              {{ cityStore.currentCity.lon }}）
              <span v-if="data"> · 更新于 {{ formatClock(data.current?.time) }}</span>
            </p>
          </template>
        </BaseCard>

        <div class="stack">
          <BaseCard title="空气质量" subtitle="US AQI · 数值越低越好">
            <AqiGauge :value="air?.aqi" />
            <div class="pollutant-row">
              <span>PM2.5 <strong>{{ air?.pm25?.toFixed(1) ?? '—' }}</strong></span>
              <span>PM10 <strong>{{ air?.pm10?.toFixed(1) ?? '—' }}</strong></span>
            </div>
          </BaseCard>

          <BaseCard title="AQI 分档" subtitle="点击了解各档位的健康建议">
            <ul class="band-list">
              <li v-for="band in bands" :key="band.label">
                <span class="band-dot" :style="{ background: band.color }" />
                <span class="band-range">{{ band.range }}</span>
                <span class="band-label">{{ band.label }}</span>
              </li>
            </ul>
          </BaseCard>
        </div>
      </div>
    </section>

    <!-- ============ 7 天预报 ============ -->
    <section class="container section--tight">
      <BaseCard title="未来 7 天" subtitle="柱子表示当天的最低 ~ 最高温度区间">
        <template #actions>
          <RouterLink :to="`/city/${cityStore.currentId}`" class="link-more">城市详情 →</RouterLink>
        </template>

        <ForecastStrip v-if="data?.daily" :days="data.daily" />
        <EmptyState v-else title="正在获取预报" description="数据加载完成后这里会自动出现 7 天温度区间。" />
      </BaseCard>
    </section>

    <!-- ============ 收藏城市 ============ -->
    <section class="container section--tight">
      <div class="section-head">
        <div>
          <p class="eyebrow">收藏夹</p>
          <h2>常看的城市</h2>
        </div>
        <RouterLink to="/compare" class="link-more">全部城市 →</RouterLink>
      </div>

      <div v-if="cityStore.favoriteCities.length" class="grid grid--3">
        <TransitionGroup name="list">
          <RouterLink
            v-for="city in cityStore.favoriteCities"
            :key="city.id"
            :to="`/city/${city.id}`"
            class="city-tile card card--hover"
          >
            <div class="city-tile-top">
              <span class="city-avatar">{{ city.name.slice(0, 1) }}</span>
              <span class="tag tag--accent">{{ city.tag }}</span>
            </div>
            <h3>{{ city.name }}</h3>
            <p class="muted text-sm">{{ city.province }} · 查看 24 小时曲线与空气质量</p>
            <span class="tile-arrow">→</span>
          </RouterLink>
        </TransitionGroup>
      </div>

      <EmptyState
        v-else
        title="还没有收藏城市"
        description="在城市选择器或对比页点击星标，就能把常看的城市固定在这里。"
      />
    </section>

    <!-- ============ 底部引导 ============ -->
    <section class="container section--tight">
      <div class="cta">
        <div>
          <h2>这个网站是怎么搭起来的？</h2>
          <p class="text-2 sm muted">
            路由懒加载、Pinia 状态管理、组合式函数、自定义指令、纯 SVG 图表——关于页里有一张完整的代码地图。
          </p>
        </div>
        <RouterLink to="/about" class="btn btn--accent">查看代码地图 →</RouterLink>
      </div>
    </section>
  </div>
</template>

<style scoped>
.hero {
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr);
  gap: 48px;
  align-items: center;
  padding: 56px 0 34px;
}

h1 em {
  font-style: normal;
  background: linear-gradient(100deg, #2f6fed, #0f9f92 70%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.hero-desc {
  margin-top: 18px;
  max-width: 460px;
  color: var(--text-2);
  font-size: 0.97rem;
  line-height: 1.75;
}

.hero-actions {
  display: flex;
  gap: 10px;
  margin-top: 26px;
  flex-wrap: wrap;
}

.hero-meta {
  display: flex;
  gap: 34px;
  margin-top: 34px;
  padding-top: 20px;
  border-top: 1px solid var(--border);
}

.hero-meta li {
  display: flex;
  flex-direction: column;
}

.hero-meta strong {
  font-size: 1.35rem;
  font-weight: 640;
  letter-spacing: -0.02em;
}

.hero-meta span {
  font-size: 0.76rem;
  color: var(--muted);
}

.hero-panel {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.panel-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.panel-tools {
  display: flex;
  align-items: center;
  gap: 6px;
}

.icon-btn {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border: 1px solid var(--border);
  border-radius: 50%;
  background: var(--surface);
  color: var(--text-2);
  cursor: pointer;
  transition: color 0.2s ease, border-color 0.2s ease;
}

.icon-btn:hover {
  color: var(--accent);
  border-color: rgba(47, 111, 237, 0.45);
}

.icon-btn.spinning svg {
  animation: spin 0.9s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.notice {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 9px 12px;
  border-radius: 10px;
  background: #fdf6e7;
  color: #8a6412;
  font-size: 0.76rem;
  line-height: 1.5;
}

.notice-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #d99a25;
  margin-top: 6px;
  flex-shrink: 0;
}

.footnote {
  font-size: 0.73rem;
  color: var(--muted);
}

.pollutant-row {
  display: flex;
  justify-content: center;
  gap: 22px;
  margin-top: 2px;
  font-size: 0.76rem;
  color: var(--muted);
}

.pollutant-row strong {
  color: var(--text);
  font-weight: 560;
  margin-left: 2px;
  font-variant-numeric: tabular-nums;
}

.band-list {
  display: flex;
  flex-direction: column;
  gap: 9px;
}

.band-list li {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.79rem;
  color: var(--text-2);
}

.band-dot {
  width: 8px;
  height: 8px;
  border-radius: 3px;
}

.band-range {
  font-variant-numeric: tabular-nums;
  color: var(--muted);
  min-width: 48px;
}

.band-label {
  margin-left: auto;
}

.section-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
}

.section-head h2 {
  margin-top: 6px;
}

.link-more {
  font-size: 0.82rem;
  color: var(--accent);
  white-space: nowrap;
}

.link-more:hover {
  text-decoration: underline;
}

.city-tile {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 20px;
}

.city-tile-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}

.city-avatar {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border-radius: 11px;
  background: var(--accent-soft);
  color: var(--accent-strong);
  font-weight: 620;
}

.city-tile h3 {
  font-size: 1.12rem;
}

.tile-arrow {
  position: absolute;
  right: 20px;
  bottom: 18px;
  color: var(--border-strong);
  transition: color 0.2s ease, transform 0.2s ease;
}

.city-tile:hover .tile-arrow {
  color: var(--accent);
  transform: translateX(3px);
}

.cta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 30px 32px;
  border-radius: var(--radius-lg);
  border: 1px solid var(--border);
  background:
    radial-gradient(500px 200px at 88% 0%, rgba(47, 111, 237, 0.14), transparent 70%),
    linear-gradient(120deg, #ffffff, #f6faff);
  box-shadow: var(--shadow-sm);
}

.cta h2 {
  font-size: 1.35rem;
}

.cta p {
  margin-top: 6px;
  max-width: 560px;
}

.list-enter-active,
.list-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

@media (max-width: 980px) {
  .hero {
    grid-template-columns: minmax(0, 1fr);
    gap: 30px;
    padding-top: 34px;
  }
  .hero-meta {
    gap: 26px;
  }
}

@media (max-width: 720px) {
  .cta {
    flex-direction: column;
    align-items: flex-start;
    padding: 24px;
  }
}
</style>
