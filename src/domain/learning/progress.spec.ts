import type { AttemptRecord, LessonCompletion, Topic } from '@/domain'

import { describe, expect, it } from 'vitest'
import {
  buildTopicProgressMap,
  computeMastery,
  computeStreak,
  deriveGrowthState,
  emptySnapshot,
  findWeakKnowledgePoints,
  recommendTopics,
} from '@/domain'

/** 造一个只包含进度推导所需字段的主题 */
function makeTopic(id: string, categoryId: string, order: number, lessonIds: string[]): Topic {
  return {
    id,
    gradeId: 'nursery',
    categoryId,
    title: id,
    icon: 'puzzle',
    kind: 'standard',
    order,
    objectives: [],
    knowledgePoints: [],
    lessonIds,
    level: 1,
  }
}

function makeCompletion(lessonId: string, topicId: string, at: number, stars = 3): LessonCompletion {
  return {
    lessonId,
    topicId,
    gradeId: 'nursery',
    categoryId: 'nursery-math',
    stars,
    seconds: 240,
    completedAt: at,
  }
}

function makeAttempt(overrides: Partial<AttemptRecord> = {}): AttemptRecord {
  return {
    lessonId: 'l1',
    topicId: 't1',
    gradeId: 'nursery',
    categoryId: 'nursery-math',
    taskId: 'task-1',
    taskKind: 'practice',
    knowledgePointIds: ['kp-a'],
    correct: true,
    attempts: 1,
    usedHint: false,
    skipped: false,
    at: 0,
    ...overrides,
  }
}

describe('computeStreak', () => {
  it('同一天多次学习不重复计数', () => {
    expect(computeStreak(['2025-03-01', '2025-03-01', '2025-03-01'], '2025-03-01')).toBe(1)
  })

  it('连续几天会累加', () => {
    expect(computeStreak(['2025-03-01', '2025-03-02', '2025-03-03'], '2025-03-03')).toBe(3)
  })

  it('今天还没学习时，从昨天往前数（当天未结束不算断）', () => {
    expect(computeStreak(['2025-03-01', '2025-03-02'], '2025-03-03')).toBe(2)
  })

  it('中间断了以后只算最近的一段', () => {
    expect(computeStreak(['2025-02-20', '2025-03-02', '2025-03-03'], '2025-03-03')).toBe(2)
  })

  it('没有任何记录时是 0', () => {
    expect(computeStreak([], '2025-03-03')).toBe(0)
  })
})

describe('buildTopicProgressMap', () => {
  const topics = [
    makeTopic('t1', 'c1', 1, ['l1']),
    makeTopic('t2', 'c1', 2, ['l2']),
    makeTopic('t3', 'c1', 3, ['l3']),
  ]

  it('第一个主题永远可以开始，后面的逐个解锁', () => {
    const map = buildTopicProgressMap(topics, [])

    expect(map.t1?.status).toBe('available')
    expect(map.t2?.status).toBe('locked')
    expect(map.t3?.status).toBe('locked')
  })

  it('完成第一个主题后解锁第二个', () => {
    const map = buildTopicProgressMap(topics, [makeCompletion('l1', 't1', 0)])

    expect(map.t1?.status).toBe('completed')
    expect(map.t2?.status).toBe('available')
    expect(map.t3?.status).toBe('locked')
  })

  it('一个主题的课程没做完时是“进行中”，不会解锁下一个', () => {
    const multi = [makeTopic('m1', 'c2', 1, ['a', 'b']), makeTopic('m2', 'c2', 2, ['c'])]
    const map = buildTopicProgressMap(multi, [makeCompletion('a', 'm1', 0)])

    expect(map.m1?.status).toBe('in-progress')
    expect(map.m1?.completedLessons).toBe(1)
    expect(map.m1?.totalLessons).toBe(2)
    expect(map.m2?.status).toBe('locked')
  })

  it('不同领域各自独立解锁', () => {
    const two = [makeTopic('a1', 'x', 1, []), makeTopic('b1', 'y', 1, [])]
    const map = buildTopicProgressMap(two, [])

    expect(map.a1?.status).toBe('available')
    expect(map.b1?.status).toBe('available')
  })
})

describe('computeMastery 与薄弱点', () => {
  it('没有作答记录时掌握度为 0，且不会除零', () => {
    const mastery = computeMastery('nursery', 'nursery-math', [])

    expect(mastery.mastery).toBe(0)
    expect(mastery.correctRate).toBe(0)
    expect(mastery.attempts).toBe(0)
  })

  it('全部答对时正确率为 1', () => {
    const attempts = [makeAttempt(), makeAttempt(), makeAttempt()]
    const mastery = computeMastery('nursery', 'nursery-math', attempts)

    expect(mastery.correctRate).toBe(1)
    expect(mastery.attempts).toBe(3)
  })

  it('只统计当前领域与年级的记录', () => {
    const attempts = [
      makeAttempt(),
      makeAttempt({ categoryId: 'nursery-language' }),
      makeAttempt({ gradeId: 'grade-1' }),
    ]

    expect(computeMastery('nursery', 'nursery-math', attempts).attempts).toBe(1)
  })

  it('薄弱点按出错权重排序，用提示也算', () => {
    const attempts = [
      makeAttempt({ knowledgePointIds: ['kp-weak'], correct: false }),
      makeAttempt({ knowledgePointIds: ['kp-weak'], correct: false }),
      makeAttempt({ knowledgePointIds: ['kp-soft'], correct: true, usedHint: true }),
      makeAttempt({ knowledgePointIds: ['kp-solid'], correct: true }),
    ]

    expect(findWeakKnowledgePoints(attempts)).toEqual(['kp-weak', 'kp-soft'])
  })
})

describe('deriveGrowthState', () => {
  const today = new Date('2025-03-03T12:00:00').getTime()

  it('空记录得到空状态', () => {
    const growth = deriveGrowthState(emptySnapshot(), today)

    expect(growth.stars).toBe(0)
    expect(growth.lessonsCompleted).toBe(0)
    expect(growth.streakDays).toBe(0)
    expect(growth.lastActiveDate).toBeNull()
  })

  it('星星与课程数来自完成记录，连续天数来自日期', () => {
    const snapshot = {
      topics: {},
      completions: [
        makeCompletion('l1', 't1', new Date('2025-03-01T10:00:00').getTime(), 2),
        makeCompletion('l2', 't2', new Date('2025-03-02T10:00:00').getTime(), 3),
        makeCompletion('l3', 't3', today, 3),
      ],
      attempts: [],
    }

    const growth = deriveGrowthState(snapshot, today)

    expect(growth.stars).toBe(8)
    expect(growth.lessonsCompleted).toBe(3)
    expect(growth.learningDays).toBe(3)
    expect(growth.streakDays).toBe(3)
    expect(growth.lastActiveDate).toBe('2025-03-03')
    expect(growth.totalMinutes).toBe(12)
  })

  it('一次都没答错也没用提示的课程才算“完美”', () => {
    const snapshot = {
      topics: {},
      completions: [makeCompletion('l1', 't1', today)],
      attempts: [makeAttempt({ lessonId: 'l1', correct: true })],
    }
    const withHint = {
      ...snapshot,
      attempts: [makeAttempt({ lessonId: 'l1', correct: true, usedHint: true })],
    }

    expect(deriveGrowthState(snapshot, today).perfectLessons).toBe(1)
    expect(deriveGrowthState(withHint, today).perfectLessons).toBe(0)
  })

  it('会用领域→学习世界的映射统计“已探索区域”', () => {
    const snapshot = {
      topics: {},
      completions: [makeCompletion('l1', 't1', today)],
      attempts: [],
    }

    const growth = deriveGrowthState(snapshot, today, [], {
      worldByCategory: { 'nursery-math': 'math-castle' },
    })

    expect(growth.exploredWorldIds).toEqual(['math-castle'])
  })
})

describe('recommendTopics', () => {
  it('优先推荐进行中的主题，再按顺序推进', () => {
    const topics = [
      makeTopic('t1', 'c1', 1, ['l1']),
      makeTopic('t2', 'c1', 2, ['l2']),
      makeTopic('t9', 'c9', 1, ['l9']),
    ]
    const progressMap = buildTopicProgressMap(topics, [makeCompletion('l1', 't1', 0)])

    const recommended = recommendTopics(topics, progressMap, 3)

    expect(recommended.map(topic => topic.id)).toEqual(['t2', 't9'])
  })

  it('锁住的主题不会被推荐', () => {
    const topics = [makeTopic('t1', 'c1', 1, ['l1']), makeTopic('t2', 'c1', 2, ['l2'])]
    const progressMap = buildTopicProgressMap(topics, [])

    expect(recommendTopics(topics, progressMap).map(topic => topic.id)).toEqual(['t1'])
  })
})
