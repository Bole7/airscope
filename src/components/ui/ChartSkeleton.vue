<script setup>
import BaseSkeleton from './BaseSkeleton.vue'
</script>

<template>
  <div class="chart-skeleton">
    <BaseSkeleton width="120px" height="12px" />
    <BaseSkeleton width="100%" height="220px" radius="14px" />
    <div class="axis-row">
      <BaseSkeleton v-for="i in 6" :key="i" width="34px" height="10px" />
    </div>
  </div>
</template>

<style scoped>
.chart-skeleton {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 6px 0;
}

.axis-row {
  display: flex;
  justify-content: space-between;
}
</style>
