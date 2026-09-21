import type { Category, Grade, Lesson, Topic } from '@/domain'

/**
 * 一个年级的内容包。
 *
 * 目录（grade + categories）由 `taxonomy.ts` 提供；
 * 学习主题与课程在教案到位后逐步补充，缺省为空数组 —— 界面会自动呈现“内容准备中”。
 */
export interface GradeContent {
  grade: Grade
  categories: Category[]
  topics: Topic[]
  lessons: Lesson[]
}
