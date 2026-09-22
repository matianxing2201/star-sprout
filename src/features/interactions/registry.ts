import type { InteractionComponent } from './contract'

import type { InteractionKind } from '@/domain'

import ChooseManyInteraction from './components/ChooseManyInteraction.vue'
import ChooseOneInteraction from './components/ChooseOneInteraction.vue'
import ColorFillInteraction from './components/ColorFillInteraction.vue'
import ConnectLineInteraction from './components/ConnectLineInteraction.vue'
import DragDropInteraction from './components/DragDropInteraction.vue'
import DragSortInteraction from './components/DragSortInteraction.vue'
import DrawInteraction from './components/DrawInteraction.vue'
import HotspotExploreInteraction from './components/HotspotExploreInteraction.vue'
import MeasureStampInteraction from './components/MeasureStampInteraction.vue'
import MemoryPairInteraction from './components/MemoryPairInteraction.vue'
import NumberTileInteraction from './components/NumberTileInteraction.vue'
import SequenceBuildInteraction from './components/SequenceBuildInteraction.vue'
import SliderExploreInteraction from './components/SliderExploreInteraction.vue'
import TapTargetInteraction from './components/TapTargetInteraction.vue'

/**
 * 互动注册表
 * ==========
 *
 * 内容里的 `kind` 在这里被翻译成一个组件。
 * 新增互动方式只需要两步：
 *   1. 在 domain/interaction/types.ts 的 INTERACTION_KINDS + payload 里声明；
 *   2. 在这里加一行映射。
 * 课程页、播放器、课程数据格式都不需要改动 —— 这就是“内容与 UI 解耦”的落点。
 */
export const INTERACTION_REGISTRY: Record<InteractionKind, InteractionComponent> = {
  'choose-one': ChooseOneInteraction,
  'choose-many': ChooseManyInteraction,
  'tap-target': TapTargetInteraction,
  'drag-sort': DragSortInteraction,
  'drag-drop': DragDropInteraction,
  'connect-line': ConnectLineInteraction,
  'memory-pair': MemoryPairInteraction,
  'color-fill': ColorFillInteraction,
  'draw': DrawInteraction,
  'slider-explore': SliderExploreInteraction,
  'hotspot-explore': HotspotExploreInteraction,
  'sequence-build': SequenceBuildInteraction,
  'measure-stamp': MeasureStampInteraction,
  'number-tile': NumberTileInteraction,
}

export function resolveInteraction(kind: InteractionKind): InteractionComponent {
  return INTERACTION_REGISTRY[kind]
}
