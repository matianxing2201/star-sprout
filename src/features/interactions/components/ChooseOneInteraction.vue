<script setup lang="ts">
import type { InteractionComponentEmits } from '../contract'

import type { ChooseOnePayload, InteractionOption } from '@/domain'
import { computed, ref } from 'vue'
import { toneVars } from '@/domain'

import { ListenButton, useAudioClip } from '@/features/audio'
import { cn } from '@/shared/utils'
import { KIcon, KVisual } from '@/ui'

/**
 * 选一选：点一个就对。
 * 判对之后卡片弹一下并锁定；点错了只做温柔抖动，卡片自动回到可选状态，
 * 孩子可以马上再试 —— 不出现红叉，也不消耗“机会”。
 */
const { payload, disabled = false } = defineProps<{
  payload: ChooseOnePayload
  disabled?: boolean
}>()

const emit = defineEmits<InteractionComponentEmits>()

const pickedId = ref<string | null>(null)
const wrongId = ref<string | null>(null)

const { toggle } = useAudioClip()

const columns = computed(() => {
  const count = payload.options.length
  if (payload.columns)
    return payload.columns
  if (count <= 2)
    return 2
  if (count <= 4)
    return 2
  return 3
})

const gridClass = computed(() => {
  const map: Record<number, string> = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 sm:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-4',
  }
  return map[columns.value] ?? 'grid-cols-3'
})

const isScene = computed(() => payload.layout === 'scene')

/** 内容侧可能只写了文字：给一枚问号图标占位，避免卡片空着半张脸 */
function optionIcon(option: InteractionOption) {
  return option.icon ?? (option.emoji || option.image ? undefined : 'question' as const)
}

/**
 * 点一张字卡：先把它的音念出来，再判对错。
 *
 * 顺序是刻意的 —— 认字课里「点一下」首先是「听它念什么」，
 * 判对错是其次。听音在判定之前发生，即使点错了也已经听到了正确发音；
 * 点对了则 `toggle` 停在「正在念」，那一个字会一直响到孩子再点一下为止。
 */
function pick(option: InteractionOption): void {
  if (disabled || pickedId.value)
    return

  if (option.audioClipId)
    toggle(option.audioClipId)

  if (option.correct) {
    pickedId.value = option.id
    emit('solved', option.id)
    return
  }

  wrongId.value = option.id
  emit('missed', option.hint)
  setTimeout(() => {
    wrongId.value = null
  }, 640)
}
</script>

<template>
  <div :class="cn('grid gap-4', gridClass)">
    <button
      v-for="option in payload.options"
      :key="option.id"
      type="button"
      :disabled="disabled"
      :class="cn(
        'fx-pressable relative flex flex-col items-center gap-2 rounded-tile border-2 border-[var(--tone-line)] bg-surface text-center shadow-sticker',
        'disabled:cursor-default',
        isScene ? 'min-h-44 justify-center p-5' : 'min-h-32 justify-center p-4',
        pickedId === option.id && 'fx-correct border-success bg-success-soft',
        wrongId === option.id && 'fx-gently border-gently bg-gently-soft',
      )"
      :style="toneVars(option.tone ?? 'neutral')"
      @click="pick(option)"
    >
      <KVisual
        :icon="optionIcon(option)"
        :emoji="option.emoji"
        :image="option.image"
        :size="isScene ? 'xl' : 'lg'"
        :tone="option.tone"
      />
      <span class="font-display text-lg leading-tight text-[var(--tone-deep)]">{{ option.label }}</span>
      <!--
        卡片角上的小喇叭：整张卡都能点，但它让「这里可以听」变得看得出来。
        点了会 toggle，听过的字再点一下就能停 —— 不用去够那颗按钮。
      -->
      <ListenButton
        v-if="option.audioClipId"
        :clip-id="option.audioClipId"
        size="sm"
        :tone="option.tone ?? 'language'"
        class="absolute -bottom-2 -right-2"
        label="听这个字"
      />
      <span
        v-if="pickedId === option.id"
        class="absolute -top-3 -right-3 grid size-8 place-items-center rounded-chip bg-success text-white shadow-press"
        aria-hidden="true"
      >
        <KIcon name="check" size="md" />
      </span>
    </button>
  </div>
</template>
