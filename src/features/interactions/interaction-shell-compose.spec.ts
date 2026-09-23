import type { InteractionSpec } from '@/domain'
import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

/**
 * 组件 → 外壳 → DOM 的完整链路
 * ============================
 *
 * 为什么单独一条：`interaction-shell.spec.ts` 用桩替换了注册表，所以它证明的是
 * 「外壳**会**渲染表演通道」；`drag-drop.spec.ts` 证明的是「组件**会**报进度」。
 * 但「真组件放进真外壳之后，孩子真的看得到进度」是**另一种**事实 ——
 * 两半都对不等于接得上（这次就抓到过 watch 不带 deep 导致进度永不发出）。
 *
 * 所以这条不替掉任何一条：它是链路本身。
 */
const spec = {
  kind: 'drag-drop',
  prompt: '把图形宝宝送回自己的家',
  payload: {
    zones: [
      { id: 'round', label: '圆形的家', accepts: ['ball'] },
      { id: 'sharp', label: '有角的家', accepts: ['block'] },
    ],
    items: [
      { id: 'ball', label: '皮球' },
      { id: 'block', label: '积木' },
    ],
  },
} as unknown as InteractionSpec

const InteractionShell = (await import('./InteractionShell.vue')).default

describe('互动外壳 · 真组件接进去', () => {
  it('孩子放一张卡，外壳就显示「已完成 1 / 2」', async () => {
    const wrapper = mount(InteractionShell, { props: { spec, mascot: 'fox' } })
    await flushPromises()

    // 放之前不该有进度条
    expect(wrapper.text(), '没开始就不该显示进度').not.toContain('已完成')

    const trayCard = wrapper.findAll('button').find((button) => {
      const flat = button.text().replace(/\s+/g, '')
      return flat.endsWith('皮球') && !(button.attributes('aria-label') ?? '').includes('放进')
    })
    expect(trayCard, '找不到托盘里的皮球').toBeTruthy()
    await trayCard!.trigger('click')

    const drop = wrapper.findAll('button').find(button =>
      (button.attributes('aria-label') ?? '').includes('放进'),
    )
    expect(drop, '找不到落位按钮').toBeTruthy()
    await drop!.trigger('click')
    await flushPromises()

    expect(wrapper.text(), '外壳应当把组件报上来的进度显示出来').toContain('已完成')
    expect(wrapper.text()).toContain('1')
    expect(wrapper.text()).toContain('2')
  })
})
