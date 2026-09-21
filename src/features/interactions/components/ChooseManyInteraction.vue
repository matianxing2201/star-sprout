<script setup lang="ts">
import type { InteractionComponentEmits } from '../contract'

import type { ChooseManyPayload, InteractionOption } from '@/domain'
import { computed, ref } from 'vue'
import { toneVars } from '@/domain'
import { cn } from '@/shared/utils'

import { KButton, KIcon, KVisual } from '@/ui'

/**
 * 全都找出来：多选之后按「就选这些！」才判定。
 * 判对标准：选中的恰好是全部 correct 选项，不多也不少。
 * 差一点点时只清掉选错的那些，选对的留给孩子 —— 他可以立刻再试，不会被锁在门外。
 */
const { payload, disabled = false } = defineProps<{
  payload: ChooseManyPayload
  disabled?: boolean
}>()

const emit = defineEmits<InteractionComponentEmits>()

const selectedIds = ref<string[]>([])
const wrongIds = ref<string[]>([])
const solvedIds = ref<string[]>([])

const correctIds = computed(() => payload.options.filter(option => option.correct).map(option => option.id))

/** 确认按钮跟着题目的色调走，缺省用「思维」色 */
const confirmTone = computed(() => payload.options[0]?.tone ?? 'think')

const columns = computed(() => {
  const count = payload.options.length
  if (payload.columns)
    return payload.columns
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

function isSelected(id: string): boolean {
  return selectedIds.value.includes(id)
}

/** 内容侧可能只写了文字：给一枚问号图标占位，避免卡片空着半张脸 */
function optionIcon(option: InteractionOption) {
  return option.icon ?? (option.emoji || option.image ? undefined : 'question' as const)
}

function toggle(id: string): void {
  if (disabled)
    return

  const index = selectedIds.value.indexOf(id)
  if (index >= 0)
    selectedIds.value.splice(index, 1)
  else
    selectedIds.value.push(id)
}

function confirm(): void {
  if (disabled || selectedIds.value.length === 0)
    return

  const answer = [...selectedIds.value]
  const expected = correctIds.value
  const isRight = answer.length === expected.length && answer.every(id => expected.includes(id))

  if (isRight) {
    solvedIds.value = answer
    emit('solved', answer)
    return
  }

  const wrong = answer.filter(id => !expected.includes(id))
  wrongIds.value = wrong
  // 提示只取内容里写好的那一句，没有就交给外壳的角色台词
  emit('missed', payload.options.find(option => wrong.includes(option.id))?.hint)

  // 只清掉选错的：对的留着，孩子不用从头再来
  selectedIds.value = answer.filter(id => expected.includes(id))
  setTimeout(() => {
    wrongIds.value = []
  }, 640)
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <p
      v-if="payload.requiredCount"
      class="text-center font-body text-sm text-ink-soft"
    >
      要找出 {{ payload.requiredCount }} 个哦 · 已选 {{ selectedIds.length }} 个
    </p>

    <div :class="cn('grid gap-4', gridClass)">
      <button
        v-for="option in payload.options"
        :key="option.id"
        type="button"
        :disabled="disabled"
        :aria-label="option.label"
        :aria-pressed="isSelected(option.id)"
        :class="cn(
          'fx-pressable relative flex min-h-32 flex-col items-center justify-center gap-2 rounded-tile border-2 border-[var(--tone-line)] bg-surface p-4 text-center shadow-sticker',
          'disabled:cursor-default',
          isSelected(option.id) && 'border-[var(--tone)] bg-[var(--tone-soft)]',
          wrongIds.includes(option.id) && 'fx-gently border-gently bg-gently-soft',
          solvedIds.includes(option.id) && 'fx-correct border-success bg-success-soft',
        )"
        :style="toneVars(option.tone ?? 'neutral')"
        @click="toggle(option.id)"
      >
        <KVisual
          :icon="optionIcon(option)"
          :emoji="option.emoji"
          :image="option.image"
          size="lg"
          :tone="option.tone"
        />
        <span class="font-display text-lg leading-tight text-[var(--tone-deep)]">{{ option.label }}</span>
        <span
          v-if="isSelected(option.id)"
          class="absolute -top-3 -right-3 grid size-8 place-items-center rounded-chip bg-success text-white shadow-press"
          aria-hidden="true"
        >
          <KIcon name="check" size="md" />
        </span>
      </button>
    </div>

    <KButton
      variant="primary"
      size="lg"
      block
      :tone="confirmTone"
      :disabled="disabled || selectedIds.length === 0"
      @click="confirm"
    >
      <KIcon name="check" size="sm" />
      就选这些！
    </KButton>
  </div>
</template>
