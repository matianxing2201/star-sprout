import type { MascotId, RewardTier } from '@/domain'
import { defineStore } from 'pinia'

import { computed, ref } from 'vue'
import { getMascot, rewardSpec } from '@/domain'

/**
 * 反馈总线（Feedback Bus）
 * =====================
 *
 * 产品要求“反馈必须分级”，且页面不得自行加码。
 * 因此所有奖励反馈都走这里：调用方只声明等级（tap / correct / task / lesson / chapter / streak），
 * 动效强度、星星数量、是否撒彩纸全部由 domain/growth/rewards.ts 的 REWARD_TIERS 决定。
 */
export interface RewardPayload {
  tier: RewardTier
  message?: string
  mascot?: MascotId
  stars?: number
}

export const useFeedbackStore = defineStore('feedback', () => {
  const tier = ref<RewardTier | null>(null)
  const message = ref('')
  const mascot = ref<MascotId | null>(null)
  const stars = ref(0)
  /** 递增的令牌：同一等级连续触发时用来重启动画 */
  const token = ref(0)
  const active = ref(false)

  let timer: ReturnType<typeof setTimeout> | null = null

  const spec = computed(() => (tier.value ? rewardSpec(tier.value) : null))

  /** 播放一次分级反馈。返回本次实际给出的星星数，方便调用方累加 */
  function celebrate(payload: RewardPayload): number {
    const tierSpec = rewardSpec(payload.tier)
    const gained = payload.stars ?? tierSpec.stars

    tier.value = payload.tier
    stars.value = gained
    mascot.value = payload.mascot ?? null
    message.value = payload.message
      ?? (payload.mascot ? getMascot(payload.mascot).cheer : '')
    token.value += 1
    active.value = true

    if (timer)
      clearTimeout(timer)
    timer = setTimeout(() => {
      active.value = false
      tier.value = null
    }, tierSpec.duration)

    return gained
  }

  /** 轻触级别的反馈不占用视觉层，只是给按钮一个物理手感 */
  function tap(): void {
    celebrate({ tier: 'tap' })
  }

  function reset(): void {
    if (timer)
      clearTimeout(timer)
    active.value = false
    tier.value = null
  }

  return { tier, message, mascot, stars, token, active, spec, celebrate, tap, reset }
})
