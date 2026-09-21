<script setup lang="ts">
import { RouterLink, RouterView, useRoute } from 'vue-router'

import { ROUTE_NAMES } from '@/app/router/route-names'
import { cn } from '@/shared/utils'

/**
 * 家长端外壳
 * ========
 *
 * 与儿童端彻底分开：这里可以有文字、有表格、有数字。
 * 家长关心的是“孩子学了什么、学得怎么样”，不是“好不好玩”。
 */
const route = useRoute()

const TABS = [
  { name: ROUTE_NAMES.parent, label: '总览' },
  { name: ROUTE_NAMES.parentReport, label: '学习报告' },
  { name: ROUTE_NAMES.parentSettings, label: '设置' },
] as const
</script>

<template>
  <div class="min-h-dvh bg-surface-muted">
    <header class="border-b border-line bg-surface">
      <div class="mx-auto flex w-full max-w-5xl flex-wrap items-center gap-4 px-5 py-4">
        <div class="mr-auto">
          <p class="font-body text-xs font-bold tracking-[0.22em] text-ink-faint uppercase">
            Parent Center
          </p>
          <h1 class="font-display text-2xl text-ink">
            家长中心
          </h1>
        </div>

        <nav class="flex items-center gap-1">
          <RouterLink
            v-for="tab in TABS"
            :key="tab.name"
            :to="{ name: tab.name }"
            :class="cn(
              'rounded-chip px-4 py-2 font-body text-sm transition-colors',
              route.name === tab.name
                ? 'bg-ink text-paper'
                : 'text-ink-soft hover:bg-paper-deep hover:text-ink',
            )"
          >
            {{ tab.label }}
          </RouterLink>
        </nav>

        <RouterLink
          :to="{ name: ROUTE_NAMES.home }"
          class="rounded-chip border border-line-strong px-4 py-2 font-body text-sm text-ink-soft transition-colors hover:bg-paper-deep hover:text-ink"
        >
          ← 回到儿童端
        </RouterLink>
      </div>
    </header>

    <main class="mx-auto w-full max-w-5xl px-5 py-8">
      <RouterView />
    </main>
  </div>
</template>
