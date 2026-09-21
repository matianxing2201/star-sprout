<script setup lang="ts">
import type { InteractionComponentEmits } from '../contract'

import type { Hotspot, HotspotExplorePayload } from '@/domain'
import { computed, ref } from 'vue'
import { toneVars } from '@/domain'

import { cn } from '@/shared/utils'
import { KIcon, KVisual } from '@/ui'

/**
 * 找一找：点场景里的物件，一个个亮出知识卡片。
 * 判对规则：发现的物件数量达到 requiredCount（缺省为全部）即算完成。
 * 这里每个物件都是一次“发现”，没有错误目标，所以本组件永远不会发出 missed。
 */
const { payload, disabled = false } = defineProps<{
  payload: HotspotExplorePayload
  disabled?: boolean
}>()

const emit = defineEmits<InteractionComponentEmits>()

/** 卡片与物件的间距（百分比），太小会盖住刚点过的那个点 */
const CARD_GAP = 8
const SPOT_SIZE = 64

const discovered = ref<string[]>([])
const activeId = ref<string | null>(null)

const neededCount = computed(() => payload.requiredCount ?? payload.hotspots.length)
const active = computed(() => payload.hotspots.find(hotspot => hotspot.id === activeId.value) ?? null)

/** 没有背景图时用色调铺一层柔和底色，孩子仍然看得出“这是一幅画” */
const sceneStyle = computed(() => ({
  ...toneVars(payload.backgroundTone ?? 'explore'),
  backgroundImage: 'linear-gradient(160deg, var(--tone-soft) 0%, var(--tone-glow) 100%)',
}))

/** 坐标用百分比：任何屏幕尺寸下物件都落在同一个位置 */
function hotspotStyle(hotspot: Hotspot) {
  return {
    left: `${hotspot.x}%`,
    top: `${hotspot.y}%`,
    width: `${SPOT_SIZE}px`,
    height: `${SPOT_SIZE}px`,
    transform: 'translate(-50%, -50%)',
  }
}

/**
 * 卡片贴着物件出现：物件在画面上半部分就落在它下面，否则落在它上面。
 * 两个方向的落点都留了边距，长一点的揭示文字也不会越出画面。
 */
const cardStyle = computed(() => {
  const hotspot = active.value
  if (!hotspot)
    return {}

  const below = hotspot.y <= 52
  const edge = below
    ? Math.min(Math.max(hotspot.y + CARD_GAP, 3), 70)
    : Math.min(Math.max(hotspot.y - CARD_GAP, 30), 97)

  return {
    left: '50%',
    top: `${edge}%`,
    transform: `translate(-50%, ${below ? '0%' : '-100%'})`,
  }
})

function discover(hotspot: Hotspot): void {
  if (disabled)
    return

  // 已经看过的卡片可以再看，但不重复计数
  activeId.value = hotspot.id
  if (discovered.value.includes(hotspot.id))
    return

  discovered.value.push(hotspot.id)
  if (discovered.value.length >= neededCount.value)
    emit('solved', [...discovered.value])
}
</script>

<template>
  <div
    class="relative aspect-[4/3] w-full overflow-hidden rounded-tile border-2 border-[var(--tone-line)] shadow-sticker"
    :style="sceneStyle"
  >
    <img
      v-if="payload.background"
      :src="payload.background"
      alt=""
      class="absolute inset-0 size-full object-cover"
    >
    <span
      v-else
      class="absolute inset-0 grid select-none place-items-center opacity-20"
      aria-hidden="true"
    >
      <KIcon name="binoculars" size="2xl" class="size-28" />
    </span>

    <span class="absolute top-3 left-3 rounded-chip border-2 border-[var(--tone-line)] bg-surface/85 px-3 py-1 font-body text-xs text-ink-soft">
      已发现 {{ discovered.length }} / {{ neededCount }}
    </span>

    <!-- 外层只负责用 translate 摆坐标，动画放在按钮上，两者互不覆盖 -->
    <div
      v-for="hotspot in payload.hotspots"
      :key="hotspot.id"
      class="absolute"
      :style="hotspotStyle(hotspot)"
    >
      <button
        type="button"
        :disabled="disabled"
        :aria-label="hotspot.label"
        :aria-pressed="discovered.includes(hotspot.id)"
        :class="cn(
          'fx-pressable relative grid size-full place-items-center rounded-chip border-2 border-[var(--tone-line)] bg-surface/90 shadow-sticker',
          'disabled:cursor-default',
          discovered.includes(hotspot.id) && 'border-success bg-success-soft',
          activeId === hotspot.id && 'border-[var(--tone)]',
        )"
        @click="discover(hotspot)"
      >
        <KVisual
          :icon="hotspot.icon ?? (hotspot.emoji ? undefined : 'sparkle')"
          :emoji="hotspot.emoji"
          size="xl"
        />
        <span
          v-if="discovered.includes(hotspot.id)"
          class="absolute -top-2 -right-2 grid size-7 place-items-center rounded-chip bg-success text-white shadow-press"
          aria-hidden="true"
        >
          <KIcon name="check" size="md" />
        </span>
      </button>
    </div>

    <div
      v-if="active"
      class="absolute z-10 max-h-[64%] w-[min(20rem,86%)] overflow-y-auto rounded-tile border-2 border-[var(--tone-line)] bg-surface/95 p-3 shadow-lift"
      :style="cardStyle"
    >
      <p class="flex items-center gap-1.5 font-display text-base text-[var(--tone-deep)]">
        <KVisual
          :icon="active.icon ?? (active.emoji ? undefined : 'sparkle')"
          :emoji="active.emoji"
          size="sm"
        />
        {{ active.label }}
      </p>
      <p class="mt-1 font-body text-sm leading-relaxed text-ink-soft">
        {{ active.reveal }}
      </p>
      <button
        type="button"
        class="mt-2 rounded-chip border-2 border-[var(--tone-line)] bg-[var(--tone-soft)] px-3 py-1 font-body text-xs text-[var(--tone-deep)]"
        :aria-label="`收起「${active.label}」的知识卡片`"
        @click="activeId = null"
      >
        知道啦
      </button>
    </div>
  </div>
</template>
