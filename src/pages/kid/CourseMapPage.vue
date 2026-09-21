<script setup lang="ts">
import type { CategoryId, GradeId } from '@/domain'
import { computed } from 'vue'

import { useRoute, useRouter } from 'vue-router'
import { ROUTE_NAMES } from '@/app/router/route-names'
import { LessonPath } from '@/features/lesson-path'
import { useCatalogStore, useProgressStore } from '@/stores'
import { KButton, KEmptyState, KProgress, KSectionTitle, KStatTile, KTag } from '@/ui'

/**
 * 课程地图
 * ========
 *
 * 一个领域下的学习主题与课程。这一页是“自主选择”的核心：
 * 孩子自己决定走到哪一站，什么时候停 —— 只要随时看得见下一站在哪。
 */
const route = useRoute()
const router = useRouter()
const catalog = useCatalogStore()
const progress = useProgressStore()

const gradeId = computed(() => route.params.gradeId as GradeId)
const categoryId = computed(() => route.params.categoryId as CategoryId)

const grade = computed(() => catalog.grade(gradeId.value))
const category = computed(() => catalog.category(categoryId.value))

const topics = computed(() => catalog.topicsOfCategory(categoryId.value))
const lessonCount = computed(() => catalog.countLessonsOfCategory(categoryId.value))

const completedTopics = computed(() =>
  topics.value.filter(topic => progress.topicProgressOf(topic.id).status === 'completed').length,
)

const mastery = computed(() => progress.masteryOf(gradeId.value, categoryId.value))

function start(lessonId: string): void {
  router.push({ name: ROUTE_NAMES.lesson, params: { lessonId } })
}
</script>

<template>
  <div v-if="category && grade" class="flex flex-col gap-8">
    <div class="flex flex-wrap items-center gap-3">
      <KButton variant="ghost" size="sm" :to="{ name: ROUTE_NAMES.categories, params: { gradeId } }">
        ← 回到{{ grade.name }}的领域
      </KButton>
      <KTag :tone="category.tone" size="sm">
        {{ grade.name }}
      </KTag>
    </div>

    <KSectionTitle
      :eyebrow="`${category.emoji} ${category.name}`"
      :title="topics.length > 0 ? '可以选择的路' : '这条路正在铺'"
      :description="category.summary"
      :tone="category.tone"
    />

    <section class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <KStatTile emoji="🧩" :value="topics.length" label="学习主题" :tone="category.tone" />
      <KStatTile emoji="🎯" :value="lessonCount" label="可以探索的课程" :tone="category.tone" />
      <KStatTile
        emoji="✅"
        :value="`${completedTopics}/${Math.max(1, topics.length)}`"
        label="完成的主题"
        tone="energy"
      />
      <KStatTile
        emoji="📈"
        :value="`${Math.round(mastery.mastery * 100)}%`"
        label="掌握程度"
        :hint="mastery.attempts > 0 ? `作答 ${mastery.attempts} 次` : '还没有作答记录'"
        tone="star"
      />
    </section>

    <section v-if="category.focus.length > 0" class="rounded-tile border-2 border-line bg-surface p-5 shadow-press">
      <p class="font-body text-xs font-bold tracking-[0.2em] text-ink-faint uppercase">
        这个领域在练什么
      </p>
      <ul class="mt-3 flex flex-wrap gap-2">
        <li v-for="item in category.focus" :key="item">
          <KTag :tone="category.tone" size="md">
            {{ item }}
          </KTag>
        </li>
      </ul>
      <KProgress
        class="mt-4"
        :value="mastery.mastery"
        :tone="category.tone"
        size="sm"
        label="掌握程度"
        show-value
      />
    </section>

    <section>
      <LessonPath :grade-id="gradeId" :category-id="categoryId" @start="start" />
    </section>
  </div>

  <KEmptyState
    v-else
    emoji="🧭"
    title="没有找到这个领域"
    description="也许它属于别的阶段，我们带你回去看看。"
  >
    <template #action>
      <KButton :to="{ name: ROUTE_NAMES.home }">
        回到学习世界
      </KButton>
    </template>
  </KEmptyState>
</template>
