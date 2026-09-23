import type { ChooseOnePayload } from '@/domain'
import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import ChooseOneInteraction from './ChooseOneInteraction.vue'

/**
 * 选一选 · 两拍
 * ============
 *
 * 守 `docs/interaction-motion-standard.md` 第四节的第 2、4、5 条：
 *   - 第一拍 `focus`：被点中的那张站出来，其余退到后面（而不是整排一起摇）
 *   - 答错给方向：走表演通道报出内容侧写的 hint，不等外壳的「第 2 次才提示」
 *
 * 第 3 条（累积可见）对单选**不适用**，理由写在组件注释里。
 */
const payload: ChooseOnePayload = {
  options: [
    { id: 'a', label: '太阳', correct: false, hint: '它不发光，看看哪一个会发亮。' },
    { id: 'b', label: '月亮', correct: false },
    { id: 'c', label: '台灯', correct: true },
  ],
}

function mountStage() {
  return mount(ChooseOneInteraction, { props: { payload } })
}

describe('选一选 · focus 拍与方向反馈', () => {
  it('点中的那张站出来，其余的退到后面', async () => {
    const wrapper = mountStage()
    await flushPromises()

    const first = wrapper.findAll('button').find(button => button.text() === '太阳')
    expect(first, '找不到选项按钮').toBeTruthy()
    await first!.trigger('click')
    await wrapper.vm.$nextTick()

    expect(first!.attributes('data-focus'), '被点中的那张要「站出来」').toBe('true')
    expect(first!.attributes('data-dimmed'), '被点中的那张不该同时退到后面').toBeUndefined()

    const others = wrapper.findAll('button').filter(button => button.text() !== '太阳')
    expect(others.length, '应当还有另外两张').toBeGreaterThan(0)
    for (const other of others) {
      expect(other.attributes('data-dimmed'), '其余的要退到后面').toBe('true')
      expect(other.attributes('data-focus')).toBeUndefined()
    }
  })

  it('答错时把方向报给角色（表演通道），不只有摇一摇', async () => {
    const wrapper = mountStage()
    await flushPromises()

    const wrong = wrapper.findAll('button').find(button => button.text() === '太阳')
    await wrong!.trigger('click')
    await flushPromises()

    const reports = (wrapper.emitted('perform') ?? [])
      .map(([value]) => value as { character?: { mood?: string, line?: string } })

    expect(reports.length, '应当走了表演通道').toBeGreaterThan(0)
    const character = reports.find(report => report.character)
    expect(character, '答错要有角色的报告').toBeTruthy()
    expect(character!.character!.mood).toBe('thinking')
    expect(character!.character!.line, '方向要来自内容侧的 hint').toContain('会发亮')

    // 判定通道仍然是独立的：这次同时报了 missed
    expect(wrapper.emitted('missed'), '表演通道不替代判定').toBeTruthy()
    expect(wrapper.emitted('solved')).toBeUndefined()
  })

  it('没有 hint 的选项也只报心情，不编造方向', async () => {
    const wrapper = mountStage()
    await flushPromises()

    const noHint = wrapper.findAll('button').find(button => button.text() === '月亮')
    await noHint!.trigger('click')
    await flushPromises()

    const character = (wrapper.emitted('perform') ?? [])
      .map(([value]) => value as { character?: { mood?: string, line?: string } })
      .find(report => report.character)

    // 没有内容侧的方向时，宁可不说话 —— 编一句通用鼓励正是要治的病
    if (character) {
      expect(character.character?.line).toBeUndefined()
      expect(character.character?.mood).toBe('thinking')
    }
    expect(wrapper.emitted('missed')).toBeTruthy()
  })
})
