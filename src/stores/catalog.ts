import type { Category, CategoryId, GradeId, Lesson, LessonId, Topic, TopicId } from '@/domain'
import { defineStore } from 'pinia'

import { computed } from 'vue'
import { catalogRepository } from '@/data'

/**
 * 内容目录 store
 * =============
 *
 * 内容包是构建期就固定的静态数据，因此这里不做响应式包装，
 * 只在装配时建好索引 —— 页面拿到的永远是同一份稳定引用，
 * 也就不会出现“切换年级时列表闪一下”的问题。
 */
export const useCatalogStore = defineStore('catalog', () => {
  const grades = catalogRepository.listGrades()

  const categories = grades.flatMap<Category>(grade => catalogRepository.listCategories(grade.id))
  const topics = grades.flatMap<Topic>(grade => catalogRepository.listTopics(grade.id))
  const lessons = topics.flatMap<Lesson>(topic => catalogRepository.listLessonsByTopic(topic.id))
  const worlds = catalogRepository.listWorlds()
  const badges = catalogRepository.listBadges()

  const categoryById = new Map<CategoryId, Category>(categories.map(category => [category.id, category]))
  const topicById = new Map<TopicId, Topic>(topics.map(topic => [topic.id, topic]))
  const lessonById = new Map<LessonId, Lesson>(lessons.map(lesson => [lesson.id, lesson]))

  /** 内容规模：首页与家长端用来说明“这个世界有多大” */
  const contentStats = computed(() => ({
    grades: grades.length,
    categories: categories.length,
    topics: topics.length,
    lessons: lessons.length,
    skills: categories.reduce((sum, category) => sum + category.skills.length, 0),
  }))

  /** 内容自检：开发期在控制台打印，家长端“内容完整性”也读它 */
  let cachedIssues: string[] | null = null
  function selfCheck(): string[] {
    cachedIssues ??= catalogRepository.validate()
    return cachedIssues
  }

  function categoriesOf(gradeId: GradeId): Category[] {
    return catalogRepository.listCategories(gradeId)
  }

  function topicsOfCategory(categoryId: CategoryId): Topic[] {
    return catalogRepository.listTopicsByCategory(categoryId)
  }

  function lessonsOfTopic(topicId: TopicId): Lesson[] {
    return catalogRepository.listLessonsByTopic(topicId)
  }

  function countLessonsOfCategory(categoryId: CategoryId): number {
    return topicsOfCategory(categoryId).reduce((sum, topic) => sum + topic.lessonIds.length, 0)
  }

  return {
    grades,
    categories,
    topics,
    lessons,
    worlds,
    badges,
    categoryById,
    topicById,
    lessonById,
    contentStats,

    selfCheck,
    categoriesOf,
    topicsOfCategory,
    lessonsOfTopic,
    countLessonsOfCategory,

    grade: (id: GradeId) => catalogRepository.getGrade(id),
    category: (id: CategoryId) => catalogRepository.getCategory(id),
    topic: (id: TopicId) => catalogRepository.getTopic(id),
    lesson: (id: LessonId) => catalogRepository.getLesson(id),
    world: (id: string) => catalogRepository.getWorld(id),
    worldMap: (gradeId: GradeId) => catalogRepository.getWorldMap(gradeId),
    badge: (id: string) => catalogRepository.getBadge(id),
    worldIdOfCategory: (id: CategoryId) => catalogRepository.worldIdOfCategory(id),
  }
})
