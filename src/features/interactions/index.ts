/**
 * 互动框架出口
 * ============
 *
 * 课程播放器只需要用 InteractionShell；
 * 具体互动组件由 registry 按 `kind` 解析，页面不需要认识它们。
 */
export { INTERACTION_META } from './contract'
export type {
  InteractionComponent,
  InteractionComponentEmits,
  InteractionComponentProps,
  InteractionMeta,
} from './contract'
export { default as InteractionShell } from './InteractionShell.vue'
export { INTERACTION_REGISTRY, resolveInteraction } from './registry'
export { useInteraction } from './useInteraction'
export { findDropTarget, usePointerDrag } from './usePointerDrag'
