# 学习世界 · 儿童一站式自主学习 Web App

> 让孩子因为**好玩**进入，因为**探索**留下，因为**成长**持续学习。

不是「课程列表 + 视频 + 题目」，而是一张可以逛、可以点、可以自己决定去哪的**学习世界**：
角色陪着孩子，地图上藏着没解锁的地方，每个知识点都被做成了可以动手的小任务。

技术栈：**Vue 3.5 · TypeScript（strict）· Vite 8 · Tailwind CSS 4 · Pinia · Vue Router · Vitest**，纯前端，可直接部署为静态站点。

---

## 快速开始

```bash
pnpm install
pnpm dev          # http://localhost:5173
```

| 命令 | 说明 |
| --- | --- |
| `pnpm dev` | 本地开发 |
| `pnpm build` | 类型检查 + 生产构建 |
| `pnpm preview` | 预览构建产物 |
| `pnpm typecheck` | `vue-tsc --noEmit`（含 `.vue` 模板） |
| `pnpm lint` / `pnpm lint:fix` | ESLint（@antfu/eslint-config） |
| `pnpm test` | Vitest 单测 |

---

## 现在能玩到什么

| 入口 | 内容 |
| --- | --- |
| `/` | 学习世界：角色问候 · 今日状态 · 今日任务 · 可点击的学习地图 · 最近课程 |
| `/grades` | 成长阶梯：中班 → 六年级，看得见「我在哪、下一阶段有什么」 |
| `/learn/:gradeId` | 学习领域：该年级的全部二级分类 + 地图入口 |
| `/learn/:gradeId/:categoryId` | 课程地图：学习主题串成一条路，含挑战 / 隐藏节点 |
| `/lesson/:lessonId` | 课程学习页：角色引入 → 知识发现 → 动手探索 → 练习 → 挑战 → 奖励 |
| `/rewards` | 奖励中心：星星 · 徽章墙 · 角色伙伴 · 已探索区域 |
| `/growth` | 我的成长：学习足迹 · 掌握度 · 探索进度 |
| `/parent` | 家长中心：总览 · 学习报告 · 设置 |

**已可玩的示例课程**（用来验证「教案 → 可玩课程」的完整链路）：

- 中班 · 语言表达 ·《春晓》
- 中班 · 数学启蒙 · 图形宝宝找家
- 中班 · 科学探索 · 冰去哪儿了？
- 一年级 · 数学 · 小兔子收胡萝卜

其余主题与课程等教案 —— 加数据即可，**不需要改任何页面、组件或样式**。

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
└── styles/         设计令牌 · 基础层 · 动画组合层
```

**依赖方向只能向下**：`domain ← content ← data ← stores ← features/ui ← pages ← app`。

---

## 文档

| 文档 | 内容 |
| --- | --- |
| [`docs/architecture.md`](./docs/architecture.md) | 信息架构、分层与依赖方向、关键设计决策、质量闸门 |
| [`docs/content-model.md`](./docs/content-model.md) | 课程数据模型，以及**如何把一份教案变成可玩课程**（四步） |
| [`docs/design-system.md`](./docs/design-system.md) | 儿童视觉体系 · 动效体系 · 奖励分级 · 角色系统 |
| [`docs/interaction-framework.md`](./docs/interaction-framework.md) | 交互框架：12 种互动、温柔反馈规则、**如何新增一种互动** |
| [`docs/propmt.md`](./docs/propmt.md) | 原始产品需求 |

课程模板：[`src/content/templates/lesson.template.ts`](./src/content/templates/lesson.template.ts)（参与类型检查，复制即用）。

---

## 三个值得一看的设计

**1. 内容与界面彻底解耦。** 课程页里没有任何一门具体课程。一份教案进来，只往
`src/content/grades/<年级>/` 加数据，页面/路由/组件/样式一行不动。

**2. 互动是一张注册表。** 内容声明 `kind` + `payload`，视图把它们解析成组件。
新增玩法 = 加一个类型 + 注册一行；判定、提示、星星、动效全部由统一外壳负责 ——
所以「答错不出现红叉」「奖励不得过度」这类要求全站只有一处实现。

**3. 学习记录是唯一事实来源。** 星星、能量、连续天数、掌握度、徽章都由原始记录**推导**，
家长端与儿童端看到的数字永远一致，本地存储损坏也不会让成长数据错乱。

---

## 数据与隐私

第一版**没有账号体系**：孩子档案与学习记录只保存在本机浏览器（`localStorage`），不上传任何数据。
家长中心提供「清空学习记录」与「重置档案」，均需二次确认。

要接入账号与跨设备同步时：实现一个新的 `ProgressRepository`，替换
`src/data/index.ts` 里的两行即可 —— store 与页面不受影响。
