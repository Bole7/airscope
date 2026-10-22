<script setup>
defineProps({
  width: { type: String, default: '100%' },
  height: { type: String, default: '16px' },
  radius: { type: String, default: '8px' },
})
</script>

<template>
  <div class="skeleton" :style="{ width, height, borderRadius: radius }" aria-hidden="true" />
</template>
