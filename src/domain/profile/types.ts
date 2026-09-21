import type { GradeId } from '../catalog/types'
import type { MascotId } from '../mascot/types'

/**
 * 孩子档案
 * =======
 *
 * 第一版没有账号体系：档案存在本机浏览器里。
 * 因此这里只保留最少的字段 —— 孩子端要“打开就能用”，
 * 家长端的入口也不应该被注册流程挡住。
 */
export interface ChildProfile {
  nickname: string
  mascot: MascotId
  gradeId: GradeId
  createdAt: number
}

export const DEFAULT_PROFILE: ChildProfile = {
  nickname: '小探险家',
  mascot: 'fox',
  gradeId: 'nursery',
  createdAt: 0,
}
