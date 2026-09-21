import type { CSSProperties } from 'vue'

/**
 * 学习世界调色板键。
 *
 * 每个“知识领域”拥有一个色调（tone），组件通过 CSS 变量 --tone / --tone-soft / --tone-deep
 * 消费它，因此新增领域只需要在 tokens.css 里加一组变量，不需要改任何组件。
 */
export const TONE_KEYS = [
  'language',
  'reading',
  'math',
  'science',
  'art',
  'music',
  'think',
  'explore',
  'code',
  'life',
  'social',
  'english',
  'labor',
  'moral',
] as const

export type ToneKey = (typeof TONE_KEYS)[number]

/** 中性色调，用于尚未归属任何领域的元素（年级星球、系统页面等） */
export const NEUTRAL_TONE = 'neutral' as const

export type AnyTone = ToneKey | typeof NEUTRAL_TONE

/**
 * 成长与反馈的高亮色调。
 * 与学习领域调色板同构（主色 / 柔色 / 深色三件套），
 * 因此通用组件可以用同一套 `tone` 接口同时表达“哪个领域”和“什么情绪”。
 */
export const ACCENT_TONES = ['star', 'energy', 'badge', 'success', 'gently', 'alert'] as const

export type AccentTone = (typeof ACCENT_TONES)[number]

/** 通用组件（按钮、标签、进度条……）接受的色调 */
export type UiTone = AnyTone | AccentTone

export const TONE_LABELS: Record<ToneKey, string> = {
  language: '语言',
  reading: '阅读',
  math: '数学',
  science: '科学',
  art: '艺术',
  music: '音乐',
  think: '思维',
  explore: '探索',
  code: '编程',
  life: '生活',
  social: '社交',
  english: '英语',
  labor: '劳动',
  moral: '品格',
}

export function isToneKey(value: string): value is ToneKey {
  return (TONE_KEYS as readonly string[]).includes(value)
}

/**
 * 把色调翻译成三个 CSS 变量。
 * 组件里写 `bg-[var(--tone-soft)] text-[var(--tone-deep)]`，与领域完全解耦。
 */
export function toneVars(tone: UiTone): CSSProperties {
  if (tone === NEUTRAL_TONE) {
    return {
      '--tone': 'var(--color-ink-soft)',
      '--tone-soft': 'var(--color-paper-deep)',
      '--tone-deep': 'var(--color-ink)',
      '--tone-line': 'var(--color-line-strong)',
      '--tone-glow': 'rgb(46 42 37 / 10%)',
    }
  }

  return {
    '--tone': `var(--color-${tone})`,
    '--tone-soft': `var(--color-${tone}-soft)`,
    '--tone-deep': `var(--color-${tone}-deep)`,
    '--tone-line': `color-mix(in srgb, var(--color-${tone}) 30%, transparent)`,
    '--tone-glow': `color-mix(in srgb, var(--color-${tone}) 20%, transparent)`,
  }
}
