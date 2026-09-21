<script setup lang="ts">
import { ROUTE_NAMES } from '@/app/router/route-names'
import { MascotAvatar } from '@/features/mascot'
import { KButton } from '@/ui'

/**
 * 走丢了（404）
 * ========
 *
 * 这一个页面回答孩子一句话：“这里没有路，我该往哪儿走？”
 *
 * 它不在任何外壳里，所以要自己撑满一屏：一句温柔的话 + 一个认路的伙伴 + 两条回家的路。
 * 对孩子永远不说“你走错了”，只说“我们迷路啦，一起回去”。
 */
</script>

<template>
  <div class="grid min-h-dvh place-items-center bg-paper px-6 py-12">
    <div class="w-full max-w-xl rounded-blob border-2 border-line bg-surface p-8 text-center shadow-lift">
      <div class="flex justify-center">
        <MascotAvatar id="fox" size="xl" mood="curious" />
      </div>

      <h1 class="mt-6 font-display text-3xl text-ink sm:text-4xl">
        咦，我们走进树林深处啦
      </h1>
      <p class="mt-3 font-body text-base leading-relaxed text-ink-soft">
        这里没有小路，也没有路牌。不过没关系 —— 小狐狸认得回家的路，我们手拉手一起回去。
      </p>

      <div class="mt-8 flex flex-wrap justify-center gap-3">
        <KButton :to="{ name: ROUTE_NAMES.home }" tone="explore" size="lg">
          回到学习世界
        </KButton>
        <KButton variant="soft" :to="{ name: ROUTE_NAMES.parent }" size="lg">
          去找爸爸妈妈
        </KButton>
      </div>

      <p class="mt-6 font-body text-xs text-ink-faint">
        迷路也没关系，每次拐错弯都会认识一条新路。
      </p>
    </div>
  </div>
</template>
