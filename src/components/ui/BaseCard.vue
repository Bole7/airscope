<script setup>
/**
 * 通用卡片容器：命名插槽（actions / footer）+ 属性透传（class、style 会自动落到根元素）
 */
defineProps({
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  padded: { type: Boolean, default: true },
  interactive: { type: Boolean, default: false },
})
</script>

<template>
  <section class="card base-card" :class="{ 'card--pad': padded, 'card--hover': interactive }">
    <header v-if="title || $slots.actions" class="card-head">
      <div>
        <h3 class="card-title">{{ title }}</h3>
        <p v-if="subtitle" class="card-sub">{{ subtitle }}</p>
      </div>
      <div v-if="$slots.actions" class="base-card-actions">
        <slot name="actions" />
      </div>
    </header>

    <slot />

    <footer v-if="$slots.footer" class="base-card-footer">
      <slot name="footer" />
    </footer>
  </section>
</template>

<style scoped>
.base-card {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.base-card-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.base-card-footer {
  margin-top: auto;
  padding-top: 16px;
}
</style>
