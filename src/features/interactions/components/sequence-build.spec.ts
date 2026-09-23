import type { SequenceBuildPayload } from '@/domain'
import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import SequenceBuildInteraction from './SequenceBuildInteraction.vue'

/**
 * 搭指令的舞台动作
 * ================
 *
 * 这里只测一件事：**角色的位移是用 `transform` 表达的，不是 `left`**。
 *
 * 为什么值得单独守一条：原来这个位移动的是 `left`（布局属性）+ `transition-all` + 600ms。
 * 布局动画每帧都会触发重排，而且 600ms 超出了动效预算。
 * 改法是把位移交给 `translateX`，但这类改动很容易在后续重构里被「顺手改回去」
 * —— 改回去之后界面**看不出任何异常**，只有性能和中低端设备上的手感会变差。
 * 所以用一条断言把它钉住。
 */
const payload: SequenceBuildPayload = {
  goal: '让小车开到终点',
  actor: { emoji: '🚗', label: '小车' },
  target: { emoji: '🏁', label: '终点' },
  // 三个标签必须互不相同：测试按文本找按钮，两块都叫「前进」会点错，
  // 然后序列不匹配 —— 那时组件会**正确地**判错，而问题出在测试数据上
  palette: [
    { id: 'b1', kind: 'move', label: '前进' },
    { id: 'b2', kind: 'turn', label: '右转' },
    { id: 'b3', kind: 'move', label: '停一停' },
  ],
  solution: ['b1', 'b2', 'b3'],
}

function mountStage() {
  return mount(SequenceBuildInteraction, {
    props: { payload },
    global: { stubs: { KVisual: true } },
  })
}

describe('搭指令 · 角色位移', () => {
  it('角色用 translateX 位移，不动 left，也不做 transition-all', async () => {
    const wrapper = mountStage()
    await flushPromises()

    const moved = wrapper.findAll('div').find(el => el.attributes('style')?.includes('translateX'))
    expect(moved, '没有找到用 translateX 位移的角色元素').toBeTruthy()

    const style = moved!.attributes('style') ?? ''
    const className = moved!.attributes('class') ?? ''

    // 停在起点时也应当是 transform，而不是靠 left 定位
    expect(style).toContain('translateX(')
    expect(style).not.toContain('left:')
    expect(className).toContain('transition-transform')
    expect(className).not.toContain('transition-all')

    wrapper.unmount()
  })
})

describe('搭指令 · 多拍执行', () => {
  /**
   * 这条测试存在的理由：**内容里没有任何一节课用 sequence-build**，
   * 所以它在 app 里点不到 —— 只能在这里验。
   * 它守的是规范第四节第 1、3、5 条：落位有确认拍、进度走表演通道、
   * 出发时是**逐拍**执行而不是一次不可见的位移。
   */
  it('放一块报一次进度；出发后逐拍走完才判定', async () => {
    const wrapper = mountStage()
    await flushPromises()

    for (const block of payload.palette) {
      const button = wrapper.findAll('button').find(item => item.text() === block.label)
      expect(button, `找不到积木按钮 ${block.label}`).toBeTruthy()
      await button!.trigger('click')
    }
    await flushPromises()

    // 落位确认拍：最后放进去的那格带着 data-confirm
    expect(wrapper.find('[data-confirm="true"]').exists(), '刚放进去的那格应该有落位确认拍').toBe(true)

    // 进度走表演通道：每放一块报一次，最后是 3/3
    const progress = (wrapper.emitted('perform') ?? [])
      .map(([value]) => value as { progress?: { done: number, total: number } })
      .filter(value => value.progress)
      .map(value => `${value.progress!.done}/${value.progress!.total}`)
    expect(progress, '每放一块都应当报一次进度').toContain('3/3')

    // 出发：先走进第一步
    const runButton = wrapper.findAll('button').find(item => item.text().includes('出发'))
    expect(runButton, '找不到「出发」按钮').toBeTruthy()
    await runButton!.trigger('click')
    await new Promise(resolve => setTimeout(resolve, 80))
    await wrapper.vm.$nextTick()
    expect(wrapper.find('[data-running="true"]').exists(), '执行时应当逐拍高亮积木').toBe(true)

    // 每步 200ms + 收尾 240ms，三步共约 840ms
    await new Promise(resolve => setTimeout(resolve, 1300))
    expect(wrapper.emitted('solved'), '走完才判定，不该提前报').toBeTruthy()
    expect(wrapper.find('[data-running="true"]').exists(), '结束后不该还亮着').toBe(false)

    wrapper.unmount()
  })
})
