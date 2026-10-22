<script setup>
import { computed, ref } from 'vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseTabs from '@/components/ui/BaseTabs.vue'

const showGuide = ref(false)
const tab = ref('knowledge')

const stack = [
  { name: 'Vue 3.5', desc: '组合式 API + 单文件组件', color: '#42b883' },
  { name: 'Vite', desc: '开发服务器与生产构建', color: '#7c5cff' },
  { name: 'Vue Router 5', desc: '路由、动态参数、懒加载', color: '#2f6fed' },
  { name: 'Pinia', desc: '跨页面共享状态', color: '#e0a02e' },
  { name: 'Open-Meteo', desc: '免密钥气象与空气质量接口', color: '#0f9f92' },
  { name: 'SVG', desc: '手写折线图 / 仪表盘 / 图标', color: '#d9534f' },
]

// 知识点 → 代码位置，答辩时按这张表讲最稳
const knowledge = [
  { group: '基础', point: '模板语法 / 文本插值', where: 'CurrentWeather.vue', note: '{{ }} 插值、v-bind 简写、属性绑定' },
  { group: '基础', point: '响应式基础 ref', where: 'composables/useWeather.js', note: 'data / loading / error 三个 ref 驱动三态 UI' },
  { group: '基础', point: '计算属性 computed', where: 'HomeView.vue · TrendView.vue', note: '窗口切片、统计值、筛选排序都靠它缓存' },
  { group: '基础', point: '侦听器 watch', where: 'composables/useWeather.js', note: '监听城市 id 变化自动重新请求' },
  { group: '基础', point: '类与样式绑定', where: 'StatCard.vue · AppHeader.vue', note: '动态 CSS 变量与导航激活态' },
  { group: '基础', point: '条件渲染 v-if / v-else', where: 'WeatherIcon.vue', note: '按天气代码切换不同图形' },
  { group: '基础', point: '列表渲染 v-for + key', where: 'ForecastStrip.vue · CityPicker.vue', note: '7 天预报、城市列表、表格行' },
  { group: '基础', point: '事件与修饰符', where: 'FavoriteButton.vue · TrendChart.vue', note: '.stop.prevent 阻止冒泡，.passive 优化滚动' },
  { group: '基础', point: '表单 v-model', where: 'CompareView.vue · TrendView.vue', note: '搜索框、下拉选择、范围切换' },
  { group: '组件', point: 'defineProps 校验', where: '全部业务组件', note: 'type / default / required 约束外部输入' },
  { group: '组件', point: '自定义事件 emit', where: 'CityPicker.vue', note: 'update:modelValue 与 change 两个事件' },
  { group: '组件', point: '组件 v-model', where: 'BaseTabs.vue', note: 'defineModel() 语法糖，读写一体' },
  { group: '组件', point: '插槽 slot', where: 'BaseCard.vue · StatCard.vue', note: '默认插槽 + 具名插槽 actions / footer' },
  { group: '组件', point: '属性透传', where: 'BaseCard.vue', note: 'class / style 自动落到根元素' },
  { group: '组件', point: '动态组件 component :is', where: 'App.vue', note: 'RouterView 插槽里渲染当前路由组件' },
  { group: '组件', point: '异步组件', where: 'TrendView.vue', note: 'defineAsyncComponent + 骨架屏 + 超时' },
  { group: '组件', point: '生命周期', where: 'CompareView.vue · useWeather.js', note: 'onMounted 首次加载、onActivated 缓存后刷新、onUnmounted 清理' },
  { group: '组件', point: '模板引用 ref', where: 'TrendChart.vue', note: 'chartRef 取 SVG 容器宽度换算鼠标位置' },
  { group: '逻辑复用', point: '组合式函数', where: 'composables/*.js', note: 'useWeather / useLocalStorage / useCountUp / useMediaQuery' },
  { group: '逻辑复用', point: '自定义指令', where: 'directives/index.js', note: 'v-reveal 滚动淡入、v-click-outside 点击外部' },
  { group: '进阶', point: '路由与动态参数', where: 'router/index.js · CityDetailView.vue', note: '/city/:id + props: true' },
  { group: '进阶', point: '路由懒加载与守卫', where: 'router/index.js', note: '() => import() 分包、afterEach 改标题、scrollBehavior' },
  { group: '进阶', point: 'Pinia 状态管理', where: 'stores/city.js · stores/trend.js', note: '收藏城市、最近浏览、趋势偏好' },
  { group: '进阶', point: 'provide / inject', where: 'App.vue → useToast.js', note: '根组件下发全局提示服务' },
  { group: '进阶', point: 'Teleport / Transition', where: 'App.vue', note: 'Toast 用 Teleport 传送到 body，配合 TransitionGroup' },
  { group: '进阶', point: 'KeepAlive 缓存', where: 'App.vue', note: 'include 精确缓存对比页，保留筛选状态' },
  { group: '进阶', point: '性能与健壮性', where: 'api/openMeteo.js', note: '5 分钟缓存、请求超时、竞态序号、离线降级' },
]

const componentGroups = [
  {
    name: '布局组件',
    items: [
      { file: 'App.vue', role: '根组件：页脚、全局提示、页面过渡' },
      { file: 'AppHeader.vue', role: '吸顶导航，路由高亮' },
    ],
  },
  {
    name: '基础组件',
    items: [
      { file: 'BaseCard.vue', role: '通用卡片容器，具名插槽' },
      { file: 'StatCard.vue', role: '指标卡 + 数字滚动' },
      { file: 'BaseTabs.vue', role: '标签切换，v-model' },
    ],
  },
  {
    name: '业务组件',
    items: [
      { file: 'WeatherIcon.vue', role: '手绘天气图标，按代码切换' },
      { file: 'CityPicker.vue', role: '城市下拉选择 + 搜索' },
      { file: 'FavoriteButton.vue', role: '收藏按钮，接 Pinia' },
      { file: 'CurrentWeather.vue', role: '实况主卡，三态渲染' },
      { file: 'AqiGauge.vue', role: '空气质量半圆仪表盘' },
      { file: 'ForecastStrip.vue', role: '7 天温度区间条' },
    ],
  },
  {
    name: '图表与页面',
    items: [
      { file: 'TrendChart.vue', role: '手写 SVG 折线图 + 悬浮提示' },
      { file: 'HomeView.vue', role: '概览页（含对比表格与排行条）' },
      { file: 'CompareView.vue', role: '城市对比页（KeepAlive 缓存）' },
      { file: 'TrendView.vue', role: '趋势分析页' },
      { file: 'CityDetailView.vue', role: '城市详情页（动态路由）' },
      { file: 'AboutView.vue', role: '关于页，即当前页面' },
    ],
  },
]

const totalComponents = computed(() =>
  componentGroups.reduce((sum, group) => sum + group.items.length, 0),
)

const groupedKnowledge = computed(() => {
  const map = new Map()
  knowledge.forEach((item) => {
    if (!map.has(item.group)) map.set(item.group, [])
    map.get(item.group).push(item)
  })
  return [...map.entries()].map(([group, rows]) => ({ group, rows }))
})

const runSteps = [
  { cmd: 'npm install', desc: '安装 Vue、Vue Router、Pinia、Vite 依赖' },
  { cmd: 'npm run dev', desc: '启动开发服务器，默认 http://localhost:5173' },
  { cmd: 'npm run build', desc: '生产构建，产物输出到 dist/' },
  { cmd: 'npm run preview', desc: '本地预览构建产物' },
]

const talkOutline = [
  { step: '01', title: '从入口讲起', desc: 'index.html → main.js：createApp、use(pinia)、use(router)、注册自定义指令，最后 mount。' },
  { step: '02', title: '路由怎么切页面', desc: 'router/index.js 用 createWebHistory，除首页外全部 () => import() 懒加载，afterEach 改标题。' },
  { step: '03', title: '数据怎么流动', desc: '页面调用 useWeather → 拿到 ref 三态 → 渲染；切换城市写回 Pinia → watch 触发重新请求。' },
  { step: '04', title: '组件怎么通信', desc: 'props 向下、emit 向上、v-model 双向、provide/inject 跨层、Pinia 跨页面。' },
  { step: '05', title: '图表怎么画', desc: '数值 → 坐标映射 → 贝塞尔路径 → 鼠标反查索引 → 悬浮提示，全过程手写。' },
]
</script>

<template>
  <div class="container">
    <header class="page-header">
      <div class="page-header-text">
        <p class="eyebrow">About</p>
        <h1>关于这个项目</h1>
        <p class="description">
          一个纯前端的城市空气与气象可视化平台。没有后端、没有数据库，所有数据来自开放接口，所有图形由代码画出来。
        </p>
      </div>
      <div class="page-header-actions">
        <button type="button" class="btn btn--primary btn--sm" @click="showGuide = !showGuide">
          {{ showGuide ? '收起说明' : '运行与部署' }}
        </button>
        <a href="https://cn.vuejs.org/tutorial/" target="_blank" rel="noreferrer" class="btn btn--ghost btn--sm">
          Vue 官方教程
        </a>
      </div>
    </header>

    <!-- 运行与部署：原弹窗改成页内展开面板，减少一个组件也能一眼看到 -->
    <Transition name="expand">
      <section v-if="showGuide" class="guide-panel card">
        <div class="guide-head">
          <h3>本地运行与公网部署</h3>
          <button type="button" class="guide-close" aria-label="收起说明" @click="showGuide = false">×</button>
        </div>
        <p class="modal-lead">项目是标准的 Vite 工程，Node.js 18+ 即可运行。</p>
        <ul class="run-list">
          <li v-for="step in runSteps" :key="step.cmd">
            <code>{{ step.cmd }}</code>
            <span>{{ step.desc }}</span>
          </li>
        </ul>

        <h4 class="modal-title">部署到 Netlify</h4>
        <ol class="deploy-list">
          <li>执行 <code>npm run build</code>，得到 <code>dist/</code> 目录。</li>
          <li>打开 <code>app.netlify.com/drop</code>，把整个 <code>dist</code> 文件夹拖进去。</li>
          <li>Netlify 会生成形如 <code>https://xxx.netlify.app</code> 的公网地址。</li>
          <li>
            项目已内置 <code>netlify.toml</code> 与 <code>public/_redirects</code>，
            <code>/compare</code> 等前端路由刷新不会 404。
          </li>
        </ol>
      </section>
    </Transition>

    <section class="grid grid--3 section--tight">
      <BaseCard title="项目定位" subtitle="课程实验 · 纯前端">
        <p class="body-text">
          AirScope 把「城市环境数据」作为题材：既有真实接口可以演示，又能自然承载列表、表格、图表、
          表单、路由等前端基本功。
        </p>
      </BaseCard>
      <BaseCard title="架构一句话" subtitle="单向数据流">
        <p class="body-text">
          页面组件只负责展示与交互，数据请求收敛在 <code>useWeather</code> 组合式函数里，
          偏好状态放进 Pinia，接口层负责缓存与降级。
        </p>
      </BaseCard>
      <BaseCard title="代码规模" subtitle="以组件为单位">
        <p class="big-number">{{ totalComponents }}<small> 个 SFC</small></p>
        <p class="body-text muted">5 个页面 + 11 个可复用组件 + 根组件</p>
      </BaseCard>
    </section>

    <section class="section--tight">
      <h2 class="block-title">技术栈</h2>
      <div class="stack-grid">
        <div v-for="item in stack" :key="item.name" class="stack-item card">
          <span class="stack-dot" :style="{ background: item.color }" />
          <div>
            <strong>{{ item.name }}</strong>
            <p class="muted text-sm">{{ item.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <section class="section--tight">
      <h2 class="block-title">数据怎么流动</h2>
      <div class="flow card">
        <div class="flow-node">
          <span class="flow-tag">User</span>
          <strong>切换城市 / 选择指标</strong>
        </div>
        <span class="flow-arrow">→</span>
        <div class="flow-node">
          <span class="flow-tag">Pinia</span>
          <strong>写入 currentId / metric</strong>
        </div>
        <span class="flow-arrow">→</span>
        <div class="flow-node">
          <span class="flow-tag">watch</span>
          <strong>useWeather 重新请求</strong>
        </div>
        <span class="flow-arrow">→</span>
        <div class="flow-node">
          <span class="flow-tag">API</span>
          <strong>Open-Meteo 返回数据</strong>
        </div>
        <span class="flow-arrow">→</span>
        <div class="flow-node flow-node--accent">
          <span class="flow-tag">computed</span>
          <strong>切片 / 统计 / 绘图</strong>
        </div>
      </div>
    </section>

    <section class="section--tight">
      <div class="tabs-head">
        <BaseTabs
          v-model="tab"
          :tabs="[
            { value: 'knowledge', label: `知识点覆盖 ${knowledge.length}` },
            { value: 'components', label: `组件清单 ${totalComponents}` },
            { value: 'structure', label: '目录结构' },
          ]"
        />
      </div>

      <BaseCard v-if="tab === 'knowledge'" title="知识点 → 代码位置" subtitle="答辩时按这张表逐条指认">
        <div class="table-scroll">
          <table class="kn-table">
            <thead>
              <tr>
                <th>分类</th>
                <th>知识点</th>
                <th>代码位置</th>
                <th>说明</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in knowledge" :key="row.point">
                <td><span class="kn-group">{{ row.group }}</span></td>
                <td class="kn-point">{{ row.point }}</td>
                <td><code>{{ row.where }}</code></td>
                <td class="kn-note">{{ row.note }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </BaseCard>

      <div v-else-if="tab === 'components'" class="component-grid">
        <BaseCard
          v-for="group in componentGroups"
          :key="group.name"
          :title="group.name"
          :subtitle="`${group.items.length} 个组件`"
        >
          <ul class="component-list">
            <li v-for="item in group.items" :key="item.file">
              <code>{{ item.file }}</code>
              <span>{{ item.role }}</span>
            </li>
          </ul>
        </BaseCard>
      </div>

      <BaseCard v-else title="目录结构" subtitle="按职责分层，页面与组件解耦">
        <pre class="tree">src/
├── api/openMeteo.js          # 接口封装：缓存、超时、降级
├── assets/styles/main.css    # 设计系统：变量、布局、动效
├── components/
│   ├── charts/               # TrendChart
│   ├── layout/               # AppHeader
│   ├── ui/                   # BaseCard、StatCard、BaseTabs
│   └── weather/              # 6 个业务组件
├── composables/              # useWeather / useLocalStorage / useCountUp / useMediaQuery / useToast
├── data/                     # cities / metrics / mock
├── directives/index.js       # v-reveal、v-click-outside
├── router/index.js           # 5 个路由 + 懒加载 + 守卫
├── stores/                   # Pinia：city、trend
├── utils/                    # aqi / format / series / weather
├── views/                    # 5 个页面组件
├── App.vue                   # 布局、KeepAlive、全局 Toast
└── main.js                   # 应用入口</pre>
      </BaseCard>
    </section>

    <section class="section--tight">
      <h2 class="block-title">5 分钟讲解路径</h2>
      <div class="talk-grid">
        <div v-for="item in talkOutline" :key="item.step" class="talk-item card">
          <span class="talk-step">{{ item.step }}</span>
          <div>
            <h3>{{ item.title }}</h3>
            <p class="muted text-sm">{{ item.desc }}</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.body-text {
  font-size: 0.88rem;
  color: var(--text-2);
  line-height: 1.7;
}

.big-number {
  font-size: 2.2rem;
  font-weight: 660;
  letter-spacing: -0.03em;
  line-height: 1.1;
}

.big-number small {
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--muted);
  letter-spacing: 0;
}

.block-title {
  font-size: 1.2rem;
  margin-bottom: 16px;
}

.stack-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.stack-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px 18px;
}

.stack-dot {
  width: 10px;
  height: 10px;
  border-radius: 4px;
  margin-top: 6px;
  flex-shrink: 0;
}

.stack-item strong {
  font-size: 0.92rem;
}

.flow {
  display: flex;
  align-items: stretch;
  gap: 10px;
  padding: 18px;
  overflow-x: auto;
}

.flow-node {
  flex: 1;
  min-width: 132px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px 14px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--surface-2);
}

.flow-node--accent {
  border-color: rgba(47, 111, 237, 0.35);
  background: var(--accent-soft);
}

.flow-tag {
  font-size: 0.64rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--muted);
}

.flow-node strong {
  font-size: 0.82rem;
  font-weight: 560;
  line-height: 1.4;
}

.flow-arrow {
  display: grid;
  place-items: center;
  color: var(--border-strong);
  font-size: 1rem;
}

.tabs-head {
  margin-bottom: 16px;
}

.table-scroll {
  overflow-x: auto;
}

.kn-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 720px;
  font-size: 0.82rem;
}

.kn-table th {
  text-align: left;
  font-weight: 520;
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
  padding: 8px 10px;
  border-bottom: 1px solid var(--border);
  white-space: nowrap;
}

.kn-table td {
  padding: 10px;
  border-bottom: 1px solid var(--border);
  color: var(--text-2);
  vertical-align: top;
}

.kn-table tr:last-child td {
  border-bottom: 0;
}

.kn-group {
  display: inline-block;
  padding: 1px 7px;
  border-radius: 6px;
  background: var(--surface-3);
  font-size: 0.68rem;
  color: var(--muted);
  white-space: nowrap;
}

.kn-point {
  color: var(--text);
  font-weight: 540;
  white-space: nowrap;
}

.kn-note {
  color: var(--muted);
  line-height: 1.5;
}

.component-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.component-list {
  display: flex;
  flex-direction: column;
  gap: 9px;
}

.component-list li {
  display: flex;
  align-items: baseline;
  gap: 10px;
  font-size: 0.8rem;
  color: var(--muted);
}

.tree {
  margin: 0;
  padding: 16px;
  border-radius: 12px;
  background: var(--surface-2);
  border: 1px solid var(--border);
  font-family: ui-monospace, "SFMono-Regular", Consolas, monospace;
  font-size: 0.76rem;
  line-height: 1.7;
  color: var(--text-2);
  overflow-x: auto;
}

.talk-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.talk-item {
  display: flex;
  gap: 14px;
  padding: 18px;
}

.talk-step {
  font-size: 0.72rem;
  font-weight: 620;
  color: var(--accent);
  background: var(--accent-soft);
  border-radius: 8px;
  padding: 3px 8px;
  height: fit-content;
}

.talk-item h3 {
  font-size: 0.94rem;
  margin-bottom: 4px;
}

.modal-lead {
  font-size: 0.86rem;
  color: var(--text-2);
  margin-bottom: 12px;
}

/* 部署说明面板（原 BaseModal 弹窗改成页内展开） */
.guide-panel {
  margin-bottom: 8px;
  padding: 20px 22px;
}

.guide-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
}

.guide-head h3 {
  font-size: 1rem;
}

.guide-close {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border: 1px solid var(--border);
  border-radius: 50%;
  background: var(--surface);
  color: var(--text-2);
  font-size: 1rem;
  line-height: 1;
  cursor: pointer;
}

.guide-close:hover {
  background: var(--surface-3);
}

.expand-enter-active,
.expand-leave-active {
  transition: opacity 0.22s ease, transform 0.22s ease;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.modal-title {
  margin: 20px 0 10px;
  font-size: 0.92rem;
}

.run-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.run-list li {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.8rem;
  color: var(--muted);
}

.deploy-list {
  margin: 0;
  padding-left: 18px;
  display: flex;
  flex-direction: column;
  gap: 7px;
  font-size: 0.82rem;
  color: var(--text-2);
  line-height: 1.6;
}

code {
  font-family: ui-monospace, "SFMono-Regular", Consolas, monospace;
  font-size: 0.78em;
  background: var(--surface-3);
  padding: 1px 5px;
  border-radius: 5px;
  color: var(--text);
  white-space: nowrap;
}

@media (max-width: 860px) {
  .stack-grid,
  .component-grid,
  .talk-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
