<script setup lang="ts">
import { toneVars } from '@/domain'
import { cn } from '@/shared/utils'
import { useProgressStore } from '@/stores'
import { KIcon, KProgress } from '@/ui'

/**
 * 徽章墙
 * ======
 *
 * 未获得的徽章不隐藏，而是显示“还差多少”——
 * 看得见的距离才是自驱力，藏起来只会让孩子忘了还有目标。
 */
const progress = useProgressStore()
</script>

<template>
  <ul class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
    <li
      v-for="item in progress.badgeWall"
      :key="item.badge.id"
      :class="cn(
        'flex flex-col items-center gap-2 rounded-tile border-2 p-5 text-center shadow-sticker transition-transform',
        item.earned ? 'border-star-deep/30 bg-star-soft' : 'border-dashed border-line-strong bg-surface/70',
      )"
    >
      <span
        :class="cn(
          'grid size-16 place-items-center rounded-chip border-2 shadow-press',
          item.earned
            ? 'border-[var(--tone-line)] bg-[var(--tone-soft)] text-[var(--tone-deep)]'
            : 'border-dashed border-line-strong bg-paper text-ink-faint opacity-60',
        )"
        :style="toneVars(item.badge.tone)"
        :aria-label="item.earned ? '已获得' : '还没有获得'"
      >
        <KIcon :name="item.badge.icon" size="lg" weight="duotone" />
      </span>
      <p class="font-display text-base text-ink">
        {{ item.badge.name }}
      </p>
      <p class="font-body text-xs leading-relaxed text-ink-soft">
        {{ item.badge.description }}
      </p>

      <KProgress
        v-if="!item.earned"
        class="mt-1 w-full"
        :value="item.progress"
        size="sm"
        tone="star"
        show-value
      />
      <p v-else class="mt-1 font-body text-xs text-star-deep">
        已经拿到啦
      </p>
    </li>
  </ul>
</template>
