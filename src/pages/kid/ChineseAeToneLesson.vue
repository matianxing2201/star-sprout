<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'

import { publicAsset } from '@/shared/utils'
import { KButton, KIcon, KTag } from '@/ui'

const emit = defineEmits<{
  cancel: []
  practiceOriginals: []
}>()

type Vowel = 'a' | 'o' | 'e'
type Tone = 1 | 2 | 3 | 4
type Step = 0 | 1 | 2 | 3 | 4 | 5

const steps = [
  '出发前小侦察',
  '认识三个韵母',
  '看口型，开口读',
  '声调小火车',
  '拼音探险挑战',
  '收下学习地图',
]

const vowelCards: Array<{
  vowel: Vowel
  mnemonic: string
  mouth: string
  scene: string
  prompt: string
}> = [
  { vowel: 'a', mnemonic: '小朋友张大嘴唱歌', mouth: '嘴巴张开，声音亮亮的', scene: '🎤', prompt: '家长示范“a”，孩子看口型，跟着读一遍。' },
  { vowel: 'o', mnemonic: '大公鸡喔喔叫', mouth: '嘴唇收圆，微微向前', scene: '🐓', prompt: '家长示范“o”，孩子把嘴唇轻轻收圆，再跟读。' },
  { vowel: 'e', mnemonic: '白鹅在水面照镜子', mouth: '嘴唇自然展开，不要收圆', scene: '🦢', prompt: '家长示范“e”，孩子观察嘴唇，再跟读。' },
]

const toneRows: Array<{ vowel: Vowel, forms: [string, string, string, string] }> = [
  { vowel: 'a', forms: ['ā', 'á', 'ǎ', 'à'] },
  { vowel: 'o', forms: ['ō', 'ó', 'ǒ', 'ò'] },
  { vowel: 'e', forms: ['ē', 'é', 'ě', 'è'] },
]

const tones: Array<{ tone: Tone, name: string, gesture: string, path: string, start: number, middle?: number, end: number }> = [
  { tone: 1, name: '第一声', gesture: '手掌平平向前', path: 'M 13 30 L 91 30', start: 300, end: 300 },
  { tone: 2, name: '第二声', gesture: '手从低处往上扬', path: 'M 13 43 L 91 14', start: 210, end: 370 },
  { tone: 3, name: '第三声', gesture: '手先下再往上', path: 'M 13 14 C 31 48, 52 49, 91 17', start: 285, middle: 185, end: 315 },
  { tone: 4, name: '第四声', gesture: '手从高处向下落', path: 'M 13 14 L 91 44', start: 380, end: 205 },
]

const diagnostic = [
  { id: 'vowel-a', prompt: '小朋友唱歌，嘴巴张得大大的。先找哪个韵母？', choices: ['a', 'o', 'e'], answer: 'a', hint: '想想：哪个韵母发音时嘴巴张得比较大？' },
  { id: 'vowel-o', prompt: '读音时嘴唇轻轻收圆，像圆圆的小圈。是哪一个？', choices: ['e', 'o', 'a'], answer: 'o', hint: '试试把嘴唇收圆，再看看三个字母。' },
  { id: 'tone-1', prompt: '声音像平平的滑梯轨道，是第几声？', choices: ['第一声', '第二声', '第三声', '第四声'], answer: '第一声', hint: '第一声平平的，手掌可以平平地伸出去。' },
]

const challenges = [
  { prompt: '嘴巴张开、声音亮亮的韵母是？', choices: ['a', 'o', 'e'], answer: 'a', hint: '回想小朋友唱歌时张开的嘴巴。', explanation: 'a 发音时嘴巴张开。' },
  { prompt: '嘴唇收圆、微微向前，找哪个韵母？', choices: ['e', 'a', 'o'], answer: 'o', hint: '试着把嘴唇轻轻收成圆形。', explanation: 'o 发音时，嘴唇要收圆。' },
  { prompt: '声音从低处往上扬，是第几声？', choices: ['第一声', '第二声', '第三声', '第四声'], answer: '第二声', hint: '第二声像在问“咦？”，声音往上走。', explanation: '第二声由低向高扬起来。' },
  { prompt: '平平的一条线，对应哪个 a？', choices: ['ǎ', 'ā', 'á', 'à'], answer: 'ā', hint: '第一声的声调符号是一条平线。', explanation: 'ā 是第一声，声调符号平平的。' },
  { prompt: '鹅的拼音是 é。它读第几声？', choices: ['第一声', '第二声', '第三声', '第四声'], answer: '第二声', hint: '看看 é 上面的符号：它像向上扬的斜线。', explanation: 'é 上面是第二声符号。' },
  { prompt: '声音先降下来，再转向上，是第几声？', choices: ['第一声', '第二声', '第三声', '第四声'], answer: '第三声', hint: '第三声会先低下去，再往上拐。', explanation: '第三声的音高走向先降再升。' },
]

const step = ref<Step>(0)
const diagnosticResults = ref<Record<string, boolean>>({})
const diagnosticPicks = ref<Record<string, string>>({})
const observedVowels = ref<Vowel[]>([])
const spokenVowels = ref<Vowel[]>([])
const readSyllables = ref<string[]>([])
const selectedVowel = ref<Vowel>('a')
const selectedSyllable = ref('a-1')
const challengeIndex = ref(0)
const challengeAnswer = ref<string | null>(null)
const challengeState = ref<'waiting' | 'hint' | 'correct'>('waiting')
const pitchNote = ref('')
let audioContext: AudioContext | null = null

const currentChallenge = computed(() => challenges[challengeIndex.value]!)
const currentVowel = computed(() => vowelCards.find(card => card.vowel === selectedVowel.value)!)
const selectedTone = computed(() => Number(selectedSyllable.value.slice(-1)) as Tone)
const selectedToneInfo = computed(() => tones.find(item => item.tone === selectedTone.value)!)
const selectedSyllableLabel = computed(() => {
  const row = toneRows.find(item => item.vowel === selectedVowel.value)!
  return row.forms[selectedTone.value - 1]
})
const canContinue = computed(() => {
  if (step.value === 0)
    return diagnostic.every(item => diagnosticResults.value[item.id] === true)
  if (step.value === 1)
    return observedVowels.value.length === vowelCards.length
  if (step.value === 2)
    return spokenVowels.value.length === vowelCards.length
  if (step.value === 3)
    return readSyllables.value.length === 12
  if (step.value === 4)
    return challengeIndex.value === challenges.length - 1 && challengeState.value === 'correct'
  return true
})
const diagnosticScore = computed(() => Object.values(diagnosticResults.value).filter(Boolean).length)
const stepPercent = computed(() => Math.round(((step.value + 1) / steps.length) * 100))

function answerDiagnostic(id: string, picked: string, answer: string): void {
  diagnosticPicks.value[id] = picked
  diagnosticResults.value[id] = picked === answer
}

function toggleObserved(vowel: Vowel): void {
  selectedVowel.value = vowel
  if (!observedVowels.value.includes(vowel))
    observedVowels.value.push(vowel)
}

function confirmVowelRead(): void {
  if (!spokenVowels.value.includes(currentVowel.value.vowel))
    spokenVowels.value.push(currentVowel.value.vowel)
  const next = vowelCards.find(card => !spokenVowels.value.includes(card.vowel))
  if (next)
    selectedVowel.value = next.vowel
}

function selectSyllable(vowel: Vowel, tone: Tone): void {
  selectedVowel.value = vowel
  selectedSyllable.value = `${vowel}-${tone}`
  pitchNote.value = ''
}

function playPitchGuide(): void {
  try {
    audioContext ??= new AudioContext()
    if (audioContext.state === 'suspended')
      void audioContext.resume()

    const context = audioContext
    const tone = selectedToneInfo.value
    const oscillator = context.createOscillator()
    const gain = context.createGain()
    const startAt = context.currentTime + 0.03
    const duration = tone.tone === 3 ? 0.7 : 0.55

    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(tone.start, startAt)
    if (tone.middle !== undefined) {
      oscillator.frequency.linearRampToValueAtTime(tone.middle, startAt + duration * 0.56)
      oscillator.frequency.linearRampToValueAtTime(tone.end, startAt + duration)
    }
    else {
      oscillator.frequency.linearRampToValueAtTime(tone.end, startAt + duration)
    }
    gain.gain.setValueAtTime(0.0001, startAt)
    gain.gain.linearRampToValueAtTime(0.08, startAt + 0.04)
    gain.gain.setValueAtTime(0.08, startAt + duration - 0.08)
    gain.gain.linearRampToValueAtTime(0.0001, startAt + duration)
    oscillator.connect(gain)
    gain.connect(context.destination)
    oscillator.start(startAt)
    oscillator.stop(startAt + duration + 0.02)
    pitchNote.value = `听音高示意：${tone.name}，它只演示声音高低的走向，不是拼音范读。`
  }
  catch {
    pitchNote.value = '这台设备暂时不能播放音高示意。请看声调线，由家长示范读音，孩子跟读。'
  }
}

function confirmSyllableRead(): void {
  if (!readSyllables.value.includes(selectedSyllable.value))
    readSyllables.value.push(selectedSyllable.value)
  const next = toneRows.flatMap(row => row.forms.map((_, index) => `${row.vowel}-${index + 1}`))
    .find(id => !readSyllables.value.includes(id))
  if (next) {
    selectedSyllable.value = next
    selectedVowel.value = next[0] as Vowel
    pitchNote.value = ''
  }
}

function answerChallenge(choice: string): void {
  if (challengeState.value === 'correct')
    return
  challengeAnswer.value = choice
  challengeState.value = choice === currentChallenge.value.answer ? 'correct' : 'hint'
}

function nextChallenge(): void {
  if (challengeState.value !== 'correct')
    return
  if (challengeIndex.value < challenges.length - 1) {
    challengeIndex.value += 1
    challengeAnswer.value = null
    challengeState.value = 'waiting'
    return
  }
  step.value = 5
}

function advance(): void {
  if (!canContinue.value)
    return
  if (step.value < 4) {
    step.value = (step.value + 1) as Step
    return
  }
  step.value = 5
}

onBeforeUnmount(() => {
  if (audioContext && audioContext.state !== 'closed')
    void audioContext.close()
})
</script>

<template>
  <section class="overflow-hidden rounded-blob border-2 border-language-line bg-surface shadow-sticker" aria-label="单韵母 a、o、e 和四声互动小课">
    <header class="border-b-2 border-language-line/60 bg-language-soft px-4 py-4 sm:px-6">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <img :src="publicAsset('images/questions/g1-chinese/cnc_p008_q1.webp')" alt="声音教室的小狗队员" class="size-14 rounded-2xl border-2 border-white object-cover shadow-press" width="640" height="640">
          <div>
            <p class="font-body text-xs font-extrabold tracking-[0.14em] text-language-deep uppercase">
              拼音王国大冒险 · 互动小课
            </p>
            <h3 class="mt-0.5 font-display text-xl text-ink sm:text-2xl">
              单韵母 a、o、e 和四声
            </h3>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <KTag tone="language" size="sm">
            约 18 分钟
          </KTag>
          <KButton variant="ghost" size="sm" @click="emit('cancel')">
            返回题目
          </KButton>
        </div>
      </div>
      <div class="mt-4 flex items-center justify-between gap-3">
        <p class="font-body text-xs font-bold text-language-deep">
          第 {{ step + 1 }} / {{ steps.length }} 步 · {{ steps[step] }}
        </p>
        <p class="font-numeric text-xs font-bold text-ink-faint">
          {{ stepPercent }}%
        </p>
      </div>
      <div
        class="mt-2 h-2 overflow-hidden rounded-chip bg-white/80"
        role="progressbar"
        :aria-valuenow="step + 1"
        :aria-valuemin="1"
        :aria-valuemax="steps.length"
        :aria-label="`互动小课第 ${step + 1} 步，共 ${steps.length} 步`"
      >
        <div class="h-full rounded-chip bg-language-deep transition-[width] duration-300" :style="{ width: `${((step + 1) / steps.length) * 100}%` }" />
      </div>
    </header>

    <div class="p-4 sm:p-6">
      <template v-if="step === 0">
        <div class="grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(16rem,0.85fr)]">
          <div>
            <KTag tone="explore" size="sm">
              故事任务 · 帮拼音朋友找回 12 个声调音符
            </KTag>
            <h4 class="mt-3 font-display text-2xl leading-snug text-ink">
              先来做 3 个小侦察，看看我们从哪里出发
            </h4>
            <p class="mt-2 font-body text-sm leading-relaxed text-ink-soft">
              不会也没关系，狐狸向导会给线索。请家长陪在旁边，鼓励孩子自己观察和开口说。
            </p>
            <ol class="mt-5 grid gap-4">
              <li v-for="(item, index) in diagnostic" :key="item.id" class="rounded-card border-2 border-line bg-paper p-4">
                <p class="font-body text-sm font-bold leading-relaxed text-ink">
                  {{ index + 1 }}. {{ item.prompt }}
                </p>
                <div class="mt-3 flex flex-wrap gap-2">
                  <button
                    v-for="choice in item.choices"
                    :key="choice"
                    type="button"
                    class="fx-pressable min-h-11 rounded-chip border-2 px-4 font-display text-lg transition-colors"
                    :class="diagnosticResults[item.id] && diagnosticPicks[item.id] === choice ? 'border-success bg-success-soft text-success-deep' : diagnosticPicks[item.id] === choice ? 'border-gently bg-gently-soft text-ink' : 'border-line bg-surface text-ink hover:border-language-deep'"
                    :aria-pressed="diagnosticPicks[item.id] === choice"
                    @click="answerDiagnostic(item.id, choice, item.answer)"
                  >
                    {{ choice }}
                  </button>
                </div>
                <p v-if="diagnosticPicks[item.id] && !diagnosticResults[item.id]" class="mt-2 font-body text-xs leading-relaxed text-ink-soft" aria-live="polite">
                  小提示：{{ item.hint }} 再选一次试试。
                </p>
                <p v-else-if="diagnosticResults[item.id]" class="mt-2 font-body text-xs font-bold text-success-deep" aria-live="polite">
                  观察得真仔细！
                </p>
              </li>
            </ol>
            <p class="mt-3 font-body text-xs text-ink-faint">
              小侦察完成 {{ diagnosticScore }} / {{ diagnostic.length }} · 这只是找起点，不是考试。
            </p>
          </div>
          <aside class="flex flex-col items-center justify-center rounded-card border-2 border-line bg-[#fff7ed] p-4 text-center">
            <img
              :src="publicAsset('images/questions/g1-chinese/cnc_p008_q1.webp')"
              alt="题库中声音教室的小狗队员，指向声波线索"
              class="w-full max-w-64 rounded-tile object-cover shadow-press"
              width="640"
              height="640"
              loading="lazy"
            >
            <p class="mt-3 font-display text-lg text-ink">
              向导提醒
            </p>
            <p class="mt-1 max-w-sm font-body text-sm leading-relaxed text-ink-soft">
              先看嘴巴，再听声音，最后自己读出来。图画和曲线只帮我们找线索，发音要靠真正开口练习。
            </p>
          </aside>
        </div>
      </template>

      <template v-else-if="step === 1">
        <div class="flex flex-wrap items-end justify-between gap-3">
          <div>
            <KTag tone="language" size="sm">
              先观察，再说发现
            </KTag>
            <h4 class="mt-2 font-display text-2xl text-ink">
              三位韵母朋友，长得和口型都不一样
            </h4>
          </div>
          <KTag tone="success" size="sm">
            找到 {{ observedVowels.length }} / 3
          </KTag>
        </div>
        <div class="mt-5 grid gap-3 md:grid-cols-3">
          <button
            v-for="card in vowelCards"
            :key="card.vowel"
            type="button"
            class="fx-pressable rounded-card border-2 p-4 text-left shadow-press transition-colors"
            :class="selectedVowel === card.vowel ? 'border-language-deep bg-language-soft' : 'border-line bg-paper hover:border-language-deep'"
            :aria-pressed="selectedVowel === card.vowel"
            @click="toggleObserved(card.vowel)"
          >
            <div class="flex items-center justify-between">
              <span class="grid size-16 place-items-center rounded-full border-2 border-white bg-surface font-display text-5xl text-language-deep shadow-press">{{ card.vowel }}</span>
              <span class="text-4xl" aria-hidden="true">{{ card.scene }}</span>
              <KIcon v-if="observedVowels.includes(card.vowel)" name="check" size="md" tone="success" />
            </div>
            <p class="mt-4 font-display text-base text-ink">
              {{ card.mnemonic }}
            </p>
            <p class="mt-1 font-body text-sm leading-relaxed text-ink-soft">
              {{ card.mouth }}
            </p>
          </button>
        </div>
        <div class="mt-4 rounded-card border-2 border-language-line bg-language-soft/60 p-4" aria-live="polite">
          <p class="font-body text-sm font-bold text-language-deep">
            狐狸向导：{{ currentVowel.prompt }}
          </p>
          <p class="mt-1 font-body text-xs leading-relaxed text-ink-soft">
            家长可按卡片示范普通话读音；每找到一位朋友，就点一下它的卡片。
          </p>
        </div>
      </template>

      <template v-else-if="step === 2">
        <div class="grid gap-5 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:items-center">
          <div class="rounded-card border-2 border-line bg-paper p-5 text-center">
            <p class="font-body text-xs font-extrabold tracking-[0.14em] text-language-deep uppercase">
              轮到你开口
            </p>
            <div class="mt-2 font-display text-8xl leading-none text-language-deep" aria-live="polite">
              {{ currentVowel.vowel }}
            </div>
            <div class="mx-auto mt-5 flex size-32 items-center justify-center rounded-full border-4 border-white bg-[#ffede9] shadow-press" role="img" :aria-label="`${currentVowel.vowel} 的口型提示：${currentVowel.mouth}`">
              <span class="rounded-[50%] border-[5px] border-[#a33e50] bg-[#7b2638]" :class="currentVowel.vowel === 'a' ? 'h-10 w-14' : currentVowel.vowel === 'o' ? 'h-11 w-10' : 'h-4 w-14'" />
            </div>
            <p class="mt-3 font-display text-base text-ink">
              {{ currentVowel.mouth }}
            </p>
            <KTag class="mt-3" tone="success" size="sm">
              读过 {{ spokenVowels.length }} / 3
            </KTag>
          </div>
          <div>
            <h4 class="font-display text-2xl leading-snug text-ink">
              家长先示范，孩子跟着读
            </h4>
            <ol class="mt-3 grid gap-2 font-body text-sm leading-relaxed text-ink-soft">
              <li class="rounded-tile bg-language-soft p-3">
                <strong class="text-ink">【家长说】</strong>{{ currentVowel.prompt }}
              </li>
              <li class="rounded-tile bg-paper p-3">
                <strong class="text-ink">【孩子操作】</strong>看一看自己的嘴巴，读出“{{ currentVowel.vowel }}”，再点下面的按钮。
              </li>
              <li class="rounded-tile bg-paper p-3">
                <strong class="text-ink">【家长提醒】</strong>“不着急，我们再慢慢看一次口型。”不比较快慢，也不要求大量书写。
              </li>
            </ol>
            <div class="mt-4 flex flex-wrap gap-2" aria-label="选择韵母练习">
              <button
                v-for="card in vowelCards"
                :key="card.vowel"
                type="button"
                class="fx-pressable grid size-12 place-items-center rounded-chip border-2 font-display text-xl"
                :class="selectedVowel === card.vowel ? 'border-language-deep bg-language text-white' : 'border-line bg-surface text-ink'"
                :aria-pressed="selectedVowel === card.vowel"
                @click="selectedVowel = card.vowel"
              >
                {{ card.vowel }}
              </button>
              <KButton class="ml-auto" variant="soft" tone="language" @click="confirmVowelRead">
                我跟读好了
              </KButton>
            </div>
          </div>
        </div>
      </template>

      <template v-else-if="step === 3">
        <div class="flex flex-wrap items-end justify-between gap-3">
          <div>
            <KTag tone="explore" size="sm">
              手势 + 声调线 + 亲子跟读
            </KTag>
            <h4 class="mt-2 font-display text-2xl text-ink">
              坐上四声小火车，读完 12 个拼音音符
            </h4>
          </div>
          <KTag tone="success" size="sm">
            完成 {{ readSyllables.length }} / 12
          </KTag>
        </div>

        <div class="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(16rem,0.8fr)]">
          <div class="rounded-card border-2 border-line bg-paper p-4">
            <div class="mb-3 flex flex-wrap gap-2" aria-label="选择一个韵母">
              <button
                v-for="row in toneRows"
                :key="row.vowel"
                type="button"
                class="fx-pressable min-h-10 rounded-chip border-2 px-4 font-display text-lg"
                :class="selectedVowel === row.vowel ? 'border-language-deep bg-language text-white' : 'border-line bg-surface text-ink'"
                :aria-pressed="selectedVowel === row.vowel"
                @click="selectedVowel = row.vowel; selectedSyllable = `${row.vowel}-1`; pitchNote = ''"
              >
                练 {{ row.vowel }}
              </button>
            </div>
            <div v-for="row in toneRows.filter(item => item.vowel === selectedVowel)" :key="row.vowel" class="grid grid-cols-4 gap-2">
              <button
                v-for="(form, index) in row.forms"
                :key="form"
                type="button"
                class="fx-pressable relative flex min-h-20 flex-col items-center justify-center rounded-tile border-2 p-2 transition-colors"
                :class="selectedSyllable === `${row.vowel}-${index + 1}` ? 'border-language-deep bg-language-soft' : readSyllables.includes(`${row.vowel}-${index + 1}`) ? 'border-success-line bg-success-soft' : 'border-line bg-surface hover:border-language-deep'"
                :aria-pressed="selectedSyllable === `${row.vowel}-${index + 1}`"
                @click="selectSyllable(row.vowel, (index + 1) as Tone)"
              >
                <span class="font-display text-3xl text-ink">{{ form }}</span>
                <span class="mt-1 font-body text-[11px] text-ink-soft">{{ tones[index]?.name }}</span>
                <KIcon v-if="readSyllables.includes(`${row.vowel}-${index + 1}`)" class="absolute top-1 right-1" name="check" size="xs" tone="success" />
              </button>
            </div>
            <div class="mt-4 rounded-tile border-2 border-language-line bg-white p-3">
              <div class="flex items-center justify-between gap-3">
                <div>
                  <p class="font-body text-xs font-bold text-language-deep">
                    {{ selectedSyllableLabel }} · {{ selectedToneInfo.name }}
                  </p>
                  <p class="mt-1 font-display text-sm text-ink">
                    {{ selectedToneInfo.gesture }}
                  </p>
                </div>
                <svg class="h-14 w-28 shrink-0 overflow-visible" viewBox="0 0 104 58" role="img" :aria-label="`${selectedToneInfo.name}音高走向示意`">
                  <path d="M 13 49 L 91 49" stroke="currentColor" stroke-width="2" stroke-dasharray="4 4" class="text-line" />
                  <path
                    :d="selectedToneInfo.path"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="5"
                    stroke-linecap="round"
                    class="text-language-deep"
                  />
                  <circle cx="13" :cy="selectedToneInfo.tone === 1 ? 30 : selectedToneInfo.tone === 2 ? 43 : 14" r="4" class="fill-star" />
                </svg>
              </div>
              <div class="mt-3 flex flex-wrap gap-2">
                <KButton size="sm" variant="soft" tone="language" @click="playPitchGuide">
                  <KIcon name="speaker" size="sm" />听音高示意
                </KButton>
                <KButton size="sm" variant="primary" tone="language" :disabled="readSyllables.includes(selectedSyllable)" @click="confirmSyllableRead">
                  家长领读后，我跟读好了
                </KButton>
              </div>
              <p v-if="pitchNote" class="mt-2 font-body text-xs leading-relaxed text-ink-soft" aria-live="polite">
                {{ pitchNote }}
              </p>
            </div>
          </div>

          <aside class="rounded-card border-2 border-star-line bg-star-soft/50 p-4">
            <h5 class="font-display text-lg text-ink">
              四声动作口诀
            </h5>
            <ol class="mt-3 grid gap-2">
              <li v-for="tone in tones" :key="tone.tone" class="flex items-center gap-3 rounded-tile border border-white bg-white/80 p-3">
                <span class="grid size-9 place-items-center rounded-full bg-language-soft font-numeric text-sm font-extrabold text-language-deep">{{ tone.tone }}</span>
                <div>
                  <p class="font-body text-sm font-bold text-ink">
                    {{ tone.name }}
                  </p><p class="font-body text-xs text-ink-soft">
                    {{ tone.gesture }}
                  </p>
                </div>
              </li>
            </ol>
            <p class="mt-3 rounded-tile bg-white/80 p-3 font-body text-xs leading-relaxed text-ink-soft">
              声调线和提示音只展示音高变化，不是拼音范读。请家长用普通话示范，孩子实际读出每个音节后再确认。
            </p>
          </aside>
        </div>
      </template>

      <template v-else-if="step === 4">
        <div class="flex flex-wrap items-end justify-between gap-3">
          <div>
            <KTag tone="think" size="sm">
              原题之外 · 变式挑战
            </KTag>
            <h4 class="mt-2 font-display text-2xl text-ink">
              用刚才的发现闯过 6 个小关
            </h4>
          </div>
          <KTag tone="language" size="sm">
            第 {{ challengeIndex + 1 }} / {{ challenges.length }} 关
          </KTag>
        </div>
        <div class="mx-auto mt-6 max-w-2xl rounded-card border-2 border-line bg-paper p-5 sm:p-7">
          <div class="flex items-center gap-3">
            <img
              :src="publicAsset('images/questions/g1-chinese/cnc_p008_q1.webp')"
              alt="小狗队员正在想线索"
              class="size-10 rounded-xl border-2 border-white object-cover shadow-press"
              width="640"
              height="640"
              loading="lazy"
            >
            <p class="font-display text-xl leading-relaxed text-ink">
              {{ currentChallenge.prompt }}
            </p>
          </div>
          <div class="mt-5 grid gap-2 sm:grid-cols-2">
            <button
              v-for="choice in currentChallenge.choices"
              :key="choice"
              type="button"
              class="fx-pressable min-h-14 rounded-tile border-2 px-4 py-3 text-left font-display text-lg"
              :class="challengeState === 'correct' && choice === currentChallenge.answer ? 'border-success bg-success-soft text-success-deep' : challengeAnswer === choice && challengeState === 'hint' ? 'border-gently bg-gently-soft text-ink' : 'border-line bg-surface text-ink hover:border-language-deep'"
              :disabled="challengeState === 'correct'"
              :aria-pressed="challengeAnswer === choice"
              @click="answerChallenge(choice)"
            >
              {{ choice }}
            </button>
          </div>
          <div v-if="challengeState === 'hint'" class="mt-4 rounded-tile border-2 border-gently/50 bg-gently-soft p-4" aria-live="polite">
            <p class="font-display text-base text-ink">
              先别急，再找一条线索
            </p>
            <p class="mt-1 font-body text-sm leading-relaxed text-ink-soft">
              {{ currentChallenge.hint }}
            </p>
          </div>
          <div v-else-if="challengeState === 'correct'" class="mt-4 rounded-tile border-2 border-success-line bg-success-soft p-4" aria-live="polite">
            <p class="font-display text-base text-success-deep">
              找到啦！
            </p>
            <p class="mt-1 font-body text-sm leading-relaxed text-ink-soft">
              {{ currentChallenge.explanation }}
            </p>
            <KButton class="mt-3" variant="primary" tone="language" @click="nextChallenge">
              {{ challengeIndex + 1 < challenges.length ? '继续下一关' : '看看学习地图' }} <KIcon name="arrow-right" size="sm" />
            </KButton>
          </div>
        </div>
      </template>

      <template v-else>
        <div class="mx-auto max-w-3xl py-4 text-center">
          <div class="mx-auto grid size-20 place-items-center rounded-full border-4 border-star-line bg-star-soft text-star-deep shadow-press animate-pop-in">
            <KIcon name="star" size="2xl" weight="fill" />
          </div>
          <KTag class="mt-4" tone="success" size="sm">
            互动小课完成
          </KTag>
          <h4 class="mt-3 font-display text-3xl leading-snug text-ink">
            拼音探险地图点亮啦！
          </h4>
          <p class="mx-auto mt-2 max-w-2xl font-body text-sm leading-relaxed text-ink-soft">
            你观察了 a、o、e 的口型，练习了四声走向，也完成了 6 个变式挑战。接下来做题库中保留的 4 道原题，完成后会按本知识点正确率收下星星。
          </p>
          <div class="mt-5 grid gap-3 text-left sm:grid-cols-3">
            <div class="rounded-card border-2 border-line bg-paper p-4">
              <p class="font-display text-lg text-ink">
                识记
              </p><p class="mt-1 font-body text-xs leading-relaxed text-ink-soft">
                认出 a、o、e 和四种声调符号。
              </p>
            </div>
            <div class="rounded-card border-2 border-line bg-paper p-4">
              <p class="font-display text-lg text-ink">
                理解
              </p><p class="mt-1 font-body text-xs leading-relaxed text-ink-soft">
                用手势说出平、扬、拐、降的音高变化。
              </p>
            </div>
            <div class="rounded-card border-2 border-line bg-paper p-4">
              <p class="font-display text-lg text-ink">
                应用
              </p><p class="mt-1 font-body text-xs leading-relaxed text-ink-soft">
                看符号尝试读音，并在原题里辨认韵母和声调。
              </p>
            </div>
          </div>
          <div class="mt-5 rounded-card border-2 border-language-line bg-language-soft/60 p-4 text-left">
            <p class="font-display text-base text-ink">
              今晚的 5 分钟亲子游戏
            </p>
            <p class="mt-1 font-body text-sm leading-relaxed text-ink-soft">
              家长随机说“平平、上扬、先下再上、向下落”，孩子用手臂做声调小火车，再从 a、o、e 中任选一个读一轮四声。
            </p>
          </div>
          <div class="mt-6 flex flex-wrap justify-center gap-3">
            <KButton variant="ghost" @click="emit('cancel')">
              稍后做原题
            </KButton>
            <KButton size="lg" variant="primary" tone="language" @click="emit('practiceOriginals')">
              开始 4 道原题 <KIcon name="arrow-right" size="sm" />
            </KButton>
          </div>
        </div>
      </template>

      <footer v-if="step < 4" class="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
        <p class="font-body text-xs leading-relaxed text-ink-faint">
          {{ step === 0 ? '完成小侦察后进入口型和声调练习。' : step === 3 ? '每个拼音读过以后，由家长确认；不需要录音或上传声音。' : '每完成一段都会更新进度。可以随时返回题目。' }}
        </p>
        <KButton variant="primary" tone="language" :disabled="!canContinue" @click="advance">
          {{ step === 4 ? '完成这一课' : '下一步' }} <KIcon name="arrow-right" size="sm" />
        </KButton>
      </footer>
    </div>
  </section>
</template>
