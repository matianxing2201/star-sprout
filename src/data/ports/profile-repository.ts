import type { ChildProfile } from '@/domain'

/** 孩子档案仓储（端口）：与学习进度分开存储，互不影响 */
export interface ProfileRepository {
  load: () => ChildProfile | null
  save: (profile: ChildProfile) => void
  clear: () => void
}
