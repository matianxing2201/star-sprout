<script setup lang="ts">
import { computed, ref } from 'vue'

import { grade1ChineseQuestionBank as bank } from '@/content/grades/grade-1/chinese-question-bank'
import { publicAsset } from '@/shared/utils'
import { KButton, KIcon, KTag } from '@/ui'

type LessonId = 'cnc_p009' | 'cnc_p010' | 'cnc_p011' | 'cnc_p012'
interface QuizItem { prompt: string, choices: string[], answer: string, hint: string, explanation: string }
interface DiagnosticItem { prompt: string, choices: string[], answer: string, hint: string }
interface ActionItem { prompt: string, choices: string[], answer: string, hint: string }

const props = defineProps<{ pointId: LessonId }>()
const emit = defineEmits<{ cancel: [], practiceOriginals: [] }>()

const curriculum = {
  cnc_p009: {
    title: '单韵母 i、u、ü',
    theme: '衣、乌、鱼来参加拼音变装舞会',
    story: '三位韵母朋友的声音卡片混在一起了。帮衣、乌、鱼找到各自的拼音名字。',
    focus: '认识 i、u、ü 的字形和读音，特别留意 u 上面有没有两点。',
    cards: [
      { icon: '👕', name: 'i', detail: '衣的韵母是 i。嘴角自然展开，声音短而清楚。' },
      { icon: '☂️', name: 'u', detail: '乌的韵母是 u。双唇收圆，头顶没有两点。' },
      { icon: '🐟', name: 'ü', detail: '鱼的韵母是 ü。双唇收圆，舌位像读 i；字母上有两点。' },
    ],
    diagnostic: [
      { prompt: '“衣”的韵母是哪一个？', choices: ['i', 'u', 'ü'], answer: 'i', hint: '想想衣服卡片上的字母。' },
      { prompt: '“乌”的韵母是哪一个？', choices: ['ü', 'u', 'i'], answer: 'u', hint: '乌的 u 上面没有两点。' },
      { prompt: '“鱼”的韵母是哪一个？', choices: ['i', 'ü', 'u'], answer: 'ü', hint: '鱼的韵母上面有两点。' },
    ],
    activity: 'match' as const,
    actionItems: [
      { prompt: '“衣”的韵母是哪一个？', choices: ['i', 'u', 'ü', 'o'], answer: 'i', hint: '衣服小卡片提示了它的名字。' },
      { prompt: '“乌”的韵母是哪一个？', choices: ['u', 'ü', 'i', 'e'], answer: 'u', hint: '观察 u：它上面没有两点。' },
      { prompt: '“鱼”的韵母是哪一个？', choices: ['ü', 'u', 'i', 'a'], answer: 'ü', hint: '鱼的拼音韵母上面有两点。' },
    ] satisfies ActionItem[],
    challenges: [
      { prompt: '哪一个韵母头顶有两点？', choices: ['i', 'u', 'ü', 'a'], answer: 'ü', hint: '再看看小鱼卡片。', explanation: 'ü 的上面有两点。' },
      { prompt: '“乌”应该选哪一个韵母？', choices: ['i', 'u', 'ü', 'o'], answer: 'u', hint: '乌的韵母没有两点。', explanation: '乌的韵母是 u。' },
      { prompt: '“衣”的韵母是什么？', choices: ['ü', 'i', 'u', 'e'], answer: 'i', hint: '衣的读音开头就是韵母 i。', explanation: '衣的韵母是 i。' },
      { prompt: '“鱼”的韵母是什么？', choices: ['i', 'u', 'ü', 'a'], answer: 'ü', hint: '找上面有两点的字母。', explanation: '鱼的韵母是 ü。' },
      { prompt: '哪一组全是单韵母？', choices: ['b、p、m', 'i、u、ü', 'zh、ch、sh', 'ai、ei、ui'], answer: 'i、u、ü', hint: '单韵母是一个字母组成的韵母。', explanation: 'i、u、ü 都是单韵母。' },
      { prompt: '读 ü 时，哪一个观察最有用？', choices: ['看它有没有声调', '看它上面两点并收圆嘴唇', '把它读成 u', '把两点擦掉'], answer: '看它上面两点并收圆嘴唇', hint: '两点是 ü 的重要记号。', explanation: 'ü 有两点，发音时双唇收圆。' },
    ] satisfies QuizItem[],
  },
  cnc_p010: {
    title: '声母 b、p、m、f',
    theme: '巡逻队出发前做“气流侦察”',
    story: '小队要分辨 b 和 p 的气流，再听清 m、f 的开头声音，才能把词语送到正确的路牌。',
    focus: '认读 b、p、m、f；用手掌或轻纸条感觉 p 的送气比 b 明显。',
    cards: [
      { icon: '🛞', name: 'b', detail: '嘴唇先合上，再轻轻打开；发 b 时送出的气流较弱。' },
      { icon: '🚀', name: 'p', detail: '嘴唇先合上，再打开；发 p 时会有明显的一股气。' },
      { icon: '🍜', name: 'm', detail: '双唇合拢，让声音从鼻子里出来。' },
      { icon: '🌬️', name: 'f', detail: '上牙轻轻碰下唇，气流从唇齿之间出来。' },
    ],
    diagnostic: [
      { prompt: '“八”的声母是哪一个？', choices: ['b', 'p', 'm', 'f'], answer: 'b', hint: '八读 bā，嘴唇轻轻打开。' },
      { prompt: '“爬”的声母是哪一个？', choices: ['b', 'p', 'm', 'f'], answer: 'p', hint: '爬读 pá，开头有较明显气流。' },
      { prompt: '“妈”的声母是哪一个？', choices: ['b', 'p', 'm', 'f'], answer: 'm', hint: '读 m 时双唇合拢。' },
    ],
    activity: 'air' as const,
    actionItems: [
      { prompt: '家长带孩子把手掌放在嘴前，分别读 b、p。气流更明显的是？', choices: ['b', 'p'], answer: 'p', hint: '不需要用力吹；比较轻轻读时哪一下更有气。' },
      { prompt: '读“妈”时，开头双唇会怎样？', choices: ['先合拢', '张得很大', '牙齿咬住舌尖', '舌尖顶住上齿'], answer: '先合拢', hint: '试着闭上嘴唇再发 m。' },
      { prompt: '发 f 时，口型更像哪一种？', choices: ['双唇合拢', '上牙轻碰下唇', '嘴唇收圆', '舌尖顶上齿'], answer: '上牙轻碰下唇', hint: '观察上牙和下唇的接触位置。' },
    ] satisfies ActionItem[],
    challenges: [
      { prompt: '“八”的声母是？', choices: ['b', 'p', 'm', 'f'], answer: 'b', hint: '八读 bā。', explanation: '八的声母是不送气的 b。' },
      { prompt: '“爬”的声母是？', choices: ['p', 'b', 'f', 'm'], answer: 'p', hint: '爬读 pá，比较一下气流。', explanation: '爬的声母是送气的 p。' },
      { prompt: '读 b 和 p 时，哪一个送气更明显？', choices: ['b', 'p', '一样明显', '都没有声音'], answer: 'p', hint: '把手放在嘴前轻轻试读。', explanation: 'p 是送气音，气流比 b 明显。' },
      { prompt: '“妈”的声母是？', choices: ['b', 'p', 'm', 'f'], answer: 'm', hint: 'm 发音时双唇合拢。', explanation: '妈 mā 的声母是 m。' },
      { prompt: '“发”的声母是？', choices: ['f', 'b', 'p', 'm'], answer: 'f', hint: '发 fā 的开头是唇齿音。', explanation: '发的声母是 f。' },
      { prompt: '上牙轻轻碰下唇，常用来帮助读准哪个声母？', choices: ['m', 'f', 'b', 'p'], answer: 'f', hint: '试着做一次轻轻的唇齿接触。', explanation: '读 f 时上牙轻碰下唇。' },
    ] satisfies QuizItem[],
  },
  cnc_p011: {
    title: '声母 d、t、n、l',
    theme: '小队沿着舌尖线索找路标',
    story: '地图上的 d/t 和 n/l 路标很像。跟着舌尖动作和鼻子的小线索，把每个开头音送回正确位置。',
    focus: '认读 d、t、n、l；感受 t 比 d 送气明显，并区分 n、l 的发音。',
    cards: [
      { icon: '🥁', name: 'd', detail: '舌尖轻触上齿龈，发音时气流较弱。' },
      { icon: '🚂', name: 't', detail: '舌尖位置和 d 相近，发音时送气更明显。' },
      { icon: '👃', name: 'n', detail: '舌尖轻触上齿龈，声音从鼻腔出来；可轻触鼻翼感受振动。' },
      { icon: '👅', name: 'l', detail: '舌尖轻触上齿龈，声音从舌头两侧出来。' },
    ],
    diagnostic: [
      { prompt: '“大”的声母是哪一个？', choices: ['d', 't', 'n', 'l'], answer: 'd', hint: '大读 dà，开头气流较弱。' },
      { prompt: '“兔”的声母是哪一个？', choices: ['d', 't', 'n', 'l'], answer: 't', hint: '兔读 tù，开头送气明显。' },
      { prompt: '“你”的声母是哪一个？', choices: ['n', 'l', 'd', 't'], answer: 'n', hint: '发 n 时鼻翼附近能感觉到振动。' },
    ],
    activity: 'air' as const,
    actionItems: [
      { prompt: '手掌放嘴前轻轻读 d、t。哪一个送气更明显？', choices: ['d', 't'], answer: 't', hint: '比较两次轻读的气流，不要刻意大力吹。' },
      { prompt: '轻触鼻翼读 n、l。哪一个鼻翼振动更明显？', choices: ['n', 'l'], answer: 'n', hint: 'n 的气流会经过鼻腔。' },
      { prompt: '读“拉”时，开头是 n 还是 l？', choices: ['n', 'l'], answer: 'l', hint: '舌头两侧放气的是 l。' },
    ] satisfies ActionItem[],
    challenges: [
      { prompt: '“大”的声母是？', choices: ['d', 't', 'n', 'l'], answer: 'd', hint: '大读 dà。', explanation: '大的声母是不送气的 d。' },
      { prompt: '“兔”的声母是？', choices: ['d', 't', 'n', 'l'], answer: 't', hint: '兔读 tù，开头送气。', explanation: '兔的声母是送气的 t。' },
      { prompt: 'd 和 t 相比，哪个送气更明显？', choices: ['d', 't', '一样明显', '都不送气'], answer: 't', hint: '可以手掌放在嘴前比较。', explanation: 't 是送气音，气流较明显。' },
      { prompt: '“你”的声母是？', choices: ['l', 'd', 'n', 't'], answer: 'n', hint: 'n 发音时可以感受鼻腔振动。', explanation: '你的声母是 n。' },
      { prompt: '“拉”的声母是？', choices: ['n', 'd', 't', 'l'], answer: 'l', hint: '想想发音时气流从舌头哪边出来。', explanation: '拉的声母是 l。' },
      { prompt: '发 n 时，哪种感觉更有帮助？', choices: ['鼻翼有轻微振动', '嘴唇收成圆形', '上牙碰下唇', '把声音拉长'], answer: '鼻翼有轻微振动', hint: '轻轻读 n 并触摸鼻翼。', explanation: 'n 是鼻音，鼻翼附近能感到振动。' },
    ] satisfies QuizItem[],
  },
  cnc_p012: {
    title: '语文园地二·日积月累《画》',
    theme: '走进安静的画中世界',
    story: '小队来到一幅特别安静的山水画前。读诗找线索，想想为什么山有颜色、水没有声音，花还在、鸟不惊。',
    focus: '按顺序记住《画》的四句诗，并理解诗句写的是一幅画。',
    cards: [
      { icon: '⛰️', name: '远看山有色', detail: '远远望去，山的颜色看得见。' },
      { icon: '💧', name: '近听水无声', detail: '走近听水，却听不到声音。' },
      { icon: '🌸', name: '春去花还在', detail: '春天过去了，画里的花仍然在。' },
      { icon: '🐦', name: '人来鸟不惊', detail: '人走近了，画里的鸟也不会飞走。' },
    ],
    diagnostic: [
      { prompt: '“远看山有色”的下一句是什么？', choices: ['近听水无声', '春去花还在', '人来鸟不惊'], answer: '近听水无声', hint: '按诗句顺序，先看山，再听水。' },
      { prompt: '“春去花还在”的下一句是什么？', choices: ['人来鸟不惊', '远看山有色', '近听水无声'], answer: '人来鸟不惊', hint: '春天过去之后，诗句接着写人和鸟。' },
      { prompt: '为什么画里的水没有声音？', choices: ['因为这是画', '因为山里没有水', '因为下雨了'], answer: '因为这是画', hint: '看看题目《画》告诉我们什么。' },
    ],
    activity: 'poem' as const,
    actionItems: [
      { prompt: '先读第一句，再找它的下一句。', choices: ['近听水无声', '春去花还在', '人来鸟不惊', '远看山有色'], answer: '近听水无声', hint: '远看之后，接着近听。' },
      { prompt: '“近听水无声”之后是哪一句？', choices: ['春去花还在', '人来鸟不惊', '远看山有色', '近听水无声'], answer: '春去花还在', hint: '接下来诗句转到春天和花。' },
      { prompt: '“春去花还在”之后是哪一句？', choices: ['远看山有色', '人来鸟不惊', '近听水无声', '春去花还在'], answer: '人来鸟不惊', hint: '最后写有人走近和鸟。' },
      { prompt: '诗里为什么“人来鸟不惊”？', choices: ['鸟睡着了', '写的是画里的鸟', '人走得很轻', '鸟已经飞走'], answer: '写的是画里的鸟', hint: '画上的鸟不会真的飞走。' },
    ] satisfies ActionItem[],
    challenges: [
      { prompt: '“远看山有色”的下一句是？', choices: ['春去花还在', '近听水无声', '人来鸟不惊', '近看山无色'], answer: '近听水无声', hint: '先看，再听。', explanation: '第二句是“近听水无声”。' },
      { prompt: '“春去花还在”的下一句是？', choices: ['近听水无声', '远看山有色', '人来鸟不惊', '人来鸟飞走'], answer: '人来鸟不惊', hint: '最后一句写人和鸟。', explanation: '“人来鸟不惊”接在后面。' },
      { prompt: '画里的水为什么没有声音？', choices: ['因为水不流动', '因为画上的水不会发声', '因为山里没有水', '因为水结冰了'], answer: '因为画上的水不会发声', hint: '诗题给了一个重要线索。', explanation: '这是画中的水，不是真正流动的水。' },
      { prompt: '画里的鸟为什么不惊？', choices: ['因为鸟躲起来了', '因为鸟不会动', '因为画上的鸟不会被人吓飞', '因为没有人来'], answer: '因为画上的鸟不会被人吓飞', hint: '想想画上的鸟和真的鸟有什么不同。', explanation: '画中的鸟不会因为人走来而飞走。' },
      { prompt: '这首诗写的是什么？', choices: ['一幅画', '一场大雨', '一群大雁', '一面国旗'], answer: '一幅画', hint: '山有色、水无声、花还在、鸟不惊，说明了什么？', explanation: '四句诗写的是一幅山水画。' },
      { prompt: '诗句正确的最后一句是？', choices: ['人来鸟飞走', '人来鸟不惊', '人来花不在', '人来水有声'], answer: '人来鸟不惊', hint: '原句说鸟没有受惊。', explanation: '最后一句是“人来鸟不惊”。' },
    ] satisfies QuizItem[],
  },
} satisfies Record<LessonId, {
  title: string
  theme: string
  story: string
  focus: string
  cards: Array<{ icon: string, name: string, detail: string }>
  diagnostic: DiagnosticItem[]
  activity: 'match' | 'air' | 'poem'
  actionItems: ActionItem[]
  challenges: QuizItem[]
}>

const config = computed(() => curriculum[props.pointId])
const point = computed(() => bank.units.find(unit => unit.order === 2)!.knowledgePoints.find(item => item.id === props.pointId)!)
const illustrationUrl = computed(() => publicAsset(point.value.questions[0]!.illustration.replace(/^\//, '')))
const step = ref(0)
const diagnosticAnswers = ref<Record<number, boolean>>({})
const activityIndex = ref(0)
const activityAnswer = ref<string | null>(null)
const activityStatus = ref<'waiting' | 'hint' | 'correct'>('waiting')
const activityDone = ref<number[]>([])
const challengeIndex = ref(0)
const challengeAnswer = ref<string | null>(null)
const challengeStatus = ref<'waiting' | 'hint' | 'correct'>('waiting')
const challengeDone = ref<number[]>([])
const currentActivity = computed(() => config.value.actionItems[activityIndex.value]!)
const currentChallenge = computed(() => config.value.challenges[challengeIndex.value]!)
const allDiagnosticCorrect = computed(() => config.value.diagnostic.every((_, index) => diagnosticAnswers.value[index] === true))
const canContinue = computed(() => step.value === 0 ? allDiagnosticCorrect.value : step.value === 1 ? true : step.value === 2 ? activityDone.value.length === config.value.actionItems.length : step.value === 3 ? challengeDone.value.length === config.value.challenges.length : true)
const lessons = ['出发侦察', '发现知识', '动手体验', '挑战巩固', '学习总结']

function checkDiagnostic(questionIndex: number, choice: string, answer: string): void {
  diagnosticAnswers.value[questionIndex] = choice === answer
}

function answerActivity(choice: string): void {
  if (activityStatus.value === 'correct')
    return
  activityAnswer.value = choice
  activityStatus.value = choice === currentActivity.value.answer ? 'correct' : 'hint'
}

function completeActivity(): void {
  if (activityStatus.value !== 'correct')
    return
  if (!activityDone.value.includes(activityIndex.value))
    activityDone.value.push(activityIndex.value)
  if (activityIndex.value < config.value.actionItems.length - 1) {
    activityIndex.value += 1
    activityAnswer.value = null
    activityStatus.value = 'waiting'
  }
  else {
    step.value = 3
  }
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
  if (!challengeDone.value.includes(challengeIndex.value))
    challengeDone.value.push(challengeIndex.value)
  if (challengeIndex.value < config.value.challenges.length - 1) {
    challengeIndex.value += 1
    challengeAnswer.value = null
    challengeStatus.value = 'waiting'
  }
  else {
    step.value = 4
  }
}

function advance(): void {
  if (canContinue.value && step.value < 3)
    step.value += 1
}
</script>

<template>
  <section class="overflow-hidden rounded-blob border-2 border-language-line bg-surface shadow-sticker" :aria-label="`${config.title}互动小课`">
    <header class="border-b-2 border-language-line/60 bg-language-soft px-4 py-4 sm:px-6">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <img :src="illustrationUrl" :alt="`${config.title}的原题插画`" class="size-14 rounded-2xl border-2 border-white object-cover shadow-press" width="640" height="640">
          <div>
            <p class="font-body text-xs font-extrabold tracking-[0.14em] text-language-deep uppercase">
              第二单元 · 互动小课
            </p>
            <h3 class="mt-0.5 font-display text-xl text-ink sm:text-2xl">
              {{ config.title }}
            </h3>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <KTag tone="language" size="sm">
            约 12 分钟
          </KTag>
          <KButton variant="ghost" size="sm" @click="emit('cancel')">
            返回题目
          </KButton>
        </div>
      </div>
      <div class="mt-4 flex items-center justify-between gap-3">
        <p class="font-body text-xs font-bold text-language-deep">
          第 {{ step + 1 }} / {{ lessons.length }} 步 · {{ lessons[step] }}
        </p>
        <p class="font-numeric text-xs font-bold text-ink-faint">
          {{ Math.round((step + 1) / lessons.length * 100) }}%
        </p>
      </div>
      <div class="mt-2 h-2 overflow-hidden rounded-chip bg-white/80" role="progressbar" :aria-valuenow="step + 1" :aria-valuemin="1" :aria-valuemax="lessons.length">
        <div class="h-full rounded-chip bg-language-deep transition-[width] duration-300" :style="{ width: `${((step + 1) / lessons.length) * 100}%` }" />
      </div>
    </header>

    <div class="p-4 sm:p-6">
      <template v-if="step === 0">
        <KTag tone="explore" size="sm">
          故事任务 · {{ config.theme }}
        </KTag>
        <h4 class="mt-3 font-display text-2xl text-ink">
          {{ config.story }}
        </h4>
        <p class="mt-2 font-body text-sm leading-relaxed text-ink-soft">
          先自己试一试。答错会看到线索，可以再想一想、重新选择。
        </p>
        <ol class="mt-5 grid gap-3 md:grid-cols-3">
          <li v-for="(item, index) in config.diagnostic" :key="index" class="rounded-card border-2 border-line bg-paper p-4">
            <p class="font-body text-sm font-bold leading-relaxed text-ink">
              {{ index + 1 }}. {{ item.prompt }}
            </p>
            <div class="mt-3 flex flex-wrap gap-2">
              <button
                v-for="choice in item.choices"
                :key="choice"
                type="button"
                class="fx-pressable min-h-10 rounded-chip border-2 px-3 font-display text-base"
                :class="diagnosticAnswers[index] && choice === item.answer ? 'border-success bg-success-soft text-success-deep' : 'border-line bg-surface text-ink hover:border-language-deep'"
                @click="checkDiagnostic(index, choice, item.answer)"
              >
                {{ choice }}
              </button>
            </div>
            <p v-if="diagnosticAnswers[index] === false" class="mt-2 font-body text-xs text-ink-soft" aria-live="polite">
              {{ item.hint }} 再试一次。
            </p>
            <p v-else-if="diagnosticAnswers[index]" class="mt-2 font-body text-xs font-bold text-success-deep" aria-live="polite">
              找到了！
            </p>
          </li>
        </ol>
      </template>

      <template v-else-if="step === 1">
        <KTag tone="language" size="sm">
          看图发现 · {{ config.focus }}
        </KTag>
        <p class="mt-2 font-body text-sm leading-relaxed text-ink-soft">
          【家长说】我们先看一看，再一起读。不要急着背，观察每个拼音朋友的不同线索。
        </p>
        <div class="mt-5 grid gap-3 sm:grid-cols-2" :class="config.cards.length === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-4'">
          <article v-for="card in config.cards" :key="card.name" class="rounded-card border-2 border-line bg-paper p-4">
            <div class="flex items-center justify-between">
              <span class="font-display text-3xl text-ink">{{ card.name }}</span><span class="text-4xl" aria-hidden="true">{{ card.icon }}</span>
            </div>
            <p class="mt-3 font-body text-sm leading-relaxed text-ink-soft">
              {{ card.detail }}
            </p>
          </article>
        </div>
      </template>

      <template v-else-if="step === 2">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div>
            <KTag tone="think" size="sm">
              {{ config.activity === 'poem' ? '诗句接龙' : config.activity === 'air' ? '口型和气流实验' : '字形配对' }}
            </KTag><h4 class="mt-2 font-display text-xl text-ink">
              {{ currentActivity.prompt }}
            </h4>
          </div>
          <KTag tone="success" size="sm">
            完成 {{ activityDone.length }} / {{ config.actionItems.length }}
          </KTag>
        </div>
        <div class="mx-auto mt-5 max-w-2xl rounded-card border-2 border-line bg-paper p-5">
          <p class="font-body text-sm leading-relaxed text-ink-soft">
            【家长说】{{ currentActivity.prompt }}
          </p>
          <p class="mt-2 rounded-tile bg-language-soft p-3 font-display text-base text-language-deep">
            【孩子操作】{{ config.activity === 'air' ? '先按提示读一读，再选择观察结果。' : config.activity === 'poem' ? '按顺序读一遍，再点下一句。' : '读出提示里的字，再点击对应的韵母。' }}
          </p>
          <div class="mt-4 grid grid-cols-2 gap-2">
            <button
              v-for="choice in currentActivity.choices"
              :key="choice"
              type="button"
              class="fx-pressable min-h-14 rounded-tile border-2 px-3 py-3 font-display text-base"
              :class="activityStatus === 'correct' && choice === currentActivity.answer ? 'border-success bg-success-soft text-success-deep' : activityAnswer === choice && activityStatus === 'hint' ? 'border-gently bg-gently-soft text-ink' : 'border-line bg-surface text-ink hover:border-language-deep'"
              :disabled="activityStatus === 'correct'"
              @click="answerActivity(choice)"
            >
              {{ choice }}
            </button>
          </div>
          <p v-if="activityStatus === 'hint'" class="mt-3 rounded-tile bg-gently-soft p-3 font-body text-sm leading-relaxed text-ink-soft" aria-live="polite">
            小提示：{{ currentActivity.hint }} 再试一次。
          </p>
          <div v-else-if="activityStatus === 'correct'" class="mt-3 rounded-tile bg-success-soft p-3" aria-live="polite">
            <p class="font-display text-base text-success-deep">
              观察到了！
            </p>
            <p class="mt-1 font-body text-sm text-ink-soft">
              {{ currentActivity.answer }}
            </p>
            <KButton class="mt-2" variant="soft" tone="language" @click="completeActivity">
              {{ activityIndex + 1 < config.actionItems.length ? '继续下一步' : '完成互动，去闯关' }} <KIcon name="arrow-right" size="sm" />
            </KButton>
          </div>
        </div>
      </template>

      <template v-else-if="step === 3">
        <div class="flex flex-wrap items-end justify-between gap-3">
          <div>
            <KTag tone="think" size="sm">
              原题之外 · 新变式
            </KTag><h4 class="mt-2 font-display text-2xl text-ink">
              挑战 {{ challengeIndex + 1 }} / {{ config.challenges.length }}
            </h4>
          </div><KTag tone="success" size="sm">
            已完成 {{ challengeDone.length }} 关
          </KTag>
        </div>
        <div class="mx-auto mt-5 max-w-2xl rounded-card border-2 border-line bg-paper p-5">
          <p class="font-display text-xl leading-relaxed text-ink">
            {{ currentChallenge.prompt }}
          </p>
          <div class="mt-4 grid grid-cols-2 gap-2">
            <button
              v-for="choice in currentChallenge.choices"
              :key="choice"
              type="button"
              class="fx-pressable min-h-12 rounded-tile border-2 px-3 py-2 font-display text-sm"
              :class="challengeStatus === 'correct' && choice === currentChallenge.answer ? 'border-success bg-success-soft text-success-deep' : challengeAnswer === choice && challengeStatus === 'hint' ? 'border-gently bg-gently-soft text-ink' : 'border-line bg-surface text-ink hover:border-language-deep'"
              :disabled="challengeStatus === 'correct'"
              @click="answerChallenge(choice)"
            >
              {{ choice }}
            </button>
          </div>
          <p v-if="challengeStatus === 'hint'" class="mt-3 rounded-tile bg-gently-soft p-3 font-body text-sm text-ink-soft" aria-live="polite">
            再找一条线索：{{ currentChallenge.hint }}
          </p>
          <div v-else-if="challengeStatus === 'correct'" class="mt-3 rounded-tile bg-success-soft p-3" aria-live="polite">
            <p class="font-display text-base text-success-deep">
              答对啦！
            </p><p class="mt-1 font-body text-sm text-ink-soft">
              {{ currentChallenge.explanation }}
            </p>
            <KButton class="mt-2" variant="primary" tone="language" @click="nextChallenge">
              {{ challengeIndex + 1 < config.challenges.length ? '下一题' : '完成闯关，查看总结' }} <KIcon name="arrow-right" size="sm" />
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
          <h4 class="mt-3 font-display text-3xl text-ink">
            {{ config.title }}学完啦！
          </h4>
          <p class="mx-auto mt-2 max-w-2xl font-body text-sm leading-relaxed text-ink-soft">
            你完成了课前摸底、知识发现、互动体验和 {{ config.challenges.length }} 道变式题。现在进入原题练习；完成后会看到本知识点的进度、错题回顾和星星反馈。
          </p>
          <div class="mt-5 rounded-card border-2 border-language-line bg-language-soft/60 p-4 text-left">
            <p class="font-display text-base text-ink">
              家庭巩固 · 5 分钟
            </p><p class="mt-1 font-body text-sm leading-relaxed text-ink-soft">
              {{ pointId === 'cnc_p012' ? '家长说出一句诗，孩子接下一句；再一起说说这句在画里看到了什么。' : pointId === 'cnc_p010' ? '用手掌或纸条轻轻比较 b、p 的气流，再读一读妈、发。' : pointId === 'cnc_p011' ? '轻触鼻翼读 n、l，再用手掌比较 d、t。' : '家长说“衣、乌、鱼”，孩子找出对应的 i、u、ü，并说说谁头上有两点。' }}
            </p>
          </div>
          <div class="mt-6 flex flex-wrap justify-center gap-3">
            <KButton variant="ghost" @click="emit('cancel')">
              稍后练原题
            </KButton><KButton size="lg" variant="primary" tone="language" @click="emit('practiceOriginals')">
              开始 {{ point.questions.length }} 道原题 <KIcon name="arrow-right" size="sm" />
            </KButton>
          </div>
        </div>
      </template>

      <footer v-if="step < 2" class="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
        <p class="font-body text-xs text-ink-faint">
          {{ step === 0 ? '这是起点检查，答错可以看提示再试。' : '观察字形、读音和使用情境，发现它们的不同。' }}
        </p>
        <KButton variant="primary" tone="language" :disabled="!canContinue" @click="advance">
          下一步 <KIcon name="arrow-right" size="sm" />
        </KButton>
      </footer>
      <footer v-else-if="step === 2" class="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
        <p class="font-body text-xs text-ink-faint">
          每一步都请孩子先实际说或做，再选择观察结果。
        </p>
        <KButton variant="primary" tone="language" :disabled="!canContinue" @click="advance">
          进入变式挑战 <KIcon name="arrow-right" size="sm" />
        </KButton>
      </footer>
    </div>
  </section>
</template>
