<script setup lang="ts">
import type { PictureQuestion } from '@/content/grades/grade-1/math-unit-two-practice'
import { characterAsset } from '@/content/grades/grade-1/math-unit-two-practice'
import { publicAsset } from '@/shared/utils'

defineProps<{ picture: PictureQuestion }>()

const sceneBackground = publicAsset('images/activities/math-garden-scene.webp')
</script>

<template>
  <section class="mb-5 overflow-hidden rounded-blob border-2 border-math-line bg-cover bg-center p-4 sm:p-5" :style="{ backgroundImage: `url('${sceneBackground}')` }" aria-label="情境插画">
    <div class="flex items-center gap-3">
      <img :src="publicAsset(characterAsset(picture.character))" :alt="picture.characterName" class="h-16 w-16 shrink-0 rounded-xl border border-white bg-white/80 object-contain shadow-press sm:h-20 sm:w-20" width="80" height="80">
      <div class="min-w-0">
        <p class="font-display text-base leading-snug text-ink sm:text-lg">
          {{ picture.caption }}
        </p>
        <p class="mt-1 font-body text-xs text-ink-soft">
          看图数一数，再做同一种数学题
        </p>
      </div>
    </div>
    <div class="mt-4 grid gap-2 sm:grid-cols-2">
      <div v-for="(group, groupIndex) in picture.groups" :key="`${group.label}-${groupIndex}`" class="flex min-h-16 items-center gap-3 rounded-tile border border-white/90 bg-white/80 px-3 py-2 shadow-press">
        <span class="grid size-9 shrink-0 place-items-center rounded-full bg-math-soft text-lg" aria-hidden="true">{{ group.emoji }}</span>
        <div class="min-w-0 flex-1">
          <div class="flex flex-wrap items-center gap-1">
            <span v-for="iconIndex in Math.min(group.count, 10)" :key="iconIndex" class="text-sm" aria-hidden="true">{{ group.emoji }}</span>
          </div>
          <p class="mt-0.5 font-body text-xs font-semibold text-ink-soft">
            {{ group.label }}
          </p>
        </div>
        <span v-if="group.action" class="font-numeric text-xl font-black text-math-deep">{{ group.action }}</span>
      </div>
      <div v-if="picture.signs?.length" class="flex min-h-16 items-center justify-center gap-2 rounded-tile border border-white/90 bg-white/80 px-3 py-2 font-numeric text-xl font-black text-math-deep shadow-press">
        <span v-for="(sign, signIndex) in picture.signs" :key="signIndex">{{ sign }}</span>
      </div>
    </div>
  </section>
</template>
