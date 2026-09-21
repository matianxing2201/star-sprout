import type { AppIconName, LearningTaskKind, ToneKey, TopicKind } from '@/domain'

/**
 * 领域语义 → 图标
 * ===============
 *
 * 这张表是儿童端「一眼看懂这里是什么」的基础设施：
 *   - 每个学习领域即使教案还没写，也有一枚得体的图标；
 *   - 新增领域时只要色调选得对，图标自动就有了，不需要逐条配置。
 *
 * 内容包可以在 Category / Topic / Lesson 上显式指定 icon 覆盖这里的默认值。
 */
export const TONE_ICONS: Record<ToneKey, AppIconName> = {
  language: 'book-open',
  reading: 'books',
  math: 'math-operations',
  science: 'flask',
  art: 'palette',
  music: 'music-notes',
  think: 'brain',
  explore: 'compass',
  code: 'code',
  life: 'home',
  social: 'handshake',
  english: 'translate',
  labor: 'wrench',
  moral: 'scales',
}

/** 课程地图上的三种节点类型 */
export const TOPIC_KIND_ICONS: Record<TopicKind, AppIconName> = {
  standard: 'star-four',
  challenge: 'fire',
  hidden: 'key',
}

/** 六个教学步骤 —— 步骤条与课程播放器共用，保证「角色引入」到处都长一样 */
export const TASK_KIND_ICONS: Record<LearningTaskKind, AppIconName> = {
  intro: 'speaker',
  discover: 'lightbulb',
  interaction: 'click-hand',
  practice: 'pencil',
  challenge: 'fire',
  reward: 'gift',
}

/** 成长与家长端反复出现的统计口径，集中一处，避免各页各自挑图标 */
export const STAT_ICONS = {
  minutes: 'clock',
  lessons: 'target',
  stars: 'star',
  streak: 'fire',
  energy: 'energy',
  badge: 'medal',
  worlds: 'compass',
  mastery: 'chart-line',
} as const satisfies Record<string, AppIconName>
