import type { Lesson } from '@/domain'

/**
 * 示例课程：中班 · 科学探索 · 冰去哪儿了？
 *
 * 对应产品需求里的原话：
 *   “为什么冰会融化？”—— 孩子自己拖动温度计，而不是直接告诉答案。
 *
 * 所以这一课没有一道选择题：只有观察、拖动和发现。
 */
export const bingQuNaErLeLesson: Lesson = {
  id: 'nursery-science-ice-1',
  gradeId: 'nursery',
  categoryId: 'nursery-science',
  topicId: 'nursery-science-ice',
  title: '冰去哪儿了？',
  icon: 'snowflake',
  question: '冰放在暖和地方，会变成什么呢？',
  mascot: 'panda',
  minutes: 8,
  tone: 'science',
  objectives: [
    '愿意先猜一猜，再动手试一试',
    '知道冰遇热会化成水',
    '能说出自己看到的变化',
  ],
  knowledgePoints: [
    { id: 'kp-ice-melt', label: '冰遇热会融化' },
    { id: 'kp-ice-water', label: '冰化成水，还是原来的东西' },
    { id: 'kp-ice-observe', label: '观察并用话说出变化' },
  ],
  tasks: [
    {
      id: 'ice-intro',
      kind: 'intro',
      title: '熊猫的实验台',
      story: {
        mascot: 'panda',
        mood: 'curious',
        lines: [
          '你好！我是熊猫，我最喜欢做实验。',
          '昨天我把一块冰放在了桌子上。',
          '今天一看……咦？冰不见了！它去哪儿了呢？',
        ],
      },
    },
    {
      id: 'ice-guess',
      kind: 'interaction',
      title: '先猜一猜',
      instruction: '你觉得冰会变成什么？点一下你猜的那个。',
      mascotLine: '猜错了也没关系，做实验就是为了找出答案。',
      knowledgePointIds: ['kp-ice-melt'],
      interactions: [
        {
          kind: 'choose-one',
          prompt: '冰放在暖和地方，会变成什么？',
          hint: '想想夏天手里的冰棍，它最后会滴下什么。',
          successLine: '你猜对啦！我们来动手验证一下。',
          retryLine: '差一点点，我们做完实验就知道啦。',
          stars: 1,
          payload: {
            layout: 'scene',
            columns: 2,
            options: [
              { id: 'water', label: '变成水', emoji: '💧', correct: true, tone: 'science' },
              { id: 'stone', label: '变成石头', emoji: '🪨', tone: 'life' },
              { id: 'cloud', label: '飞上天', emoji: '☁️', tone: 'explore' },
              { id: 'nothing', label: '什么都没变', emoji: '🤔', tone: 'think' },
            ],
          },
        },
      ],
    },
    {
      id: 'ice-slider',
      kind: 'challenge',
      title: '动手试一试',
      instruction: '拖动温度计，让温度慢慢升高，看看冰会怎么样。',
      mascotLine: '一直拖到冰开始融化的地方，停下来看看。',
      knowledgePointIds: ['kp-ice-melt', 'kp-ice-observe'],
      interactions: [
        {
          kind: 'slider-explore',
          prompt: '把温度拖到冰开始融化的地方',
          hint: '冰在 0 度的时候开始化成水。',
          successLine: '看！冰变成水了。你发现了融化的秘密。',
          stars: 3,
          payload: {
            min: -10,
            max: 30,
            step: 1,
            initial: -10,
            minLabel: '很冷',
            maxLabel: '很暖',
            unit: '℃',
            target: 0,
            states: [
              { from: -10, emoji: '🧊', caption: '冰还是硬硬的，一点都没变。' },
              { from: 0, emoji: '💧', caption: '冰开始化成水了！' },
              { from: 12, emoji: '🌊', caption: '冰全都不见了，只剩下一摊水。' },
              { from: 24, emoji: '♨️', caption: '水变热了，冒出了一点点热气。' },
            ],
          },
        },
      ],
    },
    {
      id: 'ice-explore',
      kind: 'practice',
      title: '在实验台上找一找',
      instruction: '点一点实验台上的东西，看看它们告诉你什么。',
      knowledgePointIds: ['kp-ice-water'],
      interactions: [
        {
          kind: 'hotspot-explore',
          prompt: '找出实验台上藏着的 3 个小秘密',
          successLine: '你观察得真仔细，像个小科学家！',
          stars: 2,
          payload: {
            backgroundTone: 'science',
            requiredCount: 3,
            hotspots: [
              { id: 'sun', label: '太阳', emoji: '☀️', x: 82, y: 16, reveal: '太阳照过来，会给冰带来热量。' },
              { id: 'ice', label: '冰块', emoji: '🧊', x: 26, y: 58, reveal: '冰是水的另一种样子，冷冷的、硬硬的。' },
              { id: 'puddle', label: '水洼', emoji: '💧', x: 62, y: 76, reveal: '冰化成水以后会流走，但水并没有消失。' },
              { id: 'cup', label: '杯子', emoji: '🥛', x: 14, y: 24, reveal: '把水倒进杯子里，明天放进冰箱，它又会变成冰。' },
            ],
          },
        },
      ],
    },
    {
      id: 'ice-reward',
      kind: 'reward',
      title: '领取奖励',
      reward: { stars: 3, message: '你自己动手，发现了冰融化的秘密。' },
    },
  ],
  reward: {
    stars: 3,
    message: '冰去哪儿了？探索完成！',
    badgeId: 'little-scientist',
  },
}
