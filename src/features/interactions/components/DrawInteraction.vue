<script setup lang="ts">
import type { InteractionComponentEmits } from '../contract'

import type { DrawPayload } from '@/domain'
import { computed, onMounted, ref } from 'vue'
import { toneVars } from '@/domain'
import { cn } from '@/shared/utils'

import { KButton, KIcon } from '@/ui'

/**
 * 画一画：描红、临摹或自由创作，可以垫一张底图当引导线。
 * 判对规则：创作类任务没有对错 —— 落笔超过 40 个点后「画好了」才可点，点下去就算完成；
 * 所以本组件永远不会发出 missed。
 */
const { payload, disabled = false } = defineProps<{
  payload: DrawPayload
  disabled?: boolean
}>()

const emit = defineEmits<InteractionComponentEmits>()

/** canvas 不解析 CSS 变量，所以兜底值取与 tokens.css 中 --color-ink 相同的墨色 */
const INK_FALLBACK = '#2e2a25'
/** 少于这个点数说明孩子还没真正落笔，先不急着交卷 */
const READY_POINTS = 40

const canvas = ref<HTMLCanvasElement | null>(null)
const color = ref('')
const brush = ref(Math.max(2, Math.round(payload.brushSize ?? 8)))
const points = ref(0)
const painting = ref(false)

let last = { x: 0, y: 0 }
let underlay: HTMLImageElement | null = null

/** 高清屏按 DPR 放大后备缓冲区，线才不发虚；再高的倍数肉眼也看不出差别 */
const ratio = computed(() => (typeof window === 'undefined' ? 1 : Math.min(window.devicePixelRatio || 1, 3)))
const canvasWidth = computed(() => Math.round(payload.width * ratio.value))
const canvasHeight = computed(() => Math.round(payload.height * ratio.value))

const swatches = computed(() => (payload.colors?.length ? payload.colors : [INK_FALLBACK]))
const brushSizes = computed(() => {
  const base = Math.max(2, Math.round(payload.brushSize ?? 8))
  // 去重：很小的 brushSize 会让相邻两档算出同一个粗细，键会重复
  return Array.from(new Set([Math.max(1, Math.round(base / 2)), base, Math.round(base * 2)]))
})
const ready = computed(() => points.value > READY_POINTS)

function ctx2d(): CanvasRenderingContext2D | null {
  return canvas.value?.getContext('2d') ?? null
}

/** 底图整幅画进画布，但压低透明度当“引导线”：孩子是描在它上面，而不是被它盖住 */
function paintUnderlay(context: CanvasRenderingContext2D): void {
  if (!underlay)
    return
  context.save()
  context.globalAlpha = 0.28
  context.drawImage(underlay, 0, 0, payload.width, payload.height)
  context.restore()
}

function loadUnderlay(): void {
  if (!payload.background)
    return

  // 有意不设 crossOrigin：底图是同源 public 资源，设了反而可能被 CORS 挡下
  const image = new Image()
  image.onload = () => {
    underlay = image
    const context = ctx2d()
    if (context)
      paintUnderlay(context)
  }
  image.src = payload.background
}

/** 屏幕坐标换算成画布坐标：CSS 缩放过画布，不能直接用 offsetX */
function toCanvasPoint(event: PointerEvent): { x: number, y: number } {
  const element = canvas.value
  if (!element)
    return { x: 0, y: 0 }

  const rect = element.getBoundingClientRect()
  return {
    x: (event.clientX - rect.left) * (payload.width / (rect.width || payload.width)),
    y: (event.clientY - rect.top) * (payload.height / (rect.height || payload.height)),
  }
}

function onPointerDown(event: PointerEvent): void {
  const element = canvas.value
  const context = ctx2d()
  if (disabled || !element || !context)
    return

  event.preventDefault()
  // 手指滑出画布也要继续画：把这一笔的指针捕获在画布上
  element.setPointerCapture(event.pointerId)
  painting.value = true
  last = toCanvasPoint(event)

  // 轻点也要留下一个圆点，孩子才知道笔是通的
  context.fillStyle = color.value
  context.beginPath()
  context.arc(last.x, last.y, Math.max(1, brush.value / 2), 0, Math.PI * 2)
  context.fill()
  points.value += 1
}

function onPointerMove(event: PointerEvent): void {
  if (!painting.value)
    return

  const context = ctx2d()
  if (!context)
    return

  const next = toCanvasPoint(event)
  context.strokeStyle = color.value
  context.lineWidth = brush.value
  context.beginPath()
  context.moveTo(last.x, last.y)
  context.lineTo(next.x, next.y)
  context.stroke()
  last = next
  points.value += 1
}

function onPointerUp(event: PointerEvent): void {
  painting.value = false
  const element = canvas.value
  if (element && element.hasPointerCapture(event.pointerId))
    element.releasePointerCapture(event.pointerId)
}

/** 重新画：底图要跟着回来，否则描红的孩子会失去参照 */
function restart(): void {
  const context = ctx2d()
  if (disabled || !context)
    return

  context.clearRect(0, 0, payload.width, payload.height)
  paintUnderlay(context)
  points.value = 0
}

function finish(): void {
  if (disabled || !ready.value)
    return

  emit('solved', { strokePoints: points.value, traced: Boolean(payload.background) })
}

onMounted(() => {
  const context = ctx2d()
  if (!context)
    return

  context.setTransform(ratio.value, 0, 0, ratio.value, 0, 0)
  context.lineCap = 'round'
  context.lineJoin = 'round'
  color.value = swatches.value[0]
  loadUnderlay()
})
</script>

<template>
  <div
    class="flex flex-col gap-3 rounded-tile border-2 border-[var(--tone-line)] bg-surface p-3 shadow-sticker sm:p-4"
    :style="toneVars('art')"
  >
    <canvas
      ref="canvas"
      :width="canvasWidth"
      :height="canvasHeight"
      class="draw-canvas rounded-tile border-2 border-line shadow-press"
      :class="disabled && 'pointer-events-none'"
      :style="{ aspectRatio: `${payload.width} / ${payload.height}`, maxWidth: `${payload.width}px` }"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerUp"
    />

    <!-- 颜色和笔头都待在画面里，孩子不用离开画纸去找工具 -->
    <div class="flex flex-wrap items-center gap-2">
      <span class="inline-flex items-center gap-1 font-body text-xs text-ink-soft">
        <KIcon name="palette" size="sm" />
        颜色
      </span>
      <button
        v-for="(swatch, index) in swatches"
        :key="swatch"
        type="button"
        :disabled="disabled"
        :aria-label="`选择第 ${index + 1} 种画笔颜色`"
        :aria-pressed="color === swatch"
        :class="cn(
          'size-9 rounded-chip border-2 shadow-press transition-transform',
          color === swatch ? 'scale-110 border-ink' : 'border-line',
        )"
        :style="{ backgroundColor: swatch }"
        @click="color = swatch"
      />
    </div>

    <div class="flex flex-wrap items-center gap-2">
      <span class="inline-flex items-center gap-1 font-body text-xs text-ink-soft">
        <KIcon name="pencil" size="sm" />
        笔头
      </span>
      <button
        v-for="size in brushSizes"
        :key="size"
        type="button"
        :disabled="disabled"
        :aria-label="`选择笔头粗细 ${size}`"
        :aria-pressed="brush === size"
        :class="cn(
          'grid size-9 place-items-center rounded-chip border-2 bg-surface shadow-press',
          brush === size ? 'border-[var(--tone)]' : 'border-line',
        )"
        @click="brush = size"
      >
        <span
          class="rounded-chip bg-ink"
          :style="{ width: `${size}px`, height: `${size}px` }"
          aria-hidden="true"
        />
      </button>
    </div>

    <div class="flex flex-wrap items-center justify-between gap-3">
      <KButton
        variant="soft"
        size="sm"
        tone="art"
        :disabled="disabled"
        @click="restart"
      >
        <KIcon name="refresh" size="sm" />
        重新画
      </KButton>
      <p v-if="!ready" class="font-body text-sm text-ink-soft">
        再多画几笔，就可以交卷啦
      </p>
      <KButton
        variant="primary"
        size="md"
        tone="art"
        :disabled="disabled || !ready"
        @click="finish"
      >
        画好了
      </KButton>
    </div>
  </div>
</template>

<style scoped>
/* 手指在画布上滑动是“画一笔”，不能被浏览器解释成滚动或缩放，否则笔画会被打断 */
.draw-canvas {
  display: block;
  width: 100%;
  height: auto;
  touch-action: none;
}
</style>
