<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'
import type { UiTone } from '@/domain'

import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { toneVars } from '@/domain'
import { cn } from '@/shared/utils'

/**
 * 儿童端的主按钮。
 * 大尺寸、圆角、贴纸投影、按下有物理反馈 —— 所有点击类交互都从它开始。
 */
type ButtonVariant = 'primary' | 'soft' | 'ghost' | 'star'
type ButtonSize = 'sm' | 'md' | 'lg'

const {
  variant = 'primary',
  size = 'md',
  tone = 'neutral',
  block = false,
  disabled = false,
  to,
  type = 'button',
} = defineProps<{
  variant?: ButtonVariant
  size?: ButtonSize
  tone?: UiTone
  /** 是否撑满父容器宽度 */
  block?: boolean
  disabled?: boolean
  /** 传入后渲染为 RouterLink；用路由名而不是路径字符串 */
  to?: RouteLocationRaw
  type?: 'button' | 'submit'
}>()

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-[var(--tone)] text-white shadow-sticker hover:brightness-105',
  soft: 'bg-[var(--tone-soft)] text-[var(--tone-deep)] border-2 border-[var(--tone-line)] hover:border-[var(--tone)]',
  ghost: 'bg-transparent text-[var(--tone-deep)] hover:bg-[var(--tone-soft)]',
  star: 'bg-star text-ink shadow-sticker hover:brightness-105',
}

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'h-10 gap-1.5 px-4 text-sm',
  md: 'h-13 gap-2 px-6 text-base',
  lg: 'h-16 gap-3 px-8 text-xl',
}

const classes = computed(() =>
  cn(
    'inline-flex select-none items-center justify-center rounded-chip font-display leading-none tracking-wide',
    'transition-all duration-200 ease-bounce',
    'hover:-translate-y-0.5 active:translate-y-px active:scale-[0.97]',
    'disabled:pointer-events-none disabled:opacity-45',
    VARIANT_CLASSES[variant],
    SIZE_CLASSES[size],
    block && 'w-full',
  ),
)

const styles = computed(() => toneVars(tone))
</script>

<template>
  <RouterLink v-if="to" :to="to" :class="classes" :style="styles">
    <slot />
  </RouterLink>
  <button v-else :type="type" :disabled="disabled" :class="classes" :style="styles">
    <slot />
  </button>
</template>
