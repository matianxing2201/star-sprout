<script setup lang="ts">
import type { UiTone } from '@/domain'

import { computed } from 'vue'
import { toneVars } from '@/domain'
import { cn } from '@/shared/utils'

/** 小标签：领域名、状态、星级等短信息的载体 */
type TagSize = 'sm' | 'md'

const { tone = 'neutral', size = 'md', solid = false } = defineProps<{
  tone?: UiTone
  size?: TagSize
  /** 使用实心底色，用于强调当前状态 */
  solid?: boolean
}>()

const classes = computed(() =>
  cn(
    'inline-flex items-center gap-1 rounded-chip font-body font-medium whitespace-nowrap',
    size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm',
    solid
      ? 'bg-[var(--tone)] text-white'
      : 'bg-[var(--tone-soft)] text-[var(--tone-deep)]',
  ),
)
</script>

<template>
  <span :class="classes" :style="toneVars(tone)">
    <slot />
  </span>
</template>
