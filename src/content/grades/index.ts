import type { GradeContent } from './types'

import { grade1Content } from './grade-1'
import { categories as grade2Categories, grade as grade2Grade } from './grade-2/taxonomy'
import { categories as grade3Categories, grade as grade3Grade } from './grade-3/taxonomy'
import { categories as grade4Categories, grade as grade4Grade } from './grade-4/taxonomy'
import { categories as grade5Categories, grade as grade5Grade } from './grade-5/taxonomy'
import { categories as grade6Categories, grade as grade6Grade } from './grade-6/taxonomy'
import { nurseryContent } from './nursery'
import { categories as preschoolCategories, grade as preschoolGrade } from './preschool/taxonomy'

/**
 * 八个年级的内容包，顺序 = 成长阶梯的顺序。
 *
 * 当前保留八个年级的目录（领域与知识方向），不加载课程或题目。
 */
export const GRADE_CONTENTS: GradeContent[] = [
  nurseryContent,
  { grade: preschoolGrade, categories: preschoolCategories, topics: [], lessons: [] },
  grade1Content,
  { grade: grade2Grade, categories: grade2Categories, topics: [], lessons: [] },
  { grade: grade3Grade, categories: grade3Categories, topics: [], lessons: [] },
  { grade: grade4Grade, categories: grade4Categories, topics: [], lessons: [] },
  { grade: grade5Grade, categories: grade5Categories, topics: [], lessons: [] },
  { grade: grade6Grade, categories: grade6Categories, topics: [], lessons: [] },
]
