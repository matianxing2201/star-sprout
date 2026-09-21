<script setup lang="ts">
import { ref, toRef } from 'vue'

import { useFocusTrap } from '@/composables/useFocusTrap'
import { cn } from '@/shared/utils'
/** 走 ui 内部出口，避免 base 组件回头依赖 @/ui 桶文件形成循环 */
import { KIcon } from '@/ui/icons'

/**
 * 通用弹层（角色对话、确认、奖励）。
 * - 打开时锁定滚动、焦点陷阱、ESC 关闭
 * - 关闭后焦点回到触发元素
 */
const {
  open = false,
  title,
  dismissible = true,
  size = 'md',
} = defineProps<{
  open?: boolean
  title?: string
  /** 是否允许点击遮罩 / 按 ESC 关闭 */
  dismissible?: boolean
  size?: 'sm' | 'md' | 'lg'
}>()

const emit = defineEmits<{ close: [] }>()

const panel = ref<HTMLElement | null>(null)

useFocusTrap({
  container: panel,
  active: toRef(() => open),
  onEscape: () => {
    if (dismissible)
      emit('close')
  },
})

const SIZE_CLASSES = {
  sm: 'max-w-md',
  md: 'max-w-2xl',
  lg: 'max-w-4xl',
} as const
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200 ease-soft"
      leave-active-class="transition-opacity duration-150 ease-snap"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-end justify-center bg-ink/35 p-4 backdrop-blur-sm sm:items-center"
        @click.self="dismissible && emit('close')"
      >
        <div
          ref="panel"
          role="dialog"
          aria-modal="true"
          :aria-label="title"
          tabindex="-1"
          :class="cn(
            'w-full rounded-blob border-2 border-line bg-paper p-6 shadow-lift outline-none',
            'animate-slide-up',
            SIZE_CLASSES[size],
          )"
        >
          <header v-if="title" class="mb-4 flex items-start justify-between gap-4">
            <h2 class="font-display text-2xl text-ink">
              {{ title }}
            </h2>
            <button
              v-if="dismissible"
              type="button"
              class="grid size-9 shrink-0 place-items-center rounded-chip text-ink-soft transition-colors hover:bg-paper-deep hover:text-ink"
              aria-label="关闭"
              @click="emit('close')"
            >
              <KIcon name="close" size="md" />
            </button>
          </header>

          <slot />

          <footer v-if="$slots.footer" class="mt-6 flex flex-wrap justify-end gap-3">
            <slot name="footer" />
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
