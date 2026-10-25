import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// 云托管会注入 PORT 环境变量，这里同步监听该端口，方便一键发布
const port = Number(process.env.PORT) || 5173

// Vite 配置：Vue 单文件组件插件 + @ 路径别名
// GitHub Pages 的 /airscope/ 子路径通过 `npm run build:pages` 传入，默认仍是 /
export default defineConfig({
  plugins: [vue()],
  base: '/',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    host: '0.0.0.0',
    port,
    open: false,
    // 允许反向代理域名访问（云托管预览必需）
    allowedHosts: true,
  },
  preview: {
    host: '0.0.0.0',
    port,
    allowedHosts: true,
  },
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 900,
  },
})
