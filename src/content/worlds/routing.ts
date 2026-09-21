import type { CategoryId, ToneKey } from '@/domain'

/**
 * 领域 → 学习世界的默认归属
 * ========================
 *
 * 学习地图需要知道“数学的领域属于数学城堡”，但内容包的 world.categoryIds
 * 目前还是空的（领域归属要等教案一起确认）。
 *
 * 因此这里给出一个按色调（tone）推导的默认归属：
 *   - 新加一个领域，只要色调合理，就会自动出现在对应的学习世界里，地图不会空着；
 *   - 内容作者想改写归属，只需在 `world.categoryIds` 里显式声明，显式声明优先。
 *
 * 这让“内容还没写完”不会变成“首页看起来坏掉了”。
 */
export const DEFAULT_WORLD_BY_TONE: Record<ToneKey, string> = {
  language: 'language-forest',
  reading: 'reading-forest',
  math: 'math-castle',
  science: 'science-lab',
  art: 'art-town',
  music: 'music-stage',
  think: 'thinking-camp',
  explore: 'explore-world',
  code: 'programming-world',
  life: 'explore-world',
  social: 'culture-hall',
  english: 'language-forest',
  labor: 'culture-hall',
  moral: 'culture-hall',
}

/** 显式声明优先，其次按色调推导 */
export function resolveWorldId(
  category: { id: CategoryId, tone: ToneKey },
  explicit: ReadonlyMap<CategoryId, string>,
): string | undefined {
  return explicit.get(category.id) ?? DEFAULT_WORLD_BY_TONE[category.tone]
}
