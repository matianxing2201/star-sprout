import type {
  BadgeDefinition,
  Category,
  CategoryId,
  Grade,
  GradeId,
  LearningWorld,
  Lesson,
  LessonId,
  Topic,
  TopicId,
  WorldMapLayout,
} from '@/domain'

/**
 * 目录仓储（端口）
 * ===============
 *
 * 视图与状态层只依赖这个接口，不关心内容来自哪里。
 * 今天它由本地内容包实现；将来要接后台 CMS / 接口，
 * 只需新增一个 adapter，页面与 store 一行都不用改。
 */
export interface CatalogRepository {
  listGrades: () => Grade[]
  getGrade: (id: GradeId) => Grade | undefined

  listCategories: (gradeId: GradeId) => Category[]
  getCategory: (id: CategoryId) => Category | undefined

  listTopics: (gradeId: GradeId) => Topic[]
  listTopicsByCategory: (categoryId: CategoryId) => Topic[]
  getTopic: (id: TopicId) => Topic | undefined

  getLesson: (id: LessonId) => Lesson | undefined
  listLessonsByTopic: (topicId: TopicId) => Lesson[]

  listWorlds: () => LearningWorld[]
  getWorld: (id: string) => LearningWorld | undefined
  getWorldMap: (gradeId: GradeId) => WorldMapLayout | undefined

  listBadges: () => BadgeDefinition[]
  getBadge: (id: string) => BadgeDefinition | undefined

  /** 领域 → 学习世界：用于统计“已探索区域”、在领域页展示所属世界 */
  worldIdOfCategory: (categoryId: CategoryId) => string | undefined

  /** 内容包自检：开发期断言与家长端“内容完整性”都读它 */
  validate: () => string[]
}
