<script setup lang="ts">
import type { UiTone } from '@/domain'
import { toneVars } from '@/domain'

/** 数据小卡：成长页与家长端共用。数字必须大、说明必须短 */
const {
  emoji,
  value,
  label,
  hint,
  tone = 'neutral',
} = defineProps<{
  emoji: string
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
    <span class="grid size-11 shrink-0 place-items-center rounded-chip bg-[var(--tone-soft)] text-2xl" aria-hidden="true">
      {{ emoji }}
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
