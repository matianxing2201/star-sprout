<script setup lang="ts">
import { computed } from 'vue'

import { KIcon } from '@/ui/icons'

/**
 * 星星飞入收藏栏。
 * 星星数量由奖励等级决定（1 / 3 / 6 / 12），因此“大奖励”在视觉上天然更热闹，
 * 不需要页面自己加码。
 *
 * 星星是**矢量图标**而不是 ⭐ emoji：它恰好是孩子看得最多的一个图形，
 * 而 emoji 的星在不同系统里字形差别很大 —— 奖励动画里出现一颗“不像我们自己家”的星，
 * 整个奖励体系就泄气了。
 */
const { count = 1, active = false, from = 'center' } = defineProps<{
  count?: number
  active?: boolean
  /** 出发点：任务区中央，或右上角（收藏栏方向） */
  from?: 'center' | 'corner'
}>()

/** 星星多的时候用小一号，避免一片糊在一起 */
const starSize = computed(() => (count > 6 ? 'md' : 'lg'))

const stars = computed(() =>
  Array.from({ length: count }, (_, index) => {
    const spread = count === 1 ? 0 : (index / (count - 1) - 0.5) * 2
    return {
      'key': index,
      '--fly-x': `${Math.round(spread * 180)}px`,
      '--fly-y': `${-180 - Math.abs(spread) * 60}px`,
      'delay': `${index * 55}ms`,
    }
  }),
)
</script>

<template>
  <div
    v-if="active"
    class="pointer-events-none absolute inset-0 z-40 grid place-items-center overflow-visible"
    :class="from === 'corner' && 'place-items-start justify-end'"
    aria-hidden="true"
  >
    <span
      v-for="star in stars"
      :key="star.key"
      class="fx-star-fly absolute text-star"
      :style="{
        '--fly-x': star['--fly-x'],
        '--fly-y': star['--fly-y'],
        'animationDelay': star.delay,
      }"
    >
      <KIcon name="star" :size="starSize" weight="fill" />
    </span>
  </div>
</template>
