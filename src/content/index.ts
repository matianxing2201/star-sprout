import type { ContentPack } from './schema'

import { BADGES } from './badges'
import { GRADE_CONTENTS } from './grades'
import { LEARNING_WORLDS } from './worlds/catalog'
import { WORLD_MAP_LAYOUTS } from './worlds/maps'

/**
 * 内容包总装
 * ==========
 *
 * 整个应用只有一个内容来源：这个对象。
 * 领域层的类型 ← 内容包的数据 ← 仓储层 ← store ← 页面，单向依赖。
 *
 * 内容包可以在开发期通过 `parseContentPack` 过一遍运行时校验；
 * 应用启动时会走 repository.validate() 做引用完整性自检（见 data 层）。
 */
export const contentPack: ContentPack = {
  grades: GRADE_CONTENTS.map(content => content.grade),
  categories: GRADE_CONTENTS.flatMap(content => content.categories),
  topics: GRADE_CONTENTS.flatMap(content => content.topics),
  lessons: GRADE_CONTENTS.flatMap(content => content.lessons),
  worlds: LEARNING_WORLDS,
  maps: WORLD_MAP_LAYOUTS,
  badges: BADGES,
}

export type { GradeContent } from './grades/types'
export type { ContentPack } from './schema'
export { parseContentPack, validateContentPack } from './schema'
