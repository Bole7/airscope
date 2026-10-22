# AirScope · 城市空气与气象数据可视化平台

Web 全栈开发课程实验项目。纯前端实现，使用 Vue 3 + Vite + Vue Router + Pinia，
数据来自 Open-Meteo 公开接口（免密钥），图表全部用 SVG 手写，不依赖任何图表库。

**线上地址**：https://airscope-weather.app.workbuddy.host/?sharecode=3GDMTATPWR

---

## 功能

| 页面 | 路由 | 内容 |
| --- | --- | --- |
| 概览 | `/` | 当前城市实况、4 个关键指标、24 小时气温曲线、空气质量仪表盘、7 天预报、收藏城市 |
| 城市对比 | `/compare` | 8 座城市可排序表格、指标排行条形图、一眼洞察、收藏管理 |
| 趋势分析 | `/trend` | 6 个指标 × 2 个时间范围、悬浮查看每个采样点、区间统计、导出 CSV |
| 城市详情 | `/city/:id` | 实况、24 小时曲线（气温/AQI 切换）、6 项污染物、日出日落 |
| 关于项目 | `/about` | 技术栈、知识点 → 代码位置映射表、组件清单、目录结构、运行与部署说明 |

## 快速开始

```bash
npm install      # 安装依赖
npm run dev      # 开发服务器 http://localhost:5173
npm run build    # 生产构建到 dist/
npm run preview  # 本地预览构建产物
```

Node.js 18 以上即可，推荐 20/22。

## 技术要点

- **组合式 API**：`ref` / `computed` / `watch` / 生命周期钩子组织逻辑，页面不写请求细节。
- **数据请求封装**：`useWeather` 统一处理 loading / error / 竞态 / 缓存 / 降级。
- **组件通信**：props、emit、`defineModel`、具名插槽、`provide/inject`、Pinia。
- **路由**：5 条规则、动态参数 `props: true`、路由级懒加载、`afterEach` 改标题、`scrollBehavior`。
- **手写图表**：线性坐标映射 + Catmull-Rom 转贝塞尔 + 鼠标反查索引；仪表盘用 `pathLength` 归一化。
- **健壮性**：请求超时、响应序号防竞态、接口失败自动切换离线示例数据。
- **部署**：`netlify.toml` + `public/_redirects` 已内置，`dist` 可直接拖到 Netlify Drop。

## 目录结构

```
src/
├── api/openMeteo.js          # 接口封装：缓存、超时、降级、字段归一化
├── assets/styles/main.css    # 设计系统：CSS 变量、布局、动效
├── components/
│   ├── charts/               # TrendChart（折线图）、CompareBars（条形排行）
│   ├── layout/               # AppHeader、AppFooter、PageHeader
│   ├── ui/                   # 10 个基础组件（卡片、标签页、弹窗、骨架屏…）
│   └── weather/              # 7 个业务组件（实况卡、仪表盘、城市选择器…）
├── composables/              # useWeather / useLocalStorage / useCountUp / useMediaQuery / useToast
├── data/                     # cities / metrics / mock
├── directives/index.js       # v-reveal、v-click-outside
├── router/index.js           # 路由表与全局守卫
├── stores/                   # Pinia：city、trend
├── utils/                    # aqi / format / series / weather
├── views/                    # 5 个页面组件
├── App.vue                   # 布局、Transition、KeepAlive、全局 Toast
└── main.js                   # 应用入口
```

## 数据来源

- 气象：`https://api.open-meteo.com/v1/forecast`
- 空气质量：`https://air-quality-api.open-meteo.com/v1/air-quality`
- AQI 采用 US AQI 标准；PM2.5 / PM10 单位为 μg/m³。

接口不可用时会自动使用 `src/data/mock.js` 生成的确定性示例数据，页面右上角会标注「示例数据」。

## 部署

### Netlify Drop（推荐，最快）

1. `npm run build`
2. 打开 https://app.netlify.com/drop
3. 把 `dist` 文件夹整体拖入页面
4. 得到 `https://xxx.netlify.app` 公网地址

`netlify.toml` 与 `public/_redirects` 已配置 history fallback，刷新 `/compare` 不会 404。

### GitHub Pages

把 `vite.config.js` 的 `base` 改成 `'/仓库名/'`，构建后把 `dist` 推到 `gh-pages` 分支即可。

## 说明

- 项目只有前端，收藏与偏好保存在浏览器 localStorage。
- 数据仅供学习演示，不作为健康或出行决策依据。
