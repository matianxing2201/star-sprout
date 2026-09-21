<script setup lang="ts">
import type { DiscoverTask } from '@/domain'

import { computed, ref } from 'vue'
import { toneVars } from '@/domain'
import { cn } from '@/shared/utils'
import { KButton, KIcon } from '@/ui'

/**
 * 知识发现
 * ========
 *
 * 需求明确反对“直接显示一大段文字”。所以一张卡只讲一件事，
 * 卡片背面对着孩子（只有图标 + 小标题），点开才出现那一句话 ——
 * “点开”这个动作本身就是注意力管理。
 *
 * 卡片上的图形走矢量图标（双色调），一整排并排时粗细与基线一致；
 * 卡片本身的色调由 `toneVars` 提供，图标跟着同一个色系深浅变化。
 */
const { task } = defineProps<{ task: DiscoverTask }>()

const emit = defineEmits<{ done: [] }>()

const opened = ref<string[]>([])

const cards = computed(() => task.discovery.cards)
const allOpened = computed(() => opened.value.length >= cards.value.length)
const openedCount = computed(() => opened.value.length)

function open(id: string): void {
  if (!opened.value.includes(id))
    opened.value = [...opened.value, id]
}
</script>

<template>
  <section class="flex flex-col gap-5">
    <p v-if="task.instruction" class="font-display text-xl text-ink">
      {{ task.instruction }}
    </p>

    <ul class="grid gap-4 sm:grid-cols-2">
      <li v-for="card in cards" :key="card.id">
        <button
          type="button"
          :class="cn(
            'fx-tap flex h-full w-full flex-col items-start gap-2 rounded-tile border-2 p-5 text-left shadow-sticker',
            opened.includes(card.id)
              ? 'border-[var(--tone-line)] bg-surface'
              : 'border-dashed border-line-strong bg-paper-deep/70',
          )"
          :style="toneVars(card.tone ?? 'neutral')"
          :aria-expanded="opened.includes(card.id)"
          @click="open(card.id)"
        >
          <KIcon
            :name="card.icon"
            size="xl"
            weight="duotone"
            :tone="card.tone ?? 'neutral'"
          />
          <span class="font-display text-lg text-ink">{{ card.title }}</span>

          <span
            v-if="opened.includes(card.id)"
            class="animate-slide-up font-body text-sm leading-relaxed text-ink-soft"
          >
            {{ card.body }}
          </span>
          <span v-else class="inline-flex items-center gap-1 font-body text-xs text-ink-faint">
            点一下看看
            <KIcon name="arrow-right" size="sm" />
          </span>
        </button>
      </li>
    </ul>

    <div class="flex flex-wrap items-center justify-center gap-3">
      <KButton
        size="lg"
        :variant="allOpened ? 'primary' : 'soft'"
        @click="emit('done')"
      >
        <template v-if="allOpened">
          我知道啦，继续
          <KIcon name="arrow-right" size="sm" />
        </template>
        <template v-else>
          继续（已看 {{ openedCount }}/{{ cards.length }}）
        </template>
      </KButton>
    </div>
  </section>
</template>
