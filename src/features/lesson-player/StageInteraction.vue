<script setup lang="ts">
import type { InteractionResult, MascotId, PracticeTask } from '@/domain'

import { computed, ref } from 'vue'
import { InteractionShell } from '@/features/interactions'
import { KButton, KIcon } from '@/ui'

/**
 * 动手探索 / 小试身手 / 挑战任务
 * ============================
 *
 * 这三类步骤结构相同，只是教学位置不同（第一次动手 / 练一练 / 拔高），
 * 所以共用同一个舞台：一次可能包含多个互动，做完一个才出现“继续”。
 *
 * 孩子永远掌握节奏：做对了不会自动跳走，要自己点“继续”。
 */
const {
  task,
  mascot,
} = defineProps<{
  task: PracticeTask
  mascot: MascotId
}>()

const emit = defineEmits<{
  resolved: [result: InteractionResult]
  done: []
}>()

const index = ref(0)

const interactions = computed(() => task.interactions)
const current = computed(() => interactions.value[index.value])
const isLast = computed(() => index.value >= interactions.value.length - 1)
const solvedCurrent = ref(false)

function onResolved(result: InteractionResult): void {
  solvedCurrent.value = true
  emit('resolved', result)
}

function advance(): void {
  if (isLast.value) {
    emit('done')
    return
  }
  index.value += 1
  solvedCurrent.value = false
}
</script>

<template>
  <section class="flex flex-col gap-5">
    <p v-if="task.instruction" class="font-display text-xl text-ink">
      {{ task.instruction }}
    </p>

    <InteractionShell
      v-if="current"
      :key="index"
      :spec="current"
      :mascot="mascot"
      @resolved="onResolved"
    />

    <div v-if="solvedCurrent" class="flex justify-center">
      <KButton size="lg" variant="star" @click="advance">
        {{ isLast ? '继续' : '还有一个小任务' }}
        <KIcon name="arrow-right" size="sm" />
      </KButton>
    </div>
  </section>
</template>
