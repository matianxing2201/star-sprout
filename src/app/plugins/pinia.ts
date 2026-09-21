import { createPinia } from 'pinia'

/**
 * Pinia 装配。
 * 单独成文件，方便测试时用 createTestingPinia 替换。
 */
export function createAppPinia() {
  return createPinia()
}
