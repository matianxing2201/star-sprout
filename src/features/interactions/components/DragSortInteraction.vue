<script setup lang="ts">
import type { InteractionComponentEmits } from '../contract'

import type { DragSortPayload } from '@/domain'
import { computed, ref } from 'vue'
import { cn } from '@/shared/utils'

import { KButton, KIcon, KVisual } from '@/ui'
import { findDropTarget, usePointerDrag } from '../usePointerDrag'

/**
 * 排一排：把顺序调对。
 * 两种操作方式等价 —— 拖动（鼠标/手指）把卡片放到某个位置，或者点一张再点另一张交换两张。
 * 判对标准：当前 id 顺序与 correctOrder 完全一致；判错时保留孩子自己排的顺序，重排不是惩罚。
 */
const { payload, disabled = false } = defineProps<{
  payload: DragSortPayload
  disabled?: boolean
}>()

const emit = defineEmits<InteractionComponentEmits>()

const order = ref<string[]>([...payload.items.map(item => item.id)])
const pickedId = ref<string | null>(null)
const shaking = ref(false)

/** 松手后紧跟的那次 click 不应再当成“点选”，否则一次拖动会顺带换两次位置 */
let justDragged = false

const drag = usePointerDrag<string>({
  onDrop: (id, point) => {
    justDragged = true
    setTimeout(() => {
      justDragged = false
    }, 0)

    const index = findDropTarget(point, 'data-sort-index')
    // 丢在空白处：保持原样，不算失败
    if (index === null)
      return

    moveTo(id, Number.parseInt(index, 10))
  },
})

/** 按当前顺序把 id 还原成可渲染的卡片 */
const orderedItems = computed(() =>
  payload.items
    .filter(item => order.value.includes(item.id))
    .sort((a, b) => order.value.indexOf(a.id) - order.value.indexOf(b.id)),
)

function isDragging(id: string): boolean {
  return drag.dragging.value === id
}

/** 手指会盖住卡片，所以被拖动的那张另外浮在指针上方一点点 */
const ghostItem = computed(() => orderedItems.value.find(item => item.id === drag.dragging.value))

const ghostStyle = computed(() => ({
  left: `${drag.point.value.x}px`,
  top: `${drag.point.value.y}px`,
}))

function moveTo(id: string, targetIndex: number): void {
  const from = order.value.indexOf(id)
  if (from < 0)
    return

  const next = [...order.value]
  next.splice(from, 1)
  next.splice(Math.min(Math.max(targetIndex, 0), next.length), 0, id)
  order.value = next
}

/** 点选两步交换：触摸屏与键盘都走这条路，不需要按住拖动 */
function tapItem(id: string): void {
  if (disabled || justDragged)
    return

  const picked = pickedId.value
  if (picked === null || picked === id) {
    pickedId.value = picked === id ? null : id
    return
  }

  const from = order.value.indexOf(picked)
  const to = order.value.indexOf(id)
  if (from >= 0 && to >= 0) {
    const next = [...order.value]
    next[from] = id
    next[to] = picked
    order.value = next
  }
  pickedId.value = null
}

function check(): void {
  if (disabled)
    return

  const current = [...order.value]
  const expected = payload.correctOrder
  const isRight = current.length === expected.length && current.every((id, index) => id === expected[index])

  if (isRight) {
    emit('solved', current)
    return
  }

  // 判错不动孩子的排列，只让画面轻轻抖一下
  shaking.value = true
  emit('missed')
  setTimeout(() => {
    shaking.value = false
  }, 640)
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <p
      v-if="payload.axisHint"
      class="text-center font-body text-sm tracking-wide text-ink-soft"
    >
      {{ payload.axisHint }}
    </p>

    <div :class="cn('flex flex-col gap-3', shaking && 'fx-gently')">
      <button
        v-for="(item, index) in orderedItems"
        :key="item.id"
        :data-sort-index="index"
        type="button"
        :disabled="disabled"
        :aria-label="item.label"
        :aria-pressed="pickedId === item.id"
        :class="cn(
          'fx-pressable flex w-full touch-none items-center gap-3 rounded-tile border-2 border-[var(--tone-line)] bg-surface px-4 py-3 text-left shadow-sticker',
          'disabled:cursor-default',
          pickedId === item.id && 'border-[var(--tone)] bg-[var(--tone-soft)]',
          isDragging(item.id) && 'fx-dragging pointer-events-none',
        )"
        @pointerdown="drag.start($event, item.id)"
        @click="tapItem(item.id)"
      >
        <KVisual :icon="item.icon" :emoji="item.emoji" size="md" />
        <span class="font-display text-lg text-ink">{{ item.label }}</span>
        <span class="ml-auto text-ink-faint" aria-hidden="true">
          <KIcon name="drag-handle" size="md" />
        </span>
      </button>
    </div>

    <span
      v-if="ghostItem"
      class="pointer-events-none fixed z-50 flex -translate-x-1/2 -translate-y-[140%] items-center gap-2 rounded-chip border-2 border-line-strong bg-surface px-3 py-2 shadow-lift"
      :style="ghostStyle"
      aria-hidden="true"
    >
      <KVisual :icon="ghostItem.icon" :emoji="ghostItem.emoji" size="md" />
      <span class="font-display text-base text-ink">{{ ghostItem.label }}</span>
    </span>

    <KButton
      variant="primary"
      size="lg"
      block
      tone="think"
      :disabled="disabled"
      @click="check"
    >
      排好了，看看对不对
    </KButton>
  </div>
</template>
