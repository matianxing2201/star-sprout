import type {
  BadgeDefinition,
  BadgeRule,
  GrowthLevel,
  LearningStats,
  RewardTier,
  RewardTierSpec,
} from './types'

/**
 * 成长体系的纯规则层。
 * 所有函数都是纯函数（无副作用、无时间依赖），时间通过参数传入，便于单测。
 */

/* ------------------------------------------------------------------ */
/* 奖励分级：产品明确要求“不要所有点击都爆金币”                          */
/* ------------------------------------------------------------------ */

export const REWARD_TIERS: Record<RewardTier, RewardTierSpec> = {
  tap: {
    tier: 'tap',
    label: '轻触',
    flyStars: 0,
    confetti: false,
    mascotCheer: false,
    screenPulse: false,
    duration: 160,
    stars: 0,
    energy: 0,
  },
  correct: {
    tier: 'correct',
    label: '答对',
    flyStars: 1,
    confetti: false,
    mascotCheer: true,
    screenPulse: false,
    duration: 640,
    stars: 1,
    energy: 1,
  },
  task: {
    tier: 'task',
    label: '完成任务',
    flyStars: 3,
    confetti: false,
    mascotCheer: true,
    screenPulse: false,
    duration: 900,
    stars: 2,
    energy: 2,
  },
  lesson: {
    tier: 'lesson',
    label: '完成课程',
    flyStars: 6,
    confetti: true,
    mascotCheer: true,
    screenPulse: false,
    duration: 1400,
    stars: 5,
    energy: 6,
  },
  chapter: {
    tier: 'chapter',
    label: '完成章节',
    flyStars: 12,
    confetti: true,
    mascotCheer: true,
    screenPulse: true,
    duration: 1500,
    stars: 12,
    energy: 15,
  },
  streak: {
    tier: 'streak',
    label: '连续学习',
    flyStars: 8,
    confetti: true,
    mascotCheer: true,
    screenPulse: false,
    duration: 1500,
    stars: 8,
    energy: 20,
  },
}

export function rewardSpec(tier: RewardTier): RewardTierSpec {
  return REWARD_TIERS[tier]
}

/* ------------------------------------------------------------------ */
/* 等级                                                                */
/* ------------------------------------------------------------------ */

export const GROWTH_LEVELS: GrowthLevel[] = [
  { id: 'seed', name: '小种子', icon: 'acorn', from: 0 },
  { id: 'sprout', name: '小芽芽', icon: 'plant', from: 20 },
  { id: 'sapling', name: '小树苗', icon: 'tree', from: 60 },
  { id: 'ranger', name: '森林探险家', icon: 'compass', from: 130 },
  { id: 'navigator', name: '星图领航员', icon: 'map', from: 240 },
  { id: 'captain', name: '探索队长', icon: 'rocket', from: 400 },
  { id: 'master', name: '学习世界大师', icon: 'trophy', from: 640 },
]

export function levelForStars(stars: number): GrowthLevel {
  let current = GROWTH_LEVELS[0]
  for (const level of GROWTH_LEVELS) {
    if (stars >= level.from)
      current = level
  }
  return current
}

export function nextLevelForStars(stars: number): GrowthLevel | null {
  return GROWTH_LEVELS.find(level => level.from > stars) ?? null
}

/** 当前等级内的进度 0~1，用于成长页的进度环 */
export function levelProgress(stars: number): number {
  const current = levelForStars(stars)
  const next = nextLevelForStars(stars)
  if (!next)
    return 1
  const span = next.from - current.from
  if (span <= 0)
    return 1
  return Math.min(1, Math.max(0, (stars - current.from) / span))
}

/* ------------------------------------------------------------------ */
/* 日期工具                                                            */
/* ------------------------------------------------------------------ */

/** 返回 YYYY-MM-DD（本地时区），成长体系以“天”为最小单位 */
export function toDateKey(timestamp: number): string {
  const date = new Date(timestamp)
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

export function daysBetween(fromKey: string, toKey: string): number {
  const from = new Date(`${fromKey}T00:00:00`).getTime()
  const to = new Date(`${toKey}T00:00:00`).getTime()
  return Math.round((to - from) / 86_400_000)
}

/* ------------------------------------------------------------------ */
/* 徽章                                                                */
/* ------------------------------------------------------------------ */

export function matchesBadgeRule(rule: BadgeRule, stats: LearningStats): boolean {
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

/** 返回本次新解锁的徽章（已拥有的会被过滤掉） */
export function evaluateBadges(
  definitions: readonly BadgeDefinition[],
  stats: LearningStats,
  owned: readonly string[],
): BadgeDefinition[] {
  return definitions.filter(definition =>
    !owned.includes(definition.id) && matchesBadgeRule(definition.rule, stats),
  )
}

/** 徽章墙上的进度 0~1，用于展示“还差多少” */
export function badgeProgress(definition: BadgeDefinition, stats: LearningStats): number {
  const rule = definition.rule
  const ratio = (current: number, target: number) => (target <= 0 ? 1 : Math.min(1, current / target))

  switch (rule.type) {
    case 'stars':
      return ratio(stats.stars, rule.count)
    case 'streak':
      return ratio(stats.streakDays, rule.days)
    case 'lessons':
      return ratio(stats.lessonsCompleted, rule.count)
    case 'perfect-lessons':
      return ratio(stats.perfectLessons, rule.count)
    case 'learning-days':
      return ratio(stats.learningDays, rule.days)
    case 'category-lessons':
      return ratio(stats.categoryLessons[rule.categoryId] ?? 0, rule.count)
    case 'topic-stars':
      return ratio(stats.topicStars[rule.topicId] ?? 0, rule.count)
    default:
      return 0
  }
}
