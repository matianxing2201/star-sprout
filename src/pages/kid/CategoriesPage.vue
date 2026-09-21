<script setup lang="ts">
import type { GradeId } from '@/domain'
import { computed } from 'vue'

import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ROUTE_NAMES } from '@/app/router/route-names'
import { CategoryGrid } from '@/features/category-grid'
import { WorldMap, WorldSpotlight } from '@/features/world-map'
import { useCatalogStore, useProfileStore } from '@/stores'
import { KButton, KEmptyState, KSectionTitle } from '@/ui'

/**
 * 学习领域（二级分类）
 * ==================
 *
 * 一个年级的“知识领域 / 学习方向”全貌。领域来自内容包，
 * 因此这里永远不会有写死的分类 —— 加一个领域只是加一条数据。
 */
const route = useRoute()
const router = useRouter()
const catalog = useCatalogStore()
const profile = useProfileStore()

const gradeId = computed(() => route.params.gradeId as GradeId)
const grade = computed(() => catalog.grade(gradeId.value))

const selectedWorldId = ref<string | null>(null)

/** 直接输错地址时不要给孩子一个空白页 */
if (!grade.value) {
  router.replace({ name: ROUTE_NAMES.home })
}
</script>

<template>
  <div v-if="grade" class="flex flex-col gap-8">
    <KSectionTitle
      eyebrow="学习领域"
      :title="`${grade.emoji} ${grade.name}`"
      :description="grade.tagline"
      :tone="grade.tone"
    >
      <template #action>
        <KButton
          v-if="profile.gradeId !== grade.id"
          variant="soft"
          size="sm"
          @click="profile.switchGrade(grade.id)"
        >
          切换到{{ grade.name }}
        </KButton>
        <KButton variant="ghost" size="sm" :to="{ name: ROUTE_NAMES.grades }">
          看看别的阶段
        </KButton>
      </template>
    </KSectionTitle>

    <CategoryGrid :grade-id="grade.id" />

    <section>
      <KSectionTitle
        eyebrow="地图"
        title="从地图进去也可以"
        description="每个领域都属于一个学习世界，点一点地图上的地方就能找到它。"
        :tone="grade.tone"
      />
      <WorldMap :grade-id="grade.id" @select="selectedWorldId = $event" />
    </section>

    <WorldSpotlight
      :world-id="selectedWorldId"
      :grade-id="grade.id"
      @close="selectedWorldId = null"
    />
  </div>

  <KEmptyState
    v-else
    emoji="🧭"
    title="没有找到这个阶段"
    description="我们带你回到学习世界。"
  >
    <template #action>
      <KButton :to="{ name: ROUTE_NAMES.home }">
        回到学习世界
      </KButton>
    </template>
  </KEmptyState>
</template>
