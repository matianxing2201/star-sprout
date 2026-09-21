import type { Router } from 'vue-router'
import { ref } from 'vue'

/**
 * 页面资源加载失败的兜底
 * ======================
 *
 * 页面是按路由懒加载的：点一个链接时才去取那一页的 chunk（生产环境还会预加载它的 CSS）。
 * 如果取不到，浏览器只会把错误丢进控制台 —— 界面**一点反应都没有**：
 * 孩子点了「量词小魔法师」，什么都没发生，也没有任何提示。
 *
 * 什么时候会发生（都不是罕见情况）：
 *   - 重新部署后旧的 chunk 文件名变了，浏览器还拿着上一版的 index 去要 → 404；
 *   - 网络抖动 / 平板离线 / 服务器刚重启；
 *   - 开发时服务器被关掉，而页面还开着（最容易踩）。
 *
 * ## 为什么要同时挂两个地方
 *
 * 实跑发现开发与生产走的是**两条不同的失败路径**：
 *   - 开发：`import()` 被拒 → 会走路由的 onError
 *     （`Failed to fetch dynamically imported module: …/LessonPage.vue`）
 *   - 生产：Vite 预加载 CSS 的 `<link>` 触发 onerror，是一个**没有被捕获的全局错误**
 *     （`Unable to preload CSS for …/assets/LessonPage-xxxx.css`），路由的 onError 收不到
 * 只挂路由的话，生产环境点击仍然是「没反应」。
 * 所以既监听路由错误，也监听 window 的 error / unhandledrejection。
 *
 * ## 兜底策略
 *   1. **自动整页刷新一次**：换到最新版本的资源清单，绝大多数情况这一步就好了；
 *   2. 再失败就不刷新了（避免服务器真挂了时陷入刷新死循环），
 *      把 `chunkLoadFailed` 置为 true，由 App.vue 显示人话提示 + 「重新加载」按钮。
 */
export const chunkLoadFailed = ref(false)

/** sessionStorage 标记：本次会话已经自动刷新过一次 */
export const CHUNK_RELOAD_FLAG = 'kids-world:chunk-reloaded'

/**
 * 各浏览器/打包器对「这一页的资源没取到」的措辞不一样，统一识别。
 * 开发与生产报的**不是同一个错**（见文件头说明），两种都要认。
 */
export function isChunkLoadError(error: unknown): boolean {
  const message = error instanceof Error
    ? `${error.name} ${error.message}`
    : String(error ?? '')

  return /Failed to fetch dynamically imported module|Unable to preload CSS|Importing a module script failed|error loading dynamically imported module|ChunkLoadError|Loading chunk \d+ failed/i
    .test(message)
}

export type ChunkFailureAction = 'retry' | 'prompt'

/**
 * 决定这一次该自动刷新还是提示。
 *
 * 只有在「能把这次尝试记下来」的时候才自动刷新：拿不到存储（隐私模式 / 存储被禁用）
 * 就无法记录，那样自动刷新会变成无限循环 —— 比「点了没反应」更糟。
 */
export function decideChunkFailureAction(storage: Storage | null): ChunkFailureAction {
  if (storage === null)
    return 'prompt'

  if (storage.getItem(CHUNK_RELOAD_FLAG) === '1')
    return 'prompt'

  storage.setItem(CHUNK_RELOAD_FLAG, '1')
  return 'retry'
}

/**
 * 依赖注入。
 * 副作用（存标记、整页跳转、注册全局监听）从外面传进来 —— 一是可测
 * （jsdom 里 `location.assign` 是只读的，替换不掉），二是让「这里会整页刷新」显式可见。
 */
export interface ChunkReloadDeps {
  storage?: Storage | null
  /** 跳转到目标地址；传 null 表示「重新加载当前页」 */
  navigate?: (url: string | null) => void
  /** 注册全局错误监听（默认挂到 window 上） */
  listen?: (handler: (error: unknown) => void) => void
}

function safeSessionStorage(): Storage | null {
  try {
    return window.sessionStorage
  }
  catch {
    return null
  }
}

function defaultListen(handler: (error: unknown) => void): void {
  window.addEventListener('error', event => handler(event.error ?? event.message))
  window.addEventListener('unhandledrejection', event => handler(event.reason))
}

export function installChunkReloadGuard(router: Router, deps: ChunkReloadDeps = {}): void {
  const storage = deps.storage === undefined ? safeSessionStorage() : deps.storage
  const navigate = deps.navigate ?? ((url: string | null) => {
    if (url === null)
      window.location.reload()
    else
      window.location.assign(url)
  })
  const listen = deps.listen ?? defaultListen

  function handle(error: unknown, targetUrl: string | null): void {
    if (!isChunkLoadError(error))
      return

    if (decideChunkFailureAction(storage) === 'retry') {
      // 带着目标地址整页刷新：新版资源清单里能找到对应的 chunk
      navigate(targetUrl)
      return
    }

    // 刷新过一次还是失败（或无法记录）—— 交给界面说人话
    chunkLoadFailed.value = true
  }

  // 开发路径：import() 被拒会走这里，能拿到孩子本来要去哪
  router.onError((error, to) => handle(error, to.fullPath))

  // 生产路径：CSS 预加载失败是没被捕获的全局错误，拿不到目标地址，只能重载当前页
  listen(error => handle(error, null))

  // 只要有一次导航成功，就说明资源恢复正常，允许下次再自动刷新一次
  router.afterEach(() => {
    chunkLoadFailed.value = false
    storage?.removeItem(CHUNK_RELOAD_FLAG)
  })
}
