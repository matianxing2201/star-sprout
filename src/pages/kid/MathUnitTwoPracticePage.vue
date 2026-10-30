<script setup lang="ts">
import type { PracticeMode, UnitTwoSection, UnitTwoTask } from '@/content/grades/grade-1/math-unit-two-practice'
import type { InteractionResult } from '@/domain'
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { ROUTE_NAMES } from '@/app/router/route-names'
import {
  characterAsset,
  grade1MathUnitTwoExtensionTasks,
  grade1MathUnitTwoOriginalTasks,
  interactionFor,
  isDiagnosticTask,
} from '@/content/grades/grade-1/math-unit-two-practice'
import { InteractionShell } from '@/features/interactions'
import { publicAsset } from '@/shared/utils'
import { KButton, KIcon, KTag } from '@/ui'
import MathUnitTwoPictureScene from './MathUnitTwoPictureScene.vue'
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
const sessionKnowledgePoint = computed(() => sessionOriginalTasks.value[0]?.knowledgePoint)
const unitTwoKnowledgePoints = [...new Map(grade1MathUnitTwoOriginalTasks.map(task => [task.knowledgePointId, task.knowledgePoint])).entries()]
  .map(([id, name]) => ({ id, name }))
const nextKnowledgePoint = computed(() => {
  if (!requestedPointId.value)
    return undefined
  const currentIndex = unitTwoKnowledgePoints.findIndex(point => point.id === requestedPointId.value)
  return unitTwoKnowledgePoints[currentIndex + 1]
})
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

const sectionTitles: Record<UnitTwoSection, string> = {
  diagnostic: '开场快测',
  original: '原题练习',
  extension: '举一反三',
  review: '错题回顾',
  summary: '学习总结',
}
const sectionDescriptions: Record<UnitTwoSection, string> = {
  diagnostic: '每个知识点先做一道，看看今天从哪里开始。',
  original: '按原题逐题练习，题干和原有选项都保留。',
  extension: '每个知识点再练两道同题型变式。',
  review: '把刚才答错过的题再做一次，自己订正。',
  summary: '今天的第二单元学习记录。',
}
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
const displayLabel = computed(() => currentTask.value?.label === '原题' && mode.value === 'picture'
  ? '原题 · 同题型看图变式'
  : currentTask.value?.label ?? '')
const isSummary = computed(() => section.value === 'summary')
const totalTasks = computed(() => sessionOriginalTasks.value.length + sessionExtensionTasks.value.length)
const completedOriginalCount = computed(() => completed.value.filter(id => sessionOriginalTasks.value.some(task => task.id === id)).length)
const completedExtensionCount = computed(() => completed.value.filter(id => sessionExtensionTasks.value.some(task => task.id === id)).length)
const completionPercent = computed(() => Math.round(completed.value.length / totalTasks.value * 100))
const correctOnFirstTry = computed(() => Object.values(firstCompletionResult.value)
  .filter(result => result.correct && result.attempts === 1)
  .length)
const firstTryAccuracy = computed(() => completed.value.length
  ? Math.round(correctOnFirstTry.value / completed.value.length * 100)
  : 0)
const activeResult = computed(() => currentTask.value ? resultByTask.value[currentTask.value.id]?.[mode.value] ?? null : null)
const activeSpec = computed(() => currentTask.value ? interactionFor(currentTask.value, mode.value) : null)
const isReviewing = computed(() => section.value === 'review')
const canAdvance = computed(() => isReviewing.value
  ? Boolean(currentTask.value && reviewDone.value.includes(currentTask.value.id))
  : Boolean(activeResult.value?.correct))
const currentNumber = computed(() => position.value + 1)
const sectionProgress = computed(() => stageTasks.value.length ? Math.round(position.value / stageTasks.value.length * 100) : 100)

const pointSummary = computed(() => {
  const points = [...new Map(sessionOriginalTasks.value.map(task => [task.knowledgePointId, task.knowledgePoint])).entries()]
  return points.map(([id, label]) => {
    const initialMisses = missed.value.filter(taskId => allTasks.value.find(task => task.id === taskId)?.knowledgePointId === id)
    return { id, label, needsPractice: initialMisses.length > 0, missedCount: initialMisses.length }
  })
})
const missedTasks = computed(() => missed.value
  .map(id => allTasks.value.find(task => task.id === id))
  .filter((task): task is UnitTwoTask => Boolean(task)))

function restoreProgress(): void {
  try {
    const saved = localStorage.getItem(storageKey.value)
    if (!saved)
      return
    const state = JSON.parse(saved) as {
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
    }
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
  }))
}

restoreProgress()
watch([section, position, mode, completed, missed, reviewCorrect, reviewDone, resultByTask, firstCompletionResult], persistProgress, { deep: true })
watch(() => route.query.knowledgePointId, () => {
  section.value = 'diagnostic'
  position.value = 0
  mode.value = 'digital'
  completed.value = []
  missed.value = []
  reviewCorrect.value = []
  reviewDone.value = []
  resultByTask.value = {}
  firstCompletionResult.value = {}
  extensionOrder.value = []
  restoreProgress()
})

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
  else if (section.value === 'review')
    beginSection('summary')
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
  reviewDone.value = []
  beginSection('review')
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
  extensionOrder.value = []
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

    <header class="relative overflow-hidden rounded-blob border-2 border-math-line bg-math-soft px-5 py-6 shadow-sticker sm:px-8 sm:py-8">
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
            {{ sessionKnowledgePoint ? `先快测（计入原题进度），再完成本知识点剩余 ${sessionOriginalTasks.length - 1} 道原题和 ${sessionExtensionTasks.length} 道拓展题。` : '先快测，再完成 28 道原题和 14 道同类变式。' }}每道题都可以切换“数字互动”或“看图互动”。
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
      <section class="grid gap-5 lg:grid-cols-[minmax(0,1fr)_17rem]">
        <div class="rounded-card border-2 border-line bg-surface p-4 shadow-sticker sm:p-6">
          <div class="mb-5 flex flex-wrap items-start justify-between gap-3">
            <div>
              <p class="font-body text-xs font-extrabold tracking-[0.15em] text-math-deep uppercase">
                {{ sectionTitles[section] }} · {{ currentNumber }} / {{ stageTasks.length }}
              </p>
              <h2 class="mt-1 font-display text-xl text-ink">
                {{ currentTask.knowledgePoint }}
              </h2>
              <p class="mt-1 font-body text-xs text-ink-faint">
                {{ displayLabel }}<template v-if="currentTask.sourceId">
                  · {{ currentTask.sourceId }}
                </template>
              </p>
            </div>
            <KTag :tone="currentTask.label === '原题' ? 'math' : 'star'" size="sm">
              {{ mode === 'picture' && currentTask.label === '原题' ? '同题型变式' : currentTask.label }}
            </KTag>
          </div>
          <div class="mb-5 h-2 overflow-hidden rounded-chip bg-paper-deep">
            <div class="h-full rounded-chip bg-math-deep transition-[width] duration-300" :style="{ width: `${sectionProgress}%` }" />
          </div>

          <div class="mb-5 flex justify-center">
            <div class="flex rounded-chip border border-line bg-paper p-1" role="group" aria-label="选择互动方式">
              <button type="button" class="rounded-chip px-4 py-2 font-body text-sm font-bold transition-colors" :class="mode === 'digital' ? 'bg-surface text-ink shadow-press' : 'text-ink-soft'" :aria-pressed="mode === 'digital'" @click="mode = 'digital'">
                数字互动
              </button>
              <button type="button" class="rounded-chip px-4 py-2 font-body text-sm font-bold transition-colors" :class="mode === 'picture' ? 'bg-surface text-ink shadow-press' : 'text-ink-soft'" :aria-pressed="mode === 'picture'" @click="mode = 'picture'">
                看图互动
              </button>
            </div>
          </div>

          <MathUnitTwoPictureScene v-if="mode === 'picture' && !currentTask.picture.sequence" :picture="currentTask.picture" />

          <KeepAlive :max="2">
            <InteractionShell
              v-if="isReviewing || !activeResult?.correct"
              :key="`${section}-${currentTask.id}-${mode}`"
              :spec="activeSpec"
              mascot="rabbit"
              :mascot-avatar-image="publicAsset(characterAsset(mode === 'digital' ? 'peppa' : currentTask.picture.character))"
              :initial-line="mode === 'digital' ? '我们先把原题读清楚，一步一步来。' : `${currentTask.picture.characterName}陪你一起看图思考。`"
              @resolved="onResolved"
            />
          </KeepAlive>
          <div v-if="!isReviewing && activeResult?.correct" class="rounded-tile border-2 border-success bg-success-soft px-5 py-4" aria-live="polite">
            <p class="flex items-center gap-2 font-display text-lg text-success-deep">
              <KIcon name="check-circle" size="sm" tone="success" />答对啦！
            </p>
            <p class="mt-1.5 font-body text-sm leading-relaxed text-ink-soft">
              {{ mode === 'digital' ? currentTask.explanation : currentTask.picture.explanation }}
            </p>
            <p v-if="currentTask.sourceId" class="mt-2 font-body text-xs text-ink-faint">
              原题答案：{{ currentTask.answer }}
            </p>
          </div>

          <div v-if="isReviewing && reviewDone.includes(currentTask.id)" class="mt-4 rounded-tile border-2 border-success bg-success-soft px-4 py-3 font-body text-sm leading-relaxed text-success-deep">
            <p>{{ reviewCorrect.includes(currentTask.id) ? '订正成功，已经把这道题重新做对了。' : '这次已经完成；可以回看提示，再和家长一起讲一遍思路。' }}</p>
            <p class="mt-1.5 text-ink-soft">
              {{ mode === 'digital' ? currentTask.explanation : currentTask.picture.explanation }}
            </p>
          </div>
          <div v-if="canAdvance" class="mt-5 flex justify-end">
            <KButton variant="primary" tone="math" size="lg" @click="nextQuestion">
              {{ currentNumber < stageTasks.length ? '下一题' : section === 'diagnostic' ? '进入原题练习' : section === 'original' ? '进入举一反三' : section === 'extension' ? (missed.length ? '开始错题订正' : '查看学习总结') : '查看学习总结' }}
              <KIcon name="arrow-right" size="sm" />
            </KButton>
          </div>
        </div>

        <aside class="flex flex-col gap-4">
          <div class="rounded-card border-2 border-line bg-paper p-5 shadow-press">
            <div class="flex items-center gap-2 font-display text-lg text-ink">
              <KIcon name="sparkle" size="sm" tone="math" />本部分安排
            </div>
            <p class="mt-2 font-body text-sm leading-relaxed text-ink-soft">
              {{ sectionDescriptions[section] }}
            </p>
            <div class="mt-4 space-y-2 font-body text-xs text-ink-soft">
              <p class="flex justify-between">
                <span>原题</span><strong>{{ completedOriginalCount }} / {{ sessionOriginalTasks.length }}</strong>
              </p>
              <p class="flex justify-between">
                <span>拓展题</span><strong>{{ completedExtensionCount }} / {{ sessionExtensionTasks.length }}</strong>
              </p>
              <p class="flex justify-between">
                <span>待回顾错题</span><strong>{{ missed.length }} 道</strong>
              </p>
            </div>
          </div>
          <div class="rounded-card border-2 border-math-line/70 bg-math-soft/60 p-5">
            <p class="font-body text-xs font-extrabold tracking-[0.14em] text-math-deep uppercase">
              题型规则
            </p>
            <p class="mt-2 font-body text-sm leading-relaxed text-ink-soft">
              同一道题切换表达方式，数学任务保持一致。数列题固定 5 格；加法、减法、比较和应用题继续按各自题型作答。
            </p>
          </div>
        </aside>
      </section>
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
      :missed-tasks="missedTasks"
      :review-correct-ids="reviewCorrect"
      :point-summary="pointSummary"
      @retry-missed="retryMissed"
      @restart="restart"
      @next-knowledge-point="continueToNextKnowledgePoint"
      @return-to-outline="returnToOutline"
    />

    <footer class="rounded-tile border border-line bg-paper/80 px-4 py-3 font-body text-xs leading-relaxed text-ink-faint">
      原题来源：
      <a href="https://github.com/xiaoyang111222/cn-math-taxonomy/blob/main/data/questions.json" target="_blank" rel="noreferrer" class="font-semibold text-math-deep underline underline-offset-2">cn-math-taxonomy · 第二单元共 28 题</a>
      · 依据 <a href="https://creativecommons.org/licenses/by-nc/4.0/" target="_blank" rel="noreferrer" class="font-semibold text-math-deep underline underline-offset-2">CC BY-NC 4.0</a>
      · 原题文字和原选项保留；看图互动为同题型变式。
    </footer>
  </main>
</template>
