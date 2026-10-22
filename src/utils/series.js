// 把 bundle 里的逐小时数组切成图表需要的 { labels, values }
export function buildWindow({ times, values, currentIndex = 0, range = '24h' }) {
  if (!Array.isArray(times) || !Array.isArray(values) || !times.length) {
    return { labels: [], values: [], times: [] }
  }

  if (range === '7d') {
    const length = Math.min(times.length, values.length)
    return {
      labels: times.slice(0, length).map((time) => `${Number(time.slice(5, 7))}/${Number(time.slice(8, 10))}`),
      values: values.slice(0, length),
      times: times.slice(0, length),
    }
  }

  const end = Math.min(times.length, values.length, currentIndex + 1)
  const start = Math.max(0, end - 24)
  return {
    labels: times.slice(start, end).map((time) => time.slice(11, 16)),
    values: values.slice(start, end),
    times: times.slice(start, end),
  }
}

/** 计算一组数据的最高 / 最低 / 平均 */
export function summarize(values) {
  const valid = values.filter((value) => Number.isFinite(value))
  if (!valid.length) return { max: null, min: null, avg: null }
  const max = Math.max(...valid)
  const min = Math.min(...valid)
  const avg = valid.reduce((sum, value) => sum + value, 0) / valid.length
  return { max, min, avg }
}
