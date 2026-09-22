<script setup lang="ts">
import type { InteractionComponentEmits } from '../contract'
import type { MemoryCard, MemoryPairPayload } from '@/domain'

import { computed, onBeforeUnmount, ref } from 'vue'

import { useAudioClip } from '@/features/audio'
import { cn } from '@/shared/utils'
import { KIcon, KVisual } from '@/ui'

/**
 * 翻翻乐：翻牌找成对。
 *
 * 洗牌只在 setup 里做一次 —— 重渲染重新洗牌会让孩子刚记住的位置全部作废。
 * 判定规则：两张翻开的牌 pairId 相同就留在桌上（成功环），不同则 800ms 后翻回去，
 * 并且只在这时告诉外层一次「差一点点」；比较期间忽略点击，避免第三张牌乱入。
 */
const { payload, disabled = false } = defineProps<{
  payload: MemoryPairPayload
  disabled?: boolean
}>()

const emit = defineEmits<InteractionComponentEmits>()

const { play } = useAudioClip()

function shuffled(cards: MemoryCard[]): MemoryCard[] {
  const result = [...cards]
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    const hold = result[i]
    result[i] = result[j]
    result[j] = hold
  }
  return result
}

function gridClassFor(count: number): string {
  if (count <= 4)
    return 'grid-cols-2 sm:grid-cols-4'
  if (count <= 6)
    return 'grid-cols-2 sm:grid-cols-3'
  return 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
}

const deck = shuffled(payload.cards)
const gridClass = gridClassFor(deck.length)

/** 当前翻开的牌（最多两张） */
const flippedIds = ref<string[]>([])
const matchedIds = ref<string[]>([])
const shakingIds = ref<string[]>([])
const comparing = ref(false)
const done = ref(false)

let timer: ReturnType<typeof setTimeout> | null = null

const matchedPairIds = computed(() => [
  ...new Set(deck.filter(card => matchedIds.value.includes(card.id)).map(card => card.pairId)),
])

function isFaceUp(card: MemoryCard): boolean {
  return flippedIds.value.includes(card.id) || matchedIds.value.includes(card.id)
}

function flip(card: MemoryCard): void {
  if (disabled || done.value || comparing.value)
    return
  if (isFaceUp(card))
    return

  flippedIds.value = [...flippedIds.value, card.id]

  // 翻到哪张就念哪张 —— 翻翻乐在识字课里是「翻过来，听它叫什么」。
  // 用 `play` 不用 `toggle`：翻牌本来就该出声，翻一张变成开关会很别扭。
  if (card.audioClipId)
    play(card.audioClipId)

  if (flippedIds.value.length < 2)
    return

  const [firstId, secondId] = flippedIds.value
  const first = deck.find(item => item.id === firstId)
  const second = deck.find(item => item.id === secondId)
  if (!first || !second)
    return

  if (first.pairId === second.pairId) {
    matchedIds.value = [...matchedIds.value, first.id, second.id]
    flippedIds.value = []
    if (matchedIds.value.length === deck.length) {
      done.value = true
      emit('solved', matchedPairIds.value)
    }
    return
  }

  shakingIds.value = [first.id, second.id]
  comparing.value = true
  emit('missed', '这两张不是一对，再仔细看看它们的样子。')

  timer = setTimeout(() => {
    flippedIds.value = []
    shakingIds.value = []
    comparing.value = false
  }, 800)
}

onBeforeUnmount(() => {
  if (timer)
    clearTimeout(timer)
})
</script>

<template>
  <div :class="cn('grid gap-3 sm:gap-4', gridClass)">
    <button
      v-for="(card, index) in deck"
      :key="card.id"
      type="button"
      :disabled="disabled"
      :aria-label="isFaceUp(card) ? card.label : `第 ${index + 1} 张卡片，翻开看看`"
      :class="cn(
        'memory-card fx-pressable aspect-square w-full rounded-tile disabled:cursor-default',
        matchedIds.includes(card.id) && 'memory-card--matched',
        shakingIds.includes(card.id) && 'fx-gently',
      )"
      @click="flip(card)"
    >
      <span class="memory-card__inner" :class="isFaceUp(card) && 'memory-card__inner--flipped'">
        <span class="memory-card__face memory-card__face--front">
          <KVisual
            :icon="card.icon ?? (card.emoji ? undefined : 'star-four')"
            :emoji="card.emoji"
            size="lg"
          />
          <span class="font-display text-sm leading-tight text-ink">{{ card.label }}</span>
        </span>
        <span class="memory-card__face memory-card__face--back" aria-hidden="true">
          <KIcon name="question" size="xl" />
        </span>
      </span>
    </button>
  </div>
</template>

<style scoped>
/* 3D 翻面：外层给透视，内层做 rotateY，两个面各自隐藏背面 */
.memory-card {
  perspective: 900px;
}

.memory-card__inner {
  position: relative;
  display: block;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition: transform var(--duration-base) var(--ease-soft);
}

.memory-card__inner--flipped {
  transform: rotateY(180deg);
}

.memory-card__face {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  border: 2px solid var(--color-line);
  border-radius: var(--radius-tile);
  backface-visibility: hidden;
}

.memory-card__face--front {
  background: var(--color-surface);
  transform: rotateY(180deg);
}

.memory-card__face--back {
  color: var(--color-ink-faint);
  background: var(--color-paper-deep);
  border-color: var(--color-line-strong);
}

.memory-card--matched .memory-card__face--front {
  background: var(--color-success-soft);
  border-color: var(--color-success);
  box-shadow: 0 0 0 6px rgb(87 167 115 / 20%);
}
</style>
