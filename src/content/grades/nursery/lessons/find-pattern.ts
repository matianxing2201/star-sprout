import type { Lesson } from '@/domain'

/**
 * 示例课程：中班 · 数学启蒙 · 找规律
 *
 * 洪恩同款的「五个方框少一个」。面向 4~5 岁，题面的硬约束是：
 *
 *   - 每题**只有 1 个空格**（由 payload 的 `blankIndex` 保证，结构上写不出第二个）
 *   - 规律只有三种：① ABAB 循环 ② 依次 +1 顺数 ③ 依次 -1 倒数
 *   - 数字 1~10（0 不给进），备选 3 个
 *
 * 这三条里，「5 格 / 1 个空格 / 1~10 / 备选含答案不重复」由 schema 在数据入口就挡住；
 * 「规律只能是那三种、不许出现乘法或隔 2」由 `content.spec.ts` 的整段序列检查挡住。
 * 写内容的人不需要记住这些规则 —— 写错了测试会直接红。
 *
 * 题目（答案）：
 *   P1  3 7 3 _ 3  → 7   ABAB 循环，空格在第 4 位
 *   P2  1 2 3 _ 5  → 4   顺数 +1，空格在第 4 位
 *   P3  9 8 7 _ 5  → 6   倒数 -1，空格在第 4 位
 *   P4  8 2 _ 2 8  → 8   ABAB 循环，空格在**正中间**（最难：前后都是 2）
 *
 * P4 是挑战：四道里只有它把空格放在中间，而且空格两边的数相同，
 * 孩子得先认出「一个隔一个」，再问自己「这一位该是 A 还是 B」。
 */
export const findPatternLesson: Lesson = {
  id: 'nursery-math-find-pattern-1',
  gradeId: 'nursery',
  categoryId: 'nursery-math',
  topicId: 'nursery-math-find-pattern',
  title: '找规律',
  icon: 'list-checks',
  question: '五个方框少了一个，谁来补上？',
  mascot: 'fox',
  minutes: 10,
  tone: 'math',
  objectives: [
    '能认出「一个隔一个」「顺着数」「倒着数」这三种规律',
    '能利用空格两边的数，把中间缺的那个数找回来',
    '愿意把一排数字完整地数一遍再下结论，而不是随手指一个',
  ],
  knowledgePoints: [
    { id: 'kp-pattern-abab', label: '一个隔一个：两样东西轮流来，隔一个就重复' },
    { id: 'kp-pattern-add-one', label: '顺着数：从左到右每次多 1' },
    { id: 'kp-pattern-sub-one', label: '倒着数：从左到右每次少 1' },
    { id: 'kp-pattern-blank', label: '空格两边的数会把中间那个夹出来' },
  ],
  tasks: [
    {
      id: 'find-pattern-intro',
      kind: 'intro',
      title: '小狐狸的方框队',
      story: {
        mascot: 'fox',
        mood: 'curious',
        lines: [
          '我排了一队五个小方框。',
          '每格里都写好了一个数，只有一格是空的……',
          '旁边还站着几个数字，等着被叫进去。',
          '它们排队是有规矩的 —— 你来当那个发现规矩的人！',
        ],
      },
    },
    {
      id: 'find-pattern-discover',
      kind: 'discover',
      title: '排队的三种规矩',
      instruction: '点一点卡片，看看三种规矩各自长什么样。',
      knowledgePointIds: ['kp-pattern-abab', 'kp-pattern-add-one', 'kp-pattern-sub-one'],
      discovery: {
      cards: [
        {
          id: 'd-abab',
          icon: 'cards',
          title: '一个隔一个',
          body: '3、7、3、7、3 —— 两样东西轮流站，隔一个就重复。',
          tip: '点一下这三个数，听它们轮流报数。',
          tone: 'math',
        },
        {
          id: 'd-add',
          icon: 'plus',
          title: '顺着数',
          body: '1、2、3、4、5 —— 每一格都比前面大 1。',
          tip: '顺着数下去，后面永远比前面多 1。',
          tone: 'math',
        },
        {
          id: 'd-sub',
          icon: 'minus',
          title: '倒着数',
          body: '9、8、7、6、5 —— 每一格都比前面小 1。',
          tip: '从大往小走，就是我们说的倒数。',
          tone: 'think',
        },
      ],
      },
    },
    {
      id: 'find-pattern-play',
      kind: 'interaction',
      title: '先认认规矩',
      instruction: '看看这一排是哪种规矩，空格该填几。',
      knowledgePointIds: ['kp-pattern-abab', 'kp-pattern-blank'],
      interactions: [
        {
          kind: 'find-pattern',
          prompt: '空格里该填几？',
          hint: '先把整排从头到尾念一遍，看看它是哪一种规矩。',
          successLine: '一个隔一个 —— 你把规矩找出来了！',
          stars: 1,
          payload: {
            // 3 7 3 [7] 3 —— ABAB，空格在第 4 格
            sequence: [3, 7, 3, 7, 3],
            blankIndex: 3,
            options: [5, 7, 8],
            hint: '空格前后都是 3 —— 那它自己应该和它们不一样。',
          },
        },
      ],
    },
    {
      id: 'find-pattern-practice-add',
      kind: 'practice',
      title: '顺着数',
      instruction: '从 1 开始往后数，数到哪就停下。',
      knowledgePointIds: ['kp-pattern-add-one', 'kp-pattern-blank'],
      interactions: [
        {
          kind: 'find-pattern',
          prompt: '顺着数，空格是几？',
          hint: '用手指从 1 开始一个一个点过去，点到空格别停。',
          successLine: '顺着数就找到了，一个也没跳过去！',
          stars: 2,
          payload: {
            // 1 2 3 [4] 5 —— 顺数 +1，空格在第 4 格
            sequence: [1, 2, 3, 4, 5],
            blankIndex: 3,
            options: [4, 5, 6],
            hint: '3 后面、5 前面 —— 顺着数只差这一个数。',
          },
        },
      ],
    },
    {
      id: 'find-pattern-practice-sub',
      kind: 'practice',
      title: '倒着数',
      instruction: '这次从大往小走，每次少 1。',
      knowledgePointIds: ['kp-pattern-sub-one', 'kp-pattern-blank'],
      interactions: [
        {
          kind: 'find-pattern',
          prompt: '倒着数，空格是几？',
          hint: '这一排是从大到小排的，每格都比前一格少 1。',
          successLine: '倒着数也没难住你！',
          stars: 2,
          payload: {
            // 9 8 7 [6] 5 —— 倒数 -1，空格在第 4 格
            sequence: [9, 8, 7, 6, 5],
            blankIndex: 3,
            options: [4, 6, 10],
            hint: '9、8、7…… 再往下走一格，比 7 少 1 的是几？',
          },
        },
      ],
    },
    {
      id: 'find-pattern-challenge',
      kind: 'challenge',
      title: '挑战：空格在正中间',
      instruction: '空格两边的数一样，想想这一位该是 A 还是 B。',
      mascotLine: '这次空格在中间哦，前后夹着它的是同一个数。',
      knowledgePointIds: ['kp-pattern-abab', 'kp-pattern-blank'],
      interactions: [
        {
          kind: 'find-pattern',
          prompt: '一个隔一个，中间填几？',
          hint: '这一排只有 8 和 2 两个数在轮流站。',
          successLine: '把规律认出来，中间那个就跑不掉了！',
          skippable: true,
          stars: 3,
          payload: {
            // 8 2 [8] 2 8 —— ABAB，空格在**正中间**
            sequence: [8, 2, 8, 2, 8],
            blankIndex: 2,
            options: [1, 8, 9],
            hint: '空格前后都是 2 —— 那它自己该是另一个。',
          },
        },
      ],
    },
    {
      id: 'find-pattern-reward',
      kind: 'reward',
      title: '领取奖励',
      reward: { stars: 3, message: '三种规矩你全都认出来了！' },
    },
  ],
  reward: {
    stars: 3,
    message: '方框队补齐啦，你找到了其中的规律！',
    badgeId: 'math-explorer',
  },
}
