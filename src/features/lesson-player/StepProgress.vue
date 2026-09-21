<script setup lang="ts">
import type { LearningTask } from '@/domain'
import { TASK_KIND_LABELS } from '@/domain'
import { cn } from '@/shared/utils'

/**
 * 学习任务进度
 * ============
 *
 * 不显示“第 3 步 / 共 9 步”这种计数，而是把每一步的**角色**摆出来：
 * 角色引入 → 知识发现 → 动手探索 → 小试身手 → 挑战 → 奖励。
 * 孩子看到的是“走到哪一站了”，而不是“还剩几道题”。
 */
const {
  tasks,
  cursor,
  doneTaskIds,
} = defineProps<{
  tasks: LearningTask[]
  cursor: number
  doneTaskIds: string[]
}>()
</script>

<template>
  <ol class="flex items-center gap-1.5 overflow-x-auto pb-1" aria-label="学习步骤">
    <li
      v-for="(task, index) in tasks"
      :key="task.id"
      :class="cn(
        'flex shrink-0 items-center gap-1.5 rounded-chip border-2 px-3 py-1 font-body text-xs whitespace-nowrap',
        index === cursor
          ? 'border-star-deep/40 bg-star-soft text-ink shadow-press'
          : doneTaskIds.includes(task.id)
            ? 'border-success/35 bg-success-soft text-success-deep'
            : 'border-line bg-surface/70 text-ink-faint',
      )"
      :aria-current="index === cursor ? 'step' : undefined"
    >
      <span aria-hidden="true">
        {{ doneTaskIds.includes(task.id) && index !== cursor ? '✓' : index + 1 }}
      </span>
      {{ TASK_KIND_LABELS[task.kind] }}
    </li>
  </ol>
</template>
