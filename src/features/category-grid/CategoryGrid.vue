<script setup lang="ts">
import type { GradeId } from '@/domain'
import { computed } from 'vue'

import { RouterLink } from 'vue-router'
import { ROUTE_NAMES } from '@/app/router/route-names'
import { useCatalogStore, useProgressStore } from '@/stores'
import { KEmptyState, KSectionTitle } from '@/ui'

import CategoryCard from './CategoryCard.vue'

/**
 * 学习领域网格
 * ============
 *
 * 二级分类是“知识领域 / 学习方向”，不是教案。
 * 因此这里永远不会有空页面：目录来自内容包，课程则是“有多少展示多少”。
 */
const { gradeId } = defineProps<{ gradeId: GradeId }>()

const catalog = useCatalogStore()
const progress = useProgressStore()

const grade = computed(() => catalog.grade(gradeId))
const categories = computed(() => catalog.categoriesOf(gradeId))

function topicsOf(categoryId: string) {
  return catalog.topicsOfCategory(categoryId)
}
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
      title="这个年级的领域还在整理"
      description="内容团队正在把课程体系整理成可以探索的任务。"
    />

    <ul v-else class="fx-stagger grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <li v-for="category in categories" :key="category.id">
        <RouterLink
          :to="{ name: ROUTE_NAMES.courseMap, params: { gradeId, categoryId: category.id } }"
          class="block h-full"
        >
          <CategoryCard
            :category="category"
            :topic-count="topicsOf(category.id).length"
            :lesson-count="catalog.countLessonsOfCategory(category.id)"
            :mastery="progress.masteryOf(gradeId, category.id).mastery"
            :available="catalog.countLessonsOfCategory(category.id) > 0"
          />
        </RouterLink>
      </li>
    </ul>
  </section>
</template>
