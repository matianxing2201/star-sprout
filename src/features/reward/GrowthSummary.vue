<script setup lang="ts">
import { computed } from 'vue'

import { useProgressStore } from '@/stores'
import { KIconTile, KProgress } from '@/ui'

/**
 * 成长概览
 * ========
 *
 * 孩子看得懂的成长表达：我在哪一级、离下一级还差多少、今天攒了多少。
 * 不做排行榜，不做“你比同学差”这类比较 —— 只和自己比。
 */
const progress = useProgressStore()

const level = computed(() => progress.level)
const next = computed(() => progress.upcomingLevel)
const remain = computed(() => (next.value ? next.value.from - progress.growth.stars : 0))
</script>

<template>
  <section class="grid gap-4 sm:grid-cols-3">
    <div class="rounded-tile border-2 border-line bg-surface p-5 shadow-sticker">
      <div class="flex items-center gap-3">
        <KIconTile :icon="level.icon" tone="star" size="md" />
        <div>
          <p class="font-display text-xl text-ink">
            {{ level.name }}
          </p>
          <p class="font-body text-xs text-ink-soft">
            当前成长等级
          </p>
        </div>
      </div>

      <KProgress
        class="mt-4"
        :value="progress.levelRatio"
        tone="star"
        size="md"
        :label="next ? `再攒 ${remain} 颗星星到「${next.name}」` : '已经到最高等级啦'"
      />
    </div>

    <div class="rounded-tile border-2 border-line bg-surface p-5 shadow-sticker">
      <p class="font-body text-xs font-bold tracking-[0.2em] text-ink-faint uppercase">
        今天
      </p>
      <p class="mt-2 font-numeric text-3xl font-extrabold text-ink">
        {{ progress.today.minutes }}<span class="ml-1 font-body text-sm font-normal text-ink-soft">分钟</span>
      </p>
      <p class="mt-1 font-body text-sm text-ink-soft">
        完成 {{ progress.today.lessons }} 节课 · 得到 {{ progress.today.stars }} 颗星星
      </p>
      <p class="mt-3 font-body text-xs text-ink-faint">
        已经连续学习 {{ progress.growth.streakDays }} 天
      </p>
    </div>

    <div class="rounded-tile border-2 border-line bg-surface p-5 shadow-sticker">
      <p class="font-body text-xs font-bold tracking-[0.2em] text-ink-faint uppercase">
        一共
      </p>
      <p class="mt-2 font-numeric text-3xl font-extrabold text-ink">
        {{ progress.growth.lessonsCompleted }}<span class="ml-1 font-body text-sm font-normal text-ink-soft">节课</span>
      </p>
      <p class="mt-1 font-body text-sm text-ink-soft">
        探索了 {{ progress.growth.exploredWorldIds.length }} 个学习世界
      </p>
      <p class="mt-3 font-body text-xs text-ink-faint">
        累计学习 {{ progress.growth.totalMinutes }} 分钟
      </p>
    </div>
  </section>
</template>
