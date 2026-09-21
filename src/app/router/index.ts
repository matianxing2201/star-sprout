import { createRouter, createWebHistory } from 'vue-router'

import { routes } from './routes'

/** 首页以外的页面标题统一带后缀，浏览器标签页与历史记录里都好认 */
const DEFAULT_TITLE = '学习世界 · 儿童自主学习空间'

/**
 * 路由装配。
 * 这里只做最少的全局行为：滚动复位、文档标题同步。
 * 业务规则（未解锁、内容缺失）一律留在页面里 —— 路由层不应该懂课程。
 */
export function createAppRouter() {
  const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
    scrollBehavior(_to, _from, savedPosition) {
      if (savedPosition != null)
        return savedPosition
      return { top: 0 }
    },
  })

  router.afterEach((to) => {
    const title = typeof to.meta.title === 'string' && to.meta.title.length > 0 ? to.meta.title : null
    document.title = title === null ? DEFAULT_TITLE : `${title} · 学习世界`
  })

  return router
}

export { ROUTE_NAMES } from './route-names'
export type { RouteName } from './route-names'
