import type { CategoryId, GradeId, StageId, TopicKind } from './types'

/** 一级分类的固定顺序 —— 产品需求中明确锁定，不允许在界面层重新排序 */
export const STAGE_ORDER: StageId[] = ['kindergarten', 'primary']

export const STAGE_LABELS: Record<StageId, string> = {
  kindergarten: '学前启蒙',
  primary: '小学成长',
}

export const TOPIC_KIND_LABELS: Record<TopicKind, string> = {
  standard: '学习主题',
  hidden: '隐藏任务',
  challenge: '挑战任务',
}

/** 复合主键：领域与主题都属于某个年级，界面层不用自己拼字符串 */
export function categoryKey(gradeId: GradeId, categoryId: CategoryId): string {
  return `${gradeId}::${categoryId}`
}

export function gradeRank(order: number, total: number): number {
  if (total <= 1)
    return 0
  return order / (total - 1)
}
