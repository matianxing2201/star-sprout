<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'

import { ROUTE_NAMES } from '@/app/router/route-names'
import { MascotAvatar } from '@/features/mascot'
import { cn } from '@/shared/utils'
import { useCatalogStore, useProfileStore } from '@/stores'
import { KIcon } from '@/ui'

/**
 * 儿童端外壳
 * ========
 *
 * 当前只保留年级大纲入口和年级切换。
 */
const route = useRoute()
const profile = useProfileStore()
const catalog = useCatalogStore()

const grade = computed(() => catalog.grade(profile.gradeId))

/** 导航项：icon 取自语义图标词汇表，不再是 emoji */
const NAV = [
  { name: ROUTE_NAMES.grades, label: '年级大纲', icon: 'ladder' },
] as const

const activeName = computed(() => route.name === ROUTE_NAMES.categories ? ROUTE_NAMES.grades : route.name)
</script>

<template>
  <div class="flex min-h-dvh flex-col">
    <header class="sticky top-0 z-30 border-b-2 border-line bg-paper/85 backdrop-blur-md">
      <div class="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-3 px-4 py-3 sm:gap-4">
        <RouterLink
          :to="{ name: ROUTE_NAMES.home }"
          class="fx-tap flex items-center gap-2 rounded-chip py-1 pr-3 pl-1 hover:bg-paper-deep"
        >
          <MascotAvatar :id="profile.profile.mascot" size="sm" :animate="false" />
          <span class="hidden font-display text-lg text-ink sm:inline">{{ profile.nickname }}</span>
        </RouterLink>

        <RouterLink
          :to="{ name: ROUTE_NAMES.grades }"
          class="fx-tap flex items-center gap-1.5 rounded-chip border-2 border-line bg-surface px-3 py-1.5 shadow-press hover:border-line-strong"
        >
          <KIcon v-if="grade" :name="grade.icon" size="sm" :tone="grade.tone" />
          <span class="font-display text-base text-ink">{{ grade?.name }}</span>
        </RouterLink>

        <nav class="order-last flex w-full items-center gap-2 overflow-x-auto sm:order-none sm:w-auto">
          <RouterLink
            v-for="item in NAV"
            :key="item.name"
            :to="{ name: item.name }"
            :class="cn(
              'fx-tap flex shrink-0 items-center gap-1.5 rounded-chip px-3 py-1.5 font-display text-base whitespace-nowrap',
              activeName === item.name
                ? 'bg-ink text-paper shadow-press'
                : 'text-ink-soft hover:bg-paper-deep hover:text-ink',
            )"
          >
            <KIcon :name="item.icon" size="sm" />
            {{ item.label }}
          </RouterLink>
        </nav>

      </div>
    </header>

    <main class="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:py-8">
      <RouterView />
    </main>

    <footer class="mx-auto w-full max-w-6xl px-4 pb-8">
      <!-- 品牌签名：安静地放在页脚，不跟孩子抢注意力 -->
      <p class="mb-2 font-display text-sm text-ink-soft">
        星芽 <span class="font-numeric text-[11px] tracking-[0.12em] text-ink-faint">StarSprout</span>
      </p>
      <div class="flex items-center gap-2 font-body text-xs text-ink-faint">
        <span>年级</span><KIcon name="arrow-right" size="xs" />
        <span>学科</span><KIcon name="arrow-right" size="xs" />
        <span>学习重点</span>
      </div>
    </footer>
  </div>
</template>
