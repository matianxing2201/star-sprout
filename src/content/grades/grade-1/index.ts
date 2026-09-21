import type { GradeContent } from '../types'
import { xiaoTuZiLesson } from './lessons/xiao-tu-zi'
import { categories, grade } from './taxonomy'
import { topics } from './topics'

/** 一年级内容包 */
export const grade1Content: GradeContent = {
  grade,
  categories,
  topics,
  lessons: [xiaoTuZiLesson],
}
