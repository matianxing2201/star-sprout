<script setup lang="ts">
import type { UiTone } from '@/domain'

import type { AppIconName } from '@/domain'
import { computed } from 'vue'
import { toneVars } from '@/domain'

import { cn } from '@/shared/utils'
import KIcon from './KIcon.vue'

/**
 * 图标徽章（Icon Tile）
 * ====================
 *
 * 领域、学习世界、主题、徽章的**统一视觉单元**：
 * 一个色调柔色底 + 细描边的圆角方块，里面放一枚双色调图标。
 *
 * 这一个组件替换掉了过去满屏的「emoji 塞进彩色圆圈」——
 * 那是界面显得生硬的主要原因：emoji 自带颜色、自带描边、粗细不一，
 * 放进任何容器里都像贴上去的，而不是长在界面里的。
 */
const {
  icon,
  tone = 'neutral',
  size = 'md',
  locked = false,
} = defineProps<{
  icon: AppIconName
  tone?: UiTone
  size?: 'sm' | 'md' | 'lg' | 'xl'
  /** 未解锁时压暗，用于课程地图上的迷雾节点 */
  locked?: boolean
}>()

const TILE_SIZE: Record<'sm' | 'md' | 'lg' | 'xl', string> = {
  sm: 'size-9',
  md: 'size-12',
  lg: 'size-16',
  xl: 'size-20',
}

const ICON_SIZE: Record<'sm' | 'md' | 'lg' | 'xl', 'sm' | 'md' | 'lg' | 'xl' | '2xl'> = {
  sm: 'sm',
  md: 'md',
  lg: 'lg',
  xl: '2xl',
}

const classes = computed(() =>
  cn(
    'grid place-items-center rounded-chip border-2 border-[var(--tone-line)] bg-[var(--tone-soft)] text-[var(--tone-deep)] shadow-press',
    // 顶部一道极淡的高光：让方块看起来是一张「压上去的纸」，而不是一块纯色补丁。
    // 这是纸雕风格的关键小细节 —— 少了它，再对的图标也会显得扁平生硬。
    'bg-linear-to-b from-white/60 to-transparent to-60%',
    TILE_SIZE[size],
    locked && 'border-dashed border-line-strong bg-paper text-ink-faint opacity-60',
  ),
)
</script>

<template>
  <span :class="classes" :style="toneVars(tone)">
    <KIcon
      :name="locked ? 'lock' : icon"
      :size="ICON_SIZE[size]"
      :weight="locked ? 'bold' : 'duotone'"
    />
  </span>
</template>
