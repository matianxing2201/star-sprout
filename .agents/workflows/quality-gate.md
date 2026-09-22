# 质量闸门 · 提交前做什么

> 对应 `docs/standards.md` §11–§14。每次收工前过一遍。

## 1. 四道闸门（合并前必须全绿）

```bash
pnpm typecheck   # vue-tsc --build
pnpm lint        # 或 pnpm lint:fix
pnpm test        # Vitest (jsdom)
pnpm build       # vue-tsc --build && vite build
```

## 2. 按改动类型该跑什么

| 改了什么 | typecheck | lint | test | build | 额外 |
| --- | --- | --- | --- | --- | --- |
| 内容 / 课程（`content/grades/**`） | ✓ | — | ✓ 必跑 | — | 内容契约会拦引用 / 六段式 / 泄题 |
| 新互动类型 | ✓ | ✓ | ✓ | — | 契约测试校验 registry 完整性 |
| 新增色调 / 领域 | ✓ | — | ✓ | — | `tokens.spec.ts` 校验三件套 |
| 视觉 / 动效 | ✓ | ✓ | ✓ 必跑 | — | 先读 `design-contract.spec.ts` |
| 样式文件结构（新增 / 改引入顺序） | — | ✓ | ✓ 必跑 | ✓ | **必须同步 `layers.spec.ts` 的引入顺序断言** |
| 图标词汇表 | ✓ | — | ✓ | — | 跑 `pnpm icons:sync` |
| 依赖 / 构建配置 | ✓ | — | ✓ | ✓ 必跑 | — |

## 3. 一致性清单（改任何组件前过一遍）

- [ ] 结构性图形用了 `KIcon` / `KIconTile`，而不是 emoji 或裸字符（`→` `✓` `⭐`）？
- [ ] 颜色来自令牌，而不是十六进制硬编码？
- [ ] 领域相关元素用 `toneVars(tone)`，而不是写死某个领域的颜色？
- [ ] 可点元素有 `fx-tap` / `fx-pressable`，并有 `hover → press` 两态？
- [ ] 没有用红色或 ✕ 表达「错误」？（换成 `gently` + 温柔文案）
- [ ] 空状态说人话？（「还没有…，我们一起去找找」，而不是「暂无数据」）
- [ ] 奖励走了 `feedback.celebrate(tier)`，而不是自己写动画？
- [ ] 键盘可操作？焦点环可见？装饰性图标 / emoji 是否 `aria-hidden`？
- [ ] 图标走 `KIcon` 的固定尺寸阶梯，而不是靠字号撑大小？
- [ ] 动效 < 300ms、无 `ease-in`、只动 transform/opacity、无新增常驻循环（角色除外）？

## 4. 文档同步义务

| 改了什么 | 同步哪份 |
| --- | --- |
| 结构性决策 / 分层 / 契约 | `.agents/AGENTS.md` + `docs/standards.md` |
| 引入新术语 | `CONTEXT.md` |
| 目录 / 分层 | `docs/architecture.md` + 本目录 `rules/boundaries.md` |
| 内容模型 / 红线 | `docs/content-model.md` + 本目录 `rules/content.md` |
| 新增互动 | `docs/interaction-framework.md` + 本目录 `rules/interaction.md` |
| 视觉 / 动效 / 令牌 | `docs/design-system.md` + 本目录 `rules/craft.md` |

**留下与实现不符的旧文档，比没有文档更糟。**

## 5. 部署（备查）

- 目标 Cloudflare Workers（静态资源），配置在 `wrangler.jsonc`
  （`assets.directory: ./dist` + `not_found_handling: "single-page-application"` 做 SPA 回退）
- CI/CD：Workers Builds 接 Git，**push 到 `main` 自动构建部署**，无需手动 wrangler
- 构建脚本 `pnpm build`；Node `>= 20.19.0`（Builds 侧 `NODE_VERSION=22`）
- 字体经 Google Fonts 外链加载（`index.html` 的 preconnect + stylesheet），**不启用自托管**
