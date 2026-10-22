<script setup>
import { computed, ref } from 'vue'
import { clickOutside } from '@/directives/index.js'

/**
 * 城市选择器：下拉面板 + 搜索 + 最近浏览
 * 通过 v-model 与父组件通信（props / emits 的典型用法）
 */
const props = defineProps({
  modelValue: { type: String, default: '' },
  cities: { type: Array, required: true },
  recent: { type: Array, default: () => [] },
})

const emit = defineEmits(['update:modelValue', 'change'])

const open = ref(false)
const keyword = ref('')

const current = computed(() => props.cities.find((city) => city.id === props.modelValue) || props.cities[0])

const filtered = computed(() => {
  const key = keyword.value.trim()
  if (!key) return props.cities
  return props.cities.filter((city) => city.name.includes(key) || city.province.includes(key))
})

function pick(city) {
  emit('update:modelValue', city.id)
  emit('change', city)
  open.value = false
  keyword.value = ''
}
</script>

<template>
  <div v-click-outside="() => (open = false)" class="picker">
    <button type="button" class="picker-trigger" :aria-expanded="open" @click="open = !open">
      <svg viewBox="0 0 16 16" width="14" height="14" class="pin" aria-hidden="true">
        <path
          d="M8 14.2s5-4.3 5-8A5 5 0 0 0 3 6.2c0 3.7 5 8 5 8Z"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
        />
        <circle cx="8" cy="6.2" r="1.7" fill="currentColor" />
      </svg>
      <span class="picker-name">{{ current?.name }}</span>
      <span class="picker-province">{{ current?.province }}</span>
      <svg viewBox="0 0 12 8" width="10" height="7" class="chevron" :class="{ 'is-open': open }">
        <path d="M1 1l5 5 5-5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
      </svg>
    </button>

    <Transition name="pop">
      <div v-if="open" class="picker-panel">
        <input v-model="keyword" class="picker-search" type="search" placeholder="搜索城市或省份" />

        <div v-if="recent.length" class="picker-group">
          <p class="picker-label">最近浏览</p>
          <div class="chips">
            <button
              v-for="city in recent"
              :key="`recent-${city.id}`"
              type="button"
              class="chip"
              @click="pick(city)"
            >
              {{ city.name }}
            </button>
          </div>
        </div>

        <div class="picker-group">
          <p class="picker-label">全部城市</p>
          <ul class="city-list">
            <li v-for="city in filtered" :key="city.id">
              <button
                type="button"
                class="city-item"
                :class="{ 'is-current': city.id === modelValue }"
                @click="pick(city)"
              >
                <span>{{ city.name }}</span>
                <small>{{ city.province }}</small>
                <span v-if="city.id === modelValue" class="check">✓</span>
              </button>
            </li>
          </ul>
          <p v-if="!filtered.length" class="picker-empty">没有匹配的城市</p>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.picker {
  position: relative;
}

.picker-trigger {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  height: 40px;
  padding: 0 14px;
  border: 1px solid var(--border-strong);
  border-radius: 999px;
  background: var(--surface);
  color: var(--text);
  font-size: 0.88rem;
  cursor: pointer;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.picker-trigger:hover {
  border-color: var(--text-2);
}

.pin {
  color: var(--accent);
}

.picker-name {
  font-weight: 560;
}

.picker-province {
  font-size: 0.72rem;
  color: var(--muted);
}

.chevron {
  color: var(--muted);
  transition: transform 0.2s ease;
}

.chevron.is-open {
  transform: rotate(180deg);
}

.picker-panel {
  position: absolute;
  z-index: 60;
  top: calc(100% + 8px);
  left: 0;
  width: 268px;
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: 16px;
  background: var(--surface);
  box-shadow: var(--shadow-md);
}

.picker-search {
  width: 100%;
  height: 34px;
  padding: 0 12px;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: var(--surface-2);
  font-size: 0.82rem;
  outline: none;
}

.picker-search:focus {
  border-color: rgba(47, 111, 237, 0.5);
}

.picker-group {
  margin-top: 12px;
}

.picker-label {
  font-size: 0.68rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--muted);
  margin-bottom: 6px;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.chip {
  border: 1px solid var(--border);
  background: var(--surface-2);
  border-radius: 999px;
  padding: 3px 10px;
  font-size: 0.76rem;
  color: var(--text-2);
  cursor: pointer;
}

.chip:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.city-list {
  max-height: 220px;
  overflow-y: auto;
}

.city-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 6px 8px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  font-size: 0.84rem;
  color: var(--text-2);
  cursor: pointer;
  text-align: left;
}

.city-item small {
  color: var(--muted);
  font-size: 0.72rem;
}

.city-item:hover {
  background: var(--surface-2);
}

.city-item.is-current {
  background: var(--accent-soft);
  color: var(--accent-strong);
}

.check {
  margin-left: auto;
  font-size: 0.8rem;
}

.picker-empty {
  font-size: 0.8rem;
  color: var(--muted);
  padding: 8px;
}

.pop-enter-active,
.pop-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}

.pop-enter-from,
.pop-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
