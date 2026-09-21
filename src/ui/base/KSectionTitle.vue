<script setup lang="ts">
import type { UiTone } from '@/domain'
import { toneVars } from '@/domain'

/** 区块标题：小字眉标 + 主标题 + 说明。页面里所有的“段落”都由它开头，保证层级一致 */
const {
  eyebrow,
  title,
  description,
  tone = 'neutral',
} = defineProps<{
  eyebrow?: string
  title: string
  description?: string
  tone?: UiTone
}>()
</script>

<template>
  <header class="mb-5 flex flex-wrap items-end justify-between gap-4" :style="toneVars(tone)">
    <div>
      <p v-if="eyebrow" class="mb-1 font-body text-xs font-bold tracking-[0.24em] text-[var(--tone)] uppercase">
        {{ eyebrow }}
      </p>
      <h2 class="font-display text-[clamp(1.5rem,3vw,2.25rem)] text-ink">
        {{ title }}
      </h2>
      <p v-if="description" class="mt-2 max-w-2xl font-body text-sm text-ink-soft">
        {{ description }}
      </p>
    </div>
    <div v-if="$slots.action" class="flex flex-wrap items-center gap-2">
      <slot name="action" />
    </div>
  </header>
</template>
