import type { Topic } from '@/domain'

/** 一年级的学习主题：目前围绕“20 以内减法”这一条薄弱点推荐链路 */
export const topics: Topic[] = [
  {
    id: 'grade-1-math-subtract-within-20',
    gradeId: 'grade-1',
    categoryId: 'grade-1-math',
    title: '小兔子收胡萝卜',
    icon: 'carrot',
    kind: 'standard',
    order: 1,
    level: 1,
    objectives: ['理解“还剩多少”要用减法', '能正确计算 20 以内减法', '能用减法解决小问题'],
    knowledgePoints: [
      { id: 'kp-sub-meaning', label: '减法的含义：拿走、剩下' },
      { id: 'kp-sub-within-20', label: '20 以内减法计算' },
      { id: 'kp-sub-word', label: '看图列减法算式' },
    ],
    lessonIds: ['grade-1-math-subtract-1'],
  },
  {
    id: 'grade-1-math-subtract-challenge',
    gradeId: 'grade-1',
    categoryId: 'grade-1-math',
    title: '挑战：一分钟快算',
    icon: 'hourglass',
    kind: 'challenge',
    order: 2,
    level: 2,
    objectives: ['在熟练的基础上提高速度'],
    knowledgePoints: [{ id: 'kp-sub-fluency', label: '20 以内减法的心算熟练度' }],
    lessonIds: [],
  },
]
