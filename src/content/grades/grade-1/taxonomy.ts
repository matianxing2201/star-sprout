import type { Category, Grade } from '@/domain'

/** 一年级大纲只保留语文、数学、英语三科。 */
export const grade: Grade = {
  id: 'grade-1',
  name: '一年级',
  stage: 'primary',
  order: 2,
  ageRange: '6-7 岁',
  icon: 'tree',
  tone: 'language',
  tagline: '背上书包，做真正的小学生',
  summary: '从语文、数学、英语三科打牢基础，同时保护学习兴趣与自主性。',
  nextHint: '到了二年级，你会学乘法口诀，还能写出完整的小故事！',
}

/** 一年级三个学科分类。 */
export const categories: Category[] = [
  {
    id: 'grade-1-chinese',
    gradeId: 'grade-1',
    name: '语文',
    icon: 'book',
    tone: 'language',
    summary: '从拼音与笔画起步，识字、朗读、读课文，并学着看图写话。',
    focus: ['识字写字', '朗读课文', '看图写话'],
    skills: ['拼音', '汉字', '笔画', '偏旁部首', '识字', '组词', '造句', '朗读', '课文', '古诗', '阅读理解', '看图写话', '口语表达'],
    order: 1,
  },
  {
    id: 'grade-1-math',
    gradeId: 'grade-1',
    name: '数学',
    icon: 'math-operations',
    tone: 'math',
    summary: '建立 100 以内的数感，掌握 20 以内加减，并解决简单应用题。',
    focus: ['100以内数感', '加减运算', '简单应用题'],
    skills: ['数与数的运算', '20以内加减', '100以内数', '加法', '减法', '图形', '分类', '排序', '位置', '时间', '人民币', '简单应用题', '数学思维'],
    order: 2,
  },
  {
    id: 'grade-1-english',
    gradeId: 'grade-1',
    name: '英语',
    icon: 'translate',
    tone: 'english',
    summary: '按教材配置，从字母、单词与英语儿歌入手，在情景中开口说。',
    focus: ['字母单词', '听说习惯', '情景表达'],
    skills: ['字母', '单词', '词汇', '句型', '听力', '口语', '阅读启蒙', '英语儿歌', '情景表达'],
    order: 3,
  },
]
