<script setup lang="ts">
import type { UiTone } from '@/domain'

import { computed } from 'vue'
import { toneVars } from '@/domain'
import { cn } from '@/shared/utils'

/**
 * 基础卡片：圆角 + 细描边 + 贴纸投影。
 * `interactive` 打开后会带上 hover / press 状态，用于可点击的卡片。
 */
type CardPadding = 'none' | 'sm' | 'md' | 'lg'

const {
  tone = 'neutral',
  interactive = false,
  elevated = false,
  padded = 'md',
  tinted = false,
} = defineProps<{
  tone?: UiTone
  interactive?: boolean
  /** 更强的投影，用于浮层、当前选中的卡片 */
  elevated?: boolean
  padded?: CardPadding
  /** 是否使用领域柔色作为底色（而不是白底） */
  tinted?: boolean
}>()

const PADDING_CLASSES: Record<CardPadding, string> = {
  none: 'p-0',
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-7',
}

const classes = computed(() =>
  cn(
    'relative rounded-card border-2 border-[var(--tone-line)]',
    tinted ? 'bg-[var(--tone-soft)]' : 'bg-surface',
    elevated ? 'shadow-lift' : 'shadow-sticker',
    PADDING_CLASSES[padded],
    interactive && 'fx-tap cursor-pointer hover:border-[var(--tone)] hover:shadow-lift',
  ),
)
</script>

<template>
  <div :class="classes" :style="toneVars(tone)">
    <slot />
  </div>
</template>
