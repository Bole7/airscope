<script setup>
defineProps({
  eyebrow: { type: String, default: '' },
  title: { type: String, required: true },
  description: { type: String, default: '' },
})
</script>

<template>
  <div class="page-header">
    <div class="page-header-text">
      <p v-if="eyebrow" class="eyebrow">{{ eyebrow }}</p>
      <h1>{{ title }}</h1>
      <p v-if="description" class="description">{{ description }}</p>
    </div>
    <div v-if="$slots.actions" class="page-header-actions">
      <slot name="actions" />
    </div>
  </div>
</template>

<style scoped>
.page-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  padding: 46px 0 26px;
  flex-wrap: wrap;
}

.page-header h1 {
  font-size: clamp(1.8rem, 3.4vw, 2.6rem);
  margin-top: 8px;
}

.description {
  margin-top: 12px;
  max-width: 620px;
  color: var(--text-2);
  font-size: 0.95rem;
}

.page-header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
</style>
