# 星芽 StarSprout

> 儿童一站式自主学习 Web App —— 让孩子因为**好玩**进入，因为**探索**留下，因为**成长**持续学习。

**星芽 StarSprout** · 4–12 岁自主探索学习空间。

不是「课程列表 + 视频 + 题目」，而是一张可以逛、可以点、可以自己决定去哪的**学习世界**：
角色陪着孩子，地图上藏着没解锁的地方，每个知识点都被做成了可以动手的小任务。

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
| `pnpm fonts:sync`             | 重新生成自托管字体子集               |
| `pnpm icons:sync`             | 重新生成图标常量                     |

> **字体自托管**：展示字体放在 `src/assets/fonts/`，由 `pnpm fonts:sync` 从字体源拉取并**按源码实际用字裁剪**成 woff2 子集——不依赖 Google Fonts CDN（国内不可达，会拖慢首屏）。新增文案若引入全新汉字，重跑一次 `pnpm fonts:sync` 即可纳入子集；只有默认的拉丁数字字体（Baloo 2）无需重跑。中文正文刻意不用网络字体，直接走系统字体栈。

---

## 现在能玩到什么

| 入口                          | 内容                                                                   |
| ----------------------------- | ---------------------------------------------------------------------- |
| `/`                           | 学习世界：角色问候 · 今日状态 · 今日任务 · 可点击的学习地图 · 最近课程 |
| `/grades`                     | 成长阶梯：中班 → 六年级，看得见「我在哪、下一阶段有什么」              |
| `/learn/:gradeId`             | 学习领域：该年级的全部二级分类 + 地图入口                              |
| `/learn/:gradeId/:categoryId` | 课程地图：学习主题串成一条路，含挑战 / 隐藏节点                        |
| `/lesson/:lessonId`           | 课程学习页：角色引入 → 知识发现 → 动手探索 → 练习 → 挑战 → 奖励        |
| `/rewards`                    | 奖励中心：星星 · 徽章墙 · 角色伙伴 · 已探索区域                        |
| `/growth`                     | 我的成长：学习足迹 · 掌握度 · 探索进度                                 |
| `/parent`                     | 家长中心：总览 · 学习报告 · 设置                                       |

**已可玩的示例课程**（用来验证「教案 → 可玩课程」的完整链路）：

- 中班 · 语言表达 ·《春晓》
- 中班 · 数学启蒙 · 图形宝宝找家
- 中班 · 语言表达 · 量词小魔法师（盖印章 + 拖拽归类 + 连线，全程无选择题）
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

## 部署

线上地址：<https://starsprout.njldgq.workers.dev>

纯静态站点，构建产物 `dist/` 由 Cloudflare Workers 托管，配置见 [wrangler.jsonc](./wrangler.jsonc) —— 启用了 `single-page-application` 回退，直接访问或刷新子路由不会 404。

### 自动发布

仓库接入 Cloudflare Workers Builds，push 到 `main` 自动构建并部署，开 PR 会自动生成预览地址。

在 Cloudflare Dashboard → **Workers & Pages** → `starsprout` → **Settings** → **Builds** 连接本仓库，构建配置：

| 配置项   | 值                    |
| -------- | --------------------- |
| 生产分支 | `main`                |
| 构建命令 | `pnpm build`          |
| 部署命令 | `npx wrangler deploy` |
| 环境变量 | `NODE_VERSION=22`     |

> `NODE_VERSION` 必须显式指定，构建镜像的默认 Node 版本可能低于 `engines` 要求的 `>=20.19.0`。

### 手动发布

```bash
pnpm build
CLOUDFLARE_API_TOKEN=xxx npx wrangler deploy
```

Token 在 Cloudflare Dashboard → **My Profile** → **API Tokens** 创建（Custom token），权限需要：

| 类型    | 权限                    |
| ------- | ----------------------- |
| Account | Workers Scripts → Edit  |
| Account | Account Settings → Read |

后期接数据库 / KV / 对象存储时，再补 `D1 → Edit`、`Workers KV Storage → Edit`、`R2 → Edit`。
