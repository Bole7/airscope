<script setup>
import { inject, ref } from 'vue'
import { TOAST_KEY } from '@/composables/useToast'

// 直接注入根组件提供的服务
const service = inject(TOAST_KEY, null)
const items = service?.items ?? ref([])
const remove = service?.remove ?? (() => {})

const icons = {
  success: 'M2.5 8.5l3.4 3.4L13.5 4.3',
  info: 'M8 7v5M8 4.6v.2',
  warning: 'M8 4.5v4.2M8 11.4v.2',
}
</script>

<template>
  <Teleport to="body">
    <div class="toast-stack" aria-live="polite">
      <TransitionGroup name="toast">
        <div
          v-for="item in items"
          :key="item.id"
          class="toast"
          :class="`toast--${item.type}`"
          role="status"
        >
          <svg viewBox="0 0 16 16" width="14" height="14" class="toast-icon">
            <path
              :d="icons[item.type] || icons.info"
              fill="none"
              stroke="currentColor"
              stroke-width="1.9"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <span>{{ item.message }}</span>
          <button type="button" class="toast-close" aria-label="关闭提示" @click="remove(item.id)">×</button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-stack {
  position: fixed;
  z-index: 200;
  left: 50%;
  bottom: 28px;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
  pointer-events: none;
}

.toast {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 9px 14px;
  border-radius: 999px;
  background: rgba(18, 27, 42, 0.92);
  color: #fff;
  font-size: 0.83rem;
  box-shadow: 0 18px 40px -18px rgba(18, 27, 42, 0.8);
  pointer-events: auto;
  backdrop-filter: blur(8px);
}

.toast--success .toast-icon {
  color: #6ee7b7;
}

.toast--warning .toast-icon {
  color: #fbbf24;
}

.toast--info .toast-icon {
  color: #93c5fd;
}

.toast-close {
  border: 0;
  background: transparent;
  color: rgba(255, 255, 255, 0.55);
  font-size: 1rem;
  line-height: 1;
  cursor: pointer;
  padding: 0 2px;
}

.toast-close:hover {
  color: #fff;
}

.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.24s ease, transform 0.24s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(12px) scale(0.96);
}

.toast-move {
  transition: transform 0.24s ease;
}
</style>
