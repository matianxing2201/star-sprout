<script setup lang="ts">
import { computed, onMounted } from 'vue'

import { ROUTE_NAMES } from '@/app/router/route-names'
import { MASCOTS, toneVars } from '@/domain'
import { MascotAvatar } from '@/features/mascot'
import { BadgeWall } from '@/features/reward'
import { cn } from '@/shared/utils'
import { useCatalogStore, useProfileStore, useProgressStore } from '@/stores'
import { KButton, KEmptyState, KProgress, KSectionTitle, KStatTile, KTag } from '@/ui'

/**
 * 奖励中心
 * ========
 *
 * 这一个页面回答孩子一句话：“我攒下了什么？”
 *
 * 需求第三十节第 6 条要求这里看得见：星星 / 徽章 / 收藏 / 已解锁角色 / 已探索区域。
 * 五样东西一件都不藏：没去过的地方也摆在那里，只是淡淡地说一句“还没去过”——
 * 看得见的距离才是继续走的理由。页面上永远不会出现空白的角落。
 */
const progress = useProgressStore()
const profile = useProfileStore()
const catalog = useCatalogStore()

onMounted(() => progress.refresh())

/** 全部角色伙伴：顺序固定，孩子每次看到的位置都一样 */
const mascots = Object.values(MASCOTS)

/** 去过的学习世界：用集合判断“去过没有”，比每次翻数组快也更好读 */
const exploredWorldIds = computed(() => new Set(progress.growth.exploredWorldIds))

const earnedBadgeCount = computed(() => progress.badgeWall.filter(item => item.earned).length)

const totalBadgeCount = computed(() => progress.badgeWall.length)

const exploredWorldCount = computed(() => progress.growth.exploredWorldIds.length)

/** 距离下一个成长等级还差几颗星星 */
const starsToNextLevel = computed(() =>
  progress.upcomingLevel ? progress.upcomingLevel.from - progress.growth.stars : 0,
)

/** 等级进度条上的那句话：只说“还差多少”，不说“你还不够” */
const levelHint = computed(() =>
  progress.upcomingLevel
    ? `再攒 ${starsToNextLevel.value} 颗星星，就到「${progress.upcomingLevel.name}」`
    : '已经站到最高的等级啦',
)

/** 收藏架：星星攒得最多的几个小主题，就是孩子自己的“藏品” */
const collected = computed(() =>
  Object.entries(progress.growth.topicStars)
    .filter(([, stars]) => stars > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([topicId, stars]) => {
      const topic = catalog.topic(topicId)
      return { topicId, stars, emoji: topic?.emoji ?? '📘', title: topic?.title ?? '一个小主题' }
    }),
)
</script>

<template>
  <div class="flex flex-col gap-10">
    <!-- 星星罐 + 成长等级 + 收藏架 -->
    <section class="grid gap-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
      <div class="rounded-blob border-2 border-star-deep/25 bg-star-soft p-6 shadow-sticker">
        <p class="font-body text-xs font-bold tracking-[0.24em] text-star-deep uppercase">
          我的星星罐
        </p>
        <p class="mt-3 flex flex-wrap items-baseline gap-3">
          <span class="animate-breathe text-4xl" aria-hidden="true">⭐</span>
          <span class="font-numeric text-6xl leading-none font-extrabold text-star-deep">
            {{ progress.growth.stars }}
          </span>
          <span class="font-display text-xl text-ink-soft">颗星星</span>
        </p>
        <p class="mt-3 font-body text-sm text-ink-soft">
          每完成一个小任务，星星就会自己飞进罐子里。
        </p>

        <div class="mt-5">
          <p class="font-body text-xs font-bold tracking-[0.2em] text-star-deep uppercase">
            我的收藏
          </p>
          <ul v-if="collected.length > 0" class="mt-2 flex flex-wrap gap-2">
            <li v-for="item in collected" :key="item.topicId">
              <KTag tone="star" size="sm">
                <span aria-hidden="true">{{ item.emoji }}</span>
                {{ item.title }} · ⭐ {{ item.stars }}
              </KTag>
            </li>
          </ul>
          <div v-else class="mt-2 flex flex-wrap items-center gap-3">
            <p class="font-body text-sm text-ink-soft">
              还没有收藏，我们一起去找找吧。
            </p>
            <KButton variant="soft" size="sm" :to="{ name: ROUTE_NAMES.home }">
              去找找
            </KButton>
          </div>
        </div>
      </div>

      <div class="flex flex-col gap-5 rounded-blob border-2 border-line bg-surface p-6 shadow-sticker">
        <div class="flex items-center gap-3">
          <span class="text-4xl" aria-hidden="true">{{ progress.level.emoji }}</span>
          <div>
            <p class="font-display text-2xl text-ink">
              {{ progress.level.name }}
            </p>
            <p class="font-body text-xs text-ink-soft">
              我现在的成长等级
            </p>
          </div>
        </div>

        <KProgress
          :value="progress.levelRatio"
          tone="star"
          size="lg"
          :label="levelHint"
          show-value
        />

        <p class="font-body text-xs text-ink-faint">
          星星越多，等级越高；等级越高，能去的地方越多。
        </p>
      </div>
    </section>

    <!-- 四个数字 -->
    <section class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <KStatTile emoji="⭐" :value="progress.growth.stars" label="星星总数" hint="攒得越多，等级越高" tone="star" />
      <KStatTile emoji="⚡" :value="progress.growth.energy" label="能量" hint="每天来玩就会长一点" tone="energy" />
      <KStatTile emoji="🏅" :value="earnedBadgeCount" label="已得徽章" :hint="`徽章墙上一共 ${totalBadgeCount} 枚`" tone="badge" />
      <KStatTile emoji="🌍" :value="exploredWorldCount" label="已探索区域" hint="还有更多世界在等你" tone="explore" />
    </section>

    <!-- 徽章墙 -->
    <section>
      <KSectionTitle
        eyebrow="徽章"
        title="徽章墙"
        description="每一枚徽章都记着一件你做到过的事。还没拿到的也不用急，它就在墙上等你。"
        tone="badge"
      >
        <template #action>
          <KTag tone="badge" size="md">
            已经拿到 {{ earnedBadgeCount }} / {{ totalBadgeCount }} 枚
          </KTag>
        </template>
      </KSectionTitle>

      <BadgeWall />
    </section>

    <!-- 已探索的学习世界 -->
    <section>
      <KSectionTitle
        eyebrow="走过的路"
        title="已探索的学习世界"
        description="去过的地方会亮起来，颜色还在；没去过的也摆在这里，等你哪天拐进去看看。"
        tone="explore"
      />

      <ul v-if="catalog.worlds.length > 0" class="fx-stagger grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <li
          v-for="world in catalog.worlds"
          :key="world.id"
          :class="cn(
            'flex items-start gap-3 rounded-tile border-2 p-4 shadow-press',
            exploredWorldIds.has(world.id)
              ? 'border-[var(--tone-line)] bg-[var(--tone-soft)]'
              : 'border-dashed border-line-strong bg-surface',
          )"
          :style="toneVars(world.tone)"
        >
          <span
            :class="cn('text-3xl', !exploredWorldIds.has(world.id) && 'grayscale')"
            aria-hidden="true"
          >
            {{ world.emoji }}
          </span>
          <div class="min-w-0">
            <p class="font-display text-lg text-ink">
              {{ world.name }}
            </p>
            <p v-if="exploredWorldIds.has(world.id)" class="font-body text-xs leading-relaxed text-ink-soft">
              {{ world.tagline }}
            </p>
            <p v-else class="font-body text-xs text-ink-faint">
              还没去过
            </p>
          </div>
          <KTag
            v-if="exploredWorldIds.has(world.id)"
            class="ml-auto"
            :tone="world.tone"
            size="sm"
          >
            去过啦
          </KTag>
        </li>
      </ul>

      <KEmptyState
        v-else
        emoji="🗺️"
        title="学习世界还在铺路，我们一起去找找"
        description="地图上的地方会一份一份地长出来，先去学习世界看看吧。"
        tone="explore"
      >
        <template #action>
          <KButton :to="{ name: ROUTE_NAMES.home }" tone="explore">
            去看学习地图
          </KButton>
        </template>
      </KEmptyState>
    </section>

    <!-- 角色伙伴 -->
    <section>
      <KSectionTitle
        eyebrow="伙伴"
        title="角色伙伴"
        description="点一点，就能把喜欢的伙伴带在身边。它会陪你上课、给你提示、为你加油。"
        tone="art"
      >
        <template #action>
          <KTag tone="art" size="md">
            现在陪着我的是 {{ profile.mascot.name }}
          </KTag>
        </template>
      </KSectionTitle>

      <ul class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <li v-for="mascot in mascots" :key="mascot.id">
          <button
            type="button"
            :aria-label="`把${mascot.name}选成我的伙伴`"
            :aria-pressed="profile.mascot.id === mascot.id"
            :class="cn(
              'fx-tap flex h-full w-full flex-col items-center gap-2 rounded-card border-2 p-4 text-center shadow-press',
              profile.mascot.id === mascot.id
                ? 'border-star-deep/60 bg-star-soft shadow-lift'
                : 'border-line bg-surface hover:border-line-strong',
            )"
            @click="profile.chooseMascot(mascot.id)"
          >
            <MascotAvatar :id="mascot.id" size="md" :animate="false" />
            <span class="font-display text-base text-ink">{{ mascot.name }}</span>
            <span class="font-body text-xs leading-snug text-ink-soft">{{ mascot.role }}</span>
            <KTag
              v-if="profile.mascot.id === mascot.id"
              tone="star"
              size="sm"
              solid
            >
              ⭐ 我的伙伴
            </KTag>
          </button>
        </li>
      </ul>
    </section>
  </div>
</template>
