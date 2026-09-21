import { beforeEach, describe, expect, it } from 'vitest'

import {
  CHUNK_RELOAD_FLAG,
  chunkLoadFailed,
  decideChunkFailureAction,
  installChunkReloadGuard,
  isChunkLoadError,
} from './chunk-reload'

/**
 * 资源加载失败兜底的契约
 * ======================
 *
 * 这条兜底来自一个真实故障：开发服务器被关掉后页面还开着，
 * 点任何链接都「没反应」—— 因为路由 chunk 取不到，而错误只进了控制台，
 * 界面上什么都不发生。对一个给孩子的应用来说，「点了没反应」比「报个错」糟糕得多。
 *
 * 实跑还发现开发和生产的失败路径不同（见 chunk-reload.ts 文件头），
 * 下面两条断言分别钉住它们。
 */
describe('isChunkLoadError', () => {
  it('认得开发环境的动态导入失败', () => {
    expect(isChunkLoadError(new TypeError('Failed to fetch dynamically imported module: http://x/y.vue'))).toBe(true)
    expect(isChunkLoadError(new Error('Importing a module script failed.'))).toBe(true)
    expect(isChunkLoadError(new Error('error loading dynamically imported module'))).toBe(true)
  })

  it('认得生产环境的 CSS 预加载失败', () => {
    // 实测：生产构建报的是 Unable to preload CSS for .../assets/LessonPage-xxxx.css，
    // 它是个没被捕获的全局错误，路由的 onError 收不到
    expect(isChunkLoadError(new Error('Unable to preload CSS for http://x/assets/LessonPage-a1b2.css'))).toBe(true)
    expect(isChunkLoadError(Object.assign(new Error('Loading chunk 7 failed.'), { name: 'ChunkLoadError' }))).toBe(true)
  })

  it('不相干的错误不误判', () => {
    expect(isChunkLoadError(new Error('课程不存在'))).toBe(false)
    expect(isChunkLoadError(undefined)).toBe(false)
    expect(isChunkLoadError('some other failure')).toBe(false)
  })
})

describe('decideChunkFailureAction', () => {
  function makeStorage(initial?: string) {
    const map = new Map<string, string>()
    if (initial !== undefined)
      map.set(CHUNK_RELOAD_FLAG, initial)
    return {
      getItem: (key: string) => map.get(key) ?? null,
      setItem: (key: string, value: string) => void map.set(key, value),
      removeItem: (key: string) => void map.delete(key),
      map,
    } as unknown as Storage & { map: Map<string, string> }
  }

  it('第一次失败 → 自动刷新，并记下标记', () => {
    const storage = makeStorage()
    expect(decideChunkFailureAction(storage)).toBe('retry')
    expect(storage.map.get(CHUNK_RELOAD_FLAG)).toBe('1')
  })

  it('已经刷新过一次再失败 → 改为提示，不再刷新（避免死循环）', () => {
    expect(decideChunkFailureAction(makeStorage('1'))).toBe('prompt')
  })

  it('拿不到存储（隐私模式）→ 直接提示，绝不自动刷新', () => {
    // 存不了标记就一定会无限刷新，那比「点了没反应」更糟
    expect(decideChunkFailureAction(null)).toBe('prompt')
  })
})

describe('installChunkReloadGuard', () => {
  function makeRouter() {
    const errorHandlers: ((error: unknown, to: { fullPath: string }) => void)[] = []
    const afterHandlers: (() => void)[] = []
    return {
      router: {
        onError: (fn: (error: unknown, to: { fullPath: string }) => void) => errorHandlers.push(fn),
        afterEach: (fn: () => void) => afterHandlers.push(fn),
      } as never,
      triggerRouteError: (error: unknown, fullPath = '/lesson/x') => errorHandlers.forEach(fn => fn(error, { fullPath })),
      triggerAfter: () => afterHandlers.forEach(fn => fn()),
    }
  }

  function makeStorage(initial?: string) {
    const map = new Map<string, string>()
    if (initial !== undefined)
      map.set(CHUNK_RELOAD_FLAG, initial)
    return {
      getItem: (key: string) => map.get(key) ?? null,
      setItem: (key: string, value: string) => void map.set(key, value),
      removeItem: (key: string) => void map.delete(key),
      map,
    } as unknown as Storage & { map: Map<string, string> }
  }

  const DEV_ERROR = new TypeError('Failed to fetch dynamically imported module: /x.vue')
  const PROD_ERROR = new Error('Unable to preload CSS for /assets/LessonPage-a1b2.css')

  beforeEach(() => {
    chunkLoadFailed.value = false
  })

  it('开发路径：路由错误带上目标地址，整页刷新到孩子本来要去的页面', () => {
    const { router, triggerRouteError } = makeRouter()
    const navigated: (string | null)[] = []

    installChunkReloadGuard(router, {
      storage: makeStorage(),
      navigate: url => void navigated.push(url),
      listen: () => {},
    })
    triggerRouteError(DEV_ERROR, '/lesson/a')

    expect(navigated).toEqual(['/lesson/a'])
    expect(chunkLoadFailed.value).toBe(false)
  })

  it('生产路径：全局错误也能兜住（改为重载当前页）', () => {
    const { router } = makeRouter()
    const navigated: (string | null)[] = []
    let globalHandler: ((error: unknown) => void) | undefined

    installChunkReloadGuard(router, {
      storage: makeStorage(),
      navigate: url => void navigated.push(url),
      listen: (handler) => { globalHandler = handler },
    })
    expect(globalHandler).toBeDefined()

    globalHandler?.(PROD_ERROR)

    // 拿不到目标地址，因此传 null（= 重载当前页）
    expect(navigated).toEqual([null])
  })

  it('已经刷新过再失败 → 显示提示', () => {
    const { router, triggerRouteError } = makeRouter()
    const navigated: (string | null)[] = []

    installChunkReloadGuard(router, {
      storage: makeStorage('1'),
      navigate: url => void navigated.push(url),
      listen: () => {},
    })
    triggerRouteError(DEV_ERROR)

    expect(navigated).toEqual([])
    expect(chunkLoadFailed.value).toBe(true)
  })

  it('不相干的错误既不刷新也不提示', () => {
    const { router, triggerRouteError } = makeRouter()
    const storage = makeStorage()
    const navigated: (string | null)[] = []

    installChunkReloadGuard(router, { storage, navigate: url => void navigated.push(url), listen: () => {} })
    triggerRouteError(new Error('别的问题'))

    expect(navigated).toEqual([])
    expect(storage.map.size).toBe(0)
    expect(chunkLoadFailed.value).toBe(false)
  })

  it('有一次导航成功就清掉标记并收起提示，下次还能自动刷新', () => {
    const { router, triggerAfter } = makeRouter()
    const storage = makeStorage('1')
    chunkLoadFailed.value = true

    installChunkReloadGuard(router, { storage, navigate: () => {}, listen: () => {} })
    triggerAfter()

    expect(storage.map.has(CHUNK_RELOAD_FLAG)).toBe(false)
    expect(chunkLoadFailed.value).toBe(false)
  })
})

describe('应用兜底界面', () => {
  beforeEach(() => {
    chunkLoadFailed.value = false
  })

  it('chunkLoadFailed 为真时显示人话提示，而不是让页面毫无反应', async () => {
    const { mount } = await import('@vue/test-utils')
    const App = (await import('@/App.vue')).default

    // 提示用 Teleport 挂到 body，所以要读 document，而不是 wrapper
    const wrapper = mount(App, { global: { stubs: { RouterView: true } } })
    expect(document.body.textContent).not.toContain('这一页没找到路')

    chunkLoadFailed.value = true
    await wrapper.vm.$nextTick()

    const text = document.body.textContent ?? ''
    expect(text).toContain('这一页没找到路')
    expect(text).toContain('重新加载')
    // 给孩子看的文案不能吓人
    expect(text).not.toContain('错误')
    expect(text).not.toContain('失败')

    chunkLoadFailed.value = false
    wrapper.unmount()
  })
})
