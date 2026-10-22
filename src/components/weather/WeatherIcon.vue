<script setup>
import { computed } from 'vue'
import { weatherGroup } from '@/utils/weather'

/**
 * 用内联 SVG 手绘天气图标：不依赖图标库，且能按天气代码切换图形
 * v-if / v-else-if 条件渲染 + v-for 生成太阳光芒
 */
const props = defineProps({
  code: { type: [Number, String], default: 0 },
  size: { type: [Number, String], default: 64 },
  isDay: { type: Boolean, default: true },
})

const group = computed(() => weatherGroup(Number(props.code)))
const cloudColor = computed(() => (group.value === 'cloudy' ? '#7286A0' : '#8496AD'))
const showCloud = computed(() => group.value !== 'clear' && group.value !== 'fog')
const rays = [0, 45, 90, 135, 180, 225, 270, 315]
</script>

<template>
  <svg
    class="weather-icon"
    :width="size"
    :height="size"
    viewBox="0 0 64 64"
    fill="none"
    role="img"
    :aria-label="`天气图标 ${code}`"
  >
    <!-- 晴天 -->
    <g v-if="group === 'clear'">
      <template v-if="isDay">
        <circle cx="32" cy="32" r="11" fill="#E9A93A" />
        <line
          v-for="angle in rays"
          :key="angle"
          x1="32"
          y1="12"
          x2="32"
          y2="16.5"
          stroke="#E9A93A"
          stroke-width="3"
          stroke-linecap="round"
          :transform="`rotate(${angle} 32 32)`"
        />
      </template>
      <template v-else>
        <defs>
          <mask id="moon-cut">
            <rect width="64" height="64" fill="#000" />
            <circle cx="32" cy="33" r="13" fill="#fff" />
            <circle cx="40" cy="26" r="11" fill="#000" />
          </mask>
        </defs>
        <circle cx="32" cy="33" r="13" fill="#8FA3C9" mask="url(#moon-cut)" />
        <circle cx="47" cy="20" r="1.6" fill="#B9C7E0" />
        <circle cx="52" cy="30" r="1.1" fill="#B9C7E0" />
      </template>
    </g>

    <!-- 晴间多云：太阳 + 云 -->
    <g v-else-if="group === 'partly'">
      <circle cx="24" cy="24" r="9" fill="#E9A93A" />
      <line
        v-for="angle in rays"
        :key="angle"
        x1="24"
        y1="9"
        x2="24"
        y2="12"
        stroke="#E9A93A"
        stroke-width="2.4"
        stroke-linecap="round"
        :transform="`rotate(${angle} 24 24)`"
      />
      <g :fill="cloudColor">
        <circle cx="26" cy="38" r="8" />
        <circle cx="37" cy="34" r="11" />
        <circle cx="46" cy="40" r="7" />
        <rect x="18" y="38" width="35" height="10" rx="5" />
      </g>
    </g>

    <!-- 阴 / 雨 / 雪 / 雷 -->
    <g v-else>
      <g :fill="cloudColor">
        <circle cx="24" cy="30" r="9" />
        <circle cx="37" cy="26" r="12" />
        <circle cx="48" cy="32" r="8" />
        <rect x="15" y="30" width="40" height="11" rx="5.5" />
      </g>

      <!-- 毛毛雨 / 雨 -->
      <g v-if="group === 'drizzle' || group === 'rain'" stroke="#4C82C8" stroke-width="3" stroke-linecap="round">
        <line x1="24" y1="46" x2="22" y2="54" />
        <line x1="34" y1="46" x2="32" y2="54" />
        <line x1="44" y1="46" x2="42" y2="54" :stroke-width="group === 'rain' ? 3 : 2" />
      </g>

      <!-- 雪 -->
      <g v-else-if="group === 'snow'" fill="#8FB6DA">
        <circle cx="24" cy="50" r="2.4" />
        <circle cx="35" cy="54" r="2.4" />
        <circle cx="46" cy="50" r="2.4" />
      </g>

      <!-- 雷阵雨 -->
      <g v-else-if="group === 'thunder'">
        <path d="M34 42h7l-9 12 2-8h-6l7-10z" fill="#E0A02E" />
        <line x1="22" y1="47" x2="20" y2="54" stroke="#4C82C8" stroke-width="2.6" stroke-linecap="round" />
        <line x1="48" y1="47" x2="46" y2="54" stroke="#4C82C8" stroke-width="2.6" stroke-linecap="round" />
      </g>
    </g>

    <!-- 雾：三条横线 -->
    <g v-if="group === 'fog'" stroke="#9CAABD" stroke-width="3.2" stroke-linecap="round">
      <line x1="16" y1="27" x2="46" y2="27" />
      <line x1="22" y1="36" x2="52" y2="36" />
      <line x1="16" y1="45" x2="40" y2="45" />
    </g>

    <!-- 给纯云加一条高光，避免整块颜色太平 -->
    <path
      v-if="showCloud"
      d="M27 30a9 9 0 0 1 11-7"
      stroke="#ffffff"
      stroke-opacity="0.4"
      stroke-width="2"
      stroke-linecap="round"
    />
  </svg>
</template>

<style scoped>
.weather-icon {
  display: block;
  flex-shrink: 0;
}
</style>
