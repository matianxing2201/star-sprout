<script setup lang="ts">
import type { InteractionComponentEmits } from '../contract'

import type { FindPatternPayload } from '@/domain'
import { computed, ref } from 'vue'

import { cn } from '@/shared/utils'

/**
 * 找规律（find-pattern）
 * =====================
 *
 * 5 个方框排成一排，只有 1 格空着，把缺的那个数找回来。面向 4~5 岁。
 *
 * 按 `docs/interaction-motion-standard.md` 实现：
 *
 *   1. 操作中有反馈 ✅ 点选项有按下即时形变；点选类的连续反馈由形变承担
 *      （这一类没有可拖拽的过程，和选一选同理）
 *   2. 角色有反应 ✅ 走表演通道：答错立刻报心情，内容侧写了 `hint`
 *      就由角色**立刻**说出方向，不等外壳的「第 2 次才提示」
 *   3. 累积看得见 —— **不适用**：一次操作即完成，没有「还差几个」
 *      （规范第四节要求「缺哪条都要有写下来的理由」，理由在这条注释里）
 *   4. 答错是方向 ✅ 有 hint 就报 hint；没有时外壳用角色的 nudge 兜底
 *   5. 至少两拍 ✅ `focus`（点中的那张站出来、其余退到后面）
 *      → `confirm`（数字落进空格弹一下）
 *
 * 判定完全来自数据：`sequence[blankIndex]` 就是答案，组件只做比较。
 * 「规律是哪一种」组件根本不认识 —— 那属于内容（见 domain 的 FindPatternPayload）。
 */
const { payload, disabled = false } = defineProps<{
  payload: FindPatternPayload
  disabled?: boolean
}>()

const emit = defineEmits<InteractionComponentEmits>()

const answer = computed(() => payload.sequence[payload.blankIndex])

const filledValue = ref<number | null>(null)
const wrongValue = ref<number | null>(null)
/** focus 拍：刚被点中的那个选项（无论对错） */
const focusValue = ref<number | null>(null)

const isFocusing = computed(() => focusValue.value !== null && filledValue.value === null)

function pick(value: number): void {
  if (disabled || filledValue.value !== null)
    return

  // 第一拍：不管对错，被点中的那个先站出来（其余由 data-dimmed 退到后面）
  focusValue.value = value

  if (value === answer.value) {
    filledValue.value = value
    emit('solved', value)
    return
  }

  wrongValue.value = value
  // 角色的反应：心情总是给，**话**只给内容侧写的方向 ——
  // 宁可不说，也不要编一句通用鼓励（那正是这份规范要治的病）
  emit('perform', {
    character: { mood: 'thinking', line: payload.hint },
  })
  emit('missed', payload.hint)

  window.setTimeout(() => {
    wrongValue.value = null
    focusValue.value = null
  }, 640)
}
</script>

<template>
  <div class="flex flex-col items-center gap-6">
    <!-- 五个方框排成一排；文字尽量少，孩子要靠数字本身读题 -->
    <div class="grid w-full max-w-md grid-cols-5 gap-2" role="list" aria-label="一排五个方框，有一个空着">
      <div
        v-for="(value, index) in payload.sequence"
        :key="index"
        role="listitem"
        :aria-label="index === payload.blankIndex ? '空着的方框' : `第 ${index + 1} 格是 ${value}`"
        :data-confirm="index === payload.blankIndex && filledValue !== null ? 'true' : undefined"
        :class="cn(
          'fp-box grid aspect-square place-items-center rounded-tile border-2',
          index === payload.blankIndex
            ? (filledValue !== null
              ? 'border-success bg-success-soft'
              : 'border-dashed border-[var(--tone-line)] bg-paper-deep')
            : 'border-[var(--tone-line)] bg-surface shadow-sticker',
        )"
      >
        <span
          v-if="index === payload.blankIndex"
          class="font-display text-2xl"
          :class="filledValue !== null ? 'text-success-deep' : 'text-ink-faint'"
        >
          {{ filledValue !== null ? filledValue : '?' }}
        </span>
        <span v-else class="font-display text-2xl text-ink">{{ value }}</span>
      </div>
    </div>

    <!-- 备选数字：点一下就填 -->
    <div class="flex flex-wrap justify-center gap-3" role="group" aria-label="备选数字">
      <button
        v-for="value in payload.options"
        :key="value"
        type="button"
        :disabled="disabled || filledValue !== null"
        :data-focus="focusValue === value ? 'true' : undefined"
        :data-dimmed="isFocusing && focusValue !== value ? 'true' : undefined"
        :aria-label="`选择 ${value}`"
        :class="cn(
          'fp-option fx-pressable grid size-14 place-items-center rounded-tile border-2 border-[var(--tone-line)] bg-surface font-display text-2xl text-ink shadow-sticker',
          'disabled:cursor-default',
          filledValue === value && 'fp-option--ok border-success bg-success-soft text-success-deep',
          wrongValue === value && 'fx-gently border-gently bg-gently-soft',
        )"
        @click="pick(value)"
      >
        {{ value }}
      </button>
    </div>
  </div>
</template>

<style scoped>
/*
  两拍的样式。
  用 `data-*` 而不是 `:hover`：**平板上没有 hover**，孩子用手指，
  这一拍必须在触摸下也成立。
  `opacity` 要一并过渡，所以这里自己声明 transition
  （`.fx-pressable` 只过渡 transform），没列进来的属性不参与过渡。
*/
.fp-option {
  transition:
    transform var(--duration-base) var(--ease-soft),
    opacity var(--duration-base) var(--ease-soft),
    background-color var(--duration-base) var(--ease-soft),
    border-color var(--duration-base) var(--ease-soft);
}

/* 第一拍 focus：被点中的那个站出来，其余的退到后面 */
.fp-option[data-focus='true'] {
  z-index: 1;
  transform: translateY(-6px) scale(1.08);
}

.fp-option[data-dimmed='true'] {
  opacity: 0.5;
  transform: scale(0.95);
}

/* 第二拍 confirm：数字落进空格时弹一下 */
.fp-box[data-confirm='true'] {
  animation: fp-confirm var(--duration-settle) var(--ease-bounce) both;
}

@keyframes fp-confirm {
  0% {
    opacity: 0;
    transform: scale(0.9);
  }

  60% {
    opacity: 1;
    transform: scale(1.06);
  }

  100% {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
