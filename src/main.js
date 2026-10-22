import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { installDirectives } from './directives'
import './assets/styles/main.css'

const app = createApp(App)

app.use(createPinia()) // 全局状态管理
app.use(router) // 路由
installDirectives(app) // 自定义指令

app.mount('#app')
