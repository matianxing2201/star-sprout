/**
 * 角色系统（IP 角色）的领域定义。
 *
 * 角色不是装饰，必须承担：教学 / 提问 / 提示 / 鼓励 / 错误反馈 / 奖励反馈 / 故事推进。
 * 因此每个角色都声明自己的语气（voice），供文案与动效统一取用。
 */

export const MASCOT_IDS = ['bear', 'rabbit', 'cat', 'fox', 'panda', 'robot'] as const

export type MascotId = (typeof MASCOT_IDS)[number]

/** 角色的语气风格，决定文案措辞与动效强度 */
export type MascotVoice = 'warm' | 'lively' | 'calm' | 'clever' | 'cuddly' | 'curious'

export interface Mascot {
  id: MascotId
  name: string
  emoji: string
  voice: MascotVoice
  /** 角色定位：孩子会问“你是谁” */
  role: string
  /** 默认鼓励语，用于通用奖励反馈 */
  cheer: string
  /** 默认提示语，用于“差一点点”的温柔反馈 */
  nudge: string
  tone: string
}

export const MASCOTS: Record<MascotId, Mascot> = {
  bear: {
    id: 'bear',
    name: '熊老师',
    emoji: '🐻',
    voice: 'warm',
    role: '总在身边的老师',
    cheer: '做得真好，我们一起记住了！',
    nudge: '差一点点，再看一眼就好啦。',
    tone: 'language',
  },
  rabbit: {
    id: 'rabbit',
    name: '小兔',
    emoji: '🐰',
    voice: 'lively',
    role: '一起玩的小伙伴',
    cheer: '哇！你比我跳得还快！',
    nudge: '别急，我陪你再来一次。',
    tone: 'art',
  },
  cat: {
    id: 'cat',
    name: '小猫',
    emoji: '🐱',
    voice: 'calm',
    role: '安静观察的伙伴',
    cheer: '你观察得真仔细。',
    nudge: '慢慢来，答案就藏在里面。',
    tone: 'think',
  },
  fox: {
    id: 'fox',
    name: '小狐狸',
    emoji: '🦊',
    voice: 'clever',
    role: '爱出谜题的好朋友',
    cheer: '又被你解开了，真厉害！',
    nudge: '再想一想，你可以的。',
    tone: 'math',
  },
  panda: {
    id: 'panda',
    name: '熊猫',
    emoji: '🐼',
    voice: 'cuddly',
    role: '一起动手的搭档',
    cheer: '我们做到了，抱一个！',
    nudge: '没关系，慢慢试就好。',
    tone: 'science',
  },
  robot: {
    id: 'robot',
    name: '小机器人',
    emoji: '🚀',
    voice: 'curious',
    role: '来自太空的探索家',
    cheer: '任务完成，数据已记录！',
    nudge: '检测到新线索，再试一次？',
    tone: 'code',
  },
}

/** 一年级之后逐渐由“老师型”角色承担知识讲解 */
export function getMascot(id: MascotId): Mascot {
  return MASCOTS[id]
}
