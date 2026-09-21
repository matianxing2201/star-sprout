import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import { KIcon, KIconTile, KVisual } from '@/ui'

/**
 * 图标组件的渲染契约
 * ==================
 *
 * 上一版的问题不是「没有图标」，而是图标的表现无法预测：
 * emoji 的大小、颜色、对齐都不受控。这组测试把「可控」本身钉下来 ——
 * 尺寸是像素、颜色跟随 currentColor、装饰性图标必须对屏幕阅读器隐身、
 * 请求了没打包的字重必须优雅回退而不是渲染成空白。
 */
describe('kIcon', () => {
  it('默认是装饰性的：aria-hidden，且不带 role', () => {
    const wrapper = mount(KIcon, { props: { name: 'check' } })
    const svg = wrapper.find('svg')

    expect(svg.attributes('aria-hidden')).toBe('true')
    expect(svg.attributes('role')).toBeUndefined()
    expect(svg.attributes('focusable')).toBe('false')
  })

  it('传了 label 就变成有语义的图标', () => {
    const wrapper = mount(KIcon, { props: { name: 'star', label: '星星' } })
    const svg = wrapper.find('svg')

    expect(svg.attributes('role')).toBe('img')
    expect(svg.attributes('aria-label')).toBe('星星')
    expect(svg.attributes('aria-hidden')).toBeUndefined()
  })

  it('尺寸映射到固定像素，而不是靠字号撑开', () => {
    const sizes = { 'xs': 14, 'sm': 16, 'md': 20, 'lg': 26, 'xl': 34, '2xl': 46 } as const

    for (const [size, px] of Object.entries(sizes)) {
      const wrapper = mount(KIcon, { props: { name: 'check', size: size as keyof typeof sizes } })
      const svg = wrapper.find('svg')

      expect(svg.attributes('width'), `${size} 的宽度不对`).toBe(String(px))
      expect(svg.attributes('height'), `${size} 的高度不对`).toBe(String(px))
    }
  })

  it('请求未打包的 duotone 字重时回退到 bold，而不是渲染空白', () => {
    // arrow-left 不在「身份型」集合里，因此只内联了 bold
    const bold = mount(KIcon, { props: { name: 'arrow-left', weight: 'bold' } })
    const duotone = mount(KIcon, { props: { name: 'arrow-left', weight: 'duotone' } })

    expect(bold.find('svg').exists()).toBe(true)
    expect(duotone.find('svg').exists()).toBe(true)
    expect(duotone.html()).toBe(bold.html())
  })

  it('身份型图标真的有 duotone 字重（与 bold 不同）', () => {
    const bold = mount(KIcon, { props: { name: 'flask', weight: 'bold' } })
    const duotone = mount(KIcon, { props: { name: 'flask', weight: 'duotone' } })

    expect(duotone.find('svg').exists()).toBe(true)
    expect(duotone.html()).not.toBe(bold.html())
  })

  it('传了 tone 就用该色调的深色，双色调的第二层也跟着走', () => {
    const wrapper = mount(KIcon, { props: { name: 'flask', tone: 'science' } })
    const style = wrapper.find('svg').attributes('style') ?? ''

    expect(style).toContain('--tone: var(--color-science)')
    expect(style).toContain('color: var(--tone-deep)')
  })

  it('类名从外部传入时与内部类名合并', () => {
    const wrapper = mount(KIcon, { props: { name: 'check' }, attrs: { class: 'text-star' } })

    expect(wrapper.find('svg').classes()).toContain('text-star')
    expect(wrapper.find('svg').classes()).toContain('shrink-0')
  })
})

describe('kIconTile', () => {
  it('渲染色调底 + 双色调图标', () => {
    const wrapper = mount(KIconTile, { props: { icon: 'palette', tone: 'art' } })
    expect(wrapper.attributes('style')).toContain('--tone: var(--color-art)')
    expect(wrapper.find('svg').exists()).toBe(true)
    // duotone 的两层结构：主形 + 一个 20% 透明度的副形（Iconify 把 0.2 规范化成 .2）
    expect(wrapper.html()).toContain('opacity=".2"')
  })

  it('locked 状态换成单层锁图标，并压暗', () => {
    const wrapper = mount(KIconTile, { props: { icon: 'palette', tone: 'art', locked: true } })
    const unlocked = mount(KIconTile, { props: { icon: 'palette', tone: 'art' } })

    expect(wrapper.html()).not.toBe(unlocked.html())
    // 未解锁时用 bold 单层锁，不再用双色调 —— 灰掉的迷雾节点不该有任何“质感”
    expect(wrapper.html()).not.toContain('opacity=".2"')
    expect(wrapper.attributes('class')).toContain('opacity-60')
    expect(wrapper.attributes('class')).toContain('border-dashed')
  })

  it('尺寸档位换成对应的方块尺寸', () => {
    const lg = mount(KIconTile, { props: { icon: 'flask', size: 'lg' } })
    expect(lg.attributes('class')).toContain('size-16')
  })
})

describe('kVisual 的取值优先级', () => {
  it('icon 优先于 emoji', () => {
    const wrapper = mount(KVisual, { props: { icon: 'flask', emoji: '🔬' } })

    expect(wrapper.find('svg').exists()).toBe(true)
    expect(wrapper.text()).not.toContain('🔬')
  })

  it('没有 icon 时用 emoji，并且放进固定尺寸的方框里居中', () => {
    const wrapper = mount(KVisual, { props: { emoji: '🐦' }, attrs: { 'aria-label': '小鸟' } })

    expect(wrapper.text()).toContain('🐦')
    expect(wrapper.attributes('class')).toContain('place-items-center')
    expect(wrapper.attributes('class')).toContain('size-7')
  })

  it('emoji 是装饰性的，除非给了 label', () => {
    const decorative = mount(KVisual, { props: { emoji: '🐦' } })
    expect(decorative.attributes('aria-hidden')).toBe('true')

    const labelled = mount(KVisual, { props: { emoji: '🐦', label: '小鸟' } })
    expect(labelled.attributes('aria-label')).toBe('小鸟')
    expect(labelled.attributes('aria-hidden')).toBeUndefined()
  })

  it('image 优先于 icon 与 emoji', () => {
    const wrapper = mount(KVisual, {
      props: { image: '/img/bird.svg', icon: 'bird', emoji: '🐦' },
    })

    expect(wrapper.find('img').exists()).toBe(true)
    expect(wrapper.find('svg').exists()).toBe(false)
  })

  it('plain 关闭尺寸包装，交给外部容器控制大小', () => {
    const wrapper = mount(KVisual, { props: { emoji: '🐦', plain: true } })

    expect(wrapper.attributes('class')).not.toContain('size-7')
    expect(wrapper.attributes('class')).toContain('place-items-center')
  })
})
