<script setup>
import { onUnmounted, watch } from 'vue'

/**
 * 弹窗组件：Teleport 传送门 + Transition 过渡 + watch 监听开关
 */
const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: '' },
  width: { type: String, default: '540px' },
})

const emit = defineEmits(['update:modelValue'])

function close() {
  emit('update:modelValue', false)
}

function handleKeydown(event) {
  if (event.key === 'Escape' && props.modelValue) close()
}

watch(
  () => props.modelValue,
  (open) => {
    document.body.style.overflow = open ? 'hidden' : ''
    if (open) window.addEventListener('keydown', handleKeydown)
    else window.removeEventListener('keydown', handleKeydown)
  },
  { immediate: true },
)

onUnmounted(() => {
  document.body.style.overflow = ''
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="modal-root">
        <div class="modal-overlay" @click="close" />
        <div class="modal-panel" :style="{ maxWidth: width }" role="dialog" aria-modal="true">
          <header class="modal-head">
            <h3>{{ title }}</h3>
            <button type="button" class="modal-close" aria-label="关闭" @click="close">
              <svg viewBox="0 0 16 16" width="14" height="14">
                <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
              </svg>
            </button>
          </header>

          <div class="modal-body">
            <slot />
          </div>

          <footer v-if="$slots.footer" class="modal-foot">
            <slot name="footer" />
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-root {
  position: fixed;
  inset: 0;
  z-index: 120;
  display: grid;
  place-items: center;
  padding: 20px;
}

.modal-overlay {
  position: absolute;
  inset: 0;
  background: rgba(18, 27, 42, 0.42);
  backdrop-filter: blur(3px);
}

.modal-panel {
  position: relative;
  width: 100%;
  max-height: calc(100vh - 48px);
  overflow: auto;
  background: var(--surface);
  border-radius: 20px;
  box-shadow: 0 40px 80px -40px rgba(18, 27, 42, 0.6);
  padding: 22px 24px;
}

.modal-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.modal-head h3 {
  font-size: 1.05rem;
}

.modal-close {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border: 1px solid var(--border);
  border-radius: 50%;
  background: var(--surface);
  color: var(--text-2);
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease;
}

.modal-close:hover {
  background: var(--surface-3);
  color: var(--text);
}

.modal-foot {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-active .modal-panel,
.modal-leave-active .modal-panel {
  transition: transform 0.28s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-panel,
.modal-leave-to .modal-panel {
  transform: translateY(16px) scale(0.98);
  opacity: 0;
}
</style>
