import type { ProfileRepository } from '../ports/profile-repository'
import type { ChildProfile } from '@/domain'
import { readStorage, removeStorage, writeStorage } from '@/shared/utils'

const STORAGE_KEY = 'profile:v1'

/** localStorage 档案适配器：换服务端账号体系时替换这一个实现即可 */
export function createLocalStorageProfileRepository(key = STORAGE_KEY): ProfileRepository {
  return {
    load(): ChildProfile | null {
      const profile = readStorage<ChildProfile | null>(key, null)
      if (!profile || typeof profile.gradeId !== 'string')
        return null
      return profile
    },

    save(profile: ChildProfile): void {
      writeStorage(key, profile)
    },

    clear(): void {
      removeStorage(key)
    },
  }
}
