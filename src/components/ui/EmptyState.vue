<script setup>
defineProps({
  title: { type: String, default: '暂无数据' },
  description: { type: String, default: '' },
})
</script>

<template>
  <div class="empty">
    <div class="empty-icon">
      <svg viewBox="0 0 48 48" width="34" height="34" aria-hidden="true">
        <circle cx="24" cy="24" r="16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-dasharray="3 4" />
        <path d="M18 24h12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
      </svg>
    </div>
    <p class="empty-title">{{ title }}</p>
    <p v-if="description" class="empty-desc">{{ description }}</p>
    <slot name="action" />
  </div>
</template>

<style scoped>
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 40px 20px;
  text-align: center;
  color: var(--muted);
}

.empty-icon {
  color: var(--border-strong);
  margin-bottom: 4px;
}

.empty-title {
  font-size: 0.92rem;
  color: var(--text-2);
  font-weight: 560;
}

.empty-desc {
  font-size: 0.82rem;
  max-width: 320px;
}
</style>
