import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * 样式层序契约测试
 * ================
 *
 * 这组断言来自一个真实事故：全站的 `text-*` 原子类集体失效，
 * 表现为「顶部高亮的深色底 + 继承来的深色文字 = 一片漆黑」。
 *
 * 根因是 CSS 的层叠规则：**未分层的样式优先于任何 @layer 里的样式**，
 * 与选择器特异性无关。Tailwind v4 把原子类放在 `@layer utilities`，
 * 于是那些没进层的全局样式（`a { color: inherit }`、`button { color: inherit }`）
 * 反过来盖住了原子类 —— 而且是**静默**的：没有报错，没有警告，
 * 只是某些地方的颜色、字体、间距莫名其妙不生效。
 *
 * 因此这里把「全局样式必须落在正确的层里」变成一条可执行的契约。
 */
const stylesDir = resolve(process.cwd(), 'src/styles')

function read(name: string): string {
  return readFileSync(resolve(stylesDir, name), 'utf-8')
}

/** 去掉文件开头的块注释，拿到真正的 CSS 内容 */
function stripLeadingComment(css: string): string {
  return css.replace(/^\s*\/\*\*[\s\S]*?\*\/\s*/, '')
}

describe('样式层序', () => {
  it('base.css 整体包在 @layer base 里', () => {
    const css = stripLeadingComment(read('base.css'))

    expect(css.startsWith('@layer base {')).toBe(true)
    expect(css.trimEnd().endsWith('}')).toBe(true)
  })

  it('animations.css 整体包在 @layer components 里', () => {
    const css = stripLeadingComment(read('animations.css'))

    expect(css.startsWith('@layer components {')).toBe(true)
    expect(css.trimEnd().endsWith('}')).toBe(true)
  })

  it('层名只能是 Tailwind 已声明的那几个（写错会静默造出一个更靠后的层）', () => {
    // 例如误写成 `@layer Bases {`：CSS 会新建一个名为 Bases 的层，
    // 而它排在 utilities 之后 —— 原子类会再次全军覆没，且没有任何报错。
    const allowed = new Set(['base', 'components', 'utilities', 'theme'])

    for (const file of ['base.css', 'animations.css']) {
      const used = [...stripLeadingComment(read(file)).matchAll(/@layer\s+([a-z-]+)/g)].map(m => m[1])
      expect(used.length, `${file} 没有任何 @layer`).toBeGreaterThan(0)

      for (const name of used)
        expect(allowed.has(name), `${file} 使用了未声明的层名 ${name}`).toBe(true)
    }
  })

  it('!important 只在两处刻意使用，且都有正当理由', () => {
    // 1. base.css 的 prefers-reduced-motion：必须压过任何动画声明，这是无障碍要求；
    // 2. animations.css 的 .fx-drop-active：它要压过组件自己的 border 原子类，
    //    而 components 层排在 utilities 之前，只能靠 !important 强制表达“拖放目标”这个状态。
    // 除此之外出现 !important，通常意味着层序被搞错了 —— 那应该去修层序，而不是加 !important。
    const importantInAnimations = [...read('animations.css').matchAll(/!important/g)].length
    expect(importantInAnimations, 'animations.css 出现了预期外的 !important').toBeLessThanOrEqual(1)
    expect(read('animations.css')).toContain('.fx-drop-active')

    const base = read('base.css')
    const reducedMotionBlock = base.slice(base.indexOf('prefers-reduced-motion'))
    const outside = base.replace(reducedMotionBlock, '')
    expect(outside, 'base.css 在「减少动态效果」之外用了 !important').not.toContain('!important')
  })

  it('两个样式文件都被入口引入，且顺序在 tailwindcss 之后', () => {
    const entry = read('index.css')
    const order = ['@import \'tailwindcss\'', './tokens.css', './base.css', './animations.css']
      .map(needle => entry.indexOf(needle))

    expect(order.every(index => index >= 0), '入口缺少某个样式文件').toBe(true)
    expect(order, '样式文件的引入顺序变了').toEqual([...order].sort((a, b) => a - b))
  })
})
