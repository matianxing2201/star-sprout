import type {
  AttemptRecord,
  BadgeDefinition,
  CategoryId,
  CategoryMastery,
  GradeId,
  GrowthLevel,
  LessonCompletion,
  Topic,
  TopicId,
  TopicProgress,
} from '@/domain'
import { defineStore } from 'pinia'

import { computed, ref } from 'vue'
import { progressRepository } from '@/data'
import {
  badgeProgress,
  buildTopicProgressMap,
  computeMastery,
  deriveGrowthState,
  findWeakKnowledgePoints,
  levelForStars,
  levelProgress,
  nextLevelForStars,
  recommendTopics,
  toDateKey,
} from '@/domain'

import { useCatalogStore } from './catalog'

/**
 * 学习进度 store
 * =============
 *
 * 唯一职责：持有原始学习记录（作答 + 完成），并把它们推导成
 * 课程地图状态、掌握度、成长数据、今日数据与家长报告。
 *
 * 推导全部发生在 domain 的纯函数里（可单测），store 只做缓存与持久化。
 */
export const useProgressStore = defineStore('progress', () => {
  const catalog = useCatalogStore()

  const snapshot = ref(progressRepository.load())
  /** 供“今天学了多久”“连续几天”这类时间相关的推导使用 */
  const now = ref(Date.now())

  const worldByCategory = Object.fromEntries(
    catalog.categories
      .map(category => [category.id, catalog.worldIdOfCategory(category.id)] as const)
      .filter((entry): entry is [CategoryId, string] => Boolean(entry[1])),
  )

  const completions = computed(() => snapshot.value.completions)
  const attempts = computed(() => snapshot.value.attempts)

  /** 课程地图：每个主题的解锁与完成状态 */
  const topicProgressMap = computed<Record<TopicId, TopicProgress>>(
    () => buildTopicProgressMap(catalog.topics, completions.value),
  )

  /** 成长状态：由学习记录推导，因此永远与进度一致 */
  const growth = computed(() =>
    deriveGrowthState(snapshot.value, now.value, catalog.badges, { worldByCategory }),
  )

  const level = computed<GrowthLevel>(() => levelForStars(growth.value.stars))
  const upcomingLevel = computed<GrowthLevel | null>(() => nextLevelForStars(growth.value.stars))
  const levelRatio = computed(() => levelProgress(growth.value.stars))

  /** 徽章墙：已获得 + 还差多少 */
  const badgeWall = computed(() =>
    catalog.badges.map((badge: BadgeDefinition) => {
      const earned = growth.value.badges.find(award => award.badgeId === badge.id)
      return {
        badge,
        earned: Boolean(earned),
        earnedAt: earned?.earnedAt ?? null,
        progress: badgeProgress(badge, growth.value),
      }
    }),
  )

  /* ---------------------------------------------------------------- */
  /* 今日数据：首页“今日任务 / 今日奖励”直接用                          */
  /* ---------------------------------------------------------------- */

  const todayKey = computed(() => toDateKey(now.value))

  const todayCompletions = computed(() =>
    completions.value.filter(completion => toDateKey(completion.completedAt) === todayKey.value),
  )

  const today = computed(() => ({
    minutes: Math.round(todayCompletions.value.reduce((sum, item) => sum + item.seconds, 0) / 60),
    lessons: todayCompletions.value.length,
    stars: todayCompletions.value.reduce((sum, item) => sum + item.stars, 0),
    categoryIds: [...new Set(todayCompletions.value.map(item => item.categoryId))],
  }))

  /* ---------------------------------------------------------------- */
  /* 查询                                                            */
  /* ---------------------------------------------------------------- */

  function topicProgressOf(topicId: TopicId): TopicProgress {
    return topicProgressMap.value[topicId] ?? {
      topicId,
      status: 'available',
      completedLessons: 0,
      totalLessons: catalog.topic(topicId)?.lessonIds.length ?? 0,
      stars: 0,
    }
  }

  function masteryOf(gradeId: GradeId, categoryId: CategoryId): CategoryMastery {
    return computeMastery(gradeId, categoryId, attempts.value)
  }

  function isLessonCompleted(lessonId: string): boolean {
    return completions.value.some(completion => completion.lessonId === lessonId)
  }

  function starsOfLesson(lessonId: string): number {
    return completions.value
      .filter(completion => completion.lessonId === lessonId)
      .reduce((max, completion) => Math.max(max, completion.stars), 0)
  }

  /** 下一步探索推荐：优先“进行中”，再按顺序推进 */
  function recommendFor(gradeId: GradeId, limit = 3): Topic[] {
    const topics = catalog.topics.filter(topic => topic.gradeId === gradeId)
    return recommendTopics(topics, topicProgressMap.value, limit)
  }

  /** 提升刷新时钟：进入首页 / 完成课程时调用 */
  function refresh(): void {
    now.value = Date.now()
  }

  /* ---------------------------------------------------------------- */
  /* 写入                                                            */
  /* ---------------------------------------------------------------- */

  function persist(): void {
    progressRepository.save(snapshot.value)
  }

  function recordAttempt(record: AttemptRecord): void {
    snapshot.value = {
      ...snapshot.value,
      attempts: [...snapshot.value.attempts, record],
    }
    persist()
  }

  function completeLesson(completion: LessonCompletion): void {
    const existing = snapshot.value.completions.filter(item => item.lessonId !== completion.lessonId)

    snapshot.value = {
      ...snapshot.value,
      completions: [...existing, completion],
      topics: topicProgressMap.value,
    }
    now.value = Date.now()
    persist()
  }

  function reset(): void {
    progressRepository.clear()
    snapshot.value = { topics: {}, completions: [], attempts: [] }
    now.value = Date.now()
  }

  /* ---------------------------------------------------------------- */
  /* 家长报告                                                        */
  /* ---------------------------------------------------------------- */

  /** 家长端最关心的问题：学了多久、学了什么、哪里薄弱、接下来建议学什么 */
  function reportFor(gradeId: GradeId) {
    const gradeCategories = catalog.categoriesOf(gradeId)
    const gradeCompletions = completions.value.filter(completion => completion.gradeId === gradeId)
    const gradeAttempts = attempts.value.filter(attempt => attempt.gradeId === gradeId)

    const mastery = gradeCategories.map(category => ({
      category,
      mastery: computeMastery(gradeId, category.id, gradeAttempts),
    }))

    const weakKnowledgePointIds = findWeakKnowledgePoints(gradeAttempts, 5)
    const knowledgePointLabels = new Map(
      catalog.topics
        .flatMap(topic => topic.knowledgePoints)
        .map(point => [point.id, point.label] as const),
    )

    return {
      gradeId,
      minutes: Math.round(gradeCompletions.reduce((sum, item) => sum + item.seconds, 0) / 60),
      lessons: gradeCompletions.length,
      stars: gradeCompletions.reduce((sum, item) => sum + item.stars, 0),
      correctRate: gradeAttempts.length === 0
        ? 0
        : Math.round((gradeAttempts.filter(attempt => attempt.correct).length / gradeAttempts.length) * 100),
      mastery,
      weakPoints: weakKnowledgePointIds.map(id => ({
        id,
        label: knowledgePointLabels.get(id) ?? id,
      })),
      recommendations: recommendFor(gradeId, 3),
      /** 兴趣偏好：哪个领域投入的时间最多 */
      interests: mastery
        .filter(item => item.mastery.attempts > 0)
        .sort((a, b) => b.mastery.attempts - a.mastery.attempts)
        .map(item => item.category),
    }
  }

  return {
    snapshot,
    completions,
    attempts,
    topicProgressMap,
    growth,
    level,
    upcomingLevel,
    levelRatio,
    badgeWall,
    today,
    todayKey,

    topicProgressOf,
    masteryOf,
    isLessonCompleted,
    starsOfLesson,
    recommendFor,
    refresh,
    recordAttempt,
    completeLesson,
    reset,
    reportFor,
  }
})
