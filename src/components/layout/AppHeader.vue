<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const navItems = [
  { name: 'home', label: '概览', to: '/' },
  { name: 'compare', label: '城市对比', to: '/compare' },
  { name: 'trend', label: '趋势分析', to: '/trend' },
  { name: 'about', label: '关于项目', to: '/about' },
]

// 详情页也高亮"城市对比"，让导航有归属感
const activeName = computed(() => (route.name === 'city-detail' ? 'compare' : route.name))
</script>

<template>
  <header class="site-header">
    <div class="container header-inner">
      <RouterLink to="/" class="brand" aria-label="AirScope 首页">
        <span class="brand-mark">
          <svg viewBox="0 0 32 32" width="20" height="20" aria-hidden="true">
            <path
              d="M5 19a5.5 5.5 0 0 1 8.1-4.8A6.5 6.5 0 0 1 25.6 15"
              fill="none"
              stroke="currentColor"
              stroke-width="2.4"
              stroke-linecap="round"
            />
            <path d="M7 23h17" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" />
            <path d="M12 27h8" stroke="#9cc3ff" stroke-width="2.4" stroke-linecap="round" />
          </svg>
        </span>
        <span class="brand-text">
          <strong>AirScope</strong>
          <small>城市空气与气象</small>
        </span>
      </RouterLink>

      <nav class="nav" aria-label="主导航">
        <RouterLink
          v-for="item in navItems"
          :key="item.name"
          :to="item.to"
          class="nav-link"
          :class="{ 'is-active': activeName === item.name }"
        >
          {{ item.label }}
        </RouterLink>
      </nav>

      <div class="header-meta">
        <span class="live-chip">
          <span class="dot" />
          <span>Open-Meteo 实时数据</span>
        </span>
      </div>
    </div>
  </header>
</template>

<style scoped>
.site-header {
  position: sticky;
  top: 0;
  z-index: 50;
  border-bottom: 1px solid rgba(228, 234, 243, 0.9);
  background: rgba(255, 255, 255, 0.82);
  backdrop-filter: saturate(180%) blur(14px);
}

.header-inner {
  display: flex;
  align-items: center;
  gap: 28px;
  height: 64px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.brand-mark {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border-radius: 11px;
  background: linear-gradient(140deg, #2f6fed, #0f9f92);
  color: #fff;
  box-shadow: 0 8px 18px -10px rgba(47, 111, 237, 0.9);
}

.brand-text {
  display: flex;
  flex-direction: column;
  line-height: 1.15;
}

.brand-text strong {
  font-size: 0.98rem;
  letter-spacing: -0.01em;
}

.brand-text small {
  font-size: 0.66rem;
  color: var(--muted);
  letter-spacing: 0.04em;
}

.nav {
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 1;
  overflow-x: auto;
  scrollbar-width: none;
}

.nav::-webkit-scrollbar {
  display: none;
}

.nav-link {
  padding: 7px 14px;
  border-radius: 999px;
  font-size: 0.86rem;
  color: var(--text-2);
  transition: background 0.2s ease, color 0.2s ease;
  white-space: nowrap;
}

.nav-link:hover {
  background: var(--surface-3);
  color: var(--text);
}

.nav-link.is-active {
  background: var(--accent-soft);
  color: var(--accent-strong);
  font-weight: 560;
}

.header-meta {
  flex-shrink: 0;
}

.live-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 30px;
  padding: 0 12px;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: var(--surface);
  font-size: 0.73rem;
  color: var(--muted);
}

@media (max-width: 900px) {
  .header-inner {
    gap: 14px;
  }
  .brand-text small {
    display: none;
  }
  .header-meta {
    display: none;
  }
}

@media (max-width: 560px) {
  .brand-text {
    display: none;
  }
}
</style>
