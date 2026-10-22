<script setup>
import { computed, defineAsyncComponent } from 'vue'
import { useCityStore } from '@/stores/city'
import { useTrendStore } from '@/stores/trend'
import { useWeather } from '@/composables/useWeather'
import { useToast } from '@/composables/useToast'
import { METRICS, RANGES, findMetric } from '@/data/metrics'
import { buildWindow, summarize } from '@/utils/series'
import { round } from '@/utils/format'

import PageHeader from '@/components/layout/PageHeader.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseTabs from '@/components/ui/BaseTabs.vue'
import StatCard from '@/components/ui/StatCard.vue'
import CityPicker from '@/components/weather/CityPicker.vue'
import ChartSkeleton from '@/components/ui/ChartSkeleton.vue'

// 异步组件：图表代码单独分包，加载时先显示骨架屏
const TrendChart = defineAsyncComponent({
  loader: () => import('@/components/charts/TrendChart.vue'),
  loadingComponent: ChartSkeleton,
  delay: 150,
  timeout: 10000,
})

const cityStore = useCityStore()
const trendStore = useTrendStore()
const toast = useToast()

const { data, loading, error, reload } = useWeather(() => cityStore.currentId)

const cityId = computed({
  get: () => cityStore.currentId,
  set: (value) => cityStore.setCurrent(value),
})

const metric = computed({
  get: () => trendStore.metric,
  set: (value) => trendStore.setMetric(value),
})

const range = computed({
  get: () => trendStore.range,
  set: (value) => trendStore.setRange(value),
})

const metricInfo = computed(() => findMetric(metric.value))

const windowData = computed(() => {
  const bundle = data.value
  if (!bundle) return { labels: [], values: [], times: [] }
  const source = metricInfo.value.source === 'air' ? bundle.airHourly : bundle.hourly
  return buildWindow({
    times: source?.time,
    values: source?.[metricInfo.value.field],
    currentIndex: bundle.currentIndex,
    range: range.value,
  })
})

const stats = computed(() => summarize(windowData.value.values))

const series = computed(() => [
  { name: metricInfo.value.label, color: metricInfo.value.color, values: windowData.value.values },
])

const rangeLabel = computed(() => (range.value === '7d' ? '未来 7 天' : '近 24 小时'))

function exportCsv() {
  const { times, values } = windowData.value
  if (!times.length) {
    toast.push('当前没有可导出的数据', { type: 'warning' })
    return
  }
  const header = ['time', `${metricInfo.value.value}(${metricInfo.value.unit})`]
  const lines = times.map((time, index) => [time, values[index] ?? ''])
  // \ufeff 让 Excel 正确识别 UTF-8
  const csv = `\ufeff${[header, ...lines].map((row) => row.join(',')).join('\n')}`
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `airscope-${cityStore.currentId}-${metricInfo.value.value}-${range.value}.csv`
  link.click()
  URL.revokeObjectURL(url)
  toast.push('已导出 CSV 文件', { type: 'success' })
}
</script>

<template>
  <div class="container">
    <PageHeader
      eyebrow="Trend"
      title="一条曲线，读出城市的节律"
      description="切换指标与时间范围，观察温度、湿度、风速和空气质量的起伏。图表是手写 SVG，不依赖任何图表库。"
    >
      <template #actions>
        <button type="button" class="btn btn--ghost btn--sm" @click="exportCsv">导出 CSV</button>
        <button type="button" class="btn btn--primary btn--sm" @click="reload">刷新数据</button>
      </template>
    </PageHeader>

    <BaseCard class="controls">
      <div class="control-row">
        <div class="control-group">
          <span class="control-label">城市</span>
          <CityPicker v-model="cityId" :cities="cityStore.cities" :recent="cityStore.recentCities" />
        </div>

        <div class="control-group">
          <span class="control-label">指标</span>
          <BaseTabs v-model="metric" :tabs="METRICS.map((item) => ({ value: item.value, label: item.label }))" />
        </div>

        <div class="control-group">
          <span class="control-label">范围</span>
          <BaseTabs v-model="range" :tabs="RANGES" />
        </div>
      </div>
    </BaseCard>

    <section class="section--tight">
      <BaseCard
        :title="`${cityStore.currentCity.name} · ${metricInfo.label}`"
        :subtitle="`${rangeLabel} · ${metricInfo.desc}`"
      >
        <template #actions>
          <span class="tag">{{ metricInfo.unit }}</span>
          <span class="tag" :class="data?.source === 'live' ? 'tag--teal' : 'tag--accent'">
            {{ data?.source === 'live' ? '实时' : '示例' }}
          </span>
        </template>

        <p v-if="error" class="inline-notice">{{ error }}</p>

        <div v-if="loading && !data" class="chart-placeholder">
          <ChartSkeleton />
        </div>
        <TrendChart
          v-else
          :labels="windowData.labels"
          :series="series"
          :unit="metricInfo.unit"
          :height="340"
          :decimals="metricInfo.decimals"
        />

        <template #footer>
          <p class="footnote">
            数据点 {{ windowData.values.length }} 个 · 坐标范围
            {{ stats.min !== null ? round(stats.min, metricInfo.decimals) : '—' }} ~
            {{ stats.max !== null ? round(stats.max, metricInfo.decimals) : '—' }}
            {{ metricInfo.unit }} · 采样间隔 1 小时
          </p>
        </template>
      </BaseCard>
    </section>

    <section class="grid grid--3 section--tight">
      <StatCard
        label="区间最高"
        :value="stats.max"
        :unit="metricInfo.unit"
        :decimals="metricInfo.decimals"
        :accent-color="metricInfo.color"
        hint="区间内的峰值"
      />
      <StatCard
        label="区间最低"
        :value="stats.min"
        :unit="metricInfo.unit"
        :decimals="metricInfo.decimals"
        tone="teal"
        hint="区间内的谷值"
      />
      <StatCard
        label="区间平均"
        :value="stats.avg"
        :unit="metricInfo.unit"
        :decimals="metricInfo.decimals"
        tone="amber"
        hint="按小时算术平均"
      />
    </section>

    <section class="grid grid--2 section--tight">
      <BaseCard title="这次统计怎么算的" subtitle="computed 缓存 + 纯函数">
        <ul class="note-list">
          <li>
            <span class="note-index">01</span>
            <p>根据指标配置选出数据源：气象字段来自 <code>hourly</code>，空气质量来自 <code>airHourly</code>。</p>
          </li>
          <li>
            <span class="note-index">02</span>
            <p><code>buildWindow()</code> 以当前小时为锚点，向前切出 24 个点，或直接返回 7 天共 168 个点。</p>
          </li>
          <li>
            <span class="note-index">03</span>
            <p><code>summarize()</code> 过滤空值后计算最高、最低与平均值，结果被 <code>computed</code> 缓存。</p>
          </li>
        </ul>
      </BaseCard>

      <BaseCard title="数据说明" subtitle="讲清楚数据从哪来、可信到什么程度">
        <ul class="note-list">
          <li>
            <span class="note-index">→</span>
            <p>数据来自 Open-Meteo 免费开放接口，无需 API Key，允许浏览器跨域直接请求。</p>
          </li>
          <li>
            <span class="note-index">→</span>
            <p>空气质量采用 US AQI 标准；PM2.5、PM10 单位为 μg/m³。</p>
          </li>
          <li>
            <span class="note-index">→</span>
            <p>接口不可用时会自动切换为本地示例数据，页面右上角会标注「示例」。</p>
          </li>
        </ul>
      </BaseCard>
    </section>
  </div>
</template>

<style scoped>
.controls {
  padding: 18px 20px;
}

.control-row {
  display: flex;
  align-items: center;
  gap: 26px;
  flex-wrap: wrap;
}

.control-group {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.control-label {
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--muted);
}

.chart-placeholder {
  padding: 8px 0;
}

.inline-notice {
  margin-bottom: 12px;
  padding: 8px 12px;
  border-radius: 10px;
  background: #fdf6e7;
  color: #8a6412;
  font-size: 0.76rem;
}

.footnote {
  font-size: 0.73rem;
  color: var(--muted);
}

.note-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.note-list li {
  display: flex;
  gap: 10px;
  align-items: flex-start;
}

.note-index {
  font-size: 0.68rem;
  color: var(--accent);
  background: var(--accent-soft);
  border-radius: 6px;
  padding: 2px 6px;
  flex-shrink: 0;
  font-variant-numeric: tabular-nums;
}

.note-list p {
  font-size: 0.84rem;
  color: var(--text-2);
  line-height: 1.65;
}

code {
  font-family: ui-monospace, "SFMono-Regular", Consolas, monospace;
  font-size: 0.8em;
  background: var(--surface-3);
  padding: 1px 5px;
  border-radius: 5px;
}
</style>
