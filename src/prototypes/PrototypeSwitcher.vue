<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

/**
 * 原型切换器（浮动胶囊）
 * ======================
 *
 * 它的外观**不是设计决策，是脚手架** —— 所以不套项目的令牌、不跟随主题，
 * 永远是同一条深色胶囊。一旦用项目样式渲染它，你就分不清自己在评价哪一层了。
 *
 * 样式与交互照抄 Emil Kowalski 的 prototype skill 规格（PICKER.md），
 * 只把变体名换成本项目的三个方向。`现状` 是参照项，不是参赛者。
 */
const VARIANTS = [
  { key: 'now', label: '现状' },
  { key: 'A', label: 'A — 展览馆' },
  { key: 'B', label: 'B — 立体书' },
  { key: 'C', label: 'C — 游戏地图' },
] as const

const replayToken = defineModel<number>('replayToken', { default: 0 })

const route = useRoute()
const router = useRouter()

const current = computed(() => {
  const value = String(route.query.variant ?? '')
  return VARIANTS.some(variant => variant.key === value) ? value : 'now'
})

const currentIndex = computed(() => VARIANTS.findIndex(variant => variant.key === current.value))

/** 高亮块的几何：挂载后量一次，窗口尺寸变化时重量 */
const ready = ref(false)
const itemElements: HTMLElement[] = []
const positions = ref<{ left: number, width: number }[]>([])

function setItemRef(el: unknown, index: number): void {
  if (el instanceof HTMLElement)
    itemElements[index] = el
}

function measure(): void {
  positions.value = itemElements.map(el => ({ left: el.offsetLeft, width: el.offsetWidth }))
}

const highlight = computed(() => {
  const position = positions.value[currentIndex.value]
  if (!position)
    return { width: '0px', transform: 'translateX(0px)' }
  return { width: `${position.width}px`, transform: `translateX(${position.left}px)` }
})

function go(delta: number): void {
  const next = (currentIndex.value + delta + VARIANTS.length) % VARIANTS.length
  router.replace({ query: { ...route.query, variant: VARIANTS[next]!.key } })
}

function select(key: string): void {
  router.replace({ query: { ...route.query, variant: key } })
}

function replay(): void {
  replayToken.value += 1
}

function onKeydown(event: KeyboardEvent): void {
  const target = event.target as HTMLElement | null
  if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable))
    return

  if (event.key === 'ArrowLeft') {
    event.preventDefault()
    go(-1)
  }
  else if (event.key === 'ArrowRight') {
    event.preventDefault()
    go(1)
  }
  else if (event.key === 'r' || event.key === 'R') {
    event.preventDefault()
    replay()
  }
}

onMounted(() => {
  measure()
  // 第一帧之后才启用滑动，否则加载时会滑一下
  requestAnimationFrame(() => {
    ready.value = true
  })
  window.addEventListener('resize', measure)
  window.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  window.removeEventListener('resize', measure)
  window.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <nav class="proto-picker" :data-ready="ready ? '' : undefined" aria-label="原型变体切换">
    <span class="proto-picker-highlight" :style="highlight" aria-hidden="true" />
    <button
      v-for="(variant, index) in VARIANTS"
      :key="variant.key"
      :ref="el => setItemRef(el, index)"
      type="button"
      class="proto-picker-item"
      :data-active="variant.key === current ? '' : undefined"
      :aria-current="variant.key === current ? 'true' : undefined"
      @click="select(variant.key)"
    >
      {{ variant.label }}
    </button>
    <span class="proto-picker-divider" aria-hidden="true" />
    <button
      type="button"
      class="proto-picker-item proto-picker-replay"
      aria-label="重放入场动画（R）"
      @click="replay"
    >
      ↻
    </button>
  </nav>
</template>

<style>
/*
  脚手架样式：刻意不用项目令牌、不放进 @layer —— 它必须一眼看出「不属于这个设计」。
*/
.proto-picker {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2147483647;
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 4px;
  border-radius: 999px;
  background: rgb(10 10 10 / 82%);
  backdrop-filter: blur(12px) saturate(1.4);
  box-shadow:
    0 0 0 1px rgb(255 255 255 / 8%) inset,
    0 8px 24px rgb(0 0 0 / 24%),
    0 2px 6px rgb(0 0 0 / 12%);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 13px;
  line-height: 1;
  user-select: none;
}

.proto-picker-highlight {
  position: absolute;
  top: 4px;
  left: 0;
  height: 28px;
  border-radius: 999px;
  background: rgb(255 255 255 / 12%);
  will-change: transform;
}

.proto-picker[data-ready] .proto-picker-highlight {
  transition:
    transform 250ms cubic-bezier(0.23, 1, 0.32, 1),
    width 250ms cubic-bezier(0.23, 1, 0.32, 1);
}

@media (prefers-reduced-motion: reduce) {
  .proto-picker[data-ready] .proto-picker-highlight {
    transition: none;
  }
}

.proto-picker-item {
  position: relative;
  display: flex;
  align-items: center;
  height: 28px;
  padding: 0 12px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: rgb(255 255 255 / 55%);
  font: inherit;
  cursor: pointer;
  transition:
    color 150ms ease-out,
    transform 120ms ease-out;
}

.proto-picker-item:hover {
  color: rgb(255 255 255 / 85%);
}

.proto-picker-item[data-active] {
  color: #fff;
}

.proto-picker-item:active {
  transform: scale(0.97);
}

.proto-picker-divider {
  width: 1px;
  height: 16px;
  margin: 0 4px;
  background: rgb(255 255 255 / 14%);
}

.proto-picker-replay {
  padding: 0 8px;
}
</style>
