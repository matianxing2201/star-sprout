import type { CategoryId, GradeId, TopicId } from '../catalog/types'
import type { LearningTaskKind, LessonId, TaskId } from '../lesson/types'

/**
 * 学习过程（Learning）：学习会话、任务进度、掌握度。
 *
 * 这一层是纯逻辑：输入是“记录”，输出是“状态”。
 * 不依赖 Vue、不依赖存储，因此可以完整单测（见同目录 *.spec.ts）。
 */

export type ProgressStatus = 'locked' | 'available' | 'in-progress' | 'completed'

/** 一次作答记录，家长端的薄弱点分析全部由它推导 */
export interface AttemptRecord {
  lessonId: LessonId
  topicId: TopicId
  gradeId: GradeId
  categoryId: CategoryId
  taskId: TaskId
  taskKind: LearningTaskKind
  /** 知识点 id，用于定位薄弱点 */
  knowledgePointIds: string[]
  correct: boolean
  attempts: number
  usedHint: boolean
  skipped: boolean
  /** 时间戳（毫秒） */
  at: number
}

/** 一节课的完成记录 */
export interface LessonCompletion {
  lessonId: LessonId
  topicId: TopicId
  gradeId: GradeId
  categoryId: CategoryId
  stars: number
  /** 用时（秒） */
  seconds: number
  completedAt: number
}

/** 主题（课程地图节点）的进度 */
export interface TopicProgress {
  topicId: TopicId
  status: ProgressStatus
  /** 主题下已完成课程数 */
  completedLessons: number
  totalLessons: number
  /** 该主题累计获得星星 */
  stars: number
}

/** 领域（二级分类）的掌握度 */
export interface CategoryMastery {
  gradeId: GradeId
  categoryId: CategoryId
  /** 0 ~ 1 */
  mastery: number
  attempts: number
  correctRate: number
  /** 掌握最弱的知识点，供“今日挑战”推荐 */
  weakKnowledgePointIds: string[]
}

/** 一次学习会话（进入课程到离开课程） */
export interface LearningSession {
  lessonId: LessonId
  startedAt: number
  /** 已经完成的任务 id */
  completedTaskIds: TaskId[]
  /** 当前任务下标 */
  cursor: number
  /** 本次会话的作答记录 */
  attempts: AttemptRecord[]
  finished: boolean
}

export interface ProgressSnapshot {
  topics: Record<TopicId, TopicProgress>
  completions: LessonCompletion[]
  attempts: AttemptRecord[]
}
