<script setup lang="ts">
import { computed } from 'vue'

/**
 * 星星飞入收藏栏。
 * 星星数量由奖励等级决定（1 / 3 / 6 / 12），因此“大奖励”在视觉上天然更热闹，
 * 不需要页面自己加码。
 */
const { count = 1, active = false, from = 'center' } = defineProps<{
  count?: number
  active?: boolean
  /** 出发点：任务区中央，或右上角（收藏栏方向） */
  from?: 'center' | 'corner'
}>()

const stars = computed(() =>
  Array.from({ length: count }, (_, index) => {
    const spread = count === 1 ? 0 : (index / (count - 1) - 0.5) * 2
    return {
      'key': index,
      '--fly-x': `${Math.round(spread * 180)}px`,
      '--fly-y': `${-180 - Math.abs(spread) * 60}px`,
      'delay': `${index * 55}ms`,
      'size': count > 6 ? 20 : 28,
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
        'fontSize': `${star.size}px`,
      }"
    >
      ⭐
    </span>
  </div>
</template>
