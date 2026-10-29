import type { RouteRecordRaw } from "vue-router";

import KidLayout from "@/app/layouts/KidLayout.vue";
import { ROUTE_NAMES } from "./route-names";

/**
 * 当前只保留年级大纲入口和学科分类大纲。
 */
export const routes: RouteRecordRaw[] = [
  {
    path: "/",
    component: KidLayout,
    children: [
      {
        path: "",
        name: ROUTE_NAMES.home,
        redirect: { name: ROUTE_NAMES.grades },
      },
      {
        path: "grades",
        name: ROUTE_NAMES.grades,
        component: async () => import("@/pages/kid/GradesPage.vue"),
        meta: { title: "年级大纲" },
      },
      {
        path: "learn/:gradeId",
        name: ROUTE_NAMES.categories,
        component: async () => import("@/pages/kid/CategoriesPage.vue"),
        meta: { title: "学科大纲" },
      },
      {
        path: "learn/:gradeId/:categoryId/question/:questionId",
        name: ROUTE_NAMES.mathQuestion,
        component: async () => import("@/pages/kid/MathQuestionPage.vue"),
        meta: { title: "数学小练习" },
      },
      {
        path: "learn/:gradeId/:categoryId/outline",
        name: ROUTE_NAMES.mathOutline,
        component: async () => import("@/pages/kid/MathOutlinePage.vue"),
        meta: { title: "一年级上册数学大纲" },
      },
      {
        path: "learn/:gradeId/:categoryId",
        name: ROUTE_NAMES.questionBank,
        component: async () =>
          import("@/pages/kid/ChineseQuestionBankPage.vue"),
        meta: { title: "一年级上册语文" },
      },
    ],
  },

  {
    path: "/:pathMatch(.*)*",
    name: ROUTE_NAMES.notFound,
    component: async () => import("@/pages/NotFoundPage.vue"),
    meta: { title: "走丢了" },
  },
];

/**
 * 开发期专用路由。
 * 图标词汇表是封闭的 —— 内容作者必须从固定列表里挑名字，所以需要一个能
 * 「看着图挑名字」的地方。它只在 DEV 注册，生产构建里不存在这条路由。
 */
if (import.meta.env.DEV) {
  routes.push({
    path: "/dev/icons",
    name: ROUTE_NAMES.iconGallery,
    component: async () => import("@/pages/dev/IconGalleryPage.vue"),
    meta: { title: "图标总览" },
  });
}
