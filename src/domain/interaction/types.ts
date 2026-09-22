import type { MascotId } from '../mascot/types'
import type { AudioClipId } from '../shared/audio'
import type { AppIconName } from '../shared/icons'
import type { ToneKey } from '../shared/tone'

/**
 * 交互框架（Interaction Framework）
 * ==================================
 *
 * 产品要求：“每一个知识点都尽量转成互动”“不要把课程写死在页面代码里”。
 *
 * 因此所有互动都被抽象成声明式的 InteractionSpec：
 *   - 内容侧（教案 → 内容包）只产出数据；
 *   - 视图侧只负责把 kind 映射到一个组件（见 features/interactions/registry.ts）。
 *
 * 新增一种互动方式 = 新增一个 payload 类型 + 注册一个组件，
 * 不需要改动课程页、播放器或任何页面。
 *
 * 关于图标：互动里的视觉元素同时支持 `icon` 与 `emoji`，规则是
 *   - **结构性的东西**（选项卡、分类筐、积木）用 `icon`，与界面一起呼吸；
 *   - **场景里的东西**（一只鸟、一根胡萝卜、一个皮球）用 `emoji`，它们本身就是插画。
 * 两者都给时 `icon` 优先（见 ui/icons/KVisual.vue），所以教案可以按需选择。
 */

export const INTERACTION_KINDS = [
  /** 单选：点一个就对 */
  'choose-one',
  /** 多选：选出所有符合条件的 */
  'choose-many',
  /** 场景点击：在图里点出目标（找不同 / 找信息） */
  'tap-target',
  /** 拖动排序：把诗句、步骤排好 */
  'drag-sort',
  /** 拖拽归类：把物品拖进对应的框 */
  'drag-drop',
  /** 连线配对：左右两列连起来 */
  'connect-line',
  /** 记忆配对：翻牌找成对 */
  'memory-pair',
  /** 涂色：点区域上色 */
  'color-fill',
  /** 绘画：自由画线 */
  'draw',
  /** 滑块实验：拖动温度计、观察变化 */
  'slider-explore',
  /** 探索热点：点击场景里的物件触发发现 */
  'hotspot-explore',
  /** 编程积木：拼出指令序列 */
  'sequence-build',
  /** 量词印章：给物品盖上正确的量词，并拼出「一座城堡」这样的短语 */
  'measure-stamp',
  /** 填数字：按条件把数字贴进方格（七段数码管，笔画可以遮住） */
  'number-tile',
] as const

export type InteractionKind = (typeof INTERACTION_KINDS)[number]

/** 互动的通用外壳：提示、鼓励、星星都由框架统一处理 */
export interface InteractionBase {
  /** 给孩子的任务描述，一句话，尽量不超过 20 字 */
  prompt: string
  /** 温柔提示：答错后给出一次，绝不直接给答案 */
  hint?: string
  /** 成功时角色说的话 */
  successLine?: string
  /** 需要重试时角色说的话，默认取角色的 nudge */
  retryLine?: string
  /** 完成该互动获得的星星数 */
  stars?: number
  /** 是否允许跳过（长任务给孩子的“出口”） */
  skippable?: boolean
  /**
   * 整个互动的范读音频。
   * 用于「先听一遍，再动手」的场合（例如整组字念一遍）。
   * 单个选项的发声用 InteractionOption.audioClipId。
   */
  audioClipId?: AudioClipId
}

/* ------------------------------------------------------------------ */
/* 各 kind 的专属数据                                                  */
/* ------------------------------------------------------------------ */

export interface InteractionOption {
  id: string
  label: string
  icon?: AppIconName
  emoji?: string
  image?: string
  /** 是否为正确答案 */
  correct?: boolean
  /** 选错时的专属提示 */
  hint?: string
  tone?: ToneKey
  /** 点击这一项时播放的范读（认字卡要能点一下听读音） */
  audioClipId?: AudioClipId
}

export interface ChooseOnePayload {
  options: InteractionOption[]
  /** 展示列数，默认按选项数量自适应 */
  columns?: 2 | 3 | 4
  /** 选项是“卡片”还是“场景里的大图” */
  layout?: 'card' | 'scene'
}

export interface ChooseManyPayload {
  options: InteractionOption[]
  columns?: 2 | 3 | 4
  /** 需要选中的数量，缺省则等于 correct 选项数量 */
  requiredCount?: number
}

/** 场景中的可点击目标：坐标用百分比，保证任意屏幕尺寸下都对齐 */
export interface SceneTarget {
  id: string
  label: string
  x: number
  y: number
  size?: number
  icon?: AppIconName
  emoji?: string
  correct?: boolean
  hint?: string
}

export interface TapTargetPayload {
  /** 场景背景图（public 下的相对路径），缺省时用渐变底色 */
  background?: string
  backgroundTone?: ToneKey
  targets: SceneTarget[]
  /** 需要找到的目标数量 */
  requiredCount?: number
}

export interface SortItem {
  id: string
  label: string
  icon?: AppIconName
  emoji?: string
}

export interface DragSortPayload {
  items: SortItem[]
  /** 正确顺序，由 item id 组成 */
  correctOrder: string[]
  /** 排序方向提示，例如“从早到晚” */
  axisHint?: string
}

export interface DropZone {
  id: string
  label: string
  icon?: AppIconName
  emoji?: string
  tone?: ToneKey
  /** 该区域期望接收的 item id */
  accepts: string[]
}

export interface DraggableItem {
  id: string
  label: string
  icon?: AppIconName
  emoji?: string
  tone?: ToneKey
}

export interface DragDropPayload {
  zones: DropZone[]
  items: DraggableItem[]
}

export interface ConnectNode {
  id: string
  label: string
  icon?: AppIconName
  emoji?: string
  /** 点中这个节点时播放的范读（「汉字找朋友」要能听到读音） */
  audioClipId?: AudioClipId
}

export interface ConnectLinePayload {
  left: ConnectNode[]
  right: ConnectNode[]
  /** 正确答案：[左 id, 右 id] */
  pairs: [string, string][]
}

export interface MemoryCard {
  id: string
  pairId: string
  label: string
  icon?: AppIconName
  emoji?: string
  /** 翻开这张牌时播放的范读（认字卡翻到就要读出那个字） */
  audioClipId?: AudioClipId
}

export interface MemoryPairPayload {
  cards: MemoryCard[]
}

export interface ColorFillRegion {
  id: string
  /** SVG path 的 d 属性 */
  path: string
  /** 提示：这一块应该涂什么颜色 */
  expectedTone?: ToneKey
}

export interface ColorFillPayload {
  /** 画布尺寸，用于生成 SVG viewBox */
  width: number
  height: number
  regions: ColorFillRegion[]
  palette: ToneKey[]
}

export interface DrawPayload {
  /** 底图（描红、临摹用），缺省则是空白画纸 */
  background?: string
  width: number
  height: number
  /** 画笔颜色 */
  colors?: string[]
  brushSize?: number
}

export interface SliderState {
  /** 达到该阈值（含）时展示这个状态 */
  from: number
  icon?: AppIconName
  emoji: string
  caption: string
}

export interface SliderExplorePayload {
  min: number
  max: number
  step?: number
  initial?: number
  minLabel: string
  maxLabel: string
  unit?: string
  /** 状态按 from 升序排列，框架取最后一个满足 from <= value 的状态 */
  states: SliderState[]
  /** 孩子需要把滑块拖到该值才算完成任务 */
  target: number
}

export interface Hotspot {
  id: string
  label: string
  x: number
  y: number
  /** 点击后揭示的知识卡片 */
  reveal: string
  icon?: AppIconName
  emoji?: string
}

export interface HotspotExplorePayload {
  background?: string
  backgroundTone?: ToneKey
  hotspots: Hotspot[]
  /** 需要探索出的数量，缺省为全部 */
  requiredCount?: number
}

export const PROGRAM_BLOCK_KINDS = ['move', 'turn', 'repeat', 'jump', 'wait'] as const
export type ProgramBlockKind = (typeof PROGRAM_BLOCK_KINDS)[number]

export interface ProgramBlock {
  id: string
  kind: ProgramBlockKind
  label: string
  icon?: AppIconName
  emoji?: string
  /** 该积木可用的次数上限，缺省不限 */
  limit?: number
}

export interface SequenceBuildPayload {
  /** 可拖拽的积木 */
  palette: ProgramBlock[]
  /** 正确序列，由 block id 组成 */
  solution: string[]
  /** 目标描述，例如“让小狐狸走到胡萝卜那里” */
  goal: string
  /** 舞台上的角色与目标物 */
  actor?: { emoji?: string, icon?: AppIconName, label: string }
  target?: { emoji?: string, icon?: AppIconName, label: string }
}

/* ------------------------------------------------------------------ */
/* 量词印章（measure-stamp）                                            */
/* ------------------------------------------------------------------ */

/**
 * 要盖章的物品。
 * 物体本身是「场景道具」，所以用 emoji / 图片；需要矢量表达时也可给 icon。
 */
export interface MeasureStampItem {
  id: string
  label: string
  emoji?: string
  icon?: AppIconName
  image?: string
  /** 正确的量词 id */
  measureId: string
  /** 数量，默认 1；用来呈现「一座」「三座」 */
  count?: number
}

/** 可选的量词印章 */
export interface MeasureStamp {
  id: string
  /** 印章上的字，例如「座」 */
  label: string
  tone?: ToneKey
}

export interface MeasureStampPayload {
  measures: MeasureStamp[]
  items: MeasureStampItem[]
  /** 全部盖对之后连起来念的整句，例如「一座城堡、一辆汽车、一朵云」 */
  recital?: string
}

/* ------------------------------------------------------------------ */
/* 填数字（number-tile）                                                */
/* ------------------------------------------------------------------ */

/**
 * 一个待填的格子。
 *
 * 「被遮住的数字」是怎么表达的
 * ---------------------------
 * 数字用七段数码管画出来，每一段有编号：
 *
 *        ⓪
 *      ⑤  ①
 *        ⑥
 *      ④  ②
 *        ③
 *
 * `visibleStrokes` 只列**露出来**的那几段 —— 和图里一样，孩子看到的是
 * 残缺的笔画，靠「这是几」加上题面的条件去猜。整段都不给（undefined）
 * 就是这个格子被完全遮住，只能靠条件推。
 */
export interface NumberSlot {
  id: string
  /** 这一格正确的数字 */
  answer: number
  /** 露出来的笔画编号（0~6）；不给表示整格被遮住 */
  visibleStrokes?: number[]
  /** 针对这一格的条件，答错时作为提示回给孩子；不写则退回互动级的 hint */
  rule?: string
}

export interface NumberTilePayload {
  /** 从左往右的格子，数组顺序就是位置顺序 */
  slots: NumberSlot[]
  /** 可以拖的数字块，显示时会打乱 */
  tiles: number[]
  /** 整题的条件，逐条摆出来让孩子随时回头看 */
  clues: string[]
}

/* ------------------------------------------------------------------ */
/* 判别联合                                                            */
/* ------------------------------------------------------------------ */

export interface InteractionPayloadMap {
  'choose-one': ChooseOnePayload
  'choose-many': ChooseManyPayload
  'tap-target': TapTargetPayload
  'drag-sort': DragSortPayload
  'drag-drop': DragDropPayload
  'connect-line': ConnectLinePayload
  'memory-pair': MemoryPairPayload
  'color-fill': ColorFillPayload
  'draw': DrawPayload
  'slider-explore': SliderExplorePayload
  'hotspot-explore': HotspotExplorePayload
  'sequence-build': SequenceBuildPayload
  'measure-stamp': MeasureStampPayload
  'number-tile': NumberTilePayload
}

export type InteractionSpec = {
  [K in InteractionKind]: InteractionBase & {
    kind: K
    payload: InteractionPayloadMap[K]
  }
}[InteractionKind]

/** 内容包作者在写 payload 时使用的类型别名 */
export type InteractionPayloadOf<K extends InteractionKind> = InteractionPayloadMap[K]

/** 互动的运行结果，由框架回传给播放器 */
export interface InteractionResult {
  interactionKind: InteractionKind
  correct: boolean
  /** 孩子尝试的次数（用于家长端“薄弱点”分析） */
  attempts: number
  /** 是否使用了提示 */
  usedHint: boolean
  /** 是否跳过 */
  skipped: boolean
  stars: number
  /** 采集到的作答，用于后续个性化推荐 */
  answer?: unknown
}

/** 互动组件必须实现的统一契约 */
export interface InteractionEmits {
  (event: 'resolved', result: InteractionResult): void
}

export interface InteractionProps {
  spec: InteractionSpec
  mascot: MascotId
}
