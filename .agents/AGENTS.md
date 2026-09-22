# AGENTS.md · 星芽 StarSprout

面向 4–12 岁的**自主探索学习空间**。纯前端静态站点（Vue 3 · TS strict · Vite · Tailwind v4 · Pinia），
无后端，内容包与学习记录都在浏览器内。

> **权威规范是 `docs/standards.md`（整体规范）。**
> 本目录只放**入口 + 可执行精炼规则**（祈使句、能被检查），理由与背景都在 `docs/` 里。
> 规则没覆盖的情况：先查 `docs/standards.md`，再查对应专题文档。
>
> `docs/` 是本地文档（已 gitignore，不进仓库）；`.agents/` 进仓库，两边分工。

---

## 一、六条铁律

违反这几条会造成**静默退化** —— 页面照常渲染、测试照常通过，只是架构或设计烂掉了。
因此优先记这几条，改对应部分前先回来对一眼。

1. **依赖只能向下**：`domain ← content ← data ← stores ← features/ui ← pages ← app`。反向依赖一律禁止。
2. **颜色只走令牌**：不写十六进制字面量；领域相关颜色用 `toneVars(tone)`，不写死某个领域的颜色。
3. **界面动效 < 300ms**、绝不使用 `ease-in`、只动 `transform` / `opacity`、入场起点不低于 `scale(0.9)`。
4. **常驻循环动画只允许出现在角色上**（`src/features/mascot/`）。图标方块、空状态、光晕、扫光一律不许。
5. **奖励只走 `feedback.celebrate({ tier })`**，页面不得自己写奖励动效 —— 强度由 `REWARD_TIERS` 决定。
6. **存储命名空间 `kids-world` 不可改名** —— 改名等于清空所有已有用户的学习记录。

---

## 二、会拦住你的五组契约测试

这些测试**读源码做断言**，专治「行为测试测不出来的退化」（DOM 挂载正常，只是设计死了）。
不是建议，是闸门 —— 改相关部分前先读对应文件。

| 契约 | 文件 | 守住什么 |
| --- | --- | --- |
| 设计契约 | `src/styles/design-contract.spec.ts` | 常驻循环仅角色 · 动效预算 · 原型面隔离 · 无模板化光斑 |
| 样式层序 | `src/styles/layers.spec.ts` | 全局样式落对层 · 层名合法 · `!important` 仅两处 · 引入顺序 |
| 设计令牌 | `src/styles/tokens.spec.ts` | `@theme static` · 每个色调三件套齐全 · 基础令牌清单 · reduced-motion |
| 内容包 | `src/content/content.spec.ts` | schema + 引用完整性 · 年级齐全 · 六段式 · 内容红线 |
| 图标 | `src/ui/icons/icons.spec.ts` | 词汇表完整 · 同年级不撞图 · 结构性内容不退回 emoji |

> **新增样式文件时，必须同步更新 `layers.spec.ts` 的引入顺序断言**，否则测试会红。

---

## 三、质量闸门

| 命令 | 用途 |
| --- | --- |
| `pnpm typecheck` | `vue-tsc --build`；任何 TS / Vue 改动 |
| `pnpm lint` / `pnpm lint:fix` | ESLint 全量；提交前 |
| `pnpm test` | Vitest（jsdom）；任何改动，内容相关的必跑 |
| `pnpm build` | `vue-tsc --build && vite build`；合并前 / 部署前 |
| `pnpm icons:sync` | 改动图标词汇表后同步产物 |

**合并前四件事全绿：typecheck · lint · test · build。**

---

## 四、工作约定

- 注释、提交信息、文档**统一中文**；注释写「为什么」，不写「做了什么」。
- **不要自行批量生成具体课程内容** —— 具体课程、知识点、教学过程由产品方提供教案。
- 改视觉 / 动效前先读 `design-contract.spec.ts`。
- 不新增冗余抽象：三行相似代码好过一个提前设计的抽象。
- 改了实现就改对应文档；留下与实现不符的旧文档比没有文档更糟。

---

## 五、文档地图

| 文档 | 回答什么 |
| --- | --- |
| `docs/standards.md` | **整体规范**：全部规则与不变量总览（权威） |
| `CONTEXT.md` | 术语唯一定义（星芽 / 学习世界 / 星球 / 三层设计分层） |
| `docs/propmt.md` | 产品需求（原始 PRD，33 节） |
| `docs/architecture.md` | 信息架构、目录职责、依赖图、已知边界 |
| `docs/content-model.md` | 教案 → 课程的转换链路、内容红线 |
| `docs/interaction-framework.md` | 互动三层结构、13 种互动、验收清单 |
| `docs/design-system.md` | 视觉方向、图标、动效、奖励、角色体系 |
| `docs/specs/0001-visual-language-reset.md` | 视觉重建的决策与不变量（含阶段二待办） |

---

## 六、本目录结构

```
.agents/
├── AGENTS.md              入口（本文）：铁律 · 契约 · 闸门 · 约定
├── rules/                 可执行精炼规则
│   ├── boundaries.md      分层依赖 · 命名 · 唯一组合点 · 隔离与安全
│   ├── content.md         内容层级 · 内容包契约 · 红线 · 六段式 · 加课流程
│   ├── interaction.md     互动三层结构 · 13 种 · 共同约束 · 新增流程
│   ├── frontend.md        TS / Vue / 样式 / 注释 规范
│   └── craft.md           令牌 · 色调 · 图标 · 动效底线 · fx-* 类
└── workflows/
    └── quality-gate.md    提交前四闸门 · 按改动类型该跑什么 · 一致性清单
```

**这些规则怎么用**：改哪一层就读哪一份；不确定读哪份就先读 §一 六条铁律，
它们覆盖了最常见的踩坑点。
