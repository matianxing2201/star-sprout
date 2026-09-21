import type { CatalogRepository } from './ports/catalog-repository'

import type { ProfileRepository } from './ports/profile-repository'
import type { ProgressRepository } from './ports/progress-repository'
/**
 * 数据层（data）
 * =============
 *
 * 端口（ports）定义“需要什么能力”，适配器（adapters）提供“怎么做到”。
 * 应用唯一的组合点就在这里：把内容包接上根仓储。
 *
 * 换成服务端接口时，只需要改这两行 —— store、组件、页面都不受影响。
 */
import { contentPack } from '@/content'

import { createLocalCatalogRepository } from './adapters/local-catalog-repository'
import { createLocalStorageProfileRepository } from './adapters/local-storage-profile-repository'
import { createLocalStorageProgressRepository } from './adapters/local-storage-progress-repository'

export const catalogRepository: CatalogRepository = createLocalCatalogRepository(contentPack)
export const progressRepository: ProgressRepository = createLocalStorageProgressRepository()
export const profileRepository: ProfileRepository = createLocalStorageProfileRepository()

export type { CatalogRepository, ProfileRepository, ProgressRepository }
