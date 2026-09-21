# 总体架构

> 面向 4–12 岁儿童的「一站式自主学习 Web App」。
> 目标不是「课程列表 + 视频 + 题目」，而是一张**可以逛、可以点、可以自己决定去哪**的学习世界。

本文回答三个问题：**分成哪些层、每层负责什么、新东西应该加在哪里。**

---

## 一、信息架构

```
儿童端（游戏化、少文字）                        家长端（数据、分析）
├── 学习世界（首页）                            └── /parent
│   ├── 当前角色 · 当前年级 · 今日状态                ├── 总览：学习时间 / 课程 / 正确率 / 连续天数
│   ├── 今日任务（下一步推荐）                        ├── 学习报告：掌握度表 · 学习记录 · 内容自检
│   └── 学习地图（可点击、有雾气、有隐藏区域）          └── 设置：档案 · 内容规模 · 数据管理
├── 成长阶梯（年级选择）
├── 学习领域（二级分类）
├── 课程地图（学习主题 → 课程）
├── 课程学习页（角色 + 场景 + 知识 + 互动）
├── 奖励中心（星星 · 徽章 · 角色伙伴 · 已探索区域）
└── 我的成长（足迹 · 掌握度 · 探索进度）
```

### 内容层级（数据模型，而不是页面结构）

```
年级 Grade（中班 → 六年级，8 个，顺序锁定）
  └── 领域 Category（二级分类：语言表达 / 数学启蒙 / 语文 / 信息科技……）
        └── 主题 Topic（学习主题：《春晓》、图形宝宝找家、20 以内减法……）
              └── 课程 Lesson（一次探索，5~10 分钟）
                    └── 学习任务 LearningTask（1~3 分钟一步）
                          └── 互动 InteractionSpec（点击 / 拖拽 / 连线 / 涂色 / 实验……）
```

还有一层**跨学科的学习世界 LearningWorld**（阅读森林 · 数学城堡 · 科学实验室 · 创意工坊 · 编程世界……），
它不替代学科，而是给孩子一张「地方」的地图；每个领域通过 `tone` 或显式声明归属到某个世界。

---

## 二、分层与依赖方向

```
                         ┌─────────────────────────────┐
   app / pages           │  装配与编排（薄）            │  main.ts · router · layouts · pages
                         └──────────────┬──────────────┘
                                        │ 只能向下依赖
                         ┌──────────────▼──────────────┐
   features / ui         │  视图（业务组件 / 设计系统）  │  组件只渲染，不做业务判断
                         └──────────────┬──────────────┘
                                        │
                         ┌──────────────▼──────────────┐
   stores                │  应用状态（Pinia）           │  唯一同时接触仓储与界面的层
                         └──────────────┬──────────────┘
                                        │
                         ┌──────────────▼──────────────┐
   data                  │  仓储：端口 ports + 适配器    │  换数据来源只改这一层
                         └──────────────┬──────────────┘
                                        │
                         ┌──────────────▼──────────────┐
   content               │  内容包（纯数据）             │  教案落地的地方
                         └──────────────┬──────────────┘
                                        │
                         ┌──────────────▼──────────────┐
   domain                │  领域模型与纯规则             │  零依赖、可单测
                         └─────────────────────────────┘
```

**硬性约定：依赖只能向下，不能向上，也不能跨层回头。**
`domain` 不 import Vue，`ui/` 不认识课程，`pages/` 不直接调用仓储 —— 这些约束让每一层都能独立替换与测试。

### 目录对照

| 目录 | 职责 | 不该出现的东西 |
| --- | --- | --- |
| `src/domain/` | 领域语言：年级 / 领域 / 主题 / 课程 / 任务 / 互动 / 成长 / 进度规则，以及**语义图标词汇表**（`shared/icons.ts`） | Vue、浏览器 API、存储、任何具体课程数据 |
| `src/content/` | 内容包：目录数据、示例课程、学习世界、学习地图、徽章、zod 校验 | 组件、样式、业务判断 |
| `src/data/` | 端口（`CatalogRepository` / `ProgressRepository` / `ProfileRepository`）与本地适配器 | 组件、路由 |
| `src/stores/` | Pinia：`profile` · `catalog` · `progress` · `feedback` | 直接操作 DOM、样式 |
| `src/features/` | 业务组件模块：`mascot` · `grade-switcher` · `world-map` · `category-grid` · `lesson-path` · `lesson-player` · `interactions` · `reward` | 直接读写仓储 |
| `src/ui/` | 设计系统：`KButton` `KCard` `KTag` `KProgress` `KModal` `KEmptyState` `KSectionTitle` `KStatTile` `KConfetti` `KStarBurst`，以及图标层 `icons/`（`KIcon` · `KIconTile` · `KVisual` + 词汇表映射） | 任何课程概念；图标之外的业务语义 |
| `src/app/` | 装配：`main.ts` · `router/` · `layouts/` · `plugins/` | 业务逻辑 |
| `src/pages/` | 页面：只做数据编排与区块拼装 | 复杂逻辑（放 composable 或 store） |
| `src/composables/` | 可复用逻辑：`useLessonSession` · `useInteraction` · `usePointerDrag` · `useMotion` · `useFocusTrap` | 具体某节课的硬编码 |
| `src/shared/` | 通用工具：`cn` · `storage` · `assertNever` | 业务概念 |
| `src/styles/` | 设计令牌 · 基础层 · 动画组合层 | 组件样式 |

---

## 三、关键设计决策

### 1. 内容与界面彻底解耦

课程页、播放器、课程地图都不包含任何具体课程。
一份教案进来，只做一件事：在 `src/content/grades/<年级>/` 下加数据。
**页面、路由、组件、样式一行都不用改。** 见 [`content-model.md`](./content-model.md)。

### 2. 互动是注册表，不是 if-else

`InteractionSpec` 是判别联合：内容声明 `kind` + `payload`，视图通过注册表把 `kind` 解析成组件。
新增一种玩法 = 加一个 payload 类型 + 注册一个组件。见 [`interaction-framework.md`](./interaction-framework.md)。

### 3. 学习记录是唯一事实来源

`ProgressSnapshot`（作答 + 完成记录）持久化；星星、能量、连续天数、掌握度、徽章全部**推导**出来
（`deriveGrowthState` / `buildTopicProgressMap` / `computeMastery`）。
因此家长端与儿童端看到的数字永远一致，也不会出现「本地存储被改坏以后成长数据错乱」。

### 4. 反馈分级是结构性约束，不是页面自觉

页面不允许自己写奖励动效。任何反馈都调 `feedback.celebrate(tier)`，
强度 / 星星数 / 是否撒彩纸由 `REWARD_TIERS` 决定。见 [`design-system.md`](./design-system.md)。

### 5. 换数据来源只改两行

`src/data/index.ts` 是唯一的组合点：

```ts
export const catalogRepository = createLocalCatalogRepository(contentPack)
export const progressRepository = createLocalStorageProgressRepository()
```

将来接后台 CMS / 账号体系，新增 adapter 换掉这两行即可，store 与页面不受影响。

---

## 四、质量闸门

| 命令 | 作用 |
| --- | --- |
| `pnpm dev` | 本地开发服务器 |
| `pnpm typecheck` | `vue-tsc --noEmit`，严格模式，含 `.vue` 模板 |
| `pnpm lint` | `@antfu/eslint-config`（Vue + TS + 一致性风格） |
| `pnpm test` | Vitest：领域规则、内容包契约、课程会话链路 |
| `pnpm build` | 类型检查 + 生产构建 |

测试覆盖的三条关键链路：

- `src/ui/icons/icons.spec.ts` —— 图标词汇表完整性、领域图标不撞图、结构性内容不退回 emoji
- `src/domain/learning/progress.spec.ts` —— 连续天数、解锁链、掌握度、薄弱点、推荐
- `src/domain/growth/rewards.spec.ts` —— 奖励分级单调性、等级、徽章规则、日期
- `src/content/content.spec.ts` —— 内容包 schema + 引用完整性 + 「课程一定有引入与奖励」
- `src/composables/useLessonSession.spec.ts` —— 教案 → 会话 → 进度 → 成长的端到端

---

## 五、已知边界（第一版有意留白）

- **没有账号体系**：档案与进度存在本机浏览器（纯前端，可直接部署静态站点）。
- **家长端只读**：不做家长布置任务、不做多孩子切换。
- **只做了示例课程**：中班 3 节 + 一年级 1 节，用来验证链路；其余主题等教案。
- **未做音频**：`Mascot.voice`、奖励音效预留了字段，但没有接入音频资源。
- **未做离线**：没有 Service Worker。
