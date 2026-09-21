/**
 * 路由名称常量
 * ============
 *
 * 页面之间一律用名称跳转，不允许在组件里手写路径字符串。
 * 路径将来要改（例如加上 /kid 前缀），只改 routes.ts 一处。
 */
export const ROUTE_NAMES = {
  /** 首页 / 学习世界 */
  home: 'home',
  /** 年级选择（成长阶梯） */
  grades: 'grades',
  /** 学习领域（二级分类） */
  categories: 'categories',
  /** 课程地图（主题路径） */
  courseMap: 'course-map',
  /** 课程学习页 */
  lesson: 'lesson',
  /** 奖励中心 */
  rewards: 'rewards',
  /** 我的成长 */
  growth: 'growth',
  /** 家长中心（与儿童端完全分开） */
  parent: 'parent',
  parentReport: 'parent-report',
  parentSettings: 'parent-settings',
  notFound: 'not-found',
} as const

export type RouteName = (typeof ROUTE_NAMES)[keyof typeof ROUTE_NAMES]
