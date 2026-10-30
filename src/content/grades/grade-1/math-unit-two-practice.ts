import type { InteractionOption, InteractionSpec } from '@/domain'
import { publicAsset } from '@/shared/utils'
import originals from './math-unit-two-originals.json'

export type PracticeMode = 'digital' | 'picture'
export type UnitTwoSection = 'diagnostic' | 'original' | 'extension' | 'review' | 'summary'

export interface PictureGroup {
  label: string
  count: number
  emoji: string
  action?: string
}

export interface PictureQuestion {
  prompt: string
  answer: string
  explanation: string
  character: string
  characterName: string
  caption: string
  groups: PictureGroup[]
  signs?: string[]
  sequence?: number[]
  blankIndex?: number
  choices?: InteractionOption[]
}

export interface UnitTwoTask {
  id: string
  sourceId?: string
  sourceType: 'numeric' | 'choice'
  knowledgePointId: string
  knowledgePoint: string
  label: '原题' | '拓展题'
  prompt: string
  answer: string
  explanation: string
  sourceChoices?: Array<{ key: string, text: string }>
  picture: PictureQuestion
  originalInteraction?: InteractionSpec
  pictureInteraction?: InteractionSpec
}

const pictureVariants: Record<string, PictureQuestion> = {
  cnm_p008_q1: {
    prompt: '5，？，7，8，9。空格里应该填几？', answer: '6',
    explanation: '5、6、7、8、9 按顺序排列，5 和 7 中间是 6。',
    character: 'peppa', characterName: '佩奇', caption: '佩奇沿着数字小路往前数。',
    groups: [], sequence: [5, 6, 7, 8, 9], blankIndex: 1,
  },
  cnm_p008_q2: {
    prompt: '9 的前面一个数是几？', answer: '8', explanation: '9 往前数一个数是 8。',
    character: 'george', characterName: '乔治', caption: '乔治在数字卡片里找 9 前面的数。', groups: [{ label: '数字卡片', count: 1, emoji: '🔢' }], signs: ['9'],
  },
  cnm_p008_q3: {
    prompt: '8 是由几个一组成的？', answer: '8', explanation: '8 里面有 8 个一。',
    character: 'mummy-pig', characterName: '猪妈妈', caption: '猪妈妈把小方块一个一个摆出来。', groups: [{ label: '一个一', count: 8, emoji: '🟨' }],
  },
  cnm_p008_q4: {
    prompt: '从 5 数到 9，5、6、7、8、9 一共有多少个数？', answer: '5', explanation: '从 5 到 9，两头都算上，一共 5 个数。',
    character: 'grandpa-pig', characterName: '猪爷爷', caption: '猪爷爷数一数这排数字卡片。', groups: [{ label: '一排数字卡片', count: 5, emoji: '🔢' }], signs: ['5', '6', '7', '8', '9'],
  },
  cnm_p009_q1: {
    prompt: '比 6 大又比 8 小的数是几？', answer: '7', explanation: '7 在 6 和 8 中间。',
    character: 'peppa', characterName: '佩奇', caption: '佩奇把数字卡按从小到大排好。', groups: [{ label: '左边的数', count: 1, emoji: '🔢' }, { label: '右边的数', count: 1, emoji: '🔢' }], signs: ['6', '<', '?', '<', '8'],
    choices: [
      { id: 'A', label: '5', correct: false }, { id: 'B', label: '6', correct: false },
      { id: 'C', label: '7', correct: true }, { id: 'D', label: '8', correct: false },
    ],
  },
  cnm_p009_q2: {
    prompt: '9 比 7 大几？', answer: '2', explanation: '9－7＝2，9 比 7 大 2。',
    character: 'george', characterName: '乔治', caption: '乔治比较两组积木的数量。', groups: [{ label: '这一堆', count: 9, emoji: '🧱' }, { label: '这一堆', count: 7, emoji: '🧱' }], signs: ['−'],
  },
  cnm_p009_q3: {
    prompt: '一串有 9 颗珠子，另一串有 5 颗。9 颗的比 5 颗的多几颗？', answer: '4', explanation: '9－5＝4，第一串多 4 颗。',
    character: 'mummy-pig', characterName: '猪妈妈', caption: '猪妈妈把两串珠子放在一起比较。', groups: [{ label: '第一串', count: 9, emoji: '🔴' }, { label: '第二串', count: 5, emoji: '🔵' }], signs: ['−'],
  },
  cnm_p009_q4: {
    prompt: '8、6、9、7 这四个数里，最小的是几？', answer: '6', explanation: '6 比 7、8、9 都小，是最小的数。',
    character: 'daddy-pig', characterName: '猪爸爸', caption: '猪爸爸从四张数字卡中找出最小的数。', groups: [{ label: '数字卡片', count: 4, emoji: '🔢' }], signs: ['8', '6', '9', '7'],
  },
  cnm_p010_q1: { prompt: '有 5 支铅笔，又放进 2 支。一共有几支？', answer: '7', explanation: '5＋2＝7（支）。', character: 'peppa', characterName: '佩奇', caption: '佩奇把新铅笔放进笔筒。', groups: [{ label: '原来有', count: 5, emoji: '✏️' }, { label: '又放进', count: 2, emoji: '✏️', action: '＋' }], signs: ['＋'] },
  cnm_p010_q2: { prompt: '6 个皮球，再拿来 3 个。一共有几个？', answer: '9', explanation: '6＋3＝9（个）。', character: 'george', characterName: '乔治', caption: '乔治把新皮球和原来的放在一起。', groups: [{ label: '原来有', count: 6, emoji: '⚽' }, { label: '又拿来', count: 3, emoji: '⚽', action: '＋' }], signs: ['＋'] },
  cnm_p010_q3: { prompt: '池塘里有 3 只鸭子，又游来 4 只。现在有几只？', answer: '7', explanation: '3＋4＝7（只）。', character: 'rebecca-rabbit', characterName: '兔子朋友', caption: '小鸭游进池塘，和原来的小鸭会合。', groups: [{ label: '池塘里', count: 3, emoji: '🦆' }, { label: '游过来', count: 4, emoji: '🦆', action: '＋' }], signs: ['＋'] },
  cnm_p010_q4: { prompt: '红花 5 朵、黄花 2 朵，旁边还有 4 片叶子。花一共有几朵？', answer: '7', explanation: '只数花：5＋2＝7（朵）。叶子不是花。', character: 'emily-elephant', characterName: '大象朋友', caption: '大象朋友把花和叶子分开摆好。', groups: [{ label: '红花', count: 5, emoji: '🌺' }, { label: '黄花', count: 2, emoji: '🌼' }, { label: '叶子（不计入）', count: 4, emoji: '🍃' }], signs: ['＋'] },
  cnm_p011_q1: { prompt: '有 9 颗糖，拿走 2 颗。还剩几颗？', answer: '7', explanation: '9－2＝7（颗）。', character: 'peppa', characterName: '佩奇', caption: '佩奇把拿走的糖放到另一边。', groups: [{ label: '原来有', count: 9, emoji: '🍬' }, { label: '拿走', count: 2, emoji: '🍬', action: '−' }], signs: ['−'] },
  cnm_p011_q2: { prompt: '8 个气球飞走了 3 个。还剩几个？', answer: '5', explanation: '8－3＝5（个）。', character: 'george', characterName: '乔治', caption: '乔治看着几个气球飘上天空。', groups: [{ label: '原来有', count: 8, emoji: '🎈' }, { label: '飞走', count: 3, emoji: '🎈', action: '−' }], signs: ['−'] },
  cnm_p011_q3: { prompt: '7 支笔，借出 1 支。还剩几支？', answer: '6', explanation: '7－1＝6（支）。', character: 'mummy-pig', characterName: '猪妈妈', caption: '猪妈妈把借出的笔交给朋友。', groups: [{ label: '原来有', count: 7, emoji: '🖊️' }, { label: '借出去', count: 1, emoji: '🖊️', action: '−' }], signs: ['−'] },
  cnm_p011_q4: { prompt: '一共 9 个果子，其中梨有 4 个，其余都是苹果。苹果有几个？', answer: '5', explanation: '苹果是总数里去掉梨：9－4＝5（个）。', character: 'daddy-pig', characterName: '猪爸爸', caption: '9 个果子里有 4 个梨，其余是苹果。', groups: [{ label: '果子总数（里面有梨）', count: 9, emoji: '🍎' }], signs: ['−', '4'] },
  cnm_p012_q1: { prompt: '先有 1 只鸟，又飞来 4 只，再飞来 3 只。现在有几只？', answer: '8', explanation: '1＋4＝5，5＋3＝8（只）。', character: 'peppa', characterName: '佩奇', caption: '小鸟分两次飞到树枝上。', groups: [{ label: '先有', count: 1, emoji: '🐦' }, { label: '第一次飞来', count: 4, emoji: '🐦', action: '＋' }, { label: '第二次飞来', count: 3, emoji: '🐦', action: '＋' }], signs: ['＋', '＋'] },
  cnm_p012_q2: { prompt: '有 10 块饼干，吃了 3 块，又吃了 2 块。还剩几块？', answer: '5', explanation: '10－3＝7，7－2＝5（块）。', character: 'george', characterName: '乔治', caption: '乔治分两次吃掉几块饼干。', groups: [{ label: '原来有', count: 10, emoji: '🍪' }, { label: '第一次吃', count: 3, emoji: '🍪', action: '−' }, { label: '第二次吃', count: 2, emoji: '🍪', action: '−' }], signs: ['−', '−'] },
  cnm_p012_q3: { prompt: '树上先停 2 只鸟，又飞来 5 只，再飞来 1 只。现在有几只？', answer: '8', explanation: '2＋5＝7，7＋1＝8（只）。', character: 'rebecca-rabbit', characterName: '兔子朋友', caption: '小鸟一批一批地飞到树枝上。', groups: [{ label: '先停着', count: 2, emoji: '🐦' }, { label: '飞来一批', count: 5, emoji: '🐦', action: '＋' }, { label: '又飞来', count: 1, emoji: '🐦', action: '＋' }], signs: ['＋', '＋'] },
  cnm_p012_q4: { prompt: '有 9 颗珠子，先拿走 2 颗，再拿走 3 颗，最后拿走 1 颗。还剩几颗？', answer: '3', explanation: '9－2＝7，7－3＝4，4－1＝3（颗）。', character: 'mummy-pig', characterName: '猪妈妈', caption: '珠子被分三次拿走。', groups: [{ label: '原来有', count: 9, emoji: '🟣' }, { label: '第一次拿走', count: 2, emoji: '🟣', action: '−' }, { label: '第二次拿走', count: 3, emoji: '🟣', action: '−' }, { label: '最后拿走', count: 1, emoji: '🟣', action: '−' }], signs: ['−', '−', '−'] },
  cnm_p013_q1: { prompt: '有 4 支笔，又买来 2 支，送出 1 支。还剩几支？', answer: '5', explanation: '4＋2＝6，6－1＝5（支）。', character: 'peppa', characterName: '佩奇', caption: '佩奇先添上笔，再送出一支。', groups: [{ label: '原来有', count: 4, emoji: '✏️' }, { label: '买来', count: 2, emoji: '✏️', action: '＋' }, { label: '送出', count: 1, emoji: '✏️', action: '−' }], signs: ['＋', '−'] },
  cnm_p013_q2: { prompt: '9 个苹果，吃了 4 个，又买来 3 个。现在有几个？', answer: '8', explanation: '9－4＝5，5＋3＝8（个）。', character: 'george', characterName: '乔治', caption: '乔治先吃掉几个苹果，又拿到新苹果。', groups: [{ label: '原来有', count: 9, emoji: '🍎' }, { label: '吃掉', count: 4, emoji: '🍎', action: '−' }, { label: '又买来', count: 3, emoji: '🍎', action: '＋' }], signs: ['−', '＋'] },
  cnm_p013_q3: { prompt: '5 个同学在读书，又来了 3 个，走了 4 个。现在有几人？', answer: '4', explanation: '5＋3＝8，8－4＝4（人）。', character: 'emily-elephant', characterName: '大象朋友', caption: '同学们先加入读书，再有几人离开。', groups: [{ label: '正在读书', count: 5, emoji: '🧒' }, { label: '又来了', count: 3, emoji: '🧒', action: '＋' }, { label: '走了', count: 4, emoji: '🧒', action: '−' }], signs: ['＋', '−'] },
  cnm_p013_q4: { prompt: '停车场有 8 辆车，开走 3 辆，又开来 2 辆，再开走 1 辆。现在有几辆？', answer: '6', explanation: '8－3＝5，5＋2＝7，7－1＝6（辆）。', character: 'daddy-pig', characterName: '猪爸爸', caption: '停车场的车陆续开走、开来。', groups: [{ label: '原来有', count: 8, emoji: '🚗' }, { label: '开走', count: 3, emoji: '🚗', action: '−' }, { label: '开来', count: 2, emoji: '🚗', action: '＋' }, { label: '再开走', count: 1, emoji: '🚗', action: '−' }], signs: ['−', '＋', '−'] },
  cnm_p253_q1: { prompt: '树上有 4 只鸟，又飞来 5 只。现在有几只？', answer: '9', explanation: '飞来了要用加法：4＋5＝9（只）。', character: 'peppa', characterName: '佩奇', caption: '佩奇看着小鸟飞上树枝。', groups: [{ label: '树上原来有', count: 4, emoji: '🐦' }, { label: '又飞来', count: 5, emoji: '🐦', action: '＋' }], signs: ['＋'] },
  cnm_p253_q2: { prompt: '盘子里有 8 个苹果，吃掉 3 个。还剩几个？', answer: '5', explanation: '吃掉了要用减法：8－3＝5（个）。', character: 'george', characterName: '乔治', caption: '乔治从盘子里拿走几个苹果。', groups: [{ label: '原来有', count: 8, emoji: '🍎' }, { label: '吃掉', count: 3, emoji: '🍎', action: '−' }], signs: ['−'] },
  cnm_p253_q3: { prompt: '有 6 个桃，吃了 2 个。要求还剩几个，该怎样算？', answer: 'B', explanation: '从 6 个里去掉 2 个，用 6－2。',
    character: 'mummy-pig', characterName: '猪妈妈', caption: '猪妈妈把吃掉的桃从原来的桃里拿开。', groups: [{ label: '原来有', count: 6, emoji: '🍑' }, { label: '吃掉', count: 2, emoji: '🍑', action: '−' }], signs: ['−'],
    choices: [
      { id: 'A', label: '6＋2', correct: false }, { id: 'B', label: '6－2', correct: true }, { id: 'C', label: '2－6', correct: false },
    ] },
  cnm_p253_q4: { prompt: '有 7 个桃和 4 个梨，吃掉 3 个桃。桃还剩几个？', answer: '4', explanation: '问的是桃还剩几个，只算 7－3＝4，不要把梨加进去。',
    character: 'daddy-pig', characterName: '猪爸爸', caption: '猪爸爸把桃和梨分开放，注意只数桃。', groups: [{ label: '桃', count: 7, emoji: '🍑' }, { label: '梨（不计入）', count: 4, emoji: '🍐' }, { label: '吃掉的桃', count: 3, emoji: '🍑', action: '−' }], signs: ['−'] },
}

const extensionRows = [
  ['ext-p008-a', 'kp-cnm-p008', '6～10各数的认识', '7 的后面一个数是几？', '8', '7 再添 1 是 8。', '8 的后面一个数是几？', '9', '8 再添 1 是 9。', 'george', '🔢', 8],
  ['ext-p008-b', 'kp-cnm-p008', '6～10各数的认识', '9 是由几个一组成的？', '9', '9 里面有 9 个一。', '7 是由几个一组成的？', '7', '7 里面有 7 个一。', 'mummy-pig', '🟨', 7],
  ['ext-p009-a', 'kp-cnm-p009', '10以内数的比较', '比 5 大又比 7 小的数是几？', '6', '6 在 5 和 7 中间。', '比 8 大又比 10 小的数是几？', '9', '9 在 8 和 10 中间。', 'peppa', '🔢', 2],
  ['ext-p009-b', 'kp-cnm-p009', '10以内数的比较', '8 比 5 大几？', '3', '8－5＝3。', '9 比 6 大几？', '3', '9－6＝3。', 'daddy-pig', '🧱', 2],
  ['ext-p010-a', 'kp-cnm-p010', '10以内的加法', '4 个气球，又拿来 3 个。一共有几个？', '7', '4＋3＝7（个）。', '5 个气球，又拿来 4 个。一共有几个？', '9', '5＋4＝9（个）。', 'george', '🎈', 5],
  ['ext-p010-b', 'kp-cnm-p010', '10以内的加法', '3 朵红花和 5 朵黄花合起来有几朵？', '8', '3＋5＝8（朵）。', '4 朵红花和 4 朵黄花合起来有几朵？', '8', '4＋4＝8（朵）。', 'emily-elephant', '🌼', 4],
  ['ext-p011-a', 'kp-cnm-p011', '10以内的减法', '8 颗糖，拿走 3 颗，还剩几颗？', '5', '8－3＝5（颗）。', '9 颗糖，拿走 4 颗，还剩几颗？', '5', '9－4＝5（颗）。', 'peppa', '🍬', 8],
  ['ext-p011-b', 'kp-cnm-p011', '10以内的减法', '7 个苹果，吃掉 2 个，还剩几个？', '5', '7－2＝5（个）。', '10 个苹果，吃掉 3 个，还剩几个？', '7', '10－3＝7（个）。', 'george', '🍎', 7],
  ['ext-p012-a', 'kp-cnm-p012', '连加和连减', '先有 2 只鸭子，又游来 3 只，再游来 2 只。现在有几只？', '7', '2＋3＝5，5＋2＝7（只）。', '先有 1 只鸭子，又游来 4 只，再游来 3 只。现在有几只？', '8', '1＋4＝5，5＋3＝8（只）。', 'rebecca-rabbit', '🦆', 2],
  ['ext-p012-b', 'kp-cnm-p012', '连加和连减', '有 9 块饼干，吃了 2 块，又吃了 2 块。还剩几块？', '5', '9－2＝7，7－2＝5（块）。', '有 10 块饼干，吃了 3 块，又吃了 2 块。还剩几块？', '5', '10－3＝7，7－2＝5（块）。', 'george', '🍪', 9],
  ['ext-p013-a', 'kp-cnm-p013', '加减混合', '有 6 支笔，又买来 2 支，送出 3 支。还剩几支？', '5', '6＋2＝8，8－3＝5（支）。', '有 7 支笔，又买来 2 支，送出 4 支。还剩几支？', '5', '7＋2＝9，9－4＝5（支）。', 'peppa', '✏️', 6],
  ['ext-p013-b', 'kp-cnm-p013', '加减混合', '有 8 个苹果，吃了 2 个，又买来 1 个。现在有几个？', '7', '8－2＝6，6＋1＝7（个）。', '有 9 个苹果，吃了 3 个，又买来 2 个。现在有几个？', '8', '9－3＝6，6＋2＝8（个）。', 'mummy-pig', '🍎', 8],
  ['ext-p253-a', 'kp-cnm-p253', '加减法解决问题', '有 5 只兔子，又跑来 3 只。现在有几只？', '8', '又跑来表示合起来：5＋3＝8（只）。', '有 4 只兔子，又跑来 4 只。现在有几只？', '8', '又跑来表示合起来：4＋4＝8（只）。', 'rebecca-rabbit', '🐰', 5],
  ['ext-p253-b', 'kp-cnm-p253', '加减法解决问题', '有 8 个橘子，吃掉 2 个。还剩几个？', '6', '吃掉表示去掉：8－2＝6（个）。', '有 9 个橘子，吃掉 4 个。还剩几个？', '5', '吃掉表示去掉：9－4＝5（个）。', 'daddy-pig', '🍊', 8],
] as const

const knowledgeLabels: Record<string, string> = {
  cnm_p008: '6～10各数的认识', cnm_p009: '10以内数的比较', cnm_p010: '10以内的加法',
  cnm_p011: '10以内的减法', cnm_p012: '连加和连减', cnm_p013: '加减混合', cnm_p253: '加减法解决问题',
}

const characterNames: Record<string, string> = {
  peppa: '佩奇', george: '乔治', 'mummy-pig': '猪妈妈', 'daddy-pig': '猪爸爸',
  'grandpa-pig': '猪爷爷', 'emily-elephant': '大象朋友', 'rebecca-rabbit': '兔子朋友',
}

const extensionSigns: Record<string, string[]> = {
  'ext-p009-a': ['<', '?', '<'], 'ext-p009-b': ['−'],
  'ext-p010-a': ['＋'], 'ext-p010-b': ['＋'],
  'ext-p011-a': ['−'], 'ext-p011-b': ['−'],
  'ext-p012-a': ['＋', '＋'], 'ext-p012-b': ['−', '−'],
  'ext-p013-a': ['＋', '−'], 'ext-p013-b': ['−', '＋'],
  'ext-p253-a': ['＋'], 'ext-p253-b': ['−'],
}

const originalsTyped = originals as Array<{
  id: string; topicId: string; type: 'numeric' | 'choice'; prompt: string
  answer: string; explanation: string; choices?: Array<{ key: string, text: string }>
}>

function sourcePoint(topicId: string): string {
  return topicId.replace('cnm_', 'kp-cnm-')
}

function sourceOptions(question: (typeof originalsTyped)[number]): InteractionOption[] {
  return (question.choices ?? []).map(choice => ({
    id: choice.key,
    label: choice.text,
    correct: choice.key === question.answer,
    hint: '回到题目里找一找条件，再判断一次。',
  }))
}

function numberSpec(prompt: string, answer: string, hint: string): InteractionSpec {
  return {
    kind: 'number-entry', prompt, payload: { answer, maxDigits: answer.length }, hint,
    retryLine: '对着题目里的数量，再算一遍。', successLine: '你算出了正确的结果！',
  }
}

function chooseSpec(prompt: string, options: InteractionOption[], hint: string): Extract<InteractionSpec, { kind: 'choose-one' }> {
  return {
    kind: 'choose-one', prompt, payload: { options, columns: options.length === 3 ? 3 : 2 },
    hint, retryLine: '再看一遍题目和图里的数量，试试看。',
    successLine: '你找到了正确答案！',
  }
}

export const grade1MathUnitTwoOriginalTasks: UnitTwoTask[] = originalsTyped.map((question) => {
  const picture = pictureVariants[question.id]!
  const id = question.id.replaceAll('_', '-')
  const task: UnitTwoTask = {
    id, sourceId: question.id, sourceType: question.type,
    knowledgePointId: sourcePoint(question.topicId),
    knowledgePoint: knowledgeLabels[question.topicId]!, label: '原题',
    prompt: question.prompt, answer: question.answer, explanation: question.explanation,
    sourceChoices: question.choices,
    picture,
  }
  if (question.id === 'cnm_p008_q1') {
    task.originalInteraction = {
      kind: 'find-pattern', prompt: question.prompt,
      payload: { sequence: [6, 7, 8, 9, 10], blankIndex: 4, options: [8, 10, 9] },
      hint: '从 9 开始，接着往后数一个数。', retryLine: '不着急，顺着数字再看一看。',
      successLine: '佩奇和你一起找到了 9 后面的数！',
    }
    task.pictureInteraction = {
      kind: 'find-pattern', prompt: picture.prompt,
      payload: {
        sequence: picture.sequence!, blankIndex: picture.blankIndex as 0 | 1 | 2 | 3 | 4, options: [4, 6, 8],
        illustration: {
          backgroundImage: publicAsset('images/activities/number-sequence-garden.webp'),
          characterImage: publicAsset(`images/characters/${picture.character}.png`), description: picture.caption,
        },
      },
      hint: '先想一想，5 后面一个数是什么。', retryLine: '沿着数字小路再数一数。',
      successLine: '你帮佩奇找到了数字小路上缺少的数！',
    }
  }
  return task
})

export const grade1MathUnitTwoExtensionTasks: UnitTwoTask[] = extensionRows.map((row) => {
  const [id, knowledgePointId, knowledgePoint, prompt, answer, explanation,
    picturePrompt, pictureAnswer, pictureExplanation, character, emoji] = row
  const characterId = character as string
  const picturedCounts = [...picturePrompt.matchAll(/\d+/g)].map(match => Number(match[0]))
  return {
    id, sourceType: 'numeric', knowledgePointId, knowledgePoint, label: '拓展题',
    prompt, answer, explanation,
    picture: {
      prompt: picturePrompt, answer: pictureAnswer, explanation: pictureExplanation,
      character: characterId, characterName: characterNames[characterId]!,
      caption: `${characterNames[characterId]}用图里的物品来解决这道同类题。`,
      signs: extensionSigns[id],
      groups: picturedCounts.map((count, index) => ({
        label: index === 0 ? '题目数量' : '变化数量', count, emoji,
      })),
    },
  }
})

export const grade1MathUnitTwoTasks = [
  ...grade1MathUnitTwoOriginalTasks,
  ...grade1MathUnitTwoExtensionTasks,
]

export function interactionFor(task: UnitTwoTask, mode: PracticeMode): InteractionSpec {
  if (mode === 'digital' && task.originalInteraction)
    return task.originalInteraction
  if (mode === 'picture' && task.pictureInteraction)
    return task.pictureInteraction
  if (mode === 'digital') {
    const sourceQuestion = originalsTyped.find(q => q.id === task.sourceId)
    if (task.sourceType === 'choice' && sourceQuestion)
      return chooseSpec(task.prompt, sourceOptions(sourceQuestion), '先读清楚题目里的数字和变化。')
    return numberSpec(task.prompt, task.answer, '先读清楚题目里的数字和变化。')
  }
  if (task.sourceType === 'choice' && task.picture.choices)
    return chooseSpec(task.picture.prompt, task.picture.choices, '先观察图里的关系，再从选项里选一个。')
  return numberSpec(task.picture.prompt, task.picture.answer, '先观察图里的数量，再决定怎样计算。')
}

export function isDiagnosticTask(task: UnitTwoTask): boolean {
  return task.label === '原题' && task.sourceId?.endsWith('_q1') === true
}

export function characterAsset(id: string): string {
  return `/images/characters/${id}.png`
}
