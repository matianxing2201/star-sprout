import type { LearningWorld, WorldMapLayout } from './worlds/types'
import type { Category, Grade, GradeId, KnowledgePoint, Topic } from '@/domain/catalog/types'
import type { BadgeDefinition } from '@/domain/growth/types'
import type { InteractionSpec } from '@/domain/interaction/types'
import type { LearningTask, Lesson } from '@/domain/lesson/types'
import { z } from 'zod'

import { APP_ICON_NAMES, GRADE_IDS, TOPIC_KINDS } from '@/domain'

import { BADGE_IDS } from '@/domain/growth/types'
import { INTERACTION_KINDS, PROGRAM_BLOCK_KINDS } from '@/domain/interaction/types'
import { MASCOT_IDS } from '@/domain/mascot/types'
import { AUDIO_CLIP_ID_PATTERN } from '@/domain/shared/audio'
import { TONE_KEYS } from '@/domain/shared/tone'

/** 一整个内容包：目录 + 课程 + 跨学科世界 + 八个年级的地图 + 徽章 */
export interface ContentPack {
  grades: Grade[]
  categories: Category[]
  topics: Topic[]
  lessons: Lesson[]
  worlds: LearningWorld[]
  maps: Record<GradeId, WorldMapLayout>
  badges: BadgeDefinition[]
}

/**
 * 内容包校验（zod v4）
 * ====================
 *
 * 内容包是纯数据：教案转过来、后台随时可能补，一旦字段写歪，页面会静默地少一块。
 * 因此在“内容 → 运行时”之间加一道运行时闸门：schema 只描述运行时真正会读到的形状，
 * 跨字段的一致性（任务 id 不重复、星星 1~3、时长是正整数）在同一条链路里顺手守住。
 *
 * 类型漂移在编译期就会暴露：下面每个 schema 都用 z.ZodType<领域类型> 标注，
 * 领域类型改了而 schema 没跟着改，vue-tsc 直接报错。
 */

/* ------------------------------------------------------------------ */
/* 取值集合                                                            */
/* ------------------------------------------------------------------ */

/**
 * 取值集合全部来自 domain 的枚举常量，这里不重新声明一遍 ——
 * 领域里新增一种互动、一个色调或一枚徽章时，
 * schema 会自动跟上，不会出现“领域有、校验不认”的静默漂移。
 */
export const SCHEMA_VALUE_SETS = {
  appIcons: APP_ICON_NAMES,
  gradeIds: GRADE_IDS,
  tones: TONE_KEYS,
  mascotIds: MASCOT_IDS,
  topicKinds: TOPIC_KINDS,
  badgeIds: BADGE_IDS,
  interactionKinds: INTERACTION_KINDS,
  programBlockKinds: PROGRAM_BLOCK_KINDS,
} as const

const gradeIdSchema = z.enum(SCHEMA_VALUE_SETS.gradeIds)
const stageIdSchema = z.enum(['kindergarten', 'primary'])
const toneSchema = z.enum(SCHEMA_VALUE_SETS.tones)
const mascotIdSchema = z.enum(SCHEMA_VALUE_SETS.mascotIds)
/** 图标名必须是图标词汇表里的语义名 —— 写错会在这里被拦下，而不是渲染成空白 */
const iconSchema = z.enum(SCHEMA_VALUE_SETS.appIcons)

const topicKindSchema = z.enum(SCHEMA_VALUE_SETS.topicKinds)
const programBlockKindSchema = z.enum(SCHEMA_VALUE_SETS.programBlockKinds)

/** 百分比坐标：学习地图与场景热点共用 */
const percentSchema = z.number().min(0).max(100)

/**
 * 范读音頻片段 id。
 *
 * 只校验形状，不校验「文件是否真的存在」—— 文件由 scripts/generate-audio.mjs
 * 在构建期生成，内容包在写的时候它可能还没生成。
 * 「内容引用了片段但没生成」由 audio.spec.ts 在跑完 audio:sync 之后点名。
 */
const audioClipIdSchema = z.string().regex(
  AUDIO_CLIP_ID_PATTERN,
  '音频片段 id 必须是 kebab-case（它会直接变成文件名）',
)

/** 互动通用外壳里每个 kind 都会读到的字段 */
const interactionBaseShape = {
  prompt: z.string().min(1),
  hint: z.string().optional(),
  successLine: z.string().optional(),
  retryLine: z.string().optional(),
  stars: z.number().int().nonnegative().optional(),
  skippable: z.boolean().optional(),
  audioClipId: audioClipIdSchema.optional(),
}

/* ------------------------------------------------------------------ */
/* 目录层：Grade / Category / Topic / KnowledgePoint                   */
/* ------------------------------------------------------------------ */

/** 年级 */
export const gradeSchema: z.ZodType<Grade> = z.object({
  id: gradeIdSchema,
  name: z.string().min(1),
  stage: stageIdSchema,
  order: z.number().int().nonnegative(),
  ageRange: z.string().min(1),
  icon: iconSchema,
  tone: toneSchema,
  tagline: z.string().min(1),
  summary: z.string().min(1),
  nextHint: z.string().min(1),
})

/** 二级分类（知识领域） */
export const categorySchema: z.ZodType<Category> = z.object({
  id: z.string().min(1),
  gradeId: gradeIdSchema,
  name: z.string().min(1),
  icon: iconSchema,
  tone: toneSchema,
  summary: z.string().min(1),
  focus: z.array(z.string().min(1)),
  skills: z.array(z.string().min(1)),
  order: z.number().int().nonnegative(),
})

/** 知识点 */
export const knowledgePointSchema: z.ZodType<KnowledgePoint> = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  detail: z.string().optional(),
})

/** 学习主题（课程地图上的节点） */
export const topicSchema: z.ZodType<Topic> = z.object({
  id: z.string().min(1),
  gradeId: gradeIdSchema,
  categoryId: z.string().min(1),
  title: z.string().min(1),
  icon: iconSchema,
  kind: topicKindSchema,
  order: z.number().int().nonnegative(),
  objectives: z.array(z.string().min(1)),
  knowledgePoints: z.array(knowledgePointSchema),
  lessonIds: z.array(z.string().min(1)),
  level: z.union([z.literal(1), z.literal(2), z.literal(3)]),
})

/* ------------------------------------------------------------------ */
/* 互动层：InteractionSpec                                             */
/* ------------------------------------------------------------------ */

const interactionOptionSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  emoji: z.string().optional(),
  icon: iconSchema.optional(),
  image: z.string().optional(),
  correct: z.boolean().optional(),
  hint: z.string().optional(),
  tone: toneSchema.optional(),
  audioClipId: audioClipIdSchema.optional(),
})

const sceneTargetSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  x: percentSchema,
  y: percentSchema,
  size: z.number().positive().optional(),
  emoji: z.string().optional(),
  icon: iconSchema.optional(),
  correct: z.boolean().optional(),
  hint: z.string().optional(),
})

const sortItemSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  emoji: z.string().optional(),
  icon: iconSchema.optional(),
})

const dropZoneSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  emoji: z.string().optional(),
  icon: iconSchema.optional(),
  tone: toneSchema.optional(),
  accepts: z.array(z.string().min(1)),
})

const connectNodeSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  emoji: z.string().optional(),
  icon: iconSchema.optional(),
  audioClipId: audioClipIdSchema.optional(),
})

const memoryCardSchema = z.object({
  id: z.string().min(1),
  pairId: z.string().min(1),
  label: z.string().min(1),
  emoji: z.string().optional(),
  icon: iconSchema.optional(),
  audioClipId: audioClipIdSchema.optional(),
})

const colorFillRegionSchema = z.object({
  id: z.string().min(1),
  path: z.string().min(1),
  expectedTone: toneSchema.optional(),
})

const sliderStateSchema = z.object({
  from: z.number(),
  icon: iconSchema.optional(),
  emoji: z.string().min(1),
  caption: z.string().min(1),
})

const hotspotSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  x: percentSchema,
  y: percentSchema,
  reveal: z.string().min(1),
  emoji: z.string().optional(),
  icon: iconSchema.optional(),
})

const programBlockSchema = z.object({
  id: z.string().min(1),
  kind: programBlockKindSchema,
  label: z.string().min(1),
  emoji: z.string().optional(),
  icon: iconSchema.optional(),
  limit: z.number().int().positive().optional(),
})

/** 单选：恰好一个正确答案 */
const chooseOneSchema = z.object({
  ...interactionBaseShape,
  kind: z.literal('choose-one'),
  payload: z.object({
    options: z.array(interactionOptionSchema).min(2),
    columns: z.union([z.literal(2), z.literal(3), z.literal(4)]).optional(),
    layout: z.enum(['card', 'scene']).optional(),
  }).refine(
    payload => payload.options.filter(option => option.correct === true).length === 1,
    { message: 'choose-one 必须且只能有一个 correct 选项' },
  ),
})

/** 多选：至少一个正确答案 */
const chooseManySchema = z.object({
  ...interactionBaseShape,
  kind: z.literal('choose-many'),
  payload: z.object({
    options: z.array(interactionOptionSchema).min(2),
    columns: z.union([z.literal(2), z.literal(3), z.literal(4)]).optional(),
    requiredCount: z.number().int().positive().optional(),
  }).refine(
    payload => payload.options.some(option => option.correct === true),
    { message: 'choose-many 至少要有一个 correct 选项' },
  ),
})

/** 场景点击：目标坐标都是百分比 */
const tapTargetSchema = z.object({
  ...interactionBaseShape,
  kind: z.literal('tap-target'),
  payload: z.object({
    background: z.string().optional(),
    backgroundTone: toneSchema.optional(),
    targets: z.array(sceneTargetSchema).min(1),
    requiredCount: z.number().int().positive().optional(),
  }),
})

/** 拖动排序：correctOrder 必须与 items 一一对应 */
const dragSortSchema = z.object({
  ...interactionBaseShape,
  kind: z.literal('drag-sort'),
  payload: z.object({
    items: z.array(sortItemSchema).min(2),
    correctOrder: z.array(z.string().min(1)),
    axisHint: z.string().optional(),
  }).refine(
    payload => payload.correctOrder.length === payload.items.length
      && payload.items.every(item => payload.correctOrder.includes(item.id)),
    { message: 'drag-sort 的 correctOrder 必须恰好包含全部 item id' },
  ),
})

/** 拖拽归类：每个物品最多只能有一个归宿 */
const dragDropSchema = z.object({
  ...interactionBaseShape,
  kind: z.literal('drag-drop'),
  payload: z.object({
    zones: z.array(dropZoneSchema).min(1),
    items: z.array(sortItemSchema).min(1),
  }).refine(
    payload => new Set(payload.zones.flatMap(zone => zone.accepts)).size
      === payload.zones.flatMap(zone => zone.accepts).length,
    { message: 'drag-drop 的同一个物品不能被两个区域同时接收' },
  ),
})

/** 连线配对：pairs 必须引用真实存在的左右节点 */
const connectLineSchema = z.object({
  ...interactionBaseShape,
  kind: z.literal('connect-line'),
  payload: z.object({
    left: z.array(connectNodeSchema).min(1),
    right: z.array(connectNodeSchema).min(1),
    pairs: z.array(z.tuple([z.string().min(1), z.string().min(1)])).min(1),
  }).refine(
    payload => payload.pairs.every(([leftId, rightId]) =>
      payload.left.some(node => node.id === leftId) && payload.right.some(node => node.id === rightId),
    ),
    { message: 'connect-line 的 pairs 引用了不存在的节点' },
  ),
})

/** 记忆配对：牌必须成对 */
const memoryPairSchema = z.object({
  ...interactionBaseShape,
  kind: z.literal('memory-pair'),
  payload: z.object({
    cards: z.array(memoryCardSchema).min(2),
  }).refine(
    payload => new Set(payload.cards.map(card => card.pairId)).size * 2 === payload.cards.length,
    { message: 'memory-pair 的卡片必须两两成对' },
  ),
})

/** 涂色：色板与区域都不能为空 */
const colorFillSchema = z.object({
  ...interactionBaseShape,
  kind: z.literal('color-fill'),
  payload: z.object({
    width: z.number().positive(),
    height: z.number().positive(),
    regions: z.array(colorFillRegionSchema).min(1),
    palette: z.array(toneSchema).min(1),
  }),
})

/** 自由绘画 */
const drawSchema = z.object({
  ...interactionBaseShape,
  kind: z.literal('draw'),
  payload: z.object({
    background: z.string().optional(),
    width: z.number().positive(),
    height: z.number().positive(),
    colors: z.array(z.string().min(1)).optional(),
    brushSize: z.number().positive().optional(),
  }),
})

/** 滑块实验：target 必须落在 min~max 之间 */
const sliderExploreSchema = z.object({
  ...interactionBaseShape,
  kind: z.literal('slider-explore'),
  payload: z.object({
    min: z.number(),
    max: z.number(),
    step: z.number().positive().optional(),
    initial: z.number().optional(),
    minLabel: z.string().min(1),
    maxLabel: z.string().min(1),
    unit: z.string().optional(),
    states: z.array(sliderStateSchema).min(1),
    target: z.number(),
  }).refine(
    payload => payload.max > payload.min
      && payload.target >= payload.min
      && payload.target <= payload.max,
    { message: 'slider-explore 需要 max > min，且 target 落在区间内' },
  ),
})

/** 探索热点 */
const hotspotExploreSchema = z.object({
  ...interactionBaseShape,
  kind: z.literal('hotspot-explore'),
  payload: z.object({
    background: z.string().optional(),
    backgroundTone: toneSchema.optional(),
    hotspots: z.array(hotspotSchema).min(1),
    requiredCount: z.number().int().positive().optional(),
  }),
})

/** 编程积木：solution 只能由 palette 里的积木拼成 */
const sequenceBuildSchema = z.object({
  ...interactionBaseShape,
  kind: z.literal('sequence-build'),
  payload: z.object({
    palette: z.array(programBlockSchema).min(1),
    solution: z.array(z.string().min(1)).min(1),
    goal: z.string().min(1),
    actor: z.object({ emoji: z.string().min(1).optional(), icon: iconSchema.optional(), label: z.string().min(1) }).optional(),
    target: z.object({ emoji: z.string().min(1).optional(), icon: iconSchema.optional(), label: z.string().min(1) }).optional(),
  }).refine(
    payload => payload.solution.every(id => payload.palette.some(block => block.id === id)),
    { message: 'sequence-build 的 solution 引用了 palette 里没有的积木' },
  ),
})

/** 一个互动：判别联合，kind 决定 payload 的具体形状 */
const measureStampSchema = z.object({
  kind: z.literal('measure-stamp'),
  ...interactionBaseShape,
  payload: z.object({
    measures: z.array(z.object({
      id: z.string().min(1),
      label: z.string().min(1),
      tone: toneSchema.optional(),
    })).min(2),
    items: z.array(z.object({
      id: z.string().min(1),
      label: z.string().min(1),
      emoji: z.string().optional(),
      icon: iconSchema.optional(),
      image: z.string().optional(),
      measureId: z.string().min(1),
      count: z.number().int().positive().optional(),
    })).min(1),
    recital: z.string().optional(),
  }).superRefine((payload, context) => {
    const measureIds = new Set(payload.measures.map(item => item.id))
    for (const item of payload.items) {
      if (!measureIds.has(item.measureId)) {
        context.addIssue({
          code: 'custom',
          message: `物品 ${item.id} 指向了不存在的量词 ${item.measureId}`,
        })
      }
    }
    const itemIds = new Set(payload.items.map(item => item.id))
    if (itemIds.size !== payload.items.length) {
      context.addIssue({ code: 'custom', message: '量词印章的物品 id 重复了' })
    }
  }),
})

const numberTileSchema = z.object({
  kind: z.literal('number-tile'),
  ...interactionBaseShape,
  payload: z.object({
    slots: z.array(z.object({
      id: z.string().min(1),
      answer: z.number().int().min(0).max(9),
      visibleStrokes: z.array(z.number().int().min(0).max(6)).optional(),
      rule: z.string().min(1).optional(),
    })).min(1),
    tiles: z.array(z.number().int().min(0).max(9)).min(1),
    clues: z.array(z.string().min(1)).min(1),
  }).superRefine((payload, context) => {
    const slotIds = new Set(payload.slots.map(slot => slot.id))
    if (slotIds.size !== payload.slots.length)
      context.addIssue({ code: 'custom', message: '填数字的格子 id 重复了' })

    // 每个格子只能填一次：数字块的数量必须够，而且不能出现重复的数字块
    if (payload.tiles.length !== payload.slots.length) {
      context.addIssue({
        code: 'custom',
        message: `数字块有 ${payload.tiles.length} 个，格子有 ${payload.slots.length} 个，两边必须一样多`,
      })
    }
    if (new Set(payload.tiles).size !== payload.tiles.length)
      context.addIssue({ code: 'custom', message: '数字块里出现了重复的数字' })

    // 答案必须是数字块里有的，否则这题无解
    const tileSet = new Set(payload.tiles)
    for (const slot of payload.slots) {
      if (!tileSet.has(slot.answer)) {
        context.addIssue({
          code: 'custom',
          message: `格子 ${slot.id} 的答案 ${slot.answer} 不在数字块里，这题填不出来`,
        })
      }
    }

    // 露出的笔画重复没有意义，孩子看到的每个格子应当长得不一样
    const strokeKeys = payload.slots.map(slot => (slot.visibleStrokes ?? []).slice().sort().join('-'))
    const filled = strokeKeys.filter(key => key.length > 0)
    if (new Set(filled).size !== filled.length)
      context.addIssue({ code: 'custom', message: '有两个格子露出了相同的笔画，孩子分不出它们' })
  }),
})

export const interactionSchema: z.ZodType<InteractionSpec> = z.discriminatedUnion('kind', [
  chooseOneSchema,
  chooseManySchema,
  tapTargetSchema,
  dragSortSchema,
  dragDropSchema,
  connectLineSchema,
  memoryPairSchema,
  colorFillSchema,
  drawSchema,
  sliderExploreSchema,
  hotspotExploreSchema,
  sequenceBuildSchema,
  measureStampSchema,
  numberTileSchema,
])

/* ------------------------------------------------------------------ */
/* 课程层：Lesson / LearningTask                                       */
/* ------------------------------------------------------------------ */

const taskBaseShape = {
  id: z.string().min(1),
  title: z.string().min(1),
  instruction: z.string().optional(),
  mascotLine: z.string().optional(),
  audioClipId: audioClipIdSchema.optional(),
}

/** 角色引入 */
const introTaskSchema = z.object({
  ...taskBaseShape,
  kind: z.literal('intro'),
  story: z.object({
    mascot: mascotIdSchema,
    lines: z.array(z.string().min(1)).min(1),
    mood: z.enum(['happy', 'curious', 'thinking', 'cheering']).optional(),
  }),
})

/** 知识发现：一张卡只讲一件事 */
const discoverTaskSchema = z.object({
  ...taskBaseShape,
  kind: z.literal('discover'),
  discovery: z.object({
    cards: z.array(z.object({
      id: z.string().min(1),
      icon: iconSchema,
      title: z.string().min(1),
      body: z.string().min(1),
      tone: toneSchema.optional(),
      tip: z.string().optional(),
    })).min(1),
  }),
})

/** 动手探索 / 小试身手 / 挑战任务：都靠互动列表驱动 */
const practiceTaskSchema = z.object({
  ...taskBaseShape,
  kind: z.enum(['interaction', 'practice', 'challenge']),
  interactions: z.array(interactionSchema).min(1),
})

/** 领取奖励 */
const rewardTaskSchema = z.object({
  ...taskBaseShape,
  kind: z.literal('reward'),
  reward: z.object({
    stars: z.union([z.literal(1), z.literal(2), z.literal(3)]),
    message: z.string().min(1),
    badgeId: z.string().optional(),
  }),
})

/** 一个学习任务 */
export const taskSchema: z.ZodType<LearningTask> = z.discriminatedUnion('kind', [
  introTaskSchema,
  discoverTaskSchema,
  practiceTaskSchema,
  rewardTaskSchema,
])

/** 一节课：任务 id 不重复、星星 1~3、时长是正整数 */
export const lessonSchema: z.ZodType<Lesson> = z.object({
  id: z.string().min(1),
  gradeId: gradeIdSchema,
  categoryId: z.string().min(1),
  topicId: z.string().min(1),
  title: z.string().min(1),
  icon: iconSchema,
  question: z.string().min(1),
  mascot: mascotIdSchema,
  minutes: z.number().int().positive(),
  objectives: z.array(z.string().min(1)),
  knowledgePoints: z.array(knowledgePointSchema),
  tone: toneSchema,
  tasks: z.array(taskSchema).min(1),
  reward: z.object({
    stars: z.union([z.literal(1), z.literal(2), z.literal(3)]),
    badgeId: z.string().optional(),
    unlocksTopicIds: z.array(z.string().min(1)).optional(),
    message: z.string().min(1),
  }),
}).superRefine((lesson, context) => {
  const seen = new Set<string>()
  for (const task of lesson.tasks) {
    if (seen.has(task.id)) {
      context.addIssue({ code: 'custom', message: `任务 id 在同一节课里重复了：${task.id}` })
    }
    seen.add(task.id)
  }
})

/** 一个年级的内容包（目录 + 主题 + 课程） */
export const gradeContentSchema = z.object({
  grade: gradeSchema,
  categories: z.array(categorySchema),
  topics: z.array(topicSchema),
  lessons: z.array(lessonSchema),
})

/* ------------------------------------------------------------------ */
/* 成长层：BadgeDefinition                                             */
/* ------------------------------------------------------------------ */

const badgeRuleSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('stars'), count: z.number().int().positive() }),
  z.object({ type: z.literal('streak'), days: z.number().int().positive() }),
  z.object({ type: z.literal('lessons'), count: z.number().int().positive() }),
  z.object({ type: z.literal('perfect-lessons'), count: z.number().int().positive() }),
  z.object({ type: z.literal('category-lessons'), categoryId: z.string().min(1), count: z.number().int().positive() }),
  z.object({ type: z.literal('topic-stars'), topicId: z.string().min(1), count: z.number().int().positive() }),
  z.object({ type: z.literal('learning-days'), days: z.number().int().positive() }),
])

/** 徽章定义 */
export const badgeSchema: z.ZodType<BadgeDefinition> = z.object({
  id: z.enum(SCHEMA_VALUE_SETS.badgeIds),
  name: z.string().min(1),
  icon: iconSchema,
  description: z.string().min(1),
  tone: toneSchema,
  rule: badgeRuleSchema,
})

/* ------------------------------------------------------------------ */
/* 跨学科层：LearningWorld / WorldMapLayout                            */
/* ------------------------------------------------------------------ */

/** 一个学习世界 */
export const learningWorldSchema: z.ZodType<LearningWorld> = z.object({
  id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, '学习世界 id 必须是 kebab-case'),
  name: z.string().min(1),
  icon: iconSchema,
  tone: toneSchema,
  tagline: z.string().min(1),
  description: z.string().min(1),
  gradeIds: z.array(gradeIdSchema),
  categoryIds: z.array(z.string().min(1)),
})

/** 一张学习地图：路径只能连接图上出现过的世界 */
export const worldMapLayoutSchema: z.ZodType<WorldMapLayout> = z.object({
  gradeId: gradeIdSchema,
  title: z.string().min(1),
  nodes: z.array(z.object({
    worldId: z.string().min(1),
    x: percentSchema,
    y: percentSchema,
    size: z.enum(['sm', 'md', 'lg']),
    lockedInFog: z.boolean().optional(),
  })).min(1),
  paths: z.array(z.object({
    from: z.string().min(1),
    to: z.string().min(1),
    curve: z.enum(['left', 'right', 'straight']).optional(),
  })),
}).superRefine((layout, context) => {
  const nodeIds = new Set(layout.nodes.map(node => node.worldId))
  for (const path of layout.paths) {
    if (!nodeIds.has(path.from) || !nodeIds.has(path.to)) {
      context.addIssue({
        code: 'custom',
        message: `路径 ${path.from} → ${path.to} 引用了本图不存在的世界`,
      })
    }
  }
})

/** 8 个年级的地图必须齐全 —— 少一个年级首页就会空一块 */
const gradeMapSchema = z.object({
  'nursery': worldMapLayoutSchema,
  'preschool': worldMapLayoutSchema,
  'grade-1': worldMapLayoutSchema,
  'grade-2': worldMapLayoutSchema,
  'grade-3': worldMapLayoutSchema,
  'grade-4': worldMapLayoutSchema,
  'grade-5': worldMapLayoutSchema,
  'grade-6': worldMapLayoutSchema,
})

/** 整个内容包 */
export const contentPackSchema: z.ZodType<ContentPack> = z.object({
  grades: z.array(gradeSchema).min(1),
  categories: z.array(categorySchema),
  topics: z.array(topicSchema),
  lessons: z.array(lessonSchema),
  worlds: z.array(learningWorldSchema).min(1),
  maps: gradeMapSchema,
  badges: z.array(badgeSchema).min(1),
})

/* ------------------------------------------------------------------ */
/* 入口                                                                */
/* ------------------------------------------------------------------ */

/** 把 zod 的问题压成一行中文，方便内容作者直接定位 */
function formatIssues(error: z.ZodError): string[] {
  return error.issues.map((issue) => {
    const path = issue.path.length > 0 ? issue.path.join('.') : '(根)'
    return `${path}: ${issue.message}`
  })
}

/** 校验并返回内容包；不合法时抛出可直接展示的错误 */
export function parseContentPack(input: unknown): ContentPack {
  const result = contentPackSchema.safeParse(input)
  if (!result.success) {
    throw new Error(`内容包校验失败：\n${formatIssues(result.error).join('\n')}`)
  }
  return result.data
}

/** 校验内容包；不抛异常，把问题一起返回给调用方 */
export function validateContentPack(input: unknown): { ok: true, value: ContentPack } | { ok: false, errors: string[] } {
  const result = contentPackSchema.safeParse(input)
  if (result.success) {
    return { ok: true, value: result.data }
  }
  return { ok: false, errors: formatIssues(result.error) }
}
