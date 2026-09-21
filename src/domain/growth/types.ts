import type { CategoryId, TopicId } from '../catalog/types'
import type { ToneKey } from '../shared/tone'

/**
 * 成长体系（Growth）
 * ================
 *
 * 产品要求：不要“完成课程 +1 分”，而要建立孩子能理解的成长语言：
 *   星星（完成任务）· 能量（连续学习）· 徽章（特定挑战）· 等级（成长阶段）
 *
 * 同时要求“不要过度奖励”，因此奖励按层级（RewardTier）分级，
 * 由 domain/growth/rewards.ts 统一决定动效强度与音效，页面不得自行加码。
 */

/* ------------------------------------------------------------------ */
/* 奖励分级                                                            */
/* ------------------------------------------------------------------ */

export type RewardTier
  = | 'tap' // 普通：轻微动画 + 轻音
    | 'correct' // 正确：角色反馈 + 星星
    | 'task' // 完成任务：奖励动画
    | 'lesson' // 完成课程：较明显奖励
    | 'chapter' // 完成章节：大奖励
    | 'streak' // 连续学习：特殊奖励

export interface RewardTierSpec {
  tier: RewardTier
  label: string
  /** 是否飞星星 */
  flyStars: number
  /** 是否撒彩纸 */
  confetti: boolean
  /** 角色是否出场庆祝 */
  mascotCheer: boolean
  /** 屏幕是否轻微震动（仅高等级） */
  screenPulse: boolean
  /** 时长（毫秒），单次反馈控制在 0.5~1.5s */
  duration: number
  stars: number
  energy: number
}

/* ------------------------------------------------------------------ */
/* 徽章                                                                */
/* ------------------------------------------------------------------ */

export const BADGE_IDS = [
  'reading-star',
  'math-explorer',
  'little-scientist',
  'creative-master',
  'rhythm-master',
  'thinking-detective',
  'explorer',
] as const

export type BadgeId = (typeof BADGE_IDS)[number]

/**
 * 徽章解锁条件被声明成数据而不是函数，
 * 这样新增徽章（甚至后续做后台配置）都不需要改代码。
 */
export type BadgeRule
  = | { type: 'stars', count: number }
    | { type: 'streak', days: number }
    | { type: 'lessons', count: number }
    | { type: 'perfect-lessons', count: number }
    | { type: 'category-lessons', categoryId: CategoryId, count: number }
    | { type: 'topic-stars', topicId: TopicId, count: number }
    | { type: 'learning-days', days: number }

export interface BadgeDefinition {
  id: BadgeId
  name: string
  emoji: string
  description: string
  tone: ToneKey
  rule: BadgeRule
}

/* ------------------------------------------------------------------ */
/* 等级                                                                */
/* ------------------------------------------------------------------ */

export interface GrowthLevel {
  id: string
  name: string
  emoji: string
  /** 达到该等级所需的星星数（含） */
  from: number
}

/* ------------------------------------------------------------------ */
/* 状态                                                                */
/* ------------------------------------------------------------------ */

export interface BadgeAward {
  badgeId: BadgeId
  earnedAt: number
}

/** 家长端与成长页共用的统计口径，全部由原始记录推导（见 learning/progress.ts） */
export interface LearningStats {
  stars: number
  energy: number
  lessonsCompleted: number
  /** 一次都没有答错、也没用提示的课程数 */
  perfectLessons: number
  streakDays: number
  /** 有学习记录的天数 */
  learningDays: number
  totalMinutes: number
  /** 各领域完成的课程数 */
  categoryLessons: Record<CategoryId, number>
  /** 各主题累计星星 */
  topicStars: Record<TopicId, number>
  /** 已探索过的学习世界 id */
  exploredWorldIds: string[]
}

export interface GrowthState extends LearningStats {
  badges: BadgeAward[]
  /** 最近一次学习日期，格式 YYYY-MM-DD */
  lastActiveDate: string | null
}

export function createEmptyGrowthState(): GrowthState {
  return {
    stars: 0,
    energy: 0,
    lessonsCompleted: 0,
    perfectLessons: 0,
    streakDays: 0,
    learningDays: 0,
    totalMinutes: 0,
    categoryLessons: {},
    topicStars: {},
    exploredWorldIds: [],
    badges: [],
    lastActiveDate: null,
  }
}
