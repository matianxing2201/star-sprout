<script setup lang="ts">
import type { Category, GradeId } from '@/domain'
import { computed } from 'vue'

import { useRouter } from 'vue-router'
import { ROUTE_NAMES } from '@/app/router/route-names'
import { useCatalogStore, useProgressStore } from '@/stores'
import { KButton, KEmptyState, KModal, KProgress, KTag } from '@/ui'

/**
 * 学习世界聚焦卡
 * ==============
 *
 * 点地图上的一个世界后弹出：这是哪里、里面有什么、我从哪进去。
 * 未解锁的世界也给出明确的“怎么才能打开”，而不是一句“锁定”。
 */
const {
  worldId,
  gradeId,
} = defineProps<{
  worldId: string | null
  gradeId: GradeId
}>()

const emit = defineEmits<{ close: [] }>()

const catalog = useCatalogStore()
const progress = useProgressStore()
const router = useRouter()

const open = computed(() => Boolean(worldId))

const world = computed(() => (worldId ? catalog.world(worldId) : undefined))

/** 当前年级下归属这个世界、并且已经有内容的领域 */
const categories = computed<Category[]>(() => {
  if (!worldId)
    return []
  return catalog
    .categoriesOf(gradeId)
    .filter(category => catalog.worldIdOfCategory(category.id) === worldId)
})

const hasContent = computed(() =>
  categories.value.some(category => catalog.countLessonsOfCategory(category.id) > 0),
)

function enter(categoryId: string): void {
  router.push({ name: ROUTE_NAMES.courseMap, params: { gradeId, categoryId } })
  emit('close')
}

function masteryOf(categoryId: string): number {
  return progress.masteryOf(gradeId, categoryId).mastery
}
</script>

<template>
  <KModal :open="open" :title="world?.name" size="md" @close="emit('close')">
    <div v-if="world" class="flex flex-col gap-5">
      <div class="flex items-start gap-4">
        <span class="text-5xl" aria-hidden="true">{{ world.emoji }}</span>
        <div>
          <p class="font-display text-lg text-ink">
            {{ world.tagline }}
          </p>
          <p class="mt-1 font-body text-sm text-ink-soft">
            {{ world.description }}
          </p>
        </div>
      </div>

      <div v-if="categories.length > 0" class="flex flex-col gap-3">
        <p class="font-body text-xs font-bold tracking-[0.2em] text-ink-faint uppercase">
          这里的领域
        </p>

        <button
          v-for="category in categories"
          :key="category.id"
          type="button"
          class="fx-tap rounded-tile border-2 border-line bg-surface p-4 text-left shadow-press"
          @click="enter(category.id)"
        >
          <div class="flex items-center gap-3">
            <span class="text-2xl" aria-hidden="true">{{ category.emoji }}</span>
            <span class="font-display text-base text-ink">{{ category.name }}</span>
            <KTag class="ml-auto" :tone="category.tone" size="sm">
              {{ catalog.countLessonsOfCategory(category.id) }} 节
            </KTag>
          </div>
          <KProgress
            class="mt-3"
            :value="masteryOf(category.id)"
            :tone="category.tone"
            size="sm"
            label="掌握程度"
            show-value
          />
        </button>
      </div>

      <KEmptyState
        v-else
        emoji="🚧"
        :title="`${world.name}正在建设`"
        description="这个地方还没有开放。等教案准备好，它就会出现在这里。"
        :tone="world.tone"
      />

      <p v-if="!hasContent && categories.length > 0" class="font-body text-xs text-ink-faint">
        这里的领域目录已经建好，具体的探索任务还在准备中。
      </p>
    </div>

    <template #footer>
      <KButton variant="soft" @click="emit('close')">
        再看看别的地方
      </KButton>
    </template>
  </KModal>
</template>
