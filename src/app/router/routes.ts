import type { RouteRecordRaw } from 'vue-router'

import KidLayout from '@/app/layouts/KidLayout.vue'
import ParentLayout from '@/app/layouts/ParentLayout.vue'
import { ROUTE_NAMES } from './route-names'

/**
 * 页面结构（对应产品需求第三十节）
 * ==============================
 *
 * 儿童端 7 个页面 + 家长端独立入口：
 *   首页/学习世界 · 年级选择 · 学习领域 · 课程地图 · 课程学习页 · 奖励中心 · 我的成长 · 家长中心
 *
 * 所有页面都懒加载：孩子第一次打开时只需要下载首页那一个 chunk。
 */
export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: KidLayout,
    children: [
      {
        path: '',
        name: ROUTE_NAMES.home,
        component: async () => import('@/pages/kid/HomePage.vue'),
        meta: { title: '学习世界' },
      },
      {
        path: 'grades',
        name: ROUTE_NAMES.grades,
        component: async () => import('@/pages/kid/GradesPage.vue'),
        meta: { title: '成长阶梯' },
      },
      {
        path: 'learn/:gradeId',
        name: ROUTE_NAMES.categories,
        component: async () => import('@/pages/kid/CategoriesPage.vue'),
        meta: { title: '学习领域' },
      },
      {
        path: 'learn/:gradeId/:categoryId',
        name: ROUTE_NAMES.courseMap,
        component: async () => import('@/pages/kid/CourseMapPage.vue'),
        meta: { title: '课程地图' },
      },
      {
        path: 'rewards',
        name: ROUTE_NAMES.rewards,
        component: async () => import('@/pages/kid/RewardsPage.vue'),
        meta: { title: '奖励中心' },
      },
      {
        path: 'growth',
        name: ROUTE_NAMES.growth,
        component: async () => import('@/pages/kid/GrowthPage.vue'),
        meta: { title: '我的成长' },
      },
    ],
  },

  {
    // 课程学习页单独一层布局：进去之后只剩下“角色 + 场景 + 知识 + 互动”，
    // 顶部导航必须消失，否则孩子的注意力会被“下一步去哪”分散。
    path: '/lesson/:lessonId',
    name: ROUTE_NAMES.lesson,
    component: async () => import('@/pages/kid/LessonPage.vue'),
    meta: { title: '探索中' },
  },

  {
    path: '/parent',
    component: ParentLayout,
    children: [
      {
        path: '',
        name: ROUTE_NAMES.parent,
        component: async () => import('@/pages/parent/ParentHomePage.vue'),
        meta: { title: '家长中心' },
      },
      {
        path: 'report',
        name: ROUTE_NAMES.parentReport,
        component: async () => import('@/pages/parent/ParentReportPage.vue'),
        meta: { title: '学习报告' },
      },
      {
        path: 'settings',
        name: ROUTE_NAMES.parentSettings,
        component: async () => import('@/pages/parent/ParentSettingsPage.vue'),
        meta: { title: '设置' },
      },
    ],
  },

  {
    path: '/:pathMatch(.*)*',
    name: ROUTE_NAMES.notFound,
    component: async () => import('@/pages/NotFoundPage.vue'),
    meta: { title: '走丢了' },
  },
]

/**
 * 开发期专用路由。
 * 图标词汇表是封闭的 —— 内容作者必须从固定列表里挑名字，所以需要一个能
 * 「看着图挑名字」的地方。它只在 DEV 注册，生产构建里不存在这条路由。
 */
if (import.meta.env.DEV) {
  routes.push({
    path: '/dev/icons',
    name: ROUTE_NAMES.iconGallery,
    component: async () => import('@/pages/dev/IconGalleryPage.vue'),
    meta: { title: '图标总览' },
  })
}
