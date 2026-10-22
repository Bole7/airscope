import { createRouter, createWebHistory } from 'vue-router'

// 首页直接打包进主 chunk，其余页面按需加载（路由级代码分割）
import HomeView from '@/views/HomeView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: { title: '概览' },
  },
  {
    path: '/compare',
    name: 'compare',
    component: () => import('@/views/CompareView.vue'),
    meta: { title: '城市对比' },
  },
  {
    path: '/trend',
    name: 'trend',
    component: () => import('@/views/TrendView.vue'),
    meta: { title: '趋势分析' },
  },
  {
    // 动态路由 + props 传参：组件里直接声明 props 即可拿到城市 id
    path: '/city/:id',
    name: 'city-detail',
    component: () => import('@/views/CityDetailView.vue'),
    props: true,
    meta: { title: '城市详情' },
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('@/views/AboutView.vue'),
    meta: { title: '关于项目' },
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) return { el: to.hash, behavior: 'smooth' }
    return { top: 0, behavior: 'smooth' }
  },
})

// 全局后置守卫：同步浏览器标题
router.afterEach((to) => {
  const base = 'AirScope · 城市空气与气象'
  document.title = to.meta?.title ? `${to.meta.title} · AirScope` : base
})

export default router
