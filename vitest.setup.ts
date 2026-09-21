/**
 * 测试环境补齐
 * ============
 *
 * jsdom 不实现 matchMedia / ResizeObserver 这类浏览器 API，
 * 而儿童端的动效与部分互动组件会用到它们。
 * 这里补上最小可用的替身，让“整个应用能不能跑起来”可以用测试来验证。
 */

if (typeof window !== 'undefined') {
  if (typeof window.matchMedia !== 'function') {
    window.matchMedia = ((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    })) as unknown as typeof window.matchMedia
  }

  if (typeof globalThis.ResizeObserver !== 'function') {
    globalThis.ResizeObserver = class {
      observe(): void {}
      unobserve(): void {}
      disconnect(): void {}
    } as unknown as typeof ResizeObserver
  }

  if (typeof window.requestAnimationFrame !== 'function') {
    window.requestAnimationFrame = ((callback: FrameRequestCallback) =>
      setTimeout(() => callback(Date.now()), 0)) as unknown as typeof window.requestAnimationFrame
  }

  // 路由的 scrollBehavior 会调用它；jsdom 没有实现，测试输出会被噪音淹没
  window.scrollTo = (() => {}) as unknown as typeof window.scrollTo
}
