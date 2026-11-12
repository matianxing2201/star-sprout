<script setup lang="ts">
import type { CurriculumKnowledgePoint, MultipleChoiceQuestion } from '@/domain'

import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { ROUTE_NAMES } from '@/app/router/route-names'
import { grade1ChineseQuestionBank as bank, grade1ChineseQuestionCount } from '@/content/grades/grade-1/chinese-question-bank'
import { RewardLayer } from '@/features/reward'
import { useFeedbackStore, useQuestionBankProgressStore } from '@/stores'
import { KButton, KIcon, KTag } from '@/ui'
import ChineseAeToneLesson from './ChineseAeToneLesson.vue'

type QuestionFeedback = 'waiting' | 'hint' | 'correct' | 'revealed'

const route = useRoute()
const router = useRouter()
const progress = useQuestionBankProgressStore()
const feedback = useFeedbackStore()

const savedUnitIndex = bank.units.findIndex(unit => unit.id === progress.snapshot.currentUnitId)
const unitIndex = ref(savedUnitIndex >= 0 ? savedUnitIndex : 0)
const initialUnit = bank.units[unitIndex.value]!
const savedPointIndex = initialUnit.knowledgePoints.findIndex(point => point.id === progress.snapshot.currentPointId)
const pointIndex = ref(savedPointIndex >= 0 ? savedPointIndex : 0)
const questionIndex = ref(0)
const selectedAnswer = ref<string | null>(null)
const questionFeedback = ref<QuestionFeedback>('waiting')
const showingPointSummary = ref(false)
const reviewMode = ref(false)
const reviewQuestionIds = ref<string[]>([])
const finished = ref(false)
const illustrationFailed = ref(false)
const celebratingPointId = ref<string | null>(null)
const lessonMode = ref(false)

const currentUnit = computed(() => bank.units[unitIndex.value]!)
const currentPoint = computed<CurriculumKnowledgePoint>(() => currentUnit.value.knowledgePoints[pointIndex.value]!)
const isAeTonePoint = computed(() => currentPoint.value.id === 'cnc_p008')
const activeQuestions = computed(() => {
  if (!reviewMode.value)
    return currentPoint.value.questions
  return reviewQuestionIds.value
    .map(id => currentPoint.value.questions.find(question => question.id === id))
    .filter((question): question is MultipleChoiceQuestion => Boolean(question))
})
const currentQuestion = computed(() => activeQuestions.value[questionIndex.value] ?? currentPoint.value.questions[0]!)
const illustrationUrl = computed(() => `${import.meta.env.BASE_URL}${currentQuestion.value.illustration.replace(/^\//, '')}`)
const pointsInUnit = computed(() => currentUnit.value.knowledgePoints.length)
const resolved = computed(() => questionFeedback.value === 'correct' || questionFeedback.value === 'revealed')
const correct = computed(() => questionFeedback.value === 'correct')
const questionAttemptCount = computed(() => progress.snapshot.attemptsByQuestionId[currentQuestion.value.id] ?? 0)
const completedQuestionIds = computed(() => new Set(progress.snapshot.completedQuestionIds))
const completedQuestionCount = computed(() => progress.snapshot.completedQuestionIds.length)
const completedPointCount = computed(() => progress.snapshot.completedPointIds.length)
const completedPointsInUnit = computed(() => currentUnit.value.knowledgePoints.filter(point => progress.snapshot.completedPointIds.includes(point.id)).length)
const pointCompletedCount = computed(() => currentPoint.value.questions.filter(question => completedQuestionIds.value.has(question.id)).length)
const firstTryCorrectCount = computed(() => currentPoint.value.questions.filter(question => progress.snapshot.firstTryCorrectByQuestionId[question.id] === true).length)
const pointAccuracy = computed(() => Math.round(firstTryCorrectCount.value / currentPoint.value.questions.length * 100))
const pointStars = computed(() => pointAccuracy.value >= 90 ? 3 : pointAccuracy.value >= 70 ? 2 : 1)
const missedQuestions = computed(() => currentPoint.value.questions.filter(question => progress.snapshot.missedQuestionIds.includes(question.id)))
const completedInFirstTry = computed(() => bank.units
  .flatMap(unit => unit.knowledgePoints)
  .flatMap(point => point.questions)
  .filter(question => progress.snapshot.firstTryCorrectByQuestionId[question.id] === true)
  .length)
const overallAccuracy = computed(() => Math.round(completedInFirstTry.value / grade1ChineseQuestionCount * 100))
const overallStars = computed(() => overallAccuracy.value >= 90 ? 3 : overallAccuracy.value >= 70 ? 2 : 1)
const pointResultMessage = computed(() => {
  if (pointStars.value === 3)
    return '这组题好多都一次答对啦！带着这份认真继续去下一组吧。'
  if (pointStars.value === 2)
    return '你已经掌握不少啦。刚才需要再想一想的题，也可以回头练熟。'
  return '这一组完成啦！每道错题都能告诉我们下一步练什么。'
})

watch(() => currentQuestion.value.id, () => {
  illustrationFailed.value = false
})

function resetQuestion(): void {
  lessonMode.value = false
  selectedAnswer.value = null
  questionFeedback.value = 'waiting'
  reviewMode.value = false
  reviewQuestionIds.value = []
  showingPointSummary.value = false
  finished.value = false
  celebratingPointId.value = null
  progress.setLocation(currentUnit.value.id, currentPoint.value.id)

  const nextQuestionIndex = currentPoint.value.questions.findIndex(question => !completedQuestionIds.value.has(question.id))
  questionIndex.value = nextQuestionIndex >= 0 ? nextQuestionIndex : 0
  if (nextQuestionIndex < 0)
    showingPointSummary.value = true
}

function selectUnit(index: number): void {
  unitIndex.value = index
  pointIndex.value = 0
  const point = currentUnit.value.knowledgePoints[0]!
  progress.setLocation(currentUnit.value.id, point.id)
  resetQuestion()
}

function selectPoint(index: number): void {
  pointIndex.value = index
  progress.setLocation(currentUnit.value.id, currentPoint.value.id)
  resetQuestion()
}

function answer(choiceId: string): void {
  if (resolved.value || selectedAnswer.value === choiceId)
    return

  selectedAnswer.value = choiceId
  const isCorrect = choiceId === currentQuestion.value.answerId
  progress.recordAttempt(currentQuestion.value.id, isCorrect)
  questionFeedback.value = isCorrect ? 'correct' : 'hint'
}

function revealExplanation(): void {
  questionFeedback.value = 'revealed'
}

function showPointResult(): void {
  progress.completePoint(currentPoint.value.id)
  showingPointSummary.value = true
  if (!progress.markPointCelebrated(currentPoint.value.id))
    return

  celebratingPointId.value = currentPoint.value.id
  feedback.celebrate({
    tier: 'lesson',
    mascot: 'fox',
    // 题库题组没有正式课程完成记录；成长星仅由结算卡上的正确率评分呈现。
    stars: 0,
    message: `完成「${currentPoint.value.title}」啦！`,
  })
}

function continueLearning(): void {
  if (!resolved.value)
    return

  progress.resolveQuestion(currentQuestion.value.id, correct.value)
  selectedAnswer.value = null
  questionFeedback.value = 'waiting'

  if (questionIndex.value + 1 < activeQuestions.value.length) {
    questionIndex.value += 1
    return
  }

  if (reviewMode.value) {
    reviewMode.value = false
    reviewQuestionIds.value = []
    questionIndex.value = 0
    showingPointSummary.value = true
    return
  }

  showPointResult()
}

function startMistakeReview(): void {
  reviewQuestionIds.value = missedQuestions.value.map(question => question.id)
  if (reviewQuestionIds.value.length === 0)
    return
  reviewMode.value = true
  questionIndex.value = 0
  selectedAnswer.value = null
  questionFeedback.value = 'waiting'
  showingPointSummary.value = false
}

function startPointAgain(): void {
  selectedAnswer.value = null
  questionFeedback.value = 'waiting'
  reviewMode.value = false
  reviewQuestionIds.value = []
  questionIndex.value = 0
  showingPointSummary.value = false
  celebratingPointId.value = null
}

function startAeToneLesson(): void {
  lessonMode.value = true
}

function startOriginalPractice(): void {
  lessonMode.value = false
  resetQuestion()
  if (showingPointSummary.value)
    startPointAgain()
}

function continueFromPointSummary(): void {
  if (pointIndex.value + 1 < currentUnit.value.knowledgePoints.length) {
    selectPoint(pointIndex.value + 1)
    return
  }

  if (unitIndex.value + 1 < bank.units.length) {
    selectUnit(unitIndex.value + 1)
    return
  }

  showingPointSummary.value = false
  finished.value = true
}

function questionStatus(question: MultipleChoiceQuestion): string {
  if (progress.snapshot.missedQuestionIds.includes(question.id))
    return '需要再练'
  if (progress.snapshot.firstTryCorrectByQuestionId[question.id] === true)
    return '一次答对'
  return '后来答对'
}

resetQuestion()

if (route.params.gradeId !== bank.gradeId || route.params.categoryId !== bank.categoryId)
  router.replace({ name: ROUTE_NAMES.categories, params: { gradeId: bank.gradeId } })
</script>

<template>
  <div class="flex flex-col gap-6">
    <RewardLayer />

    <header class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <button
          type="button"
          class="fx-tap mb-3 inline-flex items-center gap-1 rounded-chip px-2 py-1 font-body text-sm font-bold text-ink-soft hover:bg-surface hover:text-ink"
          @click="router.push({ name: ROUTE_NAMES.categories, params: { gradeId: bank.gradeId } })"
        >
          <KIcon name="arrow-left" size="sm" /> 年级大纲
        </button>
        <p class="font-body text-xs font-bold tracking-[0.18em] text-language-deep uppercase">
          一年级 · {{ bank.semester }}语文
        </p>
        <h1 class="mt-1 font-display text-3xl text-ink sm:text-4xl">
          语文探险书
        </h1>
        <p class="mt-2 max-w-2xl font-body text-sm leading-relaxed text-ink-soft">
          跟着课文里的字词和故事，完成每一小步。答错先找线索，订正后再收下这一组的星星。
        </p>
      </div>

      <div class="flex flex-wrap gap-2">
        <KTag tone="language" size="md">
          <KIcon name="book-open" size="sm" /> {{ bank.units.length }} 个单元
        </KTag>
        <KTag tone="star" size="md">
          <KIcon name="sparkle" size="sm" /> {{ grade1ChineseQuestionCount }} 道题
        </KTag>
        <KTag tone="success" size="md">
          <KIcon name="check" size="sm" /> 已完成 {{ completedQuestionCount }} / {{ grade1ChineseQuestionCount }}
        </KTag>
      </div>
    </header>

    <div class="grid items-start gap-5 xl:grid-cols-[18rem_minmax(0,1fr)]">
      <aside class="rounded-blob border-2 border-line bg-surface p-4 shadow-sticker xl:sticky xl:top-24">
        <div class="mb-3 flex items-center justify-between px-1">
          <h2 class="font-display text-lg text-ink">
            上册单元
          </h2>
          <span class="font-numeric text-xs font-bold text-ink-faint">{{ unitIndex + 1 }} / {{ bank.units.length }}</span>
        </div>
        <ol class="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
          <li v-for="(unit, index) in bank.units" :key="unit.id">
            <button
              type="button"
              class="fx-tap flex w-full items-center gap-3 rounded-tile border-2 p-3 text-left transition-colors"
              :class="unitIndex === index ? 'border-language-deep bg-language-soft' : 'border-line bg-paper hover:bg-paper-deep'"
              :aria-pressed="unitIndex === index"
              @click="selectUnit(index)"
            >
              <span class="grid size-8 shrink-0 place-items-center rounded-full bg-surface font-numeric text-sm font-extrabold text-language-deep shadow-press">
                {{ String(index + 1).padStart(2, '0') }}
              </span>
              <span class="min-w-0 flex-1">
                <span class="block font-display text-sm leading-snug text-ink">{{ unit.title }}</span>
                <span class="mt-0.5 block font-body text-[11px] text-ink-faint">{{ unit.knowledgePoints.length }} 个知识点</span>
              </span>
              <KIcon v-if="unitIndex === index" name="arrow-right" size="sm" tone="language" />
            </button>
          </li>
        </ol>
      </aside>

      <main class="min-w-0 rounded-blob border-2 border-line bg-paper-deep/50 p-4 sm:p-6">
        <template v-if="!finished">
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p class="font-body text-xs font-bold tracking-[0.16em] text-ink-faint uppercase">
                第 {{ currentUnit.order }} 单元
              </p>
              <h2 class="mt-1 font-display text-2xl text-ink sm:text-3xl">
                {{ currentUnit.title }}
              </h2>
              <p class="mt-2 font-body text-sm text-ink-soft">
                本单元已完成 {{ completedPointsInUnit }} / {{ pointsInUnit }} 组知识点
              </p>
            </div>
            <KTag tone="explore" size="sm">
              {{ pointsInUnit }} 个小发现
            </KTag>
          </div>

          <div
            class="mt-4 h-3 overflow-hidden rounded-chip bg-surface"
            role="progressbar"
            :aria-valuenow="completedPointsInUnit"
            :aria-valuemin="0"
            :aria-valuemax="pointsInUnit"
            :aria-label="`本单元完成 ${completedPointsInUnit} / ${pointsInUnit} 组知识点`"
          >
            <div class="h-full rounded-chip bg-language-deep" :style="{ width: `${pointsInUnit ? completedPointsInUnit / pointsInUnit * 100 : 0}%` }" />
          </div>

          <div class="mt-5 flex gap-2 overflow-x-auto pb-2" aria-label="选择知识点">
            <button
              v-for="(point, index) in currentUnit.knowledgePoints"
              :key="point.id"
              type="button"
              class="fx-tap flex shrink-0 items-center gap-2 rounded-chip border-2 px-3 py-2 font-body text-xs font-bold transition-colors"
              :class="pointIndex === index ? 'border-language-deep bg-language text-white' : 'border-line bg-surface text-ink-soft hover:bg-paper'"
              :aria-pressed="pointIndex === index"
              @click="selectPoint(index)"
            >
              {{ point.title }}
              <KIcon v-if="progress.snapshot.completedPointIds.includes(point.id)" name="check" size="xs" />
            </button>
          </div>

          <div v-if="isAeTonePoint && !lessonMode" class="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-card border-2 border-language-line bg-language-soft/70 p-4">
            <div>
              <p class="font-display text-base text-ink">
                先上互动小课，再做原题
              </p>
              <p class="mt-1 font-body text-xs leading-relaxed text-ink-soft">
                口型观察、四声手势、12 个拼音跟读和 6 道变式挑战 · 约 18 分钟
              </p>
            </div>
            <KButton size="md" variant="primary" tone="language" @click="startAeToneLesson">
              {{ progress.snapshot.completedPointIds.includes(currentPoint.id) ? '重温互动小课' : '开始互动小课' }}
              <KIcon name="arrow-right" size="sm" />
            </KButton>
          </div>

          <ChineseAeToneLesson
            v-if="lessonMode"
            class="mt-3"
            @cancel="lessonMode = false"
            @practice-originals="startOriginalPractice"
          />

          <section v-if="showingPointSummary && !lessonMode" class="mt-3 grid gap-4" aria-live="polite">
            <div class="rounded-blob border-2 border-success-line bg-success-soft p-5 shadow-sticker sm:p-7">
              <div class="flex flex-wrap items-start justify-between gap-4">
                <div class="min-w-0 flex-1">
                  <KTag tone="success" size="sm">
                    知识点完成 · {{ currentUnit.order }} 单元
                  </KTag>
                  <h3 class="mt-3 font-display text-2xl text-ink sm:text-3xl">
                    {{ currentPoint.title }}练完啦！
                  </h3>
                  <p class="mt-2 font-body text-sm leading-relaxed text-ink-soft">
                    {{ pointResultMessage }}
                  </p>
                </div>
                <div class="rounded-card border-2 border-white bg-white/75 px-4 py-3 text-center">
                  <div class="flex items-center justify-center gap-1" :aria-label="`首次答题获得 ${pointStars} 颗星星，共三颗`">
                    <KIcon
                      v-for="star in 3"
                      :key="star"
                      name="star"
                      size="xl"
                      :weight="star <= pointStars ? 'fill' : 'regular'"
                      :class="star <= pointStars ? (celebratingPointId === currentPoint.id ? 'animate-pop-in text-star' : 'text-star') : 'text-ink-faint/35'"
                      :style="star <= pointStars && celebratingPointId === currentPoint.id ? { animationDelay: `${(star - 1) * 80}ms` } : undefined"
                    />
                  </div>
                  <p class="mt-1 font-body text-xs font-bold text-star-deep">
                    收下 {{ pointStars }} 颗星星
                  </p>
                </div>
              </div>

              <div class="mt-5 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
                <div>
                  <div class="flex items-center justify-between gap-3 font-body text-sm">
                    <span class="font-bold text-ink">原题首次答对</span>
                    <span class="font-numeric font-bold text-success-deep">{{ firstTryCorrectCount }} / {{ currentPoint.questions.length }}</span>
                  </div>
                  <div
                    class="mt-2 h-3 overflow-hidden rounded-chip bg-white/80"
                    role="progressbar"
                    :aria-valuenow="pointAccuracy"
                    :aria-valuemin="0"
                    :aria-valuemax="100"
                    :aria-label="`本组首次正确率 ${pointAccuracy}%`"
                  >
                    <div class="h-full rounded-chip bg-success-deep" :style="{ width: `${pointAccuracy}%` }" />
                  </div>
                  <p class="mt-1 font-body text-xs text-ink-faint">
                    首次正确率 {{ pointAccuracy }}% · 完成 {{ pointCompletedCount }} / {{ currentPoint.questions.length }} 题
                  </p>
                </div>
                <KTag :tone="missedQuestions.length ? 'think' : 'success'" size="sm">
                  {{ missedQuestions.length ? `还有 ${missedQuestions.length} 题待回练` : '错题都订正好了' }}
                </KTag>
              </div>
            </div>

            <section class="rounded-card border-2 border-line bg-surface p-5">
              <div class="flex flex-wrap items-center justify-between gap-2">
                <h4 class="font-display text-lg text-ink">
                  这组题的练习记录
                </h4>
                <KTag tone="language" size="sm">
                  {{ currentPoint.questions.length }} 道原题
                </KTag>
              </div>
              <ul class="mt-3 divide-y divide-line">
                <li v-for="question in currentPoint.questions" :key="question.id" class="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                  <KIcon :name="progress.snapshot.missedQuestionIds.includes(question.id) ? 'refresh' : 'check'" size="sm" :tone="progress.snapshot.missedQuestionIds.includes(question.id) ? 'think' : 'success'" />
                  <div class="min-w-0 flex-1">
                    <p class="font-body text-sm font-semibold leading-relaxed text-ink">
                      {{ question.prompt }}
                    </p>
                    <p class="mt-0.5 font-body text-xs text-ink-faint">
                      {{ questionStatus(question) }}
                    </p>
                  </div>
                </li>
              </ul>
              <KButton v-if="missedQuestions.length" class="mt-4" variant="soft" tone="think" @click="startMistakeReview">
                再练这组错题 <KIcon name="arrow-right" size="sm" />
              </KButton>
            </section>

            <div class="flex flex-wrap justify-end gap-3">
              <KButton variant="ghost" @click="startPointAgain">
                再练本组
              </KButton>
              <KButton variant="primary" tone="language" size="lg" @click="continueFromPointSummary">
                {{ pointIndex + 1 < currentUnit.knowledgePoints.length ? '继续下一个知识点' : unitIndex + 1 < bank.units.length ? '继续下一个单元' : '完成上册探险' }}
                <KIcon name="arrow-right" size="sm" />
              </KButton>
            </div>
          </section>

          <template v-else-if="!lessonMode">
            <section class="mt-3 overflow-hidden rounded-card border-2 border-line bg-surface shadow-sticker">
              <div class="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-3 sm:px-5">
                <div class="flex flex-wrap items-center gap-2">
                  <KTag tone="language" size="sm">
                    {{ currentPoint.domain }}
                  </KTag>
                  <h3 class="font-display text-base text-ink">
                    {{ currentPoint.title }}
                  </h3>
                  <KTag v-if="reviewMode" tone="think" size="sm">
                    错题回练
                  </KTag>
                </div>
                <span class="font-numeric text-xs font-bold text-ink-faint">
                  第 {{ questionIndex + 1 }} / {{ activeQuestions.length }} 题
                </span>
              </div>

              <div class="grid lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
                <div class="relative flex min-h-56 items-center bg-language-soft p-3 sm:p-4">
                  <img
                    v-if="!illustrationFailed"
                    :src="illustrationUrl"
                    :alt="`童书插图：${currentQuestion.prompt}`"
                    class="aspect-[3/2] w-full rounded-tile object-contain shadow-press"
                    width="640"
                    height="480"
                    @error="illustrationFailed = true"
                  >
                  <div v-else class="grid aspect-[3/2] w-full place-items-center rounded-tile border-2 border-dashed border-language-deep/30 bg-paper/70 px-4 text-center font-body text-sm font-bold text-ink-soft">
                    插图暂时没有显示，先读读题目再选答案吧。
                  </div>
                  <span class="absolute top-7 left-7 rounded-chip bg-paper/90 px-3 py-1 font-body text-[11px] font-bold text-language-deep shadow-press">
                    看一看，再想一想
                  </span>
                </div>

                <div class="p-4 sm:p-6">
                  <p class="mb-3 font-body text-xs font-bold tracking-[0.18em] text-language-deep uppercase">
                    想一想，选一选
                  </p>
                  <p class="font-display text-xl leading-relaxed text-ink sm:text-2xl">
                    {{ currentQuestion.prompt }}
                  </p>

                  <ol class="mt-5 grid gap-2.5">
                    <li v-for="choice in currentQuestion.choices" :key="choice.id">
                      <button
                        type="button"
                        class="fx-pressable flex min-h-14 w-full items-center gap-3 rounded-tile border-2 px-3 py-3 text-left transition-colors"
                        :class="[
                          resolved && choice.id === currentQuestion.answerId ? 'border-success bg-success-soft'
                          : selectedAnswer === choice.id && questionFeedback === 'hint' ? 'border-gently bg-gently-soft'
                            : 'border-line bg-paper hover:border-language-deep hover:bg-language-soft',
                        ]"
                        :disabled="resolved || selectedAnswer === choice.id"
                        :aria-pressed="selectedAnswer === choice.id"
                        @click="answer(choice.id)"
                      >
                        <span class="grid size-8 shrink-0 place-items-center rounded-full border-2 border-current font-numeric text-xs font-extrabold text-language-deep">
                          {{ choice.id }}
                        </span>
                        <span class="min-w-0 flex-1 whitespace-nowrap font-body text-sm font-semibold leading-snug text-ink">{{ choice.text }}</span>
                        <KIcon
                          v-if="resolved && choice.id === currentQuestion.answerId"
                          name="check"
                          size="sm"
                          tone="success"
                          class="ml-auto shrink-0"
                        />
                      </button>
                    </li>
                  </ol>

                  <div
                    v-if="questionFeedback === 'hint'"
                    class="mt-5 rounded-tile border-2 border-gently/50 bg-gently-soft/70 p-4"
                    aria-live="polite"
                  >
                    <p class="font-display text-lg text-ink">
                      差一点点，再找找线索。
                    </p>
                    <p class="mt-1 font-body text-sm leading-relaxed text-ink-soft">
                      看看插图和题目里的词，再试试另一个选项。小狐狸会陪你慢慢想。
                    </p>
                    <KButton v-if="questionAttemptCount >= 3" class="mt-3" variant="ghost" size="sm" @click="revealExplanation">
                      看一看解析
                    </KButton>
                  </div>
                  <div
                    v-else-if="resolved"
                    class="mt-5 rounded-tile border-2 p-4"
                    :class="correct ? 'border-success/40 bg-success-soft/70' : 'border-gently/50 bg-gently-soft/70'"
                    aria-live="polite"
                  >
                    <p class="font-display text-lg text-ink">
                      {{ correct ? '答对啦！' : '一起看看解析。' }}
                    </p>
                    <p v-if="!correct" class="mt-1 font-body text-sm font-bold text-ink">
                      正确答案：{{ currentQuestion.choices.find(choice => choice.id === currentQuestion.answerId)?.text }}
                    </p>
                    <p class="mt-1 font-body text-sm leading-relaxed text-ink-soft">
                      {{ currentQuestion.explanation }}
                    </p>
                  </div>

                  <div class="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
                    <div class="flex flex-wrap gap-2">
                      <KTag tone="success" size="sm">
                        本组已完成 {{ pointCompletedCount }} / {{ currentPoint.questions.length }}
                      </KTag>
                      <KTag v-if="missedQuestions.length" tone="think" size="sm">
                        待回练 {{ missedQuestions.length }} 题
                      </KTag>
                    </div>
                    <KButton v-if="resolved" size="lg" tone="language" @click="continueLearning">
                      {{ reviewMode ? (questionIndex + 1 < activeQuestions.length ? '下一道错题' : '回到本组总结') : questionIndex + 1 < activeQuestions.length ? '下一题' : '完成这组，看看星星' }}
                      <KIcon name="arrow-right" size="sm" />
                    </KButton>
                  </div>
                </div>
              </div>
            </section>

            <p class="mt-4 font-body text-xs leading-relaxed text-ink-faint">
              学习范围：{{ currentPoint.description }}
            </p>
          </template>
        </template>

        <section v-else class="grid min-h-96 place-items-center rounded-card border-2 border-line bg-surface p-8 text-center shadow-sticker">
          <div class="max-w-lg">
            <span class="mx-auto grid size-20 place-items-center rounded-full bg-star-soft text-star-deep">
              <KIcon name="star" size="2xl" weight="fill" />
            </span>
            <p class="mt-5 font-body text-xs font-bold tracking-[0.18em] text-language-deep uppercase">
              整册完成
            </p>
            <h2 class="mt-2 font-display text-3xl text-ink">
              上册语文探险完成啦！
            </h2>
            <p class="mt-3 font-body text-sm leading-relaxed text-ink-soft">
              你已完成 {{ completedPointCount }} / {{ bank.units.flatMap(unit => unit.knowledgePoints).length }} 组知识点，首次答对 {{ completedInFirstTry }} / {{ grade1ChineseQuestionCount }} 题，正确率 {{ overallAccuracy }}%。
            </p>
            <div class="mt-4 flex items-center justify-center gap-1" :aria-label="`整册表现 ${overallStars} 颗星`">
              <KIcon
                v-for="star in 3"
                :key="star"
                name="star"
                size="xl"
                :weight="star <= overallStars ? 'fill' : 'regular'"
                :class="star <= overallStars ? 'text-star' : 'text-ink-faint/35'"
              />
            </div>
            <p class="mt-2 font-body text-sm font-bold text-star-deep">
              整册首次正确率 {{ overallAccuracy }}%
            </p>
            <KButton class="mt-6" size="lg" tone="language" @click="selectUnit(0)">
              回到第一单元 <KIcon name="arrow-right" size="sm" />
            </KButton>
          </div>
        </section>
      </main>
    </div>
  </div>
</template>
