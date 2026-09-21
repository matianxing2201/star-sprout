/**
 * 领域层（domain）
 * ==============
 *
 * 纯 TypeScript：不依赖 Vue、不依赖浏览器 API、不依赖任何存储实现。
 * 这里定义产品的“语言”：年级、领域、主题、课程、学习任务、互动、成长。
 *
 * 依赖方向：domain ← content ← data ← stores ← features/pages
 * 反向依赖一律禁止。
 */
export * from './catalog'
export * from './growth'
export * from './interaction'
export * from './learning'
export * from './lesson'
export * from './mascot'
export * from './profile'
export * from './shared'
export * from './world'
