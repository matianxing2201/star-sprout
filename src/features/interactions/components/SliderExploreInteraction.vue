<script setup lang="ts">
import type { InteractionComponentEmits } from '../contract'

import type { SliderExplorePayload, SliderState } from '@/domain'
import { computed, ref, watch } from 'vue'
import { toneVars } from '@/domain'

import { cn } from '@/shared/utils'

/**
 * 试一试：拖动滑块做实验，看画面跟着变（冰融化、音量变大、影子变长……）。
 * 判对规则：滑块落在 target ± step/2 之内即算完成；到达 target 之前不做任何判定，
 * 探索没有“拖错”，所以本组件永远不会发出 missed。
 */
const { payload, disabled = false } = defineProps<{
  payload: SliderExplorePayload
  disabled?: boolean
}>()

const emit = defineEmits<InteractionComponentEmits>()

const track = ref<HTMLDivElement | null>(null)
const dragging = ref(false)
const focused = ref(false)
/** 已经报过完成，避免拖动过程中重复上报 */
const settled = ref(false)

const stepSize = computed(() => payload.step ?? 1)

/** 把任意值对齐到刻度并夹在区间内；不四舍五入的话 0.1 步长会算出 0.30000000000000004 */
function snap(raw: number): number {
  const clamped = Math.min(payload.max, Math.max(payload.min, raw))
  const steps = Math.round((clamped - payload.min) / stepSize.value)
  return Math.round((payload.min + steps * stepSize.value) * 1000) / 1000
}

const value = ref(snap(payload.initial ?? payload.min))

const span = computed(() => payload.max - payload.min || 1)
const percent = computed(() => Math.min(100, Math.max(0, ((value.value - payload.min) / span.value) * 100)))
const readout = computed(() => `${value.value}${payload.unit ?? ''}`)

/** 取最后一个 from <= 当前值的状态 —— 与内容侧“states 按 from 升序”的约定一致 */
const current = computed<SliderState | null>(() => {
  let matched: SliderState | null = null
  for (const state of payload.states) {
    if (state.from <= value.value)
      matched = state
  }
  return matched
})

watch(value, () => {
  if (disabled || settled.value)
    return
  if (Math.abs(value.value - payload.target) > stepSize.value / 2)
    return

  settled.value = true
  emit('solved', value.value)
})

function updateFrom(clientX: number): void {
  const element = track.value
  if (!element)
    return

  const rect = element.getBoundingClientRect()
  const ratio = rect.width > 0 ? (clientX - rect.left) / rect.width : 0
  value.value = snap(payload.min + ratio * span.value)
}

function onPointerDown(event: PointerEvent): void {
  if (disabled)
    return

  // 手指按下的那一刻就把滑块挪过去，孩子不必先精确抓住把手
  event.preventDefault()
  dragging.value = true
  track.value?.setPointerCapture(event.pointerId)
  updateFrom(event.clientX)
}

function onPointerMove(event: PointerEvent): void {
  if (disabled || !dragging.value)
    return

  updateFrom(event.clientX)
}

function onPointerUp(event: PointerEvent): void {
  dragging.value = false
  const element = track.value
  if (element && element.hasPointerCapture(event.pointerId))
    element.releasePointerCapture(event.pointerId)
}
</script>

<template>
  <div
    class="flex flex-col items-center gap-4 rounded-tile border-2 border-[var(--tone-line)] bg-surface p-5 shadow-sticker"
    :style="toneVars('explore')"
  >
    <!-- 状态整体换掉（:key）才能重放一次 pop-in，孩子看得见“世界变了” -->
    <div :key="current?.from ?? 'none'" class="flex animate-pop-in flex-col items-center gap-1 text-center">
      <span class="text-6xl" aria-hidden="true">{{ current?.emoji ?? '🔎' }}</span>
      <p class="font-display text-lg leading-snug text-[var(--tone-deep)]">
        {{ current?.caption ?? '拖动滑块，看看会怎样' }}
      </p>
    </div>

    <p class="font-numeric text-3xl text-ink">
      {{ value }}
      <span v-if="payload.unit" class="text-lg text-ink-soft">{{ payload.unit }}</span>
    </p>

    <!-- 自绘轨道 + 大把手；里面那个原生 range 只负责键盘操作，看得见的大把手负责拖动 -->
    <div
      ref="track"
      class="slider-track relative h-16 w-full select-none"
      :class="disabled && 'pointer-events-none'"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerUp"
    >
      <div class="absolute inset-x-0 top-1/2 h-4 -translate-y-1/2 rounded-chip border-2 border-[var(--tone-line)] bg-[var(--tone-soft)]" />
      <div
        class="absolute top-1/2 h-4 -translate-y-1/2 rounded-chip bg-[var(--tone)]"
        :style="{ width: `${percent}%` }"
      />
      <button
        type="button"
        :disabled="disabled"
        :aria-label="`拖动滑块，当前 ${readout}`"
        :class="cn(
          'absolute top-1/2 size-12 -translate-x-1/2 -translate-y-1/2 rounded-chip border-2 bg-surface text-xl shadow-sticker',
          'disabled:cursor-default',
          focused ? 'border-[var(--tone)] ring-4 ring-[var(--tone-glow)]' : 'border-[var(--tone-line)]',
        )"
        :style="{ left: `${percent}%` }"
      >
        <span aria-hidden="true">↔️</span>
      </button>
      <input
        v-model.number="value"
        type="range"
        class="sr-only"
        :min="payload.min"
        :max="payload.max"
        :step="stepSize"
        :aria-label="`试一试：${payload.minLabel}到${payload.maxLabel}`"
        :aria-valuetext="readout"
        @focus="focused = true"
        @blur="focused = false"
      >
    </div>

    <div class="flex w-full items-center justify-between font-body text-sm text-ink-soft">
      <span>{{ payload.minLabel }}</span>
      <span>{{ payload.maxLabel }}</span>
    </div>
  </div>
</template>

<style scoped>
/* 拖动滑块是一个手势，不能被浏览器解释成页面滚动，否则手指一滑轨道就丢焦点 */
.slider-track {
  touch-action: none;
}
</style>
