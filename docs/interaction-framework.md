# 交互框架 —— 如何新增一种互动

> 产品要求：「每一个知识点都尽量转成互动」「不要把课程写死在页面代码里」。
> 因此互动被抽象成**声明式的数据 + 一张注册表**，而不是散落在页面里的 if-else。

---

## 一、三层结构

```
内容侧（教案）          视图侧（组件）                框架侧（统一规则）
InteractionSpec    →   注册表 kind → 组件     →    InteractionShell
 { kind, payload }      ChooseOneInteraction…      提示 · 重试 · 星星 · 结算
```

| 层 | 文件 | 职责 |
| --- | --- | --- |
| 类型 | `src/domain/interaction/types.ts` | `INTERACTION_KINDS`、各 `payload`、判别联合 `InteractionSpec`、`InteractionResult` |
| 契约 | `src/features/interactions/contract.ts` | 组件必须接收的 props 与必须发出的 `solved` / `missed` 事件 |
| 注册表 | `src/features/interactions/registry.ts` | `kind` → 组件，**唯一需要改的映射处** |
| 外壳 | `src/features/interactions/InteractionShell.vue` | 题目、角色反馈、提示、跳过、星星、结算上报 |
| 状态机 | `src/features/interactions/useInteraction.ts` | 尝试次数、是否用过提示、温柔重试文案 |
| 工具 | `src/features/interactions/usePointerDrag.ts` | 鼠标/触摸/触控笔通用的拖拽 + 放置目标查找 |

### 职责边界（很重要）

**具体互动组件只做两件事**：按 `payload` 渲染画面、判定对错后 emit。

它**不能**做：显示题目、显示星星、显示「答错了」、写奖励动画、自己加减分。
这些全部由外壳处理一次 —— 所以「答错不出现红叉」「奖励不得过度」这类产品要求
在整个系统里只有一处实现，也就只有一处可能出错。

组件的统一契约：

```ts
const { payload, disabled = false } = defineProps<{ payload: SomePayload, disabled?: boolean }>()
const emit = defineEmits<InteractionComponentEmits>()

emit('solved', answer)   // 做对了（answer 会进掌握度分析）
emit('missed', hint?)    // 差一点点（可以带一句更具体的提示）
```

---

## 二、已实现的 12 种互动

| kind | 名字 | 判对规则 | 适用 |
| --- | --- | --- | --- |
| `choose-one` | 选一选 | 选中 `correct: true` 的选项 | 快速判断、识字、算术 |
| `choose-many` | 全都找出来 | 所选集合恰好等于正确集合 | 分类、归纳 |
| `tap-target` | 点一点 | 找到 `requiredCount` 个正确目标 | 找不同、看图找信息 |
| `drag-sort` | 排一排 | 顺序等于 `correctOrder` | 诗句排序、步骤排序 |
| `drag-drop` | 拖一拖 | 每个元素都在接收它的区域里 | 归类、配对、分篮子 |
| `connect-line` | 连一连 | 连线集合等于 `pairs` | 关系认知、左右配对 |
| `memory-pair` | 翻翻乐 | 所有 `pairId` 成对翻开 | 记忆、词汇 |
| `color-fill` | 涂一涂 | 每个 `expectedTone` 区域颜色正确 | 色彩、审美 |
| `draw` | 画一画 | **永不判错**；画够笔数即可交卷 | 描红、临摹、自由创作 |
| `slider-explore` | 试一试 | 滑块到达 `target` | 科学实验（温度、力度） |
| `hotspot-explore` | 找一找 | 探索完 `requiredCount` 个热点 | 观察、发现 |
| `sequence-build` | 搭指令 | 积木序列等于 `solution` | 编程思维、顺序逻辑 |

### 共同的产品约束

- **拖到空白处不算失败** —— 儿童端不应因为手滑得到负反馈。
- **答错不清空** —— 只清掉错的那部分，正确的保留（`drag-sort` 甚至保留整个排列让人改）。
- **提示只给方向，不给答案**，而且在**答错两次之后**才出现。
- **探索类永不判错**：`draw` / `slider-explore` / `hotspot-explore` 不 emit `missed`。
- 挑战类互动可以 `skippable: true`，给孩子一个体面的出口。

### 拖拽为什么不用 HTML5 DnD

`dragstart/drop` 在触摸屏上基本不可用，而产品明确要求未来兼容平板与触摸屏。
因此用 Pointer Events 自己实现（`usePointerDrag`），一套代码同时覆盖鼠标、手指与触控笔，
并且**所有拖拽类互动都额外提供「点一下选中 → 点一下放置」的备选路径**，
这样键盘用户与手部精细动作还在发展的小朋友也能完成。

---

## 三、新增一种互动：三步

以「称重量」为例。

### 第 1 步：声明类型（`src/domain/interaction/types.ts`）

```ts
export const INTERACTION_KINDS = [
  // ...
  'weigh-scale',
] as const

export interface WeighScalePayload {
  leftEmoji: string
  rightEmoji: string
  /** 正确的一侧 */
  heavierSide: 'left' | 'right'
  tolerance: number
}

export interface InteractionPayloadMap {
  // ...
  'weigh-scale': WeighScalePayload
}
```

类型是判别联合，**漏改任何一处 `vue-tsc` 都会立刻报错**，不会静默漏掉。

### 第 2 步：写组件（`src/features/interactions/components/WeighScaleInteraction.vue`）

```vue
<script setup lang="ts">
import type { WeighScalePayload } from '@/domain'
import type { InteractionComponentEmits } from '../contract'

const { payload, disabled = false } = defineProps<{
  payload: WeighScalePayload
  disabled?: boolean
}>()

const emit = defineEmits<InteractionComponentEmits>()
</script>

<template>
  <!-- 只渲染天平，只判定对错。题目、提示、星星由外壳负责 -->
  <div>…</div>
</template>
```

### 第 3 步：注册（`src/features/interactions/registry.ts`）

```ts
'weigh-scale': WeighScaleInteraction,
```

**结束。** 课程播放器、课程数据格式、任何页面都不需要改动。

---

## 四、框架如何保证「温柔」

`useInteraction` 是所有互动共用的状态机：

```
第 1 次答错 → 角色说一句鼓励（差一点点）
第 2 次答错 → 「💡 给我一点提示」按钮出现
点提示      → 只说方向（payload.hint ?? 角色的 nudge）
答对        → 角色庆祝 + 报 star，写一条 AttemptRecord
```

每次作答都会落一条 `AttemptRecord`，其中 `knowledgePointIds` 来自内容里
`Task.knowledgePointIds`。家长端的「薄弱知识点」与「今日挑战」推荐完全由它推导 ——
**所以互动不只是好玩，它同时是能力评估的数据来源。**

---

## 五、给新互动的验收清单

- [ ] `defineProps` 用内联类型（不要泛型类型引用，Vue 编译器解析不了）
- [ ] 只 emit `solved` / `missed`，不写 prompt、不写星星、不写「错误」
- [ ] `disabled` 为真时完全惰性
- [ ] 拖拽用 `usePointerDrag` + `findDropTarget`，并额外提供点选备选路径
- [ ] 拖到空白处 = 无事发生
- [ ] 答错只清错的部分，不清全部
- [ ] 装饰性元素 `aria-hidden="true"`；可交互元素是真的 `<button type="button">`，带 `:aria-label`
- [ ] 只用设计令牌与 `toneVars()`，不硬编码颜色
- [ ] 文案全部简体中文，短，且**不出现「错误 / ❌ / 答错 / 失败」**
