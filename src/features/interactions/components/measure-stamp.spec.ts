import type { MeasureStampPayload } from '@/domain'
import { mount } from '@vue/test-utils'

import { describe, expect, it } from 'vitest'

import MeasureStampInteraction from './MeasureStampInteraction.vue'

/**
 * 量词印章的判定规则
 * ==================
 *
 * 这一课的核心手感是「拿起印章 → 盖到东西上」，所以测试要盯住三件事：
 *   1. 没拿印章就盖 → 给方向，不算失败；
 *   2. 盖错了 → 温柔提示，物品仍在原地可以马上重盖；
 *   3. 全部盖对 → 带着完整映射上报成功（家长端的掌握度分析依赖它）。
 */
const payload: MeasureStampPayload = {
  measures: [
    { id: 'zuo', label: '座', tone: 'language' },
    { id: 'liang', label: '辆', tone: 'explore' },
    { id: 'tiao', label: '条', tone: 'math' },
  ],
  items: [
    { id: 'castle', label: '城堡', emoji: '🏰', measureId: 'zuo' },
    { id: 'car', label: '汽车', emoji: '🚗', measureId: 'liang' },
    { id: 'road', label: '马路', emoji: '🛣️', measureId: 'tiao' },
  ],
  recital: '一座城堡、一辆汽车、一条马路。',
}

function mountInteraction(props: Record<string, unknown> = {}) {
  return mount(MeasureStampInteraction, { props: { payload, ...props } })
}

/** 找到某个物品的按钮（用 aria-label 定位，避免依赖 DOM 顺序） */
function itemButton(wrapper: ReturnType<typeof mountInteraction>, label: string) {
  const found = wrapper.findAll('button').find(button => (button.attributes('aria-label') ?? '').includes(label))
  if (!found)
    throw new Error(`没找到物品「${label}」的按钮`)
  return found
}

function measureButton(wrapper: ReturnType<typeof mountInteraction>, label: string) {
  const found = wrapper.findAll('button').find(button => button.attributes('aria-label') === `量词印章 ${label}`)
  if (!found)
    throw new Error(`没找到印章「${label}」`)
  return found
}

describe('量词印章', () => {
  it('渲染出全部印章与物品', () => {
    const wrapper = mountInteraction()

    for (const measure of payload.measures)
      expect(measureButton(wrapper, measure.label).exists()).toBe(true)
    for (const item of payload.items)
      expect(itemButton(wrapper, item.label).exists()).toBe(true)
  })

  it('没拿印章就盖：给出方向，并且不影响任何物品', async () => {
    const wrapper = mountInteraction()

    await itemButton(wrapper, '城堡').trigger('click')

    expect(wrapper.emitted('missed')).toHaveLength(1)
    expect(String(wrapper.emitted('missed')?.[0]?.[0])).toContain('先点一个量词印章')
    expect(wrapper.emitted('solved')).toBeUndefined()
    // 物品仍然可以再盖，没有被锁住
    expect(itemButton(wrapper, '城堡').attributes('disabled')).toBeUndefined()
  })

  it('拿印章会标记为按下状态，再点一次放下', async () => {
    const wrapper = mountInteraction()

    await measureButton(wrapper, '座').trigger('click')
    expect(measureButton(wrapper, '座').attributes('aria-pressed')).toBe('true')

    await measureButton(wrapper, '座').trigger('click')
    expect(measureButton(wrapper, '座').attributes('aria-pressed')).toBe('false')
  })

  it('盖错了：提示里指出正确的搭配，物品不锁死', async () => {
    const wrapper = mountInteraction()

    await measureButton(wrapper, '辆').trigger('click')
    await itemButton(wrapper, '城堡').trigger('click')

    const missed = wrapper.emitted('missed')
    expect(missed).toHaveLength(1)
    expect(String(missed?.[0]?.[0])).toContain('一座城堡')
    // 盖错不消耗任何东西：物品还能再盖
    expect(itemButton(wrapper, '城堡').attributes('disabled')).toBeUndefined()
    expect(wrapper.emitted('solved')).toBeUndefined()
  })

  it('盖对了：物品锁定并显示短语，手里的印章自动放下', async () => {
    const wrapper = mountInteraction()

    await measureButton(wrapper, '座').trigger('click')
    await itemButton(wrapper, '城堡').trigger('click')

    expect(wrapper.text()).toContain('一座城堡')
    expect(itemButton(wrapper, '城堡').attributes('disabled')).toBeDefined()
    // 自动放下印章：逼孩子为下一个物品重新判断，而不是无脑连点
    expect(measureButton(wrapper, '座').attributes('aria-pressed')).toBe('false')
    // 还没盖完，不结算
    expect(wrapper.emitted('solved')).toBeUndefined()
  })

  it('全部盖对后上报完整映射，并亮出朗读条', async () => {
    const wrapper = mountInteraction()

    for (const [measure, item] of [['座', '城堡'], ['辆', '汽车'], ['条', '马路']] as const) {
      await measureButton(wrapper, measure).trigger('click')
      await itemButton(wrapper, item).trigger('click')
    }

    const solved = wrapper.emitted('solved')
    expect(solved).toHaveLength(1)
    expect(solved?.[0]?.[0]).toEqual({ castle: 'zuo', car: 'liang', road: 'tiao' })

    const text = wrapper.text()
    expect(text).toContain('连起来读一遍')
    expect(text).toContain('一座城堡')
    expect(text).toContain('一条马路')
  })

  it('同一个量词可以盖到多个物品上（座 → 城堡与桥）', async () => {
    const twoCastles: MeasureStampPayload = {
      measures: [{ id: 'zuo', label: '座' }],
      items: [
        { id: 'castle', label: '城堡', emoji: '🏰', measureId: 'zuo' },
        { id: 'bridge', label: '桥', emoji: '🌉', measureId: 'zuo' },
      ],
    }
    const wrapper = mount(MeasureStampInteraction, { props: { payload: twoCastles } })

    await measureButton(wrapper, '座').trigger('click')
    await itemButton(wrapper, '城堡').trigger('click')
    await measureButton(wrapper, '座').trigger('click')
    await itemButton(wrapper, '桥').trigger('click')

    expect(wrapper.emitted('solved')).toHaveLength(1)
  })

  it('disabled 时完全惰性', async () => {
    const wrapper = mountInteraction({ disabled: true })

    await measureButton(wrapper, '座').trigger('click')
    await itemButton(wrapper, '城堡').trigger('click')

    expect(wrapper.emitted('missed')).toBeUndefined()
    expect(wrapper.emitted('solved')).toBeUndefined()
  })

  it('数量用中文数字，读起来是「两座」而不是「2座」', async () => {
    const counted: MeasureStampPayload = {
      measures: [{ id: 'zuo', label: '座' }],
      items: [{ id: 'castle', label: '城堡', emoji: '🏰', measureId: 'zuo', count: 2 }],
    }
    const wrapper = mount(MeasureStampInteraction, { props: { payload: counted } })

    await measureButton(wrapper, '座').trigger('click')
    await itemButton(wrapper, '城堡').trigger('click')

    expect(wrapper.text()).toContain('两座城堡')
    expect(wrapper.text()).not.toContain('2座')
  })
})
