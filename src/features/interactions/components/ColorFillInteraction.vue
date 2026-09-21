<script setup lang="ts">
import type { InteractionComponentEmits } from '../contract'
import type { ColorFillPayload, ColorFillRegion, ToneKey } from '@/domain'

import { computed, ref } from 'vue'
import { TONE_LABELS, toneVars } from '@/domain'

import { cn } from '@/shared/utils'

/**
 * 涂一涂：先选颜色，再点画面里的区域上色。
 *
 * 判定规则：只检查声明了 expectedTone 的区域（没声明的属于自由涂鸦，涂什么都算对）。
 * 涂错不当场责备：只有当这一块有目标色、且颜色不一样时才温柔提一句，
 * 然后让孩子直接用新颜色盖过去 —— 每个动作最多提示一次，不反复唠叨。
 */
const { payload, disabled = false } = defineProps<{
  payload: ColorFillPayload
  disabled?: boolean
}>()

const emit = defineEmits<InteractionComponentEmits>()

const selectedTone = ref<ToneKey | null>(null)
const fills = ref<Record<string, ToneKey>>({})
/** 涂错次数：只回传给家长端做观察，不用于现场惩罚 */
const wrongPaintCount = ref(0)
const done = ref(false)

const viewBox = computed(() => `0 0 ${payload.width} ${payload.height}`)

const gradedRegions = computed(() => payload.regions.filter(region => region.expectedTone !== undefined))

function isPainted(regionId: string): boolean {
  return regionId in fills.value
}

function fillOf(regionId: string): string {
  const tone = fills.value[regionId]
  return tone ? `var(--color-${tone})` : 'var(--color-surface)'
}

function regionLabel(index: number, regionId: string): string {
  return isPainted(regionId)
    ? `第 ${index + 1} 块，已经涂好了`
    : `第 ${index + 1} 块，点一下涂色`
}

function pickTone(tone: ToneKey): void {
  if (disabled || done.value)
    return
  // 再点一次同一个颜色 = 放下画笔，孩子可以只看不涂
  selectedTone.value = selectedTone.value === tone ? null : tone
}

function isFinished(): boolean {
  const graded = gradedRegions.value
  if (graded.length > 0)
    return graded.every(region => fills.value[region.id] === region.expectedTone)
  // 全是自由涂鸦的题目没有目标色可比，涂满即完成（否则会在进场时误判为已完成）
  return payload.regions.length > 0 && payload.regions.every(region => isPainted(region.id))
}

function judge(): void {
  if (done.value || !isFinished())
    return
  done.value = true
  emit('solved', { fills: { ...fills.value }, wrongPaintCount: wrongPaintCount.value })
}

function paint(region: ColorFillRegion): void {
  const tone = selectedTone.value
  if (disabled || done.value || tone === null)
    return

  fills.value = { ...fills.value, [region.id]: tone }

  if (region.expectedTone !== undefined && region.expectedTone !== tone) {
    wrongPaintCount.value += 1
    emit('missed', '这个颜色和这里要的不太一样，换一支笔再试试。')
  }

  judge()
}

function reset(): void {
  if (disabled || done.value)
    return
  fills.value = {}
  selectedTone.value = null
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-wrap items-center gap-2.5" role="group" aria-label="颜色">
      <button
        v-for="tone in payload.palette"
        :key="tone"
        type="button"
        :disabled="disabled"
        :aria-label="`选${TONE_LABELS[tone]}色`"
        :aria-pressed="selectedTone === tone"
        :class="cn(
          'fx-pressable grid size-12 place-items-center rounded-chip border-2 shadow-press disabled:cursor-default',
          selectedTone === tone
            ? 'border-[var(--tone-deep)] ring-4 ring-[var(--tone-glow)]'
            : 'border-[var(--tone-line)]',
        )"
        :style="toneVars(tone)"
        @click="pickTone(tone)"
      >
        <span class="size-7 rounded-chip bg-[var(--tone)]" aria-hidden="true" />
      </button>
    </div>

    <div class="relative rounded-tile border-2 border-line bg-surface p-3">
      <!-- 这张 SVG 里装着可点击的上色区域，不是装饰图，所以不加 aria-hidden -->
      <svg class="w-full" :viewBox="viewBox" role="group" aria-label="涂色画布">
        <path
          v-for="(region, index) in payload.regions"
          :key="region.id"
          :d="region.path"
          :fill="fillOf(region.id)"
          :class="cn('fill-region', !disabled && !done && selectedTone !== null && 'cursor-pointer')"
          stroke="var(--color-line-strong)"
          stroke-width="2"
          stroke-linejoin="round"
          role="button"
          tabindex="0"
          :aria-label="regionLabel(index, region.id)"
          :aria-pressed="isPainted(region.id)"
          @click="paint(region)"
          @keydown.enter.prevent="paint(region)"
          @keydown.space.prevent="paint(region)"
        />
      </svg>

      <button
        type="button"
        :disabled="disabled"
        aria-label="重新涂"
        class="fx-pressable absolute top-3 right-3 rounded-chip border-2 border-line-strong bg-surface px-4 py-1.5 font-display text-sm text-ink-soft shadow-press disabled:cursor-default"
        @click="reset"
      >
        重新涂
      </button>
    </div>
  </div>
</template>

<style scoped>
/* 上色要看得见过程：颜色是渐变过去的，不是硬切 */
.fill-region {
  transition: fill var(--duration-quick) var(--ease-soft);
}

.fill-region:focus-visible {
  outline: 3px solid var(--color-star);
  outline-offset: 2px;
}
</style>
