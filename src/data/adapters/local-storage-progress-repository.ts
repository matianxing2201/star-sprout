import type { ProgressRepository } from '../ports/progress-repository'
import type { ProgressSnapshot } from '@/domain'
import { readStorage, removeStorage, writeStorage } from '@/shared/utils'

const STORAGE_KEY = 'progress:v1'

/**
 * localStorage 适配器
 * ==================
 *
 * 纯前端方案的落点：学习记录存在孩子自己的浏览器里，无需账号、无需服务端。
 * 未来的“跨设备同步”只需要实现另一个 ProgressRepository，本文件不动。
 */
export function createLocalStorageProgressRepository(key = STORAGE_KEY): ProgressRepository {
  return {
    load(): ProgressSnapshot {
      const snapshot = readStorage<Partial<ProgressSnapshot>>(key, {})
      return {
        topics: snapshot.topics ?? {},
        completions: snapshot.completions ?? [],
        attempts: snapshot.attempts ?? [],
      }
    },

    save(snapshot: ProgressSnapshot): void {
      writeStorage(key, snapshot)
    },

    clear(): void {
      removeStorage(key)
    },
  }
}
