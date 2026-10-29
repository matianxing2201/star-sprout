<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'

import { ROUTE_NAMES } from '@/app/router/route-names'
import { GradeLadder } from '@/features/grade-switcher'
import { useCatalogStore, useProfileStore } from '@/stores'
import { KButton, KIcon, KIconTile, KSectionTitle, KTag, TONE_ICONS } from '@/ui'

/**
 * 年级大纲入口
 * ==================
 *
 * 选择年级后查看该阶段的学科分类、学习重点与能力范围。
 */
const profile = useProfileStore()
const catalog = useCatalogStore()
const router = useRouter()

const current = computed(() => catalog.grade(profile.gradeId))
const categories = computed(() => catalog.categoriesOf(profile.gradeId))

function enter(): void {
  router.push({ name: ROUTE_NAMES.categories, params: { gradeId: profile.gradeId } })
}
</script>

<template>
  <div class="flex flex-col gap-8">
    <KSectionTitle
      eyebrow="年级大纲"
      title="按年级查看学习内容"
      description="选择一个年级，查看对应的学科分类、学习重点和能力范围。"
      tone="star"
    />

    <GradeLadder />

    <section v-if="current" class="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
      <div class="rounded-blob border-2 border-line bg-surface p-6 shadow-sticker">
        <div class="flex items-center gap-4">
          <KIconTile :icon="current.icon" :tone="current.tone" size="lg" />
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
          <p class="flex items-center gap-2 font-display text-base text-ink">
            <KIcon name="binoculars" size="sm" />
            本年级学习范围
          </p>
          <p class="mt-1 font-body text-sm text-ink-soft">
            共 {{ categories.length }} 个学科分类，涵盖本阶段的主要学习方向。
          </p>
        </div>

        <div class="mt-5 flex flex-wrap gap-3">
          <KButton size="lg" :tone="current.tone" @click="enter">
            进入{{ current.name }}
            <KIcon name="arrow-right" size="sm" />
          </KButton>
        </div>
      </div>

      <div class="rounded-blob border-2 border-line bg-surface p-6 shadow-sticker">
          <p class="font-body text-xs font-bold tracking-[0.2em] text-ink-faint uppercase">
          本年级大纲
        </p>

        <ul class="mt-4 flex flex-wrap gap-2">
          <li v-for="category in categories" :key="category.id">
            <KTag :tone="category.tone" size="md">
              <KIcon :name="category.icon ?? TONE_ICONS[category.tone]" size="sm" />
              {{ category.name }}
            </KTag>
          </li>
        </ul>

        <div class="mt-5 grid grid-cols-2 gap-3">
          <div class="rounded-tile bg-paper-deep p-3">
            <p class="font-numeric text-2xl font-extrabold text-ink">
              {{ categories.length }}
            </p>
            <p class="font-body text-xs text-ink-soft">
              个学科分类
            </p>
          </div>
          <div class="rounded-tile bg-paper-deep p-3">
            <p class="font-numeric text-2xl font-extrabold text-ink">
              {{ categories.reduce((total, category) => total + category.skills.length, 0) }}
            </p>
            <p class="font-body text-xs text-ink-soft">
              项学习内容
            </p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
