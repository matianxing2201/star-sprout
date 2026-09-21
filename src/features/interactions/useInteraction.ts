import type { InteractionResult, InteractionSpec, MascotId } from '@/domain'

import { computed, ref } from 'vue'
import { getMascot } from '@/domain'

/**
 * 互动的通用状态机
 * ================
 *
 * 所有互动共享同一套“温柔反馈”规则：
 *   - 第一次答错：角色给一句鼓励，不显示“错误”
 *   - 第二次答错：出现「给我一点提示」按钮
 *   - 提示只给方向，不给答案
 *   - 记录尝试次数与是否用过提示 —— 家长端的薄弱点分析依赖这两个字段
 */
export function useInteraction(options: { spec: InteractionSpec, mascot: MascotId }) {
  const { spec, mascot } = options
  const character = getMascot(mascot)

  const attempts = ref(0)
  const usedHint = ref(false)
  const skipped = ref(false)
  const solved = ref(false)
  const answer = ref<unknown>(null)
  const coachLine = ref('')

  /** 答错两次之后才把提示按钮交出来，避免孩子一上来就点提示 */
  const canRevealHint = computed(() => !solved.value && attempts.value >= 2 && !usedHint.value)

  const hintText = computed(() => spec.hint ?? character.nudge)

  const retryLine = computed(() => spec.retryLine ?? character.nudge)

  const successLine = computed(() => spec.successLine ?? character.cheer)

  const stars = computed(() => Math.max(1, spec.stars ?? 1))

  function markSolved(payload?: unknown): void {
    solved.value = true
    answer.value = payload ?? null
    coachLine.value = successLine.value
  }

  function markMissed(hint?: string): void {
    if (solved.value)
      return
    attempts.value += 1
    coachLine.value = hint ?? retryLine.value
  }

  function revealHint(): void {
    usedHint.value = true
    coachLine.value = hintText.value
  }

  function skip(): void {
    skipped.value = true
    coachLine.value = '没关系，我们先去看看下一步吧。'
  }

  function toResult(kind: InteractionResult['interactionKind']): InteractionResult {
    return {
      interactionKind: kind,
      correct: solved.value,
      attempts: Math.max(attempts.value, solved.value ? 1 : 0),
      usedHint: usedHint.value,
      skipped: skipped.value,
      stars: solved.value ? (usedHint.value ? 1 : stars.value) : 0,
      answer: answer.value,
    }
  }

  return {
    character,
    attempts,
    usedHint,
    skipped,
    solved,
    answer,
    coachLine,
    canRevealHint,
    hintText,
    successLine,
    stars,
    markSolved,
    markMissed,
    revealHint,
    skip,
    toResult,
  }
}
