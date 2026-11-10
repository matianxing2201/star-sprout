<script setup lang="ts">
import { computed, ref } from 'vue'

import { ROUTE_NAMES } from '@/app/router/route-names'
import { grade1ChineseQuestionBank as bank } from '@/content/grades/grade-1/chinese-question-bank'
import { publicAsset } from '@/shared/utils'
import { KButton, KIcon, KTag } from '@/ui'

const unit = bank.units.find(item => item.order === 2)
if (!unit)
  throw new Error('一年级上册语文题库中缺少第二单元')

const question = unit.knowledgePoints[0]?.questions[0]
if (!question)
  throw new Error('语文第二单元没有可预览的原题')

const character = {
  name: '小砾',
  role: '工程小能手',
  illustration: 'images/questions/g1-chinese/cnc_p008_q1.webp',
  line: '看这张「妈」字卡，听听它的读音。哪一个选项读第一声？',
}
const feedback = ref<'waiting' | 'hint' | 'correct' | 'review'>('waiting')
const selectedChoiceId = ref<string | null>(null)
const wrongAttempts = ref(0)
const isResolved = computed(() => feedback.value === 'correct' || feedback.value === 'review')
const correctCount = computed(() => feedback.value === 'correct' ? 1 : 0)
const reviewCount = computed(() => feedback.value === 'review' ? 1 : 0)

function choose(choiceId: string): void {
  if (isResolved.value || choiceId === selectedChoiceId.value)
    return

  selectedChoiceId.value = choiceId
  if (choiceId === question.answerId) {
    feedback.value = 'correct'
    return
  }

  wrongAttempts.value += 1
  feedback.value = wrongAttempts.value === 1 ? 'hint' : 'review'
}

function restart(): void {
  feedback.value = 'waiting'
  selectedChoiceId.value = null
  wrongAttempts.value = 0
}
</script>

<template>
  <main class="mx-auto flex w-full max-w-5xl flex-col gap-5">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <KButton
        variant="ghost"
        size="sm"
        :to="{
          name: ROUTE_NAMES.questionBank,
          params: { gradeId: bank.gradeId, categoryId: bank.categoryId },
        }"
      >
        <KIcon name="arrow-left" size="sm" />
        回到语文题库
      </KButton>
      <div class="flex flex-wrap gap-2">
        <KTag tone="language" size="sm">单题样例</KTag>
        <KTag tone="star" size="sm">原题 · {{ question.id }}</KTag>
      </div>
    </div>

    <header class="overflow-hidden rounded-blob border-2 border-language-line bg-language-soft shadow-sticker">
      <div class="grid gap-4 p-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:px-8 sm:py-7">
        <div>
          <p class="font-body text-xs font-extrabold tracking-[0.18em] text-language-deep uppercase">
            一年级上册语文 · 第 2 单元
          </p>
          <h1 class="mt-2 font-display text-3xl text-ink sm:text-4xl">
            声调小侦探
          </h1>
          <p class="mt-2 max-w-2xl font-body text-sm leading-relaxed text-ink-soft">
            先听角色说线索，再选答案。答错会收到提示，还有机会自己改正。
          </p>
        </div>
        <div class="flex items-center gap-3 rounded-card border-2 border-white/80 bg-white/75 px-4 py-3 shadow-press">
          <KIcon name="sparkle" size="lg" tone="language" />
          <div>
            <p class="font-display text-sm text-ink">样例进度</p>
            <p class="font-body text-xs text-ink-soft">{{ isResolved ? '1 / 1 已完成' : '0 / 1 待完成' }}</p>
          </div>
        </div>
      </div>
    </header>

    <section class="grid items-stretch gap-5 lg:grid-cols-[0.8fr_1.2fr]">
      <aside class="relative flex min-h-64 flex-col items-center justify-center overflow-hidden rounded-blob border-2 border-line bg-[#eaf8f1] p-5 shadow-sticker sm:flex-row sm:gap-4 lg:flex-col lg:gap-2">
        <span class="pointer-events-none absolute -top-10 -right-8 size-36 rounded-full bg-white/55" aria-hidden="true" />
        <figure class="relative z-10 flex w-full max-w-64 shrink-0 flex-col items-center sm:max-w-52 lg:max-w-[18rem]">
          <div class="relative w-full">
            <img
              :src="publicAsset(character.illustration)"
              :alt="`${character.name}指着字卡，准备听辨「妈」的读音`"
              class="aspect-square w-full rounded-2xl border-2 border-white bg-white object-cover shadow-press"
              width="640"
              height="640"
            >
            <div class="absolute top-[14%] right-[2%] grid h-[42%] w-[45%] place-content-center rounded-xl bg-white/75 text-center" aria-label="本题要读的汉字：妈">
              <span class="font-body text-xs font-bold text-language-deep">本题汉字</span>
              <strong class="mt-1 font-display text-6xl leading-none text-ink">妈</strong>
            </div>
          </div>
          <figcaption class="mt-2 rounded-chip bg-white/85 px-3 py-1 text-center font-display text-sm text-ink shadow-press">
            听音辨声调 · 汉字「妈」
          </figcaption>
        </figure>
        <div class="relative z-10 mt-4 rounded-card border-2 border-white bg-white/90 p-4 shadow-press sm:mt-0 sm:flex-1 lg:mt-3 lg:flex-none">
          <p class="font-body text-xs font-bold tracking-[0.14em] text-language-deep uppercase">
            {{ character.name }}的提示
          </p>
          <p class="mt-1 font-display text-lg leading-relaxed text-ink">
            {{ feedback === 'waiting' ? character.line : feedback === 'hint' ? '小提示：第一声读起来平平的，试着把几个读音轻轻读一遍。' : feedback === 'correct' ? '答对啦！你把第一声听得真清楚。' : '我们一起看看正确读音，再把这道题记牢。' }}
          </p>
        </div>
      </aside>

      <section class="overflow-hidden rounded-blob border-2 border-line bg-surface shadow-sticker">
        <div class="flex flex-wrap items-center justify-between gap-2 border-b border-line bg-paper/75 px-5 py-3">
          <div class="flex items-center gap-2">
            <KTag tone="language" size="sm">{{ unit.title }}</KTag>
            <KTag tone="think" size="sm">{{ unit.knowledgePoints[0]?.title }}</KTag>
          </div>
          <span class="font-numeric text-xs font-bold text-ink-faint">第 1 题 · 原题</span>
        </div>

        <div class="p-5 sm:p-7">
          <p class="font-body text-xs font-extrabold tracking-[0.18em] text-language-deep uppercase">想一想，选一选</p>
          <h2 class="mt-2 font-display text-2xl leading-relaxed text-ink sm:text-3xl">
            {{ question.prompt }}
          </h2>

          <ol class="mt-5 grid gap-3">
            <li v-for="choice in question.choices" :key="choice.id">
              <button
                type="button"
                class="fx-pressable flex min-h-16 w-full items-center gap-3 rounded-tile border-2 px-4 py-3 text-left transition-colors"
                :class="[
                  selectedChoiceId === choice.id && feedback === 'hint' ? 'border-gently bg-gently-soft' :
                    isResolved && choice.id === question.answerId ? 'border-success bg-success-soft' :
                      selectedChoiceId === choice.id && feedback === 'review' ? 'border-gently bg-gently-soft' :
                        'border-line bg-paper hover:border-language-deep hover:bg-language-soft',
                ]"
                :disabled="isResolved || (feedback === 'hint' && selectedChoiceId === choice.id)"
                :aria-pressed="selectedChoiceId === choice.id"
                @click="choose(choice.id)"
              >
                <span class="grid size-9 shrink-0 place-items-center rounded-full border-2 border-language-deep/35 bg-white font-numeric text-sm font-extrabold text-language-deep">
                  {{ choice.id }}
                </span>
                <span class="min-w-0 flex-1 whitespace-nowrap font-body text-sm font-semibold leading-snug text-ink sm:text-base">{{ choice.text }}</span>
                <KIcon
                  v-if="isResolved && choice.id === question.answerId"
                  name="check"
                  size="sm"
                  tone="success"
                  class="ml-auto shrink-0"
                />
              </button>
            </li>
          </ol>

          <div
            v-if="feedback === 'hint'"
            class="mt-5 rounded-tile border-2 border-gently/50 bg-gently-soft/70 p-4"
            aria-live="polite"
          >
            <p class="font-display text-lg text-ink">差一点点，再试一次！</p>
            <p class="mt-1 font-body text-sm leading-relaxed text-ink-soft">再听听每个音节的声调，点选另一个答案。</p>
          </div>
          <div
            v-else-if="feedback === 'correct' || feedback === 'review'"
            class="mt-5 rounded-tile border-2 p-4"
            :class="feedback === 'correct' ? 'border-success/40 bg-success-soft/70' : 'border-gently/50 bg-gently-soft/70'"
            aria-live="polite"
          >
            <p class="font-display text-lg text-ink">{{ feedback === 'correct' ? '答对啦！' : '订正一下这道题' }}</p>
            <p v-if="feedback === 'review'" class="mt-1 font-body text-sm font-bold text-ink">
              正确答案：{{ question.choices.find(choice => choice.id === question.answerId)?.text }}
            </p>
            <p class="mt-1 font-body text-sm leading-relaxed text-ink-soft">{{ question.explanation }}</p>
          </div>

          <div class="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
            <div class="flex gap-2">
              <KTag tone="success" size="sm">答对 {{ correctCount }}</KTag>
              <KTag tone="think" size="sm">待复习 {{ reviewCount }}</KTag>
            </div>
            <KButton v-if="isResolved" variant="soft" tone="language" @click="restart">
              再练一次 <KIcon name="arrow-right" size="sm" />
            </KButton>
          </div>
        </div>
      </section>
    </section>
  </main>
</template>
