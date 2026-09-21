<script setup lang="ts">
import type { AppIconName, UiTone } from '@/domain'

import { computed } from 'vue'
import { toneVars } from '@/domain'
import { cn } from '@/shared/utils'

import { resolveIconVariants } from './registry'

/**
 * 图标
 * ====
 *
 * 全站唯一的图标渲染组件。三个关键决定：
 *
 * 1. **默认装饰性**：没有 `label` 时加 `aria-hidden`，免得屏幕阅读器把
 *    「箭头 右」这类噪音念给孩子听；需要语义时传 `label`。
 * 2. **默认跟随 currentColor**：颜色由父元素的 `color` 决定；
 *    传 `tone` 时自动取该色调的深色，双色调图标的第二层也会落在同一色系里。
 * 3. **尺寸走固定像素阶梯**，不用 em 继承 —— emoji 时代最刺眼的问题就是
 *    大小与基线随字体变化，图标必须钉死在像素上。
 *
 * `weight` 不是完全自由的：只有被声明为「身份型」的图标才内联了 `duotone`
 * （见 registry.ts）。请求了没打包的字重会按 fill → duotone → bold 回退，
 * 所以永远不会渲染成空白 —— 回退是常态而非异常，因此显式写在这里。
 *
 * class / style 由 Vue 自动合并（根元素就是图标组件本身），因此外部可以照常覆盖。
 */
type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
type IconWeight = 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone'

const {
  name,
  size = 'md',
  weight = 'bold',
  tone,
  label,
} = defineProps<{
  name: AppIconName
  size?: IconSize
  /** bold 用于界面控件；duotone 用于领域 / 世界这类“标识性”图标 */
  weight?: IconWeight
  tone?: UiTone
  /** 传入后图标具备语义（role="img"），用于单独承载含义的场合 */
  label?: string
}>()

const SIZE_PX: Record<IconSize, number> = {
  'xs': 14,
  'sm': 16,
  'md': 20,
  'lg': 26,
  'xl': 34,
  '2xl': 46,
}

const component = computed(() => {
  const variants = resolveIconVariants(name)
  if (weight === 'fill')
    return variants.fill ?? variants.duotone ?? variants.bold
  if (weight === 'duotone')
    return variants.duotone ?? variants.bold
  return variants.bold
})

const style = computed(() => (tone ? { ...toneVars(tone), color: 'var(--tone-deep)' } : undefined))
</script>

<template>
  <component
    :is="component"
    :class="cn('inline-block shrink-0 align-[-0.125em]')"
    :style="style"
    :width="SIZE_PX[size]"
    :height="SIZE_PX[size]"
    :role="label ? 'img' : undefined"
    :aria-label="label"
    :aria-hidden="label ? undefined : 'true'"
    focusable="false"
  />
</template>
