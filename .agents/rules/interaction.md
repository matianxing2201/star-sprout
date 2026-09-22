# 互动规范 · 结构 / 契约 / 共同约束 / 新增流程

> 对应 `docs/standards.md` §5 与 `docs/interaction-framework.md`。加玩法、改判定前必读。

## 1. 三层结构

```
类型（domain/interaction）→ 契约（features/interactions/contract.ts）→ 注册表（registry.ts）
                                      ↓
                    外壳 InteractionShell + 状态机 useInteraction + 工具 usePointerDrag
```

- **类型层**：`InteractionSpec` 判别联合，纯数据
- **契约层**：`InteractionComponentProps` / `InteractionComponentEmits`（`solved` / `missed`）
  + `INTERACTION_META`（label / icon / ability）
- **注册表**：`kind` → 组件；`contract.spec.ts` 保证 registry 与 kind 集合一致

## 2. 现有 13 种互动

`choose-one` · `choose-many` · `drag-drop` · `drag-sort` · `connect-line` · `memory-pair` ·
`sequence-build` · `color-fill` · `draw` · `hotspot-explore` · `slider-explore` ·
`tap-target` · `measure-stamp`

## 3. 共同产品约束（违反即视为 bug）

| 约束 | 说明 |
| --- | --- |
| 拖到空白**不算失败** | 只是放回去了，不扣分、不判错 |
| 答错**不清空**已做对的 | 已完成的保持已完成 |
| 提示**答错两次后**才出现 | 不抢在思考前面 |
| 探索类**永不判错** | 观察到什么都是收获 |
| 做对后**不自动跳走** | 孩子自己点「继续」 |
| 可点元素必有 hover → press 两态 | 缩放幅度 0.95~0.98 |

## 4. 新增一种互动（五步）

1. 在 `domain/interaction/types.ts` 加 payload 类型（并入判别联合）
2. 在 `content/schema.ts` 的 `discriminatedUnion` 加校验分支
3. 写组件：继承契约层 props / emits，复用 `useInteraction` / `usePointerDrag` / `InteractionShell`
4. 在 `registry.ts` 注册；`contract.spec.ts` 会校验完整性
5. 按需加组件级 spec —— `measure-stamp.spec.ts` / `sequence-build.spec.ts` 是范例

> 漏掉第 1、2、4 步中的任何一步都会被类型系统或契约测试拦下。

## 5. 量词印章的手感（参考实现）

`measure-stamp` 是本项目手感最完整的一次互动，可作为新玩法的参照：
砸下（`fx-stamp`）+ 墨迹扩散（`fx-ink`）+ 溅星星（`fx-spark`），
拿起时抖一下（`fx-stamp-ready`，**一次性，不循环** —— 一直抖会持续抢注意力）。
