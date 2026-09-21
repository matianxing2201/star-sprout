import type { BadgeDefinition, BadgeId } from '@/domain/growth/types'

/**
 * 徽章目录
 * ========
 *
 * 需求文档第十七章给出 7 枚徽章（阅读小达人、数学探险家、小小科学家、创意大师、
 * 节奏达人、思维侦探、探索家）。
 *
 * 解锁条件全部使用与年级、分类无关的规则（stars / lessons / perfect-lessons /
 * learning-days / streak），所以内容包还没到位时也能正常判定，不会出现“永远拿不到”的徽章。
 * 七个条件彼此不同，孩子每走到一个新台阶就会亮一枚。
 *
 * BADGE_BY_ID 是唯一数据源，BADGES 由它派生：Record<BadgeId, ...> 保证 7 枚一个都不少。
 */
export const BADGE_BY_ID: Record<BadgeId, BadgeDefinition> = {
  'reading-star': {
    id: 'reading-star',
    name: '阅读小达人',
    emoji: '🌟',
    description: '读完 3 节课，故事就记住了你的名字。',
    tone: 'reading',
    rule: { type: 'lessons', count: 3 },
  },
  'math-explorer': {
    id: 'math-explorer',
    name: '数学探险家',
    emoji: '🔢',
    description: '一次都没用提示，自己算对整整 2 节课。',
    tone: 'math',
    rule: { type: 'perfect-lessons', count: 2 },
  },
  'little-scientist': {
    id: 'little-scientist',
    name: '小小科学家',
    emoji: '🔬',
    description: '动手做满 6 节课，实验本上就有记录了。',
    tone: 'science',
    rule: { type: 'lessons', count: 6 },
  },
  'creative-master': {
    id: 'creative-master',
    name: '创意大师',
    emoji: '🎨',
    description: '攒够 30 颗星星，你的作品墙就挂满了。',
    tone: 'art',
    rule: { type: 'stars', count: 30 },
  },
  'rhythm-master': {
    id: 'rhythm-master',
    name: '节奏达人',
    emoji: '🎵',
    description: '连续 3 天来学习，拍子就不会断。',
    tone: 'music',
    rule: { type: 'streak', days: 3 },
  },
  'thinking-detective': {
    id: 'thinking-detective',
    name: '思维侦探',
    emoji: '🧠',
    description: '来过 5 个学习日，线索就自己连起来了。',
    tone: 'think',
    rule: { type: 'learning-days', days: 5 },
  },
  'explorer': {
    id: 'explorer',
    name: '探索家',
    emoji: '🚀',
    description: '一口气完成 10 节课，地图上都是你的脚印。',
    tone: 'explore',
    rule: { type: 'lessons', count: 10 },
  },
}

/** 徽章列表（徽章墙按固定顺序展示） */
export const BADGES: BadgeDefinition[] = [
  BADGE_BY_ID['reading-star'],
  BADGE_BY_ID['math-explorer'],
  BADGE_BY_ID['little-scientist'],
  BADGE_BY_ID['creative-master'],
  BADGE_BY_ID['rhythm-master'],
  BADGE_BY_ID['thinking-detective'],
  BADGE_BY_ID.explorer,
]
