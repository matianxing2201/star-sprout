<script setup lang="ts">
import type { AppIconName, Lesson, Topic, UiTone } from '@/domain'
import { computed, defineAsyncComponent, onMounted, ref } from 'vue'

import { RouterLink, useRoute, useRouter } from 'vue-router'
import { ROUTE_NAMES } from '@/app/router/route-names'
import { MascotBubble } from '@/features/mascot'
import { WorldMap, WorldSpotlight } from '@/features/world-map'
import { useCatalogStore, useProfileStore, useProgressStore } from '@/stores'
import { KButton, KEmptyState, KIcon, KIconTile, KProgress, KSectionTitle, KStatTile, KTag, STAT_ICONS, TONE_ICONS } from '@/ui'
import { TOPIC_KIND_ICONS } from '@/ui/icons'

/**
 * 首页 / 学习世界
 * ==============
 *
 * 需求第三十节第 1 条要求首页显示：当前角色、当前年级、学习地图、今日任务、
 * 学习进度、最近课程、今日奖励。
 *
 * 排列顺序是有意的：先回答“我是谁、我在哪”，再给“今天可以做什么”，
 * 最后才是“我做到了多少”。孩子不需要先看懂统计数字才能开始玩。
 */
const profile = useProfileStore()
const catalog = useCatalogStore()
const progress = useProgressStore()
const router = useRouter()
const route = useRoute()

/*
 * 原型面（一次性代码，见 src/prototypes/README.md）
 * ==============================================
 * 三个视觉方向 + 现状，用 ?variant= 切换，方便在**真实外壳与真实数据**下比较。
 *
 * 两道闸门，缺一不可：
 *   1. `import.meta.env.DEV` —— 生产构建里这两个常量直接变成 null，动态导入被摇掉；
 *   2. `?variant=` 存在 —— 不带参数时首页就是生产版本，行为一字不变。
 * `src/styles/design-contract.spec.ts` 里有契约守着这两条。
 */
const PrototypeStage = import.meta.env.DEV
  ? defineAsyncComponent(() => import('@/prototypes/PrototypeStage.vue'))
  : null

const PrototypeSwitcher = import.meta.env.DEV
  ? defineAsyncComponent(() => import('@/prototypes/PrototypeSwitcher.vue'))
  : null

/** 唯一需要首页自己认识的值：`now` = 参照项，渲染生产版本本身方便对比 */
const PROTOTYPE_BASELINE = 'now'

const prototypeVariant = computed(() =>
  import.meta.env.DEV ? String(route.query.variant ?? '') : '',
)

const showPrototype = computed(() => prototypeVariant.value !== '')
const showVariant = computed(() => showPrototype.value && prototypeVariant.value !== PROTOTYPE_BASELINE)
/** 重放入场动画：换 key 让变体重新挂载 */
const replayToken = ref(0)

onMounted(() => progress.refresh())

const grade = computed(() => catalog.grade(profile.gradeId))

/** 今日任务：优先进行中的主题，其次按顺序推进 */
const todayTopics = computed<Topic[]>(() => progress.recommendFor(profile.gradeId, 3))

/** 这个年级是否已经有可玩的内容 */
const hasAnyContent = computed(() =>
  catalog.topics.some(topic => topic.gradeId === profile.gradeId && topic.lessonIds.length > 0),
)

const recentCompletions = computed(() =>
  [...progress.completions]
    .sort((a, b) => b.completedAt - a.completedAt)
    .slice(0, 3)
    .map(completion => ({ completion, lesson: catalog.lesson(completion.lessonId) })),
)

const gradeTopics = computed(() => catalog.topics.filter(topic => topic.gradeId === profile.gradeId))

const completedTopics = computed(() =>
  gradeTopics.value.filter(topic => progress.topicProgressOf(topic.id).status === 'completed').length,
)

const selectedWorldId = ref<string | null>(null)

const greeting = computed(() => {
  const name = profile.nickname
  if (progress.growth.streakDays >= 3)
    return `${name}，你已经连续学习 ${progress.growth.streakDays} 天啦，今天我们继续探险！`
  if (progress.today.lessons > 0)
    return `${name}，今天已经完成 ${progress.today.lessons} 个探索，还要再来一个吗？`
  return `${name}，今天想去哪里看看？`
})

function enterTopic(topic: Topic): void {
  const firstLesson = topic.lessonIds[0]
  // 有内容就直接开玩：少一次点击，就少一次“算了我还是别玩了”
  if (firstLesson) {
    router.push({ name: ROUTE_NAMES.lesson, params: { lessonId: firstLesson } })
    return
  }
  router.push({
    name: ROUTE_NAMES.courseMap,
    params: { gradeId: topic.gradeId, categoryId: topic.categoryId },
  })
}

/** 主题所属领域的色调：主题卡片与图标都跟着领域走 */
function topicTone(topic: Topic): UiTone {
  return catalog.category(topic.categoryId)?.tone ?? 'neutral'
}

/** 主题图标：主题自己声明了就用它，否则跟随所属领域的色调 */
function topicIcon(topic: Topic): AppIconName {
  const category = catalog.category(topic.categoryId)
  return topic.icon ?? (category ? TONE_ICONS[category.tone] : TOPIC_KIND_ICONS.standard)
}

/** 课程图标：课程自己声明了就用它，否则跟随课程色调；课程缺失时才退回通用图标 */
function lessonIcon(lesson: Lesson | undefined): AppIconName {
  if (!lesson)
    return 'book'
  return lesson.icon ?? TONE_ICONS[lesson.tone]
}
</script>

<template>
  <!-- 原型方向（只在开发环境 + 带 ?variant= 时出现） -->
  <PrototypeStage
    v-if="showVariant"
    :key="replayToken"
    :variant="prototypeVariant"
  />

  <div v-else class="flex flex-col gap-10">
    <!-- 角色引入 + 今日状态 -->
    <section class="grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
      <div class="rounded-blob border-2 border-line bg-surface p-6 shadow-sticker">
        <MascotBubble :id="profile.profile.mascot" :text="greeting" mood="happy" size="md" />

        <div class="mt-5 flex flex-wrap items-center gap-3">
          <KTag :tone="grade?.tone ?? 'explore'" size="md">
            <KIcon v-if="grade" :name="grade.icon" size="sm" />
            {{ grade?.name }}
          </KTag>
          <KTag tone="star" size="md">
            <KIcon :name="STAT_ICONS.stars" size="sm" weight="fill" />
            {{ progress.growth.stars }} 颗星星
          </KTag>
          <KTag v-if="progress.growth.streakDays > 0" tone="energy" size="md">
            <KIcon :name="STAT_ICONS.streak" size="sm" weight="fill" />
            连续 {{ progress.growth.streakDays }} 天
          </KTag>
        </div>

        <p class="mt-4 font-body text-sm text-ink-soft">
          {{ grade?.tagline }}
        </p>

        <div class="mt-5">
          <KProgress
            :value="completedTopics"
            :max="Math.max(1, gradeTopics.length)"
            tone="star"
            :label="`${grade?.name}探索进度`"
            show-value
          />
          <p class="mt-2 font-body text-xs text-ink-faint">
            {{ grade?.nextHint }}
          </p>
        </div>
      </div>

      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        <KStatTile :icon="STAT_ICONS.minutes" :value="`${progress.today.minutes} 分钟`" label="今天学习" tone="explore" />
        <KStatTile :icon="STAT_ICONS.lessons" :value="progress.today.lessons" label="今天完成的探索" tone="language" />
        <KStatTile :icon="STAT_ICONS.stars" :value="progress.today.stars" label="今天得到的星星" tone="star" />
        <KStatTile
          :icon="STAT_ICONS.worlds"
          :value="progress.growth.exploredWorldIds.length"
          label="去过的学习世界"
          tone="science"
        />
      </div>
    </section>

    <!-- 今日任务 -->
    <section>
      <KSectionTitle
        eyebrow="今天"
        title="今天要探索什么？"
        description="选一个开始吧，每个小任务只要 1~3 分钟。"
        tone="star"
      >
        <template #action>
          <KButton variant="soft" size="sm" :to="{ name: ROUTE_NAMES.categories, params: { gradeId: profile.gradeId } }">
            看全部领域
          </KButton>
        </template>
      </KSectionTitle>

      <ul v-if="todayTopics.length > 0" class="fx-stagger grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <li v-for="topic in todayTopics" :key="topic.id">
          <button
            type="button"
            class="fx-tap flex h-full w-full flex-col items-start gap-2 rounded-card border-2 border-line bg-surface p-5 text-left shadow-sticker hover:shadow-lift"
            @click="enterTopic(topic)"
          >
            <span class="flex w-full items-center gap-3">
              <KIconTile :icon="topicIcon(topic)" :tone="topicTone(topic)" size="md" />
              <KTag :tone="topic.kind === 'challenge' ? 'social' : topic.kind === 'hidden' ? 'badge' : 'star'" size="sm">
                <KIcon :name="TOPIC_KIND_ICONS[topic.kind]" size="xs" />
                {{ topic.kind === 'challenge' ? '挑战' : topic.kind === 'hidden' ? '隐藏' : '可以开始' }}
              </KTag>
            </span>
            <span class="font-display text-xl text-ink">{{ topic.title }}</span>
            <span class="font-body text-xs leading-relaxed text-ink-soft">
              {{ topic.objectives[0] }}
            </span>
            <span class="mt-auto pt-3 font-body text-xs text-ink-faint">
              {{ topic.lessonIds.length > 0 ? `${topic.lessonIds.length} 节探索` : '内容准备中' }}
            </span>
          </button>
        </li>
      </ul>

      <KEmptyState
        v-else
        icon="plant"
        :title="`${grade?.name}的地图正在铺路`"
        description="这个年级的探索任务还在准备中，先去成长阶梯看看别的阶段吧。"
        :tone="grade?.tone"
      >
        <template #action>
          <KButton :to="{ name: ROUTE_NAMES.grades }" tone="explore">
            去看看别的阶段
          </KButton>
        </template>
      </KEmptyState>
    </section>

    <!-- 学习地图 -->
    <section>
      <KSectionTitle
        eyebrow="地图"
        title="我的学习地图"
        description="点一点地图上的地方，看看那里有什么。带着锁的地方，完成前面的任务就能打开。"
        tone="explore"
      />
      <WorldMap :grade-id="profile.gradeId" @select="selectedWorldId = $event" />
    </section>

    <!-- 最近课程 -->
    <section v-if="recentCompletions.length > 0">
      <KSectionTitle eyebrow="回看" title="最近玩过的" tone="think" />
      <ul class="grid gap-4 sm:grid-cols-3">
        <li v-for="item in recentCompletions" :key="item.completion.lessonId">
          <RouterLink
            :to="{ name: ROUTE_NAMES.lesson, params: { lessonId: item.completion.lessonId } }"
            class="fx-tap flex h-full flex-col gap-2 rounded-tile border-2 border-line bg-surface p-4 shadow-press"
          >
            <span class="flex items-center gap-2">
              <KIcon :name="lessonIcon(item.lesson)" size="lg" weight="duotone" />
              <span class="font-display text-base text-ink">{{ item.lesson?.title ?? '一节课' }}</span>
            </span>
            <span class="flex items-center gap-1 font-numeric text-sm text-star-deep">
              <KIcon :name="STAT_ICONS.stars" size="xs" weight="fill" />
              {{ item.completion.stars }}
            </span>
            <span class="font-body text-xs text-ink-faint">
              {{ catalog.category(item.completion.categoryId)?.name }}
            </span>
          </RouterLink>
        </li>
      </ul>
    </section>

    <WorldSpotlight
      :world-id="selectedWorldId"
      :grade-id="profile.gradeId"
      @close="selectedWorldId = null"
    />

    <!-- 地图下方的兜底入口：内容还没铺开时，孩子依然有路可走 -->
    <section v-if="!hasAnyContent" class="rounded-blob border-2 border-dashed border-line bg-surface/60 p-6">
      <p class="flex items-center gap-2 font-display text-lg text-ink">
        这个世界还在长大
        <KIcon name="plant" size="md" weight="duotone" />
      </p>
      <p class="mt-2 font-body text-sm text-ink-soft">
        课程内容会一份一份地长出来。你可以先去成长阶梯看看别的阶段，或者让爸爸妈妈在家长中心查看学习建议。
      </p>
      <div class="mt-4 flex flex-wrap gap-3">
        <KButton variant="soft" :to="{ name: ROUTE_NAMES.grades }">
          成长阶梯
        </KButton>
        <KButton variant="ghost" :to="{ name: ROUTE_NAMES.parent }">
          家长中心
        </KButton>
      </div>
    </section>
  </div>

  <!-- 浮动切换器：脚手架，不套项目样式 -->
  <PrototypeSwitcher
    v-if="showPrototype"
    v-model:replay-token="replayToken"
  />
</template>
