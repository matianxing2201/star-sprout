<script setup lang="ts">
import type { UnitTwoTask } from '@/content/grades/grade-1/math-unit-two-practice'

import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { publicAsset } from '@/shared/utils'
import { KButton, KConfetti, KIcon, KStarBurst, KTag } from '@/ui'

interface PointSummary {
  id: string
  label: string
  needsPractice: boolean
  missedCount: number
  completed?: boolean
  correctCount?: number
  totalCount?: number
  correctedCount?: number
}

const props = defineProps<{
  originalCount: number
  totalOriginalCount: number
  extensionCount: number
  totalExtensionCount: number
  accuracy: number
  knowledgePointName?: string
  nextKnowledgePointName?: string
  missedTasks: UnitTwoTask[]
  reviewCorrectIds: string[]
  pointSummary: PointSummary[]
  unitComplete: boolean
  unitAccuracy: number
  unitCorrectCount: number
  unitOriginalCount: number
  unitExtensionCount: number
  unitExtensionTotalCount: number
  unitCompletedPointCount: number
  unitPointCount: number
  unitCorrectionCount: number
  unitPointSummary: PointSummary[]
  characterImage: string
  playCelebration: boolean
}>()

const emit = defineEmits<{
  retryMissed: []
  retryPoint: [pointId: string]
  celebrationPlayed: []
  restart: []
  nextKnowledgePoint: []
  returnToOutline: []
}>()

const masteryLevel = computed(() => {
  if (props.accuracy >= 90)
    return 3
  if (props.accuracy >= 70)
    return 2
  return 1
})

const masteryTitle = computed(() => {
  if (props.knowledgePointName) {
    if (masteryLevel.value === 3)
      return `${props.knowledgePointName}练完啦，真棒！`
    if (masteryLevel.value === 2)
      return `${props.knowledgePointName}练得不错！`
    return `${props.knowledgePointName}挑战完成！`
  }
  if (props.unitComplete && masteryLevel.value === 3)
    return '这个单元掌握得很稳！'
  if (props.unitComplete && masteryLevel.value === 2)
    return '你学得很不错！'
  if (props.unitComplete)
    return '今天的挑战完成啦！'
  if (masteryLevel.value === 3)
    return '这个知识点掌握得很棒！'
  if (masteryLevel.value === 2)
    return '这组题做得很不错！'
  return '你把这组题完成啦！'
})

const masteryMessage = computed(() => {
  if (props.knowledgePointName || !props.unitComplete) {
    if (masteryLevel.value === 3)
      return '好多题都一次答对啦！收下星星，再去挑战下一个知识点吧。'
    if (masteryLevel.value === 2)
      return '你已经掌握了不少，再练几次就会更有把握。收下星星继续出发！'
    return '每一次尝试都在进步。把错题订正好，猪妈妈陪你继续练熟。'
  }
  if (masteryLevel.value === 3)
    return '很多原题你第一次就答对了，继续保持这份认真。'
  if (masteryLevel.value === 2)
    return '基础知识已经学得不错，再回顾几道题会更有把握。'
  return '错题会告诉我们下一步练什么。猪妈妈陪你慢慢练熟。'
})

const celebrationActive = ref(false)
let celebrationTimer: ReturnType<typeof setTimeout> | undefined
let playedInView = false

function playCelebrationOnce(): void {
  if (!props.playCelebration || playedInView)
    return
  playedInView = true
  celebrationActive.value = true
  emit('celebrationPlayed')
  celebrationTimer = setTimeout(() => {
    celebrationActive.value = false
  }, 2200)
}

onMounted(playCelebrationOnce)
watch(() => [props.playCelebration, props.unitComplete, props.knowledgePointName], playCelebrationOnce, { flush: 'post' })
onBeforeUnmount(() => {
  if (celebrationTimer)
    clearTimeout(celebrationTimer)
})
</script>

<template>
  <section v-if="unitComplete" class="relative grid gap-6" aria-live="polite">
    <KConfetti :active="celebrationActive" :count="42" />
    <header class="relative rounded-blob border-2 border-math-line bg-math-soft p-5 sm:p-7">
      <div class="grid gap-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
        <div>
          <KTag tone="success" size="sm">
            数学第二单元 · 全部完成
          </KTag>
          <h2 class="mt-3 font-display text-2xl leading-tight text-ink sm:text-3xl">
            {{ masteryTitle }}
          </h2>
          <p class="mt-2 max-w-2xl font-body text-sm leading-relaxed text-ink-soft sm:text-base">
            {{ masteryMessage }}
          </p>
          <div class="mt-4 flex items-center gap-2" :aria-label="`获得 ${masteryLevel} 颗星星，共三颗`">
            <KIcon
              v-for="star in 3"
              :key="star"
              name="star"
              size="2xl"
              :weight="star <= masteryLevel ? 'fill' : 'regular'"
              :class="star <= masteryLevel ? (celebrationActive ? 'unit-star-pop text-star' : 'text-star') : 'text-ink-faint/35'"
              :style="star <= masteryLevel && celebrationActive ? { animationDelay: `${(star - 1) * 160}ms` } : undefined"
            />
            <span class="ml-1 font-body text-sm font-bold text-math-deep">
              收下 {{ masteryLevel }} 颗星星
            </span>
          </div>
        </div>
        <div class="relative mx-auto h-24 w-24 sm:h-28 sm:w-28">
          <img
            :src="publicAsset(characterImage)"
            alt="佩奇为你庆祝完成数学第二单元"
            width="112"
            height="112"
            class="h-full w-full object-contain"
            :class="celebrationActive && 'unit-mascot-hop'"
          >
          <KStarBurst :active="celebrationActive" :count="masteryLevel" from="center" />
        </div>
      </div>

      <div class="mt-6 grid gap-5 rounded-card bg-white/80 p-4 sm:grid-cols-[minmax(0,1.1fr)_minmax(14rem,0.9fr)] sm:p-5">
        <div>
          <p class="font-body text-sm font-bold text-ink-soft">
            原题第一次答对
          </p>
          <p class="mt-1 font-numeric text-4xl font-black leading-none text-ink sm:text-5xl">
            {{ unitCorrectCount }}<span class="ml-2 font-display text-lg font-semibold text-ink-soft">/ {{ unitOriginalCount }} 题</span>
          </p>
          <div
            class="mt-4 h-4 overflow-hidden rounded-chip bg-paper-deep"
            role="progressbar"
            :aria-valuenow="unitAccuracy"
            aria-valuemin="0"
            aria-valuemax="100"
            :aria-label="`原题首次正确率 ${unitAccuracy}%`"
          >
            <div class="h-full rounded-chip bg-math-deep transition-[width] duration-700" :style="{ width: `${unitAccuracy}%` }" />
          </div>
          <p class="mt-2 font-body text-xs text-ink-faint">
            首次正确率 {{ unitAccuracy }}% · 完成 {{ unitCompletedPointCount }}/{{ unitPointCount }} 个知识点
          </p>
        </div>

        <dl class="grid grid-cols-2 gap-3 self-stretch">
          <div class="rounded-tile bg-paper p-3">
            <dt class="font-body text-xs text-ink-faint">
              错题订正
            </dt>
            <dd class="mt-1 font-numeric text-2xl font-black text-ink">
              {{ unitCorrectionCount }} <span class="font-body text-sm font-semibold">题</span>
            </dd>
          </div>
          <div class="rounded-tile bg-paper p-3">
            <dt class="font-body text-xs text-ink-faint">
              拓展题完成
            </dt>
            <dd class="mt-1 font-numeric text-2xl font-black text-ink">
              {{ unitExtensionCount }}<span class="font-body text-sm font-semibold"> / {{ unitExtensionTotalCount }}</span>
            </dd>
          </div>
        </dl>
      </div>
    </header>

    <section class="rounded-card border-2 border-line bg-surface p-5 sm:p-6">
      <div class="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 class="font-display text-xl text-ink">
            每个知识点的表现
          </h3>
          <p class="mt-1 font-body text-sm text-ink-soft">
            点“再练几题”，佩奇会带你回到对应练习。
          </p>
        </div>
        <KTag tone="math" size="sm">
          原题首次作答
        </KTag>
      </div>

      <ol class="mt-4 divide-y divide-line">
        <li v-for="point in unitPointSummary" :key="point.id" class="flex flex-wrap items-center gap-x-4 gap-y-2 py-3 first:pt-0 last:pb-0">
          <span class="min-w-0 flex-1 font-body text-sm font-bold text-ink">{{ point.label }}</span>
          <span class="font-numeric text-sm font-bold tabular-nums text-ink-soft">
            {{ point.correctCount ?? 0 }} / {{ point.totalCount ?? 0 }} 题
          </span>
          <KTag :tone="point.needsPractice ? 'think' : 'success'" size="sm">
            {{ point.missedCount === 0 ? '第一次全对' : point.needsPractice ? `还可订正 ${point.missedCount - (point.correctedCount ?? 0)} 题` : '错题已订正' }}
          </KTag>
          <KButton v-if="point.missedCount > 0" variant="soft" tone="math" size="sm" @click="emit('retryPoint', point.id)">
            再练这里
          </KButton>
        </li>
      </ol>
    </section>

    <details v-if="missedTasks.length" class="rounded-card border-2 border-line bg-paper p-5 sm:p-6">
      <summary class="cursor-pointer list-none font-display text-lg text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-math-deep">
        错题回顾 · {{ missedTasks.length }} 题
        <span class="ml-2 font-body text-sm font-normal text-ink-faint">点开查看</span>
      </summary>
      <ul class="mt-4 grid gap-2 sm:grid-cols-2">
        <li v-for="task in missedTasks" :key="task.id" class="flex items-start justify-between gap-3 rounded-tile bg-surface px-3 py-3">
          <div>
            <p class="font-body text-sm font-bold leading-relaxed text-ink">
              {{ task.prompt }}
            </p>
            <p class="mt-1 font-body text-xs text-ink-faint">
              {{ task.knowledgePoint }} · {{ task.label }}
            </p>
          </div>
          <KTag :tone="reviewCorrectIds.includes(task.id) ? 'success' : 'think'" size="sm">
            {{ reviewCorrectIds.includes(task.id) ? '已订正' : '待订正' }}
          </KTag>
        </li>
      </ul>
    </details>
    <p v-else class="rounded-card bg-success-soft px-5 py-4 font-body text-sm font-semibold text-success-deep">
      原题没有错题，拓展题也完成啦！
    </p>

    <div class="flex flex-wrap justify-end gap-3">
      <KButton v-if="missedTasks.length" variant="primary" tone="math" size="lg" @click="emit('retryMissed')">
        去订正错题 <KIcon name="arrow-right" size="sm" />
      </KButton>
      <KButton variant="ghost" size="lg" @click="emit('returnToOutline')">
        回到数学大纲
      </KButton>
    </div>
  </section>

  <section v-else class="relative grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(17rem,0.8fr)]" aria-live="polite">
    <KConfetti :active="celebrationActive" :count="36" />
    <div class="rounded-card border-2 border-success-line bg-success-soft p-5 sm:p-7">
      <div class="flex items-start justify-between gap-3">
        <div>
          <KTag tone="success" size="sm">
            知识点完成
          </KTag>
          <h2 class="mt-3 font-display text-2xl text-ink sm:text-3xl">
            {{ knowledgePointName ? `${knowledgePointName}练完啦！` : '练习完成！' }}
          </h2>
        </div>
        <div class="relative h-20 w-20 shrink-0 sm:h-24 sm:w-24">
          <img
            :src="publicAsset(characterImage)"
            alt="佩奇为你庆祝完成这个知识点"
            width="96"
            height="96"
            class="h-full w-full object-contain"
            :class="celebrationActive && 'unit-mascot-hop'"
          >
          <KStarBurst :active="celebrationActive" :count="masteryLevel" from="center" />
        </div>
      </div>
      <p class="mt-2 font-body text-sm leading-relaxed text-ink-soft">
        {{ masteryMessage }}
      </p>
      <div class="mt-4 flex items-center gap-1.5" :aria-label="`本知识点获得 ${masteryLevel} 颗星星，共三颗`">
        <KIcon
          v-for="star in 3"
          :key="star"
          name="star"
          size="2xl"
          :weight="star <= masteryLevel ? 'fill' : 'regular'"
          :class="star <= masteryLevel ? (celebrationActive ? 'unit-star-pop text-star' : 'text-star') : 'text-ink-faint/35'"
          :style="star <= masteryLevel && celebrationActive ? { animationDelay: `${(star - 1) * 160}ms` } : undefined"
        />
        <span class="ml-2 font-body text-sm font-bold text-math-deep">收下 {{ masteryLevel }} 颗星星</span>
      </div>

      <div class="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div class="rounded-tile border border-white bg-white/80 p-3">
          <p class="font-body text-xs text-ink-faint">原题完成</p>
          <p class="mt-1 font-numeric text-2xl font-black text-ink">{{ originalCount }} / {{ totalOriginalCount }}</p>
        </div>
        <div class="rounded-tile border border-white bg-white/80 p-3">
          <p class="font-body text-xs text-ink-faint">拓展题</p>
          <p class="mt-1 font-numeric text-2xl font-black text-ink">{{ extensionCount }} / {{ totalExtensionCount }}</p>
        </div>
        <div class="rounded-tile border border-white bg-white/80 p-3">
          <p class="font-body text-xs text-ink-faint">首次正确率</p>
          <p class="mt-1 font-numeric text-2xl font-black text-ink">{{ accuracy }}%</p>
        </div>
      </div>

      <div class="mt-5 rounded-tile bg-white/75 p-4">
        <div class="mb-2 flex items-center justify-between gap-3 font-body text-sm">
          <span class="font-bold text-ink">单元学习进度</span>
          <span class="font-numeric font-bold text-math-deep">{{ unitCompletedPointCount }} / {{ unitPointCount }} 个知识点</span>
        </div>
        <div class="h-3 overflow-hidden rounded-chip bg-paper-deep" role="progressbar" :aria-valuenow="unitCompletedPointCount" :aria-valuemax="unitPointCount" aria-valuemin="0" :aria-label="`已完成 ${unitCompletedPointCount} / ${unitPointCount} 个知识点`">
          <div class="h-full rounded-chip bg-math-deep transition-[width] duration-500" :style="{ width: `${unitPointCount ? unitCompletedPointCount / unitPointCount * 100 : 0}%` }" />
        </div>
      </div>
    </div>

    <aside class="rounded-card border-2 border-line bg-surface p-5 shadow-press">
      <h3 class="font-display text-lg text-ink">
        本知识点回顾
      </h3>
      <ul class="mt-3 space-y-2">
        <li v-for="point in pointSummary" :key="point.id" class="flex items-center justify-between gap-3 rounded-tile bg-paper px-3 py-2">
          <span class="font-body text-sm text-ink">{{ point.label }}</span>
          <KTag :tone="point.needsPractice ? 'think' : 'success'" size="sm">
            {{ point.needsPractice ? `再练 ${point.missedCount} 题` : '掌握较好' }}
          </KTag>
        </li>
      </ul>
    </aside>

    <div class="rounded-card border-2 border-line bg-paper p-5 lg:col-span-2">
      <h3 class="font-display text-lg text-ink">
        错题清单
      </h3>
      <ul v-if="missedTasks.length" class="mt-3 grid gap-2 sm:grid-cols-2">
        <li v-for="task in missedTasks" :key="task.id" class="flex items-center justify-between gap-3 rounded-tile border border-line bg-surface px-3 py-2">
          <div>
            <p class="font-body text-sm font-bold text-ink">{{ task.prompt }}</p>
            <p class="mt-0.5 font-body text-xs text-ink-faint">{{ task.knowledgePoint }} · {{ task.label }}</p>
          </div>
          <KTag :tone="reviewCorrectIds.includes(task.id) ? 'success' : 'think'" size="sm">
            {{ reviewCorrectIds.includes(task.id) ? '已订正' : '待订正' }}
          </KTag>
        </li>
      </ul>
      <p v-else class="mt-2 font-body text-sm text-ink-soft">
        这个知识点没有错题，继续保持！
      </p>
    </div>

    <div class="flex flex-wrap justify-end gap-3 lg:col-span-2">
      <KButton v-if="missedTasks.length" variant="soft" tone="think" @click="emit('retryMissed')">
        再做一遍错题
      </KButton>
      <KButton v-if="nextKnowledgePointName" variant="primary" tone="math" size="lg" @click="emit('nextKnowledgePoint')">
        继续学习：{{ nextKnowledgePointName }} <KIcon name="arrow-right" size="sm" />
      </KButton>
      <KButton v-else variant="primary" tone="math" size="lg" @click="emit('returnToOutline')">
        回到数学大纲
      </KButton>
      <KButton variant="ghost" @click="emit('restart')">
        重新练本知识点
      </KButton>
    </div>
  </section>
</template>

<style scoped>
.unit-star-pop {
  transform-origin: center;
  animation: unit-star-pop 680ms cubic-bezier(0.2, 1.5, 0.5, 1) both;
}

.unit-mascot-hop {
  animation: unit-mascot-hop 760ms cubic-bezier(0.2, 1.2, 0.45, 1) 240ms both;
}

@keyframes unit-mascot-hop {
  0%, 100% {
    transform: translateY(0) rotate(0);
  }
  38% {
    transform: translateY(-10px) rotate(-4deg);
  }
  68% {
    transform: translateY(1px) rotate(3deg);
  }
}

@keyframes unit-star-pop {
  0% {
    opacity: 0;
    transform: scale(0.25) rotate(-28deg);
  }
  65% {
    opacity: 1;
    transform: scale(1.3) rotate(8deg);
  }
  100% {
    opacity: 1;
    transform: scale(1) rotate(0);
  }
}
</style>
