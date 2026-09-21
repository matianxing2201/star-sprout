<script setup lang="ts">
import type { Category } from '@/domain'

import { computed } from 'vue'
import { toneVars } from '@/domain'
import { cn } from '@/shared/utils'
import { KIconTile, KProgress, KTag, TONE_ICONS } from '@/ui'

/**
 * 领域卡片（二级分类）
 * ==================
 *
 * 面向孩子的是“这里能玩什么”，面向家长的是下面的学习重点与掌握程度 ——
 * 同一张卡片承担两种读者，视觉上先给孩子，信息上留给家长。
 */
const {
  category,
  topicCount,
  lessonCount,
  mastery,
  available,
} = defineProps<{
  category: Category
  topicCount: number
  lessonCount: number
  mastery: number
  /** 是否有可玩的内容；没有时卡片仍然可点，进去看到“内容准备中” */
  available: boolean
}>()

const skills = computed(() => category.skills.slice(0, 6))
const restCount = computed(() => Math.max(0, category.skills.length - skills.value.length))
</script>

<template>
  <div
    class="flex h-full flex-col rounded-card border-2 border-[var(--tone-line)] bg-surface p-5 shadow-sticker transition-transform"
    :class="cn('fx-tap hover:shadow-lift')"
    :style="toneVars(category.tone)"
  >
    <div class="flex items-start gap-3">
      <KIconTile
        size="lg"
        :icon="category.icon ?? TONE_ICONS[category.tone]"
        :tone="category.tone"
      />
      <div class="min-w-0">
        <h3 class="font-display text-xl leading-tight text-ink">
          {{ category.name }}
        </h3>
        <p class="mt-1 font-body text-xs leading-relaxed text-ink-soft">
          {{ category.summary }}
        </p>
      </div>
    </div>

    <ul class="mt-4 flex flex-wrap gap-1.5">
      <li v-for="skill in skills" :key="skill">
        <KTag :tone="category.tone" size="sm">
          {{ skill }}
        </KTag>
      </li>
      <li v-if="restCount > 0">
        <KTag tone="neutral" size="sm">
          +{{ restCount }}
        </KTag>
      </li>
    </ul>

    <div class="mt-auto pt-5">
      <KProgress
        :value="mastery"
        :tone="category.tone"
        size="sm"
        :label="available ? `掌握程度 · ${lessonCount} 节探索` : '内容准备中'"
        show-value
      />
      <p class="mt-2 font-body text-xs text-ink-faint">
        {{ topicCount > 0 ? `${topicCount} 个学习主题` : '等待教案' }}
      </p>
    </div>
  </div>
</template>
