import type { Lesson } from '@/domain'

/**
 * 示例课程：中班 · 语言表达 ·《春晓》
 *
 * 这是产品需求里给出的那条链路的最小完整实现，用来验证“教案 → 可玩课程”：
 *   年级 → 领域 → 主题 → 知识点 → 学习目标 → 教学过程 → 互动任务 → 练习 → 挑战 → 奖励
 *
 * 九个小任务、约 8 分钟，全程只需要点击、拖动和看一眼 —— 没有一段需要“阅读”的说明。
 */
export const chunXiaoLesson: Lesson = {
  id: 'nursery-language-chunxiao-1',
  gradeId: 'nursery',
  categoryId: 'nursery-language',
  topicId: 'nursery-language-chunxiao',
  title: '认识《春晓》',
  emoji: '🌸',
  question: '一千多年前的春天早晨，是什么样子的？',
  mascot: 'bear',
  minutes: 8,
  tone: 'language',
  objectives: [
    '愿意跟着读《春晓》，感受古诗的节奏',
    '知道诗里写了春天的早晨：鸟叫、风雨、落花',
    '能认出“鸟”“花”“雨”这几个词',
  ],
  knowledgePoints: [
    { id: 'kp-chunxiao-author', label: '《春晓》的作者孟浩然' },
    { id: 'kp-chunxiao-order', label: '《春晓》四句的顺序' },
    { id: 'kp-chunxiao-scene', label: '诗中写到的春天景物' },
  ],
  tasks: [
    {
      id: 'chunxiao-intro',
      kind: 'intro',
      title: '熊老师来了',
      mascotLine: '跟我一起去听听春天吧！',
      story: {
        mascot: 'bear',
        mood: 'happy',
        lines: [
          '小朋友你好呀，我是熊老师。',
          '今天我带来了一首很久很久以前的诗，它只有四句话。',
          '我们一起听听看：一千多年前的春天早晨，是什么样子的？',
        ],
      },
    },
    {
      id: 'chunxiao-discover',
      kind: 'discover',
      title: '诗里说了什么',
      instruction: '点一点每一张小卡片，看看诗里藏着的画面。',
      mascotLine: '一句一句看，就不难啦。',
      knowledgePointIds: ['kp-chunxiao-order'],
      discovery: {
        cards: [
          {
            id: 'card-1',
            emoji: '😴',
            tone: 'music',
            title: '春眠不觉晓',
            body: '春天的早上睡得特别香，不知不觉，天就亮了。',
          },
          {
            id: 'card-2',
            emoji: '🐦',
            tone: 'language',
            title: '处处闻啼鸟',
            body: '醒过来，到处都能听见小鸟在叫。',
          },
          {
            id: 'card-3',
            emoji: '🌧️',
            tone: 'science',
            title: '夜来风雨声',
            body: '昨天晚上，好像听见了风声和雨声。',
          },
          {
            id: 'card-4',
            emoji: '🌸',
            tone: 'art',
            title: '花落知多少',
            body: '不知道有多少花瓣，被风雨吹落在地上呢。',
          },
        ],
      },
    },
    {
      id: 'chunxiao-pick-season',
      kind: 'interaction',
      title: '这是哪个季节？',
      instruction: '点一下你觉得对的答案。',
      knowledgePointIds: ['kp-chunxiao-scene'],
      interactions: [
        {
          kind: 'choose-one',
          prompt: '《春晓》写的是哪个季节？',
          hint: '诗里提到了“春眠”哦，想想春天的样子。',
          successLine: '对啦！春天会开很多花，小鸟也会回来。',
          retryLine: '差一点点，再想想诗的名字。',
          stars: 1,
          payload: {
            layout: 'scene',
            columns: 2,
            options: [
              { id: 'spring', label: '春天', emoji: '🌸', correct: true, tone: 'art' },
              { id: 'summer', label: '夏天', emoji: '🌞', tone: 'math' },
              { id: 'autumn', label: '秋天', emoji: '🍂', tone: 'life' },
              { id: 'winter', label: '冬天', emoji: '❄️', tone: 'explore' },
            ],
          },
        },
      ],
    },
    {
      id: 'chunxiao-sort',
      kind: 'practice',
      title: '把诗句排好',
      instruction: '把四句诗按顺序排一排。不会也没关系，可以慢慢试。',
      mascotLine: '先排出第一句试试？',
      knowledgePointIds: ['kp-chunxiao-order'],
      interactions: [
        {
          kind: 'drag-sort',
          prompt: '把诗句按顺序排好',
          hint: '第一句是“春眠不觉晓”，它讲的是刚醒来的时候。',
          successLine: '排得真好！这就是《春晓》的顺序。',
          stars: 2,
          payload: {
            axisHint: '从第一句到第四句',
            items: [
              { id: 's1', label: '春眠不觉晓', emoji: '😴' },
              { id: 's2', label: '处处闻啼鸟', emoji: '🐦' },
              { id: 's3', label: '夜来风雨声', emoji: '🌧️' },
              { id: 's4', label: '花落知多少', emoji: '🌸' },
            ],
            correctOrder: ['s1', 's2', 's3', 's4'],
          },
        },
      ],
    },
    {
      id: 'chunxiao-challenge',
      kind: 'challenge',
      title: '挑战：在画里找一找',
      instruction: '在春天的画里，找出诗里说到的三样东西。',
      mascotLine: '仔细看看画里有什么，别着急。',
      knowledgePointIds: ['kp-chunxiao-scene'],
      interactions: [
        {
          kind: 'tap-target',
          prompt: '找出诗里提到的 3 样东西',
          hint: '诗里提到了小鸟、风和雨，还有落下来的花。',
          successLine: '全都找到啦！你真的听懂这首诗了。',
          stars: 3,
          skippable: true,
          payload: {
            backgroundTone: 'art',
            requiredCount: 3,
            targets: [
              { id: 'bird', label: '小鸟', emoji: '🐦', x: 22, y: 26, correct: true },
              { id: 'rain', label: '春雨', emoji: '🌧️', x: 70, y: 22, correct: true },
              { id: 'flower', label: '落花', emoji: '🌸', x: 42, y: 74, correct: true },
              { id: 'moon', label: '月亮', emoji: '🌙', x: 84, y: 66, hint: '诗里说的是天亮的时候，不是晚上哦。' },
              { id: 'rock', label: '石头', emoji: '🪨', x: 12, y: 68, hint: '再找找会动、会响的东西。' },
            ],
          },
        },
      ],
    },
    {
      id: 'chunxiao-reward',
      kind: 'reward',
      title: '领取奖励',
      reward: {
        stars: 3,
        message: '你认识了《春晓》，还听懂了春天早晨的声音。',
      },
    },
  ],
  reward: {
    stars: 3,
    message: '《春晓》探索完成！',
    unlocksTopicIds: ['nursery-language-chunxiao-challenge'],
  },
}
