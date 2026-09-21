<script setup lang="ts">
import type { InteractionResult, InteractionSpec, MascotId } from '@/domain'

import { computed } from 'vue'
import { MascotBubble } from '@/features/mascot'
import { KButton, KIcon } from '@/ui'

import { INTERACTION_META } from './contract'
import { resolveInteraction } from './registry'
import { useInteraction } from './useInteraction'

/**
 * 互动的统一外壳
 * ==============
 *
 * 职责分工：
 *   - 外壳：题目、角色反馈、提示、跳过、星星、结算上报（所有互动共用同一套规则）
 *   - 具体组件：只负责画面与判定
 *
 * 因此“答错不出现红叉”“奖励不得过度”这类产品要求只在这里保证一次。
 */
const {
  spec,
  mascot = 'fox',
} = defineProps<{
  spec: InteractionSpec
  mascot?: MascotId
}>()

const emit = defineEmits<{
  resolved: [result: InteractionResult]
}>()

const {
  solved,
  skipped,
  attempts,
  coachLine,
  canRevealHint,
  markSolved,
  markMissed,
  revealHint,
  skip,
  toResult,
} = useInteraction({ spec, mascot })

const component = computed(() => resolveInteraction(spec.kind))

/**
 * 玩法标签。
 * 孩子看到的不是「互动类型」这种术语，而是「选一选」「连一连」——
 * 这回答了产品判断标准里的「我一眼能不能知道这里是什么」。
 * 「正在锻炼」那行是给家长看的：家长翻到这一屏时能知道孩子在练什么能力。
 */
const meta = computed(() => INTERACTION_META[spec.kind])

function onSolved(answer?: unknown): void {
  markSolved(answer)
  emit('resolved', toResult(spec.kind))
}

function onMissed(hint?: string): void {
  markMissed(hint)
}

function onSkip(): void {
  skip()
  emit('resolved', toResult(spec.kind))
}

const mood = computed(() => {
  if (solved.value)
    return 'cheering' as const
  return attempts.value > 0 ? ('thinking' as const) : ('happy' as const)
})
</script>

<template>
  <section class="flex flex-col gap-5">
    <header class="rounded-blob border-2 border-line bg-surface/80 px-6 py-5 shadow-press">
      <h3 class="font-display text-2xl leading-snug text-ink sm:text-3xl">
        {{ spec.prompt }}
      </h3>
      <!--
        这里只报「在练什么能力」，不报玩法名。
        题目上方已经有内容作者写的任务标题（「盖量词印章」），而任务标题往往
        就是照着玩法起的名字 —— 再报一次玩法名会变成两行一样的字（实测过）。
        玩法名（`meta.label`）留给家长端的能力统计用，不在孩子这一屏重复出现。
      -->
      <p class="mt-2 flex items-center gap-1.5 font-body text-xs text-ink-faint">
        <KIcon :name="meta.icon" size="sm" />
        <span>正在锻炼：{{ meta.ability }}</span>
      </p>
    </header>

    <div
      class="relative min-h-[18rem] rounded-blob border-2 border-line bg-paper-deep/55 p-4 sm:p-6"
    >
      <component
        :is="component"
        :payload="spec.payload"
        :disabled="solved || skipped"
        @solved="onSolved"
        @missed="onMissed"
      />
    </div>

    <MascotBubble :id="mascot" :text="coachLine || spec.prompt" :mood="mood">
      <div v-if="canRevealHint || spec.skippable" class="mt-3 flex flex-wrap gap-2">
        <KButton
          v-if="canRevealHint"
          size="sm"
          variant="soft"
          tone="think"
          @click="revealHint()"
        >
          <KIcon name="lightbulb" size="sm" />
          给我一点提示
        </KButton>
        <KButton
          v-if="spec.skippable && !solved"
          size="sm"
          variant="ghost"
          @click="onSkip"
        >
          先跳过
        </KButton>
      </div>
    </MascotBubble>
  </section>
</template>
