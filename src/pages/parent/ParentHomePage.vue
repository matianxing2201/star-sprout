<script setup lang="ts">
import type { Category } from '@/domain'
import { computed, onMounted } from 'vue'

import { RouterLink } from 'vue-router'
import { ROUTE_NAMES } from '@/app/router/route-names'
import { useCatalogStore, useProfileStore, useProgressStore } from '@/stores'
import { KCard, KSectionTitle, KStatTile } from '@/ui'

/**
 * 家长中心 · 总览
 * ==============
 *
 * 一屏回答“孩子今天学了吗、学得怎么样、接下来该学什么”。
 * 只呈现可核对的数据与平实的建议，不做儿童端的游戏化表达。
 */
const profile = useProfileStore()
const catalog = useCatalogStore()
const progress = useProgressStore()

onMounted(() => progress.refresh())

const report = computed(() => progress.reportFor(profile.gradeId))

/** 数据最新的领域：建议里提到“往下学”时优先选它 */
const leadingCategory = computed<Category | null>(() => {
  const top = report.value.mastery.find(item => item.mastery.attempts > 0)
  return top ? top.category : null
})

/** 薄弱知识点 → 所属领域，用于在列表里给出上下文 */
const weakPoints = computed(() =>
  report.value.weakPoints.map(point => ({
    id: point.id,
    label: point.label,
    category: report.value.mastery.find(item => item.mastery.weakKnowledgePointIds.includes(point.id))?.category ?? null,
  })),
)

/** 兴趣偏好：投入作答最多的领域，附上作答次数 */
const interests = computed(() => {
  const counted = report.value.mastery.filter(
    item => item.mastery.attempts > 0 && report.value.interests.includes(item.category),
  )
  counted.sort((a, b) => b.mastery.attempts - a.mastery.attempts)
  return counted.map(item => ({ category: item.category, attempts: item.mastery.attempts }))
})

/** 学习建议：全部由真实数据推导，最多 4 条，不使用告警式语气 */
const suggestions = computed<string[]>(() => {
  const lines: string[] = []
  const correctPercent = report.value.correctRate
  const weakest = weakPoints.value[0] ?? null

  // 顺序即优先级：先给需要处理的问题，再给值得肯定的表现，最后才是日常安排
  if (correctPercent > 0 && correctPercent < 70)
    lines.push('平均正确率低于 70%，建议放慢进度，先把学过的主题重做一次，再进入新主题，不必急着往下推。')

  if (weakest) {
    const linked = report.value.recommendations.find(item =>
      item.knowledgePoints.some(point => point.id === weakest.id),
    )
    lines.push(
      linked
        ? `「${weakest.label}」的正确率偏低，下方的「${linked.title}」正好覆盖这个知识点，可以先从它开始。`
        : `「${weakest.label}」的正确率偏低，建议在相关领域里再安排一到两次复习。`,
    )
  }

  if (progress.growth.streakDays >= 3)
    lines.push(`已连续学习 ${progress.growth.streakDays} 天，这个节奏本身就有价值，保持现状即可。`)
  else if (progress.growth.streakDays > 0)
    lines.push(`已连续学习 ${progress.growth.streakDays} 天，再坚持两天更容易形成固定的学习时段。`)

  if (progress.today.minutes === 0)
    lines.push('今天还没有学习记录。一次 10 分钟左右的短时段即可，不必一次学很久。')

  if (correctPercent >= 90 && report.value.lessons > 0)
    lines.push('平均正确率在 90% 以上，可以适当提高一点难度，给孩子新的内容。')

  if (lines.length === 0 && leadingCategory.value)
    lines.push(`目前没有需要特别处理的问题，可以在「${leadingCategory.value.name}」里继续按顺序往下学。`)

  if (lines.length === 0)
    lines.push('还没有可用于分析的学习记录。先选择一个年级，完成一次课程后这里会给出具体建议。')

  return lines.slice(0, 4)
})

const grade = computed(() => catalog.grade(profile.gradeId))
</script>

<template>
  <div class="flex flex-col gap-8">
    <!-- 年级切换：面向家长的普通选项，不做成长阶梯那种游戏化呈现 -->
    <section>
      <p class="mb-3 font-body text-xs font-bold tracking-[0.22em] text-ink-faint uppercase">
        当前查看的年级
      </p>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="item in catalog.grades"
          :key="item.id"
          type="button"
          :aria-pressed="item.id === profile.gradeId"
          class="rounded-chip border-2 px-4 py-2 text-left font-body text-sm transition-colors"
          :class="item.id === profile.gradeId
            ? 'border-ink bg-ink text-paper'
            : 'border-line bg-surface text-ink-soft hover:border-line-strong hover:text-ink'"
          @click="profile.switchGrade(item.id)"
        >
          {{ item.name }}
          <span class="ml-1 text-xs opacity-70">{{ item.ageRange }}</span>
        </button>
      </div>
    </section>

    <!-- 关键数字 -->
    <section class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <KStatTile
        emoji="⏱️"
        :value="`${progress.today.minutes} 分钟`"
        label="今日学习时间"
        :hint="`今日完成 ${progress.today.lessons} 节`"
      />
      <KStatTile
        emoji="📘"
        :value="report.lessons"
        label="完成课程"
        :hint="`累计 ${report.minutes} 分钟`"
      />
      <KStatTile
        emoji="🎯"
        :value="`${report.correctRate}%`"
        label="平均正确率"
        :hint="`基于 ${progress.attempts.length} 次作答`"
      />
      <KStatTile
        emoji="📅"
        :value="`${progress.growth.streakDays} 天`"
        label="连续学习"
        :hint="`累计学习 ${progress.growth.learningDays} 天`"
      />
    </section>

    <!-- 学习建议 -->
    <section>
      <KSectionTitle
        eyebrow="建议"
        title="学习建议"
        description="根据当前年级的学习记录推导，供安排家庭学习时参考。"
      />
      <KCard>
        <ul class="flex flex-col gap-3">
          <li
            v-for="(line, index) in suggestions"
            :key="index"
            class="font-body text-sm leading-relaxed text-ink-soft"
          >
            {{ line }}
          </li>
        </ul>
      </KCard>
    </section>

    <!-- 薄弱知识点 -->
    <section>
      <KSectionTitle
        eyebrow="薄弱点"
        title="薄弱知识点"
        description="按出错次数排序，最多列出 5 项。"
      />
      <KCard v-if="weakPoints.length > 0" padded="none">
        <ul class="divide-y divide-line">
          <li
            v-for="point in weakPoints"
            :key="point.id"
            class="flex flex-wrap items-center justify-between gap-2 px-5 py-3"
          >
            <span class="font-body text-sm text-ink">{{ point.label }}</span>
            <span class="font-body text-xs text-ink-faint">{{ point.category?.name ?? '未归属领域' }}</span>
          </li>
        </ul>
      </KCard>
      <KCard v-else>
        <p class="font-body text-sm text-ink-soft">
          目前没有明显的薄弱项，已作答的知识点掌握得比较均匀。
        </p>
      </KCard>
    </section>

    <!-- 下一步推荐 -->
    <section>
      <KSectionTitle
        eyebrow="推荐"
        title="下一步推荐"
        description="按主题顺序与当前进度给出，点击可查看该领域的课程地图。"
      />
      <ul v-if="report.recommendations.length > 0" class="grid list-none gap-3 sm:grid-cols-3">
        <li v-for="topic in report.recommendations" :key="topic.id">
          <RouterLink
            :to="{ name: ROUTE_NAMES.courseMap, params: { gradeId: topic.gradeId, categoryId: topic.categoryId } }"
            class="flex h-full flex-col gap-2 rounded-tile border-2 border-line bg-surface p-4 shadow-press transition-colors hover:border-line-strong"
          >
            <span class="flex items-center gap-2">
              <span class="text-xl" aria-hidden="true">{{ topic.emoji }}</span>
              <span class="font-body text-sm font-medium text-ink">{{ topic.title }}</span>
            </span>
            <span class="font-body text-xs text-ink-faint">
              {{ catalog.category(topic.categoryId)?.name ?? '未归属领域' }}
            </span>
            <span class="font-body text-xs text-ink-faint">
              {{ topic.lessonIds.length }} 节课程 · 难度 {{ topic.level }}
            </span>
          </RouterLink>
        </li>
      </ul>
      <KCard v-else>
        <p class="font-body text-sm text-ink-soft">
          {{ grade?.name }}的课程内容还在补充中，暂时没有可推荐的主题。
        </p>
      </KCard>
    </section>

    <!-- 兴趣偏好 -->
    <section>
      <KSectionTitle
        eyebrow="兴趣"
        title="兴趣偏好"
        description="按作答次数统计，反映孩子在各领域上的实际投入。"
      />
      <ul v-if="interests.length > 0" class="flex list-none flex-wrap gap-3">
        <li
          v-for="item in interests"
          :key="item.category.id"
          class="flex items-center gap-3 rounded-tile border-2 border-line bg-surface px-4 py-3 shadow-press"
        >
          <span class="text-lg" aria-hidden="true">{{ item.category.emoji }}</span>
          <span class="flex flex-col">
            <span class="font-body text-sm text-ink">{{ item.category.name }}</span>
            <span class="font-numeric text-xs text-ink-faint">{{ item.attempts }} 次作答</span>
          </span>
        </li>
      </ul>
      <KCard v-else>
        <p class="font-body text-sm text-ink-soft">
          还没有足够的作答记录来判断兴趣偏好。
        </p>
      </KCard>
    </section>
  </div>
</template>
