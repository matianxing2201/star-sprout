import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

import { ACCENT_TONES, TONE_KEYS } from '@/domain'

/**
 * 设计令牌的契约测试
 * ==================
 *
 * 组件的色调是**运行时**决定的：`toneVars('math')` 会产出 `var(--color-math)`。
 * 这意味着 Tailwind 无法静态发现哪些令牌会被用到 —— 于是有两件事必须由测试守住：
 *
 *   1. 每个色调都必须真的有「主色 / 柔色 / 深色」三件套，否则某个领域会静默变成透明；
 *   2. tokens.css 必须用 `@theme static`，否则 Tailwind 会把没被类引用的令牌裁掉。
 */
// jsdom 环境下 import.meta.url 是 http 地址，因此按项目根目录定位源文件
const stylesDir = resolve(process.cwd(), 'src/styles')
const tokensCss = readFileSync(resolve(stylesDir, 'tokens.css'), 'utf-8')

describe('设计令牌', () => {
  it('使用 @theme static，保证整份令牌始终写入 :root', () => {
    expect(tokensCss).toContain('@theme static {')
  })

  it('每个学习领域色调都有主色 / 柔色 / 深色三件套', () => {
    for (const tone of TONE_KEYS) {
      expect(tokensCss, `缺少 --color-${tone}`).toContain(`--color-${tone}:`)
      expect(tokensCss, `缺少 --color-${tone}-soft`).toContain(`--color-${tone}-soft:`)
      expect(tokensCss, `缺少 --color-${tone}-deep`).toContain(`--color-${tone}-deep:`)
    }
  })

  it('每个成长与反馈色调同样有完整三件套（toneVars 依赖它）', () => {
    for (const tone of ACCENT_TONES) {
      expect(tokensCss, `缺少 --color-${tone}`).toContain(`--color-${tone}:`)
      expect(tokensCss, `缺少 --color-${tone}-soft`).toContain(`--color-${tone}-soft:`)
      expect(tokensCss, `缺少 --color-${tone}-deep`).toContain(`--color-${tone}-deep:`)
    }
  })

  it('基础中性色与排版、圆角、阴影、动效令牌齐全', () => {
    for (const token of [
      '--color-paper',
      '--color-surface',
      '--color-ink',
      '--color-ink-soft',
      '--color-line',
      '--font-display',
      '--font-body',
      '--font-numeric',
      '--radius-card',
      '--radius-tile',
      '--radius-chip',
      '--shadow-sticker',
      '--shadow-lift',
      '--shadow-press',
      '--ease-soft',
      '--ease-bounce',
      '--duration-tap',
      '--duration-celebrate',
    ]) {
      expect(tokensCss, `缺少 ${token}`).toContain(`${token}:`)
    }
  })

  it('订阅“减少动态效果”的媒体查询没有被删掉', () => {
    const baseCss = readFileSync(resolve(stylesDir, 'base.css'), 'utf-8')
    expect(baseCss).toContain('prefers-reduced-motion')
  })
})
