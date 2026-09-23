import type { DragDropPayload } from '@/domain'
import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import DragDropInteraction from './DragDropInteraction.vue'

/**
 * 拖一拖 · 进度与答错方式
 * ========================
 *
 * 守 `docs/interaction-motion-standard.md` 第四节的第 3、4 条：
 *   - 累积可见：每放一张就通过表演通道报 `已放置 N / M`
 *   - 答错是方向 + **弹一下**，不是左右摇晃（卡片已经在框里了，摇像是在晃它）
 *
 * 磁力吸附走的是坐标与 getBoundingClientRect，jsdom 里没有真实布局，
 * 所以它靠浏览器核对，不在这里断言 —— 这里只断言与布局无关的行为。
 */
const payload: DragDropPayload = {
  zones: [
    { id: 'forest', label: '森林', accepts: ['leaf'] },
    { id: 'sky', label: '天上', accepts: ['cloud'] },
  ],
  items: [
    { id: 'leaf', label: '叶子' },
    { id: 'cloud', label: '云' },
  ],
}

function mountStage() {
  return mount(DragDropInteraction, { props: { payload } })
}

/** 用点选路径放一张卡：先点卡片，再点框（触摸屏与键盘也走这条路） */
async function place(wrapper: ReturnType<typeof mountStage>, itemLabel: string, zoneLabel: string): Promise<void> {
  const card = wrapper.findAll('button').find(button => button.text() === itemLabel)
  expect(card, `找不到卡片 ${itemLabel}`).toBeTruthy()
  await card!.trigger('click')

  // 落位按钮两个框的文字一模一样（都是「点这里放在这」），
  // 只能按 aria-label「把选中的卡片放进xx」区分 —— 否则永远点到第一个框
  const zone = wrapper.findAll('button').find(button =>
    (button.attributes('aria-label') ?? '').includes(zoneLabel),
  )
  expect(zone, `找不到框 ${zoneLabel}`).toBeTruthy()
  await zone!.trigger('click')
  await flushPromises()
}

describe('拖一拖 · 累积与答错', () => {
  it('每放一张就报一次进度', async () => {
    const wrapper = mountStage()
    await flushPromises()

    await place(wrapper, '叶子', '森林')

    const progress = (wrapper.emitted('perform') ?? [])
      .map(([value]) => value as { progress?: { done: number, total: number } })
      .filter(value => value.progress)
      .map(value => `${value.progress!.done}/${value.progress!.total}`)

    expect(progress, '放一张就该报一次进度，外壳才能显示出来').toContain('1/2')

    await place(wrapper, '云', '天上')
    const after = (wrapper.emitted('perform') ?? [])
      .map(([value]) => value as { progress?: { done: number, total: number } })
      .filter(value => value.progress)
      .map(value => `${value.progress!.done}/${value.progress!.total}`)
    expect(after).toContain('2/2')
  })

  it('放错时是弹一下，不是 fx-gently 摇晃；且答错带具体对象', async () => {
    const wrapper = mountStage()
    await flushPromises()

    // 故意放错：把云放进森林
    await place(wrapper, '云', '森林')
    expect(wrapper.emitted('perform'), '放对的那一步也报了进度').toBeTruthy()

    const check = wrapper.findAll('button').find(button => button.text().includes('看看对不对'))
    expect(check, '找不到检查按钮').toBeTruthy()
    await check!.trigger('click')
    await flushPromises()

    expect(wrapper.emitted('missed'), '放错了应当报 missed').toBeTruthy()
    const hint = (wrapper.emitted('missed') ?? [])[0]?.[0] as string | undefined
    expect(hint, '答错要报具体对象，不能是笼统的「再试试」').toBeTruthy()
    expect(hint).toMatch(/云|该回哪个家/)

    // 错误反馈走的是 dd-bounce（弹一下），不是 fx-gently（左右摇）
    expect(wrapper.html(), '应当用弹一下代替摇晃').toContain('dd-bounce')
    expect(wrapper.html(), '不该再用 fx-gently').not.toContain('fx-gently')
  })
})
