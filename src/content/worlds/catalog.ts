import type { LearningWorld } from './types'

/**
 * 学习世界目录（跨学科层）
 * ========================
 *
 * 需求文档给过两组空间：产品定位里的“语言森林 / 数学城堡 / 艺术小镇 / 科学实验室 /
 * 探索世界 / 音乐舞台 / 思维训练营 / 编程空间”，以及第十三章的跨学科空间
 * “阅读世界 / 科学实验室 / 创意工坊 / 思维训练营 / 编程世界”。
 *
 * 两边是同一批地方的不同叫法，因此在这里做一次合并去重（科学实验室只算一个世界，
 * 艺术小镇与创意工坊是两个不同的地方：一个看画，一个动手做），共 11 个世界。
 *
 * categoryIds 暂时为空：二级分类由内容包逐步补充，界面会自动呈现“内容准备中”。
 */
export const LEARNING_WORLDS: LearningWorld[] = [
  {
    id: 'language-forest',
    name: '语言森林',
    icon: 'forest',
    tone: 'language',
    tagline: '树叶上写满了字，念出来就亮一下。',
    description: '语言与表达：朗诵、识字、拼音启蒙与幼小衔接的口头表达。',
    gradeIds: ['nursery', 'preschool', 'grade-1', 'grade-2'],
    categoryIds: [],
  },
  {
    id: 'reading-forest',
    name: '阅读森林',
    icon: 'books',
    tone: 'reading',
    tagline: '每一本书都是一条小路，走进去就有新故事。',
    description: '跨学科阅读空间：绘本、故事、科普、历史、人物与儿童文学。',
    gradeIds: ['nursery', 'preschool', 'grade-1', 'grade-2', 'grade-3', 'grade-4', 'grade-5', 'grade-6'],
    categoryIds: [],
  },
  {
    id: 'math-castle',
    name: '数学城堡',
    icon: 'castle',
    tone: 'math',
    tagline: '数一数台阶，城堡的门就开了。',
    description: '数感、图形、测量与运算，小学阶段逐步过渡到数学思维与问题解决。',
    gradeIds: ['preschool', 'grade-1', 'grade-2', 'grade-3', 'grade-4', 'grade-5', 'grade-6'],
    categoryIds: [],
  },
  {
    id: 'science-lab',
    name: '科学实验室',
    icon: 'flask',
    tone: 'science',
    tagline: '先猜一猜，再动手试试看。',
    description: '实验、观察、测量与验证：答案由孩子自己拖出来，而不是被告知。',
    gradeIds: ['nursery', 'preschool', 'grade-1', 'grade-2', 'grade-3', 'grade-4', 'grade-5', 'grade-6'],
    categoryIds: [],
  },
  {
    id: 'explore-world',
    name: '探索世界',
    icon: 'globe',
    tone: 'explore',
    tagline: '背上小包，去认识会呼吸的世界。',
    description: '生活认知、自然与地理：从身边的一条街走到地球另一端。',
    gradeIds: ['nursery', 'preschool', 'grade-1', 'grade-2', 'grade-3', 'grade-4', 'grade-5', 'grade-6'],
    categoryIds: [],
  },
  {
    id: 'art-town',
    name: '艺术小镇',
    icon: 'palette',
    tone: 'art',
    tagline: '小镇的墙随便你涂，画错了也是一朵花。',
    description: '绘画与美术欣赏：涂色、描红、名画里找颜色。',
    gradeIds: ['nursery', 'preschool', 'grade-1', 'grade-2', 'grade-3', 'grade-4', 'grade-5', 'grade-6'],
    categoryIds: [],
  },
  {
    id: 'music-stage',
    name: '音乐舞台',
    icon: 'stage',
    tone: 'music',
    tagline: '拍一拍，舞台上的灯就会跟着亮。',
    description: '节奏、儿歌、听辨与音乐游戏：先感受，再认识音符。',
    gradeIds: ['nursery', 'preschool', 'grade-1', 'grade-2', 'grade-3'],
    categoryIds: [],
  },
  {
    id: 'creative-workshop',
    name: '创意工坊',
    icon: 'brush',
    tone: 'labor',
    tagline: '剪刀、胶水和故事，都能做成新东西。',
    description: '手工、拼图、故事创作与简单动画：把想法真的做出来。',
    gradeIds: ['nursery', 'preschool', 'grade-1', 'grade-2', 'grade-3', 'grade-4', 'grade-5', 'grade-6'],
    categoryIds: [],
  },
  {
    id: 'thinking-camp',
    name: '思维训练营',
    icon: 'brain',
    tone: 'think',
    tagline: '这里的谜题，要多看两眼才会笑。',
    description: '观察力、注意力、记忆力、逻辑、空间、分类、排序与推理训练。',
    gradeIds: ['nursery', 'preschool', 'grade-1', 'grade-2', 'grade-3', 'grade-4', 'grade-5', 'grade-6'],
    categoryIds: [],
  },
  {
    id: 'programming-world',
    name: '编程世界',
    icon: 'code',
    tone: 'code',
    tagline: '给机器人排好口令，它就替你走一趟。',
    description: '从图形与顺序，到指令、循环、条件，再到 Scratch、Python 与 AI 启蒙。',
    gradeIds: ['nursery', 'preschool', 'grade-1', 'grade-2', 'grade-3', 'grade-4', 'grade-5', 'grade-6'],
    categoryIds: [],
  },
  {
    id: 'culture-hall',
    name: '文化礼堂',
    icon: 'bank',
    tone: 'moral',
    tagline: '在这里听听老故事，也做一件好事。',
    description: '道德与法治、劳动与品格：节日、习俗、规则与待人接物。',
    gradeIds: ['nursery', 'preschool', 'grade-1', 'grade-2', 'grade-3', 'grade-4', 'grade-5', 'grade-6'],
    categoryIds: [],
  },
]

/** 按 id 直接取世界，供地图与页面 O(1) 解析 */
export const WORLD_BY_ID: Record<string, LearningWorld> = Object.fromEntries(
  LEARNING_WORLDS.map(world => [world.id, world]),
)

export function getWorld(id: string): LearningWorld | undefined {
  return WORLD_BY_ID[id]
}
