<script setup lang="ts">
import { computed, ref } from 'vue'

import { publicAsset } from '@/shared/utils'
import { KButton, KIcon, KTag } from '@/ui'

const emit = defineEmits<{
  back: []
  continue: []
}>()

const steps = ['侦察任务', '合并实物', '写出算式', '生活挑战', '学习地图']
const step = ref(0)
const diagnosticAnswer = ref<string | null>(null)
const combined = ref(false)
const countedItems = ref<number[]>([])
const selectedSign = ref<string | null>(null)
const selectedSum = ref<string | null>(null)
const equationStatus = ref<'waiting' | 'hint' | 'correct'>('waiting')
const challengeIndex = ref(0)
const challengeAnswer = ref<string | null>(null)
const challengeStatus = ref<'waiting' | 'hint' | 'correct'>('waiting')

const challenges = [
  {
    prompt: '乔治有 3 个皮球，佩奇又拿来 2 个。现在一共有几个？',
    choices: ['4 个', '5 个', '6 个', '7 个'],
    answer: '5 个',
    hint: '“又拿来”表示把两部分合起来。先算 3＋2。',
    explanation: '3＋2＝5（个）。',
  },
  {
    prompt: '篮子里有 4 朵花，又放进 3 朵。合起来有几朵？',
    choices: ['6 朵', '7 朵', '8 朵', '9 朵'],
    answer: '7 朵',
    hint: '先数原来的 4 朵，再接着数 3 朵。',
    explanation: '4＋3＝7（朵）。',
  },
  {
    prompt: '池塘里有 5 只鸭子，又游来 4 只。现在有几只？',
    choices: ['8 只', '9 只', '10 只', '11 只'],
    answer: '9 只',
    hint: '合起来用加法，结果不要超过 10。',
    explanation: '5＋4＝9（只）。',
  },
]

const currentChallenge = computed(() => challenges[challengeIndex.value]!)
const countedCount = computed(() => countedItems.value.length)
const equationComplete = computed(() => selectedSign.value === '+' && selectedSum.value === '5')
const canContinue = computed(() => {
  if (step.value === 0)
    return diagnosticAnswer.value === '+'
  if (step.value === 1)
    return combined.value && countedItems.value.length === 5
  if (step.value === 2)
    return equationStatus.value === 'correct'
  return false
})
const progress = computed(() => Math.round(((step.value + 1) / steps.length) * 100))

function answerDiagnostic(answer: string): void {
  diagnosticAnswer.value = answer
}

function toggleCount(index: number): void {
  if (countedItems.value.includes(index))
    countedItems.value = countedItems.value.filter(item => item !== index)
  else
    countedItems.value = [...countedItems.value, index]
}

function checkEquation(): void {
  equationStatus.value = equationComplete.value ? 'correct' : 'hint'
}

function answerChallenge(choice: string): void {
  if (challengeStatus.value === 'correct')
    return
  challengeAnswer.value = choice
  challengeStatus.value = choice === currentChallenge.value.answer ? 'correct' : 'hint'
}

function nextChallenge(): void {
  if (challengeStatus.value !== 'correct')
    return
  if (challengeIndex.value < challenges.length - 1) {
    challengeIndex.value += 1
    challengeAnswer.value = null
    challengeStatus.value = 'waiting'
  }
  else {
    step.value = 4
  }
}

function advance(): void {
  if (canContinue.value && step.value < 2)
    step.value += 1
}
</script>

<template>
  <section class="overflow-hidden rounded-blob border-2 border-math-line bg-surface shadow-sticker" aria-label="10以内加法互动小课">
    <header class="border-b-2 border-math-line/60 bg-math-soft px-4 py-4 sm:px-6">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <img :src="publicAsset('/images/characters/peppa.png')" alt="佩奇" class="size-14 rounded-2xl border-2 border-white bg-white object-contain shadow-press" width="56" height="56">
          <div>
            <p class="font-body text-xs font-extrabold tracking-[0.14em] text-math-deep uppercase">
              数学第二单元 · 互动小课
            </p>
            <h1 class="mt-0.5 font-display text-xl text-ink sm:text-2xl">
              10 以内的加法
            </h1>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <KTag tone="math" size="sm">
            约 8 分钟
          </KTag>
          <KButton variant="ghost" size="sm" @click="emit('back')">
            回到数学大纲
          </KButton>
        </div>
      </div>
      <div class="mt-4 flex items-center justify-between gap-3">
        <p class="font-body text-xs font-bold text-math-deep">
          第 {{ step + 1 }} / {{ steps.length }} 步 · {{ steps[step] }}
        </p>
        <span class="font-numeric text-xs font-bold text-ink-faint">{{ progress }}%</span>
      </div>
      <div
        class="mt-2 h-2 overflow-hidden rounded-chip bg-white/80"
        role="progressbar"
        :aria-valuenow="step + 1"
        :aria-valuemin="1"
        :aria-valuemax="steps.length"
        aria-label="互动小课进度"
      >
        <div class="h-full rounded-chip bg-math-deep transition-[width] duration-300" :style="{ width: `${progress}%` }" />
      </div>
    </header>

    <div class="p-4 sm:p-6">
      <template v-if="step === 0">
        <div class="grid gap-5 lg:grid-cols-[minmax(0,1fr)_16rem]">
          <div>
            <KTag tone="explore" size="sm">
              故事任务 · 帮佩奇把两盒彩笔整理进笔筒
            </KTag>
            <h2 class="mt-3 font-display text-2xl leading-snug text-ink">
              先快快想一想：两部分合起来，用哪个符号？
            </h2>
            <p class="mt-2 font-body text-sm leading-relaxed text-ink-soft">
              【家长说】“原来有一些，又放进一些，现在要知道一共有多少。你觉得该用加号还是减号？”
            </p>
            <div class="mt-5 flex flex-wrap gap-3">
              <button
                v-for="sign in ['+', '−']"
                :key="sign"
                type="button"
                class="fx-pressable grid size-16 place-items-center rounded-tile border-2 font-display text-3xl"
                :class="diagnosticAnswer === sign ? sign === '+' ? 'border-success bg-success-soft text-success-deep' : 'border-gently bg-gently-soft text-ink' : 'border-line bg-paper text-ink hover:border-math-deep'"
                :aria-pressed="diagnosticAnswer === sign"
                @click="answerDiagnostic(sign)"
              >
                {{ sign }}
              </button>
            </div>
            <p v-if="diagnosticAnswer === '−'" class="mt-3 rounded-tile bg-gently-soft p-3 font-body text-sm text-ink-soft" aria-live="polite">
              想想看：两盒彩笔放到一起，东西变多了还是变少了？再选一次。
            </p>
            <p v-else-if="diagnosticAnswer === '+'" class="mt-3 font-body text-sm font-bold text-success-deep" aria-live="polite">
              找到了！加法可以表示把两部分合起来。
            </p>
          </div>
          <aside class="flex flex-col items-center justify-center rounded-card border-2 border-line bg-paper p-4 text-center">
            <img :src="publicAsset('/images/characters/george.png')" alt="乔治拿着一盒彩笔" class="h-36 w-full object-contain" width="144" height="144">
            <p class="mt-2 font-display text-lg text-ink">
              今天学会三件事
            </p>
            <p class="mt-1 font-body text-xs leading-relaxed text-ink-soft">
              把两组放在一起 · 按顺序数总数 · 用“＋”写算式
            </p>
          </aside>
        </div>
      </template>

      <template v-else-if="step === 1">
        <div class="flex flex-wrap items-end justify-between gap-3">
          <div>
            <KTag tone="math" size="sm">
              观察和操作
            </KTag>
            <h2 class="mt-2 font-display text-2xl text-ink">
              佩奇有 2 支彩笔，乔治又拿来 3 支
            </h2>
          </div>
          <KTag tone="success" size="sm">
            已点数 {{ countedCount }} / 5
          </KTag>
        </div>
        <p class="mt-2 font-body text-sm leading-relaxed text-ink-soft">
          【家长说】“先看看佩奇的，再看看乔治带来的。点一下，把两组彩笔放到同一个笔筒里。”
        </p>
        <div class="mt-5 grid gap-4 md:grid-cols-[1fr_auto_1fr] md:items-center">
          <div class="rounded-card border-2 border-line bg-paper p-4 text-center">
            <p class="font-display text-base text-ink">
              佩奇原来有 2 支
            </p>
            <div class="mt-3 flex justify-center gap-2 text-3xl" aria-label="两支彩笔">
              🖍️🖍️
            </div>
          </div>
          <KButton variant="primary" tone="math" size="lg" :disabled="combined" @click="combined = true">
            {{ combined ? '放进同一个笔筒啦' : '把两组放在一起' }} <KIcon name="arrow-right" size="sm" />
          </KButton>
          <div class="rounded-card border-2 border-line bg-paper p-4 text-center">
            <p class="font-display text-base text-ink">
              乔治又拿来 3 支
            </p>
            <div class="mt-3 flex justify-center gap-2 text-3xl" aria-label="三支彩笔">
              🖍️🖍️🖍️
            </div>
          </div>
        </div>
        <div v-if="combined" class="mt-5 rounded-card border-2 border-math-line bg-math-soft/60 p-4" aria-live="polite">
          <p class="font-display text-lg text-ink">
            现在放在一起了，点一点，逐支数出总数
          </p>
          <div class="mt-3 flex flex-wrap justify-center gap-2">
            <button
              v-for="index in 5"
              :key="index"
              type="button"
              class="fx-pressable grid size-14 place-items-center rounded-tile border-2 text-2xl transition-transform"
              :class="countedItems.includes(index) ? 'border-success bg-success-soft -translate-y-1' : 'border-line bg-white hover:border-math-deep'"
              :aria-pressed="countedItems.includes(index)"
              :aria-label="`第 ${index} 支彩笔${countedItems.includes(index) ? '已数' : '未数'}`"
              @click="toggleCount(index)"
            >
              {{ countedItems.includes(index) ? '✓' : '🖍️' }}
            </button>
          </div>
          <p class="mt-3 text-center font-body text-sm text-ink-soft">
            每点一支就说一个数：1、2、3……
          </p>
        </div>
      </template>

      <template v-else-if="step === 2">
        <KTag tone="think" size="sm">
          把动作写成算式
        </KTag>
        <h2 class="mt-2 font-display text-2xl text-ink">
          2 支和 3 支合起来，算式怎么写？
        </h2>
        <p class="mt-2 font-body text-sm leading-relaxed text-ink-soft">
          【家长说】“两部分合起来，用加号。先读一读 2＋3，再想一想总数。”
        </p>
        <div class="mx-auto mt-5 flex max-w-2xl flex-wrap items-center justify-center gap-3 rounded-card border-2 border-line bg-paper p-5 sm:p-7">
          <span class="font-numeric text-4xl font-black text-ink">2</span>
          <span class="font-numeric text-4xl font-black text-ink">+</span>
          <span class="font-numeric text-4xl font-black text-ink">3</span>
          <span class="font-numeric text-4xl font-black text-ink">=</span>
          <span class="grid size-16 place-items-center rounded-tile border-2 border-dashed border-math-line bg-white font-display text-3xl text-math-deep">?</span>
        </div>
        <div class="mx-auto mt-4 max-w-2xl">
          <p class="font-body text-sm font-bold text-ink">
            先选合适的符号，再选总数
          </p>
          <div class="mt-2 flex gap-2">
            <button
              v-for="sign in ['+', '−']"
              :key="sign"
              type="button"
              class="fx-pressable grid size-12 place-items-center rounded-tile border-2 font-display text-2xl"
              :class="selectedSign === sign ? 'border-math-deep bg-math-soft text-math-deep' : 'border-line bg-paper text-ink'"
              :aria-pressed="selectedSign === sign"
              @click="selectedSign = sign; equationStatus = 'waiting'"
            >
              {{ sign }}
            </button>
          </div>
          <div class="mt-3 flex flex-wrap gap-2">
            <button
              v-for="number in ['4', '5', '6']"
              :key="number"
              type="button"
              class="fx-pressable grid size-12 place-items-center rounded-tile border-2 font-numeric text-xl font-bold"
              :class="selectedSum === number ? 'border-math-deep bg-math-soft text-math-deep' : 'border-line bg-paper text-ink'"
              :aria-pressed="selectedSum === number"
              @click="selectedSum = number; equationStatus = 'waiting'"
            >
              {{ number }}
            </button>
          </div>
          <div class="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p class="font-body text-xs text-ink-faint">
              【孩子操作】点选符号和答案，然后检查算式。
            </p>
            <KButton variant="primary" tone="math" :disabled="!selectedSign || !selectedSum" @click="checkEquation">
              检查算式
            </KButton>
          </div>
          <p v-if="equationStatus === 'hint'" class="mt-3 rounded-tile bg-gently-soft p-3 font-body text-sm text-ink-soft" aria-live="polite">
            线索：两个部分合起来用“＋”。刚才数过的彩笔一共有几支？再试一次。
          </p>
          <div v-else-if="equationStatus === 'correct'" class="mt-3 rounded-tile bg-success-soft p-3" aria-live="polite">
            <p class="font-display text-lg text-success-deep">
              算式写对啦：2＋3＝5
            </p>
            <p class="mt-1 font-body text-sm text-ink-soft">
              加数表示合起来的两部分，和表示合起来的总数。
            </p>
          </div>
        </div>
      </template>

      <template v-else-if="step === 3">
        <div class="flex flex-wrap items-end justify-between gap-3">
          <div>
            <KTag tone="explore" size="sm">
              生活应用 · 变式挑战
            </KTag><h2 class="mt-2 font-display text-2xl text-ink">
              挑战 {{ challengeIndex + 1 }} / {{ challenges.length }}
            </h2>
          </div>
          <KTag tone="success" size="sm">
            答对后再继续
          </KTag>
        </div>
        <div class="mx-auto mt-5 max-w-2xl rounded-card border-2 border-line bg-paper p-5 sm:p-7">
          <div class="flex items-center gap-3">
            <img :src="publicAsset('/images/characters/peppa.png')" alt="佩奇陪你读题" class="size-12 rounded-xl border-2 border-white bg-white object-contain shadow-press" width="48" height="48">
            <p class="font-display text-xl leading-relaxed text-ink">
              {{ currentChallenge.prompt }}
            </p>
          </div>
          <div class="mt-5 grid grid-cols-2 gap-2">
            <button
              v-for="choice in currentChallenge.choices"
              :key="choice"
              type="button"
              class="fx-pressable min-h-14 rounded-tile border-2 px-3 py-2 font-display text-base"
              :class="challengeStatus === 'correct' && choice === currentChallenge.answer ? 'border-success bg-success-soft text-success-deep' : challengeAnswer === choice && challengeStatus === 'hint' ? 'border-gently bg-gently-soft text-ink' : 'border-line bg-white text-ink hover:border-math-deep'"
              :disabled="challengeStatus === 'correct'"
              @click="answerChallenge(choice)"
            >
              {{ choice }}
            </button>
          </div>
          <p v-if="challengeStatus === 'hint'" class="mt-3 rounded-tile bg-gently-soft p-3 font-body text-sm leading-relaxed text-ink-soft" aria-live="polite">
            小提示：{{ currentChallenge.hint }} 再试一次。
          </p>
          <div v-else-if="challengeStatus === 'correct'" class="mt-3 rounded-tile bg-success-soft p-3" aria-live="polite">
            <p class="font-display text-base text-success-deep">
              做对啦！
            </p><p class="mt-1 font-body text-sm text-ink-soft">
              {{ currentChallenge.explanation }}
            </p>
            <KButton class="mt-3" variant="primary" tone="math" @click="nextChallenge">
              {{ challengeIndex + 1 < challenges.length ? '下一道挑战' : '完成挑战' }} <KIcon name="arrow-right" size="sm" />
            </KButton>
          </div>
        </div>
      </template>

      <template v-else>
        <div class="mx-auto max-w-3xl py-4 text-center">
          <span class="mx-auto grid size-16 place-items-center rounded-full border-4 border-star-line bg-star-soft text-star-deep"><KIcon name="check" size="2xl" /></span>
          <KTag class="mt-4" tone="success" size="sm">
            互动小课完成
          </KTag>
          <h2 class="mt-3 font-display text-3xl text-ink">
            会把两部分合起来啦！
          </h2>
          <p class="mx-auto mt-2 max-w-2xl font-body text-sm leading-relaxed text-ink-soft">
            你练习了合并两组物品、按顺序点数和用加号写算式。接下来进入“10以内的加法”原有快测、原题和拓展题；做完后再按本知识点获得星星反馈。
          </p>
          <div class="mt-5 rounded-card border-2 border-math-line bg-math-soft/60 p-4 text-left">
            <p class="font-display text-base text-ink">
              家庭小游戏 · 5 分钟
            </p>
            <p class="mt-1 font-body text-sm leading-relaxed text-ink-soft">
              拿两小堆积木或水果，例如 3 个和 2 个。请孩子把它们合起来、数出总数，再说出算式。换一换数量，结果不超过 10。
            </p>
          </div>
          <div class="mt-6 flex flex-wrap justify-center gap-3">
            <KButton variant="ghost" @click="emit('back')">
              稍后练习
            </KButton>
            <KButton size="lg" variant="primary" tone="math" @click="emit('continue')">
              开始加法练习 <KIcon name="arrow-right" size="sm" />
            </KButton>
          </div>
        </div>
      </template>

      <footer v-if="step < 3" class="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
        <p class="font-body text-xs text-ink-faint">
          {{ step === 0 ? '先让孩子自己想，再用提示帮助他找到规律。' : step === 1 ? '先观察物品，再亲手点数。' : '能说清每个数表示什么，比算得快更重要。' }}
        </p>
        <KButton variant="primary" tone="math" :disabled="!canContinue" @click="advance">
          下一步 <KIcon name="arrow-right" size="sm" />
        </KButton>
      </footer>
    </div>
  </section>
</template>
