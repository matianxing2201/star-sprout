<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'

import { ROUTE_NAMES } from '@/app/router/route-names'
import { MascotAvatar } from '@/features/mascot'
import { RewardLayer } from '@/features/reward'
import { cn } from '@/shared/utils'
import { useCatalogStore, useProfileStore, useProgressStore } from '@/stores'
import { KIcon } from '@/ui'

/**
 * 儿童端外壳
 * ========
 *
 * 顶部只放三件事：我在哪（角色 + 年级）、我能去哪（三个大按钮）、我攒了多少（星星）。
 * 菜单、面包屑、二级导航一律不要 —— 孩子不需要理解“信息架构”。
 *
 * 导航与星星都用矢量图标：它们和界面一起呼吸，粗细与基线一致；
 * 而角色头像仍然是插画（见 MascotAvatar）—— 形象与图标是两回事。
 *
 * 星星计数器带 `data-star-target`：它是奖励动画的视觉落点，
 * 位于右上角，正好是 RewardLayer 星星飞行的方向。
 */
const route = useRoute()
const profile = useProfileStore()
const progress = useProgressStore()
const catalog = useCatalogStore()

const grade = computed(() => catalog.grade(profile.gradeId))

/** 导航项：icon 取自语义图标词汇表，不再是 emoji */
const NAV = [
  { name: ROUTE_NAMES.home, label: '学习世界', icon: 'island' },
  { name: ROUTE_NAMES.grades, label: '成长阶梯', icon: 'ladder' },
  { name: ROUTE_NAMES.rewards, label: '奖励', icon: 'gift' },
  { name: ROUTE_NAMES.growth, label: '我的成长', icon: 'star-four' },
] as const

/** 底部那条“学习是怎么发生的”，过去用箭头字符连接，现在用箭头图标 */
const LEARNING_FLOW = ['发现', '好奇', '点击', '操作', '成功', '奖励', '解锁', '再探索'] as const

const activeName = computed(() => route.name)
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

        <div class="ml-auto flex items-center gap-2">
          <span
            data-star-target
            class="flex items-center gap-1.5 rounded-chip border-2 border-star-deep/25 bg-star-soft px-3 py-1.5 shadow-press"
            :title="`已经收集 ${progress.growth.stars} 颗星星`"
          >
            <KIcon
              name="star"
              size="md"
              weight="fill"
              class="animate-breathe text-star-deep"
            />
            <span class="font-numeric text-lg leading-none font-extrabold text-star-deep">
              {{ progress.growth.stars }}
            </span>
          </span>

          <RouterLink
            :to="{ name: ROUTE_NAMES.parent }"
            class="rounded-chip px-2.5 py-1.5 font-body text-xs text-ink-faint transition-colors hover:bg-paper-deep hover:text-ink-soft"
            title="家长中心"
          >
            家长
          </RouterLink>
        </div>
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
      <div class="flex flex-wrap items-center gap-1.5 font-body text-xs text-ink-faint">
        <template v-for="(step, index) in LEARNING_FLOW" :key="step">
          <span>{{ step }}</span>
          <KIcon v-if="index < LEARNING_FLOW.length - 1" name="arrow-right" size="xs" />
        </template>
      </div>
    </footer>

    <RewardLayer />
  </div>
</template>
