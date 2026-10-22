<script setup>
import { provide } from 'vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import AppToast from '@/components/ui/AppToast.vue'
import { TOAST_KEY, createToastService } from '@/composables/useToast'

// 根组件创建全局提示服务，通过 provide 让所有后代组件都能 inject 到
const toast = createToastService()
provide(TOAST_KEY, toast)
</script>

<template>
  <div class="app-shell">
    <AppHeader />

    <main class="app-main">
      <!-- RouterView 的插槽写法：可以拿到当前渲染的组件，配合 Transition / KeepAlive -->
      <RouterView v-slot="{ Component, route }">
        <Transition name="page" mode="out-in">
          <KeepAlive :include="['CompareView']">
            <component :is="Component" :key="route.path" />
          </KeepAlive>
        </Transition>
      </RouterView>
    </main>

    <AppFooter />
    <AppToast />
  </div>
</template>

<style scoped>
.app-shell {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.app-main {
  flex: 1;
}
</style>
