<script setup lang="ts">
import type { GradeId } from '@/domain'
import { computed } from 'vue'

import { useRoute, useRouter } from 'vue-router'
import { ROUTE_NAMES } from '@/app/router/route-names'
import { CategoryGrid } from '@/features/category-grid'
import { useCatalogStore, useProfileStore } from '@/stores'
import { KButton, KEmptyState, KIconTile, KSectionTitle } from '@/ui'

/**
 * 年级大纲（二级分类）
 * ==================
 *
 * 展示所选年级的学科方向、学习重点和能力范围。
 */
const route = useRoute()
const router = useRouter()
const catalog = useCatalogStore()
const profile = useProfileStore()

const gradeId = computed(() => route.params.gradeId as GradeId)
const grade = computed(() => catalog.grade(gradeId.value))

/** 直接输错地址时不要给孩子一个空白页 */
if (!grade.value) {
  router.replace({ name: ROUTE_NAMES.home })
}
</script>

<template>
  <div v-if="grade" class="flex flex-col gap-8">
    <KSectionTitle
      eyebrow="学习领域"
      :title="grade.name"
      :description="grade.tagline"
      :tone="grade.tone"
    >
      <template #action>
        <KIconTile :icon="grade.icon" :tone="grade.tone" size="md" />
        <KButton
          v-if="profile.gradeId !== grade.id"
          variant="soft"
          size="sm"
          @click="profile.switchGrade(grade.id)"
        >
          切换到{{ grade.name }}
        </KButton>
        <KButton variant="ghost" size="sm" :to="{ name: ROUTE_NAMES.grades }">
          返回年级大纲
        </KButton>
      </template>
    </KSectionTitle>

    <CategoryGrid :grade-id="grade.id" />

  </div>

  <KEmptyState
    v-else
    icon="compass"
    title="没有找到这个年级"
    description="返回年级大纲重新选择。"
  >
    <template #action>
      <KButton :to="{ name: ROUTE_NAMES.home }">
        回到学习世界
      </KButton>
    </template>
  </KEmptyState>
</template>
