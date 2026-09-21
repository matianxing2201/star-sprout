import type { CategoryId, GradeId, Topic, TopicId } from '../catalog/types'
import type { BadgeDefinition, GrowthState, LearningStats } from '../growth/types'
import type {
  AttemptRecord,
  CategoryMastery,
  LessonCompletion,
  ProgressSnapshot,
  TopicProgress,
} from './types'
import { toDateKey } from '../growth/rewards'

/**
 * 学习进度推导（纯函数）
 * ====================
 *
 * 设计原则：**学习记录是唯一事实来源，成长状态是推导结果。**
 * 这样家长端、成长页、课程地图看到的数据永远一致，
 * 也不会出现“本地存储被改坏后成长数据错乱”的问题。
 */

/* ------------------------------------------------------------------ */
/* 连续学习                                                            */
/* ------------------------------------------------------------------ */

/**
 * 计算连续学习天数。
 * - 今天学过：从今天往前数
 * - 今天还没学：从昨天往前数（不到当天结束不算断）
 * - 隔天一上：从 1 重新开始，且不做任何“清零”提示，避免挫败感
 */
export function computeStreak(activeDateKeys: readonly string[], todayKey: string): number {
  const unique = [...new Set(activeDateKeys)].sort().reverse()
  if (unique.length === 0)
    return 0

  const day = 86_400_000
  const today = new Date(`${todayKey}T00:00:00`).getTime()
  let cursor = today
  let streak = 0

  if (!unique.includes(todayKey)) {
    // 今天还没有学习记录，允许从昨天开始续上
    cursor -= day
  }

  for (const key of unique) {
    const time = new Date(`${key}T00:00:00`).getTime()
    if (time === cursor) {
      streak += 1
      cursor -= day
    }
    else if (time < cursor) {
      break
    }
  }

  return streak
}

/* ------------------------------------------------------------------ */
/* 任务与主题进度                                                       */
/* ------------------------------------------------------------------ */

export function computeTopicProgress(topic: Topic, completions: readonly LessonCompletion[]): TopicProgress {
  const done = completions.filter(completion => completion.topicId === topic.id)
  const totalLessons = topic.lessonIds.length
  const completedLessons = Math.min(done.length, totalLessons)
  const stars = done.reduce((sum, completion) => sum + completion.stars, 0)

  let status: TopicProgress['status'] = 'available'
  if (totalLessons > 0 && completedLessons >= totalLessons)
    status = 'completed'
  else if (completedLessons > 0)
    status = 'in-progress'

  return { topicId: topic.id, status, completedLessons, totalLessons, stars }
}

/**
 * 课程地图状态机：
 * 同一个领域内按 order 串成路径，前一主题完成后才解锁下一个。
 * 第一个主题始终可进入 —— 孩子任何时候都有“下一步”可以走。
 */
export function buildTopicProgressMap(
  topics: readonly Topic[],
  completions: readonly LessonCompletion[],
): Record<TopicId, TopicProgress> {
  const byTopic = new Map<TopicId, TopicProgress>()
  const byCategory = new Map<CategoryId, Topic[]>()

  for (const topic of topics) {
    const list = byCategory.get(topic.categoryId) ?? []
    list.push(topic)
    byCategory.set(topic.categoryId, list)
  }

  for (const list of byCategory.values()) {
    const ordered = [...list].sort((a, b) => a.order - b.order)
    let unlocked = true

    for (const topic of ordered) {
      const progress = computeTopicProgress(topic, completions)
      byTopic.set(topic.id, {
        ...progress,
        status: progress.status === 'completed' ? 'completed' : unlocked ? progress.status : 'locked',
      })
      unlocked = progress.status === 'completed'
    }
  }

  return Object.fromEntries(byTopic)
}

/* ------------------------------------------------------------------ */
/* 掌握度与薄弱点                                                       */
/* ------------------------------------------------------------------ */

export function computeMastery(
  gradeId: GradeId,
  categoryId: CategoryId,
  attempts: readonly AttemptRecord[],
): CategoryMastery {
  const scoped = attempts.filter(attempt => attempt.categoryId === categoryId && attempt.gradeId === gradeId)
  const correctCount = scoped.filter(attempt => attempt.correct).length
  const correctRate = scoped.length === 0 ? 0 : correctCount / scoped.length
  const errorRate
    = scoped.length === 0 ? 0 : scoped.filter(attempt => !attempt.correct).length / scoped.length

  return {
    gradeId,
    categoryId,
    mastery: Math.round(Math.max(0, correctRate - errorRate * 0.5) * 100) / 100,
    attempts: scoped.length,
    correctRate: Math.round(correctRate * 100) / 100,
    weakKnowledgePointIds: findWeakKnowledgePoints(scoped),
  }
}

/** 出错次数最多的知识点，供“今日挑战”推荐使用 */
export function findWeakKnowledgePoints(attempts: readonly AttemptRecord[], limit = 3): string[] {
  const score = new Map<string, number>()

  for (const attempt of attempts) {
    if (attempt.correct && !attempt.usedHint)
      continue

    const weight = attempt.correct ? 0.5 : 1
    for (const id of attempt.knowledgePointIds)
      score.set(id, (score.get(id) ?? 0) + weight)
  }

  return [...score.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([id]) => id)
}

/* ------------------------------------------------------------------ */
/* 成长状态推导                                                        */
/* ------------------------------------------------------------------ */

export interface DeriveGrowthOptions {
  /** 领域 → 学习世界 的映射，用于统计“已探索区域” */
  worldByCategory?: Record<CategoryId, string>
}

/**
 * 从一个不含星星的空白状态出发，用学习记录重建完整的成长状态。
 * 学习记录是唯一事实来源，因此这个方法的结果是可复现的。
 */
export function deriveGrowthState(
  snapshot: ProgressSnapshot,
  today: number,
  badgeDefinitions: readonly BadgeDefinition[] = [],
  options: DeriveGrowthOptions = {},
): GrowthState {
  const { completions, attempts } = snapshot
  const dateKeys = completions.map(completion => toDateKey(completion.completedAt))
  const todayKey = toDateKey(today)
  const learningDays = new Set(dateKeys).size
  const streakDays = computeStreak(dateKeys, todayKey)

  const stats: LearningStats = {
    stars: completions.reduce((sum, completion) => sum + completion.stars, 0),
    // 能量来自“坚持”：连续学习是主要来源，学习天数提供基础值
    energy: learningDays * 2 + streakDays * 10,
    lessonsCompleted: completions.length,
    perfectLessons: completions.filter(completion => isPerfectLesson(completion, attempts)).length,
    streakDays,
    learningDays,
    totalMinutes: Math.round(completions.reduce((sum, completion) => sum + completion.seconds, 0) / 60),
    categoryLessons: countBy(completions, completion => completion.categoryId),
    topicStars: sumBy(completions, completion => completion.topicId, completion => completion.stars),
    exploredWorldIds: deriveExploredWorlds(completions, options.worldByCategory),
  }

  const earned = badgeDefinitions.filter(definition => matchesStats(definition, stats))
  const earnedAt = latestCompletionAt(completions) ?? today

  return {
    ...stats,
    // 徽章在达成当天获得
    badges: earned.map(definition => ({ badgeId: definition.id, earnedAt })),
    lastActiveDate: dateKeys.sort().at(-1) ?? null,
  }
}

function isPerfectLesson(completion: LessonCompletion, attempts: readonly AttemptRecord[]): boolean {
  const scoped = attempts.filter(attempt => attempt.lessonId === completion.lessonId)
  return scoped.length > 0 && scoped.every(attempt => attempt.correct && !attempt.usedHint)
}

function deriveExploredWorlds(
  completions: readonly LessonCompletion[],
  worldByCategory: Record<CategoryId, string> = {},
): string[] {
  const worlds = new Set<string>()
  for (const completion of completions) {
    const worldId = worldByCategory[completion.categoryId]
    if (worldId)
      worlds.add(worldId)
  }
  return [...worlds]
}

function matchesStats(definition: BadgeDefinition, stats: LearningStats): boolean {
  const rule = definition.rule
  switch (rule.type) {
    case 'stars':
      return stats.stars >= rule.count
    case 'streak':
      return stats.streakDays >= rule.days
    case 'lessons':
      return stats.lessonsCompleted >= rule.count
    case 'perfect-lessons':
      return stats.perfectLessons >= rule.count
    case 'learning-days':
      return stats.learningDays >= rule.days
    case 'category-lessons':
      return (stats.categoryLessons[rule.categoryId] ?? 0) >= rule.count
    case 'topic-stars':
      return (stats.topicStars[rule.topicId] ?? 0) >= rule.count
    default:
      return false
  }
}

function countBy<T>(items: readonly T[], key: (item: T) => string): Record<string, number> {
  const result: Record<string, number> = {}
  for (const item of items) {
    const k = key(item)
    result[k] = (result[k] ?? 0) + 1
  }
  return result
}

function sumBy<T>(items: readonly T[], key: (item: T) => string, value: (item: T) => number): Record<string, number> {
  const result: Record<string, number> = {}
  for (const item of items) {
    const k = key(item)
    result[k] = (result[k] ?? 0) + value(item)
  }
  return result
}

function latestCompletionAt(completions: readonly LessonCompletion[]): number | null {
  if (completions.length === 0)
    return null
  return Math.max(...completions.map(completion => completion.completedAt))
}

export function emptySnapshot(): ProgressSnapshot {
  return { topics: {}, completions: [], attempts: [] }
}

/* ------------------------------------------------------------------ */
/* 主动推荐（对应“个性化学习”）                                          */
/* ------------------------------------------------------------------ */

/**
 * 推荐下一步：优先未完成的、已经解锁的主题。
 *
 * 排序规则（就是孩子在首页“今天要探索什么”里看到的顺序）：
 *   1. 正在探索的主题 —— 先把手上这件事做完
 *   2. 孩子已经开始的领域 —— 保持连续性，别让他来回跳
 *   3. 领域内的顺序 —— 由内容包定义的路径
 *
 * 孩子永远能看到“下一步做什么”，这是自驱力的基础。
 */
export function recommendTopics(
  topics: readonly Topic[],
  progressMap: Record<TopicId, TopicProgress>,
  limit = 3,
): Topic[] {
  const startedCategories = new Set(
    topics
      .filter((topic) => {
        const progress = progressMap[topic.id]
        return progress !== undefined && (progress.completedLessons > 0 || progress.status === 'in-progress')
      })
      .map(topic => topic.categoryId),
  )

  function score(topic: Topic): number {
    if (progressMap[topic.id]?.status === 'in-progress')
      return 0
    return startedCategories.has(topic.categoryId) ? 1 : 2
  }

  return topics
    .filter((topic) => {
      const status = progressMap[topic.id]?.status
      return status === 'available' || status === 'in-progress'
    })
    .sort((a, b) => score(a) - score(b) || a.order - b.order || a.id.localeCompare(b.id))
    .slice(0, limit)
}
