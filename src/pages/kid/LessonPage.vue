<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import { LessonRunner } from '@/features/lesson-player'
import { RewardLayer } from '@/features/reward'

/**
 * 课程学习页
 * ==========
 *
 * 需求第三十节第 5 条：重点展示“角色 + 场景 + 知识 + 互动”，而不是传统课件。
 * 因此这一页自己有完整的布局（顶栏只剩一个返回按钮），
 * 孩子进入之后世界就只剩眼前这一件事。
 *
 * 奖励层挂在这里，是因为本页不在儿童端外壳里 ——
 * 没有它，互动答对时就不会有星星飞出来。
 */
const route = useRoute()

const lessonId = computed(() => String(route.params.lessonId ?? ''))
</script>

<template>
  <div class="min-h-dvh bg-paper">
    <LessonRunner :key="lessonId" :lesson-id="lessonId" />
    <RewardLayer />
  </div>
</template>
