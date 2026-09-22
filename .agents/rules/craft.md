# 视觉与工艺规范 · 令牌 / 色调 / 图标 / 动效底线

> 对应 `docs/standards.md` §7–§8 与 `docs/design-system.md`。
> **改任何视觉或动效之前，先读 `src/styles/design-contract.spec.ts`** —— 它会拦你。

## 1. 「设计风格」拆成三层，只有一层是主观的

| 层 | 内容 | 性质 |
| --- | --- | --- |
| **动效工艺** MotionCraft | 缓动、时长、回弹幅度、按压反馈、入场起点、循环有无 | **质量，有客观对错** |
| **细节工艺** DetailCraft | 阴影层次、描边取舍、弹层 origin、`:active` 物理反馈 | **质量，有客观对错** |
| **视觉语言** VisualLanguage | 颜色、描边、阴影、圆角、密度、插画感 | **身份，只有取舍** |

前两层全局对齐工艺标准；第三层按受众（儿童端 / 家长端）分别决策。
「排除成人 SaaS Dashboard」约束的是**视觉语言**，不构成对**工艺**的约束。

## 2. 令牌（`src/styles/tokens.css`）

- 必须使用 **`@theme static`**。原因：色调由**运行时** `toneVars()` 决定，
  Tailwind 无法静态得知哪些色彩被用到；非 static 会把未被类引用的 `--color-math` 等裁掉，
  **领域配色会静默失效**。
- 令牌族：字体（display / body / numeric）· 纸张与墨色 · 14 个领域三件套 ·
  6 个成长/反馈三件套 · 圆角（blob 40 / card 28 / tile 22 / chip 999）·
  贴纸式投影（sticker / lift / press / glow）· 缓动 · 时长 · 动画注册。

## 3. 色调

- 每个色调必须是**三件套**：`--color-<tone>` / `-soft` / `-deep`。
- 组件通过 `toneVars(tone)` 拿到 `--tone` / `--tone-soft` / `--tone-deep` / `--tone-line` / `--tone-glow`。
- 14 个领域色调：language · reading · math · science · art · music · think · explore · code ·
  life · social · english · labor · moral
- 6 个强调色：star · energy · badge · success · gently · alert
- **新增一个领域只需在 `tokens.css` 加一组变量，不动任何组件。**
- **`gently`（`#E9A23B`）是「差一点点」的颜色，不是红色。** 产品明确要求不出现红叉与挫败感。

## 4. 图标

```
domain/shared/icons.ts        APP_ICON_NAMES / AppIconName    ← 语义词汇表（内容作者写这个）
ui/icons/registry.ts          AppIconName → { bold, duotone? } ← 唯一依赖图标来源的文件
ui/icons/mappings.ts          TONE_ICONS / TASK_KIND_ICONS …    ← 领域语义 → 图标
ui/icons/KIcon.vue            渲染一枚图标
ui/icons/KIconTile.vue        色调底 + 双色调图标（身份型元素的统一单元）
ui/icons/KVisual.vue          「有 icon 用 icon，否则用 emoji」
pages/dev/IconGalleryPage.vue /dev/icons（仅 DEV）—— 看着图挑名字
```

| 规则 | 说明 |
| --- | --- |
| **结构用图标，场景用 emoji** | 年级/领域/主题/课程/徽章/等级/控件/状态 → `KIcon`；互动场景物件（🐦 🥕 ⚽）与 IP 角色 → emoji |
| 词汇表 ↔ 映射靠 `satisfies Record<AppIconName, Component>` 对齐 | 少一个名字 → **编译期报错** |
| 尺寸钉死像素阶梯 | `xs 14 / sm 16 / md 20 / lg 26 / xl 34 / 2xl 46`，不用 `em` |
| 字重三档三种角色 | `bold` 界面控件 / `duotone` 身份标识 / `fill` 已发生 |
| 回退链 | `fill → duotone → bold`，**永远不会渲染成空白** |
| 无障碍 | 默认 `aria-hidden="true"`；单独承载含义时传 `label` 变 `role="img"` |
| 一屏不撞图 | `icons.spec.ts` 断言同年级领域图标不重复、八级年级图标互不相同、七徽章互不相同 |

**禁止**：用裸字符（`→` `✓` `⭐`）或 emoji 充当结构性图形。

## 5. 动效九条硬约束

`design-contract.spec.ts` 自动拦截。**违反即测试红。**

| # | 约束 |
| --- | --- |
| 1 | 界面动效**一律 < 300ms**（白名单仅 `--duration-celebrate` 900ms 与 0.01ms） |
| 2 | **绝不使用 `ease-in`** —— 入场一律强 ease-out |
| 3 | 回弹过冲在 **0.1~0.3**（1.56 那种大过冲是玩具感，不是质感） |
| 4 | **只动 `transform` 与 `opacity`**（动 `left`/`width`/`padding` 触发重排，动 `box-shadow` 触发重绘） |
| 5 | 每个可点元素有 `:active` 物理反馈（缩放 0.95~0.98） |
| 6 | 入场起点**不低于 `scale(0.9)`**，禁止从 `scale(0)` 出现 |
| 7 | **常驻循环动画只允许出现在角色上**（白名单仅 `features/mascot/` 与 `--animate-breathe`） |
| 8 | 装饰性光斑为 **0**（禁用 `blur-2xl` / `blur-3xl` 与 ≥40px 大模糊做模板化光斑） |
| 9 | 尊重 `prefers-reduced-motion`（走 `useMotion.ts` 的 `prefersReducedMotion()` 统一跳过） |

> 第 7 条的理由：**一直在动是在抢注意力，不是设计。**

## 6. 时长与缓动

```
时长  tap 120 · quick 200 · base 240 · settle 280 · celebrate 900
缓动  --ease-soft    cubic-bezier(.22, 1, .36, 1)     入场/出场强 ease-out
      --ease-bounce  cubic-bezier(.34, 1.26, .64, 1)  弹一下（过冲 0.26）
      --ease-snap    cubic-bezier(.4, 0, .2, 1)       屏上位移与状态切换
```

> `--duration-celebrate`（900ms）指**整段奖励演出**（星星飞入 + 彩纸 + 文案，
> 由多个 < 300ms 的动作串成），**不是单个过渡的时长**。
> 拖沓的动画会让孩子失去「我还想再来一次」的冲动。

## 7. 反馈分级类（`animations.css`，`@layer components`）

| 类 | 用途 |
| --- | --- |
| `fx-tap` | 任何可点元素：悬停浮起 2px，按下沉 1px |
| `fx-pressable` | 卡片 / 选项：悬停放大 3.5% 并轻旋，按下缩到 96% |
| `fx-correct` | 答对：弹一下 + 绿色光环扩散 |
| `fx-gently` | 差一点点：温柔左右摇（**没有红色，没有 ✕**） |
| `fx-stagger` | 列表入场：子元素 30ms 错峰，末位等待 ≤ 240ms |
| `fx-dragging` / `fx-drop-active` | 拖拽中浮起旋转 / 拖放目标高亮描边 |
| `fx-stamp` / `fx-ink` / `fx-spark` / `fx-stamp-ready` | 量词印章：砸下 + 墨迹扩散 + 溅星星；拿起抖一下（**一次性，不循环**） |
| `fx-star-fly` / `fx-confetti` | 星星飞入 / 彩纸 —— **仅高等级奖励使用** |

## 8. 奖励分级（强度由等级决定，页面无权加码）

| 等级 | 触发 | 星星 | 彩纸 | 角色 | 时长 |
| --- | --- | --- | --- | --- | --- |
| `tap` | 普通点击 | 0 | ✗ | ✗ | 160ms |
| `correct` | 答对一次互动 | 1 | ✗ | ✓ | 640ms |
| `task` | 完成一个任务 | 2 | ✗ | ✓ | 900ms |
| `lesson` | 完成一节课 | 5 | ✓ | ✓ | 1400ms |
| `chapter` | 完成一个章节 | 12 | ✓ | ✓ + 屏震 | 1500ms |
| `streak` | 连续学习里程碑 | 8 | ✓ | ✓ | 1500ms |

页面**只能**这样触发，不得自己写动画：

```ts
const feedback = useFeedbackStore()
feedback.celebrate({ tier: 'correct', mascot: 'fox' })
```
