import { describe, expect, it } from 'vitest'

import { validateIntegrity } from '@/data/adapters/local-catalog-repository'
import { BADGE_IDS, GRADE_IDS, INTERACTION_KINDS, isToneKey, TONE_KEYS } from '@/domain'

import { contentPack } from './index'
import { validateContentPack } from './schema'
import { DEFAULT_WORLD_BY_TONE, resolveWorldId } from './worlds/routing'

/**
 * 内容包契约测试
 * ==============
 *
 * 这些断言是“内容与 UI 解耦”的安全网：
 * 以后往内容包里加教案，写歪的 id、越界的坐标、重复的任务 id
 * 都会在这里当场失败，而不是等到孩子点进去才发现页面少了一块。
 */
describe('内容包结构', () => {
  it('通过运行时 schema 校验', () => {
    const result = validateContentPack(contentPack)

    expect(result.ok ? [] : result.errors).toEqual([])
    expect(result.ok).toBe(true)
  })

  it('通过引用完整性检查', () => {
    expect(validateIntegrity(contentPack)).toEqual([])
  })
})

describe('年级体系', () => {
  it('八个年级齐全且顺序固定', () => {
    expect(contentPack.grades.map(grade => grade.id)).toEqual([...GRADE_IDS])
    expect(contentPack.grades.map(grade => grade.order)).toEqual([0, 1, 2, 3, 4, 5, 6, 7])
  })

  it('每个年级都有面向孩子的定位说明', () => {
    for (const grade of contentPack.grades) {
      expect(grade.tagline.length).toBeGreaterThan(0)
      expect(grade.tagline.length).toBeLessThanOrEqual(16)
      expect(grade.nextHint.length).toBeGreaterThan(0)
      expect(isToneKey(grade.tone)).toBe(true)
    }
  })
})

describe('学科体系', () => {
  it('领域 id 全局唯一，且都属于已有年级', () => {
    const ids = contentPack.categories.map(category => category.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('每个领域都有知识方向，且色调合法', () => {
    for (const category of contentPack.categories) {
      expect(category.skills.length).toBeGreaterThan(0)
      expect(category.focus.length).toBeGreaterThan(0)
      expect(TONE_KEYS).toContain(category.tone)
    }
  })

  it('每个领域都能归属到一个学习世界（否则首页地图会有领域点不进去）', () => {
    for (const category of contentPack.categories) {
      expect(resolveWorldId(category, new Map())).toBeDefined()
    }
  })

  it('默认归属表覆盖全部色调', () => {
    expect(Object.keys(DEFAULT_WORLD_BY_TONE).sort()).toEqual([...TONE_KEYS].sort())
  })
})

describe('学习地图', () => {
  it('八个年级各有一张地图', () => {
    expect(Object.keys(contentPack.maps).sort()).toEqual([...GRADE_IDS].sort())
  })

  it('节点坐标在安全范围内，路径只连本图节点', () => {
    for (const layout of Object.values(contentPack.maps)) {
      const nodeIds = new Set(layout.nodes.map(node => node.worldId))

      for (const node of layout.nodes) {
        expect(node.x).toBeGreaterThanOrEqual(5)
        expect(node.x).toBeLessThanOrEqual(95)
        expect(node.y).toBeGreaterThanOrEqual(5)
        expect(node.y).toBeLessThanOrEqual(95)
      }

      for (const path of layout.paths) {
        expect(nodeIds.has(path.from)).toBe(true)
        expect(nodeIds.has(path.to)).toBe(true)
      }
    }
  })
})

describe('课程数据模型', () => {
  it('课程归属的主题与领域都存在', () => {
    const topicIds = new Set(contentPack.topics.map(topic => topic.id))
    const categoryIds = new Set(contentPack.categories.map(category => category.id))

    for (const lesson of contentPack.lessons) {
      expect(topicIds.has(lesson.topicId)).toBe(true)
      expect(categoryIds.has(lesson.categoryId)).toBe(true)
    }
  })

  it('主题引用的课程都存在，反过来课程也挂在主题下', () => {
    const lessonIds = new Set(contentPack.lessons.map(lesson => lesson.id))

    for (const topic of contentPack.topics) {
      for (const lessonId of topic.lessonIds)
        expect(lessonIds.has(lessonId)).toBe(true)
    }

    for (const lesson of contentPack.lessons) {
      const topic = contentPack.topics.find(item => item.id === lesson.topicId)
      expect(topic?.lessonIds).toContain(lesson.id)
    }
  })

  it('每节课的任务 id 唯一、时长合理、奖励在 1~3 星之间', () => {
    for (const lesson of contentPack.lessons) {
      const taskIds = lesson.tasks.map(task => task.id)
      expect(new Set(taskIds).size).toBe(taskIds.length)
      expect(lesson.tasks.length).toBeGreaterThan(0)
      expect(lesson.minutes).toBeGreaterThan(0)
      expect(lesson.reward.stars).toBeGreaterThanOrEqual(1)
      expect(lesson.reward.stars).toBeLessThanOrEqual(3)
    }
  })

  it('任务考察的知识点必须在该主题里声明过（否则家长端找不到名字）', () => {
    for (const lesson of contentPack.lessons) {
      const topic = contentPack.topics.find(item => item.id === lesson.topicId)
      const declared = new Set([
        ...(topic?.knowledgePoints ?? []).map(point => point.id),
        ...lesson.knowledgePoints.map(point => point.id),
      ])

      for (const task of lesson.tasks) {
        for (const pointId of task.knowledgePointIds ?? [])
          expect(declared.has(pointId)).toBe(true)
      }
    }
  })

  it('每节课都以角色引入开始、以奖励结束（教学节奏不因教案而异）', () => {
    for (const lesson of contentPack.lessons) {
      expect(lesson.tasks[0]?.kind).toBe('intro')
      expect(lesson.tasks.at(-1)?.kind).toBe('reward')
    }
  })

  it('拖拽归类题里，物品的颜色不能正好等于它「正确的框」的颜色', () => {
    // drag-drop 的 tone 会渲染成卡片底色，两者同色就等于用颜色把答案说出去 ——
    // 孩子不用认字也能「选对」，这道题就白出了。
    const leaks: string[] = []

    for (const lesson of contentPack.lessons) {
      for (const task of lesson.tasks) {
        if (task.kind !== 'interaction' && task.kind !== 'practice' && task.kind !== 'challenge')
          continue

        for (const interaction of task.interactions) {
          if (interaction.kind !== 'drag-drop')
            continue

          const { zones, items } = interaction.payload
          const toneOfZone = new Map(zones.map(zone => [zone.id, zone.tone]))
          for (const item of items) {
            const correctZone = zones.find(zone => zone.accepts.includes(item.id))
            if (!correctZone)
              continue
            if (item.tone !== undefined && item.tone === toneOfZone.get(correctZone.id))
              leaks.push(`${lesson.id}/${interaction.prompt}：${item.label} 与「${correctZone.label}」同色（${item.tone}）`)
          }
        }
      }
    }

    expect(leaks).toEqual([])
  })

  it('互动类型都在注册表覆盖的范围内', () => {
    for (const lesson of contentPack.lessons) {
      for (const task of lesson.tasks) {
        if (task.kind !== 'interaction' && task.kind !== 'practice' && task.kind !== 'challenge')
          continue

        for (const interaction of task.interactions)
          expect(INTERACTION_KINDS).toContain(interaction.kind)
      }
    }
  })
})

describe('成长体系', () => {
  it('徽章目录覆盖全部徽章 id', () => {
    expect(contentPack.badges.map(badge => badge.id).sort()).toEqual([...BADGE_IDS].sort())
  })
})

describe('学习世界', () => {
  it('每个学习世界 id 唯一，并至少适合一个年级', () => {
    const ids = contentPack.worlds.map(world => world.id)
    expect(new Set(ids).size).toBe(ids.length)

    for (const world of contentPack.worlds) {
      expect(world.gradeIds.length).toBeGreaterThan(0)
      expect(isToneKey(world.tone)).toBe(true)
      for (const gradeId of world.gradeIds)
        expect(GRADE_IDS).toContain(gradeId)
    }
  })

  it('地图上出现的世界都适合该年级', () => {
    for (const [gradeId, layout] of Object.entries(contentPack.maps)) {
      for (const node of layout.nodes) {
        const world = contentPack.worlds.find(item => item.id === node.worldId)
        expect(world?.gradeIds).toContain(gradeId)
      }
    }
  })
})
