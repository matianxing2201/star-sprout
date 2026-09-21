import type { AppIconName, Topic, UiTone } from '@/domain'
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { ROUTE_NAMES } from '@/app/router/route-names'

import { NEUTRAL_TONE } from '@/domain'
import { useCatalogStore, useProfileStore, useProgressStore } from '@/stores'
import { TONE_ICONS, TOPIC_KIND_ICONS } from '@/ui/icons'

/**
 * 原型用的真实数据（只读）
 * ========================
 *
 * 三个变体必须承载**完全相同的内容** —— 同一个孩子、同一天、同一份地图 ——
 * 否则比较不成立：你会分不清「我喜欢 B」是因为布局还是因为它碰巧数据更好看。
 *
 * 所以数据访问集中在这里，变体各自决定怎么摆。
 * 注意这里只读 store，不写任何东西（原型不该有副作用）。
 */
export function useHomePrototypeData() {
  const profile = useProfileStore()
  const catalog = useCatalogStore()
  const progress = useProgressStore()
  const router = useRouter()

  const grade = computed(() => catalog.grade(profile.gradeId))

  const mascot = computed(() => profile.mascot)

  /** 今日任务：进行中的优先，其次按顺序推进 */
  const todayTopics = computed<Topic[]>(() => progress.recommendFor(profile.gradeId, 3))

  /** 今日状态 */
  const today = computed(() => progress.today)

  const growth = computed(() => progress.growth)

  /** 年级内的主题进度 */
  const gradeTopics = computed(() => catalog.topics.filter(topic => topic.gradeId === profile.gradeId))

  const completedTopics = computed(() =>
    gradeTopics.value.filter(topic => progress.topicProgressOf(topic.id).status === 'completed').length,
  )

  /** 学习地图上的节点（带每个地方的去没去过） */
  interface MapNode {
    worldId: string
    name: string
    icon: AppIconName
    tone: UiTone
    tagline: string
    x: number
    y: number
    size: 'sm' | 'md' | 'lg'
    lockedInFog: boolean
    done: number
    total: number
  }

  const mapNodes = computed<MapNode[]>(() => {
    const layout = catalog.worldMap(profile.gradeId)
    if (!layout)
      return []

    return layout.nodes.flatMap((node) => {
      const world = catalog.world(node.worldId)
      if (!world)
        return []

      let done = 0
      let total = 0
      for (const category of catalog.categoriesOf(profile.gradeId)) {
        if (catalog.worldIdOfCategory(category.id) !== node.worldId)
          continue
        for (const topic of catalog.topicsOfCategory(category.id)) {
          total += 1
          if (progress.topicProgressOf(topic.id).status === 'completed')
            done += 1
        }
      }

      return [{
        worldId: node.worldId,
        name: world.name,
        icon: world.icon,
        tone: world.tone,
        tagline: world.tagline,
        x: node.x,
        y: node.y,
        size: node.size,
        lockedInFog: Boolean(node.lockedInFog),
        done,
        total,
      }]
    })
  })

  const mapTitle = computed(() => catalog.worldMap(profile.gradeId)?.title ?? '我的学习地图')

  /** 地图上的小路：把两个节点连成一条弯曲的虚线 */
  const mapPaths = computed(() => {
    const layout = catalog.worldMap(profile.gradeId)
    if (!layout)
      return []

    const byId = new Map(layout.nodes.map(node => [node.worldId, node]))

    return layout.paths.flatMap((path) => {
      const from = byId.get(path.from)
      const to = byId.get(path.to)
      if (!from || !to)
        return []

      const dx = to.x - from.x
      const dy = to.y - from.y
      const length = Math.hypot(dx, dy) || 1
      const bend = path.curve === 'straight' ? 0 : (path.curve === 'left' ? -1 : 1) * length * 0.14
      const cx = (from.x + to.x) / 2 + (-dy / length) * bend
      const cy = (from.y + to.y) / 2 + (dx / length) * bend

      return [{ d: `M ${from.x} ${from.y} Q ${cx} ${cy} ${to.x} ${to.y}` }]
    })
  })

  const worldIdOfCategory = (categoryId: string): string | undefined =>
    catalog.worldIdOfCategory(categoryId)

  /** 最近玩过的 */
  const recent = computed(() =>
    [...progress.completions]
      .sort((a, b) => b.completedAt - a.completedAt)
      .slice(0, 3)
      .map(completion => ({ completion, lesson: catalog.lesson(completion.lessonId) })),
  )

  /** 与 HomePage 保持一致：主题自己声明了图标就用它，否则跟随领域的色调 */
  const topicIcon = (topic: Topic): AppIconName => {
    const category = catalog.category(topic.categoryId)
    return topic.icon ?? (category ? TONE_ICONS[category.tone] : TOPIC_KIND_ICONS.standard)
  }

  const topicTone = (topic: Topic): UiTone =>
    catalog.category(topic.categoryId)?.tone ?? NEUTRAL_TONE

  function countLessons(topic: Topic): number {
    return topic.lessonIds.length
  }

  /** 进入主题：有内容就直接开玩，少一次点击就少一次流失 */
  function enterTopic(topic: Topic): void {
    const firstLesson = topic.lessonIds[0]
    if (firstLesson) {
      void router.push({ name: ROUTE_NAMES.lesson, params: { lessonId: firstLesson } })
      return
    }
    void router.push({
      name: ROUTE_NAMES.courseMap,
      params: { gradeId: topic.gradeId, categoryId: topic.categoryId },
    })
  }

  /** 去某个学习世界：找到它在本年级下的第一个领域，进课程地图 */
  function openWorld(worldId: string): void {
    const category = catalog.categoriesOf(profile.gradeId)
      .find(item => catalog.worldIdOfCategory(item.id) === worldId)

    if (!category)
      return

    void router.push({
      name: ROUTE_NAMES.courseMap,
      params: { gradeId: profile.gradeId, categoryId: category.id },
    })
  }

  function openLesson(lessonId: string): void {
    void router.push({ name: ROUTE_NAMES.lesson, params: { lessonId } })
  }

  return {
    profile,
    grade,
    mascot,
    todayTopics,
    today,
    growth,
    gradeTopics,
    completedTopics,
    mapNodes,
    mapPaths,
    mapTitle,
    recent,
    worldIdOfCategory,
    topicIcon,
    topicTone,
    countLessons,
    enterTopic,
    openWorld,
    openLesson,
  }
}
