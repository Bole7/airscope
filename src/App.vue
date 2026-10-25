<script setup>
import { provide } from 'vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import { TOAST_KEY, createToastService } from '@/composables/useToast'

// 根组件创建全局提示服务，通过 provide 让所有后代组件都能 inject 到
const toast = createToastService()
provide(TOAST_KEY, toast)

// 提示条的渲染也放在根组件：Teleport + TransitionGroup 各保留一处演示
const { items: toasts, remove: removeToast } = toast

const year = new Date().getFullYear()

const toastIcons = {
  success: 'M2.5 8.5l3.4 3.4L13.5 4.3',
  info: 'M8 7v5M8 4.6v.2',
  warning: 'M8 4.5v4.2M8 11.4v.2',
}
</script>

<template>
  <div class="app-shell">
    <AppHeader />

    <main class="app-main">
      <!-- RouterView 的插槽写法：可以拿到当前渲染的组件，配合 Transition / KeepAlive -->
      <RouterView v-slot="{ Component, route }">
        <Transition name="page" mode="out-in">
          <KeepAlive :include="['CompareView']">
            <component :is="Component" :key="route.path" />
          </KeepAlive>
        </Transition>
      </RouterView>
    </main>

    <footer class="site-footer">
      <div class="container footer-inner">
        <div class="footer-brand">
          <div class="row">
            <span class="brand-mark">
              <svg viewBox="0 0 32 32" width="18" height="18" aria-hidden="true">
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
            <strong>AirScope</strong>
          </div>
          <p class="text-sm muted">
            用一张看板读懂城市的呼吸。<br />
            Web 全栈开发课程实验 · Vue 3 前端项目。
          </p>
        </div>

        <div class="footer-col">
          <h4>页面</h4>
          <RouterLink to="/">数据概览</RouterLink>
          <RouterLink to="/compare">城市对比</RouterLink>
          <RouterLink to="/trend">趋势分析</RouterLink>
          <RouterLink to="/about">关于项目</RouterLink>
        </div>

        <div class="footer-col">
          <h4>数据与技术</h4>
          <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">Open-Meteo 开放气象接口</a>
          <a href="https://cn.vuejs.org/" target="_blank" rel="noreferrer">Vue 3 官方文档</a>
          <a href="https://cn.vitejs.dev/" target="_blank" rel="noreferrer">Vite 构建工具</a>
        </div>
      </div>

      <div class="container footer-bottom">
        <span>© {{ year }} AirScope · 南华大学计算机学院</span>
        <span class="muted">数据仅供参考，不作为健康诊断依据</span>
      </div>
    </footer>

    <Teleport to="body">
      <div class="toast-stack" aria-live="polite">
        <TransitionGroup name="toast">
          <div
            v-for="item in toasts"
            :key="item.id"
            class="toast"
            :class="`toast--${item.type}`"
            role="status"
          >
            <svg viewBox="0 0 16 16" width="14" height="14" class="toast-icon">
              <path
                :d="toastIcons[item.type] || toastIcons.info"
                fill="none"
                stroke="currentColor"
                stroke-width="1.9"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <span>{{ item.message }}</span>
            <button type="button" class="toast-close" aria-label="关闭提示" @click="removeToast(item.id)">×</button>
          </div>
        </TransitionGroup>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.app-shell {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.app-main {
  flex: 1;
}

/* ---------- 页脚 ---------- */
.site-footer {
  margin-top: 40px;
  border-top: 1px solid var(--border);
  background: rgba(255, 255, 255, 0.6);
  padding: 44px 0 26px;
}

.footer-inner {
  display: grid;
  grid-template-columns: 1.4fr 1fr 1.2fr;
  gap: 28px;
}

.brand-mark {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border-radius: 10px;
  background: linear-gradient(140deg, #2f6fed, #0f9f92);
  color: #fff;
}

.footer-brand strong {
  font-size: 0.95rem;
}

.footer-brand p {
  margin-top: 10px;
  max-width: 280px;
}

.footer-col {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.footer-col h4 {
  font-size: 0.74rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--muted);
  font-weight: 620;
  margin-bottom: 2px;
}

.footer-col a,
.footer-col span {
  font-size: 0.84rem;
  color: var(--text-2);
}

.footer-col a:hover {
  color: var(--accent);
}

.footer-bottom {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 34px;
  padding-top: 18px;
  border-top: 1px solid var(--border);
  font-size: 0.76rem;
  color: var(--muted);
}

/* ---------- 全局提示 ---------- */
.toast-stack {
  position: fixed;
  z-index: 200;
  left: 50%;
  bottom: 28px;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
  pointer-events: none;
}

.toast {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 9px 14px;
  border-radius: 999px;
  background: rgba(18, 27, 42, 0.92);
  color: #fff;
  font-size: 0.83rem;
  box-shadow: 0 18px 40px -18px rgba(18, 27, 42, 0.8);
  pointer-events: auto;
  backdrop-filter: blur(8px);
}

.toast--success .toast-icon {
  color: #6ee7b7;
}

.toast--warning .toast-icon {
  color: #fbbf24;
}

.toast--info .toast-icon {
  color: #93c5fd;
}

.toast-close {
  border: 0;
  background: transparent;
  color: rgba(255, 255, 255, 0.55);
  font-size: 1rem;
  line-height: 1;
  cursor: pointer;
  padding: 0 2px;
}

.toast-close:hover {
  color: #fff;
}

.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.24s ease, transform 0.24s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(12px) scale(0.96);
}

.toast-move {
  transition: transform 0.24s ease;
}

@media (max-width: 840px) {
  .footer-inner {
    grid-template-columns: 1fr 1fr;
  }
  .footer-brand {
    grid-column: 1 / -1;
  }
}
</style>
