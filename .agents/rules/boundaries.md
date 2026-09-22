# 边界规范 · 分层 / 命名 / 组合 / 隔离

> 对应 `docs/standards.md` §2 与 §10。改目录结构、加模块、加存储键前必读。

## 1. 依赖方向

```
domain  ←  content  ←  data  ←  stores  ←  features / ui  ←  pages  ←  app
```

**只能向左（向下），反向一律禁止。** 层内不得跨模块绕路。

| 层 | 目录 | 允许依赖 | 禁止出现 |
| --- | --- | --- | --- |
| 领域 | `src/domain/` | 无（纯 TS） | Vue、浏览器 API、存储实现、`@/data` |
| 内容 | `src/content/` | `domain` | Vue、存储、`@/stores` |
| 数据 | `src/data/` | `domain`、`content` | Vue、组件 |
| 状态 | `src/stores/` | `domain`、`content`、`data` | 组件、页面 |
| 能力 / UI | `src/features/`、`src/ui/` | 上述所有 | `pages`、`app` |
| 页面 | `src/pages/` | 上述所有 | `app` |
| 应用 | `src/app/` | 全部 | — |

- `domain` 是**纯 TypeScript**：不依赖 Vue、不依赖浏览器 API、不依赖任何存储实现。
- 儿童端与家长端共用同一套 domain / data / stores，只在 `pages/kid` 与 `pages/parent` 分岔。
- **工艺底线两端共用，视觉语言按受众分层决策。**

## 2. 唯一组合点

`src/data/index.ts` 是应用**唯一**把「端口」接上「实现」的地方。

- 换数据源（例如接服务端）**只改这三行**；store / 组件 / 页面不受影响。
- 端口定义在 `src/data/ports/`，实现放在 `src/data/adapters/`。
- **禁止**在 store 或组件里 `new` 一个仓储，或直接读 `localStorage`。

## 3. 命名约定

| 对象 | 约定 | 例 |
| --- | --- | --- |
| 组件文件 | `PascalCase.vue`；模板里也用 PascalCase | `KIconTile.vue` → `<KIconTile />` |
| UI 基础组件 | `K` 前缀 | `KButton` `KCard` `KIcon` |
| 领域类型 / 常量 | 类型 `PascalCase`、常量 `SCREAMING_SNAKE` | `InteractionSpec`、`REWARD_TIERS` |
| 组合式函数 | `useXxx` | `useInteraction` `useLessonSession` |
| 页面 | `XxxPage.vue`；路由名集中在 `route-names.ts` | `CourseMapPage.vue` |
| 本地存储键 | 前缀 `kids-world:`（`shared/utils/storage.ts` 的 `NAMESPACE`） | `kids-world:progress` |

## 4. 判别联合 + 注册表

产品里所有「有多种形态的东西」都用**判别联合**表达，用**注册表**把 key 映射到实现：

- `InteractionSpec` 按 `kind` 判别 → `features/interactions/registry.ts` → 13 个组件
- 图标按语义名 `AppIconName` → `ui/icons/registry.ts` → 矢量图标

**新增一种形态 = 加一个 payload 类型 + 注册一个实现，不改调用方。**

## 5. 隔离与安全

### 原型面物理隔离

`src/prototypes/` 是探索视觉方向的沙盒，**必须**同时满足两条：

1. 只通过**动态导入**引用 → 生产构建里不会有它的 chunk
2. 被 `import.meta.env.DEV` 门控 → 该常量在生产为 `false`，整段被摇掉

`design-contract.spec.ts` 还做**反向断言**（原型必须真被引用），防止契约空转。
原型渲染在**既有首页路由**上、用 `?variant=` 切换；不带 `?variant=` 时首页行为一字不变。

原型硬约束：不碰生产层、满足工艺底线、不进生产包。

### 数据

- 所有本地存储键必须走 `shared/utils/storage.ts` 的命名空间，**禁止裸 `localStorage.setItem('xxx')`**。
- `kids-world` 视为**协议**，不可改名。
- 无服务端，因此**不收集、不上传任何儿童数据**。
