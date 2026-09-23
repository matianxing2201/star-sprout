import type { FindPatternPayload } from '@/domain'
import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import FindPatternInteraction from './FindPatternInteraction.vue'

/**
 * 找规律 · 两拍与方向反馈
 * ========================
 *
 * 守 `docs/interaction-motion-standard.md` 第四节的第 1、2、4、5 条：
 *   - `focus` 拍：点中的那个站出来，其余退到后面（不是整排一起摇）
 *   - `confirm` 拍：数字落进空格弹一下
 *   - 答错走表演通道给出方向，且**只有被点的那个**动
 *
 * 第 3 条（累积可见）对单空格题不适用，理由写在组件注释里。
 *
 * 「规律是哪一种」组件不认识 —— 判定只比较 `sequence[blankIndex]`，
 * 规律检查属于内容（`content.spec.ts`），所以这里不测规律。
 */
const payload: FindPatternPayload = {
  // 3 7 3 [7] 3 —— ABAB，空格在第 4 格
  sequence: [3, 7, 3, 7, 3],
  blankIndex: 3,
  options: [5, 7, 8],
  hint: '空格前后都是 3 —— 那它自己应该和它们不一样。',
}

function mountStage(overrides: Partial<FindPatternPayload> = {}) {
  return mount(FindPatternInteraction, { props: { payload: { ...payload, ...overrides } } })
}

function optionButton(wrapper: ReturnType<typeof mountStage>, value: number) {
  return wrapper.findAll('button').find(button => button.text().trim() === String(value))
}

describe('找规律 · 两拍', () => {
  it('五个方框里只有一个是空的，另外四个写着数', async () => {
    const wrapper = mountStage()
    await flushPromises()

    const boxes = wrapper.findAll('[role="listitem"]')
    expect(boxes, '应当正好 5 个方框').toHaveLength(5)
    expect(boxes.filter(box => (box.attributes('aria-label') ?? '').includes('空着的方框'))).toHaveLength(1)
    expect(boxes[3].text(), '空着的那格显示问号').toContain('?')
    expect(boxes[0].text()).toContain('3')
  })

  it('填对时数字落进空格（confirm 拍）', async () => {
    const wrapper = mountStage()
    await flushPromises()

    await optionButton(wrapper, 7)!.trigger('click')
    await flushPromises()

    expect(wrapper.emitted('solved'), '填对了就应当判对').toBeTruthy()
    expect(wrapper.emitted('missed')).toBeUndefined()
    expect(wrapper.findAll('[data-confirm="true"]'), '空格要有落位确认拍').toHaveLength(1)
    expect(wrapper.findAll('[role="listitem"]')[3].text(), '空格被填上了 7').toContain('7')
  })

  it('点中的站出来、其余退到后面（focus 拍），答错时走表演通道给方向', async () => {
    const wrapper = mountStage()
    await flushPromises()

    await optionButton(wrapper, 5)!.trigger('click')
    await flushPromises()

    // focus 拍：只有被点的那个是 focus
    const focused = wrapper.findAll('[data-focus="true"]')
    expect(focused, '被点中的那个要站出来').toHaveLength(1)
    expect(focused[0].text().trim()).toBe('5')
    expect(wrapper.findAll('[data-dimmed="true"]'), '其余的退到后面').toHaveLength(2)

    // 判定仍然独立
    expect(wrapper.emitted('missed'), '填错了应当报 missed').toBeTruthy()
    expect(wrapper.emitted('solved')).toBeUndefined()

    // 角色的反应：心情 + 内容侧给的方向
    const character = (wrapper.emitted('perform') ?? [])
      .map(([value]) => value as { character?: { mood?: string, line?: string } })
      .find(report => report.character)
    expect(character, '答错要走表演通道').toBeTruthy()
    expect(character!.character!.mood).toBe('thinking')
    expect(character!.character!.line, '方向应当来自内容侧的 hint').toContain('空格前后都是 3')

    // 空格不能被填错的数字占了
    expect(wrapper.findAll('[role="listitem"]')[3].text()).toContain('?')
  })

  it('没写 hint 时不编造方向，只报心情', async () => {
    const wrapper = mountStage({ hint: undefined })
    await flushPromises()

    await optionButton(wrapper, 5)!.trigger('click')
    await flushPromises()

    const character = (wrapper.emitted('perform') ?? [])
      .map(([value]) => value as { character?: { mood?: string, line?: string } })
      .find(report => report.character)

    expect(character!.character!.mood).toBe('thinking')
    expect(character!.character!.line, '没有方向就说不知道，别编一句通用鼓励').toBeUndefined()
    expect(wrapper.emitted('missed'), '判定通道不受影响').toBeTruthy()
  })
})
