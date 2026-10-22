<script setup>
const year = new Date().getFullYear()
</script>

<template>
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
        <span class="muted">AQI 采用 US AQI 标准</span>
      </div>
    </div>

    <div class="container footer-bottom">
      <span>© {{ year }} AirScope · 南华大学计算机学院</span>
      <span class="muted">数据仅供参考，不作为健康诊断依据</span>
    </div>
  </footer>
</template>

<style scoped>
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

@media (max-width: 840px) {
  .footer-inner {
    grid-template-columns: 1fr 1fr;
  }
  .footer-brand {
    grid-column: 1 / -1;
  }
}
</style>
