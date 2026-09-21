<script setup lang="ts">
import type { Topic, TopicProgress } from '@/domain'

import { computed } from 'vue'
import { cn } from '@/shared/utils'
import { KProgress, KTag } from '@/ui'

/**
 * 课程地图上的一个节点（学习主题）
 * ==============================
 *
 * 需求第三十节要求地图上能看出五种状态：已完成 / 进行中 / 未解锁 / 隐藏任务 / 挑战任务。
 * 未解锁的节点也照样画出来，只是灰掉并告诉孩子“完成上一站就能打开”——
 * 看得见的下一站，才是孩子继续往下走的理由。
 */
const {
  topic,
  progress,
  lessons,
  unlockHint,
} = defineProps<{
  topic: Topic
  progress: TopicProgress
  lessons: { id: string, title: string, emoji: string, minutes: number, stars: number }[]
  /** 未解锁时显示“完成什么才能打开” */
  unlockHint?: string
}>()

const emit = defineEmits<{ start: [lessonId: string] }>()

const locked = computed(() => progress.status === 'locked')
const completed = computed(() => progress.status === 'completed')

const kindBadge = computed(() => {
  if (topic.kind === 'hidden')
    return { label: '隐藏任务', emoji: '🗝️' }
  if (topic.kind === 'challenge')
    return { label: '挑战任务', emoji: '🔥' }
  return null
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
      <span
        :class="cn(
          'grid size-12 shrink-0 place-items-center rounded-chip border-2 text-2xl',
          completed ? 'border-success/40 bg-surface' : 'border-line bg-paper-deep',
          locked && 'opacity-50 grayscale',
        )"
        aria-hidden="true"
      >
        {{ locked ? '🔒' : topic.emoji }}
      </span>

      <div class="min-w-0 flex-1">
        <div class="flex flex-wrap items-center gap-2">
          <h3 class="font-display text-xl leading-tight text-ink">
            {{ topic.title }}
          </h3>
          <KTag v-if="kindBadge" tone="badge" size="sm">
            {{ kindBadge.emoji }} {{ kindBadge.label }}
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
          <span class="text-2xl" aria-hidden="true">{{ lesson.emoji }}</span>
          <span class="min-w-0 flex-1">
            <span class="block font-display text-base text-ink">{{ lesson.title }}</span>
            <span class="font-body text-xs text-ink-faint">{{ lesson.minutes }} 分钟 · 约 {{ lesson.stars }} 颗星星</span>
          </span>
          <span
            v-if="lesson.stars > 0"
            class="font-numeric text-sm font-bold text-star-deep"
          >
            ⭐ {{ lesson.stars }}
          </span>
          <span class="font-display text-lg text-ink-soft" aria-hidden="true">
            {{ progress.completedLessons > 0 ? '再玩一次' : '开始' }} →
          </span>
        </button>
      </li>
    </ul>

    <p v-else-if="locked" class="mt-4 font-body text-sm text-ink-faint">
      {{ unlockHint ?? '完成前面的主题就能打开这里。' }}
    </p>

    <p v-else class="mt-4 rounded-tile border-2 border-dashed border-line px-4 py-3 font-body text-sm text-ink-faint">
      🚧 这个主题的探索任务还在准备中。
    </p>
  </article>
</template>
