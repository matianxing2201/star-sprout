<script setup lang="ts">
import type { AppIconName, UiTone } from '@/domain'
import { toneVars } from '@/domain'
import { KIcon } from '@/ui/icons'

/**
 * 空状态。
 * 内容包还没到位时使用 —— 对孩子说“这里正在准备”，而不是显示一句冷冰冰的“暂无数据”。
 * 图标用矢量图标（双色调），因此空状态也是「设计过的」，而不是贴一个 emoji 敷衍。
 */
const {
  icon = 'sparkle',
  title,
  description,
  tone = 'neutral',
} = defineProps<{
  icon?: AppIconName
  title: string
  description?: string
  tone?: UiTone
}>()
</script>

<template>
  <div
    class="flex flex-col items-center gap-3 rounded-blob border-2 border-dashed border-[var(--tone-line)] bg-[var(--tone-soft)]/40 px-6 py-12 text-center"
    :style="toneVars(tone)"
  >
    <KIcon
      :name="icon"
      size="2xl"
      weight="duotone"
      class="animate-breathe text-[var(--tone-deep)]"
    />

    <h3 class="font-display text-xl text-[var(--tone-deep)]">
      {{ title }}
    </h3>
    <p v-if="description" class="max-w-md font-body text-sm text-ink-soft">
      {{ description }}
    </p>
    <div v-if="$slots.action" class="mt-2">
      <slot name="action" />
    </div>
  </div>
</template>
