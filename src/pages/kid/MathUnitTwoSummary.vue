<script setup lang="ts">
import type { UnitTwoTask } from '@/content/grades/grade-1/math-unit-two-practice'

import { KButton, KTag } from '@/ui'

defineProps<{
  originalCount: number
  totalOriginalCount: number
  extensionCount: number
  totalExtensionCount: number
  accuracy: number
  knowledgePointName?: string
  nextKnowledgePointName?: string
  missedTasks: UnitTwoTask[]
  reviewCorrectIds: string[]
  pointSummary: Array<{ id: string, label: string, needsPractice: boolean, missedCount: number }>
}>()

const emit = defineEmits<{
  retryMissed: []
  restart: []
  nextKnowledgePoint: []
  returnToOutline: []
}>()
</script>

<template>
  <section class="grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(17rem,0.8fr)]">
    <div class="rounded-card border-2 border-success-line bg-success-soft p-5 shadow-sticker sm:p-7">
      <KTag tone="success" size="sm">
        今天完成
      </KTag>
      <h2 class="mt-3 font-display text-3xl text-ink">
        {{ knowledgePointName ? `${knowledgePointName}练完啦！` : '第二单元练习完成！' }}
      </h2>
      <p class="mt-2 font-body text-sm leading-relaxed text-ink-soft">
        你完成了本部分原题、同类变式和错题订正。真棒，和佩奇一家一起把今天的学习收好吧。
      </p>
      <div class="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div class="rounded-tile border border-white bg-white/80 p-3">
          <p class="font-body text-xs text-ink-faint">
            原题
          </p><p class="mt-1 font-numeric text-2xl font-black text-ink">
            {{ originalCount }} / {{ totalOriginalCount }}
          </p>
        </div>
        <div class="rounded-tile border border-white bg-white/80 p-3">
          <p class="font-body text-xs text-ink-faint">
            拓展题
          </p><p class="mt-1 font-numeric text-2xl font-black text-ink">
            {{ extensionCount }} / {{ totalExtensionCount }}
          </p>
        </div>
        <div class="rounded-tile border border-white bg-white/80 p-3">
          <p class="font-body text-xs text-ink-faint">
            首次正确率
          </p><p class="mt-1 font-numeric text-2xl font-black text-ink">
            {{ accuracy }}%
          </p>
        </div>
        <div class="rounded-tile border border-white bg-white/80 p-3">
          <p class="font-body text-xs text-ink-faint">
            订正题目
          </p><p class="mt-1 font-numeric text-2xl font-black text-ink">
            {{ missedTasks.length }}
          </p>
        </div>
      </div>
    </div>
    <aside class="rounded-card border-2 border-line bg-surface p-5 shadow-press">
      <h3 class="font-display text-lg text-ink">
        知识点回顾
      </h3>
      <ul class="mt-3 space-y-2">
        <li v-for="point in pointSummary" :key="point.id" class="flex items-center justify-between gap-3 rounded-tile bg-paper px-3 py-2">
          <span class="font-body text-sm text-ink">{{ point.label }}</span>
          <KTag :tone="point.needsPractice ? 'think' : 'success'" size="sm">
            {{ point.needsPractice ? `再练 ${point.missedCount} 题` : '掌握较好' }}
          </KTag>
        </li>
      </ul>
    </aside>
    <div class="rounded-card border-2 border-line bg-paper p-5 lg:col-span-2">
      <h3 class="font-display text-lg text-ink">
        错题清单
      </h3>
      <ul v-if="missedTasks.length" class="mt-3 grid gap-2 sm:grid-cols-2">
        <li v-for="task in missedTasks" :key="task.id" class="flex items-center justify-between gap-3 rounded-tile border border-line bg-surface px-3 py-2">
          <div>
            <p class="font-body text-sm font-bold text-ink">
              {{ task.prompt }}
            </p><p class="mt-0.5 font-body text-xs text-ink-faint">
              {{ task.knowledgePoint }} · {{ task.label }}
            </p>
          </div>
          <KTag :tone="reviewCorrectIds.includes(task.id) ? 'success' : 'think'" size="sm">
            {{ reviewCorrectIds.includes(task.id) ? '已订正' : '已回顾' }}
          </KTag>
        </li>
      </ul>
      <p v-else class="mt-2 font-body text-sm text-ink-soft">
        没有错题需要订正，继续保持！
      </p>
    </div>
    <div class="flex flex-wrap justify-end gap-3 lg:col-span-2">
      <KButton v-if="missedTasks.length" variant="soft" tone="think" @click="emit('retryMissed')">
        再做一遍错题
      </KButton>
      <KButton variant="ghost" @click="emit('restart')">
        重新开始今天的练习
      </KButton>
      <KButton v-if="nextKnowledgePointName" variant="soft" tone="math" @click="emit('nextKnowledgePoint')">
        继续下一个知识点：{{ nextKnowledgePointName }}
      </KButton>
      <KButton variant="primary" tone="math" @click="emit('returnToOutline')">
        回到数学大纲
      </KButton>
    </div>
  </section>
</template>
