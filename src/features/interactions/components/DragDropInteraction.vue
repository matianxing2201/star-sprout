<script setup lang="ts">
import type { InteractionComponentEmits } from '../contract'

import type { DragDropPayload, DraggableItem } from '@/domain'
import { computed, ref, watch } from 'vue'
import { toneVars } from '@/domain'
import { cn } from '@/shared/utils'

import { KButton, KVisual } from '@/ui'
import { findDropTarget, usePointerDrag } from '../usePointerDrag'

/**
 * 拖一拖：把卡片放进对应的框里。
 * 一个框可以放很多张（accepts 就是这个框期望收到的全部 item id），框与框之间随时可以搬。
 * 判对标准：每张卡片都在 accepts 包含它的框里，而且没有卡片留在托盘。
 * 丢在空白处什么也不发生 —— 手滑不算失败。
 */
const { payload, disabled = false } = defineProps<{
  payload: DragDropPayload
  disabled?: boolean
}>()

const emit = defineEmits<InteractionComponentEmits>()

/** zoneId → 这个框里的 item id（按放入顺序） */
const placement = ref<Record<string, string[]>>({})
const pickedId = ref<string | null>(null)
const hoveredZoneId = ref<string | null>(null)
const gentleIds = ref<string[]>([])

/** 松手后紧跟的那次 click 不应再当成“点选”，否则一次拖动会顺带换一次选择 */
let justDragged = false

const drag = usePointerDrag<string>({
  onDrop: (itemId, point) => {
    justDragged = true
    setTimeout(() => {
      justDragged = false
    }, 0)

    const zoneId = findDropTarget(point, 'data-drop-zone')
    // 丢在框外面：什么都不发生
    if (zoneId === null)
      return

    place(itemId, zoneId)
  },
})

// 拖动过程中高亮指针下面的框，孩子才知道会放进哪里
watch([drag.point, drag.moved], ([point, moved]) => {
  hoveredZoneId.value = moved ? findDropTarget(point, 'data-drop-zone') : null
})

const itemMap = computed(() => {
  const map = new Map<string, DraggableItem>()
  for (const item of payload.items)
    map.set(item.id, item)
  return map
})

const trayItems = computed(() => {
  const placed = new Set(Object.values(placement.value).flat())
  return payload.items.filter(item => !placed.has(item.id))
})

const zoneGridClass = computed(() => {
  const map: Record<number, string> = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-2 sm:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-4',
  }
  return map[payload.zones.length] ?? 'grid-cols-2'
})

const checkTone = computed(() => payload.zones[0]?.tone ?? 'think')

function itemsInZone(zoneId: string): DraggableItem[] {
  const list: DraggableItem[] = []
  for (const id of placement.value[zoneId] ?? []) {
    const item = itemMap.value.get(id)
    if (item)
      list.push(item)
  }
  return list
}

function zoneOf(itemId: string): string | null {
  for (const [zoneId, ids] of Object.entries(placement.value)) {
    if (ids.includes(itemId))
      return zoneId
  }
  return null
}

function accepts(zoneId: string, itemId: string): boolean {
  return payload.zones.find(zone => zone.id === zoneId)?.accepts.includes(itemId) ?? false
}

function isDragging(id: string): boolean {
  return drag.dragging.value === id
}

/**
 * 选中态的边框色。
 *
 * 为什么不直接写在 .fx-picked 里：那个类在 components 层，
 * 排在 Tailwind 的 utilities 之前 —— 用普通的 border-color 压不过
 * 组件上的 `border-[var(--tone-line)]`。这里把实色色调塞进变量，
 * 让 .fx-picked 去引用，就不用为这件事破例用 !important。
 */
function pickedStyle(isPicked: boolean) {
  return isPicked ? { '--tone-picked-line': 'var(--tone)' } : {}
}

/** 手指会盖住卡片，所以被拖动的那张另外浮在指针上方一点点 */
const ghostItem = computed(() => {
  const id = drag.dragging.value
  return id === null ? undefined : itemMap.value.get(id)
})

const ghostStyle = computed(() => ({
  left: `${drag.point.value.x}px`,
  top: `${drag.point.value.y}px`,
}))

/** 把一张卡片搬进某个框：先从原来的框里拿走，别的卡片一律不动 */
function place(itemId: string, zoneId: string): void {
  if (zoneOf(itemId) === zoneId)
    return

  const next: Record<string, string[]> = {}
  for (const [key, ids] of Object.entries(placement.value)) {
    const kept = ids.filter(id => id !== itemId)
    if (kept.length > 0)
      next[key] = kept
  }
  next[zoneId] = [...(next[zoneId] ?? []), itemId]
  placement.value = next
}

/** 点选：先点卡片选中，再点框放进去 —— 触摸屏与键盘都走这条路 */
function selectItem(itemId: string): void {
  if (disabled || justDragged)
    return

  const picked = pickedId.value
  if (picked === null || picked === itemId) {
    pickedId.value = picked === itemId ? null : itemId
    return
  }

  // 手上已经有卡片时点到别的卡片：理解成「放进它现在所在的框」，孩子不会卡住
  const zoneId = zoneOf(itemId)
  if (zoneId !== null) {
    place(picked, zoneId)
    pickedId.value = null
    return
  }

  pickedId.value = itemId
}

function dropIntoZone(zoneId: string): void {
  if (disabled || justDragged)
    return

  const picked = pickedId.value
  if (picked === null)
    return

  place(picked, zoneId)
  pickedId.value = null
}

function check(): void {
  if (disabled)
    return

  const wrong = payload.items.filter((item) => {
    const zoneId = zoneOf(item.id)
    return zoneId === null || !accepts(zoneId, item.id)
  })

  if (wrong.length === 0) {
    const answer: Record<string, string[]> = {}
    for (const zone of payload.zones)
      answer[zone.id] = placement.value[zone.id] ?? []
    emit('solved', answer)
    return
  }

  // 只轻轻标出还没放对的卡片，绝不替孩子搬动
  gentleIds.value = wrong.map(item => item.id)
  // 内容里没有写提示，就报一个具体的对象名，比笼统的“再试试”更有方向
  emit('missed', `${wrong[0]?.label ?? '它'}该回哪个家呢`)
  setTimeout(() => {
    gentleIds.value = []
  }, 640)
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div :class="cn('grid gap-3', zoneGridClass)">
      <div
        v-for="zone in payload.zones"
        :key="zone.id"
        :data-drop-zone="zone.id"
        :class="cn(
          'flex flex-col gap-2 rounded-tile border-2 border-dashed border-[var(--tone-line)] bg-[var(--tone-soft)]/50 p-3',
          hoveredZoneId === zone.id && 'fx-drop-active',
        )"
        :style="toneVars(zone.tone ?? 'neutral')"
      >
        <p class="flex items-center gap-2 font-display text-base leading-tight text-[var(--tone-deep)]">
          <KVisual :icon="zone.icon" :emoji="zone.emoji" size="md" />
          {{ zone.label }}
        </p>

        <div class="flex min-h-16 flex-wrap content-start items-start gap-2">
          <button
            v-for="item in itemsInZone(zone.id)"
            :key="item.id"
            type="button"
            :disabled="disabled"
            :aria-label="item.label"
            :aria-pressed="pickedId === item.id"
            :class="cn(
              'fx-pressable flex touch-none items-center gap-1.5 rounded-chip border-2 border-[var(--tone-line)] bg-surface px-3 py-2 shadow-press',
              'disabled:cursor-default',
              pickedId === item.id && 'fx-picked',
              gentleIds.includes(item.id) && 'fx-gently border-gently bg-gently-soft',
              isDragging(item.id) && 'fx-dragging pointer-events-none',
            )"
            :style="[toneVars(item.tone ?? 'neutral'), pickedStyle(pickedId === item.id)]"
            @pointerdown="drag.start($event, item.id)"
            @click="selectItem(item.id)"
          >
            <KVisual :icon="item.icon" :emoji="item.emoji" size="sm" />
            <span class="font-display text-sm text-[var(--tone-deep)]">{{ item.label }}</span>
          </button>

          <button
            type="button"
            :disabled="disabled"
            :aria-label="`把选中的卡片放进${zone.label}`"
            :class="cn(
              'flex flex-1 items-center justify-center rounded-chip border-2 border-dashed border-[var(--tone-line)] px-3 py-2 font-body text-xs text-ink-faint',
              'disabled:cursor-default',
            )"
            @click="dropIntoZone(zone.id)"
          >
            {{ pickedId ? '点这里放在这' : '拖到这里' }}
          </button>
        </div>
      </div>
    </div>

    <div class="rounded-tile border-2 border-line bg-paper-deep/60 p-3">
      <div class="flex flex-wrap items-center gap-2">
        <button
          v-for="item in trayItems"
          :key="item.id"
          type="button"
          :disabled="disabled"
          :aria-label="item.label"
          :aria-pressed="pickedId === item.id"
          :class="cn(
            'fx-pressable flex touch-none items-center gap-1.5 rounded-chip border-2 border-[var(--tone-line)] bg-surface px-3 py-2 shadow-sticker',
            'disabled:cursor-default',
            pickedId === item.id && 'fx-picked',
            gentleIds.includes(item.id) && 'fx-gently border-gently bg-gently-soft',
            isDragging(item.id) && 'fx-dragging pointer-events-none',
          )"
          :style="[toneVars(item.tone ?? 'neutral'), pickedStyle(pickedId === item.id)]"
          @pointerdown="drag.start($event, item.id)"
          @click="selectItem(item.id)"
        >
          <KVisual :icon="item.icon" :emoji="item.emoji" size="sm" />
          <span class="font-display text-sm text-[var(--tone-deep)]">{{ item.label }}</span>
        </button>

        <span v-if="trayItems.length === 0" class="font-body text-xs text-ink-faint">
          都放好啦
        </span>
      </div>
    </div>

    <span
      v-if="ghostItem"
      class="pointer-events-none fixed z-50 flex -translate-x-1/2 -translate-y-[140%] items-center gap-1.5 rounded-chip border-2 border-[var(--tone-line)] bg-surface px-3 py-2 shadow-lift"
      :style="[ghostStyle, toneVars(ghostItem.tone ?? 'neutral')]"
      aria-hidden="true"
    >
      <KVisual :icon="ghostItem.icon" :emoji="ghostItem.emoji" size="sm" />
      <span class="font-display text-sm text-[var(--tone-deep)]">{{ ghostItem.label }}</span>
    </span>

    <KButton
      variant="primary"
      size="lg"
      block
      :tone="checkTone"
      :disabled="disabled"
      @click="check"
    >
      看看对不对
    </KButton>
  </div>
</template>
