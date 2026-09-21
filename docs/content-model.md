# 课程数据模型 —— 如何把一份教案变成可玩的课程

> 产品要求：「具体课程内容、知识点、教学目标、教学过程、故事、互动方式，由我后续提供教案。」
> 因此这一版的重点不是内容量，而是**一条能把教案直接吃进去的管道**。

---

## 一、模型总览

```
Grade              年级            中班 / 大班 / 一年级 …… 六年级（8 个，顺序锁定）
 └ Category        领域（二级分类）  语言表达 / 数学启蒙 / 语文 / 信息科技 ……
    └ Topic        学习主题         《春晓》 / 图形宝宝找家 / 20 以内减法 ……
       └ Lesson    课程            一次 5~10 分钟的探索
          └ Task   学习任务        1~3 分钟一步
             └ Interaction  互动   点击 / 拖拽 / 连线 / 涂色 / 实验……
```

对应需求文档第十四节的转换链路：

```
年级 → 学科/领域 → 课程主题 → 知识点 → 学习目标
     → 教学过程 → 互动任务 → 练习 → 挑战 → 学习结果
```

| 教案里的概念 | 数据模型里的字段 |
| --- | --- |
| 年级 | `Category.gradeId` / `Topic.gradeId` |
| 学科 / 领域 | `Category` |
| 课程主题 | `Topic.title` |
| 知识点 | `Topic.knowledgePoints[]` + `Task.knowledgePointIds[]` |
| 学习目标 | `Lesson.objectives[]` / `Topic.objectives[]` |
| 教学过程 | `Lesson.tasks[]`（有序） |
| 互动任务 | `LearningTask(interaction/practice/challenge).interactions[]` |
| 练习 | `kind: 'practice'` |
| 挑战 | `kind: 'challenge'` |
| 学习结果 | `Lesson.reward` + 推导出的 `LessonCompletion` |

---

## 二、一节课的固定节奏

产品的课程页面结构是**六段式**，并且由类型系统强制：

```
intro（角色引入） → discover（知识发现） → interaction（动手探索）
                  → practice（小试身手） → challenge（挑战任务） → reward（奖励）
```

`Task.kind` 只有这六种。测试会断言每节课**以 `intro` 开始、以 `reward` 结束** ——
教学的仪式感不因教案风格而异，孩子每次都知道「谁先说话、什么时候拿奖励」。

```ts
type LearningTask =
  | { kind: 'intro',     story: StoryBeat }            // 角色说几句，把孩子带进来
  | { kind: 'discover',  discovery: DiscoveryPanel }   // 一张卡只讲一件事
  | { kind: 'interaction' | 'practice' | 'challenge',  // 三类共用一个舞台
      interactions: InteractionSpec[] }
  | { kind: 'reward',    reward: TaskReward }          // 结算与解锁说明
```

---

## 三、加一份教案：四步

以「中班 · 语言表达 ·《春晓》」为例。

### 第 1 步：确认领域存在

`src/content/grades/nursery/taxonomy.ts` 里已经有 `nursery-language`（来自课程体系）。
如果教案属于一个新领域，在对应年级的 `taxonomy.ts` 里加一条 `Category`。

### 第 2 步：加主题（`src/content/grades/nursery/topics.ts`）

```ts
{
  id: 'nursery-language-chunxiao',
  gradeId: 'nursery',
  categoryId: 'nursery-language',
  title: '《春晓》',
  emoji: '🌸',
  kind: 'standard',            // standard | challenge | hidden
  order: 1,                    // 领域内的路径顺序，决定解锁链
  level: 1,                    // 1~3，家长端可见的难度
  objectives: ['愿意跟着读《春晓》，感受古诗的节奏'],
  knowledgePoints: [
    { id: 'kp-chunxiao-author', label: '《春晓》的作者孟浩然' },
  ],
  lessonIds: ['nursery-language-chunxiao-1'],   // 课程顺序
}
```

> `knowledgePoints` 是家长端「薄弱知识点」的字典。**没有它，错题就无法被命名。**

### 第 3 步：加课程（`src/content/grades/nursery/lessons/chun-xiao.ts`）

```ts
{
  id: 'nursery-language-chunxiao-1',
  gradeId: 'nursery',
  categoryId: 'nursery-language',
  topicId: 'nursery-language-chunxiao',
  title: '认识《春晓》',
  emoji: '🌸',
  question: '一千多年前的春天早晨，是什么样子的？',   // 「今天要探索什么？」
  mascot: 'bear',                                    // 由哪个角色陪
  minutes: 8,
  tone: 'language',
  objectives: [...],
  knowledgePoints: [...],
  tasks: [ /* 六段式 */ ],
  reward: { stars: 3, message: '《春晓》探索完成！', unlocksTopicIds: [...] },
}
```

每个互动任务只需要声明**做什么**，不需要写**怎么反馈**：

```ts
{
  id: 'chunxiao-sort',
  kind: 'practice',
  title: '把诗句排好',
  instruction: '把四句诗按顺序排一排。',
  knowledgePointIds: ['kp-chunxiao-order'],   // ← 决定它计入哪个知识点的掌握度
  interactions: [{
    kind: 'drag-sort',
    prompt: '把诗句按顺序排好',
    hint: '第一句是“春眠不觉晓”。',            // 答错两次后才会出现
    successLine: '排得真好！这就是《春晓》的顺序。',
    stars: 2,
    payload: {
      axisHint: '从第一句到第四句',
      items: [...],
      correctOrder: ['s1', 's2', 's3', 's4'],
    },
  }],
}
```

### 第 4 步：挂上（`src/content/grades/nursery/index.ts`）

```ts
export const nurseryContent: GradeContent = {
  grade, categories, topics,
  lessons: [chunXiaoLesson, ...],
}
```

**结束。** 页面、路由、组件、样式都不需要动 —— 刷新即可玩。

---

## 四、写内容时的红线（由 `src/content/schema.ts` 与测试守住）

| 规则 | 原因 |
| --- | --- |
| `id` 全局唯一，kebab-case | 课程地图、进度、徽章都靠 id 关联 |
| `topic.lessonIds` 与 `lesson.topicId` 双向一致 | 否则地图上点不进去，或课程无家可归 |
| 任务 `id` 在一节课内唯一 | 进度按 `taskId` 记录 |
| `reward.stars` ∈ 1..3、`minutes` > 0 | 结算与时长展示 |
| `Task.knowledgePointIds` 必须在主题或课程里声明过 | 家长端要显示知识点名字 |
| 互动 `kind` 必须是注册表支持的 12 种之一 | 否则运行时没有组件可渲染 |
| 学习地图节点坐标 5~95、路径只连本图节点 | 否则标签会跑出画面 |

跑 `pnpm test` 就会全部验证一遍。家长端「学习报告」页也会显示 `selfCheck()` 的结果。

---

## 五、奖励与解锁怎么来

- **星星**：每次互动按 `interaction.stars` 给；一节课结束时按**首次答对率**结算 1~3 星，
  用过提示封顶 2 星（`useLessonSession.settleStars`）。
- **解锁**：领域内 `Topic.order` 串成一条路，前一个**有课程**的主题完成才解锁下一个
  （`buildTopicProgressMap`）。第一个主题永远开放 —— 孩子任何时候都有「下一步」。
- **没有课程的主题不挡路**：教案是一份一份补进来的，路径中间常常夹着「目录已建好、内容还没到」
  的主题（`lessonIds: []`）。这种主题永远无法变成 completed，所以它**不参与串链** ——
  否则一条路径上只要有一个待补的主题，它后面所有主题都会被永久锁死。
  界面上它照常显示「内容准备中」。
- **挑战 / 隐藏主题**：`Topic.kind` 为 `challenge` / `hidden`，
  在课程地图上有不同的视觉与文案，但**依然遵守同一条解锁链**，不做暗门。
- **徽章**：`src/content/badges.ts`，规则是**声明式数据**（`BadgeRule`）而不是函数，
  因此以后可以搬到后台配置。

---

## 六、未来：自动转换教案

[`src/content/templates/lesson.template.ts`](../src/content/templates/lesson.template.ts) 是一份**参与类型检查**的课程模板：
复制它、填空，就是一份新课程。字段改了而模板没跟上，`pnpm typecheck` 会直接报错。

后续接入大模型或人工转换流程时，目标产物就是本文件第三节那段数据 ——
**转换器只需要产出数据，不需要理解任何界面细节**，这正是分层带来的好处。
