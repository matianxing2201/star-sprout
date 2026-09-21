import type { ProgressSnapshot } from '@/domain'

/**
 * 学习进度仓储（端口）
 * =================
 *
 * 目前由 localStorage 实现（纯前端、可直接部署静态站点）。
 * 将来要同步到服务端，只换 adapter：接口不变，store 不变，页面不变。
 */
export interface ProgressRepository {
  load: () => ProgressSnapshot
  save: (snapshot: ProgressSnapshot) => void
  clear: () => void
}
