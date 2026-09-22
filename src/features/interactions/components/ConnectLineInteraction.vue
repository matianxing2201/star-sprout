<script setup lang="ts">
import type { ComponentPublicInstance } from 'vue'
import type { InteractionComponentEmits } from '../contract'
import type { ConnectLinePayload } from '@/domain'

import { computed, onBeforeUnmount, onMounted, ref, useTemplateRef } from 'vue'
import { toneVars } from '@/domain'

import { useAudioClip } from '@/features/audio'
import { cn } from '@/shared/utils'
import { KVisual } from '@/ui'
import { findDropTarget, usePointerDrag } from '../usePointerDrag'

/**
 * 连一连：左右两列各牵一条线。
 *
 * 两条路都通：手指先点左边、再点右边（触摸屏与键盘都走这条），或者从左边直接拖到右边。
 * 判定规则：等每个左节点都有线之后再统一判一次 —— 全对就 solved；
 * 有错只擦掉错线、留下对的线，孩子不用把已经连好的部分重做一遍。
 */
const { payload, disabled = false } = defineProps<{
  payload: ConnectLinePayload
  disabled?: boolean
}>()

const emit = defineEmits<InteractionComponentEmits>()

const { play } = useAudioClip()

/** 左 id → 右 id。一个节点只能有一条线 */
const links = ref<Record<string, string>>({})
const selectedLeft = ref<string | null>(null)
const wrongLeftIds = ref<string[]>([])
/** 判定中：先暂停输入，等错线擦掉再放开 */
const judging = ref(false)
const done = ref(false)

const stageRef = useTemplateRef<HTMLElement>('stage')
/** 节点元素按「边:id」存放，测量锚点时用 */
const nodeEls = new Map<string, HTMLElement>()
const anchors = ref<Record<string, { x: number, y: number }>>({})
const stageOrigin = ref({ left: 0, top: 0 })
const stageSize = ref({ width: 0, height: 0 })

const nodeTone = toneVars('neutral')

const { dragging: draggingId, moved: dragMoved, point: dragPoint, start: startDrag } = usePointerDrag<string>({
  onDrop: (leftId, at) => {
    const rightId = findDropTarget(at, 'data-right-node')
    // 丢在空白处不算失败：孩子只是手滑了
    if (rightId)
      connect(leftId, rightId)
  },
})

let frame = 0
let timer: ReturnType<typeof setTimeout> | null = null
let observer: ResizeObserver | null = null
/** 最近一次指针按下的时间：用来区分「鼠标/手指」和「键盘回车」 */
let pointerAt = 0

interface Anchor {
  x: number
  y: number
}

interface ConnectLine {
  key: string
  from: Anchor
  to: Anchor
  correct: boolean
}

const answerMap = computed(() => new Map(payload.pairs))

const linkEntries = computed(() => Object.entries(links.value))

const lines = computed<ConnectLine[]>(() => {
  const result: ConnectLine[] = []
  for (const [leftId, rightId] of linkEntries.value) {
    const from = anchors.value[`left:${leftId}`]
    const to = anchors.value[`right:${rightId}`]
    if (from && to)
      result.push({ key: `${leftId}:${rightId}`, from, to, correct: isPair(leftId, rightId) })
  }
  return result
})

const matchedLeftIds = computed(() =>
  payload.left.filter(node => isPair(node.id, links.value[node.id] ?? '')).map(node => node.id),
)

const matchedRightIds = computed(() =>
  linkEntries.value
    .filter(([leftId, rightId]) => isPair(leftId, rightId))
    .map(([, rightId]) => rightId),
)

const viewBox = computed(() =>
  `0 0 ${Math.max(stageSize.value.width, 1)} ${Math.max(stageSize.value.height, 1)}`,
)

const hoverRightId = computed(() =>
  dragMoved.value && draggingId.value !== null
    ? findDropTarget(dragPoint.value, 'data-right-node')
    : null,
)

/** 拖拽时从起点到手指的虚线：让孩子看清线正跟着走 */
const dragLine = computed(() => {
  const leftId = draggingId.value
  if (!dragMoved.value || leftId === null)
    return null
  const from = anchors.value[`left:${leftId}`]
  if (!from)
    return null
  return {
    from,
    to: {
      x: dragPoint.value.x - stageOrigin.value.left,
      y: dragPoint.value.y - stageOrigin.value.top,
    },
  }
})

function isPair(leftId: string, rightId: string): boolean {
  return answerMap.value.get(leftId) === rightId
}

function setNodeRef(side: 'left' | 'right', id: string, el: Element | ComponentPublicInstance | null): void {
  const key = `${side}:${id}`
  if (el instanceof HTMLElement)
    nodeEls.set(key, el)
  else
    nodeEls.delete(key)
}

function measure(): void {
  const stage = stageRef.value
  if (!stage)
    return

  const box = stage.getBoundingClientRect()
  stageOrigin.value = { left: box.left, top: box.top }
  stageSize.value = { width: box.width, height: box.height }

  const next: Record<string, { x: number, y: number }> = {}
  for (const [key, el] of nodeEls) {
    const rect = el.getBoundingClientRect()
    // 左列从右边缘出发、右列从左边缘接入，线不会压在卡片上
    const isLeft = key.startsWith('left:')
    next[key] = {
      x: (isLeft ? rect.right : rect.left) - box.left,
      y: rect.top - box.top + rect.height / 2,
    }
  }
  anchors.value = next
}

function scheduleMeasure(): void {
  cancelAnimationFrame(frame)
  frame = requestAnimationFrame(measure)
}

/** 「汉字找朋友」里，点左节点首先是想听它念什么 —— 听音和选中一起发生 */
function playLeft(id: string): void {
  const node = payload.left.find(item => item.id === id)
  if (node?.audioClipId)
    play(node.audioClipId)
}

function selectLeft(id: string): void {
  if (disabled || done.value || judging.value)
    return
  playLeft(id)
  selectedLeft.value = selectedLeft.value === id ? null : id
}

function onLeftPointerDown(event: PointerEvent, id: string): void {
  if (disabled || done.value || judging.value)
    return
  pointerAt = Date.now()
  playLeft(id)
  selectedLeft.value = id
  startDrag(event, id)
}

function onLeftClick(id: string): void {
  // 指针路径已经选过了，这里只补键盘（回车 / 空格）
  if (Date.now() - pointerAt < 600)
    return
  selectLeft(id)
}

function onRightClick(id: string): void {
  const leftId = selectedLeft.value
  if (leftId === null)
    return
  connect(leftId, id)
}

function connect(leftId: string, rightId: string): void {
  if (disabled || done.value || judging.value)
    return

  const next: Record<string, string> = {}
  for (const [key, value] of linkEntries.value) {
    // 一个节点只留一条线：牵了新伙伴，旧线自动让位
    if (key !== leftId && value !== rightId)
      next[key] = value
  }
  next[leftId] = rightId

  links.value = next
  selectedLeft.value = null
  wrongLeftIds.value = wrongLeftIds.value.filter(id => id !== leftId)
  judge()
}

function judge(): void {
  // 每个左节点都牵上了才判，中途不打扰孩子
  if (linkEntries.value.length < payload.left.length)
    return

  const wrong = linkEntries.value
    .filter(([leftId, rightId]) => !isPair(leftId, rightId))
    .map(([leftId]) => leftId)

  if (wrong.length === 0) {
    done.value = true
    emit('solved', linkEntries.value.map(([leftId, rightId]) => [leftId, rightId]))
    return
  }

  wrongLeftIds.value = wrong
  emit('missed', '有两条线牵错了，看看它们真的是好朋友吗？')
  judging.value = true

  timer = setTimeout(() => {
    const kept: Record<string, string> = {}
    for (const [leftId, rightId] of linkEntries.value) {
      // 只收回连错的线，已经连对的留着
      if (!wrong.includes(leftId))
        kept[leftId] = rightId
    }
    links.value = kept
    wrongLeftIds.value = []
    judging.value = false
  }, 900)
}

onMounted(() => {
  measure()
  const stage = stageRef.value
  if (stage && typeof ResizeObserver !== 'undefined') {
    // 窗口尺寸、字体加载都会改变卡片位置，交给 ResizeObserver 重算锚点
    observer = new ResizeObserver(scheduleMeasure)
    observer.observe(stage)
  }
})

onBeforeUnmount(() => {
  observer?.disconnect()
  cancelAnimationFrame(frame)
  if (timer)
    clearTimeout(timer)
})
</script>

<template>
  <div ref="stage" class="relative">
    <svg
      class="pointer-events-none absolute inset-0 size-full"
      :viewBox="viewBox"
      aria-hidden="true"
    >
      <line
        v-for="line in lines"
        :key="line.key"
        :x1="line.from.x"
        :y1="line.from.y"
        :x2="line.to.x"
        :y2="line.to.y"
        :stroke="line.correct ? 'var(--color-success)' : 'var(--color-gently)'"
        stroke-width="6"
        stroke-linecap="round"
      />
      <line
        v-if="dragLine"
        :x1="dragLine.from.x"
        :y1="dragLine.from.y"
        :x2="dragLine.to.x"
        :y2="dragLine.to.y"
        stroke="var(--color-star)"
        stroke-width="6"
        stroke-linecap="round"
        stroke-dasharray="10 10"
      />
    </svg>

    <div class="relative grid grid-cols-2 gap-x-12 gap-y-3 sm:gap-x-24">
      <div class="flex flex-col justify-around gap-3">
        <button
          v-for="node in payload.left"
          :key="node.id"
          :ref="el => setNodeRef('left', node.id, el)"
          type="button"
          :disabled="disabled"
          :aria-label="`左边：${node.label}`"
          :aria-pressed="selectedLeft === node.id"
          :class="cn(
            'fx-pressable flex min-h-14 items-center gap-2 rounded-tile border-2 border-[var(--tone-line)] bg-surface px-3 py-2 text-left shadow-sticker disabled:cursor-default',
            matchedLeftIds.includes(node.id) && 'border-success bg-success-soft',
            wrongLeftIds.includes(node.id) && 'fx-gently border-gently bg-gently-soft',
            selectedLeft === node.id && 'border-star bg-star-soft shadow-glow',
            dragMoved && draggingId === node.id && 'fx-dragging pointer-events-none',
          )"
          :style="nodeTone"
          @pointerdown="onLeftPointerDown($event, node.id)"
          @click="onLeftClick(node.id)"
        >
          <KVisual :icon="node.icon" :emoji="node.emoji" size="md" />
          <span class="font-display text-base leading-tight text-[var(--tone-deep)]">{{ node.label }}</span>
        </button>
      </div>

      <div class="flex flex-col justify-around gap-3">
        <button
          v-for="node in payload.right"
          :key="node.id"
          :ref="el => setNodeRef('right', node.id, el)"
          type="button"
          :disabled="disabled"
          :data-right-node="node.id"
          :aria-label="`右边：${node.label}`"
          :class="cn(
            'fx-pressable flex min-h-14 items-center gap-2 rounded-tile border-2 border-[var(--tone-line)] bg-surface px-3 py-2 text-left shadow-sticker disabled:cursor-default',
            matchedRightIds.includes(node.id) && 'border-success bg-success-soft',
            hoverRightId === node.id && 'fx-drop-active',
          )"
          :style="nodeTone"
          @click="onRightClick(node.id)"
        >
          <KVisual :icon="node.icon" :emoji="node.emoji" size="md" />
          <span class="font-display text-base leading-tight text-[var(--tone-deep)]">{{ node.label }}</span>
        </button>
      </div>
    </div>
  </div>
</template>
