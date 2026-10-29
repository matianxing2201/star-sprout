<script setup lang="ts">
import type { CategoryId, GradeId } from "@/domain";
import { computed } from "vue";

import { RouterLink, useRoute, useRouter } from "vue-router";
import { ROUTE_NAMES } from "@/app/router/route-names";
import { grade1MathQuestions } from "@/content/grades/grade-1/math-question-bank";
import { useCatalogStore } from "@/stores";
import { KButton, KIcon, KIconTile, KTag } from "@/ui";

const route = useRoute();
const router = useRouter();
const catalog = useCatalogStore();

const gradeId = computed(() => route.params.gradeId as GradeId);
const categoryId = computed(() => route.params.categoryId as CategoryId);
const grade = computed(() => catalog.grade(gradeId.value));
const category = computed(() => catalog.category(categoryId.value));
const topics = computed(() => catalog.topicsOfCategory(categoryId.value));
const knowledgePointCount = computed(() =>
  topics.value.reduce((total, topic) => total + topic.knowledgePoints.length, 0)
);

function questionsForPoint(pointId: string) {
  return grade1MathQuestions.filter(
    (question) => question.knowledgePointId === pointId
  );
}

if (gradeId.value !== "grade-1" || categoryId.value !== "grade-1-math") {
  router.replace({
    name: ROUTE_NAMES.categories,
    params: { gradeId: gradeId.value },
  });
}
</script>

<template>
  <div v-if="grade && category" class="flex flex-col gap-7">
    <header
      class="rounded-blob border-2 border-math-line bg-math-soft p-5 shadow-sticker sm:p-7"
    >
      <KButton
        variant="ghost"
        size="sm"
        :to="{ name: ROUTE_NAMES.categories, params: { gradeId } }"
      >
        <KIcon name="arrow-left" size="sm" />
        回到一年级学科
      </KButton>

      <div class="mt-5 flex flex-wrap items-start justify-between gap-5">
        <div class="max-w-3xl">
          <p
            class="font-body text-xs font-extrabold tracking-[0.18em] text-math-deep uppercase"
          >
            一年级 · 上册 · 数学路线图
          </p>
          <h1 class="mt-2 font-display text-3xl text-ink sm:text-4xl">
            数学大纲
          </h1>
          <p
            class="mt-3 font-body text-sm leading-7 text-ink-soft sm:text-base"
          >
            从数一数、比一比开始，认识图形和位置，再用凑十法解决加法问题。每张卡片是一站学习主题，下面列出这一站会遇到的知识点。
          </p>
        </div>
        <KIconTile
          :icon="category.icon ?? 'math-operations'"
          :tone="category.tone"
          size="lg"
        />
      </div>

      <div class="mt-5 flex flex-wrap gap-2">
        <KTag tone="math" size="md">
          <KIcon name="book-open" size="xs" /> {{ topics.length }} 个主题
        </KTag>
        <KTag tone="star" size="md">
          <KIcon name="sparkle" size="xs" /> {{ knowledgePointCount }} 个知识点
        </KTag>
        <KTag tone="neutral" size="md">按教材顺序</KTag>
      </div>
    </header>

    <ol class="columns-1 gap-4 xl:columns-2">
      <li
        v-for="(topic, index) in topics"
        :key="topic.id"
        class="mb-4 inline-block w-full break-inside-avoid overflow-hidden rounded-card border-2 border-line bg-surface shadow-sticker"
      >
        <div
          class="flex items-start gap-4 border-b border-line bg-paper px-4 py-4 sm:px-5"
        >
          <span
            class="grid size-10 shrink-0 place-items-center rounded-full border-2 border-math-line bg-math-soft font-numeric text-sm font-extrabold text-math-deep"
          >
            {{ String(index + 1).padStart(2, "0") }}
          </span>
          <div class="min-w-0 flex-1">
            <p
              class="font-body text-[11px] font-bold tracking-[0.15em] text-ink-faint uppercase"
            >
              {{ topic.title.includes("综合与实践") ? "动手探索" : "教材单元" }}
            </p>
            <h2
              class="mt-1 font-display text-lg leading-snug text-ink sm:text-xl"
            >
              {{ topic.title }}
            </h2>
          </div>
          <KTag tone="math" size="sm"
            >{{ topic.knowledgePoints.length }} 个知识点</KTag
          >
        </div>

        <div class="p-4 sm:p-5">
          <p class="font-body text-sm leading-relaxed text-ink-soft">
            {{ topic.objectives[0] }}
          </p>

          <ol class="mt-4 grid gap-2 sm:grid-cols-2">
            <li
              v-for="(point, pointIndex) in topic.knowledgePoints"
              :key="point.id"
              class="rounded-tile border border-line bg-paper/70 p-3"
            >
              <div class="flex items-start gap-2.5">
                <span
                  class="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-math-soft font-numeric text-[10px] font-extrabold text-math-deep"
                >
                  {{ pointIndex + 1 }}
                </span>
                <div>
                  <h3 class="font-display text-sm leading-snug text-ink">
                    {{ point.label }}
                  </h3>
                  <p
                    v-if="point.detail"
                    class="mt-1.5 font-body text-xs leading-relaxed text-ink-soft"
                  >
                    {{ point.detail }}
                  </p>
                  <RouterLink
                    v-if="questionsForPoint(point.id).length > 0"
                    :to="{
                      name: ROUTE_NAMES.mathQuestion,
                      params: {
                        gradeId,
                        categoryId,
                        questionId: questionsForPoint(point.id)[0]!.id,
                      },
                    }"
                    class="mt-3 inline-flex items-center gap-1 rounded-chip bg-math-deep px-3 py-1.5 font-body text-xs font-bold text-white transition-transform hover:-translate-y-0.5"
                  >
                    开始练习 · {{ questionsForPoint(point.id).length }} 题
                    <KIcon name="arrow-right" size="xs" />
                  </RouterLink>
                </div>
              </div>
            </li>
          </ol>
        </div>
      </li>
    </ol>

    <footer
      class="flex items-start gap-3 rounded-tile border border-math-line/60 bg-math-soft/60 p-4 font-body text-xs leading-relaxed text-ink-soft"
    >
      <KIcon name="info" size="sm" tone="math" class="mt-0.5 shrink-0" />
      <p>
        这里展示的是一年级上册数学学习大纲。课程和练习题会按这些知识点逐步补充。
      </p>
    </footer>
  </div>
</template>
