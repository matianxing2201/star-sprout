<script setup lang="ts">
import type { AppIconName, GradeId, ToneKey, WorldMapLayout, WorldMapNode, WorldMapPath } from '@/domain'

import { computed } from 'vue'
import { useCatalogStore, useProgressStore } from '@/stores'
import { KIcon, KIconTile } from '@/ui'

/**
 * 学习地图
 * ========
 *
 * 需求第十八节：首页不是“语文 / 数学 / 英语”的列表，而是一张能逛的地图。
 *
 * 实现要点：
 *  - 路径用 SVG 画，节点用 HTML 画 —— 文字不跟着 viewBox 变形；
 *  - 节点的“雾气”表示还没解锁的区域，孩子看得见但进不去（探索欲的来源）；
 *  - 地图下方的进度来自真实的 topicProgress，不是装饰。
 */
const props = defineProps<{ gradeId: GradeId }>()

const emit = defineEmits<{ select: [worldId: string] }>()

const catalog = useCatalogStore()
const progress = useProgressStore()

const layout = computed<WorldMapLayout | undefined>(() => catalog.worldMap(props.gradeId))

const nodeByWorld = computed(() => {
  const map = new Map<string, WorldMapNode>()
  for (const node of layout.value?.nodes ?? [])
    map.set(node.worldId, node)
  return map
})

/** 节点尺寸档位对应到图标徽章尺寸：地图上的世界是「标识」，因此整体比列表里大一号 */
const TILE_SIZES = {
  sm: 'md',
  md: 'lg',
  lg: 'xl',
} as const

/** 世界图标来自词汇表；万一地图指向了不存在的内容包，用罗盘兜底，不留空白 */
function iconOf(worldId: string): AppIconName {
  return catalog.world(worldId)?.icon ?? 'compass'
}

/** 世界缺失时也要有色调，否则 KIconTile 的变量会落空 */
function toneOf(worldId: string): ToneKey {
  return catalog.world(worldId)?.tone ?? 'explore'
}

/** 每个世界在当前年级下的探索进度（已完成的主题 / 全部主题） */
function worldProgressOf(worldId: string): { done: number, total: number } {
  const categories = catalog
    .categoriesOf(props.gradeId)
    .filter(category => catalog.worldIdOfCategory(category.id) === worldId)

  let done = 0
  let total = 0
  for (const category of categories) {
    for (const topic of catalog.topicsOfCategory(category.id)) {
      total += 1
      if (progress.topicProgressOf(topic.id).status === 'completed')
        done += 1
    }
  }
  return { done, total }
}

/** 二次贝塞尔：让小路自然弯曲，而不是流程图里的直线 */
function pathD(path: WorldMapPath): string {
  const from = nodeByWorld.value.get(path.from)
  const to = nodeByWorld.value.get(path.to)
  if (!from || !to)
    return ''

  const dx = to.x - from.x
  const dy = to.y - from.y
  const length = Math.hypot(dx, dy) || 1
  const bend = path.curve === 'straight' ? 0 : (path.curve === 'left' ? -1 : 1) * length * 0.14
  const controlX = (from.x + to.x) / 2 + (-dy / length) * bend
  const controlY = (from.y + to.y) / 2 + (dx / length) * bend

  return `M ${from.x} ${from.y} Q ${controlX} ${controlY} ${to.x} ${to.y}`
}

/** 节点太靠下时把名字放到上方，避免标签掉出地图 */
function placeLabelAbove(node: WorldMapNode): boolean {
  return node.y > 68
}
</script>

<template>
  <section
    class="relative overflow-hidden rounded-blob border-2 border-line bg-paper-deep shadow-sticker"
    :aria-label="layout?.title ?? '学习地图'"
  >
    <!-- 装饰层：纸雕地图的底色与行走的小路 -->
    <div class="pointer-events-none absolute inset-0" aria-hidden="true">
      <div class="absolute -top-16 -left-10 size-56 rounded-full bg-star-soft/70 blur-2xl" />
      <div class="absolute -right-12 -bottom-20 size-64 rounded-full bg-explore-soft/60 blur-2xl" />
      <svg class="absolute inset-0 size-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path
          v-for="(path, index) in layout?.paths ?? []"
          :key="index"
          :d="pathD(path)"
          fill="none"
          stroke="var(--color-line-strong)"
          stroke-width="0.6"
          stroke-dasharray="2.4 2.4"
          stroke-linecap="round"
          vector-effect="non-scaling-stroke"
        />
      </svg>
    </div>

    <div class="relative aspect-[16/10] w-full">
      <button
        v-for="node in layout?.nodes ?? []"
        :key="node.worldId"
        type="button"
        class="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1.5 focus-visible:z-20"
        :style="{ left: `${node.x}%`, top: `${node.y}%` }"
        :aria-label="`${catalog.world(node.worldId)?.name ?? node.worldId}${node.lockedInFog ? '（还没解锁）' : ''}`"
        @click="emit('select', node.worldId)"
      >
        <span
          v-if="placeLabelAbove(node)"
          class="order-first rounded-chip bg-surface/90 px-2 py-0.5 font-display text-xs whitespace-nowrap text-ink shadow-press sm:text-sm"
        >
          {{ catalog.world(node.worldId)?.name }}
        </span>

        <span class="fx-pressable relative">
          <KIconTile
            :icon="iconOf(node.worldId)"
            :tone="toneOf(node.worldId)"
            :size="TILE_SIZES[node.size]"
            :locked="node.lockedInFog"
          />

          <!-- 已完成的小勾：告诉孩子“这里我来过” -->
          <span
            v-if="worldProgressOf(node.worldId).done > 0 && !node.lockedInFog"
            class="absolute -top-2 -right-2 grid size-6 place-items-center rounded-chip bg-success text-white shadow-press"
            aria-hidden="true"
          >
            <KIcon name="check" size="sm" />
          </span>
        </span>

        <span
          v-if="!placeLabelAbove(node)"
          class="rounded-chip bg-surface/90 px-2 py-0.5 font-display text-xs whitespace-nowrap text-ink shadow-press sm:text-sm"
        >
          {{ catalog.world(node.worldId)?.name }}
        </span>
      </button>
    </div>

    <p
      v-if="layout"
      class="absolute bottom-3 left-4 font-body text-xs text-ink-faint"
    >
      {{ layout.title }}
    </p>
  </section>
</template>
