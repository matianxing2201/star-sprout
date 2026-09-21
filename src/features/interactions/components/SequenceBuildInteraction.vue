<script setup lang="ts">
import type { InteractionComponentEmits } from '../contract'

import type { ProgramBlock, SequenceBuildPayload } from '@/domain'
import type { AppIconName } from '@/domain'
import { computed, ref, watch } from 'vue'
import { toneVars } from '@/domain'
import { cn } from '@/shared/utils'

import { KButton, KIcon, KVisual } from '@/ui'
import { findDropTarget, usePointerDrag } from '../usePointerDrag'

/**
 * 搭指令：把积木按顺序放进程序条，再让角色出发。
 * 判对规则：程序里的积木 id 与 solution 的数量和顺序完全一致才算通过；
 * 排错不清空程序 —— 改一块就能再跑一次，调试本身就是编程思维的一部分。
 */
const { payload, disabled = false } = defineProps<{
  payload: SequenceBuildPayload
  disabled?: boolean
}>()

const emit = defineEmits<InteractionComponentEmits>()

/**
 * 内容侧没写角色或目标时给一个通用形象，舞台不至于空着。
 * 两个常量都标注同一个类型，模板里就不必为 `payload.actor ?? ACTOR_FALLBACK`
 * 的联合类型做特判。
 */
const ACTOR_FALLBACK: { emoji?: string, icon?: AppIconName, label: string } = { emoji: '🤖', label: '小机器人' }
const TARGET_FALLBACK: { emoji?: string, icon?: AppIconName, label: string } = { emoji: '🏁', label: '终点' }

const program = ref<ProgramBlock[]>([])
const running = ref(false)
const hoverSlot = ref<number | null>(null)

const actor = computed(() => payload.actor ?? ACTOR_FALLBACK)
const target = computed(() => payload.target ?? TARGET_FALLBACK)
const runLabel = computed(() => (payload.actor ? `让${payload.actor.label}出发！` : '出发！'))

/** 拖拽松手后浏览器可能补发一次 click，这一次要忽略，免得同一块积木被放两次 */
let justDropped = false

const { dragging, point, moved, start } = usePointerDrag<string>({
  onDrop: (blockId, dropPoint) => {
    justDropped = true
    setTimeout(() => {
      justDropped = false
    }, 0)
    hoverSlot.value = null

    const slot = findDropTarget(dropPoint, 'data-slot-index')
    // 丢在空白处什么也不发生 —— 手滑不该被当成失败
    if (slot === null)
      return

    insertBlock(blockId, Number.parseInt(slot, 10))
  },
})

// 拖动过程中指出积木会落在哪一格，孩子不用猜
watch(point, (next) => {
  if (!moved.value) {
    hoverSlot.value = null
    return
  }

  const slot = findDropTarget(next, 'data-slot-index')
  hoverSlot.value = slot === null ? null : Number.parseInt(slot, 10)
})

function usedCount(blockId: string): number {
  return program.value.filter(block => block.id === blockId).length
}

function isExhausted(block: ProgramBlock): boolean {
  return block.limit !== undefined && usedCount(block.id) >= block.limit
}

function insertBlock(blockId: string, index: number): void {
  if (disabled)
    return

  const block = payload.palette.find(item => item.id === blockId)
  if (!block || isExhausted(block))
    return

  const at = Math.min(Math.max(index, 0), program.value.length)
  program.value.splice(at, 0, block)
}

/** 触摸屏与键盘的路径：点一下积木就接到程序末尾，不用按住拖 */
function appendBlock(blockId: string): void {
  if (justDropped)
    return

  insertBlock(blockId, program.value.length)
}

function removeAt(index: number): void {
  if (disabled)
    return

  program.value.splice(index, 1)
}

function clearProgram(): void {
  if (disabled)
    return

  program.value = []
}

function run(): void {
  if (disabled || running.value || program.value.length === 0)
    return

  const ids = program.value.map(block => block.id)
  const isRight = ids.length === payload.solution.length
    && ids.every((id, index) => id === payload.solution[index])

  if (!isRight) {
    emit('missed', '差一点点，再看看每一步的先后。')
    return
  }

  // 先让角色真的走一趟，再报完成 —— 600ms 内结束，不拖沓
  running.value = true
  setTimeout(() => {
    running.value = false
    emit('solved', ids)
  }, 600)
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <!-- 舞台：角色在左，目标在右，中间一条虚线路径 -->
    <div
      class="rounded-tile border-2 border-[var(--tone-line)] bg-surface p-4 shadow-sticker"
      :style="toneVars('code')"
    >
      <div class="relative h-24">
        <div class="absolute top-1/2 right-0 flex -translate-y-1/2 flex-col items-center gap-1">
          <KVisual :icon="target.icon" :emoji="target.emoji" size="xl" />
          <span class="font-body text-xs text-ink-soft">{{ target.label }}</span>
        </div>
        <div class="absolute inset-x-12 top-1/2 border-t-2 border-dashed border-[var(--tone-line)]" aria-hidden="true" />
        <!--
          角色沿轨道走过去。外层撑满轨道宽度，位移由内层的 translateX 承担：
          这样 100% 指的就是轨道宽度，而动的只有 transform。
          原来动的是 `left`（布局属性）+ `transition-all` + 600ms ——
          布局动画会触发重排，而且时长超出了动效预算（见 design-contract.spec.ts）。
        -->
        <div class="absolute inset-x-0 top-1/2 -translate-y-1/2" aria-hidden="true">
          <div
            class="transition-transform duration-settle ease-soft"
            :style="{ transform: running ? 'translateX(calc(100% - 3.5rem))' : 'translateX(0.25rem)' }"
          >
            <KVisual :icon="actor.icon" :emoji="actor.emoji" size="xl" />
          </div>
        </div>
      </div>
      <p class="text-center font-body text-sm text-ink-soft">
        目标：{{ payload.goal }}
      </p>
    </div>

    <!-- 程序条：按顺序排列，点已放好的积木可以拿下来 -->
    <div class="flex flex-col gap-2 rounded-tile border-2 border-[var(--tone-line)] bg-surface-muted p-3">
      <div class="flex items-center justify-between">
        <span class="font-body text-xs text-ink-faint">程序</span>
        <button
          v-if="program.length > 0"
          type="button"
          :disabled="disabled"
          aria-label="清空程序，重新搭一次"
          class="rounded-chip px-2 py-1 font-body text-xs text-ink-soft"
          @click="clearProgram"
        >
          全部拿掉
        </button>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <button
          v-for="(block, index) in program"
          :key="`${index}-${block.id}`"
          :data-slot-index="index"
          type="button"
          :disabled="disabled"
          :aria-label="`第 ${index + 1} 步：${block.label}，点一下拿掉`"
          :class="cn(
            'flex items-center gap-1.5 rounded-chip border-2 border-[var(--tone-line)] bg-[var(--tone-soft)] px-3 py-2 font-display text-sm text-[var(--tone-deep)] shadow-press',
            hoverSlot === index && 'fx-drop-active',
          )"
          @click="removeAt(index)"
        >
          <KVisual :icon="block.icon" :emoji="block.emoji" size="sm" />
          <span class="font-numeric text-xs text-ink-faint">{{ index + 1 }}</span>
          <span>{{ block.label }}</span>
        </button>

        <div
          v-if="!disabled"
          :data-slot-index="program.length"
          class="grid h-11 w-16 place-items-center rounded-chip border-2 border-dashed border-[var(--tone-line)] text-ink-faint"
          :class="hoverSlot === program.length && 'fx-drop-active'"
          aria-hidden="true"
        >
          <KIcon name="plus" size="md" />
        </div>
      </div>
    </div>

    <!-- 积木盘：拖进程序条，或者点一下接到末尾 -->
    <div class="flex flex-wrap gap-2">
      <button
        v-for="block in payload.palette"
        :key="block.id"
        type="button"
        :disabled="disabled || isExhausted(block)"
        :aria-label="`放入积木 ${block.label}`"
        :class="cn(
          'fx-pressable flex touch-none items-center gap-1.5 rounded-chip border-2 border-[var(--tone-line)] bg-[var(--tone-soft)] px-3 py-2 font-display text-sm text-[var(--tone-deep)] shadow-sticker',
          'disabled:cursor-default disabled:opacity-45',
          dragging === block.id && 'fx-dragging pointer-events-none',
        )"
        @pointerdown="start($event, block.id)"
        @click="appendBlock(block.id)"
      >
        <KVisual :icon="block.icon" :emoji="block.emoji" size="sm" />
        <span>{{ block.label }}</span>
        <span v-if="block.limit !== undefined" class="font-numeric text-xs text-ink-faint">
          ×{{ block.limit - usedCount(block.id) }}
        </span>
      </button>
    </div>

    <KButton
      variant="primary"
      size="lg"
      block
      tone="code"
      :disabled="disabled || running || program.length === 0"
      @click="run"
    >
      {{ runLabel }}
    </KButton>
  </div>
</template>
