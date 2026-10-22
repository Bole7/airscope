<script setup>
/**
 * 搜索框：defineModel() 双向绑定 + 清空按钮
 */
const model = defineModel({ type: String, default: '' })

defineProps({
  placeholder: { type: String, default: '搜索…' },
})
</script>

<template>
  <label class="field search-field">
    <svg viewBox="0 0 16 16" width="14" height="14" class="search-icon" aria-hidden="true">
      <circle cx="7" cy="7" r="4.6" fill="none" stroke="currentColor" stroke-width="1.6" />
      <path d="M10.6 10.6L14 14" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
    </svg>
    <input v-model="model" type="search" :placeholder="placeholder" />
    <button v-if="model" type="button" class="clear" aria-label="清空搜索" @click="model = ''">×</button>
  </label>
</template>

<style scoped>
.search-field {
  min-width: 220px;
  height: 38px;
}

.search-icon {
  color: var(--muted);
  flex-shrink: 0;
}

.clear {
  border: 0;
  background: var(--surface-3);
  color: var(--text-2);
  width: 18px;
  height: 18px;
  border-radius: 50%;
  line-height: 1;
  cursor: pointer;
  font-size: 0.85rem;
  display: grid;
  place-items: center;
}

.clear:hover {
  background: var(--border-strong);
}

input::-webkit-search-cancel-button {
  display: none;
}
</style>
