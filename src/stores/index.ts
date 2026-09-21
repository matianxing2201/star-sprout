/**
 * 应用状态层（stores）
 * ==================
 *
 * 只有这一层可以同时接触“仓储”和“界面”。
 * 页面与组件不直接调用仓储，只读 store —— 这样数据来源换掉时，
 * 需要改动的地方永远是有限且可数的。
 */
export { useCatalogStore } from './catalog'
export { useFeedbackStore } from './feedback'
export { useProfileStore } from './profile'
export { useProgressStore } from './progress'
