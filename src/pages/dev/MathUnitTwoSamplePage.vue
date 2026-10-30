<script setup lang="ts">
import type { InteractionResult } from '@/domain'
import { computed, ref } from 'vue'

import { ROUTE_NAMES } from '@/app/router/route-names'
import { grade1MathUnitTwoSample } from '@/content/grades/grade-1/math-unit-two-sample'
import { InteractionShell } from '@/features/interactions'
import { publicAsset } from '@/shared/utils'
import { KButton, KIcon, KTag } from '@/ui'

const selectedMode = ref<'digital' | 'picture'>('digital')
const results = ref<{ digital: InteractionResult | null, picture: InteractionResult | null }>({
  digital: null,
  picture: null,
})
const activeInteraction = computed(() => selectedMode.value === 'digital'
  ? grade1MathUnitTwoSample.interaction
  : grade1MathUnitTwoSample.pictureInteraction)
const activeResult = computed(() => results.value[selectedMode.value])
const activeAnswer = computed(() => selectedMode.value === 'digital'
  ? grade1MathUnitTwoSample.answer
  : grade1MathUnitTwoSample.pictureAnswer)
const activeExplanation = computed(() => selectedMode.value === 'digital'
  ? grade1MathUnitTwoSample.explanation
  : grade1MathUnitTwoSample.pictureExplanation)
const characterImages = [
  { name: '佩奇', role: '主角', src: publicAsset('images/characters/peppa.png'), featured: true },
  { name: '乔治', role: '弟弟', src: publicAsset('images/characters/george.png') },
  { name: '猪妈妈', role: '妈妈', src: publicAsset('images/characters/mummy-pig.png') },
  { name: '猪爸爸', role: '爸爸', src: publicAsset('images/characters/daddy-pig.png') },
  { name: '猪爷爷', role: '爷爷', src: publicAsset('images/characters/grandpa-pig.png') },
  { name: '大象朋友', role: '朋友', src: publicAsset('images/characters/emily-elephant.png') },
  { name: '兔子朋友', role: '朋友', src: publicAsset('images/characters/rebecca-rabbit.png') },
]

function onResolved(next: InteractionResult): void {
  results.value[selectedMode.value] = next
}
</script>

<template>
  <main class="mx-auto flex w-full max-w-5xl flex-col gap-5">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <KButton
        variant="ghost"
        size="sm"
        :to="{
          name: ROUTE_NAMES.mathOutline,
          params: { gradeId: 'grade-1', categoryId: 'grade-1-math' },
        }"
      >
        <KIcon name="arrow-left" size="sm" />
        回到数学大纲
      </KButton>
      <div class="flex flex-wrap gap-2">
        <KTag tone="math" size="sm">
          单题样例
        </KTag>
        <KTag tone="star" size="sm">
          原题 {{ grade1MathUnitTwoSample.id }}
        </KTag>
      </div>
    </div>

    <header
      class="overflow-hidden rounded-blob border-2 border-math-line bg-math-soft shadow-sticker"
    >
      <div class="grid gap-5 px-5 py-6 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:px-8 sm:py-8">
        <div>
          <p class="font-body text-xs font-extrabold tracking-[0.18em] text-math-deep uppercase">
            一年级上册 · 第 2 单元
          </p>
          <h1 class="mt-2 font-display text-3xl text-ink sm:text-4xl">
            数字排排站
          </h1>
          <p class="mt-3 max-w-2xl font-body text-sm leading-relaxed text-ink-soft sm:text-base">
            原题文字完整保留，再按数数顺序补上空格。答错可以继续尝试，提示不会直接揭晓答案。
          </p>
        </div>
        <div class="max-w-full rounded-card border-2 border-white/80 bg-white/75 px-3 py-2.5 shadow-press">
          <p class="mb-1.5 px-1 font-display text-sm text-ink">
            佩奇一家和朋友们
          </p>
          <div class="flex max-w-full items-end gap-1 overflow-x-auto pb-1">
            <figure
              v-for="character in characterImages"
              :key="character.name"
              class="flex shrink-0 flex-col items-center gap-0.5"
            >
              <img
                :src="character.src"
                :alt="`${character.name}，${character.role}`"
                :class="character.featured ? 'h-16 w-16' : 'h-12 w-12'"
                class="rounded-lg border border-line/70 bg-white object-contain"
                width="64"
                height="64"
              >
              <figcaption class="font-body text-[10px] leading-tight text-ink-soft">
                {{ character.name }}
              </figcaption>
            </figure>
          </div>
        </div>
      </div>
    </header>

    <section class="grid gap-5 lg:grid-cols-[minmax(0,1fr)_17rem]">
      <div class="rounded-card border-2 border-line bg-surface p-4 shadow-sticker sm:p-6">
        <div class="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p class="font-body text-xs font-extrabold tracking-[0.15em] text-math-deep uppercase">
              原题 · 6～10 各数的认识
            </p>
            <p class="mt-1 font-body text-xs text-ink-faint">
              题目与答案来自源题库，交互为本项目改编
            </p>
          </div>
          <KTag tone="math" size="sm">
            开场快测 · 1 / 7
          </KTag>
        </div>

        <div class="mb-5 flex justify-center">
          <div class="flex rounded-chip border border-line bg-paper p-1" role="group" aria-label="选择互动方式">
            <button
              type="button"
              class="rounded-chip px-4 py-2 font-body text-sm font-bold transition-colors"
              :class="selectedMode === 'digital' ? 'bg-surface text-ink shadow-press' : 'text-ink-soft'"
              :aria-pressed="selectedMode === 'digital'"
              @click="selectedMode = 'digital'"
            >
              数字互动
            </button>
            <button
              type="button"
              class="rounded-chip px-4 py-2 font-body text-sm font-bold transition-colors"
              :class="selectedMode === 'picture' ? 'bg-surface text-ink shadow-press' : 'text-ink-soft'"
              :aria-pressed="selectedMode === 'picture'"
              @click="selectedMode = 'picture'"
            >
              看图互动
            </button>
          </div>
        </div>

        <KeepAlive>
          <InteractionShell
            :key="selectedMode"
            :spec="activeInteraction"
            mascot="fox"
            :mascot-avatar-image="characterImages[0].src"
            :initial-line="selectedMode === 'digital' ? '佩奇想和你一起，按顺序找出下一个数吧！' : '佩奇想和你一起，找出数列里缺少的数！'"
            @resolved="onResolved"
          />
        </KeepAlive>

        <div
          v-if="activeResult?.correct"
          class="mt-5 rounded-tile border-2 border-success bg-success-soft px-5 py-4"
          aria-live="polite"
        >
          <p class="flex items-center gap-2 font-display text-lg text-success-deep">
            <KIcon name="check-circle" size="sm" tone="success" />
            本模式答案：{{ activeAnswer }}
          </p>
          <p class="mt-1.5 font-body text-sm leading-relaxed text-ink-soft">
            {{ activeExplanation }}
          </p>
        </div>
      </div>

      <aside class="flex flex-col gap-4">
        <div class="rounded-card border-2 border-line bg-paper p-5 shadow-press">
          <div class="flex items-center gap-2 font-display text-lg text-ink">
            <KIcon name="sparkle" size="sm" tone="math" />
            互动怎么做
          </div>
          <ol class="mt-3 flex flex-col gap-2 font-body text-sm leading-relaxed text-ink-soft">
            <li>1. 数字互动：6、7、8、9、？（共5格）。</li>
            <li>2. 看图互动：5、？、7、8、9。两种都是补全递增数列。</li>
            <li>3. 两种方式分别重试；答对后查看当前题目解析。</li>
          </ol>
        </div>

        <div class="rounded-card border-2 border-math-line/70 bg-math-soft/60 p-5">
          <p class="font-body text-xs font-extrabold tracking-[0.14em] text-math-deep uppercase">
            样题边界
          </p>
          <p class="mt-2 font-body text-sm leading-relaxed text-ink-soft">
            现在只开放这一道题供你预览。当前不会记录整单元进度，也不会批量生成其他题目。
          </p>
        </div>
      </aside>
    </section>

    <footer class="rounded-tile border border-line bg-paper/80 px-4 py-3 font-body text-xs leading-relaxed text-ink-faint">
      题目来源：
      <a
        :href="grade1MathUnitTwoSample.source.url"
        target="_blank"
        rel="noreferrer"
        class="font-semibold text-math-deep underline decoration-math-line underline-offset-2"
      >
        {{ grade1MathUnitTwoSample.source.name }} · {{ grade1MathUnitTwoSample.id }}
      </a>
      · 依据
      <a
        :href="grade1MathUnitTwoSample.source.licenseUrl"
        target="_blank"
        rel="noreferrer"
        class="font-semibold text-math-deep underline decoration-math-line underline-offset-2"
      >
        CC BY-NC 4.0
      </a>
      · 本项目增加数字序列互动与引导文案。
    </footer>
  </main>
</template>
