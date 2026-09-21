<script setup lang="ts">
import { computed, watch } from 'vue'

import { getMascot } from '@/domain'
import { MascotAvatar } from '@/features/mascot'
import { useFeedbackStore } from '@/stores'
import { KConfetti, KIcon, KStarBurst } from '@/ui'

/**
 * 奖励层
 * ======
 *
 * 全站唯一的奖励视觉出口，挂在儿童端外壳上。
 * 任何地方想给反馈，只能调 feedback store 的 celebrate(tier) ——
 * 强度、星星数、是否撒彩纸都由 domain/growth/rewards.ts 的 REWARD_TIERS 决定。
 *
 * 这样“不要过度奖励”就成了一条结构性的约束，而不是每个页面各自拿捏的分寸。
 */
const feedback = useFeedbackStore()

const spec = computed(() => feedback.spec)

const active = computed(() => feedback.active && feedback.tier !== 'tap')

const showStars = computed(() => active.value && (spec.value?.flyStars ?? 0) > 0)

const showConfetti = computed(() => active.value && Boolean(spec.value?.confetti))

const showMascot = computed(() => active.value && Boolean(spec.value?.mascotCheer) && Boolean(feedback.mascot))

const cheer = computed(() => {
  if (!feedback.mascot)
    return feedback.message
  const mascot = getMascot(feedback.mascot)
  return feedback.message || mascot.cheer
})

/** 高等级奖励时让整个页面轻轻震一下，强化“完成了”的体感 */
watch(active, (value) => {
  if (!value || !spec.value?.screenPulse)
    return
  const root = document.documentElement
  root.animate(
    [
      { transform: 'translateY(0)' },
      { transform: 'translateY(-4px)' },
      { transform: 'translateY(0)' },
    ],
    { duration: 420, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
  )
})
</script>

<template>
  <div aria-live="polite" aria-atomic="true">
    <KConfetti v-if="showConfetti" :active="showConfetti" :count="(spec?.flyStars ?? 0) * 3" />

    <KStarBurst v-if="showStars" :active="showStars" :count="spec?.flyStars ?? 1" from="corner" />

    <Transition
      enter-active-class="transition-all duration-300 ease-bounce"
      leave-active-class="transition-all duration-200 ease-snap"
      enter-from-class="translate-y-4 opacity-0 scale-95"
      leave-to-class="translate-y-2 opacity-0 scale-95"
    >
      <div
        v-if="showMascot"
        class="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4"
      >
        <div class="flex items-center gap-3 rounded-blob border-2 border-star-deep/25 bg-surface px-5 py-3 shadow-lift">
          <MascotAvatar :id="feedback.mascot!" size="md" mood="cheering" />
          <div>
            <p class="font-display text-lg text-ink">
              {{ cheer }}
            </p>
            <p v-if="feedback.stars > 0" class="flex items-center gap-1 font-numeric text-sm text-star-deep">
              +{{ feedback.stars }}
              <KIcon name="star" size="xs" weight="fill" />
            </p>
          </div>
        </div>
      </div>
    </Transition>

    <span class="sr-only">{{ feedback.message }}</span>
  </div>
</template>
