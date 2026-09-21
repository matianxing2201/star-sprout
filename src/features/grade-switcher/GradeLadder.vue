<script setup lang="ts">
import type { GradeId } from '@/domain'

import { computed } from 'vue'
import { toneVars } from '@/domain'
import { cn } from '@/shared/utils'
import { useCatalogStore, useProfileStore } from '@/stores'

/**
 * 成长阶梯（年级切换）
 * ================
 *
 * 需求明确要求：不用下拉框，而且要让孩子理解“我现在在哪、下一阶段有什么”。
 * 所以做成一条可以从左走到右的阶梯：走过的台阶是彩色的，当前的台阶被点亮，
 * 后面的台阶颜色变淡但仍然可看 —— 孩子随时能“看到下一步”。
 */
const profile = useProfileStore()
const catalog = useCatalogStore()

const grades = computed(() => catalog.grades)

function stateOf(gradeId: GradeId): 'current' | 'passed' | 'ahead' {
  const current = profile.gradeId
  if (gradeId === current)
    return 'current'
  const currentOrder = catalog.grade(current)?.order ?? 0
  const order = catalog.grade(gradeId)?.order ?? 0
  return order < currentOrder ? 'passed' : 'ahead'
}
</script>

<template>
  <ol class="flex flex-wrap items-stretch gap-3">
    <li v-for="grade in grades" :key="grade.id" class="flex-1 min-w-[8.5rem]">
      <button
        type="button"
        :class="cn(
          'fx-pressable flex h-full w-full flex-col items-center gap-1.5 rounded-tile border-2 px-3 py-4 text-center shadow-sticker',
          stateOf(grade.id) === 'current' && 'scale-[1.03] border-star bg-surface shadow-lift',
          stateOf(grade.id) === 'passed' && 'border-[var(--tone-line)] bg-surface',
          stateOf(grade.id) === 'ahead' && 'border-dashed border-line-strong bg-surface/60',
        )"
        :style="toneVars(grade.tone)"
        :aria-current="stateOf(grade.id) === 'current' ? 'step' : undefined"
        @click="profile.switchGrade(grade.id)"
      >
        <span
          :class="cn('text-3xl', stateOf(grade.id) === 'ahead' && 'opacity-45 grayscale')"
          aria-hidden="true"
        >
          {{ grade.emoji }}
        </span>
        <span class="font-display text-lg text-ink">{{ grade.name }}</span>
        <span class="font-body text-[11px] text-ink-faint">{{ grade.ageRange }}</span>
        <span
          v-if="stateOf(grade.id) === 'current'"
          class="mt-1 rounded-chip bg-star px-2 py-0.5 font-body text-[11px] font-bold text-ink"
        >
          我在这里
        </span>
      </button>
    </li>
  </ol>
</template>
