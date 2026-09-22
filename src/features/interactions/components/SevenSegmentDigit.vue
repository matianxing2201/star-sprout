<script setup lang="ts">
import { computed } from 'vue'

/**
 * 七段数码管数字
 * ==============
 *
 * 把 0~9 画成一段段可以单独出现的笔画：
 *
 *        ⓪
 *      ⑤  ①
 *        ⑥
 *      ④  ②
 *        ③
 *
 * 为什么不用字库：练习册里那种「数字被遮住一部分」的题，
 * 需要的是**能只画其中几段**。用字体做不到，用七段就能 ——
 * 给 `visibleStrokes` 就只画那几段，其余留白，孩子看到的是残缺的笔画。
 *
 * 段号（0~6）与 `NumberSlot.visibleStrokes` 共用同一套编号，
 * 所以这个编号也是内容侧要写的那套，改这里之前先看 domain 的注释。
 */

const { value, visibleStrokes, muted = false } = defineProps<{
  /** 这个数字是几；不在 0~9 内则不画任何一段 */
  value: number
  /**
   * 只画这几段（0~6）。
   * 不给 = 整字画全；给空数组 = 整格遮住，什么都不画。
   */
  visibleStrokes?: number[]
  /** 未填写的格子用淡一点的笔画，与「已经贴上」的数字区分开 */
  muted?: boolean
}>()

/** 每个数字点亮哪几段。顺序无关，这里按「上、右上、右下、下、左下、左上、中」写 */
const SEGMENTS_OF: Record<number, number[]> = {
  0: [0, 1, 2, 3, 4, 5],
  1: [1, 2],
  2: [0, 1, 6, 4, 3],
  3: [0, 1, 6, 2, 3],
  4: [5, 6, 1, 2],
  5: [0, 5, 6, 2, 3],
  6: [0, 5, 6, 4, 2, 3],
  7: [0, 1, 2],
  8: [0, 1, 2, 3, 4, 5, 6],
  9: [0, 1, 2, 3, 5, 6],
}

/**
 * 每一段的坐标，画在一个 100×180 的坐标系里。
 * 竖段与横段用同一个圆角矩形表示，靠宽高区分 —— 数码管本来就是这么长的。
 */
const SEGMENT_BOXES: { x: number, y: number, w: number, h: number }[] = [
  { x: 18, y: 6, w: 64, h: 16 }, // ⓪ 上
  { x: 66, y: 22, w: 16, h: 62 }, // ① 右上
  { x: 66, y: 96, w: 16, h: 62 }, // ② 右下
  { x: 18, y: 158, w: 64, h: 16 }, // ③ 下
  { x: 18, y: 96, w: 16, h: 62 }, // ④ 左下
  { x: 18, y: 22, w: 16, h: 62 }, // ⑤ 左上
  { x: 18, y: 82, w: 64, h: 16 }, // ⑥ 中
]

const litSegments = computed(() => {
  const all = SEGMENTS_OF[value]
  if (all === undefined)
    return []

  // 没给 visibleStrokes 就是完整显示；给了就取交集 ——
  // 交集而不是直接用，是为了内容写错段号时也不会画出不存在的笔画
  if (visibleStrokes === undefined)
    return all

  return all.filter(segment => visibleStrokes.includes(segment))
})
</script>

<template>
  <svg
    viewBox="0 0 100 180"
    class="h-full w-auto"
    :class="muted ? 'text-ink-faint/50' : 'text-[var(--tone)]'"
    aria-hidden="true"
  >
    <rect
      v-for="segment in litSegments"
      :key="segment"
      :x="SEGMENT_BOXES[segment]!.x"
      :y="SEGMENT_BOXES[segment]!.y"
      :width="SEGMENT_BOXES[segment]!.w"
      :height="SEGMENT_BOXES[segment]!.h"
      :rx="8"
      fill="currentColor"
    />
  </svg>
</template>
