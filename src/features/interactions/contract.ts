import type { Component } from 'vue'

import type { AppIconName, InteractionKind, InteractionPayloadMap } from '@/domain'

/**
 * 互动组件契约
 * ============
 *
 * 每一种互动（拖拽排序、连线、涂色……）都是一个普通组件，只做两件事：
 *   1. 根据 payload 渲染可操作的画面；
 *   2. 用 `solved` / `missed` 两个事件把「孩子做对了 / 差一点点」告诉外层。
 *
 * 提示、重试、星星、角色反馈、动效分级全部由 InteractionShell 统一处理，
 * 因此每一种互动不需要（也不允许）自己写奖励逻辑 —— 这是“不过度奖励”的制度保证。
 */

/** 所有互动组件都接收的 props */
export interface InteractionComponentProps<K extends InteractionKind> {
  payload: InteractionPayloadMap[K]
  /** 结算后禁用交互，避免孩子重复点击 */
  disabled?: boolean
}

/** 所有互动组件都必须声明的事件 */
export interface InteractionComponentEmits {
  /** 孩子完成了这一步 */
  (event: 'solved', answer?: unknown): void
  /** 差一点点：可以带一句更具体的提示 */
  (event: 'missed', hint?: string): void
}

/** 注册表里存放的组件类型（payload 已在运行时由 spec.kind 保证） */
export type InteractionComponent = Component

/** 每种互动在“知识卡片”里展示的名字与图标，用于课程数据与家长端统计 */
export interface InteractionMeta {
  kind: InteractionKind
  label: string
  /** 互动的结构性图标：和界面一起呼吸，不用场景 emoji（见 ui/icons/KVisual.vue 的规则） */
  icon: AppIconName
  /** 主要锻炼的能力，家长端会用到 */
  ability: string
}

export const INTERACTION_META: Record<InteractionKind, Omit<InteractionMeta, 'kind'>> = {
  'choose-one': { label: '选一选', icon: 'click-hand', ability: '观察与判断' },
  'choose-many': { label: '全都找出来', icon: 'magnifier', ability: '分类与归纳' },
  'tap-target': { label: '点一点', icon: 'target', ability: '观察力' },
  'drag-sort': { label: '排一排', icon: 'sort', ability: '顺序与逻辑' },
  'drag-drop': { label: '拖一拖', icon: 'basket', ability: '分类与配对' },
  'connect-line': { label: '连一连', icon: 'link', ability: '关系认知' },
  'memory-pair': { label: '翻翻乐', icon: 'cards', ability: '记忆力' },
  'color-fill': { label: '涂一涂', icon: 'palette', ability: '色彩与审美' },
  'draw': { label: '画一画', icon: 'pencil', ability: '精细动作与创造' },
  'slider-explore': { label: '试一试', icon: 'sliders', ability: '观察与猜想' },
  'hotspot-explore': { label: '找一找', icon: 'binoculars', ability: '探索与发现' },
  'sequence-build': { label: '搭指令', icon: 'puzzle', ability: '顺序与编程思维' },
  'measure-stamp': { label: '盖量词印章', icon: 'stamp', ability: '词语搭配与语感' },
  'number-tile': { label: '填数字', icon: 'grid', ability: '推理与数感' },
}
