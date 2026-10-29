# 星芽 StarSprout

> 儿童年级课程大纲 —— 按年级浏览学科分类、学习重点与能力范围。

**星芽 StarSprout** · 4–12 岁年级课程大纲。

按年级查看学科目录、学习重点与能力范围。当前版本只保留大纲，不提供练习题、互动课程或挑战任务。

技术栈：**Vue 3.5 · TypeScript（strict）· Vite 8 · Tailwind CSS 4 · Pinia · Vue Router · Vitest**，纯前端，可直接部署为静态站点。

---

## 快速开始

```bash
pnpm install
pnpm dev          # http://localhost:5173
```

| 命令                          | 说明                                 |
| ----------------------------- | ------------------------------------ |
| `pnpm dev`                    | 本地开发                             |
| `pnpm build`                  | 类型检查 + 生产构建                  |
| `pnpm preview`                | 预览构建产物                         |
| `pnpm typecheck`              | `vue-tsc --noEmit`（含 `.vue` 模板） |
| `pnpm lint` / `pnpm lint:fix` | ESLint（@antfu/eslint-config）       |
| `pnpm test`                   | Vitest 单测                          |

---

## 现在能玩到什么

| 入口                          | 内容                                                                   |
| ----------------------------- | ---------------------------------------------------------------------- |
| `/` / `/grades`    | 年级大纲：选择中班至六年级，查看年级概览与学科分类 |
| `/learn/:gradeId` | 学科大纲：查看该年级各学科的学习重点与能力范围    |

---

## 目录结构

```
src/
├── domain/         领域模型与纯规则（零依赖、可单测）
│   ├── catalog/    年级 · 领域 · 主题 · 知识点
│   ├── lesson/     课程 · 学习任务（六段式节奏）
│   ├── interaction/互动类型与 payload（12 种）
│   ├── learning/   学习记录 · 进度推导 · 掌握度 · 推荐
│   ├── growth/     星星 · 能量 · 徽章 · 等级 · 奖励分级
│   ├── mascot/     角色系统
│   └── world/      学习世界与学习地图
├── content/        内容包（纯数据）：8 个年级的领域目录 + 示例课程 + 世界 + 地图 + 徽章
├── data/           仓储：端口 ports + 本地适配器 adapters ← 换数据来源只改这里
├── stores/         Pinia：profile · catalog · progress · feedback
├── features/       业务组件：mascot · grade-switcher · world-map · category-grid
│                   · lesson-path · lesson-player · interactions · reward
├── ui/             设计系统：KButton · KCard · KTag · KProgress · KModal …
├── composables/    useLessonSession · useMotion · useFocusTrap
├── app/            main.ts · router · layouts
├── pages/          kid（7 页）· parent（3 页）
├── styles/         设计令牌 · 基础层 · 动画组合层
└── prototypes/     一次性原型：首页视觉方向探索（只在开发环境、不进入生产构建）
```

**依赖方向只能向下**：`domain ← content ← data ← stores ← features/ui ← pages ← app`。

`prototypes/` 是**临时的**：它只被 `pages/` 通过动态导入引用，且门控在 `import.meta.env.DEV` 之下，
所以生产构建里连 chunk 都不会生成。方向选定后整个目录会被删掉 —— 详见它的 `README.md`。

---

## 部署

项目通过 GitHub Actions 自动发布到 GitHub Pages。推送到 `main` 分支或在 Actions 页面手动运行 **Deploy to GitHub Pages** 工作流即可触发构建和部署。构建会生成单页应用回退页面，直接访问或刷新站内子路由也能正常打开。

首次启用时，在 GitHub 仓库 **Settings → Pages → Build and deployment** 中将 **Source** 设为 **GitHub Actions**。后续部署状态和访问地址可在 Actions 工作流运行结果及 Pages 设置页查看。无需配置部署密钥。
