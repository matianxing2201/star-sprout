<script setup lang="ts">
import { computed } from 'vue'

import VariantExhibition from './variants/VariantExhibition.vue'
import VariantMapFirst from './variants/VariantMapFirst.vue'
import VariantPopUpBook from './variants/VariantPopUpBook.vue'

/**
 * 原型舞台
 * ========
 *
 * 按 `?variant=` 渲染对应的方向。三个变体承载**完全相同的数据**
 * （同一个孩子、同一天、同一份地图），区别只在结构与材质 ——
 * 否则你分不清「我喜欢 B」是因为布局，还是因为它碰巧数据更好看。
 *
 * 这里刻意不做兜底、不做过渡、不抽公共层：它是原型，不是生产代码。
 */
const { variant } = defineProps<{ variant: string }>()

const VARIANTS: Record<string, unknown> = {
  A: VariantExhibition,
  B: VariantPopUpBook,
  C: VariantMapFirst,
}

const component = computed(() => VARIANTS[variant] ?? VariantExhibition)
</script>

<template>
  <component :is="component" />
</template>
