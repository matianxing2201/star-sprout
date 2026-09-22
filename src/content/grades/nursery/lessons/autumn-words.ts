import type { Lesson } from '@/domain'
import { audioText } from '@/content/audio-text'

/**
 * 课程：中班 · 识字启蒙 · 秋天的四个小客人
 *
 * 这一课不是从「今天认哪几个字」开始的，而是从一个孩子已经听熟的地方开始的：
 * 《秋天的颜色》里，小草说黄、枫叶说红、菊花说彩、稻谷说金 —— 他跟着念过好几遍，
 * 那几个字的**声音**早就熟了，只是一直没跟它的**样子**对上。
 *
 * 所以识字启蒙的路线在这里是这么落的：
 *   看（🍃 是什么）→ 认（这个字念「草」）→ 听（点一下，听它念一遍）
 *   → 玩（翻牌，把字和它的东西找成一对）→ 记（把字和画牵起来）
 *
 * 三个刻意的选择：
 *   1. **不给拼音**。中班还不学拼音（见 taxonomy 的 nextHint），
 *      认字的拐棍是「图画 + 声音」，不是字母；
 *   2. **不写、只认**。这一课没有一道抄写题 —— 中班的手还握不稳笔，
 *      先让字和声音、字和意思挂上钩，写字留给后面；
 *   3. **范读挂在能点的地方**。字卡点一下读那个字，翻牌翻到读出那个字，
 *      让孩子自己决定「我要再听一遍」，而不是从头到尾被动听。
 *
 * 音频在构建期用 scripts/generate-audio.mjs 离线生成（见 docs/adr/0002），
 * 下面的 audioText(...) 声明就是生成脚本要读的文本 —— 改了字，重跑 pnpm audio:sync。
 */

/* 四个字的范读。id 前缀与课程 id 一致：clipId 全局唯一，直接变成文件名。 */
const CLIP_CAO = 'nursery-literacy-autumn-words-cao'
const CLIP_YE = 'nursery-literacy-autumn-words-ye'
const CLIP_HUA = 'nursery-literacy-autumn-words-hua'
const CLIP_GU = 'nursery-literacy-autumn-words-gu'

/** 四个字连着念一遍。先听一遍整体，再一个一个认 */
const CLIP_RECITAL = 'nursery-literacy-autumn-words-recital'

/* 内容里声明要读的文字：脚本按这些声明生成音频文件 */
audioText(CLIP_CAO, '草。')
audioText(CLIP_YE, '叶。')
audioText(CLIP_HUA, '花。')
audioText(CLIP_GU, '谷。')
audioText(CLIP_RECITAL, '草、叶、花、谷。', '一字一顿，两字之间停半拍，慢慢念。')

export const autumnWordsLesson: Lesson = {
  id: 'nursery-literacy-autumn-words-1',
  gradeId: 'nursery',
  categoryId: 'nursery-literacy',
  topicId: 'nursery-literacy-autumn-words',
  title: '秋天的四个小客人',
  icon: 'translate',
  question: '我们念过的那首诗里，藏着四个字，你认识它们吗？',
  mascot: 'rabbit',
  minutes: 10,
  tone: 'language',
  objectives: [
    '能把「草」「叶」「花」「谷」四个字和它们的样子对起来',
    '听到读音能指出是哪个字，看到字能说出它念什么',
    '知道这几个字是从念过的《秋天的颜色》里来的，愿意再念一遍那首诗',
  ],
  knowledgePoints: [
    { id: 'kp-lit-autumn-source', label: '这四个字藏在念过的诗里', detail: '《秋天的颜色》里的小草、枫叶、菊花、稻谷' },
    { id: 'kp-lit-cao', label: '「草」：小草，上面是草字头', detail: '草字头就像两棵并排长着的小草' },
    { id: 'kp-lit-ye', label: '「叶」：叶子，一片一片的', detail: '左边是「口」，右边是「十」，合起来就是叶' },
    { id: 'kp-lit-hua', label: '「花」：花，开在草上面', detail: '花也是草字头的字 —— 花是从草里长出来的' },
    { id: 'kp-lit-gu', label: '「谷」：谷子，金黄的稻谷', detail: '「谷」就是稻谷的谷，秋天金黄的那个' },
    { id: 'kp-lit-word-match', label: '字能找到它的东西', detail: '看到「草」想到小草，看到「花」想到菊花' },
  ],
  tasks: [
    /* 1. 角色引入：从「已经念过的诗」里把四个字领出来 */
    {
      id: 'words-intro',
      kind: 'intro',
      title: '诗里的四个小客人',
      mascotLine: '我们念过的那首诗里，还藏着四个字呢。',
      story: {
        mascot: 'rabbit',
        mood: 'curious',
        lines: [
          '还记得《秋天的颜色》吗？小草说黄，枫叶说红，菊花说彩，稻谷说金。',
          '这首诗里，其实藏着四个字：草、叶、花、谷。',
          '你会念它们，可你还没见过它们长什么样。今天我们就认一认这四个小客人。',
        ],
      },
    },
    /* 2. 知识发现：四张卡，一张卡认一个字（看图 → 认字） */
    {
      id: 'words-discover',
      kind: 'discover',
      title: '一个字，一个小客人',
      instruction: '点一点每一张小卡片，看看这个字长什么样。',
      mascotLine: '一个字配一样东西，一个一个来。',
      knowledgePointIds: ['kp-lit-autumn-source'],
      discovery: {
        cards: [
          {
            id: 'card-cao',
            icon: 'plant',
            tone: 'life',
            title: '草',
            body: '小草的「草」。秋天到了，它的绿衣服慢慢变成了黄色。',
            tip: '「草」字上面那个草字头，像两棵并排长着的小草。',
          },
          {
            id: 'card-ye',
            icon: 'leaf',
            tone: 'art',
            title: '叶',
            body: '枫叶的「叶」。红红的叶子，像一团燃烧的小火苗。',
            tip: '一片一片的叫「叶」，很多片就是「树叶」。',
          },
          {
            id: 'card-hua',
            icon: 'flower',
            tone: 'music',
            title: '花',
            body: '菊花的「花」。它的花瓣里藏着好几种颜色。',
            tip: '「花」也是草字头 —— 花就是从草里长出来的。',
          },
          {
            id: 'card-gu',
            icon: 'grains',
            tone: 'explore',
            title: '谷',
            body: '稻谷的「谷」。金黄的稻谷沉甸甸，笑弯了腰。',
            tip: '我们吃的米饭，就是从「谷」里来的。',
          },
        ],
      },
    },
    /* 3. 动手探索：点字卡听范读 —— 认字卡的核心一步 */
    {
      id: 'words-listen',
      kind: 'interaction',
      title: '点一点，听它念',
      instruction: '点一个字，听听它念什么，自己也跟着念一遍。',
      mascotLine: '点一下就能听，想再听就再点一下。',
      knowledgePointIds: ['kp-lit-cao', 'kp-lit-ye', 'kp-lit-hua', 'kp-lit-gu'],
      audioClipId: CLIP_RECITAL,
      interactions: [
        {
          kind: 'choose-one',
          prompt: '先挨着点一遍，听听这四个字。',
          hint: '点一下字卡，就能听到它念什么；跟着念一遍，记得更牢。',
          successLine: '四个字都听过了吧？草、叶、花、谷，它们的名字你都会念了。',
          stars: 2,
          audioClipId: CLIP_RECITAL,
          payload: {
            layout: 'card',
            columns: 4,
            options: [
              { id: 'w-cao', label: '草', emoji: '🍃', correct: true, tone: 'life', audioClipId: CLIP_CAO },
              { id: 'w-ye', label: '叶', emoji: '🍁', tone: 'art', audioClipId: CLIP_YE },
              { id: 'w-hua', label: '花', emoji: '🌼', tone: 'music', audioClipId: CLIP_HUA },
              { id: 'w-gu', label: '谷', emoji: '🌾', tone: 'explore', audioClipId: CLIP_GU },
            ],
          },
        },
      ],
    },
    /* 4. 动手探索：翻牌配对 —— 把字和它的东西凑成一对 */
    {
      id: 'words-pair',
      kind: 'practice',
      title: '字和它的东西',
      instruction: '翻开两张牌，把字和它对应的东西凑成一对。',
      mascotLine: '翻开牌的时候，它会念给你听。',
      knowledgePointIds: ['kp-lit-word-match', 'kp-lit-cao', 'kp-lit-ye', 'kp-lit-hua', 'kp-lit-gu'],
      interactions: [
        {
          kind: 'memory-pair',
          prompt: '把字和它的东西配成一对',
          hint: '看到「草」就去找小草，看到「花」就去找菊花。',
          successLine: '四对全找齐了！现在你看到字，就能想起它的样子了。',
          stars: 3,
          payload: {
            cards: [
              { id: 'mc-cao', pairId: 'p-cao', label: '草', emoji: '🍃', audioClipId: CLIP_CAO },
              { id: 'mp-cao', pairId: 'p-cao', label: '小草', emoji: '🍃', audioClipId: CLIP_CAO },
              { id: 'mc-ye', pairId: 'p-ye', label: '叶', emoji: '🍁', audioClipId: CLIP_YE },
              { id: 'mp-ye', pairId: 'p-ye', label: '枫叶', emoji: '🍁', audioClipId: CLIP_YE },
              { id: 'mc-hua', pairId: 'p-hua', label: '花', emoji: '🌼', audioClipId: CLIP_HUA },
              { id: 'mp-hua', pairId: 'p-hua', label: '菊花', emoji: '🌼', audioClipId: CLIP_HUA },
              { id: 'mc-gu', pairId: 'p-gu', label: '谷', emoji: '🌾', audioClipId: CLIP_GU },
              { id: 'mp-gu', pairId: 'p-gu', label: '稻谷', emoji: '🌾', audioClipId: CLIP_GU },
            ],
          },
        },
      ],
    },
    /* 5. 挑战任务：汉字找朋友 —— 把字和画牵起来（最硬的一步，留出口） */
    {
      id: 'words-connect',
      kind: 'challenge',
      title: '挑战：给汉字找朋友',
      instruction: '把左边的字，连到右边它的东西上。',
      mascotLine: '连错了线会自己擦掉，不用怕。',
      knowledgePointIds: ['kp-lit-word-match'],
      interactions: [
        {
          kind: 'connect-line',
          prompt: '把字和它的东西连起来',
          hint: '一个一个念过去：草、叶、花、谷，念到哪个字，就去找那样东西。',
          successLine: '连得真准！草、叶、花、谷，你都认出来了。',
          stars: 3,
          skippable: true,
          payload: {
            left: [
              { id: 'l-cao', label: '草', audioClipId: CLIP_CAO },
              { id: 'l-ye', label: '叶', audioClipId: CLIP_YE },
              { id: 'l-hua', label: '花', audioClipId: CLIP_HUA },
              { id: 'l-gu', label: '谷', audioClipId: CLIP_GU },
            ],
            right: [
              { id: 'r-gu', label: '稻谷', emoji: '🌾', audioClipId: CLIP_GU },
              { id: 'r-hua', label: '菊花', emoji: '🌼', audioClipId: CLIP_HUA },
              { id: 'r-cao', label: '小草', emoji: '🍃', audioClipId: CLIP_CAO },
              { id: 'r-ye', label: '枫叶', emoji: '🍁', audioClipId: CLIP_YE },
            ],
            pairs: [
              ['l-cao', 'r-cao'],
              ['l-ye', 'r-ye'],
              ['l-hua', 'r-hua'],
              ['l-gu', 'r-gu'],
            ],
          },
        },
      ],
    },
    /* 6. 领取奖励：说清楚孩子真的做到了什么 */
    {
      id: 'words-reward',
      kind: 'reward',
      title: '领取奖励',
      reward: {
        stars: 3,
        message: '你认出了草、叶、花、谷四个字 —— 它们都是从你念过的《秋天的颜色》里来的。',
      },
    },
  ],
  reward: {
    stars: 3,
    message: '秋天的四个小客人，你都认识啦！',
  },
}
