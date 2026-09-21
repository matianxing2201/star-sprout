import type { BadgeDefinition, LearningStats } from '@/domain'

import { describe, expect, it } from 'vitest'
import {
  badgeProgress,
  daysBetween,
  evaluateBadges,
  levelForStars,
  levelProgress,
  matchesBadgeRule,
  nextLevelForStars,
  REWARD_TIERS,
  rewardSpec,
  toDateKey,
} from '@/domain'

function makeStats(overrides: Partial<LearningStats> = {}): LearningStats {
  return {
    stars: 0,
    energy: 0,
    lessonsCompleted: 0,
    perfectLessons: 0,
    streakDays: 0,
    learningDays: 0,
    totalMinutes: 0,
    categoryLessons: {},
    topicStars: {},
    exploredWorldIds: [],
    ...overrides,
  }
}

function makeBadge(id: string, rule: BadgeDefinition['rule']): BadgeDefinition {
  return { id: id as BadgeDefinition['id'], name: id, emoji: '🏅', description: '', tone: 'think', rule }
}

describe('奖励分级', () => {
  it('强度随等级单调递增，且轻触不给星星', () => {
    const tiers = ['tap', 'correct', 'task', 'lesson', 'chapter'] as const

    for (let index = 1; index < tiers.length; index += 1) {
      const previous = rewardSpec(tiers[index - 1])
      const current = rewardSpec(tiers[index])
      expect(current.flyStars).toBeGreaterThanOrEqual(previous.flyStars)
      expect(current.duration).toBeGreaterThanOrEqual(previous.duration)
      expect(current.stars).toBeGreaterThanOrEqual(previous.stars)
    }

    expect(REWARD_TIERS.tap.flyStars).toBe(0)
    expect(REWARD_TIERS.tap.confetti).toBe(false)
  })

  it('只有高等级奖励才撒彩纸，避免过度奖励', () => {
    expect(REWARD_TIERS.correct.confetti).toBe(false)
    expect(REWARD_TIERS.task.confetti).toBe(false)
    expect(REWARD_TIERS.lesson.confetti).toBe(true)
  })

  it('所有等级的单次反馈都落在 0.5~1.5 秒的产品约束内', () => {
    for (const spec of Object.values(REWARD_TIERS)) {
      if (spec.tier === 'tap')
        continue
      expect(spec.duration).toBeGreaterThanOrEqual(500)
      expect(spec.duration).toBeLessThanOrEqual(1500)
    }
  })
})

describe('等级', () => {
  it('按星星落在正确的等级上', () => {
    expect(levelForStars(0).id).toBe('seed')
    expect(levelForStars(19).id).toBe('seed')
    expect(levelForStars(20).id).toBe('sprout')
    expect(levelForStars(9999).id).toBe('master')
  })

  it('最高等级没有下一级，进度为 1', () => {
    expect(nextLevelForStars(9999)).toBeNull()
    expect(levelProgress(9999)).toBe(1)
  })

  it('等级内进度是 0~1', () => {
    const progress = levelProgress(40)
    expect(progress).toBeGreaterThan(0)
    expect(progress).toBeLessThan(1)
  })
})

describe('徽章规则', () => {
  it('每种规则都能正确判定', () => {
    const stats = makeStats({
      stars: 12,
      streakDays: 3,
      lessonsCompleted: 5,
      perfectLessons: 2,
      learningDays: 4,
      categoryLessons: { 'nursery-math': 3 },
      topicStars: { t1: 6 },
    })

    expect(matchesBadgeRule({ type: 'stars', count: 12 }, stats)).toBe(true)
    expect(matchesBadgeRule({ type: 'stars', count: 13 }, stats)).toBe(false)
    expect(matchesBadgeRule({ type: 'streak', days: 3 }, stats)).toBe(true)
    expect(matchesBadgeRule({ type: 'lessons', count: 5 }, stats)).toBe(true)
    expect(matchesBadgeRule({ type: 'perfect-lessons', count: 2 }, stats)).toBe(true)
    expect(matchesBadgeRule({ type: 'learning-days', days: 4 }, stats)).toBe(true)
    expect(matchesBadgeRule({ type: 'category-lessons', categoryId: 'nursery-math', count: 3 }, stats)).toBe(true)
    expect(matchesBadgeRule({ type: 'category-lessons', categoryId: 'nope', count: 1 }, stats)).toBe(false)
    expect(matchesBadgeRule({ type: 'topic-stars', topicId: 't1', count: 6 }, stats)).toBe(true)
  })

  it('已经拿到的徽章不会重复发放', () => {
    const definitions = [
      makeBadge('a', { type: 'lessons', count: 1 }),
      makeBadge('b', { type: 'lessons', count: 1 }),
    ]

    const earned = evaluateBadges(definitions, makeStats({ lessonsCompleted: 1 }), ['a'])

    expect(earned.map(badge => badge.id)).toEqual(['b'])
  })

  it('徽章进度封顶在 1', () => {
    expect(badgeProgress(makeBadge('a', { type: 'stars', count: 5 }), makeStats({ stars: 99 }))).toBe(1)
    expect(badgeProgress(makeBadge('a', { type: 'stars', count: 10 }), makeStats({ stars: 5 }))).toBe(0.5)
  })
})

describe('日期工具', () => {
  it('按本地时区生成 YYYY-MM-DD', () => {
    expect(toDateKey(new Date(2025, 2, 3, 23, 30).getTime())).toBe('2025-03-03')
  })

  it('跨月与跨年都能正确算天数', () => {
    expect(daysBetween('2025-02-28', '2025-03-01')).toBe(1)
    expect(daysBetween('2024-12-31', '2025-01-01')).toBe(1)
    expect(daysBetween('2025-03-03', '2025-03-03')).toBe(0)
  })
})
