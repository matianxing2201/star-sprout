/**
 * 路由名称常量
 * ============
 *
 * 页面之间一律用名称跳转，不允许在组件里手写路径字符串。
 * 路径将来要改（例如加上 /kid 前缀），只改 routes.ts 一处。
 */
export const ROUTE_NAMES = {
  /** 首页 / 学习世界 */
  home: "home",
  /** 年级选择（成长阶梯） */
  grades: "grades",
  /** 幼小衔接知识地图 */
  readiness: "readiness",
  /** 学习领域（二级分类） */
  categories: "categories",
  /** 学科题库 */
  questionBank: "question-bank",
  /** 一年级上册数学大纲 */
  mathOutline: "math-outline",
  /** 一年级上册数学练习题 */
  mathQuestion: "math-question",
  /** 仅开发环境：第二单元单题样例 */
  mathUnitTwoSample: "math-unit-two-sample",
  /** 一年级上册数学第二单元互动练习 */
  mathUnitTwoPractice: "math-unit-two-practice",
  /** 课程地图（主题路径） */
  courseMap: "course-map",
  /** 课程学习页 */
  lesson: "lesson",
  /** 奖励中心 */
  rewards: "rewards",
  /** 我的成长 */
  growth: "growth",
  /** 家长中心（与儿童端完全分开） */
  parent: "parent",
  parentReport: "parent-report",
  parentSettings: "parent-settings",
  /** 仅开发环境：图标词汇表总览，供内容作者挑图标名 */
  iconGallery: "icon-gallery",
  notFound: "not-found",
} as const;

export type RouteName = (typeof ROUTE_NAMES)[keyof typeof ROUTE_NAMES];
