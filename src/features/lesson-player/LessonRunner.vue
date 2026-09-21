<script setup lang="ts">
import type { InteractionResult } from '@/domain'
import { computed, toRef, watch } from 'vue'

import { useRouter } from 'vue-router'
import { ROUTE_NAMES } from '@/app/router/route-names'
import { useLessonSession } from '@/composables/useLessonSession'
import { useCatalogStore } from '@/stores'
import { KButton, KEmptyState } from '@/ui'

import StageDiscover from './StageDiscover.vue'
import StageInteraction from './StageInteraction.vue'
import StageIntro from './StageIntro.vue'
import StageReward from './StageReward.vue'
import StepProgress from './StepProgress.vue'

/**
 * 课程播放器
 * ==========
 *
 * 需求第二十一节规定的课程节奏：
 *   角色引入 → 今天要探索什么 → 知识发现 → 互动操作 → 小游戏 → 练习 → 挑战 → 奖励 → 完成
 *
 * 播放器本身不认识任何具体课程：它只是按 `task.kind` 把每一步交给对应的舞台。
 * 因此“再加一份教案”＝往内容包里加数据，这个文件不需要改。
 */
const { lessonId } = defineProps<{ lessonId: string }>()

const catalog = useCatalogStore()
const router = useRouter()

const session = useLessonSession(toRef(() => lessonId))

const lesson = computed(() => session.lesson.value)
const task = computed(() => session.currentTask.value)

/** 走到奖励步骤就等于完成了这节课：结算与庆祝都只发生一次 */
watch(task, (value) => {
  if (value?.kind === 'reward')
    session.finish()
})

function onInteractionResolved(result: InteractionResult): void {
  if (task.value)
    session.submitInteraction(task.value, result)
}

function exit(): void {
  const current = lesson.value
  if (!current) {
    router.push({ name: ROUTE_NAMES.home })
    return
  }
  router.push({
    name: ROUTE_NAMES.courseMap,
    params: { gradeId: current.gradeId, categoryId: current.categoryId },
  })
}
</script>

<template>
  <div class="mx-auto flex min-h-dvh w-full max-w-4xl flex-col px-4 py-5">
    <template v-if="lesson">
      <header class="flex flex-col gap-4">
        <div class="flex flex-wrap items-center gap-3">
          <button
            type="button"
            class="fx-tap grid size-10 place-items-center rounded-chip border-2 border-line bg-surface text-lg shadow-press"
            aria-label="离开这节课"
            @click="exit"
          >
            ←
          </button>

          <div class="min-w-0">
            <p class="font-body text-xs text-ink-faint">
              {{ catalog.grade(lesson.gradeId)?.name }} · {{ catalog.category(lesson.categoryId)?.name }}
            </p>
            <h1 class="truncate font-display text-xl text-ink sm:text-2xl">
              {{ lesson.emoji }} {{ lesson.title }}
            </h1>
          </div>

          <span class="ml-auto font-numeric text-sm font-bold text-star-deep">
            ⭐ {{ session.earnedStars.value }}
          </span>
        </div>

        <StepProgress
          :tasks="session.tasks.value"
          :cursor="session.cursor.value"
          :done-task-ids="session.doneTaskIds.value"
        />
      </header>

      <main class="flex-1 py-7">
        <template v-if="task">
          <p v-if="task.kind !== 'intro' && task.kind !== 'reward'" class="mb-3 font-body text-xs font-bold tracking-[0.22em] text-ink-faint uppercase">
            {{ task.title }}
          </p>

          <StageIntro
            v-if="task.kind === 'intro'"
            :task="task"
            @done="session.next()"
          />

          <StageDiscover
            v-else-if="task.kind === 'discover'"
            :task="task"
            @done="session.next()"
          />

          <StageInteraction
            v-else-if="task.kind === 'interaction' || task.kind === 'practice' || task.kind === 'challenge'"
            :task="task"
            :mascot="lesson.mascot"
            @resolved="onInteractionResolved"
            @done="session.next()"
          />

          <StageReward
            v-else-if="task.kind === 'reward'"
            :task="task"
            :lesson="lesson"
            :stars="session.settledStars.value"
            @restart="session.restart()"
            @exit="exit"
          />
        </template>
      </main>

      <footer class="flex items-center justify-between gap-3 border-t-2 border-line pt-4">
        <KButton
          variant="ghost"
          size="sm"
          :disabled="session.cursor.value === 0"
          @click="session.back()"
        >
          ← 上一步
        </KButton>

        <p class="font-body text-xs text-ink-faint">
          约 {{ lesson.minutes }} 分钟 · 每个小任务 1~3 分钟
        </p>

        <KButton
          v-if="task && task.kind !== 'reward' && task.kind !== 'interaction' && task.kind !== 'practice' && task.kind !== 'challenge'"
          variant="soft"
          size="sm"
          @click="session.next()"
        >
          下一步 →
        </KButton>
      </footer>
    </template>

    <KEmptyState
      v-else
      emoji="🧭"
      title="没有找到这节课"
      description="它可能已经被移动了。回到课程地图看看别的吧。"
    >
      <template #action>
        <KButton tone="explore" @click="router.push({ name: ROUTE_NAMES.home })">
          回到学习世界
        </KButton>
      </template>
    </KEmptyState>
  </div>
</template>
