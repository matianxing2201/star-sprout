<script setup lang="ts">
import type { InteractionComponentEmits } from '../contract'

import type { SceneTarget, TapTargetPayload } from '@/domain'
import { computed, ref } from 'vue'
import { toneVars } from '@/domain'

import { cn } from '@/shared/utils'

/**
 * 点一点：在场景里把目标找出来。
 * 点对了目标就留下并打勾；点到别的只轻轻抖一下，不扣任何东西。
 * 判对标准：找到的正确目标数量达到 requiredCount（缺省为全部正确目标）。
 */
const { payload, disabled = false } = defineProps<{
  payload: TapTargetPayload
  disabled?: boolean
}>()

const emit = defineEmits<InteractionComponentEmits>()

const foundIds = ref<string[]>([])
const wrongId = ref<string | null>(null)

const neededCount = computed(() =>
  payload.requiredCount ?? payload.targets.filter(target => target.correct).length,
)

/** 没有背景图时用色调铺一层柔和的底色，孩子仍然看得出“这是一幅画” */
const sceneStyle = computed(() => ({
  ...toneVars(payload.backgroundTone ?? 'explore'),
  backgroundImage: 'linear-gradient(160deg, var(--tone-soft) 0%, var(--tone-glow) 100%)',
}))

/** 坐标是百分比：任何屏幕尺寸下目标都落在同一个位置 */
function targetStyle(target: SceneTarget) {
  const size = target.size ?? 64
  return {
    left: `${target.x}%`,
    top: `${target.y}%`,
    width: `${size}px`,
    height: `${size}px`,
    transform: 'translate(-50%, -50%)',
  }
}

function tapTarget(target: SceneTarget): void {
  if (disabled || foundIds.value.includes(target.id))
    return

  if (target.correct) {
    foundIds.value.push(target.id)
    if (foundIds.value.length >= neededCount.value)
      emit('solved', [...foundIds.value])
    return
  }

  wrongId.value = target.id
  emit('missed', target.hint)
  setTimeout(() => {
    wrongId.value = null
  }, 640)
}
</script>

<template>
  <div
    class="relative aspect-[4/3] w-full overflow-hidden rounded-tile border-2 border-[var(--tone-line)] shadow-sticker"
    :style="sceneStyle"
  >
    <img
      v-if="payload.background"
      :src="payload.background"
      alt=""
      class="absolute inset-0 size-full object-cover"
    >
    <span
      v-else
      class="absolute inset-0 grid select-none place-items-center text-[7rem] opacity-20"
      aria-hidden="true"
    >
      🔍
    </span>

    <!-- 外层只负责用 translate 对准坐标；动画放在里面的按钮上，两者不会互相覆盖 -->
    <div
      v-for="target in payload.targets"
      :key="target.id"
      class="absolute"
      :style="targetStyle(target)"
    >
      <button
        type="button"
        :disabled="disabled"
        :aria-label="target.label"
        :aria-pressed="foundIds.includes(target.id)"
        :class="cn(
          'fx-pressable grid size-full place-items-center rounded-chip border-2 border-[var(--tone-line)] bg-surface/90 text-3xl shadow-sticker',
          'disabled:cursor-default',
          foundIds.includes(target.id) && 'fx-correct border-success bg-success-soft',
          wrongId === target.id && 'fx-gently border-gently bg-gently-soft',
        )"
        @click="tapTarget(target)"
      >
        <span aria-hidden="true">{{ target.emoji ?? '✨' }}</span>
      </button>
      <span
        v-if="foundIds.includes(target.id)"
        class="pointer-events-none absolute -top-2 -right-2 grid size-7 place-items-center rounded-chip bg-success text-white shadow-press"
        aria-hidden="true"
      >
        ✓
      </span>
    </div>
  </div>
</template>
