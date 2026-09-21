<script setup lang="ts">
import type { AppIconName, UiTone } from '@/domain'

import { computed } from 'vue'
import { toneVars } from '@/domain'
import { cn } from '@/shared/utils'

import KIcon from './KIcon.vue'

/**
 * 视觉元素
 * ========
 *
 * 内容里的事物有两种表达方式，规则很简单：**有 icon 就用 icon，否则用 emoji。**
 *
 *   - 结构性的东西（领域、世界、主题、徽章）一律用矢量图标 —— 它们要和界面一起呼吸；
 *   - 场景里的东西（一只鸟、一根胡萝卜、一个皮球）用 emoji —— 它们本身就是插画，
 *     而且现成、零资源、孩子一眼认得出。
 *
 * 把这条规则收进一个组件，是为了让「emoji 与图标混排」这件事在全站有一致的
 * 尺寸、基线与无障碍处理 —— 过去满屏 emoji 的生硬感，一半来自各处字号不一致。
 */
type VisualSize = 'sm' | 'md' | 'lg' | 'xl'

const {
  icon,
  emoji,
  image,
  label,
  size = 'md',
  tone,
  plain = false,
} = defineProps<{
  icon?: AppIconName
  emoji?: string
  image?: string
  /** 无障碍名称；缺省时视为装饰性元素 */
  label?: string
  size?: VisualSize
  tone?: UiTone
  /** 关闭尺寸包装，由外部容器控制大小（例如放在 KIconTile 里） */
  plain?: boolean
}>()

/**
 * emoji 也放进固定尺寸的方框里居中渲染。
 *
 * 这是「emoji 看起来像随手贴的」的另一半原因：不同 emoji 的字形宽高比完全不同
 * （🌸 是竖的、⚽ 是圆的、🪟 是横的），如果只用 font-size 控制，
 * 它们在并排的选项里基线一致但**视觉重心**参差不齐。
 * 给每个尺寸定一个方形盒，emoji 就以自己的中心对齐 —— 这一条对所有
 * 消费 KVisual 的互动组件自动生效，不需要各处自己调。
 */
const EMOJI_SIZE: Record<VisualSize, string> = {
  sm: 'size-5 text-base',
  md: 'size-7 text-2xl',
  lg: 'size-11 text-4xl',
  xl: 'size-16 text-6xl',
}

const ICON_SIZE: Record<VisualSize, 'sm' | 'md' | 'lg' | 'xl' | '2xl'> = {
  sm: 'sm',
  md: 'md',
  lg: 'lg',
  xl: '2xl',
}

const style = computed(() => (tone ? { ...toneVars(tone), color: 'var(--tone-deep)' } : undefined))

/** emoji 自带颜色，因此不能跟随 tone 的 color，只保留 tone 的 CSS 变量供外层使用 */
const emojiStyle = computed(() => {
  const base = style.value
  return base ? { ...base, color: undefined } : undefined
})
</script>

<template>
  <span
    v-if="image"
    :class="cn('inline-grid shrink-0 place-items-center', !plain && EMOJI_SIZE[size])"
    :style="style"
    role="img"
    :aria-label="label"
  >
    <img :src="image" :alt="label ?? ''" class="size-full object-contain">
  </span>

  <KIcon
    v-else-if="icon"
    :name="icon"
    :size="plain ? 'md' : ICON_SIZE[size]"
    :tone="tone"
    :label="label"
  />

  <span
    v-else-if="emoji"
    :class="cn('inline-grid shrink-0 place-items-center leading-none', !plain && EMOJI_SIZE[size])"
    :style="emojiStyle"
    :role="label ? 'img' : undefined"
    :aria-label="label"
    :aria-hidden="label ? undefined : 'true'"
  >{{ emoji }}</span>
</template>
