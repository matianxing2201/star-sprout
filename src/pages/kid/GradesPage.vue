<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'

import { ROUTE_NAMES } from '@/app/router/route-names'
import { GradeLadder } from '@/features/grade-switcher'
import { useCatalogStore, useProfileStore } from '@/stores'
import { KButton, KSectionTitle, KTag } from '@/ui'

/**
 * 年级选择 / 成长阶梯
 * ==================
 *
 * 需求明确禁止下拉框，并要求孩子能理解“我现在在哪、下一阶段有什么”。
 * 因此这里做成一条可以走上去的阶梯，当前阶段被点亮，
 * 选中之后立刻告诉孩子“这个阶段会学什么、之后会学什么”。
 */
const profile = useProfileStore()
const catalog = useCatalogStore()
const router = useRouter()

const current = computed(() => catalog.grade(profile.gradeId))
const categories = computed(() => catalog.categoriesOf(profile.gradeId))
const topics = computed(() => catalog.topics.filter(topic => topic.gradeId === profile.gradeId))

function enter(): void {
  router.push({ name: ROUTE_NAMES.categories, params: { gradeId: profile.gradeId } })
}
</script>

<template>
  <div class="flex flex-col gap-8">
    <KSectionTitle
      eyebrow="成长阶梯"
      title="现在走到哪一级了？"
      description="点一点，看看每个阶段会玩到什么。换阶段不会丢掉已经收集的星星。"
      tone="star"
    />

    <GradeLadder />

    <section v-if="current" class="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
      <div class="rounded-blob border-2 border-line bg-surface p-6 shadow-sticker">
        <div class="flex items-center gap-4">
          <span class="text-5xl" aria-hidden="true">{{ current.emoji }}</span>
          <div>
            <h2 class="font-display text-2xl text-ink">
              {{ current.name }}
            </h2>
            <p class="font-body text-sm text-ink-soft">
              {{ current.ageRange }} · {{ current.tagline }}
            </p>
          </div>
        </div>

        <p class="mt-4 font-body text-sm leading-relaxed text-ink-soft">
          {{ current.summary }}
        </p>

        <div class="mt-5 rounded-tile border-2 border-dashed border-line-strong bg-paper-deep/60 p-4">
          <p class="font-display text-base text-ink">
            🔭 下一阶段会有什么？
          </p>
          <p class="mt-1 font-body text-sm text-ink-soft">
            {{ current.nextHint }}
          </p>
        </div>

        <div class="mt-5 flex flex-wrap gap-3">
          <KButton size="lg" :tone="current.tone" @click="enter">
            进入{{ current.name }} →
          </KButton>
        </div>
      </div>

      <div class="rounded-blob border-2 border-line bg-surface p-6 shadow-sticker">
        <p class="font-body text-xs font-bold tracking-[0.2em] text-ink-faint uppercase">
          这个阶段的领域
        </p>

        <ul class="mt-4 flex flex-wrap gap-2">
          <li v-for="category in categories" :key="category.id">
            <KTag :tone="category.tone" size="md">
              {{ category.emoji }} {{ category.name }}
            </KTag>
          </li>
        </ul>

        <div class="mt-5 grid grid-cols-2 gap-3">
          <div class="rounded-tile bg-paper-deep p-3">
            <p class="font-numeric text-2xl font-extrabold text-ink">
              {{ categories.length }}
            </p>
            <p class="font-body text-xs text-ink-soft">
              个学习领域
            </p>
          </div>
          <div class="rounded-tile bg-paper-deep p-3">
            <p class="font-numeric text-2xl font-extrabold text-ink">
              {{ topics.length }}
            </p>
            <p class="font-body text-xs text-ink-soft">
              个学习主题
            </p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
