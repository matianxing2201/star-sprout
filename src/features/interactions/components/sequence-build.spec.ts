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
  palette: [
    { id: 'b1', kind: 'move', label: '前进' },
    { id: 'b2', kind: 'turn', label: '右转' },
  ],
  solution: ['b1', 'b2', 'b1'],
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
