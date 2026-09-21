<script setup lang="ts">
import type { UiTone } from '@/domain'

import { computed } from 'vue'
import { toneVars } from '@/domain'
import { cn } from '@/shared/utils'

/**
 * 进度条。儿童端的进度必须是“看得见的推进”，
 * 因此默认带数字与动画，且永远不显示负向反馈。
 */
const {
  value = 0,
  max = 1,
  tone = 'neutral',
  size = 'md',
  label,
  showValue = false,
} = defineProps<{
  value?: number
  max?: number
  tone?: UiTone
  size?: 'sm' | 'md' | 'lg'
  /** 进度条上方的说明文字 */
  label?: string
  showValue?: boolean
}>()

const ratio = computed(() => {
  if (max <= 0)
    return 0
  return Math.min(1, Math.max(0, value / max))
})

const percent = computed(() => Math.round(ratio.value * 100))

const trackHeight = computed(() => {
  if (size === 'sm')
    return 'h-2'
  if (size === 'lg')
    return 'h-5'
  return 'h-3.5'
})

const classes = computed(() => cn('relative w-full overflow-hidden rounded-chip bg-paper-deep', trackHeight.value))
</script>

<template>
  <div :style="toneVars(tone)">
    <div v-if="label || showValue" class="mb-1.5 flex items-baseline justify-between gap-3">
      <span v-if="label" class="font-body text-sm text-ink-soft">{{ label }}</span>
      <span v-if="showValue" class="font-numeric text-sm font-bold text-[var(--tone-deep)]">{{ percent }}%</span>
    </div>

    <div
      :class="classes"
      role="progressbar"
      :aria-valuenow="percent"
      aria-valuemin="0"
      aria-valuemax="100"
      :aria-label="label"
    >
      <div
        class="h-full rounded-chip bg-[var(--tone)] transition-[width] duration-500 ease-soft"
        :style="{ width: `${percent}%` }"
      />
    </div>
  </div>
</template>
