<script setup lang="ts">
import type { InteractionComponentEmits } from '../contract'

import type { ProgramBlock, SequenceBuildPayload } from '@/domain'
import type { AppIconName } from '@/domain'
import { computed, onBeforeUnmount, ref, watch } from 'vue'
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
/** 刚放进去的那一格：给它一个落位确认拍 */
const justInserted = ref<number | null>(null)
/** 执行到第几步（0 = 没在跑）。角色与积木都跟着它走 */
const activeStep = ref(0)
let stepTimer: ReturnType<typeof setTimeout> | undefined
let confirmTimer: ReturnType<typeof setTimeout> | undefined

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

/**
 * 角色走到第几步。
 * 起点是 0.25rem（静止位），每一步等分到 100% - 3.5rem（终点），
 * 所以 k=0 时正好等于静止位，不会在起跑那一瞬跳 2px。
 */
const actorStyle = computed(() => {
  if (!running.value)
    return 'translateX(0.25rem)'

  const total = Math.max(payload.solution.length, 1)
  const ratio = activeStep.value / total
  return `translateX(calc(0.25rem + (100% - 3.75rem) * ${ratio}))`
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
  justInserted.value = at
  if (confirmTimer)
    clearTimeout(confirmTimer)
  confirmTimer = setTimeout(() => {
    justInserted.value = null
  }, 320)
}

/**
 * 累积可见（规范第四节第 3 条）：每放一块就报一次进度。
 * 搭满时额外给角色一句**具体**的观察 —— 这时候该由它说「程序搭好了」，
 * 而不是等到最后由外壳说一句通用的「真棒」。
 */
watch(
  program,
  (next) => {
    emit('perform', { progress: { done: next.length, total: payload.solution.length } })

    if (next.length === payload.solution.length) {
      emit('perform', {
        character: { mood: 'curious', line: `${next.length} 步都摆好了，让它走一趟？` },
      })
    }
  },
  // splice 是**原地**改动，引用不变 —— 不加 deep 这条 watch 根本不会触发
  { deep: true },
)

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

  // 让角色**一步步**走完，每一步亮一格积木 ——
  // 原来是「位移 600ms 之后直接报完成」，孩子看不出每一步做了什么。
  // 单步节奏 200ms（与 duration-quick 同值，每步都收干净再走下一步），
  // 三步共 600ms，总时长与原来持平，但过程现在**看得见**。
  running.value = true
  activeStep.value = 0

  const total = payload.solution.length
  const step = (): void => {
    activeStep.value += 1

    if (activeStep.value >= total) {
      emit('perform', { character: { mood: 'cheering', line: `${total} 步都走到了！` } })
      stepTimer = setTimeout(() => {
        running.value = false
        activeStep.value = 0
        emit('solved', ids)
      }, 240)
      return
    }
    stepTimer = setTimeout(step, 200)
  }

  // 第一步**立刻**走：孩子刚按了「出发」，延迟一拍才动是明显的卡顿
  step()
}

onBeforeUnmount(() => {
  if (stepTimer)
    clearTimeout(stepTimer)
  if (confirmTimer)
    clearTimeout(confirmTimer)
})
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
            class="transition-transform duration-quick ease-soft"
            :style="{ transform: actorStyle }"
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
          :data-confirm="justInserted === index ? 'true' : undefined"
          :data-running="running && index < activeStep ? 'true' : undefined"
          :class="cn(
            'sb-block flex items-center gap-1.5 rounded-chip border-2 border-[var(--tone-line)] bg-[var(--tone-soft)] px-3 py-2 font-display text-sm text-[var(--tone-deep)] shadow-press',
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

<style scoped>
/*
  落位确认拍（confirm）：积木刚放下去时弹一下，让孩子知道「这一步记上了」。
  执行中（data-running）：这一步已经跑过 —— 逐拍执行的意义就在这条高亮上，
  否则孩子看到的只是一次整体位移，看不出「第 2 步做了什么」。
*/
.sb-block {
  transition:
    transform var(--duration-quick) var(--ease-soft),
    box-shadow var(--duration-quick) var(--ease-soft);
}

.sb-block[data-confirm='true'] {
  animation: sb-confirm var(--duration-settle) var(--ease-bounce) both;
}

.sb-block[data-running='true'] {
  background: var(--tone);
  color: var(--color-paper);
}

.sb-block[data-running='true'] .font-numeric {
  color: color-mix(in srgb, var(--color-paper) 75%, transparent);
}

@keyframes sb-confirm {
  0% {
    opacity: 0;
    transform: translateY(-8px) scale(0.92);
  }

  60% {
    opacity: 1;
    transform: translateY(2px) scale(1.04);
  }

  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>
