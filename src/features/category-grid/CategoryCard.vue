<script setup lang="ts">
import type { Category } from "@/domain";

import { computed } from "vue";
import { toneVars } from "@/domain";
import { KIconTile, KTag, TONE_ICONS } from "@/ui";

/**
 * 领域卡片（二级分类）
 * ==================
 *
 * 面向孩子的是“这里能玩什么”，面向家长的是下面的学习重点与掌握程度 ——
 * 同一张卡片承担两种读者，视觉上先给孩子，信息上留给家长。
 */
const {
  category,
  questionCount = 0,
  outlineCount = 0,
} = defineProps<{
  category: Category;
  questionCount?: number;
  outlineCount?: number;
}>();

const skills = computed(() => category.skills);
</script>

<template>
  <div
    class="flex h-full flex-col rounded-card border-2 border-[var(--tone-line)] bg-surface p-5 shadow-sticker"
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
    </ul>

    <p class="mt-4 font-body text-xs font-bold tracking-wide text-ink-faint">
      学习重点
    </p>
    <ul class="mt-2 flex flex-wrap gap-1.5">
      <li v-for="focus in category.focus" :key="focus">
        <KTag tone="neutral" size="sm">{{ focus }}</KTag>
      </li>
    </ul>

    <p
      v-if="questionCount > 0"
      class="mt-auto flex items-center justify-between border-t border-line pt-4 font-body text-xs font-bold text-language-deep"
    >
      <span>一年级上册 · {{ questionCount }} 道题</span>
      <KIcon name="arrow-right" size="sm" />
    </p>
    <p
      v-else-if="outlineCount > 0"
      class="mt-auto flex items-center justify-between border-t border-line pt-4 font-body text-xs font-bold text-math-deep"
    >
      <span>一年级上册 · {{ outlineCount }} 个主题</span>
      <KIcon name="arrow-right" size="sm" />
    </p>
  </div>
</template>
