// 平台支持观测的城市列表（后续所有页面都从这里取数据）
export const CITIES = [
  { id: 'hengyang', name: '衡阳', province: '湖南', lat: 26.8938, lon: 112.5719, tag: '校园所在地' },
  { id: 'changsha', name: '长沙', province: '湖南', lat: 28.2282, lon: 112.9388, tag: '省会' },
  { id: 'guangzhou', name: '广州', province: '广东', lat: 23.1291, lon: 113.2644, tag: '珠三角' },
  { id: 'shenzhen', name: '深圳', province: '广东', lat: 22.5431, lon: 114.0579, tag: '沿海' },
  { id: 'zhuhai', name: '珠海', province: '广东', lat: 22.2707, lon: 113.5767, tag: '家乡' },
  { id: 'beijing', name: '北京', province: '北京', lat: 39.9042, lon: 116.4074, tag: '华北' },
  { id: 'shanghai', name: '上海', province: '上海', lat: 31.2304, lon: 121.4737, tag: '长三角' },
  { id: 'chengdu', name: '成都', province: '四川', lat: 30.5728, lon: 104.0668, tag: '西南' },
]

export const DEFAULT_CITY_ID = 'hengyang'

export function findCity(id) {
  return CITIES.find((city) => city.id === id) || null
}
