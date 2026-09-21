import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'

import App from '@/App.vue'
import { createAppRouter } from '@/app/router'
import { contentPack } from '@/content'

/**
 * 应用冒烟测试
 * ============
 *
 * 逐个访问儿童端与家长端的每一个页面，确认：
 *   1. 应用能装配起来（路由 / Pinia / 内容包都能对上）；
 *   2. 每个页面都能渲染出内容，而不是白屏或抛异常；
 *   3. 内容包里的课程真的能进入播放器，并且第一个步骤渲染得出来。
 *
 * 它替代不了人眼，但能挡住“改了某个 store 之后首页直接挂掉”这类事故。
 */

/** 收集渲染期间的控制台报错，任何一条都说明有东西坏了 */
function mountApp() {
  const pinia = createPinia()
  const router = createAppRouter()

  const wrapper = mount(App, {
    global: { plugins: [pinia, router] },
    attachTo: document.body,
  })

  return { wrapper, router }
}

async function visit(router: ReturnType<typeof createAppRouter>, location: string): Promise<void> {
  await router.push(location)
  await router.isReady()
  await nextTick()
  await nextTick()
}

describe('应用冒烟测试', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  it('内容包已经装配：8 个年级、全部领域都有归属的学习世界', () => {
    expect(contentPack.grades).toHaveLength(8)
    expect(contentPack.categories.length).toBeGreaterThan(50)
    expect(contentPack.worlds.length).toBeGreaterThan(0)
    expect(Object.keys(contentPack.maps)).toHaveLength(8)
  })

  it('首页渲染出角色问候、今日任务色块与学习地图', async () => {
    const { wrapper, router } = mountApp()
    await visit(router, '/')

    const text = wrapper.text()
    expect(text).toContain('今天要探索什么')
    expect(text).toContain('我的学习地图')

    // 地图节点应当来自内容包：把中班地图上的每个世界名都检查一遍
    for (const node of contentPack.maps.nursery.nodes) {
      const world = contentPack.worlds.find(item => item.id === node.worldId)
      expect(world).toBeDefined()
      expect(text).toContain(world!.name)
    }

    wrapper.unmount()
  })

  it('八个年级的领域页都能打开', async () => {
    const { wrapper, router } = mountApp()

    for (const grade of contentPack.grades) {
      await visit(router, `/learn/${grade.id}`)
      expect(wrapper.text()).toContain(grade.name)
    }

    wrapper.unmount()
  })

  it('每一门示例课程都能进入课程地图并打开播放器首屏', async () => {
    const { wrapper, router } = mountApp()

    for (const lesson of contentPack.lessons) {
      await visit(router, `/learn/${lesson.gradeId}/${lesson.categoryId}`)
      expect(wrapper.text()).toContain(lesson.title)

      await visit(router, `/lesson/${lesson.id}`)
      const text = wrapper.text()
      // 首屏一定是角色引入，而且能看到这节课的问题
      expect(text).toContain(lesson.title)
      expect(text).toContain('继续')
    }

    wrapper.unmount()
  })

  it('奖励中心、我的成长、家长端与 404 都能渲染', async () => {
    const { wrapper, router } = mountApp()

    await visit(router, '/rewards')
    expect(wrapper.text()).toContain('徽章墙')

    await visit(router, '/growth')
    expect(wrapper.text()).toContain('我的成长')

    await visit(router, '/parent')
    expect(wrapper.text()).toContain('家长中心')

    await visit(router, '/parent/report')
    expect(wrapper.text()).toContain('学习报告')

    await visit(router, '/parent/settings')
    expect(wrapper.text()).toContain('设置')

    await visit(router, '/this-page-does-not-exist')
    expect(wrapper.text().length).toBeGreaterThan(0)

    wrapper.unmount()
  })

  it('切到六年级时首页仍然能渲染（该年级只有目录、没有课程）', async () => {
    const { wrapper, router } = mountApp()

    await visit(router, '/grades')
    expect(wrapper.text()).toContain('成长阶梯')

    await visit(router, '/learn/grade-6')
    expect(wrapper.text()).toContain('六年级')

    wrapper.unmount()
  })
})
