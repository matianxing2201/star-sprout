<script setup lang="ts">
import { RouterView } from 'vue-router'

import { CHUNK_RELOAD_FLAG, chunkLoadFailed } from '@/app/router/chunk-reload'
import { KButton, KIcon } from '@/ui'

/**
 * 应用根组件
 * ==========
 *
 * 平时只做一件事：渲染当前路由。
 * 唯一的额外职责是「页面没取到」的兜底 —— 懒加载的页面 chunk 拉不下来时，
 * Vue Router 只会往控制台丢一个错误，界面会变成**点了没反应**。
 * 这里把它变成一句孩子看得懂的话 + 一个「重新加载」按钮。
 */
function reload(): void {
  try {
    // 清掉「本次会话已自动刷新过」的标记，让兜底逻辑重新available
    window.sessionStorage.removeItem(CHUNK_RELOAD_FLAG)
  }
  catch {
    // 隐私模式下拿不到 sessionStorage，直接刷新即可
  }
  window.location.reload()
}
</script>

<template>
  <RouterView />

  <Teleport to="body">
    <div
      v-if="chunkLoadFailed"
      class="fixed inset-0 z-[100] grid place-items-center bg-paper/95 px-6 backdrop-blur-sm"
      role="alert"
    >
      <div class="max-w-md rounded-blob border-2 border-line bg-surface p-8 text-center shadow-lift">
        <KIcon name="compass" size="2xl" weight="duotone" class="mx-auto text-ink-soft" />
        <h1 class="mt-4 font-display text-2xl text-ink">
          这一页没找到路
        </h1>
        <p class="mt-2 font-body text-sm leading-relaxed text-ink-soft">
          可能是网络走动了一下，或者我们刚好更新了内容。<br>
          点一下下面的按钮，我们重新出发。
        </p>
        <KButton class="mt-6" size="lg" tone="explore" @click="reload">
          重新加载
        </KButton>
      </div>
    </div>
  </Teleport>
</template>
