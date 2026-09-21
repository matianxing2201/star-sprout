import type { Lesson } from '@/domain'

/**
 * 示例课程：一年级 · 数学 · 小兔子收胡萝卜
 *
 * 对应产品需求里“个性化学习”的例子：
 *   孩子在“20 以内减法”上错得比较多 → 系统推荐一节减法小游戏。
 *
 * 所以这一课的骨架故意和“薄弱点 → 重新练习”的推荐链路对齐：
 * 知识点粒度高（退了几个、剩几个各自独立），错在哪一步家长端一眼能看到。
 */
export const xiaoTuZiLesson: Lesson = {
  id: 'grade-1-math-subtract-1',
  gradeId: 'grade-1',
  categoryId: 'grade-1-math',
  topicId: 'grade-1-math-subtract-within-20',
  title: '小兔子收胡萝卜',
  icon: 'carrot',
  question: '15 根胡萝卜，被吃掉 4 根，还剩几根？',
  mascot: 'rabbit',
  minutes: 10,
  tone: 'math',
  objectives: [
    '理解“还剩下多少”要用减法',
    '能正确计算 20 以内的退位减法',
    '能用减法解决生活里的小问题',
  ],
  knowledgePoints: [
    { id: 'kp-sub-meaning', label: '减法的含义：拿走、剩下' },
    { id: 'kp-sub-within-20', label: '20 以内减法计算' },
    { id: 'kp-sub-word', label: '看图列减法算式' },
  ],
  tasks: [
    {
      id: 'carrot-intro',
      kind: 'intro',
      title: '小兔子的难题',
      story: {
        mascot: 'rabbit',
        mood: 'curious',
        lines: [
          '我拔了 15 根胡萝卜，好开心！',
          '可是刚才被吃掉了 4 根……',
          '你能帮我算算，还剩几根吗？',
        ],
      },
    },
    {
      id: 'carrot-discover',
      kind: 'discover',
      title: '什么是“还剩”',
      instruction: '点一点卡片，看看减法在讲什么故事。',
      knowledgePointIds: ['kp-sub-meaning'],
      discovery: {
        cards: [
          { id: 'd1', icon: 'math-operations', tone: 'math', title: '减法就是拿走', body: '本来有一些，拿走一些，问剩下多少，就用减法。' },
          { id: 'd2', icon: 'carrot', tone: 'life', title: '15 − 4', body: '15 根里拿走 4 根。先拿走 5 根里的 4 根，还剩 1 根。' },
          { id: 'd3', icon: 'calculator', tone: 'think', title: '10 + 1 = 11', body: '10 根没有动，加上剩下的 1 根，就是 11 根。' },
        ],
      },
    },
    {
      id: 'carrot-count',
      kind: 'interaction',
      title: '帮小兔子算一算',
      instruction: '点一下你觉得对的答案。',
      knowledgePointIds: ['kp-sub-within-20'],
      interactions: [
        {
          kind: 'choose-one',
          prompt: '15 − 4 等于几？',
          hint: '先算 5 − 4 = 1，再加上原来的 10。',
          successLine: '没错！还剩 11 根胡萝卜。',
          retryLine: '差一点点，我们把 15 拆成 10 和 5 试试。',
          stars: 1,
          payload: {
            columns: 3,
            options: [
              { id: 'a', label: '11', emoji: '1️⃣1️⃣', correct: true, tone: 'math' },
              { id: 'b', label: '19', emoji: '➕', hint: '19 是把 4 加上了，我们要拿走哦。', tone: 'social' },
              { id: 'c', label: '9', emoji: '🤔', tone: 'think' },
            ],
          },
        },
      ],
    },
    {
      id: 'carrot-sort',
      kind: 'practice',
      title: '哪些算式等于 8？',
      instruction: '把所有等于 8 的算式都选出来。',
      mascotLine: '一个一个算，别着急。',
      knowledgePointIds: ['kp-sub-within-20'],
      interactions: [
        {
          kind: 'choose-many',
          prompt: '找出所有等于 8 的算式',
          hint: '可以数一数手指，也可以想想 8 加几等于它。',
          successLine: '全部找对，你的减法很稳！',
          stars: 2,
          payload: {
            columns: 3,
            requiredCount: 4,
            options: [
              { id: 'e1', label: '10 − 2', correct: true, tone: 'math' },
              { id: 'e2', label: '15 − 7', correct: true, tone: 'math' },
              { id: 'e3', label: '12 − 3', correct: false, hint: '12 − 3 = 9，差 1 就对了。', tone: 'think' },
              { id: 'e4', label: '9 − 1', correct: true, tone: 'math' },
              { id: 'e5', label: '14 − 6', correct: true, tone: 'math' },
              { id: 'e6', label: '11 − 4', correct: false, hint: '11 − 4 = 7，再算一遍看看。', tone: 'think' },
            ],
          },
        },
      ],
    },
    {
      id: 'carrot-basket',
      kind: 'challenge',
      title: '挑战：把胡萝卜分进篮子',
      instruction: '算出每个算式的结果，把它们放进对的篮子里。',
      knowledgePointIds: ['kp-sub-word'],
      interactions: [
        {
          kind: 'drag-drop',
          prompt: '把算式放进结果正确的篮子',
          hint: '先算结果，再找篮子。',
          successLine: '全部分对了！小兔子今晚有胡萝卜吃啦。',
          stars: 3,
          skippable: true,
          payload: {
            zones: [
              { id: 'basket-6', label: '结果是 6 的篮子', emoji: '🧺', tone: 'math', accepts: ['x1', 'x2'] },
              { id: 'basket-9', label: '结果是 9 的篮子', emoji: '🪣', tone: 'science', accepts: ['x3', 'x4'] },
            ],
            items: [
              { id: 'x1', label: '13 − 7', tone: 'math' },
              { id: 'x2', label: '11 − 5', tone: 'math' },
              { id: 'x3', label: '16 − 7', tone: 'science' },
              { id: 'x4', label: '12 − 3', tone: 'science' },
            ],
          },
        },
      ],
    },
    {
      id: 'carrot-reward',
      kind: 'reward',
      title: '领取奖励',
      reward: { stars: 3, message: '你帮小兔子算清楚了每一根胡萝卜。' },
    },
  ],
  reward: {
    stars: 3,
    message: '小兔子收胡萝卜完成！',
    badgeId: 'math-explorer',
  },
}
