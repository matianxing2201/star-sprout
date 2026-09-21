import type { Lesson } from '@/domain'

/**
 * 示例课程：中班 · 数学启蒙 · 图形宝宝找家
 *
 * 把“分类”这件抽象的事变成“把图形宝宝送回家”。
 * 互动全部是拖拽与点选，没有一道题需要写字。
 */
export const tuXingBaoBaoLesson: Lesson = {
  id: 'nursery-math-shapes-1',
  gradeId: 'nursery',
  categoryId: 'nursery-math',
  topicId: 'nursery-math-shapes',
  title: '图形宝宝找家',
  icon: 'shapes',
  question: '圆形、三角形和正方形，长得有什么不一样？',
  mascot: 'fox',
  minutes: 7,
  tone: 'math',
  objectives: [
    '能认出圆形、三角形、正方形',
    '能按形状把图形分到不同的家',
    '愿意说出“它有几条边”',
  ],
  knowledgePoints: [
    { id: 'kp-shape-circle', label: '圆形：没有角，圆圆的' },
    { id: 'kp-shape-triangle', label: '三角形：三条边、三个角' },
    { id: 'kp-shape-square', label: '正方形：四条一样长的边' },
    { id: 'kp-shape-sort', label: '按形状分类' },
  ],
  tasks: [
    {
      id: 'shapes-intro',
      kind: 'intro',
      title: '小狐狸来信了',
      story: {
        mascot: 'fox',
        mood: 'curious',
        lines: [
          '你好！我是小狐狸。',
          '图形宝宝们玩得太开心，找不到自己的家了。',
          '你能帮它们找到家吗？',
        ],
      },
    },
    {
      id: 'shapes-discover',
      kind: 'discover',
      title: '先认识一下它们',
      instruction: '点一点卡片，看看每个图形宝宝的样子。',
      knowledgePointIds: ['kp-shape-circle', 'kp-shape-triangle', 'kp-shape-square'],
      discovery: {
        cards: [
          { id: 'c-circle', icon: 'globe', tone: 'math', title: '圆形', body: '圆圆的，没有角，可以滚来滚去。' },
          { id: 'c-triangle', icon: 'shapes', tone: 'science', title: '三角形', body: '有三条边、三个角，像小山一样。' },
          { id: 'c-square', icon: 'cube', tone: 'explore', title: '正方形', body: '有四条边，四条边一样长。' },
        ],
      },
    },
    {
      id: 'shapes-sort',
      kind: 'interaction',
      title: '送图形宝宝回家',
      instruction: '把下面的图形宝宝，拖到它自己的家里。',
      mascotLine: '慢慢来，看清楚它有没有角。',
      knowledgePointIds: ['kp-shape-sort'],
      interactions: [
        {
          kind: 'drag-drop',
          prompt: '把图形宝宝送回家',
          hint: '先看它有没有角：没有角的是圆形。',
          successLine: '全都回家啦，你分得真准！',
          stars: 2,
          payload: {
            zones: [
              { id: 'home-circle', label: '圆形的家', emoji: '⭕', tone: 'math', accepts: ['i-circle', 'i-circle-2'] },
              { id: 'home-triangle', label: '三角形的家', emoji: '🔺', tone: 'science', accepts: ['i-triangle', 'i-triangle-2'] },
              { id: 'home-square', label: '正方形的家', emoji: '🟦', tone: 'explore', accepts: ['i-square', 'i-square-2'] },
            ],
            items: [
              { id: 'i-circle', label: '皮球', emoji: '⚽', tone: 'math' },
              { id: 'i-triangle', label: '小山', emoji: '⛰️', tone: 'science' },
              { id: 'i-square', label: '窗户', emoji: '🪟', tone: 'explore' },
              { id: 'i-circle-2', label: '轮胎', emoji: '🛞', tone: 'math' },
              { id: 'i-triangle-2', label: '帆船', emoji: '⛵', tone: 'science' },
              { id: 'i-square-2', label: '积木', emoji: '🧱', tone: 'explore' },
            ],
          },
        },
      ],
    },
    {
      id: 'shapes-practice',
      kind: 'practice',
      title: '小试身手',
      instruction: '把所有的三角形都找出来。',
      knowledgePointIds: ['kp-shape-triangle'],
      interactions: [
        {
          kind: 'choose-many',
          prompt: '哪些是三角形？全都选出来',
          hint: '三角形只有三条边，找找看哪些是三条边。',
          successLine: '一个都没漏掉，真棒！',
          stars: 2,
          payload: {
            columns: 3,
            options: [
              { id: 'o1', label: '三明治', emoji: '🥪', correct: true, tone: 'life' },
              { id: 'o2', label: '时钟', emoji: '🕐', correct: false, hint: '时钟是圆形的哦。', tone: 'think' },
              { id: 'o3', label: '屋顶', emoji: '🏠', correct: true, tone: 'art' },
              { id: 'o4', label: '皮球', emoji: '⚽', correct: false, hint: '皮球圆圆的，没有角。', tone: 'math' },
              { id: 'o5', label: '小旗子', emoji: '🚩', correct: true, tone: 'social' },
            ],
          },
        },
      ],
    },
    {
      id: 'shapes-reward',
      kind: 'reward',
      title: '领取奖励',
      reward: { stars: 3, message: '你帮所有图形宝宝都找到了家。' },
    },
  ],
  reward: {
    stars: 3,
    message: '图形宝宝找家完成！',
    badgeId: 'math-explorer',
  },
}
