import type { AppIconName, UiTone } from '@/domain'

export type ReadinessStage = 'A' | 'B' | 'C'

export interface ReadinessDomain {
  id: string
  title: string
  icon: AppIconName
  tone: UiTone
  summary: string
  modules: string[]
}

/** 保留幼小衔接的领域与模块目录，具体课程内容后续逐项补充。 */
export const READINESS_DOMAINS: ReadinessDomain[] = [
  { id: 'language', title: '语文启蒙', icon: 'book-open', tone: 'language', summary: '语文启蒙课程目录。', modules: ['汉字识字与字形辨认', '拼音启蒙与语音意识', '词语积累与组词', '句子理解与表达', '绘本阅读与阅读理解', '古诗、儿歌与朗诵', '看图说话与故事复述', '握笔、笔画与书写准备'] },
  { id: 'math', title: '数学思维', icon: 'math-operations', tone: 'math', summary: '数学思维课程目录。', modules: ['数字认识与数感', '数量对应与比较', '数的分解与组成', '加减法基础', '图形与空间方位', '分类、排序与规律', '时间、人民币与测量', '生活中的数学问题'] },
  { id: 'english', title: '英语启蒙', icon: 'translate', tone: 'english', summary: '英语启蒙课程目录。', modules: ['英语语音与听力辨识', '字母认识', '生活主题词汇', '日常口语表达', '英文儿歌与韵律', '英文绘本阅读', '自然拼读预备'] },
  { id: 'thinking', title: '思维与认知', icon: 'brain', tone: 'think', summary: '思维与认知课程目录。', modules: ['观察力与找不同', '视觉、听觉记忆力', '逻辑推理与因果关系', '分类归纳与比较', '空间想象与图形推理', '创造力与发散思维', '问题解决与策略选择'] },
  { id: 'habits', title: '学习习惯', icon: 'list-checks', tone: 'explore', summary: '学习习惯课程目录。', modules: ['课堂专注与倾听', '理解指令与执行任务', '举手发言与主动提问', '坐姿、握笔与书写习惯', '时间管理与任务完成', '独立思考与自主学习', '复习、纠错与自我检查', '学习兴趣与内在驱动力'] },
  { id: 'social-emotional', title: '社会与情绪', icon: 'handshake', tone: 'social', summary: '社会与情绪课程目录。', modules: ['情绪识别与表达', '挫折承受与情绪调节', '规则意识与自我约束', '同伴交往与合作', '冲突解决与求助', '自信心与责任意识', '小学环境与角色认知'] },
  { id: 'science', title: '科学与常识', icon: 'flask', tone: 'science', summary: '科学与常识课程目录。', modules: ['动物与植物', '天气、季节与自然现象', '人体与健康常识', '物理现象与趣味实验', '地理、交通与社会常识', '安全教育与自我保护', '科学探究与记录'] },
  { id: 'movement-life', title: '运动与生活', icon: 'run', tone: 'life', summary: '运动与生活课程目录。', modules: ['大肌肉运动与体能', '手部精细动作与手眼协调', '生活自理与物品整理', '作息、卫生与健康习惯', '美术与手工', '音乐、节奏与律动', '劳动实践与生活技能'] },
]

export const READINESS_STAGES: { id: ReadinessStage, label: string, short: string, description: string }[] = [
  { id: 'A', label: '中班后期', short: '第一站', description: '课程目录' },
  { id: 'B', label: '大班上学期', short: '第二站', description: '课程目录' },
  { id: 'C', label: '大班下学期', short: '第三站', description: '课程目录' },
]
