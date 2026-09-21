import type { CategoryId, GradeId, KnowledgePoint, TopicId } from '../catalog/types'
import type { InteractionSpec } from '../interaction/types'
import type { MascotId } from '../mascot/types'
import type { ToneKey } from '../shared/tone'

/**
 * 课程（Lesson）与学习任务（LearningTask）
 * ======================================
 *
 * 结构对应产品的“教案 → 可玩课程”转换链路：
 *
 *   年级 → 学科/领域 → 课程主题 → 知识点 → 学习目标
 *        → 教学过程 → 互动任务 → 练习 → 挑战 → 学习结果
 *
 * 页面（LessonPage）只负责编排，真正的教学过程完全由数据驱动。
 */

export type LessonId = string
export type TaskId = string

/**
 * 学习任务的六种角色，顺序即建议的教学节奏：
 * 角色引入 → 知识发现 → 互动操作 → 知识练习 → 挑战任务 → 奖励
 */
export type LearningTaskKind
  = | 'intro'
    | 'discover'
    | 'interaction'
    | 'practice'
    | 'challenge'
    | 'reward'

export const TASK_KIND_LABELS: Record<LearningTaskKind, string> = {
  intro: '角色引入',
  discover: '知识发现',
  interaction: '动手探索',
  practice: '小试身手',
  challenge: '挑战任务',
  reward: '领取奖励',
}

/** 角色引入：用一句故事把孩子带进来 */
export interface StoryBeat {
  mascot: MascotId
  lines: string[]
  /** 角色情绪，驱动动效强度 */
  mood?: 'happy' | 'curious' | 'thinking' | 'cheering'
}

/** 知识发现的卡片，一张卡只讲一件事 */
export interface DiscoverCard {
  id: string
  emoji: string
  title: string
  body: string
  /** 孩子可以点一下听到的声音 / 看到的小演示 */
  tone?: ToneKey
  tip?: string
}

export interface DiscoveryPanel {
  cards: DiscoverCard[]
}

export interface TaskReward {
  stars: 1 | 2 | 3
  message: string
  badgeId?: string
}

interface TaskBase {
  id: TaskId
  title: string
  /** 给孩子的操作说明，一句话 */
  instruction?: string
  /** 该步骤中角色要说的话（会展示在角色气泡里） */
  mascotLine?: string
  /**
   * 这一步考察的知识点。
   * 家长端的「薄弱知识点」完全由它推导 —— 没有它就无法做个性化推荐，
   * 因此写教案时必须填。
   */
  knowledgePointIds?: string[]
}

export type LearningTask
  = | (TaskBase & { kind: 'intro', story: StoryBeat })
    | (TaskBase & { kind: 'discover', discovery: DiscoveryPanel })
    | (TaskBase & { kind: 'interaction' | 'practice' | 'challenge', interactions: InteractionSpec[] })
    | (TaskBase & { kind: 'reward', reward: TaskReward })

/**
 * 各步骤类型的具名别名。
 * 视图层按 `kind` 分支渲染时用它们收窄类型，
 * 这样每个步骤组件只会拿到自己需要的那部分数据。
 */
export type IntroTask = Extract<LearningTask, { kind: 'intro' }>
export type DiscoverTask = Extract<LearningTask, { kind: 'discover' }>
/** 互动 / 小游戏 / 挑战共用同一套结构，只是教学位置不同 */
export type PracticeTask = Extract<LearningTask, { kind: 'interaction' | 'practice' | 'challenge' }>
export type RewardTask = Extract<LearningTask, { kind: 'reward' }>

export interface LessonReward {
  /** 完成整节课获得的总星星 */
  stars: 1 | 2 | 3
  /** 可能解锁的徽章 */
  badgeId?: string
  /** 完成后解锁的主题（课程地图上的推进） */
  unlocksTopicIds?: TopicId[]
  message: string
}

export interface Lesson {
  id: LessonId
  gradeId: GradeId
  categoryId: CategoryId
  topicId: TopicId
  title: string
  emoji: string
  /** 本节要回答的那个问题：“今天要探索什么？” */
  question: string
  mascot: MascotId
  /** 预计时长（分钟）。儿童单任务控制在 1~3 分钟 */
  minutes: number
  /** 学习目标（面向家长与教师，不直接展示给孩子） */
  objectives: string[]
  knowledgePoints: KnowledgePoint[]
  tone: ToneKey
  tasks: LearningTask[]
  reward: LessonReward
}

/** 课程的进度快照：由 domain/learning 计算，视图层只读 */
export interface LessonOutline {
  lessonId: LessonId
  title: string
  emoji: string
  taskCount: number
  minutes: number
}
