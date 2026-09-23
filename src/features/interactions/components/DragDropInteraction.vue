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
 *
 * 按 `docs/interaction-motion-standard.md` 重做的样板之二：
 *
 *   1. 操作中有反馈 ✅ **磁力吸附**：拖近一个「能收它」的框就被吸进框心
 *      （只有接受它的框才吸引 —— 不接受的框不会吸，孩子仍然可以把卡片放到那儿犯错）。
 *   2. 角色有反应 ✅ 检查没过时那句「XX 该回哪个家呢」本来就是**具体的**，由外壳播报。
 *   3. 累积看得见 ✅ 走表演通道报 `已放置 N / M`。
 *   4. 答错是方向 ✅ 点名具体卡片，不喊「再试试」。
 *   5. 至少两拍 ✅ 拖起 → 吸附/落位 → 检查 → 判定。
 *
 * 放错时用**轻轻弹起**代替左右摇晃：卡片已经被放在框里了，
 * 摇晃像是「你放错了」在晃它，弹一下更像「我还没进去」。
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

const SNAP_RADIUS = 48
const zoneRects = ref<{ id: string, cx: number, cy: number, left: number, top: number, width: number, height: number }[]>([])
const snapOffset = ref({ x: 0, y: 0 })
const snapped = ref(false)

/** 松手后紧跟的那次 click 不应再当成“点选”，否则一次拖动会顺带换一次选择 */
let justDragged = false

const drag = usePointerDrag<string>({
  onDrop: (itemId, point) => {
    justDragged = true
    setTimeout(() => {
      justDragged = false
    }, 0)

    // 被吸住时按吸住之后的点找目标：孩子看见卡片落在框心，结果就必须是那个框。
    // 用原始指针点去判，会出现「画面上在框里、判定却说没放进去」这种鬼问题。
    const effective = snapped.value
      ? { x: point.x + snapOffset.value.x, y: point.y + snapOffset.value.y }
      : point
    const zoneId = findDropTarget(effective, 'data-drop-zone')
    // 丢在框外面：什么都不发生
    if (zoneId === null)
      return

    place(itemId, zoneId)
  },
})

/**
 * 磁力吸附。
 *
 * 两件事分开做，因为它们要的性能特性相反：
 *   - 外层跟手：每帧更新 left/top，**不加过渡**（加了会整段拖泥带水）
 *   - 内层被吸：transform 加 160ms 过渡，所以「吸住」是**缓动进去**的，不是跳进去
 *
 * 框的位置只在拖动开始时量一次 —— 拖动中每帧读 getBoundingClientRect 会强制回流，
 * 在低端安卓平板上这就是掉帧。
 */
/** 拖动开始：只量「能收这张卡」的框 —— 不接受的框不吸引 */
watch(() => drag.dragging.value, (itemId) => {
  if (itemId === null) {
    zoneRects.value = []
    snapOffset.value = { x: 0, y: 0 }
    snapped.value = false
    return
  }

  zoneRects.value = [...document.querySelectorAll<HTMLElement>('[data-drop-zone]')]
    .map((el) => {
      const rect = el.getBoundingClientRect()
      return {
        id: el.dataset.dropZone ?? '',
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
        cx: rect.left + rect.width / 2,
        cy: rect.top + rect.height / 2,
      }
    })
    .filter(zone => accepts(zone.id, itemId))
})

/** 点到矩形的距离：在矩形里算 0 */
function distanceToZone(point: { x: number, y: number }, zone: { left: number, top: number, width: number, height: number }): number {
  const dx = Math.max(zone.left - point.x, 0, point.x - (zone.left + zone.width))
  const dy = Math.max(zone.top - point.y, 0, point.y - (zone.top + zone.height))
  return Math.hypot(dx, dy)
}

/** 拖动过程中：算吸哪个框，并高亮指针下的框 */
watch([drag.point, drag.moved], ([point, moved]) => {
  if (!moved) {
    hoveredZoneId.value = null
    snapOffset.value = { x: 0, y: 0 }
    snapped.value = false
    return
  }

  let nearest: (typeof zoneRects.value)[number] | undefined
  let nearestDistance = SNAP_RADIUS

  for (const zone of zoneRects.value) {
    const distance = distanceToZone(point, zone)
    if (distance < nearestDistance) {
      nearest = zone
      nearestDistance = distance
    }
  }

  snapped.value = nearest !== undefined
  snapOffset.value = nearest
    ? { x: nearest.cx - point.x, y: nearest.cy - point.y }
    : { x: 0, y: 0 }

  const effective = nearest ? { x: nearest.cx, y: nearest.cy } : point
  hoveredZoneId.value = findDropTarget(effective, 'data-drop-zone')
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

/**
 * 幽灵内层的 transform。
 * 平时不吸：只做「把卡片放到指针上方」那个居中位移；
 * 吸住时：先把居中方式改成落在框心，再加吸附偏移 —— 两者都是同一个 transform，
 * 所以内层的过渡能把「被吸进去」这一下连着做出来。
 */
const ghostInnerStyle = computed(() => ({
  transform: snapped.value
    ? `translate(-50%, -50%) translate(${snapOffset.value.x}px, ${snapOffset.value.y}px)`
    : `translate(-50%, -140%) translate(${snapOffset.value.x}px, ${snapOffset.value.y}px)`,
}))

/**
 * 累积可见（规范第四节第 3 条）：每次摆放/拿走都报告进度。
 * 报的是**已放置**而不是**已放对** —— 报后者等于把答案泄给界面。
 */
watch(placement, () => {
  const placed = Object.values(placement.value).flat().length
  emit('perform', { progress: { done: placed, total: payload.items.length } })
})

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
  // 同时走表演通道给一句**具体**的观察，让角色说的是刚发生的事
  emit('perform', { character: { mood: 'curious', line: `${wrong.length} 张卡还没找到家` } })
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
              gentleIds.includes(item.id) && 'dd-bounce border-gently bg-gently-soft',
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
            gentleIds.includes(item.id) && 'dd-bounce border-gently bg-gently-soft',
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

    <!-- 外层只跟手（left/top，无过渡）；内层负责居中与吸附（transform，有过渡） -->
    <div
      v-if="ghostItem"
      class="pointer-events-none fixed z-50"
      :style="ghostStyle"
      aria-hidden="true"
    >
      <span
        class="dd-ghost-inner flex items-center gap-1.5 rounded-chip border-2 border-[var(--tone-line)] bg-surface px-3 py-2 shadow-lift"
        :style="[ghostInnerStyle, toneVars(ghostItem.tone ?? 'neutral')]"
      >
        <KVisual :icon="ghostItem.icon" :emoji="ghostItem.emoji" size="sm" />
        <span class="font-display text-sm text-[var(--tone-deep)]">{{ ghostItem.label }}</span>
      </span>
    </div>

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

<style scoped>
/*
  磁力吸附的内层：**只有它带过渡**。
  外层是跟手的，每帧改 left/top，一旦也加过渡，整段拖拽会变成「慢半拍地追手」。
  居中的位移也写在这里（不在类名里），否则内联 transform 会把它整个覆盖掉。
*/
.dd-ghost-inner {
  transition: transform var(--duration-quick) var(--ease-soft);
}

/*
  放错时轻轻弹一下，代替左右摇晃：
  卡片已经被放进框里了，左右摇像是「你放错了」在晃它 ——
  上下弹一下更接近「我还没进去」，而且只弹被点名的那几张，其余一律不动。
*/
.dd-bounce {
  animation: dd-bounce var(--duration-base) var(--ease-soft) both;
}

@keyframes dd-bounce {
  0% {
    transform: translateY(0);
  }

  45% {
    transform: translateY(-10px) scale(1.04);
  }

  100% {
    transform: translateY(0);
  }
}
</style>
