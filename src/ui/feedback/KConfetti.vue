<script setup lang="ts">
import { computed } from 'vue'

/**
 * 彩纸。只在 lesson / chapter / streak 三个高等级奖励里出现 ——
 * 产品明确要求“不要所有点击都爆金币”，因此这里不做任何默认开启。
 */
const { count = 24, active = false } = defineProps<{
  count?: number
  active?: boolean
}>()

const PALETTE = ['#F5B82E', '#D2833A', '#3F7D5B', '#2F7E8C', '#C05B7E', '#7A5EA8', '#D2685E']

/** 位置与节奏一次性算好，避免重渲染时抖动 */
const pieces = computed(() =>
  Array.from({ length: count }, (_, index) => {
    const seed = (index * 9301 + 49297) % 233280
    const random = seed / 233280
    const random2 = ((index * 4523 + 1231) % 9973) / 9973

    return {
      left: `${Math.round(random * 100)}%`,
      delay: `${Math.round(random2 * 320)}ms`,
      duration: `${900 + Math.round(random2 * 500)}ms`,
      color: PALETTE[index % PALETTE.length],
      size: 8 + Math.round(random * 8),
      round: index % 3 === 0,
    }
  }),
)
</script>

<template>
  <div v-if="active" class="pointer-events-none fixed inset-0 z-60 overflow-hidden" aria-hidden="true">
    <span
      v-for="(piece, index) in pieces"
      :key="index"
      class="fx-confetti absolute top-0 block"
      :style="{
        left: piece.left,
        width: `${piece.size}px`,
        height: `${piece.size}px`,
        backgroundColor: piece.color,
        borderRadius: piece.round ? '999px' : '2px',
        animationDelay: piece.delay,
        animationDuration: piece.duration,
      }"
    />
  </div>
</template>
