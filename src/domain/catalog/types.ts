import type { ToneKey } from '../shared/tone'

/**
 * 目录树（Catalog）：一级分类 → 二级分类 → 学习主题
 *
 * 这一层只描述“有什么可以学”，不描述“怎么学”。
 * 具体的教学过程放在 domain/lesson 里，两者通过 id 关联。
 */

export type GradeId
  = | 'nursery'
    | 'preschool'
    | 'grade-1'
    | 'grade-2'
    | 'grade-3'
    | 'grade-4'
    | 'grade-5'
    | 'grade-6'

/**
 * 一级分类的固定顺序与取值集合。
 * 产品需求明确锁定“中班 → 六年级”，任何界面都不允许重新排序，
 * 因此这里导出唯一的取值来源，schema 与界面都从它派生。
 */
export const GRADE_IDS = [
  'nursery',
  'preschool',
  'grade-1',
  'grade-2',
  'grade-3',
  'grade-4',
  'grade-5',
  'grade-6',
] as const

/** 学段：幼儿园 / 小学 */
export type StageId = 'kindergarten' | 'primary'

export type CategoryId = string
export type TopicId = string

/** 课程地图上的节点类型 —— 支撑“探索欲”而不只是线性清单 */
export const TOPIC_KINDS = ['standard', 'hidden', 'challenge'] as const

export type TopicKind = (typeof TOPIC_KINDS)[number]

export interface Grade {
  id: GradeId
  /** 一级分类名称，例如“中班” */
  name: string
  stage: StageId
  /** 升序序号，决定成长阶梯的顺序 */
  order: number
  ageRange: string
  emoji: string
  tone: ToneKey
  /** 一句话定位，孩子能读懂 */
  tagline: string
  /** 面向家长的一句话说明 */
  summary: string
  /** “下一阶段会有什么？” */
  nextHint: string
}

export interface Category {
  id: CategoryId
  gradeId: GradeId
  /** 二级分类名称，例如“语言表达” */
  name: string
  emoji: string
  tone: ToneKey
  /** 面向家长的领域说明 */
  summary: string
  /** 学习重点：这一领域要培养什么 */
  focus: string[]
  /** 包含的知识方向（对应需求文档中的条目） */
  skills: string[]
  order: number
}

export interface KnowledgePoint {
  id: string
  label: string
  detail?: string
}

export interface Topic {
  id: TopicId
  gradeId: GradeId
  categoryId: CategoryId
  /** 学习主题名称，例如“《春晓》” */
  title: string
  emoji: string
  kind: TopicKind
  order: number
  /** 学习目标（面向家长与教师） */
  objectives: string[]
  knowledgePoints: KnowledgePoint[]
  /** 主题下的课程 id，按学习顺序排列 */
  lessonIds: string[]
  /** 家长端可见的难度标记 1-3 */
  level: 1 | 2 | 3
}
