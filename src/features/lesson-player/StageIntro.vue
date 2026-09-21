<script setup lang="ts">
import type { IntroTask } from '@/domain'

import { computed, ref } from 'vue'
import { MascotBubble } from '@/features/mascot'
import { KButton } from '@/ui'

/**
 * 角色引入
 * ========
 *
 * 孩子的第一眼不是“课程说明”，而是“谁在跟我说话”。
 * 台词一句一句出现，由孩子自己点“继续”控制节奏，读得慢也不会被催。
 */
const { task } = defineProps<{ task: IntroTask }>()

const emit = defineEmits<{ done: [] }>()

const revealed = ref(1)

const lines = computed(() => task.story.lines.slice(0, revealed.value))
const allShown = computed(() => revealed.value >= task.story.lines.length)

function advance(): void {
  if (allShown.value) {
    emit('done')
    return
  }
  revealed.value += 1
}
</script>

<template>
  <section class="flex flex-col gap-4">
    <div class="fx-stagger flex flex-col gap-3">
      <MascotBubble
        v-for="(line, index) in lines"
        :id="task.story.mascot"
        :key="index"
        :text="line"
        :mood="task.story.mood ?? 'happy'"
      />
    </div>

    <div class="mt-2 flex justify-center">
      <KButton size="lg" tone="language" @click="advance">
        {{ allShown ? '我们开始吧！' : '继续' }}
      </KButton>
    </div>
  </section>
</template>
