<script setup lang="ts">
import type { InteractionComponentEmits } from '../contract'

import type { MeasureStamp, MeasureStampItem, MeasureStampPayload } from '@/domain'
import { computed, onBeforeUnmount, ref } from 'vue'
import { toneVars } from '@/domain'
import { cn } from '@/shared/utils'

import { KButton, KIcon, KVisual } from '@/ui'

/**
 * 量词印章（measure-stamp）
 * ========================
 *
 * 学量词最难的地方是「记不住搭配」，而记搭配最有效的方式是**反复动手试**，
 * 不是做选择题。所以这里把「量词」做成一张可以拿起来的印章：
 *
 *   1. 孩子从一排印章里拿起一个（点一下，或者直接拖）；
 *   2. 把它盖到物品上；
 *   3. 盖对了 —— 印章砸下来、墨迹扩散、溅出小星星，
 *      物品下方永久落下「一座城堡」这行短语，孩子听到/看到的是完整的搭配；
 *   4. 盖错了 —— 物品温柔地摇一摇，印章弹回去，一句话提示方向，不扣任何东西。
 *
 * 全部盖对之后，所有短语按顺序飞进底部的「朗读条」，连起来读一遍 ——
 * 这一步把散落的搭配收成一段成句的输出，是这一课真正的学习结果。
 *
 * 判对规则：每个物品被盖上的印章 id 等于它的 `measureId`。
 */
const { payload, disabled = false } = defineProps<{
  payload: MeasureStampPayload
  disabled?: boolean
}>()

const emit = defineEmits<InteractionComponentEmits>()

/* ------------------------------------------------------------------ */
/* 状态                                                                */
/* ------------------------------------------------------------------ */

/** 当前拿在手里的印章 */
const heldMeasureId = ref<string | null>(null)
/** 已经盖对的：物品 id → 量词 id */
const stamped = ref<Record<string, string>>({})
/** 正在播放「盖歪了」动画的物品 */
const wobblingId = ref<string | null>(null)
/** 正在播放「盖下去」动画的物品 */
const stampingId = ref<string | null>(null)
/** 溅出的星星：物品 id → 序号，用来重启动画 */
const sparkToken = ref(0)

let wobbleTimer: ReturnType<typeof setTimeout> | null = null
let stampTimer: ReturnType<typeof setTimeout> | null = null

onBeforeUnmount(() => {
  if (wobbleTimer)
    clearTimeout(wobbleTimer)
  if (stampTimer)
    clearTimeout(stampTimer)
})

const heldMeasure = computed<MeasureStamp | undefined>(() =>
  payload.measures.find(measure => measure.id === heldMeasureId.value),
)

const total = computed(() => payload.items.length)
const doneCount = computed(() => Object.keys(stamped.value).length)
const allStamped = computed(() => doneCount.value === total.value)

/** 已盖对物品的短语，按下单顺序连起来 */
const phrases = computed(() =>
  payload.items
    .filter(item => stamped.value[item.id] === item.measureId)
    .map(item => phraseOf(item)),
)

function phraseOf(item: MeasureStampItem): string {
  const measure = payload.measures.find(entry => entry.id === item.measureId)
  const count = item.count ?? 1
  return `${numberWord(count)}${measure?.label ?? ''}${item.label}`
}

/** 数量用中文数字，孩子读起来才是「一座」而不是「1座」 */
function numberWord(count: number): string {
  const words = ['', '一', '两', '三', '四', '五', '六', '七', '八', '九', '十']
  return words[count] ?? String(count)
}

/* ------------------------------------------------------------------ */
/* 交互                                                                */
/* ------------------------------------------------------------------ */

function pickMeasure(id: string): void {
  if (disabled || allStamped.value)
    return
  heldMeasureId.value = heldMeasureId.value === id ? null : id
}

function stampOn(item: MeasureStampItem): void {
  if (disabled || allStamped.value || stamped.value[item.id])
    return

  // 没拿印章就先给个提示：孩子需要知道「先选一个印章」
  if (!heldMeasureId.value) {
    emit('missed', '先点一个量词印章，再盖到东西上。')
    wobble(item.id)
    return
  }

  if (heldMeasureId.value !== item.measureId) {
    emit('missed', `「${item.label}」说的是「${phraseOf(item)}」，换一个印章试试。`)
    wobble(item.id)
    return
  }

  // 盖对了
  stamped.value = { ...stamped.value, [item.id]: item.measureId }
  stampingId.value = item.id
  sparkToken.value += 1

  if (stampTimer)
    clearTimeout(stampTimer)
  stampTimer = setTimeout(() => {
    stampingId.value = null
  }, 560)

  // 还有下一个物品时，自动收回印章，逼着孩子重新判断而不是无脑连点
  heldMeasureId.value = null

  if (Object.keys(stamped.value).length === total.value)
    emit('solved', stamped.value)
}

function wobble(itemId: string): void {
  wobblingId.value = itemId
  if (wobbleTimer)
    clearTimeout(wobbleTimer)
  wobbleTimer = setTimeout(() => {
    wobblingId.value = null
  }, 640)
}

/* ------------------------------------------------------------------ */
/* 盖章溅出的星星：每个物品一组固定的方向，避免每次渲染乱跳              */
/* ------------------------------------------------------------------ */

const SPARKS = [
  { '--spark-x': '-46px', '--spark-y': '-38px', 'delay': '0ms' },
  { '--spark-x': '40px', '--spark-y': '-46px', 'delay': '40ms' },
  { '--spark-x': '-30px', '--spark-y': '34px', 'delay': '80ms' },
  { '--spark-x': '48px', '--spark-y': '30px', 'delay': '60ms' },
  { '--spark-x': '0px', '--spark-y': '-56px', 'delay': '20ms' },
] as const
</script>

<template>
  <div class="flex flex-col gap-5">
    <!-- 印章排：拿在手里的那枚会浮起来并轻微晃动 -->
    <div>
      <p class="mb-2 flex items-center gap-1.5 font-body text-xs text-ink-soft">
        <KIcon name="stamp" size="sm" />
        <span>{{ heldMeasure ? `拿起了「${heldMeasure.label}」，去盖到东西上吧` : '先选一个量词印章' }}</span>
      </p>

      <ul class="flex flex-wrap gap-2 sm:gap-3">
        <li v-for="measure in payload.measures" :key="measure.id">
          <button
            type="button"
            :disabled="disabled || allStamped"
            :aria-pressed="heldMeasureId === measure.id"
            :aria-label="`量词印章 ${measure.label}`"
            :class="cn(
              'fx-pressable grid size-14 place-items-center rounded-tile border-2 font-display text-2xl shadow-sticker disabled:cursor-default sm:size-16 sm:text-3xl',
              heldMeasureId === measure.id
                ? 'fx-stamp-ready border-[var(--tone)] bg-[var(--tone)] text-white'
                : 'border-[var(--tone-line)] bg-[var(--tone-soft)] text-[var(--tone-deep)]',
            )"
            :style="toneVars(measure.tone ?? 'language')"
            @click="pickMeasure(measure.id)"
          >
            {{ measure.label }}
          </button>
        </li>
      </ul>
    </div>

    <!-- 物品台：点一下就把手里的印章盖上去 -->
    <ul class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      <li v-for="item in payload.items" :key="item.id">
        <button
          type="button"
          :disabled="disabled || allStamped || Boolean(stamped[item.id])"
          :aria-label="stamped[item.id] ? `${phraseOf(item)}，已经盖好了` : `给${item.label}盖量词印章`"
          :class="cn(
            'relative flex w-full flex-col items-center gap-2 overflow-hidden rounded-tile border-2 border-[var(--tone-line)] bg-surface p-4 shadow-sticker transition-colors disabled:cursor-default',
            !stamped[item.id] && !disabled && 'fx-pressable hover:border-[var(--tone)]',
            stamped[item.id] && 'border-success/50 bg-success-soft',
            wobblingId === item.id && 'fx-gently border-gently bg-gently-soft',
          )"
          :style="toneVars(item.measureId ? payload.measures.find(m => m.id === item.measureId)?.tone ?? 'language' : 'language')"
          @click="stampOn(item)"
        >
          <!-- 物品本身：场景道具，走 KVisual（emoji / 图标 / 图片都支持） -->
          <span
            :class="cn('relative grid place-items-center', stampingId === item.id && 'fx-stamp')"
          >
            <KVisual
              :icon="item.icon"
              :emoji="item.emoji"
              :image="item.image"
              size="xl"
              :label="item.label"
            />

            <!-- 墨迹扩散 -->
            <span
              v-if="stampingId === item.id"
              class="fx-ink pointer-events-none absolute inset-0 rounded-chip border-4 border-success"
              aria-hidden="true"
            />

            <!-- 溅出的小星星 -->
            <template v-if="stampingId === item.id">
              <span
                v-for="(spark, index) in SPARKS"
                :key="`${sparkToken}-${index}`"
                class="fx-spark pointer-events-none absolute text-star"
                :style="{ ...spark, animationDelay: spark.delay }"
                aria-hidden="true"
              >
                <KIcon name="star-four" size="sm" weight="fill" />
              </span>
            </template>
          </span>

          <span class="font-body text-sm text-ink-soft">{{ item.label }}</span>

          <!-- 盖对了：短语永久落在这里 -->
          <span
            v-if="stamped[item.id]"
            class="fx-stamp rounded-chip bg-success px-2.5 py-1 font-display text-sm text-white shadow-press"
          >
            {{ phraseOf(item) }}
          </span>
          <span v-else class="font-body text-[11px] text-ink-faint">
            点一下盖上印章
          </span>

          <!-- 盖对了的勾 -->
          <span
            v-if="stamped[item.id]"
            class="absolute top-2 right-2 grid size-6 place-items-center rounded-chip bg-success text-white"
            aria-hidden="true"
          >
            <KIcon name="check" size="xs" />
          </span>
        </button>
      </li>
    </ul>

    <!-- 进度：让孩子看到还差几个 -->
    <p class="text-center font-body text-sm text-ink-soft" role="status">
      已经盖好 <span class="font-numeric font-bold text-ink">{{ doneCount }}</span> / {{ total }} 个
    </p>

    <!-- 全部盖对：短语连成一段朗读条 -->
    <div
      v-if="allStamped"
      class="fx-stagger rounded-blob border-2 border-success/40 bg-success-soft/70 px-5 py-4"
    >
      <p class="mb-2 flex items-center gap-1.5 font-display text-lg text-success-deep">
        <KIcon name="music-notes" size="sm" />
        <span>连起来读一遍</span>
      </p>
      <p class="flex flex-wrap items-center gap-x-1.5 gap-y-2 font-display text-xl text-ink">
        <template v-for="(phrase, index) in phrases" :key="phrase">
          <span class="rounded-chip bg-surface px-2.5 py-1 shadow-press">{{ phrase }}</span>
          <span v-if="index < phrases.length - 1" class="text-ink-faint">、</span>
        </template>
      </p>
      <p v-if="payload.recital" class="mt-3 font-body text-sm text-ink-soft">
        {{ payload.recital }}
      </p>
    </div>

    <!-- 兜底：孩子卡住时给一个出口 -->
    <div v-if="heldMeasure && !allStamped" class="flex justify-center">
      <KButton size="sm" variant="ghost" @click="heldMeasureId = null">
        先放下印章
      </KButton>
    </div>
  </div>
</template>
