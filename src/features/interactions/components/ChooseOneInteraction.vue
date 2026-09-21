<script setup lang="ts">
import type { InteractionComponentEmits } from '../contract'

import type { ChooseOnePayload } from '@/domain'
import { computed, ref } from 'vue'
import { toneVars } from '@/domain'

import { cn } from '@/shared/utils'

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

function pick(id: string, correct: boolean | undefined, hint: string | undefined): void {
  if (disabled || pickedId.value)
    return

  if (correct) {
    pickedId.value = id
    emit('solved', id)
    return
  }

  wrongId.value = id
  emit('missed', hint)
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
      @click="pick(option.id, option.correct, option.hint)"
    >
      <span :class="isScene ? 'text-6xl' : 'text-4xl'" aria-hidden="true">
        {{ option.emoji ?? '❓' }}
      </span>
      <span class="font-display text-lg leading-tight text-[var(--tone-deep)]">{{ option.label }}</span>
      <span
        v-if="pickedId === option.id"
        class="absolute -top-3 -right-3 grid size-8 place-items-center rounded-chip bg-success text-white shadow-press"
        aria-hidden="true"
      >
        ✓
      </span>
    </button>
  </div>
</template>
