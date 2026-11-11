import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import MathUnitTwoPracticePage from './MathUnitTwoPracticePage.vue'

vi.mock('vue-router', () => ({
  useRoute: () => ({ params: { gradeId: 'grade-1', categoryId: 'grade-1-math' }, query: {} }),
  useRouter: () => ({ push: vi.fn() }),
}))

describe('第二单元图文练习', () => {
  beforeEach(() => localStorage.clear())

  it('记录错误答案、显示解析并继续下一题', async () => {
    const wrapper = mount(MathUnitTwoPracticePage)
    expect(wrapper.text()).toContain('9 的后面一个数是几？')
    expect(wrapper.text()).not.toContain('数字互动')
    const wrong = wrapper.findAll('button').find(button => button.text().replace(/\s/g, '') === 'A8')
    expect(wrong).toBeTruthy()
    await wrong!.trigger('click')
    expect(wrapper.text()).toContain('来看看怎么数')
    const saved = JSON.parse(localStorage.getItem('starsprout:g1-math-u2-practice:v1:all')!) as { missed: string[] }
    expect(saved.missed).toContain('cnm-p008-q1')
    const next = wrapper.findAll('button').find(button => button.text().includes('下一题'))
    await next!.trigger('click')
    expect(wrapper.text()).toContain('比 7 大又比 9 小的数是几？')
  })
})
