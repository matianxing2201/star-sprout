<script setup lang="ts">
import type { CategoryId, GradeId } from '@/domain'

import { computed } from 'vue'
import { useCatalogStore, useProgressStore } from '@/stores'
import { KEmptyState, TONE_ICONS } from '@/ui'

import TopicCard from './TopicCard.vue'

/**
 * 课程地图
 * ========
 *
 * 一个领域下的主题串成一条路：上路是已完成的，中间是正在走的，下面是锁着的。
 * 课程（Lesson）挂在主题下面 —— 这样“再补一份教案”只是多一个节点，不会打乱整条路。
 */
const props = defineProps<{
  gradeId: GradeId
  categoryId: CategoryId
}>()

const emit = defineEmits<{ start: [lessonId: string] }>()

const catalog = useCatalogStore()
const progress = useProgressStore()

const category = computed(() => catalog.category(props.categoryId))

const topics = computed(() => catalog.topicsOfCategory(props.categoryId))

/**
 * 课程图标与色调在这里解析好再交给卡片：
 * 课程自己的 icon 优先，缺省时按课程色调取默认图标 ——
 * 卡片不需要知道词汇表怎么查。
 */
function lessonsOf(topicId: string) {
  return catalog.lessonsOfTopic(topicId).map(lesson => ({
    id: lesson.id,
    title: lesson.title,
    icon: lesson.icon ?? TONE_ICONS[lesson.tone],
    tone: lesson.tone,
    minutes: lesson.minutes,
    stars: progress.starsOfLesson(lesson.id) || lesson.reward.stars,
  }))
}

/** 未解锁时告诉孩子“完成上一站就能打开” */
function unlockHintFor(index: number): string | undefined {
  const previous = topics.value[index - 1]
  if (!previous)
    return undefined
  return `完成「${previous.title}」，这里就会打开。`
}
</script>

<template>
  <section>
    <KEmptyState
      v-if="topics.length === 0"
      icon="plant"
      :title="`${category?.name ?? '这个领域'}的课程还在准备`"
      description="领域已经建好了，接下来会把一份份教案变成可以动手探索的小任务。"
      :tone="category?.tone"
    />

    <ol v-else class="relative flex flex-col gap-5">
      <!-- 节点之间的小路：把一列卡片连成一条可以走的路 -->
      <li
        v-for="(topic, index) in topics"
        :key="topic.id"
        class="relative"
      >
        <span
          v-if="index < topics.length - 1"
          class="pointer-events-none absolute top-full left-9 h-5 border-l-2 border-dashed border-line-strong"
          aria-hidden="true"
        />
        <TopicCard
          :topic="topic"
          :progress="progress.topicProgressOf(topic.id)"
          :lessons="lessonsOf(topic.id)"
          :unlock-hint="unlockHintFor(index)"
          @start="emit('start', $event)"
        />
      </li>
    </ol>
  </section>
</template>
