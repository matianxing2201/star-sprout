<script setup lang="ts">
import type { AppIconName, UiTone } from '@/domain'
import { toneVars } from '@/domain'
import { KVisual } from '@/ui/icons'

/**
 * 数据小卡：成长页与家长端共用。
 * 数字必须大、说明必须短；图标统一走 KVisual，因此同时接受语义图标与 emoji。
 */
const {
  icon,
  emoji,
  value,
  label,
  hint,
  tone = 'neutral',
} = defineProps<{
  /** 语义图标名（推荐） */
  icon?: AppIconName
  /** 仅当图标词汇表里真的没有合适项时才用 emoji */
  emoji?: string
  value: string | number
  label: string
  hint?: string
  tone?: UiTone
}>()
</script>

<template>
  <div
    class="flex items-center gap-3 rounded-tile border-2 border-[var(--tone-line)] bg-surface p-4 shadow-press"
    :style="toneVars(tone)"
  >
    <span
      class="grid size-11 shrink-0 place-items-center rounded-chip bg-[var(--tone-soft)] text-[var(--tone-deep)]"
      aria-hidden="true"
    >
      <KVisual :icon="icon" :emoji="emoji" size="md" plain />
    </span>
    <div class="min-w-0">
      <p class="font-numeric text-2xl leading-tight font-extrabold text-[var(--tone-deep)]">
        {{ value }}
      </p>
      <p class="truncate font-body text-xs text-ink-soft">
        {{ label }}
      </p>
      <p v-if="hint" class="truncate font-body text-[11px] text-ink-faint">
        {{ hint }}
      </p>
    </div>
  </div>
</template>
