import type { Topic } from '@/domain'

/**
 * 中班的学习主题。
 *
 * 目前只放“已经能玩”的示例主题；其余领域保持空数组，
 * 界面会自动显示“内容准备中 · 等待教案”——
 * 这正是“内容与 UI 解耦”的意义：补内容不需要动任何页面。
 */
export const topics: Topic[] = [
  {
    id: 'nursery-language-chunxiao',
    gradeId: 'nursery',
    categoryId: 'nursery-language',
    title: '《春晓》',
    emoji: '🌸',
    kind: 'standard',
    order: 1,
    level: 1,
    objectives: [
      '愿意跟着读《春晓》，感受古诗的节奏',
      '知道诗里写了春天的早晨',
      '能说出“鸟”“花”“雨”这些词',
    ],
    knowledgePoints: [
      { id: 'kp-chunxiao-author', label: '《春晓》的作者孟浩然' },
      { id: 'kp-chunxiao-order', label: '《春晓》四句的顺序' },
      { id: 'kp-chunxiao-scene', label: '诗中写到的春天景物' },
    ],
    lessonIds: ['nursery-language-chunxiao-1'],
  },
  {
    id: 'nursery-language-chunxiao-challenge',
    gradeId: 'nursery',
    categoryId: 'nursery-language',
    title: '挑战：自己朗诵《春晓》',
    emoji: '🎤',
    kind: 'challenge',
    order: 2,
    level: 2,
    objectives: ['能完整地、有节奏地朗诵《春晓》', '愿意在别人面前大声朗读'],
    knowledgePoints: [{ id: 'kp-chunxiao-recite', label: '有节奏地朗诵古诗' }],
    lessonIds: [],
  },
  {
    id: 'nursery-language-secret',
    gradeId: 'nursery',
    categoryId: 'nursery-language',
    title: '古诗里的秘密花园',
    emoji: '🗝️',
    kind: 'hidden',
    order: 3,
    level: 1,
    objectives: ['在熟悉的故事里发现新的小惊喜'],
    knowledgePoints: [{ id: 'kp-poem-secret', label: '古诗里的小细节' }],
    lessonIds: [],
  },
  {
    id: 'nursery-math-shapes',
    gradeId: 'nursery',
    categoryId: 'nursery-math',
    title: '图形宝宝找家',
    emoji: '🔺',
    kind: 'standard',
    order: 1,
    level: 1,
    objectives: ['能认出圆形、三角形、正方形', '能按形状分类', '愿意说出“它有几条边”'],
    knowledgePoints: [
      { id: 'kp-shape-circle', label: '圆形：没有角' },
      { id: 'kp-shape-triangle', label: '三角形：三条边' },
      { id: 'kp-shape-square', label: '正方形：四条一样长的边' },
      { id: 'kp-shape-sort', label: '按形状分类' },
    ],
    lessonIds: ['nursery-math-shapes-1'],
  },
  {
    id: 'nursery-science-ice',
    gradeId: 'nursery',
    categoryId: 'nursery-science',
    title: '冰去哪儿了？',
    emoji: '🧊',
    kind: 'standard',
    order: 1,
    level: 1,
    objectives: ['愿意先猜再试', '知道冰遇热会化成水', '能说出自己看到的变化'],
    knowledgePoints: [
      { id: 'kp-ice-melt', label: '冰遇热会融化' },
      { id: 'kp-ice-water', label: '冰化成水，水还在' },
      { id: 'kp-ice-observe', label: '观察并说出变化' },
    ],
    lessonIds: ['nursery-science-ice-1'],
  },
]
