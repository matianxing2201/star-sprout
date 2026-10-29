<script setup lang="ts">
import { computed, ref, watch } from "vue";

import { useRoute, useRouter } from "vue-router";
import { ROUTE_NAMES } from "@/app/router/route-names";
import { grade1MathQuestions } from "@/content/grades/grade-1/math-question-bank";
import { topics as grade1MathTopics } from "@/content/grades/grade-1/topics";
import { KButton, KIcon, KTag } from "@/ui";

const route = useRoute();
const router = useRouter();

const question = computed(() =>
  grade1MathQuestions.find((item) => item.id === route.params.questionId)
);
const illustrationUrl = computed(() =>
  question.value
    ? `${import.meta.env.BASE_URL}${question.value.illustration.replace(/^\//, '')}`
    : ''
);
const groupQuestions = computed(() =>
  question.value
    ? grade1MathQuestions.filter(
        (item) => item.knowledgePointId === question.value?.knowledgePointId
      )
    : []
);
const questionIndex = computed(() =>
  groupQuestions.value.findIndex((item) => item.id === route.params.questionId)
);
const currentTopic = computed(() =>
  grade1MathTopics.find((item) => item.id === question.value?.topicId)
);
const currentKnowledgePoint = computed(() =>
  currentTopic.value?.knowledgePoints.find(
    (point) => point.id === question.value?.knowledgePointId
  )
);
const selectedAnswer = ref<string | null>(null);
const isCorrect = computed(
  () => selectedAnswer.value === question.value?.answerId
);

watch(
  () => route.params.questionId,
  () => {
    selectedAnswer.value = null;
  }
);

function choose(choiceId: string): void {
  if (selectedAnswer.value === null) selectedAnswer.value = choiceId;
}

function backToOutline(): void {
  router.push({
    name: ROUTE_NAMES.mathOutline,
    params: { gradeId: "grade-1", categoryId: "grade-1-math" },
  });
}

function continueQuestions(): void {
  if (selectedAnswer.value === null) return;

  const nextQuestion = groupQuestions.value[questionIndex.value + 1];
  if (!nextQuestion) {
    backToOutline();
    return;
  }

  router.push({
    name: ROUTE_NAMES.mathQuestion,
    params: {
      gradeId: "grade-1",
      categoryId: "grade-1-math",
      questionId: nextQuestion.id,
    },
  });
}

if (
  route.params.gradeId !== "grade-1" ||
  route.params.categoryId !== "grade-1-math" ||
  !question.value
) {
  backToOutline();
}
</script>

<template>
  <div v-if="question" class="mx-auto flex w-full max-w-6xl flex-col gap-5">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <KButton variant="ghost" size="sm" @click="backToOutline">
        <KIcon name="arrow-left" size="sm" /> 回到数学大纲
      </KButton>
      <div class="flex flex-wrap gap-2">
        <KTag tone="math" size="sm">{{ currentTopic?.title }}</KTag>
        <KTag tone="star" size="sm"
          >{{ questionIndex + 1 }} / {{ groupQuestions.length }} 题</KTag
        >
      </div>
    </div>

    <header
      class="rounded-blob border-2 border-math-line bg-math-soft px-5 py-5 sm:px-7"
    >
      <p
        class="font-body text-xs font-extrabold tracking-[0.18em] text-math-deep uppercase"
      >
        {{ currentKnowledgePoint?.label }}
      </p>
      <h1 class="mt-2 font-display text-2xl text-ink sm:text-3xl">
        看图想一想
      </h1>
      <p class="mt-2 font-body text-sm leading-relaxed text-ink-soft">
        仔细观察画面里的数量和变化，再选择答案。
      </p>
    </header>

    <section
      class="overflow-hidden rounded-card border-2 border-line bg-surface shadow-sticker"
    >
      <div class="grid lg:grid-cols-[minmax(0,1.5fr)_minmax(19rem,1fr)]">
        <div
          class="relative flex min-h-72 items-center justify-center bg-white p-5 sm:p-7"
        >
          <img
            :src="illustrationUrl"
            :alt="question.illustrationAlt"
            class="aspect-[3/2] w-full rounded-tile object-contain"
            width="768"
            height="512"
          />
          <span
            class="absolute left-8 top-8 rounded-chip bg-white/90 px-3 py-1.5 font-body text-xs font-extrabold text-math-deep shadow-press"
          >
            仔细数一数
          </span>
        </div>

        <div class="flex flex-col justify-center p-5 sm:p-7">
          <p
            class="font-body text-xs font-extrabold tracking-[0.16em] text-math-deep uppercase"
          >
            想一想
          </p>
          <h2
            class="mt-2 font-display text-2xl leading-relaxed text-ink sm:text-3xl"
          >
            {{ question.prompt }}
          </h2>

          <ol class="mt-6 grid grid-cols-2 gap-3">
            <li v-for="choice in question.choices" :key="choice.id">
              <button
                type="button"
                class="fx-pressable flex min-h-16 w-full items-center gap-3 rounded-tile border-2 px-4 py-3 text-left transition-colors"
                :class="[
                  selectedAnswer === null
                    ? 'border-line bg-paper hover:border-math-deep hover:bg-math-soft'
                    : choice.id === question.answerId
                    ? 'border-success bg-success-soft'
                    : selectedAnswer === choice.id
                    ? 'border-gently bg-gently-soft'
                    : 'border-line bg-paper opacity-70',
                ]"
                :disabled="selectedAnswer !== null"
                :aria-pressed="selectedAnswer === choice.id"
                @click="choose(choice.id)"
              >
                <span
                  class="grid size-9 shrink-0 place-items-center rounded-full border-2 border-math-line font-numeric text-xs font-extrabold text-math-deep"
                >
                  {{ choice.id }}
                </span>
                <span
                  class="font-display text-lg font-bold text-ink sm:text-xl"
                >
                  {{ choice.text }}
                </span>
              </button>
            </li>
          </ol>

          <div
            v-if="selectedAnswer !== null"
            class="mt-5 rounded-tile border-2 p-4"
            :class="
              isCorrect
                ? 'border-success bg-success-soft'
                : 'border-gently bg-gently-soft'
            "
            aria-live="polite"
          >
            <p class="flex items-center gap-2 font-display text-lg text-ink">
              <KIcon
                :name="isCorrect ? 'check-circle' : 'sparkle'"
                size="sm"
                :tone="isCorrect ? 'success' : 'gently'"
              />
              {{ isCorrect ? "数得真仔细！" : "来看看怎么数" }}
            </p>
            <p class="mt-2 font-body text-sm leading-relaxed text-ink-soft">
              {{ question.explanation }}
            </p>
          </div>
        </div>
      </div>

      <footer
        v-if="selectedAnswer !== null"
        class="flex justify-end border-t border-line bg-paper px-5 py-4 sm:px-7"
      >
        <KButton variant="soft" tone="math" @click="continueQuestions">
          {{
            questionIndex + 1 < groupQuestions.length ? "下一题" : "完成这一组"
          }}
          <KIcon name="arrow-right" size="sm" />
        </KButton>
      </footer>
    </section>
  </div>
</template>
