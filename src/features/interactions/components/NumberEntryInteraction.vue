<script setup lang="ts">
import type { InteractionComponentEmits } from '../contract'
import type { NumberEntryPayload } from '@/domain'
import { ref } from 'vue'
import { KButton, KIcon } from '@/ui'

const { payload, disabled = false } = defineProps<{
  payload: NumberEntryPayload
  disabled?: boolean
}>()

const emit = defineEmits<InteractionComponentEmits>()
const value = ref('')
const maxDigits = payload.maxDigits ?? payload.answer.length

function addDigit(digit: string): void {
  if (disabled || value.value.length >= maxDigits)
    return
  value.value = `${value.value}${digit}`
}

function removeDigit(): void {
  if (!disabled)
    value.value = value.value.slice(0, -1)
}

function check(): void {
  if (disabled || value.value.length === 0)
    return
  if (value.value === payload.answer) {
    emit('solved', value.value)
    return
  }
  emit('missed', '再把题目里的数量变化算一遍，然后填一次。')
  value.value = ''
}
</script>

<template>
  <div class="mx-auto flex w-full max-w-sm flex-col gap-4">
    <label class="sr-only" for="math-number-answer">输入答案</label>
    <div class="flex items-center justify-center gap-2 rounded-tile border-2 border-line bg-surface p-3 shadow-press">
      <input
        id="math-number-answer"
        v-model="value"
        type="text"
        inputmode="numeric"
        pattern="[0-9]*"
        :maxlength="maxDigits"
        :placeholder="payload.placeholder ?? '填答案'"
        :disabled="disabled"
        class="h-16 min-w-28 rounded-tile border-2 border-math-line bg-math-soft px-4 text-center font-numeric text-3xl font-black text-math-deep outline-none focus-visible:ring-4 focus-visible:ring-math-line/40 disabled:opacity-75"
        @input="value = value.replace(/\D/g, '').slice(0, maxDigits)"
        @keydown.enter.prevent="check"
      >
    </div>
    <div class="grid grid-cols-3 gap-2">
      <button
        v-for="digit in ['1', '2', '3', '4', '5', '6', '7', '8', '9']"
        :key="digit"
        type="button"
        :disabled="disabled"
        class="fx-pressable min-h-12 rounded-tile border-2 border-line bg-surface font-numeric text-xl font-extrabold text-ink shadow-press transition-colors hover:bg-math-soft disabled:opacity-50"
        @click="addDigit(digit)"
      >
        {{ digit }}
      </button>
      <button
        type="button"
        :disabled="disabled"
        class="fx-pressable min-h-12 rounded-tile border-2 border-line bg-paper font-body text-sm font-bold text-ink-soft shadow-press transition-colors hover:bg-paper-deep disabled:opacity-50"
        aria-label="删除一位"
        @click="removeDigit"
      >
        <span aria-hidden="true" class="text-xl">⌫</span>
      </button>
      <button
        type="button"
        :disabled="disabled"
        class="fx-pressable min-h-12 rounded-tile border-2 border-line bg-surface font-numeric text-xl font-extrabold text-ink shadow-press transition-colors hover:bg-math-soft disabled:opacity-50"
        @click="addDigit('0')"
      >
        0
      </button>
      <span aria-hidden="true" />
    </div>
    <KButton
      variant="primary"
      tone="math"
      size="lg"
      block
      :disabled="disabled || !value.length"
      @click="check"
    >
      看看对不对
      <KIcon name="arrow-right" size="sm" />
    </KButton>
  </div>
</template>
