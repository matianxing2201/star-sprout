/**
 * 本地存储的安全封装。
 * 隐私模式、配额用尽、被禁用的情况下都不会抛错，只是静默降级为内存态。
 */
const NAMESPACE = 'kids-world'

const memory = new Map<string, string>()

function fullKey(key: string): string {
  return `${NAMESPACE}:${key}`
}

function available(): Storage | null {
  try {
    const probe = '__kids_world_probe__'
    window.localStorage.setItem(probe, '1')
    window.localStorage.removeItem(probe)
    return window.localStorage
  }
  catch {
    return null
  }
}

export function readStorage<T>(key: string, fallback: T): T {
  const storage = available()
  const raw = storage ? storage.getItem(fullKey(key)) : memory.get(fullKey(key)) ?? null

  if (raw === null)
    return fallback

  try {
    return JSON.parse(raw) as T
  }
  catch {
    return fallback
  }
}

export function writeStorage<T>(key: string, value: T): void {
  const raw = JSON.stringify(value)
  const storage = available()

  if (!storage) {
    memory.set(fullKey(key), raw)
    return
  }

  try {
    storage.setItem(fullKey(key), raw)
  }
  catch {
    memory.set(fullKey(key), raw)
  }
}

export function removeStorage(key: string): void {
  available()?.removeItem(fullKey(key))
  memory.delete(fullKey(key))
}
