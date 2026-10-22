import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { CITIES, DEFAULT_CITY_ID, findCity } from '@/data/cities'
import { useLocalStorage } from '@/composables/useLocalStorage'

/**
 * 全局城市状态（Pinia 组合式写法）
 * 当前城市、收藏城市、最近浏览都会自动持久化到 localStorage
 */
export const useCityStore = defineStore('city', () => {
  const cities = ref(CITIES)
  const currentId = useLocalStorage('airscope:current-city', DEFAULT_CITY_ID)
  const favoriteIds = useLocalStorage('airscope:favorite-cities', ['hengyang', 'guangzhou', 'beijing'])
  const recentIds = useLocalStorage('airscope:recent-cities', [])

  const currentCity = computed(() => findCity(currentId.value) || cities.value[0])
  const favoriteCities = computed(() => favoriteIds.value.map((id) => findCity(id)).filter(Boolean))
  const recentCities = computed(() => recentIds.value.map((id) => findCity(id)).filter(Boolean))

  function cityById(id) {
    return cities.value.find((city) => city.id === id) || null
  }

  function setCurrent(id) {
    if (!cityById(id)) return
    currentId.value = id
    recentIds.value = [id, ...recentIds.value.filter((item) => item !== id)].slice(0, 4)
  }

  function isFavorite(id) {
    return favoriteIds.value.includes(id)
  }

  function toggleFavorite(id) {
    if (!cityById(id)) return false
    if (isFavorite(id)) {
      favoriteIds.value = favoriteIds.value.filter((item) => item !== id)
      return false
    }
    favoriteIds.value = [id, ...favoriteIds.value]
    return true
  }

  return {
    cities,
    currentId,
    currentCity,
    favoriteCities,
    recentCities,
    cityById,
    setCurrent,
    isFavorite,
    toggleFavorite,
  }
})
