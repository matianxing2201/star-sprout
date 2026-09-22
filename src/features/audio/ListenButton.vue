<script setup lang="ts">
import type { AudioClipId, UiTone } from '@/domain'

import { computed } from 'vue'
import { toneVars } from '@/domain'
import { cn } from '@/shared/utils'
import { KIcon } from '@/ui'

import { useAudioClip } from './useAudioClip'

/**
 * 范读按钮
 * ========
 *
 * 「点一下，听它念一遍。」—— 识字课里孩子最早学会的一个动作。
 *
 * 它只有两个尺寸，因为只有两种用法：
 *   - `md`：整组字先听一遍（放在互动外壳上）；
 *   - `sm`：卡片角上那一个小喇叭（放在字卡、连线节点上）。
 *
 * 播放状态由 useAudioClip 统一管：同一个时刻只响一个片段，
 * 因此这里不需要（也不应该）自己维护 audio 元素。
 */
const {
  clipId,
  label = '听一遍',
  size = 'md',
  tone = 'language',
} = defineProps<{
  clipId: AudioClipId
  label?: string
  size?: 'sm' | 'md'
  tone?: UiTone
}>()

const { playingId, loadingId, hasPlayed, toggle } = useAudioClip()

const playing = computed(() => playingId.value === clipId)
const loading = computed(() => loadingId.value === clipId)

/** 正在响的时候图标变浅一点，「这一个在念」一眼看得出来 */
const iconClass = computed(() => cn(playing.value && 'opacity-70', loading.value && 'opacity-50'))

const classes = computed(() => cn(
  // `relative` 是给 `sm` 尺寸那圈呼吸光晕定位用的，不是装饰
  'fx-tap relative inline-flex shrink-0 items-center justify-center gap-1.5 rounded-chip font-display leading-none',
  'border-2 shadow-press transition-colors',
  playing.value
    ? 'border-[var(--tone)] bg-[var(--tone)] text-white'
    : 'border-[var(--tone-line)] bg-surface text-[var(--tone-deep)] hover:border-[var(--tone)]',
  size === 'sm' ? 'size-9' : 'h-12 gap-2 px-5 text-base',
))

/** 还没播过的片段轻轻呼吸一下，告诉孩子「这里可以点」 */
const inviting = computed(() => !hasPlayed(clipId) && !playing.value)
</script>

<template>
  <button
    type="button"
    :class="classes"
    :style="toneVars(tone)"
    :aria-label="playing ? '停下来' : label"
    :aria-pressed="playing"
    :data-audio-clip="clipId"
    :data-playing="playing ? '' : undefined"
    @click.stop="toggle(clipId)"
  >
    <KIcon
      name="speaker"
      :size="size === 'sm' ? 'md' : 'lg'"
      :class="iconClass"
    />
    <span v-if="size === 'md'">{{ playing ? '正在念…' : label }}</span>
    <span
      v-else-if="inviting"
      class="pointer-events-none absolute -inset-1 -z-10 rounded-chip bg-[var(--tone-soft,#eee)] opacity-60"
      aria-hidden="true"
    />
  </button>
</template>
