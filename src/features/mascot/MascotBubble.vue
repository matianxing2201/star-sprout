<script setup lang="ts">
import type { MascotId } from '@/domain'

import { computed } from 'vue'
import { getMascot } from '@/domain'
import MascotAvatar from './MascotAvatar.vue'

/**
 * 角色对话气泡。
 * 全站所有“角色说话”的地方都用它，保证语气与视觉一致 ——
 * 孩子看到的是“🐻 熊老师正在和我说话”，而不是一条系统提示。
 */
const {
  id,
  text,
  size = 'md',
  mood = 'happy',
  align = 'left',
} = defineProps<{
  id: MascotId
  text: string
  size?: 'sm' | 'md' | 'lg'
  mood?: 'happy' | 'curious' | 'thinking' | 'cheering'
  align?: 'left' | 'right'
}>()

const mascot = computed(() => getMascot(id))
</script>

<template>
  <div
    class="flex items-start gap-3"
    :class="align === 'right' && 'flex-row-reverse'"
  >
    <MascotAvatar :id="id" :size="size === 'sm' ? 'sm' : 'md'" :mood="mood" />

    <div
      class="relative max-w-prose rounded-blob rounded-tl-md border-2 bg-surface px-5 py-3 shadow-sticker"
      :style="{ borderColor: `color-mix(in srgb, var(--color-${mascot.tone}) 26%, transparent)` }"
    >
      <p class="font-body text-[15px] leading-relaxed text-ink">
        {{ text }}
      </p>
      <slot />
    </div>
  </div>
</template>
