import type { InteractionSpec } from '@/domain'
import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { defineComponent, h, onMounted } from 'vue'

import { MascotBubble } from '@/features/mascot'

/**
 * 表演通道（`perform`）
 * =====================
 *
 * 为什么需要它：外壳原来只认 `solved` / `missed` 两个事件，所以角色对
 * **孩子正在做什么**一无所知 —— 它只能在最后说一句通用鼓励。这正是
 * 「13 个互动看起来一样」的最大单一原因（见 docs/interaction-motion-standard.md 第二节）。
 *
 * 这条契约守的是：互动报告**过程**（做了几个、角色现在什么心情），
 * 外壳决定**怎么演**，而判定仍然只有 solved/missed。
 */

/** 让外壳相信注册表里就是一个「会表演」的互动 */
vi.mock('./registry', () => ({
  resolveInteraction: () =>
    defineComponent({
      props: { payload: { type: Object, required: true }, disabled: Boolean },
      emits: ['solved', 'missed', 'perform'],
      setup(_props, { emit }) {
        onMounted(() => {
          emit('perform', {
            character: { mood: 'curious', line: '三块积木都放进去了！' },
            progress: { done: 3, total: 5 },
          })
        })
        return () => h('div', { class: 'stub-stage' })
      },
    }),
}))

const InteractionShell = (await import('./InteractionShell.vue')).default

const spec = {
  kind: 'sequence-build',
  prompt: '把三块积木按顺序放进程序条',
  payload: { palette: [], solution: [], goal: '' },
} as unknown as InteractionSpec

function mountShell() {
  return mount(InteractionShell, { props: { spec, mascot: 'fox' } })
}

describe('互动外壳 · 表演通道', () => {
  it('互动报告的角色心情与台词，外壳要听', async () => {
    const wrapper = mountShell()
    await flushPromises()

    const bubble = wrapper.findComponent(MascotBubble)
    expect(bubble.exists(), '角色气泡应该渲染出来了').toBe(true)
    expect(bubble.props('mood'), '角色应听互动的报告').toBe('curious')
    expect(bubble.props('text'), '角色台词应听互动的报告').toContain('三块积木都放进去了')
  })

  it('进度要显示出来（累积看得见）', async () => {
    const wrapper = mountShell()
    await flushPromises()

    const text = wrapper.text()
    expect(text, '外壳应当把 done/total 显示给孩子看').toContain('3')
    expect(text).toContain('5')
  })

  it('表演不等于判定：报告进度不应让外壳以为已经答对', async () => {
    const wrapper = mountShell()
    await flushPromises()

    // 进度 3/5 时还没答对，外壳的庆祝台词不该出现
    expect(wrapper.text(), '报告进度不等于答对').not.toContain('真棒')
  })
})
