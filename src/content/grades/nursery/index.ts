import type { GradeContent } from '../types'
import { categories, grade } from './taxonomy'
import { topics } from './topics'

/** 中班年级大纲：只保留分类目录。 */
export const nurseryContent: GradeContent = {
  grade,
  categories,
  topics,
  lessons: [],
}
