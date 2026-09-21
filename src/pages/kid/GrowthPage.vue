<script setup lang="ts">
import type { AppIconName, Topic } from '@/domain'
import { computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'

import { ROUTE_NAMES } from '@/app/router/route-names'
import { GrowthSummary } from '@/features/reward'
import { useCatalogStore, useProfileStore, useProgressStore } from '@/stores'
import { KButton, KEmptyState, KIcon, KIconTile, KProgress, KSectionTitle, KStatTile, KTag, STAT_ICONS, TONE_ICONS } from '@/ui'
import { TOPIC_KIND_ICONS } from '@/ui/icons'

/**
 * 我的成长
 * ========
 *
 * 这一个页面回答孩子一句话：“我长到哪儿了？”
 *
 * 需求第三十节第 7 条要求这里说清楚：学习天数 / 学习课程 / 已掌握知识 / 获得徽章 / 探索进度。
 * 全部只和自己比 —— 没有排名，没有“别人比你多”，也没有任何一处会让孩子觉得落后。
 */
const progress = useProgressStore()
const profile = useProfileStore()
const catalog = useCatalogStore()

onMounted(() => progress.refresh())

const earnedBadgeCount = computed(() => progress.badgeWall.filter(item => item.earned).length)

const totalBadgeCount = computed(() => progress.badgeWall.length)

function startOfDay(at: number): number {
  const date = new Date(at)
  date.setHours(0, 0, 0, 0)
  return date.getTime()
}

/** 把时间戳说成孩子能懂的话：今天 / 昨天 / N 天前 */
function friendlyDay(at: number): string {
  const days = Math.round((startOfDay(Date.now()) - startOfDay(at)) / 86_400_000)
  if (days <= 0)
    return '今天'
  if (days === 1)
    return '昨天'
  return `${days} 天前`
}

/** 学习足迹：最近走过的 8 步，新的排在最前面 */
const footprints = computed(() =>
  [...progress.completions]
    .sort((a, b) => b.completedAt - a.completedAt)
    .slice(0, 8)
    .map(completion => ({
      completion,
      lesson: catalog.lesson(completion.lessonId),
      when: friendlyDay(completion.completedAt),
    })),
)

/** 当前年级的每个领域，各自掌握到了哪里 */
const masteryRows = computed(() =>
  catalog.categoriesOf(profile.gradeId).map(category => ({
    category,
    mastery: progress.masteryOf(profile.gradeId, category.id),
  })),
)

/** 探索进度：这个年级一共多少个主题，走过多少个 */
const gradeTopics = computed(() => catalog.topics.filter(topic => topic.gradeId === profile.gradeId))

const completedTopicCount = computed(() =>
  gradeTopics.value.filter(topic => progress.topicProgressOf(topic.id).status === 'completed').length,
)

const waitingTopicCount = computed(() => Math.max(0, gradeTopics.value.length - completedTopicCount.value))

/** 用孩子的话说进度：走过了几个，还有几个在等我 */
const exploreSentence = computed(() => {
  if (gradeTopics.value.length === 0)
    return '这里的主题还在铺路，我们先去别的地方看看。'
  if (waitingTopicCount.value === 0)
    return `你走过了 ${completedTopicCount.value} 个主题，这个阶段全都走完啦！`
  return `你走过了 ${completedTopicCount.value} 个主题，还有 ${waitingTopicCount.value} 个在等你。`
})

function isTopicDone(topicId: string): boolean {
  return progress.topicProgressOf(topicId).status === 'completed'
}

/** 主题图标：主题自己声明了就用它，否则跟随所属领域的色调 */
function topicIcon(topic: Topic): AppIconName {
  const category = catalog.category(topic.categoryId)
  return topic.icon ?? (category ? TONE_ICONS[category.tone] : TOPIC_KIND_ICONS.standard)
}

/** 课程图标：课程自己声明了就用它，否则跟随课程色调；课程缺失时才退回通用图标 */
function lessonIcon(lessonId: string): AppIconName {
  const lesson = catalog.lesson(lessonId)
  if (!lesson)
    return 'book'
  return lesson.icon ?? TONE_ICONS[lesson.tone]
}
</script>

<template>
  <div class="flex flex-col gap-10">
    <GrowthSummary />

    <!-- 三个数字：来了多少天、全对的课、拿到的徽章 -->
    <section class="grid gap-4 sm:grid-cols-3">
      <KStatTile icon="calendar" :value="progress.growth.learningDays" label="学习天数" hint="每天来一下就算一天" tone="language" />
      <KStatTile icon="star-four" :value="progress.growth.perfectLessons" label="一次就做对的课" hint="这些课里你全对哦" tone="star" />
      <KStatTile :icon="STAT_ICONS.badge" :value="earnedBadgeCount" label="获得徽章" :hint="`徽章墙上一共 ${totalBadgeCount} 枚`" tone="badge" />
    </section>

    <!-- 学习足迹 -->
    <section>
      <KSectionTitle
        eyebrow="足迹"
        title="学习足迹"
        description="你走过的每一步都记在这里，最近的排在最前面。"
        tone="explore"
      />

      <ol v-if="footprints.length > 0" class="grid gap-3">
        <li v-for="item in footprints" :key="item.completion.lessonId">
          <RouterLink
            :to="{ name: ROUTE_NAMES.lesson, params: { lessonId: item.completion.lessonId } }"
            class="fx-tap flex items-center gap-4 rounded-tile border-2 border-line bg-surface p-4 shadow-press hover:border-line-strong"
          >
            <KIcon :name="lessonIcon(item.completion.lessonId)" size="lg" weight="duotone" />
            <span class="min-w-0 flex-1">
              <span class="block font-display text-base text-ink">
                {{ item.lesson?.title ?? '一节课' }}
              </span>
              <span class="block font-body text-xs text-ink-faint">{{ item.when }}</span>
            </span>
            <span class="flex items-center gap-1 font-numeric text-lg font-extrabold text-star-deep">
              <KIcon :name="STAT_ICONS.stars" size="sm" weight="fill" />
              {{ item.completion.stars }}
            </span>
          </RouterLink>
        </li>
      </ol>

      <KEmptyState
        v-else
        icon="plant"
        title="还没有足迹，我们一起去找找"
        description="完成第一节课，这里就会亮起来。"
        tone="explore"
      >
        <template #action>
          <KButton :to="{ name: ROUTE_NAMES.home }" tone="explore">
            去学习世界看看
          </KButton>
        </template>
      </KEmptyState>
    </section>

    <!-- 掌握度 -->
    <section>
      <KSectionTitle
        eyebrow="本领"
        title="我掌握得怎么样"
        description="每个领域都有自己的进度条，答得越顺，进度条长得越满。还没开始的领域也在等你。"
        tone="think"
      />

      <ul v-if="masteryRows.length > 0" class="grid gap-4 sm:grid-cols-2">
        <li
          v-for="row in masteryRows"
          :key="row.category.id"
          class="rounded-tile border-2 border-line bg-surface p-5 shadow-press"
        >
          <div class="flex items-center gap-3">
            <KIconTile
              :icon="row.category.icon ?? TONE_ICONS[row.category.tone]"
              :tone="row.category.tone"
              size="sm"
            />
            <div class="min-w-0">
              <p class="font-display text-lg text-ink">
                {{ row.category.name }}
              </p>
              <p class="font-body text-xs text-ink-faint">
                {{ row.category.focus[0] }}
              </p>
            </div>
          </div>

          <KProgress
            v-if="row.mastery.attempts > 0"
            class="mt-4"
            :value="row.mastery.mastery"
            :tone="row.category.tone"
            size="md"
            :label="`一共答了 ${row.mastery.attempts} 次 · 答对 ${Math.round(row.mastery.correctRate * 100)}%`"
            show-value
          />
          <p v-else class="mt-4 flex items-center gap-2 font-body text-sm text-ink-faint">
            <KIcon name="plant" size="sm" />
            还没开始，等你来看看
          </p>
        </li>
      </ul>

      <KEmptyState
        v-else
        icon="compass"
        title="这里还没有可以走的路，我们一起去找找"
        description="这个阶段的领域还在准备中，先去成长阶梯看看别的阶段吧。"
      >
        <template #action>
          <KButton variant="soft" :to="{ name: ROUTE_NAMES.grades }">
            去看成长阶梯
          </KButton>
        </template>
      </KEmptyState>
    </section>

    <!-- 探索进度 -->
    <section>
      <KSectionTitle
        eyebrow="进度"
        title="探索进度"
        description="这个阶段的所有主题，走过一个就点亮一个。"
        tone="energy"
      />

      <div class="rounded-blob border-2 border-line bg-surface p-6 shadow-sticker">
        <p class="flex flex-wrap items-baseline gap-3">
          <span class="font-numeric text-5xl leading-none font-extrabold text-ink">{{ completedTopicCount }}</span>
          <span class="font-display text-xl text-ink-soft">/ {{ gradeTopics.length }} 个主题</span>
        </p>

        <KProgress
          class="mt-4"
          :value="completedTopicCount"
          :max="Math.max(1, gradeTopics.length)"
          tone="energy"
          size="lg"
          show-value
        />

        <p class="mt-3 font-body text-sm text-ink-soft">
          {{ exploreSentence }}
        </p>

        <ul v-if="gradeTopics.length > 0" class="mt-5 flex flex-wrap gap-2">
          <li v-for="topic in gradeTopics" :key="topic.id">
            <KTag
              :tone="catalog.category(topic.categoryId)?.tone ?? 'neutral'"
              size="sm"
              :solid="isTopicDone(topic.id)"
            >
              <KIcon :name="topicIcon(topic)" size="xs" />
              {{ topic.title }}
              <KIcon v-if="isTopicDone(topic.id)" name="check" size="xs" weight="fill" />
            </KTag>
          </li>
        </ul>

        <p v-if="gradeTopics.length > 0" class="mt-3 font-body text-xs text-ink-faint">
          亮亮的是走过的主题，淡淡的还在等你。
        </p>
      </div>
    </section>

    <!-- 再往前走的两个入口 -->
    <section class="flex flex-wrap items-center justify-between gap-4 rounded-blob border-2 border-dashed border-line bg-surface/60 p-6">
      <p class="font-display text-lg text-ink">
        还想再添一枚徽章吗？
      </p>
      <div class="flex flex-wrap gap-3">
        <KButton :to="{ name: ROUTE_NAMES.rewards }" tone="badge">
          去看徽章墙
        </KButton>
        <KButton variant="soft" :to="{ name: ROUTE_NAMES.home }" tone="explore">
          继续去探索
        </KButton>
      </div>
    </section>
  </div>
</template>
