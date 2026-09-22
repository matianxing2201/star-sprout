<script setup lang="ts">
import type { InteractionComponentEmits } from '../contract'

import type { NumberTilePayload } from '@/domain'
import { computed, ref, watch } from 'vue'
import { toneVars } from '@/domain'
import { cn } from '@/shared/utils'

import { KButton } from '@/ui'
import { findDropTarget, usePointerDrag } from '../usePointerDrag'

import SevenSegmentDigit from './SevenSegmentDigit.vue'

/**
 * 填数字：按条件把数字贴进方格
 * ============================
 *
 * 这道题的样子来自练习册里那种「阿米巴画了 8 个数字，遮住了几个」。
 * 所以数字不是用字库打的，而是**七段数码管**一段段拼出来的：
 *
 *        ⓪
 *      ⑤  ①
 *        ⑥
 *      ④  ②
 *        ③
 *
 * 好处是「遮住」变成了一件自然的事 —— 数据里只列露出来的段
 * （`NumberSlot.visibleStrokes`），没列的就不画。孩子看到的残缺笔画
 * 和纸面上一样，而这层信息是内容侧写的，组件不需要认识任何数字。
 *
 * 两条交互上的考虑
 * --------------
 * 1. **拖和点都行**。中班孩子手指还不稳，长按拖动容易滑。所以
 *    先点数字块选中、再点格子放进去，这条路是通的，而且更快。
 * 2. **不做逐格即时判对**。8 个格子是互相牵制的（数字不能重复），
 *    填到第 3 个就说错会打断推理。孩子按「看看对不对」自己决定什么时候验。
 */

const { payload, disabled = false } = defineProps<{
  payload: NumberTilePayload
  disabled?: boolean
}>()

const emit = defineEmits<InteractionComponentEmits>()

/** slotId → 放进去的数字 */
const filled = ref<Record<string, number>>({})
/** 手上正拿着的数字块（数字本身，因为每个数字只有一块） */
const picked = ref<number | null>(null)
const hoveredSlotId = ref<string | null>(null)
/** 还没填对的格子，答错后轻轻晃一下 */
const gentleIds = ref<string[]>([])

/** 松手后紧跟的那次 click 不应再当成「点选」，否则一次拖动会顺带换一次选择 */
let justDragged = false

const drag = usePointerDrag<number>({
  onDrop: (tile, point) => {
    justDragged = true
    setTimeout(() => {
      justDragged = false
    }, 0)

    const slotId = findDropTarget(point, 'data-number-slot')
    // 丢在格子外面：什么都不发生，手滑不算失败
    if (slotId === null)
      return

    place(tile, slotId)
  },
})

// 拖动时高亮指针下面的格子，孩子才知道会放进哪里
watch([drag.point, drag.moved], ([point, moved]) => {
  hoveredSlotId.value = moved ? findDropTarget(point, 'data-number-slot') : null
})

/** 数字块打乱显示 —— 顺着的 1~9 会把「该填哪一格」直接说出去 */
const tiles = computed(() => shuffle(payload.tiles))

/** 已经放进格子的数字不再出现在托盘里 */
const trayTiles = computed(() => {
  const used = new Set(Object.values(filled.value))
  return tiles.value.filter(tile => !used.has(tile))
})

const allFilled = computed(() => Object.keys(filled.value).length === payload.slots.length)

function shuffle(list: number[]): number[] {
  const result = [...list]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j]!, result[i]!]
  }
  return result
}

function tileIn(slotId: string): number | undefined {
  return filled.value[slotId]
}

function isDragging(tile: number): boolean {
  return drag.dragging.value === tile
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

const ghostTile = computed(() => drag.dragging.value)

const ghostStyle = computed(() => ({
  left: `${drag.point.value.x}px`,
  top: `${drag.point.value.y}px`,
}))

/** 同一个数字只能在一个格子里：放下去时先把它从原位置摘掉 */
function place(tile: number, slotId: string): void {
  const next: Record<string, number> = {}
  for (const [key, value] of Object.entries(filled.value)) {
    if (value !== tile)
      next[key] = value
  }
  next[slotId] = tile
  filled.value = next
  picked.value = null
}

/** 把格子里的数字拿回来（点已经填过的格子 = 反悔） */
function clearSlot(slotId: string): void {
  if (disabled)
    return

  const { [slotId]: _removed, ...rest } = filled.value
  filled.value = rest
  picked.value = null
}

function selectTile(tile: number): void {
  if (disabled || justDragged)
    return
  picked.value = picked.value === tile ? null : tile
}

function dropIntoSlot(slotId: string): void {
  if (disabled || justDragged)
    return

  // 手上没拿数字时点格子 = 把这一格拿空，孩子不用找「清除」按钮
  if (picked.value === null) {
    if (filled.value[slotId] !== undefined)
      clearSlot(slotId)
    return
  }

  place(picked.value, slotId)
}

function check(): void {
  if (disabled)
    return

  const wrong = payload.slots.filter(slot => filled.value[slot.id] !== slot.answer)

  if (wrong.length === 0) {
    emit('solved', { ...filled.value })
    return
  }

  gentleIds.value = wrong.map(slot => slot.id)
  // 优先报「这一格自己的条件」，比笼统的「再试试」更有方向；
  // 内容里没写 rule 就退回一句通用的，不替孩子说出答案
  emit('missed', wrong[0]?.rule ?? '再对着条件数一数')
  setTimeout(() => {
    gentleIds.value = []
  }, 640)
}
</script>

<template>
  <div class="flex flex-col gap-5">
    <!-- 题面条件：摆在这里，孩子推理时可以一直回头看 -->
    <ul class="flex flex-col gap-1.5 rounded-tile border-2 border-line bg-paper-deep/60 p-3" :style="toneVars('math')">
      <li
        v-for="(clue, index) in payload.clues"
        :key="index"
        class="flex items-start gap-2 font-body text-sm leading-relaxed text-ink-soft"
      >
        <span class="mt-1.5 size-1.5 shrink-0 rounded-full bg-[var(--tone)]" aria-hidden="true" />
        {{ clue }}
      </li>
    </ul>

    <!-- 八个格子 -->
    <ol class="flex flex-wrap justify-center gap-2 sm:gap-3">
      <li v-for="slot in payload.slots" :key="slot.id">
        <button
          type="button"
          :data-number-slot="slot.id"
          :disabled="disabled"
          :aria-label="`第 ${payload.slots.indexOf(slot) + 1} 格`"
          :class="cn(
            'relative flex size-16 flex-col items-center justify-center rounded-tile border-2 border-[var(--tone-line)] bg-surface shadow-press transition-colors sm:size-20',
            'disabled:cursor-default',
            hoveredSlotId === slot.id && 'fx-drop-active',
            gentleIds.includes(slot.id) && 'fx-gently border-gently bg-gently-soft',
          )"
          :style="toneVars('math')"
          @click="dropIntoSlot(slot.id)"
        >
          <!-- 已经填进去的数字：正常画，笔画是齐的 -->
          <SevenSegmentDigit
            v-if="tileIn(slot.id) !== undefined"
            :value="tileIn(slot.id)!"
          />
          <!-- 还没填：露出题面给的那几笔，孩子靠它猜 -->
          <SevenSegmentDigit
            v-else
            :value="slot.answer"
            :visible-strokes="slot.visibleStrokes"
            muted
          />
        </button>
      </li>
    </ol>

    <!-- 数字块托盘 -->
    <div class="rounded-tile border-2 border-line bg-paper-deep/60 p-3">
      <div class="flex flex-wrap items-center justify-center gap-2">
        <button
          v-for="tile in trayTiles"
          :key="tile"
          type="button"
          :disabled="disabled"
          :aria-label="`数字 ${tile}`"
          :aria-pressed="picked === tile"
          :class="cn(
            'fx-pressable flex size-14 touch-none items-center justify-center rounded-tile border-2 border-[var(--tone-line)] bg-surface shadow-sticker sm:size-16',
            'disabled:cursor-default',
            picked === tile && 'fx-picked',
            isDragging(tile) && 'fx-dragging pointer-events-none',
          )"
          :style="[toneVars('think'), pickedStyle(picked === tile)]"
          @pointerdown="drag.start($event, tile)"
          @click="selectTile(tile)"
        >
          <SevenSegmentDigit :value="tile" />
        </button>

        <span v-if="trayTiles.length === 0" class="font-body text-xs text-ink-faint">
          数字都贴上啦
        </span>
      </div>
    </div>

    <!-- 跟着手指的那块，手指会盖住它，所以往上抬一点 -->
    <span
      v-if="ghostTile !== null"
      class="pointer-events-none fixed z-50 flex size-14 -translate-x-1/2 -translate-y-[140%] items-center justify-center rounded-tile border-2 border-[var(--tone-line)] bg-surface shadow-lift"
      :style="[ghostStyle, toneVars('think')]"
      aria-hidden="true"
    >
      <SevenSegmentDigit :value="ghostTile" />
    </span>

    <KButton
      variant="primary"
      size="lg"
      block
      tone="math"
      :disabled="disabled || !allFilled"
      @click="check"
    >
      {{ allFilled ? '看看对不对' : `还有 ${payload.slots.length - Object.keys(filled).length} 格没贴` }}
    </KButton>
  </div>
</template>
