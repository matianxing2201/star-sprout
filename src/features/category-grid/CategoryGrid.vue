<script setup lang="ts">
import type { GradeId } from "@/domain";
import { computed } from "vue";

import { RouterLink } from "vue-router";
import { ROUTE_NAMES } from "@/app/router/route-names";
import { grade1ChineseQuestionCount } from "@/content/grades/grade-1/chinese-question-bank";
import { useCatalogStore } from "@/stores";
import { KEmptyState, KSectionTitle } from "@/ui";

import CategoryCard from "./CategoryCard.vue";

/**
 * 年级大纲分类网格
 * ============
 *
 * 二级分类展示一个年级的学科方向与能力范围，不包含课程或练习题。
 */
const { gradeId } = defineProps<{ gradeId: GradeId }>();

const catalog = useCatalogStore();
const grade = computed(() => catalog.grade(gradeId));
const categories = computed(() => catalog.categoriesOf(gradeId));
const grade1MathTopicCount = computed(
  () => catalog.topicsOfCategory("grade-1-math").length
);
</script>

<template>
  <section>
    <KSectionTitle
      :eyebrow="grade?.ageRange"
      :title="`${grade?.name}可以学什么`"
      :description="grade?.summary"
      :tone="grade?.tone"
    />

    <KEmptyState
      v-if="categories.length === 0"
      icon="grid"
      title="这个年级的大纲还在整理"
      description="该年级的学科分类与学习范围正在补充。"
    />

    <ul v-else class="fx-stagger grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <li v-for="category in categories" :key="category.id">
        <RouterLink
          v-if="gradeId === 'grade-1' && category.id === 'grade-1-chinese'"
          :to="{
            name: ROUTE_NAMES.questionBank,
            params: { gradeId, categoryId: category.id },
          }"
          class="block h-full"
        >
          <CategoryCard
            :category="category"
            :question-count="grade1ChineseQuestionCount"
          />
        </RouterLink>
        <RouterLink
          v-else-if="gradeId === 'grade-1' && category.id === 'grade-1-math'"
          :to="{
            name: ROUTE_NAMES.mathOutline,
            params: { gradeId, categoryId: category.id },
          }"
          class="block h-full"
        >
          <CategoryCard
            :category="category"
            :outline-count="grade1MathTopicCount"
          />
        </RouterLink>
        <CategoryCard v-else :category="category" />
      </li>
    </ul>
  </section>
</template>
