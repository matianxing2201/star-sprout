<script setup lang="ts">
import type { AppIconName, ToneKey, Topic, TopicProgress } from '@/domain'

import { computed } from 'vue'
import { cn } from '@/shared/utils'
import { useCatalogStore } from '@/stores'
import { KIcon, KIconTile, KProgress, KTag, TONE_ICONS, TOPIC_KIND_ICONS } from '@/ui'

/**
 * 课程地图上的一个节点（学习主题）
 * ==============================
 *
 * 需求第三十节要求地图上能看出五种状态：已完成 / 进行中 / 未解锁 / 隐藏任务 / 挑战任务。
 * 未解锁的节点也照样画出来，只是灰掉并告诉孩子“完成上一站就能打开”——
 * 看得见的下一站，才是孩子继续往下走的理由。
 *
 * 主题与课程都是**结构性的东西**，所以它们的图标来自词汇表
 * （自己的 icon 优先，缺省时按所属领域 / 课程色调取默认值）。
 */
const {
  topic,
  progress,
  lessons,
  unlockHint,
} = defineProps<{
  topic: Topic
  progress: TopicProgress
  lessons: { id: string, title: string, icon: AppIconName, tone: ToneKey, minutes: number, stars: number }[]
  /** 未解锁时显示“完成什么才能打开” */
  unlockHint?: string
}>()

const emit = defineEmits<{ start: [lessonId: string] }>()

const catalog = useCatalogStore()

const locked = computed(() => progress.status === 'locked')
const completed = computed(() => progress.status === 'completed')

/**
 * 主题图标与色调都跟着所属领域走。
 * 领域从 store 查，而不是新增 prop —— 调用方不需要知道“图标怎么来的”。
 */
const categoryTone = computed<ToneKey>(() => catalog.category(topic.categoryId)?.tone ?? 'explore')
const topicIcon = computed<AppIconName>(() => topic.icon ?? TONE_ICONS[categoryTone.value])

const kindBadge = computed(() => {
  if (topic.kind === 'standard')
    return null
  return {
    label: topic.kind === 'hidden' ? '隐藏任务' : '挑战任务',
    icon: TOPIC_KIND_ICONS[topic.kind],
  }
})

const statusLabel = computed(() => {
  if (completed.value)
    return '已经完成'
  if (progress.status === 'in-progress')
    return '正在探索'
  if (locked.value)
    return '还没解锁'
  return '可以开始'
})
</script>

<template>
  <article
    :class="cn(
      'relative rounded-card border-2 p-5 shadow-sticker transition-all',
      completed && 'border-success/40 bg-success-soft/60',
      !completed && !locked && 'border-line-strong bg-surface',
      locked && 'border-dashed border-line bg-surface/60',
    )"
  >
    <header class="flex flex-wrap items-start gap-3">
      <KIconTile
        :icon="topicIcon"
        :tone="completed ? 'success' : categoryTone"
        :locked="locked"
      />

      <div class="min-w-0 flex-1">
        <div class="flex flex-wrap items-center gap-2">
          <h3 class="font-display text-xl leading-tight text-ink">
            {{ topic.title }}
          </h3>
          <KTag v-if="kindBadge" tone="badge" size="sm">
            <KIcon :name="kindBadge.icon" size="sm" />
            {{ kindBadge.label }}
          </KTag>
          <KTag
            size="sm"
            :tone="completed ? 'energy' : locked ? 'neutral' : 'star'"
          >
            {{ statusLabel }}
          </KTag>
        </div>

        <p v-if="topic.objectives.length > 0" class="mt-1.5 font-body text-xs leading-relaxed text-ink-soft">
          {{ topic.objectives[0] }}
        </p>
      </div>

      <span
        v-if="progress.totalLessons > 0"
        class="ml-auto font-numeric text-sm font-bold text-ink-soft"
      >
        {{ progress.completedLessons }}/{{ progress.totalLessons }}
      </span>
    </header>

    <KProgress
      v-if="progress.totalLessons > 0"
      class="mt-4"
      :value="progress.completedLessons"
      :max="progress.totalLessons"
      :tone="completed ? 'energy' : 'star'"
      size="sm"
    />

    <ul v-if="lessons.length > 0 && !locked" class="mt-4 flex flex-col gap-2">
      <li v-for="lesson in lessons" :key="lesson.id">
        <button
          type="button"
          class="fx-tap flex w-full items-center gap-3 rounded-tile border-2 border-line bg-surface px-4 py-3 text-left shadow-press hover:border-line-strong"
          @click="emit('start', lesson.id)"
        >
          <KIconTile size="sm" :icon="lesson.icon" :tone="lesson.tone" />
          <span class="min-w-0 flex-1">
            <span class="block font-display text-base text-ink">{{ lesson.title }}</span>
            <span class="font-body text-xs text-ink-faint">{{ lesson.minutes }} 分钟 · 约 {{ lesson.stars }} 颗星星</span>
          </span>
          <span
            v-if="lesson.stars > 0"
            class="flex items-center gap-1 font-numeric text-sm font-bold text-star-deep"
          >
            <KIcon name="star" size="sm" weight="fill" />
            {{ lesson.stars }}
          </span>
          <span class="flex items-center gap-1 font-display text-lg text-ink-soft" aria-hidden="true">
            {{ progress.completedLessons > 0 ? '再玩一次' : '开始' }}
            <KIcon name="arrow-right" size="sm" />
          </span>
        </button>
      </li>
    </ul>

    <p v-else-if="locked" class="mt-4 font-body text-sm text-ink-faint">
      {{ unlockHint ?? '完成前面的主题就能打开这里。' }}
    </p>

    <p v-else class="mt-4 flex items-center gap-2 rounded-tile border-2 border-dashed border-line px-4 py-3 font-body text-sm text-ink-faint">
      <KIcon name="construction" size="sm" />
      这个主题的探索任务还在准备中。
    </p>
  </article>
</template>
