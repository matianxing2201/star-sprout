<script setup lang="ts">
import { computed, ref } from 'vue'

import { grade1ChineseQuestionBank as bank } from '@/content/grades/grade-1/chinese-question-bank'
import { publicAsset } from '@/shared/utils'
import { KButton, KIcon, KTag } from '@/ui'

type LessonId = 'cnc_p013' | 'cnc_p014' | 'cnc_p015' | 'cnc_p016' | 'cnc_p017' | 'cnc_p018'
interface QuizItem { prompt: string, choices: string[], answer: string, hint: string, explanation: string }
interface DiagnosticItem { prompt: string, choices: string[], answer: string, hint: string }
interface ActionItem { prompt: string, choices: string[], answer: string, hint: string }

const props = defineProps<{ pointId: LessonId }>()
const emit = defineEmits<{ cancel: [], practiceOriginals: [] }>()

const curriculum = {
  cnc_p013: {
    title: '声母 g、k、h',
    theme: '拼音小队在山谷里找声音路牌',
    story: '小队来到山谷，听见“哥、科、河”三个声音。帮它们找到 g、k、h 的路牌，再用小手感受气流。',
    focus: '认识 g、k、h；听辨它们在词语开头的声音，并感受 k 比 g 送气明显。',
    familyPractice: '家长说“哥、科、河、瓜、夸”，孩子找出开头的 g、k、h；再把手放在嘴前轻轻比较 g 和 k。',
    cards: [
      { icon: '🕊️', name: 'g', detail: '“哥 gē”“瓜 guā”的开头是 g。轻轻读，气流比较弱。' },
      { icon: '🚀', name: 'k', detail: '“科 kē”“夸 kuā”的开头是 k。和 g 的发音位置相近，k 送气更明显。' },
      { icon: '🌬️', name: 'h', detail: '“河 hé”“喝 hē”的开头是 h。读的时候能感到气流轻轻摩擦出来。' },
    ],
    diagnostic: [
      { prompt: '“哥”的声母是哪一个？', choices: ['g', 'k', 'h'], answer: 'g', hint: '“哥”读 gē，听听开头的声音。' },
      { prompt: '“科”的声母是哪一个？', choices: ['h', 'k', 'g'], answer: 'k', hint: '“科”读 kē，和“哥”开头不一样。' },
      { prompt: '“河”的声母是哪一个？', choices: ['g', 'h', 'k'], answer: 'h', hint: '“河”读 hé，开头像“喝”的声音。' },
    ],
    activity: 'air' as const,
    actionItems: [
      { prompt: '轻轻读“哥”和“科”，手掌前气流更明显的是哪一个？', choices: ['哥（g）', '科（k）'], answer: '科（k）', hint: '不要用力吹，比较轻轻发音时的气流。' },
      { prompt: '“喝 hē”的开头声母是哪一个？', choices: ['g', 'h', 'k'], answer: 'h', hint: '想想“河 hé”和“喝 hē”开头相同。' },
      { prompt: '“夸 kuā”的声母是 g 还是 k？', choices: ['g', 'k'], answer: 'k', hint: '“科 kē”和“夸 kuā”都由 k 开头。' },
    ] satisfies ActionItem[],
    challenges: [
      { prompt: '“瓜 guā”的声母是？', choices: ['g', 'k', 'h', 'd'], answer: 'g', hint: '“瓜”不是“夸”，注意开头的送气。', explanation: '瓜 guā 的声母是 g；夸 kuā 的声母是 k。' },
      { prompt: '“河 hé”的声母是？', choices: ['h', 'g', 'k', 'f'], answer: 'h', hint: '读一读“河 hé”，听开头的摩擦音。', explanation: '河 hé 的声母是 h。' },
      { prompt: '“科 kē”和“哥 gē”相比，哪个送气更明显？', choices: ['g', 'k', '一样明显', '都没有声音'], answer: 'k', hint: '把手放在嘴前轻轻读一读。', explanation: 'k 是送气音，气流比 g 更明显。' },
      { prompt: '“夸 kuā”的声母是？', choices: ['h', 'g', 'k', 'q'], answer: 'k', hint: '“科 kē”和“夸 kuā”开头相同。', explanation: '夸 kuā 的声母是 k。' },
      { prompt: '“喝 hē”的声母是？', choices: ['k', 'h', 'g', 'x'], answer: 'h', hint: '“喝”和“河”开头的声母相同。', explanation: '喝 hē 的声母是 h。' },
      { prompt: '哪一组声母都在本课学习？', choices: ['g、k、h', 'b、p、m', 'z、c、s', 'j、q、x'], answer: 'g、k、h', hint: '回想山谷里的三块声音路牌。', explanation: '本课学习 g、k、h。' },
    ] satisfies QuizItem[],
  },
  cnc_p014: {
    title: '声母 j、q、x',
    theme: '小鸡、气球和西瓜的拼音派对',
    story: '小鸡 jī、七色气球 qī 和西瓜 xīguā 来参加派对。跟着它们的词语听一听，找对 j、q、x。',
    focus: '认识 j、q、x；能在“鸡、七、西、下”等音节中辨认声母，感受 q 比 j 送气明显。',
    familyPractice: '家长说“鸡、七、西、下”，孩子说出 j、q、x；再轻轻读 j、q，把手放在嘴前比较气流。',
    cards: [
      { icon: '🐥', name: 'j', detail: '鸡 jī 的开头是 j。发音时舌面抬起，舌尖放低靠近下齿背。' },
      { icon: '🎈', name: 'q', detail: '七 qī 的开头是 q。发音位置和 j 接近，送气更明显。' },
      { icon: '🍉', name: 'x', detail: '西 xī、下 xià 的开头是 x。舌面抬起，气流从窄缝轻轻出来。' },
    ],
    diagnostic: [
      { prompt: '“鸡”的声母是哪一个？', choices: ['j', 'q', 'x'], answer: 'j', hint: '鸡读 jī，开头不是“七 qī”。' },
      { prompt: '“七”的声母是哪一个？', choices: ['x', 'q', 'j'], answer: 'q', hint: '“七 qī”和“鸡 jī”只差开头的声母。' },
      { prompt: '“西”的声母是哪一个？', choices: ['j', 'x', 'q'], answer: 'x', hint: '西读 xī，不是平舌音 s。' },
    ],
    activity: 'air' as const,
    actionItems: [
      { prompt: '轻轻读“鸡 jī”和“七 qī”，哪一个气流更明显？', choices: ['鸡（j）', '七（q）'], answer: '七（q）', hint: '手掌放在嘴前，比较两次轻读。' },
      { prompt: '“下 xià”的声母是哪个？', choices: ['j', 'q', 'x'], answer: 'x', hint: '西 xī 和下 xià 都由同一个声母开头。' },
      { prompt: '“家 jiā”的声母是 j 还是 x？', choices: ['j', 'x'], answer: 'j', hint: '“鸡 jī”和“家 jiā”的开头相同。' },
    ] satisfies ActionItem[],
    challenges: [
      { prompt: '“七 qī”的声母是？', choices: ['j', 'q', 'x', 'c'], answer: 'q', hint: '“七”和“鸡”开头不同。', explanation: '七 qī 的声母是 q。' },
      { prompt: '“下 xià”的声母是？', choices: ['x', 'q', 'j', 's'], answer: 'x', hint: '“西 xī”和“下 xià”开头相同。', explanation: '下 xià 的声母是 x。' },
      { prompt: 'j 和 q 相比，哪一个送气更明显？', choices: ['j', 'q', '一样明显', '都不送气'], answer: 'q', hint: '再用手掌轻轻试读一次。', explanation: 'q 是送气音，气流比 j 更明显。' },
      { prompt: '“家 jiā”的声母是？', choices: ['x', 'j', 'q', 'g'], answer: 'j', hint: '家 jiā 和鸡 jī 的开头相同。', explanation: '家 jiā 的声母是 j。' },
      { prompt: '哪一个词的声母是 x？', choices: ['七 qī', '鸡 jī', '西 xī', '家 jiā'], answer: '西 xī', hint: '试着轻读“西 xī”，听听开头。', explanation: '西 xī 的声母是 x。' },
      { prompt: '哪一组声母都属于本课？', choices: ['g、k、h', 'j、q、x', 'zh、ch、sh', 'd、t、n'], answer: 'j、q、x', hint: '派对里的三位拼音朋友是谁？', explanation: '本课学习 j、q、x。' },
    ] satisfies QuizItem[],
  },
  cnc_p015: {
    title: '平舌声母 z、c、s',
    theme: '小舌头走平平的林间小路',
    story: '小朋友听见“字、草、四”的开头音，正在找平平的小路。把舌尖放平，帮 z、c、s 找到正确的路牌。',
    focus: '认读 z、c、s；知道它们是平舌音，舌尖放平；感受 c 比 z 送气明显。',
    familyPractice: '家长说“字、草、四、丝”，孩子找出 z、c、s；对着镜子读一读，注意舌尖放平，不要翘起来。',
    cards: [
      { icon: '✏️', name: 'z', detail: '字 zì 的开头是 z。读 z 时舌尖靠近上齿背，保持平平。' },
      { icon: '🌱', name: 'c', detail: '草 cǎo 的开头是 c。舌尖放平，送气比 z 更明显。' },
      { icon: '🐍', name: 's', detail: '四 sì、丝 sī 的开头是 s。气流从舌尖和牙齿附近轻轻通过。' },
    ],
    diagnostic: [
      { prompt: '“字”的声母是哪一个？', choices: ['z', 'c', 's'], answer: 'z', hint: '字读 zì，开头平平地发音。' },
      { prompt: '“草”的声母是哪一个？', choices: ['s', 'c', 'z'], answer: 'c', hint: '草读 cǎo，听听开头的送气。' },
      { prompt: '“四”的声母是哪一个？', choices: ['z', 's', 'c'], answer: 's', hint: '四读 sì，十 shí 才是翘舌音。' },
    ],
    activity: 'match' as const,
    actionItems: [
      { prompt: '读 z、c、s 时，舌尖应该怎样？', choices: ['放平', '向上翘起'], answer: '放平', hint: '想想“平舌”里的“平”字。' },
      { prompt: '读“草 cǎo”和“字 zì”，哪个送气更明显？', choices: ['草（c）', '字（z）'], answer: '草（c）', hint: '手掌放在嘴前轻轻比较 c 和 z。' },
      { prompt: '“丝 sī”的声母是哪个？', choices: ['z', 'c', 's'], answer: 's', hint: '丝 sī 和四 sì 开头的声母相同。' },
    ] satisfies ActionItem[],
    challenges: [
      { prompt: '“四 sì”的声母是？', choices: ['s', 'sh', 'c', 'z'], answer: 's', hint: '“四 sì”是平舌音，“十 shí”才是翘舌音。', explanation: '四 sì 的声母是平舌音 s。' },
      { prompt: '“草 cǎo”的声母是？', choices: ['z', 'c', 's', 'ch'], answer: 'c', hint: '草 cǎo 的舌尖放平。', explanation: '草 cǎo 的声母是 c。' },
      { prompt: '哪一个声母送气更明显：z 还是 c？', choices: ['z', 'c', '一样明显', '都不送气'], answer: 'c', hint: '用手掌在嘴前比较轻读。', explanation: 'c 是送气音，气流比 z 更明显。' },
      { prompt: '读 z、c、s 时，舌尖要？', choices: ['放平', '向上翘', '伸出嘴外', '碰到鼻子'], answer: '放平', hint: '这三个声母叫平舌音。', explanation: '平舌音 z、c、s 发音时舌尖放平。' },
      { prompt: '“字 zì”的声母是？', choices: ['zh', 'z', 'c', 's'], answer: 'z', hint: '字 zì 舌尖放平，不是翘舌的 zh。', explanation: '字 zì 的声母是平舌音 z。' },
      { prompt: '哪一组全是平舌声母？', choices: ['zh、ch、sh', 'z、c、s', 'j、q、x', 'g、k、h'], answer: 'z、c、s', hint: '平舌音的舌尖放平。', explanation: 'z、c、s 都是平舌声母。' },
    ] satisfies QuizItem[],
  },
  cnc_p016: {
    title: '翘舌声母 zh、ch、sh、r',
    theme: '卷舌小火车寻找四个声音站',
    story: '小火车经过“中、吃、书、日”四个站点。舌尖稍稍向上翘，听一听 zh、ch、sh、r 各自的开头。',
    focus: '认识 zh、ch、sh、r；感受翘舌发音与平舌不同，并辨别 ch 比 zh 送气明显。',
    familyPractice: '家长带孩子对着镜子轻读“中、吃、书、日”，再读“字、草、四”，比较平舌和翘舌时舌尖的位置。',
    cards: [
      { icon: '🚉', name: 'zh', detail: '中 zhōng 的开头是 zh。舌尖稍向上翘，发音时气流较弱。' },
      { icon: '🚂', name: 'ch', detail: '吃 chī 的开头是 ch。舌尖稍向上翘，送气比 zh 明显。' },
      { icon: '📖', name: 'sh', detail: '书 shū 的开头是 sh。舌尖稍向上翘，气流从窄缝轻轻通过。' },
      { icon: '☀️', name: 'r', detail: '日 rì 的开头是 r。舌尖稍向上翘，读得轻柔、自然。' },
    ],
    diagnostic: [
      { prompt: '“中”的声母是哪一个？', choices: ['z', 'zh', 'ch'], answer: 'zh', hint: '“中 zhōng”是翘舌音。' },
      { prompt: '“书”的声母是哪一个？', choices: ['s', 'sh', 'r'], answer: 'sh', hint: '书 shū 的开头要稍稍翘起舌尖。' },
      { prompt: '“吃”的声母是哪一个？', choices: ['ch', 'zh', 'sh'], answer: 'ch', hint: '吃 chī 和中 zhōng 的开头不同。' },
    ],
    activity: 'air' as const,
    actionItems: [
      { prompt: '读“字 zì”和“中 zhōng”，哪一个需要把舌尖稍稍向上翘？', choices: ['字（z）', '中（zh）'], answer: '中（zh）', hint: '一个是平舌，一个是翘舌。' },
      { prompt: '轻读“中 zhōng”和“吃 chī”，哪一个送气更明显？', choices: ['中（zh）', '吃（ch）'], answer: '吃（ch）', hint: '用手掌放在嘴前比较 ch 和 zh。' },
      { prompt: '“日 rì”的声母是哪个？', choices: ['r', 'sh', 'zh'], answer: 'r', hint: '日 rì 的开头音和书 shū 不一样。' },
    ] satisfies ActionItem[],
    challenges: [
      { prompt: '“中国”的“中”声母是？', choices: ['z', 'zh', 'ch', 'sh'], answer: 'zh', hint: '中 zhōng 是翘舌音。', explanation: '“中”的声母是 zh。' },
      { prompt: '“吃 chī”的声母是？', choices: ['c', 'zh', 'sh', 'ch'], answer: 'ch', hint: '舌尖稍翘，读音里还有明显送气。', explanation: '吃 chī 的声母是 ch。' },
      { prompt: '“书 shū”的声母是？', choices: ['s', 'zh', 'sh', 'r'], answer: 'sh', hint: '书 shū 和丝 sī 的开头一个翘舌，一个平舌。', explanation: '书 shū 的声母是 sh。' },
      { prompt: '“日 rì”的声母是？', choices: ['zh', 'ch', 'sh', 'r'], answer: 'r', hint: '想想太阳升起的“日”。', explanation: '日 rì 的声母是 r。' },
      { prompt: 'zh 和 ch 相比，哪一个送气更明显？', choices: ['zh', 'ch', '一样明显', '都没有声音'], answer: 'ch', hint: '手掌放在嘴前轻轻比较。', explanation: 'ch 是送气音，气流比 zh 更明显。' },
      { prompt: '读 zh、ch、sh、r 时，舌尖通常要？', choices: ['放平', '稍稍向上翘', '伸出嘴外', '碰到下嘴唇'], answer: '稍稍向上翘', hint: '这组声母叫翘舌音。', explanation: '发翘舌声母时，舌尖稍向上翘。' },
    ] satisfies QuizItem[],
  },
  cnc_p017: {
    title: '声母 y、w',
    theme: '小鸭和青蛙来给音节领路',
    story: '小鸭 yā 和青蛙 wā 要带大家去拼音池塘。帮它们认出 y、w，也看看 yu 里的 u 为什么没有两点。',
    focus: '认识 y、w；能从“鸭、蛙”等词中辨认声母，并知道 yu 中的 u 实际读 ü。',
    familyPractice: '家长说“鸭、蛙、衣、乌、鱼”，孩子指出 y 或 w；看到 yu 时提醒孩子：u 上的两点省去了，读音仍是 ü。',
    cards: [
      { icon: '🦆', name: 'y', detail: '鸭 yā 的开头是 y。衣 yī 写作整体认读音节 yī，看到就直接读。' },
      { icon: '🐸', name: 'w', detail: '蛙 wā 的开头是 w。乌 wū 写作整体认读音节 wū，看到就直接读。' },
      { icon: '🐟', name: 'yu', detail: '鱼 yú 写作 yu。y 后面的 ü 省去两点，仍然读 ü，不读成乌的 u。' },
    ],
    diagnostic: [
      { prompt: '“鸭 yā”的声母是哪一个？', choices: ['y', 'w', 'n'], answer: 'y', hint: '鸭 yā 和衣 yī 都由 y 开头。' },
      { prompt: '“蛙 wā”的声母是哪一个？', choices: ['y', 'w', 'h'], answer: 'w', hint: '蛙 wā 的开头和乌 wū 相同。' },
      { prompt: '“鱼 yú”里的 u 实际读什么？', choices: ['u', 'ü', 'i'], answer: 'ü', hint: '鱼的韵母原来有两点，写 yu 时两点省去了。' },
    ],
    activity: 'match' as const,
    actionItems: [
      { prompt: '“鸭 yā”的开头声母是 y 还是 w？', choices: ['y', 'w'], answer: 'y', hint: '鸭 yā 和衣 yī 开头相同。' },
      { prompt: '“蛙 wā”的开头声母是 y 还是 w？', choices: ['y', 'w'], answer: 'w', hint: '蛙 wā 和乌 wū 开头相同。' },
      { prompt: '写成 yu 的“鱼”，韵母仍然读 ü 还是 u？', choices: ['ü', 'u'], answer: 'ü', hint: '看一看“鱼”字的拼音，想想两点去哪儿了。' },
    ] satisfies ActionItem[],
    challenges: [
      { prompt: '“鸭 yā”的声母是？', choices: ['w', 'y', 'n', 'l'], answer: 'y', hint: '蛙 wā 才是 w 开头。', explanation: '鸭 yā 的声母是 y。' },
      { prompt: '“蛙 wā”的声母是？', choices: ['y', 'w', 'f', 'h'], answer: 'w', hint: '鸭 yā 是 y 开头，蛙 wā 是 w 开头。', explanation: '蛙 wā 的声母是 w。' },
      { prompt: '“鱼 yú”中的 u 应读成？', choices: ['ü', 'u', 'i', 'e'], answer: 'ü', hint: 'y 后面的 ü 省略两点，但读音不变。', explanation: 'yu 的 u 实际读 ü。' },
      { prompt: '看到整体认读音节 yī，应该怎样读？', choices: ['直接整体读', '把 y 和 i 分开读'], answer: '直接整体读', hint: '它是整体认读音节，不用再拼。', explanation: 'yī 要整体认读。' },
      { prompt: '下面哪个是声母 w 的音节？', choices: ['yā', 'wā', 'yī', 'yú'], answer: 'wā', hint: '青蛙 wā 的拼音开头是 w。', explanation: '蛙 wā 的声母是 w。' },
      { prompt: '“乌 wū”的声母是？', choices: ['y', 'w', 'u', 'ü'], answer: 'w', hint: '乌 wū 写作整体认读音节，开头字母是 w。', explanation: '乌 wū 的声母是 w。' },
    ] satisfies QuizItem[],
  },
  cnc_p018: {
    title: '语文园地三·整体认读音节',
    theme: '拼音收藏馆的整读音节寻宝',
    story: '拼音收藏馆有一批不用拆开拼的音节卡片。跟着卡片读一读，找到哪些音节见到就整体认读。',
    focus: '认识本单元学习的整体认读音节：zhi、chi、shi、ri、zi、ci、si、yi、wu、yu；知道整体认读时不再拆开拼。',
    familyPractice: '把 zhi、chi、shi、ri、zi、ci、si、yi、wu、yu 写在小卡片上，家长随机出示，孩子直接整体读；再挑 bā、mā 说说它们需要拼读。',
    cards: [
      { icon: '🪄', name: 'zhi · chi · shi · ri', detail: '这组音节看到就整体读，不把 zh、ch、sh、r 再拆开拼。' },
      { icon: '🧩', name: 'zi · ci · si', detail: '这三个也是整体认读音节；平舌发音时舌尖放平。' },
      { icon: '🎒', name: 'yi · wu · yu', detail: '衣 yī、乌 wū、鱼 yú 也整体认读。yu 里的 u 实际读 ü。' },
    ],
    diagnostic: [
      { prompt: '“衣 yī”看到后应该怎样读？', choices: ['整体认读', '先读 y 再拼 i'], answer: '整体认读', hint: '衣 yī 是整体认读音节。' },
      { prompt: '“四 sì”是哪一种音节？', choices: ['整体认读', '先读 s 再拼 i'], answer: '整体认读', hint: '四 sì 和十 shí 不同；sì 是整体认读。' },
      { prompt: '“日 rì”需要把 r 和 i 再拼起来吗？', choices: ['需要拼', '不需要，整体认读'], answer: '不需要，整体认读', hint: '日 rì 是整体认读音节。' },
    ],
    activity: 'match' as const,
    actionItems: [
      { prompt: '看到“sì”，应该怎样读？', choices: ['直接整体读', '先读 s 再拼 i'], answer: '直接整体读', hint: 'sì 是整体认读音节。' },
      { prompt: '“rì”是整体认读音节吗？', choices: ['是', '不是'], answer: '是', hint: '日 rì 看到后直接整体读。' },
      { prompt: '“bā”是整体认读音节吗？', choices: ['是', '不是，要拼读'], answer: '不是，要拼读', hint: '八 bā 要把声母 b 和韵母 ā 拼起来。' },
    ] satisfies ActionItem[],
    challenges: [
      { prompt: '下面哪个是整体认读音节？', choices: ['bā', 'mā', 'yī', 'dà'], answer: 'yī', hint: '衣 yī 不用拆成 y 和 i 再拼。', explanation: 'yī 是整体认读音节。' },
      { prompt: '“四 sì”应该怎样读？', choices: ['整体认读', '先读 s 再拼 i', '读成 shì', '只读 s'], answer: '整体认读', hint: '“四”是 sì，不是“十”shí。', explanation: 'sì 是整体认读音节，直接整体读。' },
      { prompt: '“日 rì”是哪一种？', choices: ['整体认读音节', '声母 r 和韵母 i 再拼', '音节 yī', '拼读音节 bā'], answer: '整体认读音节', hint: '日 rì 看到后直接读。', explanation: 'rì 是整体认读音节。' },
      { prompt: '下面哪个要把声母和韵母拼起来读？', choices: ['yī', 'wū', 'bā', 'sī'], answer: 'bā', hint: '衣、乌、丝都整体认读。', explanation: 'bā 要把 b 和 ā 拼起来读。' },
      { prompt: '下面哪一组都是本单元学过的整体认读音节？', choices: ['zhi、chi、shi、ri', 'ba、ma、da、ge', 'g、k、h、j', 'ai、ei、ui、ou'], answer: 'zhi、chi、shi、ri', hint: '想想舌尖翘起的一组整读音节。', explanation: 'zhi、chi、shi、ri 都是整体认读音节。' },
      { prompt: '“yu”里的 u 应读成什么？', choices: ['u', 'ü', 'i', 'a'], answer: 'ü', hint: 'y 后面的 ü 写成 yu 时要省去两点。', explanation: 'yu 中的 u 实际读 ü。' },
    ] satisfies QuizItem[],
  },
} satisfies Record<LessonId, {
  title: string
  theme: string
  story: string
  focus: string
  familyPractice: string
  cards: Array<{ icon: string, name: string, detail: string }>
  diagnostic: DiagnosticItem[]
  activity: 'match' | 'air' | 'poem'
  actionItems: ActionItem[]
  challenges: QuizItem[]
}>

const config = computed(() => curriculum[props.pointId])
const point = computed(() => bank.units.find(unit => unit.order === 3)!.knowledgePoints.find(item => item.id === props.pointId)!)
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
              第三单元 · 互动小课
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
              {{ config.familyPractice }}
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
