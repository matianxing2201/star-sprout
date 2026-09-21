<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'

import { ROUTE_NAMES } from '@/app/router/route-names'
import { toneVars } from '@/domain'
import { useCatalogStore, useProfileStore, useProgressStore } from '@/stores'
import { KCard, KEmptyState, KProgress, KSectionTitle } from '@/ui'

/**
 * 家长中心 · 学习报告
 * ==================
 *
 * 面向家长的深度数据页：各领域掌握度、最近学习记录、内容包自检。
 * 这是全站唯一使用表格的页面，数据以可核对的形式并列展示。
 */
const profile = useProfileStore()
const catalog = useCatalogStore()
const progress = useProgressStore()

onMounted(() => progress.refresh())

const report = computed(() => progress.reportFor(profile.gradeId))

const grade = computed(() => catalog.grade(profile.gradeId))

/** 表格里没有作答记录的领域不画进度条，避免误导为“0 分” */
const masteryRows = computed(() =>
  report.value.mastery.map(item => ({
    category: item.category,
    mastery: item.mastery,
    hasData: item.mastery.attempts > 0,
  })),
)

/** 最近 10 条完成记录：只有完成记录的年级才显示在列表里 */
const recentCompletions = computed(() =>
  [...progress.completions]
    .filter(completion => completion.gradeId === profile.gradeId)
    .sort((a, b) => b.completedAt - a.completedAt)
    .slice(0, 10)
    .map(completion => ({
      key: `${completion.lessonId}-${completion.completedAt}`,
      lessonId: completion.lessonId,
      title: catalog.lesson(completion.lessonId)?.title ?? completion.lessonId,
      categoryName: catalog.category(completion.categoryId)?.name ?? '未归属领域',
      stars: completion.stars,
      minutes: Math.max(1, Math.round(completion.seconds / 60)),
      at: completion.completedAt,
    })),
)

/** 内容包自检：静态内容，装配时求值一次即可 */
const issues = catalog.selfCheck()

const stats = catalog.contentStats

const dateFormat = new Intl.DateTimeFormat('zh-CN', {
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
})

const gradeCategories = computed(() => catalog.categoriesOf(profile.gradeId).length)

const gradeTopics = computed(() => catalog.topics.filter(topic => topic.gradeId === profile.gradeId).length)

const gradeLessons = computed(() =>
  catalog.topics
    .filter(topic => topic.gradeId === profile.gradeId)
    .reduce((sum, topic) => sum + topic.lessonIds.length, 0),
)
</script>

<template>
  <div class="flex flex-col gap-8">
    <!-- 年级切换 -->
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

    <!-- 能力分析：掌握度表格 -->
    <section :style="toneVars(grade?.tone ?? 'neutral')">
      <KSectionTitle
        eyebrow="能力分析"
        :title="`${grade?.name ?? ''}领域掌握度`"
        description="掌握度由作答正确率与错误率共同推导；作答次数为 0 的领域不计入分析。"
      />

      <div class="overflow-x-auto rounded-card border-2 border-line bg-surface shadow-press">
        <table class="w-full min-w-[40rem] border-collapse text-left">
          <caption class="sr-only">
            各学习领域的作答次数、正确率与掌握度
          </caption>
          <thead>
            <tr class="border-b-2 border-line bg-paper-deep">
              <th scope="col" class="px-5 py-3 font-body text-xs font-bold text-ink-soft">
                学习领域
              </th>
              <th scope="col" class="px-5 py-3 font-body text-xs font-bold text-ink-soft">
                作答次数
              </th>
              <th scope="col" class="px-5 py-3 font-body text-xs font-bold text-ink-soft">
                正确率
              </th>
              <th scope="col" class="px-5 py-3 font-body text-xs font-bold text-ink-soft">
                掌握度
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in masteryRows"
              :key="row.category.id"
              class="border-b border-line last:border-b-0"
            >
              <th scope="row" class="px-5 py-4 text-left font-normal">
                <RouterLink
                  :to="{ name: ROUTE_NAMES.courseMap, params: { gradeId: profile.gradeId, categoryId: row.category.id } }"
                  class="font-body text-sm font-medium text-[var(--tone-deep)] underline decoration-line-strong underline-offset-4 hover:decoration-current"
                >
                  <span aria-hidden="true">{{ row.category.emoji }}</span>
                  {{ row.category.name }}
                </RouterLink>
                <span class="mt-1 block font-body text-xs text-ink-faint">{{ row.category.summary }}</span>
              </th>
              <td class="px-5 py-4">
                <span class="font-numeric text-sm text-ink">{{ row.mastery.attempts }}</span>
              </td>
              <td class="px-5 py-4">
                <span v-if="row.hasData" class="font-numeric text-sm text-ink">
                  {{ Math.round(row.mastery.correctRate * 100) }}%
                </span>
                <span v-else class="font-body text-sm text-ink-faint">暂无记录</span>
              </td>
              <td class="px-5 py-4">
                <div v-if="row.hasData" class="flex items-center gap-3">
                  <KProgress
                    :value="row.mastery.mastery"
                    :max="1"
                    size="sm"
                    :tone="row.category.tone"
                    :label="`${row.category.name}掌握度`"
                  />
                  <span class="font-numeric w-10 shrink-0 text-right text-sm text-ink">
                    {{ Math.round(row.mastery.mastery * 100) }}%
                  </span>
                </div>
                <span v-else class="font-body text-sm text-ink-faint">学习中</span>
              </td>
            </tr>
            <tr v-if="masteryRows.length === 0">
              <td colspan="4" class="px-5 py-6 font-body text-sm text-ink-soft">
                {{ grade?.name }}暂时没有可分析的领域数据。
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- 学习记录 -->
    <section>
      <KSectionTitle
        eyebrow="记录"
        title="学习记录"
        description="最近完成的 10 节课程，按完成时间从新到旧排列。"
      />

      <ul v-if="recentCompletions.length > 0" class="flex list-none flex-col gap-3">
        <li
          v-for="item in recentCompletions"
          :key="item.key"
          class="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 rounded-tile border-2 border-line bg-surface px-5 py-4 shadow-press"
        >
          <div class="min-w-0">
            <RouterLink
              :to="{ name: ROUTE_NAMES.lesson, params: { lessonId: item.lessonId } }"
              class="font-body text-sm font-medium text-ink underline decoration-line-strong underline-offset-4 hover:decoration-current"
            >
              {{ item.title }}
            </RouterLink>
            <p class="mt-1 font-body text-xs text-ink-faint">
              {{ item.categoryName }}
            </p>
          </div>
          <div class="flex items-center gap-6">
            <span class="font-numeric text-sm text-ink-soft">{{ item.stars }} 星</span>
            <span class="font-numeric text-sm text-ink-soft">{{ item.minutes }} 分钟</span>
            <span class="font-numeric text-sm text-ink-faint">{{ dateFormat.format(item.at) }}</span>
          </div>
        </li>
      </ul>

      <KEmptyState
        v-else
        emoji="🗂️"
        title="暂无学习记录"
        :description="`${grade?.name ?? '当前年级'}还没有完成的课程。孩子在儿童端完成一节课程后，这里会出现对应的记录。`"
      />
    </section>

    <!-- 内容完整性自检：维护内容包的人看这个区块 -->
    <section>
      <KSectionTitle
        eyebrow="内容维护"
        title="内容完整性自检"
        description="此区块面向内容维护者，用于确认内容包是否存在缺字段、断链或空主题。家长无需关注。"
      />

      <KCard>
        <template v-if="issues.length === 0">
          <p class="font-body text-sm text-ink">
            内容包校验通过，未发现结构性问题。
          </p>
          <dl class="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-5">
            <div>
              <dt class="font-body text-xs text-ink-faint">
                年级
              </dt>
              <dd class="font-numeric text-lg text-ink">
                {{ stats.grades }}
              </dd>
            </div>
            <div>
              <dt class="font-body text-xs text-ink-faint">
                领域
              </dt>
              <dd class="font-numeric text-lg text-ink">
                {{ stats.categories }}
              </dd>
            </div>
            <div>
              <dt class="font-body text-xs text-ink-faint">
                主题
              </dt>
              <dd class="font-numeric text-lg text-ink">
                {{ stats.topics }}
              </dd>
            </div>
            <div>
              <dt class="font-body text-xs text-ink-faint">
                课程
              </dt>
              <dd class="font-numeric text-lg text-ink">
                {{ stats.lessons }}
              </dd>
            </div>
            <div>
              <dt class="font-body text-xs text-ink-faint">
                知识方向
              </dt>
              <dd class="font-numeric text-lg text-ink">
                {{ stats.skills }}
              </dd>
            </div>
          </dl>
          <p class="mt-4 font-body text-xs text-ink-faint">
            当前年级包含 {{ gradeCategories }} 个领域、{{ gradeTopics }} 个主题、{{ gradeLessons }} 节课程。
          </p>
        </template>

        <template v-else>
          <p class="font-body text-sm text-ink">
            内容包存在 {{ issues.length }} 处问题，请按下列条目逐项修正。
          </p>
          <ul class="mt-3 flex list-none flex-col gap-2">
            <li
              v-for="issue in issues"
              :key="issue"
              class="rounded-tile border-2 border-line bg-paper-deep px-4 py-2 font-body text-xs leading-relaxed text-ink-soft"
            >
              {{ issue }}
            </li>
          </ul>
        </template>
      </KCard>
    </section>
  </div>
</template>
