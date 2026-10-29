<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import type { CurriculumKnowledgePoint } from '@/domain'
import { ROUTE_NAMES } from '@/app/router/route-names'
import { grade1ChineseQuestionBank as bank } from '@/content/grades/grade-1/chinese-question-bank'
import { KButton, KIcon, KTag } from '@/ui'

const route = useRoute()
const router = useRouter()

const unitIndex = ref(0)
const pointIndex = ref(0)
const questionIndex = ref(0)
const selectedAnswer = ref<string | null>(null)
const finished = ref(false)
const illustrationFailed = ref(false)

const currentUnit = computed(() => bank.units[unitIndex.value]!)
const currentPoint = computed<CurriculumKnowledgePoint>(() => currentUnit.value.knowledgePoints[pointIndex.value]!)
const currentQuestion = computed(() => currentPoint.value.questions[questionIndex.value]!)
const correct = computed(() => selectedAnswer.value === currentQuestion.value.answerId)
const pointsInUnit = computed(() => currentUnit.value.knowledgePoints.length)

watch(() => currentQuestion.value.id, () => {
  illustrationFailed.value = false
})

function resetQuestion(): void {
  questionIndex.value = 0
  selectedAnswer.value = null
  finished.value = false
}

function selectUnit(index: number): void {
  unitIndex.value = index
  pointIndex.value = 0
  resetQuestion()
}

function selectPoint(index: number): void {
  pointIndex.value = index
  resetQuestion()
}

function answer(choiceId: string): void {
  if (selectedAnswer.value === null)
    selectedAnswer.value = choiceId
}

function continueLearning(): void {
  if (questionIndex.value + 1 < currentPoint.value.questions.length) {
    questionIndex.value += 1
    selectedAnswer.value = null
    return
  }

  if (pointIndex.value + 1 < currentUnit.value.knowledgePoints.length) {
    pointIndex.value += 1
    resetQuestion()
    return
  }

  if (unitIndex.value + 1 < bank.units.length) {
    unitIndex.value += 1
    pointIndex.value = 0
    resetQuestion()
    return
  }

  finished.value = true
}

if (route.params.gradeId !== bank.gradeId || route.params.categoryId !== bank.categoryId)
  router.replace({ name: ROUTE_NAMES.categories, params: { gradeId: bank.gradeId } })
</script>

<template>
  <div class="flex flex-col gap-6">
    <header class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <button
          type="button"
          class="mb-3 inline-flex items-center gap-1 font-body text-sm font-bold text-ink-soft hover:text-ink"
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
          跟着课文里的字词和故事，完成每一小步。选一个单元开始吧！
        </p>
      </div>

      <div class="flex gap-2">
        <KTag tone="language" size="md"><KIcon name="book-open" size="sm" /> {{ bank.units.length }} 个单元</KTag>
        <KTag tone="star" size="md"><KIcon name="sparkle" size="sm" /> 164 道题</KTag>
      </div>
    </header>

    <div class="grid items-start gap-5 xl:grid-cols-[18rem_minmax(0,1fr)]">
      <aside class="rounded-blob border-2 border-line bg-surface p-4 shadow-sticker xl:sticky xl:top-24">
        <div class="mb-3 flex items-center justify-between px-1">
          <h2 class="font-display text-lg text-ink">上册单元</h2>
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
              <h2 class="mt-1 font-display text-2xl text-ink sm:text-3xl">{{ currentUnit.title }}</h2>
            </div>
            <KTag tone="explore" size="sm">{{ pointsInUnit }} 个小发现</KTag>
          </div>

          <div class="mt-5 flex gap-2 overflow-x-auto pb-2" aria-label="选择知识点">
            <button
              v-for="(point, index) in currentUnit.knowledgePoints"
              :key="point.id"
              type="button"
              class="fx-tap shrink-0 rounded-chip border-2 px-3 py-2 font-body text-xs font-bold transition-colors"
              :class="pointIndex === index ? 'border-language-deep bg-language text-white' : 'border-line bg-surface text-ink-soft hover:bg-paper'"
              :aria-pressed="pointIndex === index"
              @click="selectPoint(index)"
            >
              {{ point.title }}
            </button>
          </div>

          <section class="mt-3 overflow-hidden rounded-card border-2 border-line bg-surface shadow-sticker">
            <div class="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-3 sm:px-5">
              <div class="flex flex-wrap items-center gap-2">
                <KTag tone="language" size="sm">{{ currentPoint.domain }}</KTag>
                <h3 class="font-display text-base text-ink">{{ currentPoint.title }}</h3>
              </div>
              <span class="font-numeric text-xs font-bold text-ink-faint">
                {{ questionIndex + 1 }} / {{ currentPoint.questions.length }}
              </span>
            </div>

            <div class="grid lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
              <div class="relative flex min-h-56 items-center bg-language-soft p-3 sm:p-4">
                <img
                  v-if="!illustrationFailed"
                  :src="currentQuestion.illustration"
                  :alt="`童书插图：${currentPoint.title}`"
                  class="aspect-[3/2] w-full rounded-tile object-contain shadow-press"
                  width="640"
                  height="480"
                  @error="illustrationFailed = true"
                >
                <div v-else class="grid aspect-[3/2] w-full place-items-center rounded-tile border-2 border-dashed border-language-deep/30 bg-paper/70 px-4 text-center font-body text-sm font-bold text-ink-soft">
                  这道题的插图尚未生成
                </div>
                <span class="absolute top-7 left-7 rounded-chip bg-paper/90 px-3 py-1 font-body text-[11px] font-bold text-language-deep shadow-press">
                  看一看，再想一想
                </span>
              </div>

              <div class="p-4 sm:p-6">
                <p class="mb-3 font-body text-xs font-bold tracking-[0.18em] text-language-deep uppercase">想一想</p>
                <p class="font-display text-xl leading-relaxed text-ink sm:text-2xl">
                  {{ currentQuestion.prompt }}
                </p>

                <ol class="mt-5 grid gap-2.5 sm:grid-cols-2">
                  <li v-for="choice in currentQuestion.choices" :key="choice.id">
                    <button
                      type="button"
                      class="fx-pressable flex min-h-14 w-full items-center gap-3 rounded-tile border-2 px-3 py-3 text-left transition-colors"
                      :class="[
                        selectedAnswer === null ? 'border-line bg-paper hover:border-language-deep hover:bg-language-soft' :
                          choice.id === currentQuestion.answerId ? 'border-success bg-success-soft' :
                            selectedAnswer === choice.id ? 'border-gently bg-gently-soft' : 'border-line bg-paper opacity-70',
                      ]"
                      :disabled="selectedAnswer !== null"
                      :aria-pressed="selectedAnswer === choice.id"
                      @click="answer(choice.id)"
                    >
                      <span class="grid size-8 shrink-0 place-items-center rounded-full border-2 border-current font-numeric text-xs font-extrabold text-language-deep">
                        {{ choice.id }}
                      </span>
                      <span class="font-body text-sm font-semibold leading-snug text-ink">{{ choice.text }}</span>
                      <KIcon
                        v-if="selectedAnswer !== null && choice.id === currentQuestion.answerId"
                        name="check"
                        size="sm"
                        tone="success"
                        class="ml-auto"
                      />
                    </button>
                  </li>
                </ol>

                <div
                  v-if="selectedAnswer !== null"
                  class="mt-5 rounded-tile border-2 p-4"
                  :class="correct ? 'border-success/40 bg-success-soft/70' : 'border-gently/50 bg-gently-soft/70'"
                  aria-live="polite"
                >
                  <p class="font-display text-lg text-ink">{{ correct ? '答对啦，继续保持！' : '再看看这个小线索。' }}</p>
                  <p class="mt-1 font-body text-sm leading-relaxed text-ink-soft">{{ currentQuestion.explanation }}</p>
                </div>

                <KButton
                  v-if="selectedAnswer !== null"
                  class="mt-5 w-full sm:w-auto"
                  size="lg"
                  tone="language"
                  @click="continueLearning"
                >
                  {{ questionIndex + 1 < currentPoint.questions.length ? '下一题' : pointIndex + 1 < pointsInUnit ? '完成这组，继续下一个知识点' : unitIndex + 1 < bank.units.length ? '完成本单元，继续下一单元' : '完成上册探险' }}
                  <KIcon name="arrow-right" size="sm" />
                </KButton>
              </div>
            </div>
          </section>

          <p class="mt-4 font-body text-xs leading-relaxed text-ink-faint">
            学习范围：{{ currentPoint.description }}
          </p>
        </template>

        <section v-else class="grid min-h-96 place-items-center rounded-card border-2 border-line bg-surface p-8 text-center shadow-sticker">
          <div class="max-w-lg">
            <span class="mx-auto grid size-20 place-items-center rounded-full bg-star-soft text-star-deep">
              <KIcon name="star" size="2xl" weight="fill" />
            </span>
            <p class="mt-5 font-body text-xs font-bold tracking-[0.18em] text-language-deep uppercase">整册完成</p>
            <h2 class="mt-2 font-display text-3xl text-ink">上册语文探险完成啦！</h2>
            <p class="mt-3 font-body text-sm leading-relaxed text-ink-soft">你走过了 {{ bank.units.length }} 个单元，认识了许多有趣的字和故事。</p>
            <KButton class="mt-6" size="lg" tone="language" @click="selectUnit(0)">
              再从第一单元看看 <KIcon name="arrow-right" size="sm" />
            </KButton>
          </div>
        </section>
      </main>
    </div>

    <details class="rounded-tile border border-line bg-surface/70 px-4 py-3 text-xs text-ink-faint">
      <summary class="cursor-pointer font-body font-bold text-ink-soft">题库来源与内容说明</summary>
      <p class="mt-2 leading-relaxed">
        题目来源：<a :href="bank.attribution.repositoryUrl" target="_blank" rel="noreferrer" class="underline">{{ bank.attribution.repository }}</a>，作者 {{ bank.attribution.creator }}；
        许可：<a :href="bank.attribution.licenseUrl" target="_blank" rel="noreferrer" class="underline">{{ bank.attribution.license }}</a>。
        本项目按非商业用途使用。{{ bank.attribution.changes }}{{ bank.attribution.sourceQualityNote }}
      </p>
    </details>
  </div>
</template>
