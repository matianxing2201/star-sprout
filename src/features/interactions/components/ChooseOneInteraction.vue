<script setup lang="ts">
import type { InteractionComponentEmits } from '../contract'

import type { ChooseOnePayload, InteractionOption } from '@/domain'
import { computed, ref } from 'vue'
import { toneVars } from '@/domain'

import { ListenButton, useAudioClip } from '@/features/audio'
import { cn } from '@/shared/utils'
import { KIcon, KVisual } from '@/ui'

/**
 * 选一选：点一个就对。
 *
 * 按 `docs/interaction-motion-standard.md` 重做的样板之一（规范第四节那 5 条）：
 *
 *   1. 操作中有反馈 ✅ 点下去**先出声再判**（认字课里「点一下」首先是「听它念什么」），
 *      加上按下即时形变。点选类没有可拖拽的过程，连续反馈由声音承担。
 *   2. 角色有反应 ✅ 走表演通道 —— 内容侧给了 `option.hint`，角色就**立刻**指出方向，
 *      不用等外壳的「第 2 次才给提示」。
 *   3. 累积看得见 —— **不适用**：单选，一次操作即完成，没有「还差几个」。
 *   4. 答错是方向 ✅ 有 hint 就报 hint；没有时外壳用角色的 nudge 兜底。
 *   5. 至少两拍 ✅ `focus`（被点中的那张站出来、其余退到后面）→ `confirm`（弹一下锁定）。
 *
 * 判对之后卡片弹一下并锁定；点错了只有**那张**动，其余不动 —— 不出现红叉，也不消耗“机会”。
 */
const { payload, disabled = false } = defineProps<{
  payload: ChooseOnePayload
  disabled?: boolean
}>()

const emit = defineEmits<InteractionComponentEmits>()

const pickedId = ref<string | null>(null)
const wrongId = ref<string | null>(null)
/** focus 拍：刚被点中的那张（无论对错）—— 它先「站出来」，其余的退到后面 */
const focusId = ref<string | null>(null)

/** focus 还在生效时，除被点中的那张之外都该退到后面 */
const isFocusing = computed(() => focusId.value !== null && pickedId.value === null)

const { toggle } = useAudioClip()

const columns = computed(() => {
  const count = payload.options.length
  if (payload.columns)
    return payload.columns
  if (count <= 2)
    return 2
  if (count <= 4)
    return 2
  return 3
})

const gridClass = computed(() => {
  const map: Record<number, string> = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 sm:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-4',
  }
  return map[columns.value] ?? 'grid-cols-3'
})

const isScene = computed(() => payload.layout === 'scene')

/** 内容侧可能只写了文字：给一枚问号图标占位，避免卡片空着半张脸 */
function optionIcon(option: InteractionOption) {
  return option.icon ?? (option.emoji || option.image ? undefined : 'question' as const)
}

/**
 * 点一张字卡：先把它的音念出来，再判对错。
 *
 * 顺序是刻意的 —— 认字课里「点一下」首先是「听它念什么」，
 * 判对错是其次。听音在判定之前发生，即使点错了也已经听到了正确发音；
 * 点对了则 `toggle` 停在「正在念」，那一个字会一直响到孩子再点一下为止。
 */
function pick(option: InteractionOption): void {
  if (disabled || pickedId.value)
    return

  if (option.audioClipId)
    toggle(option.audioClipId)

  // 第一拍：不管对错，被点中的那张先站出来（其余的由 data-dimmed 退到后面）
  focusId.value = option.id

  if (option.correct) {
    pickedId.value = option.id
    emit('solved', option.id)
    return
  }

  wrongId.value = option.id
  // 立刻给出方向，不等外壳的「第 2 次才给提示」——
  // 方向来自内容侧的 option.hint；没有时外壳的 nudge 兜底。
  if (option.hint)
    emit('perform', { character: { mood: 'thinking', line: option.hint } })

  emit('missed', option.hint)
  window.setTimeout(() => {
    wrongId.value = null
    focusId.value = null
  }, 640)
}
</script>

<template>
  <div :class="cn('grid gap-4', gridClass)">
    <button
      v-for="option in payload.options"
      :key="option.id"
      type="button"
      :disabled="disabled"
      :class="cn(
        'co-option fx-pressable relative flex flex-col items-center gap-2 rounded-tile border-2 border-[var(--tone-line)] bg-surface text-center shadow-sticker',
        'disabled:cursor-default',
        isScene ? 'min-h-44 justify-center p-5' : 'min-h-32 justify-center p-4',
        pickedId === option.id && 'fx-correct border-success bg-success-soft',
        wrongId === option.id && 'fx-gently border-gently bg-gently-soft',
      )"
      :data-focus="focusId === option.id ? 'true' : undefined"
      :data-dimmed="isFocusing && focusId !== option.id ? 'true' : undefined"
      :style="toneVars(option.tone ?? 'neutral')"
      @click="pick(option)"
    >
      <KVisual
        :icon="optionIcon(option)"
        :emoji="option.emoji"
        :image="option.image"
        :size="isScene ? 'xl' : 'lg'"
        :tone="option.tone"
      />
      <span class="font-display text-lg leading-tight text-[var(--tone-deep)]">{{ option.label }}</span>
      <!--
        卡片角上的小喇叭：整张卡都能点，但它让「这里可以听」变得看得出来。
        点了会 toggle，听过的字再点一下就能停 —— 不用去够那颗按钮。
      -->
      <ListenButton
        v-if="option.audioClipId"
        :clip-id="option.audioClipId"
        size="sm"
        :tone="option.tone ?? 'language'"
        class="absolute -bottom-2 -right-2"
        label="听这个字"
      />
      <span
        v-if="pickedId === option.id"
        class="absolute -top-3 -right-3 grid size-8 place-items-center rounded-chip bg-success text-white shadow-press"
        aria-hidden="true"
      >
        <KIcon name="check" size="md" />
      </span>
    </button>
  </div>
</template>

<style scoped>
/*
  focus 拍。
  不复用 `.fx-pressable:hover` 是因为**平板上没有 hover** —— 孩子用手指，
  这一拍必须在触摸下也成立。带 `.co-option` 是为了把属性选择器的优先级抬起来；
  `data-focus` / `data-dimmed` 只是状态标记，样式写在属性选择器里。
  `opacity` 需要一并过渡，所以这里自己声明 transition
  （`.fx-pressable` 只过渡 transform），没列在里面的属性一律不参与过渡。
*/
.co-option {
  transition:
    transform var(--duration-base) var(--ease-soft),
    opacity var(--duration-base) var(--ease-soft);
}

/* 被点中的那张站出来 */
.co-option[data-focus='true'] {
  z-index: 1;
  transform: translateY(-6px) scale(1.06);
}

/* 其余的退到后面：让孩子看清「是这一张」，而不是「整排都在动」 */
.co-option[data-dimmed='true'] {
  opacity: 0.55;
  transform: scale(0.96);
}
</style>
