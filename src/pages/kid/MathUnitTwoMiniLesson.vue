<script setup lang="ts">
import { computed, ref } from 'vue'

import { publicAsset } from '@/shared/utils'
import { KButton, KIcon, KTag } from '@/ui'

type MiniLessonId = 'kp-cnm-p008' | 'kp-cnm-p009' | 'kp-cnm-p011' | 'kp-cnm-p012' | 'kp-cnm-p013' | 'kp-cnm-p253'
interface QuizItem { prompt: string, choices: string[], answer: string, hint: string, explanation: string }
interface DiagnosticItem { prompt: string, choices: string[], answer: string, hint: string }
interface LessonContent {
  title: string
  character: string
  characterName: string
  story: string
  focus: string
  diagnostic: DiagnosticItem
  challenges: QuizItem[]
  homeGame: string
  activity: 'count' | 'compare' | 'take-away' | 'chain-add' | 'mixed' | 'word-problem'
}

const props = defineProps<{ pointId: MiniLessonId }>()
const emit = defineEmits<{ back: [], continue: [] }>()

const lessons: Record<MiniLessonId, LessonContent> = {
  'kp-cnm-p008': {
    title: '6～10各数的认识',
    character: 'peppa',
    characterName: '佩奇',
    story: '佩奇在数字花园找数字邻居。一起数清楚 6 到 10，并发现数字和物品数量的关系。',
    focus: '按顺序数 6～10，认识前后相邻数，理解 10 个一组成 10。',
    activity: 'count',
    diagnostic: { prompt: '9 的后面一个数是几？', choices: ['8', '10', '7'], answer: '10', hint: '从 9 往后接着数一个。' },
    challenges: [
      { prompt: '从 6 数到 10，6、7、8、9、10 一共有几个数？', choices: ['4 个', '5 个', '6 个', '10 个'], answer: '5 个', hint: '6 和 10 两头都要数进去。', explanation: '6、7、8、9、10，一共有 5 个数。' },
      { prompt: '8 的前面一个数是几？', choices: ['6', '7', '9', '10'], answer: '7', hint: '沿数字小路往回退一步。', explanation: '7 在 8 的前面一个位置。' },
      { prompt: '10 可以看成几个一？', choices: ['8 个一', '9 个一', '10 个一', '1 个一'], answer: '10 个一', hint: '可以用十个小积木排一排。', explanation: '10 是由 10 个一组成的。' },
    ],
    homeGame: '拿 6～10 个积木排成一列，家长说一个数，孩子指出它的前一个和后一个；数一数 10 个积木。',
  },
  'kp-cnm-p009': {
    title: '10以内数的比较',
    character: 'daddy-pig',
    characterName: '猪爸爸',
    story: '猪爸爸和佩奇在数字跑道上比赛。站得更靠右的数更大，队伍多出的部分还能告诉我们相差几。',
    focus: '比较两个 10 以内的数，读懂大于、小于，并用减法表示相差数量。',
    activity: 'compare',
    diagnostic: { prompt: '7 和 9 比，哪个数更大？', choices: ['7', '9', '一样大'], answer: '9', hint: '在数字跑道上，靠右边的数更大。' },
    challenges: [
      { prompt: '6 和 8 比，应该填什么符号：6 □ 8？', choices: ['>', '<', '=', '+'], answer: '<', hint: '从 6 数到 8，8 在右边。', explanation: '6 小于 8，所以填“＜”。' },
      { prompt: '9 比 7 大几？', choices: ['1', '2', '3', '4'], answer: '2', hint: '从 7 数到 9，数一数跨了几步。', explanation: '9－7＝2，9 比 7 大 2。' },
      { prompt: '8、6、9、7 里面最小的是几？', choices: ['8', '6', '9', '7'], answer: '6', hint: '把它们放到数字跑道上，最靠左的是谁？', explanation: '6 比 7、8、9 都小。' },
    ],
    homeGame: '摆两排不同数量的积木，先一一配对，再说哪排多、相差几个。',
  },
  'kp-cnm-p011': {
    title: '10以内的减法',
    character: 'mummy-pig',
    characterName: '猪妈妈',
    story: '猪妈妈带来 8 个小苹果，分给朋友几个。点一点拿走的苹果，再看看还剩多少。',
    focus: '理解减法表示从总数中去掉一部分，能数出剩余数量。',
    activity: 'take-away',
    diagnostic: { prompt: '有 5 个橘子，拿走 1 个，应该用哪种运算？', choices: ['加法', '减法'], answer: '减法', hint: '拿走以后，剩下的数量变多还是变少？' },
    challenges: [
      { prompt: '8 颗糖，拿走 3 颗，还剩几颗？', choices: ['4 颗', '5 颗', '6 颗', '11 颗'], answer: '5 颗', hint: '从 8 个里面去掉 3 个。', explanation: '8－3＝5（颗）。' },
      { prompt: '9 个气球飞走了 4 个，还剩几个？', choices: ['4 个', '5 个', '6 个', '13 个'], answer: '5 个', hint: '飞走表示去掉，试着从 9 倒着数 4 个。', explanation: '9－4＝5（个）。' },
      { prompt: '一共 10 个果子，其中梨有 3 个，其余是苹果。苹果有几个？', choices: ['3 个', '6 个', '7 个', '13 个'], answer: '7 个', hint: '10 个里去掉 3 个梨，剩下的才是苹果。', explanation: '10－3＝7（个）。' },
    ],
    homeGame: '拿 8 个小物品，孩子闭眼，家长拿走几件；孩子数数剩下多少，并说出减法算式。',
  },
  'kp-cnm-p012': {
    title: '连加和连减',
    character: 'george',
    characterName: '乔治',
    story: '乔治看着池塘里的小鸭子：先游来一群，又游来一群。每次变化后都停下来数一数。',
    focus: '按从左往右的顺序计算三个数的连加或连减。',
    activity: 'chain-add',
    diagnostic: { prompt: '2＋3＋1 要从哪里开始算？', choices: ['先算 2＋3', '先算 3＋1', '把三个数随便加'], answer: '先算 2＋3', hint: '连加连减要从左往右依次计算。' },
    challenges: [
      { prompt: '2 只鸭子，又游来 3 只，再游来 2 只。现在几只？', choices: ['5 只', '6 只', '7 只', '8 只'], answer: '7 只', hint: '先算 2＋3，再把结果加 2。', explanation: '2＋3＝5，5＋2＝7（只）。' },
      { prompt: '9 块饼干，吃了 2 块，又吃了 2 块。还剩几块？', choices: ['4 块', '5 块', '6 块', '7 块'], answer: '5 块', hint: '每吃一次就从当前数量里减去。', explanation: '9－2＝7，7－2＝5（块）。' },
      { prompt: '先有 1 只鸟，飞来 4 只，又飞来 3 只。现在几只？', choices: ['6 只', '7 只', '8 只', '9 只'], answer: '8 只', hint: '从左边开始：1＋4，再加 3。', explanation: '1＋4＝5，5＋3＝8（只）。' },
    ],
    homeGame: '用 6 个积木做连续变化：先添 2 个、再拿走 1 个。每一步都说出当前数量。',
  },
  'kp-cnm-p013': {
    title: '10以内加减混合',
    character: 'peppa',
    characterName: '佩奇',
    story: '佩奇有一盒画笔，又买来几支，后来送给朋友几支。每发生一次变化，就更新盒子里的数量。',
    focus: '按从左往右的顺序处理加法和减法，留意每一步的当前数量。',
    activity: 'mixed',
    diagnostic: { prompt: '6＋2－3，先算哪一步？', choices: ['6＋2', '2－3', '6－3'], answer: '6＋2', hint: '混合算式也按从左往右的顺序算。' },
    challenges: [
      { prompt: '有 5 支笔，又买来 3 支，送出 2 支。还剩几支？', choices: ['5 支', '6 支', '7 支', '10 支'], answer: '6 支', hint: '先把买来的加上，再减去送出的。', explanation: '5＋3＝8，8－2＝6（支）。' },
      { prompt: '8 个苹果，吃了 3 个，又买来 2 个。现在有几个？', choices: ['5 个', '6 个', '7 个', '13 个'], answer: '7 个', hint: '先减去吃掉的，再加上新买的。', explanation: '8－3＝5，5＋2＝7（个）。' },
      { prompt: '4 个同学在读书，又来 5 个，走了 6 个。现在几人？', choices: ['2 人', '3 人', '4 人', '9 人'], answer: '3 人', hint: '把每一步变化都按顺序记下来。', explanation: '4＋5＝9，9－6＝3（人）。' },
    ],
    homeGame: '边摆边讲“来了几人、走了几人”，每一步移动积木后重新数当前数量。',
  },
  'kp-cnm-p253': {
    title: '用加减法解决问题',
    character: 'mummy-pig',
    characterName: '猪妈妈',
    story: '猪妈妈讲了一个小故事。先找出有多少、发生了什么变化、最后问什么，再决定用加法还是减法。',
    focus: '从情境中分清已知数量和问题，判断合起来或去掉，并解释得数。',
    activity: 'word-problem',
    diagnostic: { prompt: '“又跑来 2 只”表示把小动物合起来，还是拿走？', choices: ['合起来', '拿走'], answer: '合起来', hint: '想想动物是增加了还是减少了。' },
    challenges: [
      { prompt: '树上有 6 只鸟，又飞来 3 只。现在几只？', choices: ['3 只', '6 只', '9 只', '10 只'], answer: '9 只', hint: '又飞来表示合起来。', explanation: '6＋3＝9（只）。' },
      { prompt: '盘子里有 9 个苹果，吃掉 4 个。还剩几个？', choices: ['4 个', '5 个', '9 个', '13 个'], answer: '5 个', hint: '吃掉表示从原来的数量中去掉。', explanation: '9－4＝5（个）。' },
      { prompt: '有 8 个桃和 3 个梨，吃掉 2 个桃。桃还剩几个？', choices: ['3 个', '6 个', '8 个', '9 个'], answer: '6 个', hint: '题目问桃；梨的数量不用放进这道算式。', explanation: '只算桃：8－2＝6（个）。' },
    ],
    homeGame: '家长讲一个“又来一些”或“拿走一些”的小故事，让孩子指出数量、变化和问题，再列式计算。',
  },
}

const content = computed(() => lessons[props.pointId])
const stage = ref<'intro' | 'activity' | 'challenge' | 'summary'>('intro')
const diagnosticAnswer = ref<string | null>(null)
const activityComplete = ref(false)
const selectedCompare = ref<string | null>(null)
const countedItems = ref<number[]>([])
const removedItems = ref<number[]>([])
const chainCount = ref(2)
const chainStep = ref(0)
const mixedCount = ref(6)
const mixedStep = ref(0)
const wordOperation = ref<string | null>(null)
const wordAnswer = ref<string | null>(null)
const activityFeedback = ref<'waiting' | 'hint' | 'correct'>('waiting')
const challengeIndex = ref(0)
const challengeChoice = ref<string | null>(null)
const challengeFeedback = ref<'waiting' | 'hint' | 'correct'>('waiting')

const currentChallenge = computed(() => content.value.challenges[challengeIndex.value]!)
const challengeCount = computed(() => content.value.challenges.length)
const selectedAllRemoved = computed(() => removedItems.value.length === 3)
const wordProblemCorrect = computed(() => wordOperation.value === '+' && wordAnswer.value === '9')
const diagnosticCorrect = computed(() => diagnosticAnswer.value === content.value.diagnostic.answer)
const progress = computed(() => stage.value === 'intro' ? 20 : stage.value === 'activity' ? 45 : stage.value === 'challenge' ? 70 + Math.round(challengeIndex.value / challengeCount.value * 20) : 100)

function startActivity(): void {
  if (diagnosticCorrect.value)
    stage.value = 'activity'
}

function setDiagnostic(answer: string): void {
  diagnosticAnswer.value = answer
}

function selectCompare(sign: string): void {
  selectedCompare.value = sign
  activityFeedback.value = sign === '<' ? 'correct' : 'hint'
  activityComplete.value = sign === '<'
}

function toggleRemovedItem(index: number): void {
  if (content.value.activity === 'count') {
    countedItems.value = countedItems.value.includes(index)
      ? countedItems.value.filter(item => item !== index)
      : [...countedItems.value, index]
    activityComplete.value = countedItems.value.length === 7
    return
  }

  if (removedItems.value.includes(index)) {
    removedItems.value = removedItems.value.filter(item => item !== index)
    activityComplete.value = false
    return
  }
  if (removedItems.value.length >= 3)
    return
  removedItems.value = [...removedItems.value, index]
  activityComplete.value = removedItems.value.length === 3
}

function advanceChain(): void {
  if (chainStep.value === 0) {
    chainCount.value += 3
    chainStep.value = 1
  }
  else if (chainStep.value === 1) {
    chainCount.value += 2
    chainStep.value = 2
    activityComplete.value = chainCount.value === 7
  }
}

function advanceMixed(): void {
  if (mixedStep.value === 0) {
    mixedCount.value += 2
    mixedStep.value = 1
  }
  else if (mixedStep.value === 1) {
    mixedCount.value -= 3
    mixedStep.value = 2
    activityComplete.value = mixedCount.value === 5
  }
}

function checkWordProblem(): void {
  activityFeedback.value = wordProblemCorrect.value ? 'correct' : 'hint'
  activityComplete.value = wordProblemCorrect.value
}

function answerChallenge(choice: string): void {
  if (challengeFeedback.value === 'correct')
    return
  challengeChoice.value = choice
  challengeFeedback.value = choice === currentChallenge.value.answer ? 'correct' : 'hint'
}

function nextChallenge(): void {
  if (challengeFeedback.value !== 'correct')
    return
  if (challengeIndex.value < challengeCount.value - 1) {
    challengeIndex.value += 1
    challengeChoice.value = null
    challengeFeedback.value = 'waiting'
  }
  else {
    stage.value = 'summary'
  }
}

function continueToChallenges(): void {
  if (activityComplete.value)
    stage.value = 'challenge'
}
</script>

<template>
  <section class="overflow-hidden rounded-blob border-2 border-math-line bg-surface shadow-sticker" :aria-label="`${content.title}互动小课`">
    <header class="border-b-2 border-math-line/60 bg-math-soft px-4 py-4 sm:px-6">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <img :src="publicAsset(`/images/characters/${content.character}.png`)" :alt="content.characterName" class="size-14 rounded-2xl border-2 border-white bg-white object-contain shadow-press" width="56" height="56">
          <div>
            <p class="font-body text-xs font-extrabold tracking-[0.14em] text-math-deep uppercase">
              数学第二单元 · 互动小课
            </p><h1 class="mt-0.5 font-display text-xl text-ink sm:text-2xl">
              {{ content.title }}
            </h1>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <KTag tone="math" size="sm">
            约 8 分钟
          </KTag><KButton variant="ghost" size="sm" @click="emit('back')">
            回到数学大纲
          </KButton>
        </div>
      </div>
      <div class="mt-4 flex items-center justify-between gap-3">
        <p class="font-body text-xs font-bold text-math-deep">
          {{ stage === 'intro' ? '故事和快测' : stage === 'activity' ? '动手体验' : stage === 'challenge' ? `挑战 ${challengeIndex + 1} / ${challengeCount}` : '学习总结' }}
        </p><span class="font-numeric text-xs font-bold text-ink-faint">{{ progress }}%</span>
      </div>
      <div
        class="mt-2 h-2 overflow-hidden rounded-chip bg-white/80"
        role="progressbar"
        :aria-valuenow="progress"
        :aria-valuemin="0"
        :aria-valuemax="100"
        aria-label="互动小课进度"
      >
        <div class="h-full rounded-chip bg-math-deep transition-[width] duration-300" :style="{ width: `${progress}%` }" />
      </div>
    </header>

    <div class="p-4 sm:p-6">
      <template v-if="stage === 'intro'">
        <div class="grid gap-5 lg:grid-cols-[minmax(0,1fr)_15rem]">
          <div>
            <KTag tone="explore" size="sm">
              故事任务 · {{ content.story }}
            </KTag><h2 class="mt-3 font-display text-2xl text-ink">
              {{ content.focus }}
            </h2><p class="mt-2 font-body text-sm text-ink-soft">
              先试着回答一个小问题。答错会有线索，再想一次就好。
            </p>
            <div class="mt-5 rounded-card border-2 border-line bg-paper p-4">
              <p class="font-body text-sm font-bold leading-relaxed text-ink">
                {{ content.diagnostic.prompt }}
              </p><div class="mt-3 flex flex-wrap gap-2">
                <button
                  v-for="choice in content.diagnostic.choices"
                  :key="choice"
                  type="button"
                  class="fx-pressable min-h-11 rounded-chip border-2 px-4 font-display text-base"
                  :class="diagnosticCorrect && choice === content.diagnostic.answer ? 'border-success bg-success-soft text-success-deep' : diagnosticAnswer === choice && !diagnosticCorrect ? 'border-gently bg-gently-soft text-ink' : 'border-line bg-white text-ink hover:border-math-deep'"
                  :aria-pressed="diagnosticAnswer === choice"
                  @click="setDiagnostic(choice)"
                >
                  {{ choice }}
                </button>
              </div><p v-if="diagnosticAnswer && !diagnosticCorrect" class="mt-2 font-body text-xs text-ink-soft" aria-live="polite">
                线索：{{ content.diagnostic.hint }} 再试试。
              </p><p v-else-if="diagnosticCorrect" class="mt-2 font-body text-xs font-bold text-success-deep" aria-live="polite">
                观察得真仔细！
              </p>
            </div>
          </div>
          <aside class="flex flex-col items-center justify-center rounded-card border-2 border-line bg-paper p-4 text-center">
            <img :src="publicAsset(`/images/characters/${content.character}.png`)" :alt="`${content.characterName}来帮忙`" class="h-32 w-full object-contain" width="128" height="128"><p class="mt-2 font-display text-lg text-ink">
              {{ content.characterName }}的任务
            </p><p class="mt-1 font-body text-xs leading-relaxed text-ink-soft">
              看数量 · 看变化 · 说出算式
            </p>
          </aside>
        </div>
        <div class="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
          <p class="font-body text-xs text-ink-faint">
            【家长提示】让孩子先解释想法，再帮助他观察故事里的数量变化。
          </p><KButton variant="primary" tone="math" :disabled="!diagnosticCorrect" @click="startActivity">
            开始动手 <KIcon name="arrow-right" size="sm" />
          </KButton>
        </div>
      </template>

      <template v-else-if="stage === 'activity'">
        <KTag tone="think" size="sm">
          互动操作 · {{ content.characterName }}陪你想
        </KTag>

        <div v-if="content.activity === 'count'" class="mx-auto mt-4 max-w-3xl rounded-card border-2 border-line bg-paper p-5">
          <h2 class="font-display text-xl text-ink">
            数字小路上有 7 颗石子，点一点，每颗数一次
          </h2><p class="mt-1 font-body text-sm text-ink-soft">
            从 1 开始按顺序点数，不要漏掉，也不要重复数。
          </p>
          <div class="mt-4 flex flex-wrap justify-center gap-2">
            <button
              v-for="index in 7"
              :key="index"
              type="button"
              class="fx-pressable grid size-14 place-items-center rounded-tile border-2 font-display text-xl"
              :class="countedItems.includes(index) ? 'border-success bg-success-soft text-success-deep' : 'border-line bg-white text-ink hover:border-math-deep'"
              :aria-pressed="countedItems.includes(index)"
              :aria-label="`第 ${index} 颗石子`"
              @click="toggleRemovedItem(index)"
            >
              {{ countedItems.includes(index) ? index : '🪨' }}
            </button>
          </div>
          <p class="mt-3 text-center font-body text-sm text-ink-soft">
            已数 {{ countedItems.length }} / 7 · 说一说 7 的前一个数和后一个数。
          </p>
          <p v-if="countedItems.length === 7" class="mt-3 rounded-tile bg-success-soft p-3 text-center font-body text-sm font-bold text-success-deep" aria-live="polite">
            一共有 7 颗石子；7 的前面是 6，后面是 8。
          </p>
        </div>

        <div v-else-if="content.activity === 'compare'" class="mx-auto mt-4 max-w-3xl rounded-card border-2 border-line bg-paper p-5">
          <h2 class="font-display text-xl text-ink">
            把 6 和 8 放在数字跑道上，选出正确的关系
          </h2><p class="mt-1 font-body text-sm text-ink-soft">
            6 在左边，8 在右边。中间应该放哪个符号？
          </p>
          <div class="mt-5 flex items-center justify-center gap-5">
            <span class="grid size-16 place-items-center rounded-tile bg-math-soft font-numeric text-3xl font-black text-math-deep">6</span><span class="font-display text-2xl text-ink">□</span><span class="grid size-16 place-items-center rounded-tile bg-math-soft font-numeric text-3xl font-black text-math-deep">8</span>
          </div>
          <div class="mt-4 flex justify-center gap-3">
            <button
              v-for="sign in ['<', '>', '=']"
              :key="sign"
              type="button"
              class="fx-pressable grid size-14 place-items-center rounded-tile border-2 font-display text-2xl"
              :class="selectedCompare === sign ? sign === '<' ? 'border-success bg-success-soft text-success-deep' : 'border-gently bg-gently-soft text-ink' : 'border-line bg-white text-ink'"
              :aria-pressed="selectedCompare === sign"
              @click="selectCompare(sign)"
            >
              {{ sign }}
            </button>
          </div>
          <p v-if="activityFeedback === 'hint'" class="mt-3 text-center font-body text-sm text-ink-soft" aria-live="polite">
            沿着跑道从左往右看，较大的数在右边。再试一次。
          </p><p v-else-if="activityComplete" class="mt-3 text-center font-body text-sm font-bold text-success-deep" aria-live="polite">
            6＜8，8 比 6 大。
          </p>
        </div>

        <div v-else-if="content.activity === 'take-away'" class="mx-auto mt-4 max-w-3xl rounded-card border-2 border-line bg-paper p-5">
          <h2 class="font-display text-xl text-ink">
            8 个苹果，点击拿走 3 个
          </h2><p class="mt-1 font-body text-sm text-ink-soft">
            每点一个就说“少一个”，点满 3 个后数一数还剩多少。
          </p>
          <div class="mt-4 flex flex-wrap justify-center gap-2">
            <button
              v-for="index in 8"
              :key="index"
              type="button"
              class="fx-pressable grid size-14 place-items-center rounded-tile border-2 text-2xl"
              :class="removedItems.includes(index) ? 'border-gently bg-gently-soft opacity-60' : 'border-line bg-white hover:border-math-deep'"
              :aria-pressed="removedItems.includes(index)"
              :aria-label="`第 ${index} 个苹果${removedItems.includes(index) ? '已拿走' : '还在'}`"
              @click="toggleRemovedItem(index)"
            >
              {{ removedItems.includes(index) ? '—' : '🍎' }}
            </button>
          </div>
          <p class="mt-3 text-center font-body text-sm text-ink-soft">
            已拿走 {{ removedItems.length }} / 3 · 还剩 {{ 8 - removedItems.length }}
          </p><p v-if="selectedAllRemoved" class="mt-2 text-center font-body text-sm font-bold text-success-deep" aria-live="polite">
            8－3＝5，还剩 5 个苹果。
          </p>
        </div>

        <div v-else-if="content.activity === 'chain-add'" class="mx-auto mt-4 max-w-3xl rounded-card border-2 border-line bg-paper p-5">
          <h2 class="font-display text-xl text-ink">
            池塘里先有 2 只鸭子，又游来 3 只，再游来 2 只
          </h2><p class="mt-1 font-body text-sm text-ink-soft">
            每次只处理一个变化，更新池塘里的总数。
          </p><div class="mt-5 flex flex-wrap items-center justify-center gap-2 text-3xl">
            <span v-for="index in chainCount" :key="index">🦆</span>
          </div><p class="mt-3 text-center font-display text-lg text-ink">
            当前有 {{ chainCount }} 只
          </p><div class="mt-4 flex justify-center">
            <KButton v-if="chainStep < 2" variant="primary" tone="math" @click="advanceChain">
              {{ chainStep === 0 ? '又游来 3 只，接着数' : '再游来 2 只，接着数' }} <KIcon name="arrow-right" size="sm" />
            </KButton><p v-else class="font-body text-sm font-bold text-success-deep" aria-live="polite">
              2＋3＝5，5＋2＝7。每次从左往右算。
            </p>
          </div>
        </div>

        <div v-else-if="content.activity === 'mixed'" class="mx-auto mt-4 max-w-3xl rounded-card border-2 border-line bg-paper p-5">
          <h2 class="font-display text-xl text-ink">
            笔筒里有 6 支笔，买来 2 支，再送出 3 支
          </h2><p class="mt-1 font-body text-sm text-ink-soft">
            按故事顺序操作，每次变化后重新看总数。
          </p><div class="mt-5 flex flex-wrap items-center justify-center gap-2 text-3xl">
            <span v-for="index in mixedCount" :key="index">✏️</span>
          </div><p class="mt-3 text-center font-display text-lg text-ink">
            现在有 {{ mixedCount }} 支
          </p><div class="mt-4 flex justify-center">
            <KButton v-if="mixedStep < 2" variant="primary" tone="math" @click="advanceMixed">
              {{ mixedStep === 0 ? '买来 2 支：加上' : '送出 3 支：减去' }} <KIcon name="arrow-right" size="sm" />
            </KButton><p v-else class="font-body text-sm font-bold text-success-deep" aria-live="polite">
              6＋2＝8，8－3＝5。现在有 5 支笔。
            </p>
          </div>
        </div>

        <div v-else class="mx-auto mt-4 max-w-3xl rounded-card border-2 border-line bg-paper p-5">
          <h2 class="font-display text-xl text-ink">
            树上有 6 只鸟，又飞来 3 只。现在有几只？
          </h2><p class="mt-1 font-body text-sm text-ink-soft">
            先说出题目里的已知数量，再判断变化和问题。
          </p>
          <div class="mt-4 grid gap-2 sm:grid-cols-3">
            <div class="rounded-tile bg-white p-3 text-center">
              <p class="font-body text-xs text-ink-faint">
                原来
              </p><p class="mt-1 font-display text-lg text-ink">
                6 只鸟
              </p>
            </div><div class="rounded-tile bg-white p-3 text-center">
              <p class="font-body text-xs text-ink-faint">
                变化
              </p><p class="mt-1 font-display text-lg text-ink">
                又飞来 3 只
              </p>
            </div><div class="rounded-tile bg-white p-3 text-center">
              <p class="font-body text-xs text-ink-faint">
                问题
              </p><p class="mt-1 font-display text-lg text-ink">
                现在几只？
              </p>
            </div>
          </div>
          <p class="mt-4 font-body text-sm font-bold text-ink">
            先选运算，再选得数
          </p><div class="mt-2 flex gap-2">
            <button
              v-for="sign in ['+', '−']"
              :key="sign"
              type="button"
              class="fx-pressable grid size-12 place-items-center rounded-tile border-2 font-display text-2xl"
              :class="wordOperation === sign ? 'border-math-deep bg-math-soft text-math-deep' : 'border-line bg-white'"
              :aria-pressed="wordOperation === sign"
              @click="wordOperation = sign; activityFeedback = 'waiting'"
            >
              {{ sign }}
            </button>
          </div><div class="mt-2 flex flex-wrap gap-2">
            <button
              v-for="number in ['8', '9', '10']"
              :key="number"
              type="button"
              class="fx-pressable grid size-12 place-items-center rounded-tile border-2 font-numeric text-xl font-bold"
              :class="wordAnswer === number ? 'border-math-deep bg-math-soft text-math-deep' : 'border-line bg-white'"
              :aria-pressed="wordAnswer === number"
              @click="wordAnswer = number; activityFeedback = 'waiting'"
            >
              {{ number }}
            </button>
          </div><KButton class="mt-3" variant="primary" tone="math" :disabled="!wordOperation || !wordAnswer" @click="checkWordProblem">
            检查
          </KButton><p v-if="activityFeedback === 'hint'" class="mt-2 font-body text-sm text-ink-soft" aria-live="polite">
            又飞来表示合起来。再看看 6 和 3 一共有多少。
          </p><p v-else-if="activityComplete" class="mt-2 font-body text-sm font-bold text-success-deep" aria-live="polite">
            6＋3＝9（只）。答案要说明单位是“只”。
          </p>
        </div>

        <div class="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
          <p class="font-body text-xs text-ink-faint">
            【家长提示】请孩子先说出每一步数量变化，再点选或操作。
          </p><KButton variant="primary" tone="math" :disabled="!activityComplete" @click="continueToChallenges">
            继续挑战 <KIcon name="arrow-right" size="sm" />
          </KButton>
        </div>
      </template>

      <template v-else-if="stage === 'challenge'">
        <div class="flex flex-wrap items-end justify-between gap-3">
          <div>
            <KTag tone="think" size="sm">
              新变式 · {{ content.characterName }}陪你练
            </KTag><h2 class="mt-2 font-display text-2xl text-ink">
              第 {{ challengeIndex + 1 }} / {{ challengeCount }} 题
            </h2>
          </div><KTag tone="success" size="sm">
            答对后再继续
          </KTag>
        </div>
        <div class="mx-auto mt-5 max-w-2xl rounded-card border-2 border-line bg-paper p-5">
          <p class="font-display text-xl leading-relaxed text-ink">
            {{ currentChallenge.prompt }}
          </p><div class="mt-4 grid grid-cols-2 gap-2">
            <button
              v-for="choice in currentChallenge.choices"
              :key="choice"
              type="button"
              class="fx-pressable min-h-14 rounded-tile border-2 px-3 py-2 font-display text-base"
              :class="challengeFeedback === 'correct' && choice === currentChallenge.answer ? 'border-success bg-success-soft text-success-deep' : challengeChoice === choice && challengeFeedback === 'hint' ? 'border-gently bg-gently-soft text-ink' : 'border-line bg-white text-ink hover:border-math-deep'"
              :disabled="challengeFeedback === 'correct'"
              @click="answerChallenge(choice)"
            >
              {{ choice }}
            </button>
          </div><p v-if="challengeFeedback === 'hint'" class="mt-3 rounded-tile bg-gently-soft p-3 font-body text-sm text-ink-soft" aria-live="polite">
            再找一条线索：{{ currentChallenge.hint }}
          </p><div v-else-if="challengeFeedback === 'correct'" class="mt-3 rounded-tile bg-success-soft p-3" aria-live="polite">
            <p class="font-display text-base text-success-deep">
              答对啦！
            </p><p class="mt-1 font-body text-sm text-ink-soft">
              {{ currentChallenge.explanation }}
            </p><KButton class="mt-3" variant="primary" tone="math" @click="nextChallenge">
              {{ challengeIndex + 1 < challengeCount ? '下一题' : '完成挑战' }} <KIcon name="arrow-right" size="sm" />
            </KButton>
          </div>
        </div>
      </template>

      <template v-else>
        <div class="mx-auto max-w-3xl py-4 text-center">
          <span class="mx-auto grid size-16 place-items-center rounded-full border-4 border-star-line bg-star-soft text-star-deep"><KIcon name="check" size="2xl" /></span><KTag class="mt-4" tone="success" size="sm">
            互动小课完成
          </KTag><h2 class="mt-3 font-display text-3xl text-ink">
            每一步都数清楚啦！
          </h2><p class="mx-auto mt-2 max-w-2xl font-body text-sm leading-relaxed text-ink-soft">
            你练习了{{ content.title }}的方法，完成 3 道新变式。接下来继续做该知识点已有的原题和拓展题；星星奖励会在练习结算时出现。
          </p><div class="mt-5 rounded-card border-2 border-math-line bg-math-soft/60 p-4 text-left">
            <p class="font-display text-base text-ink">
              家庭小游戏 · 5 分钟
            </p><p class="mt-1 font-body text-sm leading-relaxed text-ink-soft">
              {{ content.homeGame }}
            </p>
          </div><div class="mt-6 flex flex-wrap justify-center gap-3">
            <KButton variant="ghost" @click="emit('back')">
              稍后练习
            </KButton><KButton size="lg" variant="primary" tone="math" @click="emit('continue')">
              进入{{ content.title }}练习 <KIcon name="arrow-right" size="sm" />
            </KButton>
          </div>
        </div>
      </template>
    </div>
  </section>
</template>
