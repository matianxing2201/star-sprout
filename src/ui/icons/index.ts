/**
 * 图标层
 * ======
 *
 * 全站图标只从这里取。四个出口：
 *   - `KIcon`      —— 渲染一枚矢量图标
 *   - `KIconTile`  —— 领域 / 世界 / 主题的统一视觉单元（双色调图标 + 色调底）
 *   - `KVisual`    —— 「有 icon 用 icon，否则用 emoji」的统一渲染
 *   - `AppIconName`—— 语义图标名（词汇表在 domain，渲染映射在这里）
 */
export { default as KIcon } from './KIcon.vue'
export { default as KIconTile } from './KIconTile.vue'
export { default as KVisual } from './KVisual.vue'
export { STAT_ICONS, TASK_KIND_ICONS, TONE_ICONS, TOPIC_KIND_ICONS } from './mappings'
export { resolveIconVariants } from './registry'
export type { IconVariants } from './registry'
