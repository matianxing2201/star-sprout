import type { CatalogRepository } from '../ports/catalog-repository'

import type { ContentPack } from '@/content'
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
import { validateContentPack } from '@/content/schema'
import { resolveWorldId } from '@/content/worlds/routing'

/**
 * 本地内容包适配器
 * ===============
 *
 * 把静态内容包包装成 CatalogRepository 接口。
 * 内部一律用 Map 建索引：所有查询都是 O(1)，
 * 且返回值保持内容包里的顺序稳定（课程地图的排列依赖它）。
 */
export function createLocalCatalogRepository(pack: ContentPack): CatalogRepository {
  const gradeById = new Map<GradeId, Grade>()
  const categoryById = new Map<CategoryId, Category>()
  const topicById = new Map<TopicId, Topic>()
  const lessonById = new Map<LessonId, Lesson>()
  const worldById = new Map<string, LearningWorld>()
  const badgeById = new Map<string, BadgeDefinition>()
  const categoriesByGrade = new Map<GradeId, Category[]>()
  const topicsByGrade = new Map<GradeId, Topic[]>()
  const topicsByCategory = new Map<CategoryId, Topic[]>()
  const lessonsByTopic = new Map<TopicId, Lesson[]>()
  const worldByCategory = new Map<CategoryId, string>()

  for (const grade of pack.grades)
    gradeById.set(grade.id, grade)

  for (const category of pack.categories) {
    categoryById.set(category.id, category)
    push(categoriesByGrade, category.gradeId, category)
  }

  for (const topic of pack.topics) {
    topicById.set(topic.id, topic)
    push(topicsByGrade, topic.gradeId, topic)
    push(topicsByCategory, topic.categoryId, topic)
  }

  for (const lesson of pack.lessons) {
    lessonById.set(lesson.id, lesson)
    push(lessonsByTopic, lesson.topicId, lesson)
  }

  for (const world of pack.worlds) {
    worldById.set(world.id, world)
    for (const categoryId of world.categoryIds)
      worldByCategory.set(categoryId, world.id)
  }

  for (const badge of pack.badges)
    badgeById.set(badge.id, badge)

  const sortByOrder = <T extends { order: number }>(items: T[] | undefined): T[] =>
    items ? [...items].sort((a, b) => a.order - b.order) : []

  return {
    listGrades: () => sortByOrder(pack.grades),
    getGrade: id => gradeById.get(id),

    listCategories: gradeId => sortByOrder(categoriesByGrade.get(gradeId)),
    getCategory: id => categoryById.get(id),

    listTopics: gradeId => sortByOrder(topicsByGrade.get(gradeId)),
    listTopicsByCategory: categoryId => sortByOrder(topicsByCategory.get(categoryId)),
    getTopic: id => topicById.get(id),

    getLesson: id => lessonById.get(id),
    listLessonsByTopic: (topicId: TopicId) => {
      const topic = topicById.get(topicId)
      const lessons = lessonsByTopic.get(topicId) ?? []
      if (!topic)
        return lessons
      // 按主题声明的顺序返回，保证“第 1 节 / 第 2 节”稳定
      const indexed = new Map(lessons.map(lesson => [lesson.id, lesson]))
      return topic.lessonIds
        .map(id => indexed.get(id))
        .filter((lesson): lesson is Lesson => Boolean(lesson))
    },

    listWorlds: () => [...pack.worlds],
    getWorld: id => worldById.get(id),
    getWorldMap: (gradeId: GradeId): WorldMapLayout | undefined => pack.maps[gradeId],

    listBadges: () => [...pack.badges],
    getBadge: id => badgeById.get(id),

    worldIdOfCategory: (categoryId) => {
      const category = categoryById.get(categoryId)
      if (!category)
        return undefined
      // 内容里的显式归属优先，否则按色调推导（见 content/worlds/routing.ts）
      return resolveWorldId(category, worldByCategory)
    },

    validate: () => {
      const parsed = validateContentPack(pack)
      const schemaErrors = parsed.ok ? [] : parsed.errors
      return [...schemaErrors, ...validateIntegrity(pack)]
    },
  }
}

function push<K, V>(map: Map<K, V[]>, key: K, value: V): void {
  const list = map.get(key)
  if (list)
    list.push(value)
  else
    map.set(key, [value])
}

/**
 * 引用完整性检查：内容包最容易出错的地方是“指向了不存在的 id”，
 * 这里一次性全部找出来，避免上线后才发现某个主题点不进去。
 */
export function validateIntegrity(pack: ContentPack): string[] {
  const problems: string[] = []
  const gradeIds = new Set(pack.grades.map(grade => grade.id))
  const categoryIds = new Set(pack.categories.map(category => category.id))
  const topicIds = new Set(pack.topics.map(topic => topic.id))
  const lessonIds = new Set(pack.lessons.map(lesson => lesson.id))
  const worldIds = new Set(pack.worlds.map(world => world.id))

  for (const category of pack.categories) {
    if (!gradeIds.has(category.gradeId))
      problems.push(`领域 ${category.id} 指向了不存在的年级 ${category.gradeId}`)
  }

  for (const topic of pack.topics) {
    if (!categoryIds.has(topic.categoryId))
      problems.push(`主题 ${topic.id} 指向了不存在的领域 ${topic.categoryId}`)
    if (!gradeIds.has(topic.gradeId))
      problems.push(`主题 ${topic.id} 指向了不存在的年级 ${topic.gradeId}`)
    for (const lessonId of topic.lessonIds) {
      if (!lessonIds.has(lessonId))
        problems.push(`主题 ${topic.id} 引用了不存在的课程 ${lessonId}`)
    }
  }

  for (const lesson of pack.lessons) {
    if (!topicIds.has(lesson.topicId))
      problems.push(`课程 ${lesson.id} 指向了不存在的主题 ${lesson.topicId}`)
    if (!categoryIds.has(lesson.categoryId))
      problems.push(`课程 ${lesson.id} 指向了不存在的领域 ${lesson.categoryId}`)
  }

  for (const world of pack.worlds) {
    for (const categoryId of world.categoryIds) {
      if (!categoryIds.has(categoryId))
        problems.push(`学习世界 ${world.id} 关联了不存在的领域 ${categoryId}`)
    }
  }

  for (const [gradeId, layout] of Object.entries(pack.maps)) {
    if (!gradeIds.has(gradeId as GradeId))
      problems.push(`学习地图指向了不存在的年级 ${gradeId}`)
    const nodeIds = new Set(layout.nodes.map(node => node.worldId))
    for (const node of layout.nodes) {
      if (!worldIds.has(node.worldId))
        problems.push(`年级 ${gradeId} 的地图包含不存在的学习世界 ${node.worldId}`)
    }
    for (const path of layout.paths) {
      if (!nodeIds.has(path.from) || !nodeIds.has(path.to))
        problems.push(`年级 ${gradeId} 的地图路径 ${path.from} → ${path.to} 缺少对应节点`)
    }
  }

  return problems
}
