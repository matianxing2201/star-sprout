<script setup lang="ts">
import type { PracticeMode, UnitTwoSection, UnitTwoTask } from '@/content/grades/grade-1/math-unit-two-practice'
import type { InteractionResult } from '@/domain'
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { ROUTE_NAMES } from '@/app/router/route-names'
import { unitTwoAnswer, unitTwoChoices } from '@/content/grades/grade-1/math-unit-two-choice'
import {
  characterAsset,
  grade1MathUnitTwoExtensionTasks,
  grade1MathUnitTwoOriginalTasks,
  interactionFor,
  isDiagnosticTask,
} from '@/content/grades/grade-1/math-unit-two-practice'
import { publicAsset } from '@/shared/utils'
import { KButton, KIcon, KTag } from '@/ui'
import MathUnitTwoSummary from './MathUnitTwoSummary.vue'

const STORAGE_PREFIX = 'starsprout:g1-math-u2-practice:v1'
const route = useRoute()
const router = useRouter()
const requestedPointId = computed(() => typeof route.query.knowledgePointId === 'string'
  && grade1MathUnitTwoOriginalTasks.some(task => task.knowledgePointId === route.query.knowledgePointId)
  ? route.query.knowledgePointId
  : null)
const storageKey = computed(() => `${STORAGE_PREFIX}:${requestedPointId.value ?? 'all'}`)
const sessionOriginalTasks = computed(() => requestedPointId.value
  ? grade1MathUnitTwoOriginalTasks.filter(task => task.knowledgePointId === requestedPointId.value)
  : grade1MathUnitTwoOriginalTasks)
const sessionExtensionTasks = computed(() => requestedPointId.value
  ? grade1MathUnitTwoExtensionTasks.filter(task => task.knowledgePointId === requestedPointId.value)
  : grade1MathUnitTwoExtensionTasks)
const sessionKnowledgePoint = computed(() => requestedPointId.value ? sessionOriginalTasks.value[0]?.knowledgePoint : undefined)
const unitTwoKnowledgePoints = [...new Map(grade1MathUnitTwoOriginalTasks.map(task => [task.knowledgePointId, task.knowledgePoint])).entries()]
  .map(([id, name]) => ({ id, name }))
const mode = ref<PracticeMode>('digital')
const section = ref<UnitTwoSection>('diagnostic')
const position = ref(0)
const completed = ref<string[]>([])
const missed = ref<string[]>([])
const reviewCorrect = ref<string[]>([])
const reviewDone = ref<string[]>([])
const resultByTask = ref<Record<string, Partial<Record<PracticeMode, InteractionResult>>>>({})
const firstCompletionResult = ref<Record<string, InteractionResult>>({})
const extensionOrder = ref<string[]>([])
const celebrationShown = ref(false)

interface PracticeProgressSnapshot {
  section?: UnitTwoSection
  position?: number
  mode?: PracticeMode
  completed?: string[]
  missed?: string[]
  reviewCorrect?: string[]
  reviewDone?: string[]
  extensionOrder?: string[]
  resultByTask?: Record<string, Partial<Record<PracticeMode, InteractionResult>>>
  firstCompletionResult?: Record<string, InteractionResult>
  celebrationShown?: boolean
}

const characters: Record<string, string> = {
  'peppa': '佩奇',
  'george': '乔治',
  'mummy-pig': '猪妈妈',
  'daddy-pig': '猪爸爸',
  'grandpa-pig': '猪爷爷',
  'emily-elephant': '大象朋友',
  'rebecca-rabbit': '兔子朋友',
}
const diagnosticTasks = computed(() => sessionOriginalTasks.value.filter(isDiagnosticTask))
const remainingOriginals = computed(() => sessionOriginalTasks.value.filter(task => !isDiagnosticTask(task)))
const allTasks = computed(() => [...sessionOriginalTasks.value, ...sessionExtensionTasks.value])
const allUnitTasks = [...grade1MathUnitTwoOriginalTasks, ...grade1MathUnitTwoExtensionTasks]

const stageTasks = computed<UnitTwoTask[]>(() => {
  if (section.value === 'diagnostic')
    return diagnosticTasks.value
  if (section.value === 'original')
    return remainingOriginals.value
  if (section.value === 'extension') {
    return extensionOrder.value.map(id => sessionExtensionTasks.value.find(task => task.id === id)).filter((task): task is UnitTwoTask => Boolean(task))
  }
  if (section.value === 'review')
    return missed.value.map(id => allTasks.value.find(task => task.id === id)).filter((task): task is UnitTwoTask => Boolean(task))
  return []
})
const currentTask = computed(() => stageTasks.value[position.value])
watch(currentTask, () => {
  mode.value = 'digital'
}, { immediate: true })
const isSummary = computed(() => section.value === 'summary')
const totalTasks = computed(() => sessionOriginalTasks.value.length + sessionExtensionTasks.value.length)
const completedOriginalCount = computed(() => completed.value.filter(id => sessionOriginalTasks.value.some(task => task.id === id)).length)
const completedExtensionCount = computed(() => completed.value.filter(id => sessionExtensionTasks.value.some(task => task.id === id)).length)
const completionPercent = computed(() => Math.round(completed.value.length / totalTasks.value * 100))
const correctOnFirstTry = computed(() => sessionOriginalTasks.value.filter((task) => {
  const result = firstCompletionResult.value[task.id]
  return result?.correct && result.attempts === 1
}).length)
const firstTryAccuracy = computed(() => sessionOriginalTasks.value.length
  ? Math.round(correctOnFirstTry.value / sessionOriginalTasks.value.length * 100)
  : 0)
const activeSpec = computed(() => currentTask.value ? interactionFor(currentTask.value, mode.value) : null)

const pointSummary = computed(() => {
  const points = [...new Map(sessionOriginalTasks.value.map(task => [task.knowledgePointId, task.knowledgePoint])).entries()]
  return points.map(([id, label]) => {
    const initialMisses = missed.value.filter(taskId => allTasks.value.find(task => task.id === taskId)?.knowledgePointId === id)
    const uncorrectedMisses = initialMisses.filter(taskId => !reviewCorrect.value.includes(taskId))
    return { id, label, needsPractice: uncorrectedMisses.length > 0, missedCount: uncorrectedMisses.length }
  })
})
const currentMissedTasks = computed(() => missed.value
  .map(id => allTasks.value.find(task => task.id === id))
  .filter((task): task is UnitTwoTask => Boolean(task)))

const liveSessionSnapshot = computed<PracticeProgressSnapshot>(() => ({
  section: section.value,
  completed: completed.value,
  missed: missed.value,
  reviewCorrect: reviewCorrect.value,
  firstCompletionResult: firstCompletionResult.value,
  celebrationShown: celebrationShown.value,
}))

function storedPointSnapshot(pointId: string): PracticeProgressSnapshot {
  if (!requestedPointId.value || pointId === requestedPointId.value)
    return liveSessionSnapshot.value

  try {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}:${pointId}`)
    return saved ? JSON.parse(saved) as PracticeProgressSnapshot : {}
  }
  catch {
    return {}
  }
}

const pointSnapshots = computed(() => unitTwoKnowledgePoints.map(point => ({
  point,
  session: storedPointSnapshot(point.id),
})))

const unitPointSummary = computed(() => pointSnapshots.value.map(({ point, session }) => {
  const tasks = grade1MathUnitTwoOriginalTasks.filter(task => task.knowledgePointId === point.id)
  const missedIds = new Set(session.missed ?? [])
  const correctedIds = new Set(session.reviewCorrect ?? [])
  const missedOriginals = tasks.filter(task => missedIds.has(task.id))
  const correctedCount = missedOriginals.filter(task => correctedIds.has(task.id)).length
  const correctCount = tasks.filter((task) => {
    const result = session.firstCompletionResult?.[task.id]
    return result?.correct && result.attempts === 1
  }).length

  return {
    id: point.id,
    label: point.name,
    completed: session.section === 'summary',
    correctCount,
    totalCount: tasks.length,
    missedCount: missedOriginals.length,
    correctedCount,
    needsPractice: missedOriginals.length > correctedCount,
  }
}))

const unitProgress = computed(() => {
  const completedIds = new Set<string>()
  const missedIds = new Set<string>()
  const correctedIds = new Set<string>()
  const firstResults: Record<string, InteractionResult> = {}

  for (const { session } of pointSnapshots.value) {
    for (const id of session.completed ?? []) completedIds.add(id)
    for (const id of session.missed ?? []) missedIds.add(id)
    for (const id of session.reviewCorrect ?? []) correctedIds.add(id)
    Object.assign(firstResults, session.firstCompletionResult ?? {})
  }

  const originalCorrectCount = grade1MathUnitTwoOriginalTasks.filter((task) => {
    const result = firstResults[task.id]
    return result?.correct && result.attempts === 1
  }).length
  const originalCompletedCount = grade1MathUnitTwoOriginalTasks.filter(task => completedIds.has(task.id)).length
  const extensionCompletedCount = grade1MathUnitTwoExtensionTasks.filter(task => completedIds.has(task.id)).length
  const originalMissedCount = grade1MathUnitTwoOriginalTasks.filter(task => missedIds.has(task.id)).length

  return {
    originalCorrectCount,
    originalCompletedCount,
    originalTotalCount: grade1MathUnitTwoOriginalTasks.length,
    accuracy: grade1MathUnitTwoOriginalTasks.length
      ? Math.round(originalCorrectCount / grade1MathUnitTwoOriginalTasks.length * 100)
      : 0,
    extensionCompletedCount,
    extensionTotalCount: grade1MathUnitTwoExtensionTasks.length,
    correctedCount: allUnitTasks.filter(task => missedIds.has(task.id) && correctedIds.has(task.id)).length,
    missedTasks: allUnitTasks.filter(task => missedIds.has(task.id)),
    reviewCorrectIds: [...correctedIds],
    originalMissedCount,
    completedPointCount: unitPointSummary.value.filter(point => point.completed).length,
    totalPointCount: unitTwoKnowledgePoints.length,
    pointSummary: unitPointSummary.value,
  }
})

const isUnitComplete = computed(() => requestedPointId.value
  ? unitPointSummary.value.length > 0 && unitPointSummary.value.every(point => point.completed)
  : isSummary.value)

const nextKnowledgePoint = computed(() => {
  if (!requestedPointId.value)
    return undefined
  const next = unitPointSummary.value.find(point => !point.completed && point.id !== requestedPointId.value)
  return next ? { id: next.id, name: next.label } : undefined
})

const summaryMissedTasks = computed(() => isUnitComplete.value ? unitProgress.value.missedTasks : currentMissedTasks.value)
const summaryReviewCorrectIds = computed(() => isUnitComplete.value ? unitProgress.value.reviewCorrectIds : reviewCorrect.value)

function restoreProgress(): void {
  try {
    const saved = localStorage.getItem(storageKey.value)
    if (!saved)
      return
    const state = JSON.parse(saved) as PracticeProgressSnapshot
    if (state.section)
      section.value = state.section
    position.value = state.position ?? 0
    mode.value = state.mode ?? 'digital'
    completed.value = state.completed ?? []
    missed.value = state.missed ?? []
    reviewCorrect.value = state.reviewCorrect ?? []
    reviewDone.value = state.reviewDone ?? []
    extensionOrder.value = state.extensionOrder ?? []
    resultByTask.value = state.resultByTask ?? {}
    firstCompletionResult.value = state.firstCompletionResult ?? {}
    celebrationShown.value = state.celebrationShown ?? false
    if (route.query.review === '1' && missed.value.length > 0) {
      section.value = 'review'
      position.value = 0
      reviewDone.value = []
    }
    if (section.value === 'summary')
      position.value = 0
    else if (position.value >= stageTasks.value.length)
      position.value = 0
  }
  catch {
    localStorage.removeItem(storageKey.value)
  }
}

function persistProgress(): void {
  localStorage.setItem(storageKey.value, JSON.stringify({
    section: section.value,
    position: position.value,
    mode: mode.value,
    completed: completed.value,
    missed: missed.value,
    reviewCorrect: reviewCorrect.value,
    reviewDone: reviewDone.value,
    extensionOrder: extensionOrder.value,
    resultByTask: resultByTask.value,
    firstCompletionResult: firstCompletionResult.value,
    celebrationShown: celebrationShown.value,
  }))
}

restoreProgress()
watch([section, position, mode, completed, missed, reviewCorrect, reviewDone, resultByTask, firstCompletionResult, celebrationShown], persistProgress, { deep: true })
watch(() => [route.query.knowledgePointId, route.query.review], () => {
  section.value = 'diagnostic'
  position.value = 0
  mode.value = 'digital'
  completed.value = []
  missed.value = []
  reviewCorrect.value = []
  reviewDone.value = []
  resultByTask.value = {}
  firstCompletionResult.value = {}
  celebrationShown.value = false
  extensionOrder.value = []
  restoreProgress()
})

const firstChoice = ref<string | null>(null)
const isIllustratedSample = computed(() => Boolean(currentTask.value))
watch([isIllustratedSample, mode], ([illustrated]) => {
  if (illustrated)
    mode.value = 'digital'
}, { immediate: true })
const answerText = computed(() => currentTask.value ? unitTwoAnswer(currentTask.value) : '')
const sampleChoices = computed(() => currentTask.value ? unitTwoChoices(currentTask.value) : [])
const sampleIndex = computed(() => Number(currentTask.value?.sourceId?.match(/_q(\d)$/)?.[1] ?? 1))
const illustrationPath = computed(() => {
  const task = currentTask.value
  if (!task)
    return ''
  if (task.sourceId?.startsWith('cnm_p008_q'))
    return `/images/questions/g1-math/g1m-u2-p1-q${sampleIndex.value}.png`
  return `/images/questions/g1-math/u2-${task.sourceId ?? task.id}.png`
})
const secondSample = computed(() => currentTask.value?.sourceId === 'cnm_p008_q2')
watch([currentTask, section], () => {
  const answer = section.value === 'review' ? null : currentTask.value && resultByTask.value[currentTask.value.id]?.digital?.answer
  firstChoice.value = typeof answer === 'string' ? answer : null
}, { immediate: true })
function chooseFirst(value: string): void {
  if (firstChoice.value !== null || !currentTask.value)
    return
  firstChoice.value = value
  const result: InteractionResult = { interactionKind: 'choose-one', correct: value === answerText.value, attempts: 1, usedHint: false, skipped: false, stars: value === answerText.value ? 3 : 0, answer: value }
  onResolved(result)
  if (section.value !== 'review' && !result.correct) {
    if (!completed.value.includes(currentTask.value.id))
      completed.value.push(currentTask.value.id)
    firstCompletionResult.value[currentTask.value.id] = result
    if (!missed.value.includes(currentTask.value.id))
      missed.value.push(currentTask.value.id)
  }
}

function onResolved(result: InteractionResult): void {
  const task = currentTask.value
  if (!task)
    return
  if (section.value === 'review') {
    if (!reviewDone.value.includes(task.id))
      reviewDone.value.push(task.id)
    if (result.correct && !reviewCorrect.value.includes(task.id))
      reviewCorrect.value.push(task.id)
    return
  }
  resultByTask.value[task.id] = { ...resultByTask.value[task.id], [mode.value]: result }
  if (result.correct && !completed.value.includes(task.id)) {
    completed.value.push(task.id)
    firstCompletionResult.value[task.id] = result
  }
  if (result.correct && result.attempts > 1 && !missed.value.includes(task.id))
    missed.value.push(task.id)
}

function beginSection(next: UnitTwoSection): void {
  if (next === 'extension') {
    const priority = new Map<string, number>()
    for (const id of missed.value) {
      const task = allTasks.value.find(candidate => candidate.id === id)
      if (task)
        priority.set(task.knowledgePointId, (priority.get(task.knowledgePointId) ?? 0) + 1)
    }
    extensionOrder.value = [...sessionExtensionTasks.value]
      .sort((a, b) => (priority.get(b.knowledgePointId) ?? 0) - (priority.get(a.knowledgePointId) ?? 0))
      .map(task => task.id)
  }
  section.value = next
  position.value = 0
  mode.value = 'digital'
  persistProgress()
}

function continueLearning(): void {
  if (section.value === 'diagnostic')
    beginSection('original')
  else if (section.value === 'original')
    beginSection('extension')
  else if (section.value === 'extension')
    beginSection(missed.value.length ? 'review' : 'summary')
  else if (section.value === 'review') {
    beginSection('summary')
    if (route.query.review === '1') {
      const query = requestedPointId.value ? { knowledgePointId: requestedPointId.value } : {}
      void router.replace({
        name: ROUTE_NAMES.mathUnitTwoPractice,
        params: { gradeId: 'grade-1', categoryId: 'grade-1-math' },
        query,
      })
    }
  }
}

function nextQuestion(): void {
  if (position.value + 1 < stageTasks.value.length) {
    position.value += 1
    mode.value = 'digital'
  }
  else {
    continueLearning()
  }
}

function retryMissed(): void {
  if (requestedPointId.value && isUnitComplete.value) {
    const firstMissed = unitProgress.value.missedTasks[0]
    if (!firstMissed)
      return
    router.push({
      name: ROUTE_NAMES.mathUnitTwoPractice,
      params: { gradeId: 'grade-1', categoryId: 'grade-1-math' },
      query: { knowledgePointId: firstMissed.knowledgePointId, review: '1' },
    })
    return
  }

  reviewDone.value = []
  beginSection('review')
}

function retryKnowledgePoint(pointId: string): void {
  router.push({
    name: ROUTE_NAMES.mathUnitTwoPractice,
    params: { gradeId: 'grade-1', categoryId: 'grade-1-math' },
    query: { knowledgePointId: pointId, review: '1' },
  })
}

function restart(): void {
  localStorage.removeItem(storageKey.value)
  mode.value = 'digital'
  section.value = 'diagnostic'
  position.value = 0
  completed.value = []
  missed.value = []
  reviewCorrect.value = []
  reviewDone.value = []
  resultByTask.value = {}
  firstCompletionResult.value = {}
  celebrationShown.value = false
  extensionOrder.value = []
}

function markCelebrationShown(): void {
  celebrationShown.value = true
  persistProgress()
}

function returnToOutline(): void {
  router.push({ name: ROUTE_NAMES.mathOutline, params: { gradeId: 'grade-1', categoryId: 'grade-1-math' } })
}

function continueToNextKnowledgePoint(): void {
  if (!nextKnowledgePoint.value)
    return
  router.push({
    name: ROUTE_NAMES.mathUnitTwoPractice,
    params: { gradeId: 'grade-1', categoryId: 'grade-1-math' },
    query: { knowledgePointId: nextKnowledgePoint.value.id },
  })
}

if (route.params.gradeId !== 'grade-1' || route.params.categoryId !== 'grade-1-math')
  returnToOutline()
</script>

<template>
  <main class="mx-auto flex w-full max-w-6xl flex-col gap-5 pb-8">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <KButton variant="ghost" size="sm" @click="returnToOutline">
        <KIcon name="arrow-left" size="sm" /> 回到数学大纲
      </KButton>
      <div class="flex flex-wrap gap-2">
        <KTag tone="math" size="sm">
          一年级上册 · 第 2 单元
        </KTag>
        <KTag tone="star" size="sm">
          {{ completed.length }} / {{ totalTasks }} 题
        </KTag>
      </div>
    </div>

    <header v-if="!isIllustratedSample" class="relative overflow-hidden rounded-blob border-2 border-math-line bg-math-soft px-5 py-6 shadow-sticker sm:px-8 sm:py-8">
      <div class="pointer-events-none absolute -right-8 -top-12 size-48 rounded-full bg-white/45" />
      <div class="relative grid gap-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
        <div>
          <p class="font-body text-xs font-extrabold tracking-[0.18em] text-math-deep uppercase">
            今天的数学任务
          </p>
          <h1 class="mt-2 font-display text-3xl text-ink sm:text-4xl">
            {{ sessionKnowledgePoint ? `练习：${sessionKnowledgePoint}` : '第二单元练习' }}
          </h1>
          <p class="mt-3 max-w-2xl font-body text-sm leading-relaxed text-ink-soft sm:text-base">
            {{ sessionKnowledgePoint ? `先快测（计入原题进度），再完成本知识点剩余 ${sessionOriginalTasks.length - 1} 道原题和 ${sessionExtensionTasks.length} 道拓展题。` : '先快测，再完成 28 道原题和 14 道同类变式。' }}每道题都可以看图思考，再选择答案。
          </p>
        </div>
        <div class="flex items-end gap-1.5 rounded-card border-2 border-white/80 bg-white/75 px-3 py-2 shadow-press">
          <figure v-for="character in ['peppa', 'george', 'mummy-pig', 'daddy-pig']" :key="character" class="flex flex-col items-center gap-0.5">
            <img :src="publicAsset(characterAsset(character))" :alt="characters[character]" class="h-12 w-12 rounded-lg bg-white object-contain" width="48" height="48">
            <figcaption class="font-body text-[10px] text-ink-soft">
              {{ characters[character] }}
            </figcaption>
          </figure>
        </div>
      </div>
      <div class="relative mt-5">
        <div class="mb-1.5 flex justify-between font-body text-xs font-bold text-math-deep">
          <span>今日总进度</span><span>{{ completed.length }} / {{ totalTasks }} · {{ completionPercent }}%</span>
        </div>
        <div class="h-3 overflow-hidden rounded-chip border border-white/70 bg-white/80">
          <div class="h-full rounded-chip bg-math-deep transition-[width] duration-500" :style="{ width: `${completionPercent}%` }" />
        </div>
      </div>
    </header>

    <template v-if="!isSummary && currentTask && activeSpec">
      <template v-if="isIllustratedSample">
        <header class="rounded-blob border-2 border-math-line bg-math-soft px-5 py-5 sm:px-7">
          <p class="font-body text-xs font-extrabold text-math-deep">
            {{ currentTask.knowledgePoint }}
          </p><h1 class="mt-2 font-display text-2xl text-ink sm:text-3xl">
            看图想一想
          </h1><p class="mt-2 font-body text-sm text-ink-soft">
            仔细观察图中的数量和变化，再选择答案。
          </p>
        </header>
        <section class="overflow-hidden rounded-card border-2 border-line bg-surface shadow-sticker">
          <div class="grid lg:grid-cols-[minmax(0,1.5fr)_minmax(19rem,1fr)]">
            <div class="relative flex items-center justify-center bg-white p-5 sm:p-7">
              <div class="relative aspect-[3/2] w-full">
                <img :src="publicAsset(illustrationPath)" :alt="`${currentTask.prompt}的题目插图`" class="h-full w-full object-contain">
                <span v-for="stone in currentTask.sourceId === 'cnm_p009_q4' ? [{ n: '9', x: 38, y: 50 }, { n: '5', x: 54.5, y: 50 }, { n: '8', x: 71, y: 50 }, { n: '6', x: 88, y: 50 }] : currentTask.sourceId === 'cnm_p009_q1' ? [{ n: '7', x: 43, y: 59 }, { n: '?', x: 65, y: 59 }, { n: '9', x: 87, y: 59 }] : currentTask.id === 'ext-p008-a' ? [{ n: '6', x: 41.5, y: 50 }, { n: '7', x: 64, y: 50 }, { n: '?', x: 86.5, y: 50 }] : currentTask.id === 'ext-p009-a' ? [{ n: '5', x: 43, y: 59 }, { n: '?', x: 65, y: 59 }, { n: '7', x: 87, y: 59 }] : !currentTask.sourceId?.startsWith('cnm_p008_q') ? [] : sampleIndex === 4 ? [6, 7, 8, 9, 10].map((n, i) => ({ n, x: 18 + i * 18, y: 68 })) : sampleIndex === 3 ? [] : secondSample ? [{ n: '?', x: 25, y: 72 }, { n: '8', x: 54, y: 70 }, { n: '9', x: 81, y: 69 }] : [{ n: '8', x: 33, y: 70 }, { n: '9', x: 58, y: 58 }, { n: '?', x: 84, y: 46 }]" :key="stone.n" class="absolute -translate-x-1/2 -translate-y-1/2 font-display text-3xl font-bold text-ink sm:text-5xl" :style="{ left: `${stone.x}%`, top: `${stone.y}%` }" aria-hidden="true">{{ stone.n }}</span>
              </div>
              <div v-if="['ext-p012-b', 'ext-p013-a', 'ext-p013-b'].includes(currentTask.id)" class="absolute bottom-4 left-5 right-5 flex justify-around gap-1 font-body text-xs font-bold text-ink-soft" aria-label="图中步骤说明">
                <span v-for="label in currentTask.id === 'ext-p012-b' ? ['剩下', '第一次吃', '第二次吃'] : currentTask.id === 'ext-p013-a' ? ['原来', '买来后', '送出后'] : ['原来', '吃掉后', '买来后']" :key="label" class="rounded-chip bg-white/95 px-2 py-1">{{ label }}</span>
              </div>
              <span class="absolute left-8 top-8 rounded-chip bg-white/90 px-3 py-1.5 font-body text-xs font-extrabold text-math-deep shadow-press">仔细看一看</span>
            </div>
            <div class="flex flex-col justify-center p-5 sm:p-7">
              <p class="font-body text-xs font-extrabold tracking-[0.16em] text-math-deep">
                想一想
              </p>
              <h2 class="mt-2 font-display text-2xl leading-relaxed text-ink sm:text-3xl">
                {{ currentTask.prompt }}
              </h2>
              <ol class="mt-6 grid grid-cols-2 gap-3">
                <li v-for="(choice, index) in sampleChoices" :key="choice">
                  <button type="button" class="fx-pressable flex min-h-16 w-full items-center gap-3 rounded-tile border-2 px-4 py-3 text-left" :class="firstChoice === null ? 'border-line bg-paper hover:border-math-deep hover:bg-math-soft' : choice === answerText ? 'border-success bg-success-soft' : firstChoice === choice ? 'border-gently bg-gently-soft' : 'border-line bg-paper opacity-70'" :disabled="firstChoice !== null" @click="chooseFirst(choice)">
                    <span class="grid size-9 place-items-center rounded-full border-2 border-math-line font-numeric text-xs font-extrabold text-math-deep">{{ ['A', 'B', 'C', 'D'][index] }}</span><span class="font-display text-xl text-ink">{{ choice }}</span>
                  </button>
                </li>
              </ol>
              <div v-if="firstChoice !== null" class="mt-5 rounded-tile border-2 p-4" :class="firstChoice === answerText ? 'border-success bg-success-soft' : 'border-gently bg-gently-soft'" aria-live="polite">
                <p class="font-display text-lg text-ink">
                  {{ firstChoice === answerText ? '数得真仔细！' : '来看看怎么数' }}
                </p><p class="mt-2 font-body text-sm text-ink-soft">
                  {{ currentTask.explanation }}
                </p>
              </div>
              <KButton
                v-if="firstChoice !== null"
                class="mt-5 self-end"
                variant="primary"
                tone="math"
                size="lg"
                @click="nextQuestion"
              >
                下一题 <KIcon name="arrow-right" size="sm" />
              </KButton>
            </div>
          </div>
        </section>
      </template>
    </template>

    <MathUnitTwoSummary
      v-else
      :original-count="completedOriginalCount"
      :total-original-count="sessionOriginalTasks.length"
      :extension-count="completedExtensionCount"
      :total-extension-count="sessionExtensionTasks.length"
      :knowledge-point-name="sessionKnowledgePoint"
      :next-knowledge-point-name="nextKnowledgePoint?.name"
      :accuracy="firstTryAccuracy"
      :missed-tasks="summaryMissedTasks"
      :review-correct-ids="summaryReviewCorrectIds"
      :point-summary="pointSummary"
      :unit-complete="isUnitComplete"
      :unit-accuracy="unitProgress.accuracy"
      :unit-correct-count="unitProgress.originalCorrectCount"
      :unit-original-count="unitProgress.originalTotalCount"
      :unit-extension-count="unitProgress.extensionCompletedCount"
      :unit-extension-total-count="unitProgress.extensionTotalCount"
      :unit-completed-point-count="unitProgress.completedPointCount"
      :unit-point-count="unitProgress.totalPointCount"
      :unit-correction-count="unitProgress.correctedCount"
      :unit-point-summary="unitProgress.pointSummary"
      :character-image="characterAsset('peppa')"
      :play-celebration="!celebrationShown"
      @retry-missed="retryMissed"
      @retry-point="retryKnowledgePoint"
      @celebration-played="markCelebrationShown"
      @restart="restart"
      @next-knowledge-point="continueToNextKnowledgePoint"
      @return-to-outline="returnToOutline"
    />
  </main>
</template>
