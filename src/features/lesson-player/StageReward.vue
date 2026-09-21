<script setup lang="ts">
import type { Lesson, RewardTask, Topic } from '@/domain'
import { computed } from 'vue'

import { useRouter } from 'vue-router'
import { ROUTE_NAMES } from '@/app/router/route-names'
import { MascotAvatar } from '@/features/mascot'
import { useCatalogStore, useProgressStore } from '@/stores'
import { KButton, KIcon, KVisual, TONE_ICONS } from '@/ui'

/**
 * 奖励步骤
 * ========
 *
 * 一节课的收尾。奖励动画已经由 RewardLayer 播放过了，这里只做“结算说明”：
 * 拿到了什么、解锁了什么、接下来还能去哪 —— 结束得清楚，孩子才愿意再来。
 */
const {
  task,
  lesson,
  stars,
} = defineProps<{
  task: RewardTask
  lesson: Lesson
  /** 本次实际结算的星星（1~3） */
  stars: number
}>()

const emit = defineEmits<{ restart: [], exit: [] }>()

const catalog = useCatalogStore()
const progress = useProgressStore()
const router = useRouter()

const badge = computed(() =>
  (lesson.reward.badgeId ? catalog.badge(lesson.reward.badgeId) : undefined),
)

const badgeEarned = computed(() => {
  if (!badge.value)
    return false
  return progress.growth.badges.some(award => award.badgeId === badge.value?.id)
})

const unlockedTopics = computed(() =>
  (lesson.reward.unlocksTopicIds ?? [])
    .map(id => catalog.topic(id))
    .filter((topic): topic is Topic => Boolean(topic)),
)

/** 主题没写 icon 时按所属领域的色调取默认图标，与课程地图上的节点保持一致 */
function topicIcon(topic: Topic) {
  const tone = catalog.category(topic.categoryId)?.tone
  return topic.icon ?? (tone ? TONE_ICONS[tone] : 'star-four')
}

function goRewards(): void {
  router.push({ name: ROUTE_NAMES.rewards })
}
</script>

<template>
  <section class="flex flex-col items-center gap-6 py-4 text-center">
    <MascotAvatar :id="lesson.mascot" size="xl" mood="cheering" />

    <div>
      <h2 class="font-display text-3xl text-ink sm:text-4xl">
        {{ task.reward.message }}
      </h2>
      <p class="mt-2 font-body text-sm text-ink-soft">
        {{ lesson.reward.message }}
      </p>
    </div>

    <div class="flex items-center gap-3" :aria-label="`本次获得 ${stars} 颗星星`">
      <KIcon
        v-for="index in 3"
        :key="index"
        name="star"
        size="2xl"
        :weight="index <= stars ? 'fill' : 'bold'"
        :class="index <= stars ? 'animate-pop-in text-star' : 'text-ink-faint opacity-30'"
        :style="{ animationDelay: `${index * 120}ms` }"
      />
      <span class="sr-only">获得 {{ stars }} 颗星星</span>
    </div>

    <div v-if="badge && badgeEarned" class="flex items-center gap-3 rounded-blob border-2 border-badge/35 bg-badge-soft px-6 py-4">
      <KIcon :name="badge.icon" size="xl" weight="duotone" tone="badge" />
      <div class="text-left">
        <p class="font-display text-lg text-badge-deep">
          得到新徽章：{{ badge.name }}
        </p>
        <p class="font-body text-xs text-ink-soft">
          {{ badge.description }}
        </p>
      </div>
    </div>

    <div v-if="unlockedTopics.length > 0" class="rounded-blob border-2 border-line bg-surface px-6 py-4">
      <p class="flex items-center justify-center gap-1.5 font-display text-base text-ink">
        <KIcon name="lock-open" size="sm" />
        解锁了新的地方
      </p>
      <ul class="mt-2 flex flex-wrap justify-center gap-2">
        <li
          v-for="topic in unlockedTopics"
          :key="topic.id"
          class="flex items-center gap-1.5 rounded-chip bg-paper-deep px-3 py-1 font-body text-sm text-ink-soft"
        >
          <KVisual :icon="topicIcon(topic)" size="sm" />
          {{ topic.title }}
        </li>
      </ul>
    </div>

    <div class="flex flex-wrap justify-center gap-3">
      <KButton size="lg" variant="star" @click="goRewards">
        <KIcon name="gift" size="sm" />
        去奖励中心看看
      </KButton>
      <KButton size="lg" variant="soft" @click="emit('restart')">
        再玩一次
      </KButton>
      <KButton size="lg" variant="ghost" @click="emit('exit')">
        回到课程地图
      </KButton>
    </div>
  </section>
</template>
