<script setup>
/**
 * 标签切换：组件 v-model（defineModel）示例
 * 用法：<BaseTabs v-model="metric" :tabs="[...]" />
 */
const model = defineModel({ type: String, default: '' })

defineProps({
  tabs: { type: Array, required: true }, // [{ value, label, hint? }]
  size: { type: String, default: 'md' },
})
</script>

<template>
  <div class="tabs-wrap">
    <div class="tabs" :class="`tabs--${size}`" role="tablist">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        type="button"
        class="tab"
        role="tab"
        :aria-selected="model === tab.value"
        :class="{ 'is-active': model === tab.value }"
        @click="model = tab.value"
      >
        {{ tab.label }}
      </button>
    </div>
    <slot name="extra" />
  </div>
</template>

<style scoped>
.tabs-wrap {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.tabs {
  display: inline-flex;
  gap: 3px;
  padding: 3px;
  border-radius: 999px;
  background: var(--surface-3);
}

.tab {
  border: 0;
  background: transparent;
  padding: 6px 14px;
  border-radius: 999px;
  font-size: 0.82rem;
  color: var(--text-2);
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease, box-shadow 0.2s ease;
}

.tab:hover {
  color: var(--text);
}

.tab.is-active {
  background: var(--surface);
  color: var(--text);
  font-weight: 560;
  box-shadow: var(--shadow-xs);
}

.tabs--sm .tab {
  padding: 4px 11px;
  font-size: 0.76rem;
}
</style>
