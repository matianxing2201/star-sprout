<script setup lang="ts">
import type { MascotId } from '@/domain'

import { computed } from 'vue'
import { getMascot } from '@/domain'
import { cn } from '@/shared/utils'

/**
 * 角色形象。
 * 角色不是装饰：它出现在引入、提问、提示、鼓励、错误反馈、奖励每一个环节，
 * 因此这里只需要一个稳定、可复用、带呼吸感的形象。
 */
const {
  id,
  size = 'md',
  mood = 'happy',
  animate = true,
} = defineProps<{
  id: MascotId
  size?: 'sm' | 'md' | 'lg' | 'xl'
  mood?: 'happy' | 'curious' | 'thinking' | 'cheering'
  animate?: boolean
}>()

const mascot = computed(() => getMascot(id))

const SIZE_CLASSES = {
  sm: 'size-10 text-xl',
  md: 'size-14 text-3xl',
  lg: 'size-20 text-5xl',
  xl: 'size-28 text-6xl',
} as const

const MOOD_CLASSES = {
  happy: '',
  curious: 'rotate-3',
  thinking: '-rotate-3',
  cheering: 'animate-bounce',
} as const
</script>

<template>
  <span
    :class="cn(
      'grid shrink-0 place-items-center rounded-chip border-2 border-[var(--tone-line)] bg-[var(--tone-soft)] shadow-press',
      SIZE_CLASSES[size],
      MOOD_CLASSES[mood],
      animate && mood === 'happy' && 'animate-breathe',
    )"
    :style="{ '--tone': `var(--color-${mascot.tone})`, '--tone-soft': `var(--color-${mascot.tone}-soft)`, '--tone-line': `color-mix(in srgb, var(--color-${mascot.tone}) 30%, transparent)` }"
    :title="mascot.name"
    role="img"
    :aria-label="mascot.name"
  >
    {{ mascot.emoji }}
  </span>
</template>
