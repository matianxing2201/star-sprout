import type { Lesson } from '@/domain'

/**
 * 示例课程：中班 · 语言表达 · 秋天的颜色
 *
 * 这是一首问答式的小诗：孩子跟着小兔一路问「秋天是什么颜色」，
 * 小草说黄、枫叶说红、菊花说彩、稻谷说金，最后合起来是五彩缤纷。
 *
 * 设计上有三条刻意的选择：
 *   1. 进页面不直接摆出整首诗 —— 先一个问题，再一层层去找颜色；
 *   2. 四种颜色各用**不同的互动**去「玩」，而不是把四句话各出一道选择题；
 *   3. 颜色归类那一题，**框和物品都不给色调**（见该段的注释）——
 *      颜色一旦变成暗号，这题就白出了。
 */
export const autumnColorsLesson: Lesson = {
  id: 'nursery-language-autumn-colors-1',
  gradeId: 'nursery',
  categoryId: 'nursery-language',
  topicId: 'nursery-language-autumn-colors',
  title: '秋天的颜色',
  icon: 'leaf',
  question: '秋天到底是什么颜色呢？',
  mascot: 'rabbit',
  minutes: 10,
  tone: 'language',
  objectives: [
    '知道小草变黄、枫叶变红、菊花有黄白紫、稻谷金黄',
    '能说出「秋天是五彩缤纷的」',
    '愿意有节奏地、把颜色词念得重一点，把这首小诗念出来',
  ],
  knowledgePoints: [
    { id: 'kp-autumn-change', label: '秋天来了，身边的颜色会变', detail: '小草变黄、枫叶变红、菊花开了、稻谷金黄' },
    { id: 'kp-autumn-grass', label: '小草说：秋天是黄色的', detail: '小草的绿衣服慢慢变成了黄色' },
    { id: 'kp-autumn-maple', label: '枫叶说：秋天是红色的', detail: '枫叶红得像一团燃烧的小火苗' },
    { id: 'kp-autumn-chrysanthemum', label: '菊花说：秋天是彩色的', detail: '花瓣里藏着黄色、白色和紫色' },
    { id: 'kp-autumn-rice', label: '稻谷说：秋天是金色的', detail: '金黄的稻谷沉甸甸，笑弯了腰' },
    { id: 'kp-recital-pause', label: '念的时候在意群之间停一停', detail: '「秋天 / 是什么颜色？」不要一口气念完' },
    { id: 'kp-recital-stress', label: '把表示颜色的词念得重一点', detail: '黄色、红色、彩色、金色、五彩缤纷' },
  ],
  tasks: [
    /* 1. 角色引入：只把孩子带到问题面前，不先给答案 */
    {
      id: 'autumn-intro',
      kind: 'intro',
      title: '小兔的问题',
      mascotLine: '跟我一起去找秋天的颜色吧！',
      story: {
        mascot: 'rabbit',
        mood: 'curious',
        lines: [
          '你好呀，我是小兔。',
          '秋天来了，我问小草：秋天是什么颜色？',
          '它说，让我去问问别的朋友。你陪我一起去问问好不好？',
        ],
      },
    },
    /* 2. 知识发现：四张卡，一个朋友说一种颜色 */
    {
      id: 'autumn-discover',
      kind: 'discover',
      title: '四个朋友，四种颜色',
      instruction: '点一点每一张小卡片，听听它们怎么说。',
      mascotLine: '一个朋友说一种颜色，我们一个一个听。',
      knowledgePointIds: ['kp-autumn-change'],
      discovery: {
        cards: [
          {
            id: 'card-grass',
            icon: 'plant',
            tone: 'life',
            title: '小草说：秋天是黄色的',
            body: '夏天的小草是绿油油的。秋风一吹，它慢慢换成了黄色的衣服。',
          },
          {
            id: 'card-maple',
            icon: 'leaf',
            tone: 'art',
            title: '枫叶说：秋天是红色的',
            body: '枫叶红红的，远远看去，像一团燃烧的小火苗。',
          },
          {
            id: 'card-chrysanthemum',
            icon: 'flower',
            tone: 'music',
            title: '菊花说：秋天是彩色的',
            body: '菊花一层一层的花瓣里，藏着黄色、白色和紫色。',
          },
          {
            id: 'card-rice',
            icon: 'grains',
            tone: 'explore',
            title: '稻谷说：秋天是金色的',
            body: '稻谷金黄金黄，沉甸甸地弯下腰，好像在笑。',
          },
        ],
      },
    },
    /* 3. 动手探索：拖时间，看小草换衣服 */
    {
      id: 'autumn-grass',
      kind: 'interaction',
      title: '小草换衣服',
      instruction: '把时间从夏天拖到秋天，看看小草变成什么颜色。',
      mascotLine: '慢慢地拖，颜色是一点一点变的。',
      knowledgePointIds: ['kp-autumn-grass'],
      interactions: [
        {
          kind: 'slider-explore',
          prompt: '把时间拖到小草变黄的时候',
          hint: '越来越靠近秋天，小草的绿色就越来越少。',
          successLine: '你看，小草真的换上了黄色的衣服！它没有说错。',
          stars: 2,
          payload: {
            min: 6,
            max: 10,
            step: 1,
            initial: 6,
            minLabel: '夏天',
            maxLabel: '秋天',
            unit: '月',
            target: 10,
            states: [
              { from: 6, emoji: '🟩', caption: '夏天的小草，绿油油的。' },
              { from: 8, emoji: '🌿', caption: '秋天近了，小草的颜色开始变浅。' },
              { from: 9, emoji: '🟡', caption: '小草的绿衣服，慢慢变成了黄色。' },
              { from: 10, emoji: '🍂', caption: '看，小草全黄了 —— 它说的「我的衣服变黄了」，一点都没错。' },
            ],
          },
        },
      ],
    },
    /* 4. 动手探索：枫叶说它像什么 */
    {
      id: 'autumn-maple',
      kind: 'interaction',
      title: '枫叶像什么',
      instruction: '枫叶说它像一样东西。点一下你觉得对的那个。',
      mascotLine: '它是红红的，好像还在轻轻跳动。',
      knowledgePointIds: ['kp-autumn-maple'],
      interactions: [
        {
          kind: 'choose-one',
          prompt: '枫叶说，它像什么？',
          hint: '红红的、亮亮的，风一吹还会轻轻跳。',
          successLine: '对啦！枫叶红得像一团燃烧的小火苗。',
          retryLine: '再想一想那片红红的、好像会跳动的东西。',
          stars: 1,
          payload: {
            layout: 'scene',
            columns: 2,
            options: [
              { id: 'flame', label: '一团小火苗', emoji: '🔥', correct: true, tone: 'art' },
              { id: 'butterfly', label: '一只蝴蝶', emoji: '🦋', tone: 'science' },
              { id: 'umbrella', label: '一把小伞', emoji: '☂️', tone: 'life' },
              { id: 'boat', label: '一条小船', emoji: '⛵', tone: 'explore' },
            ],
          },
        },
      ],
    },
    /* 5. 动手探索：菊花的花瓣里藏着什么颜色 */
    {
      id: 'autumn-chrysanthemum',
      kind: 'interaction',
      title: '菊花花瓣里的颜色',
      instruction: '在菊花丛里点一点，找出 3 种花瓣的颜色。',
      mascotLine: '花瓣一层一层的，颜色不一样哦。',
      knowledgePointIds: ['kp-autumn-chrysanthemum'],
      interactions: [
        {
          kind: 'hotspot-explore',
          prompt: '找出菊花藏起来的 3 种颜色',
          successLine: '你找到了！菊花的花瓣里，真的藏着好几种颜色。',
          stars: 2,
          payload: {
            backgroundTone: 'art',
            requiredCount: 3,
            hotspots: [
              { id: 'petal-yellow', label: '黄色花瓣', emoji: '🟡', x: 28, y: 32, reveal: '最外面这一圈，是亮亮的黄色。' },
              { id: 'petal-white', label: '白色花瓣', emoji: '⚪', x: 68, y: 24, reveal: '中间的花瓣雪白雪白的。' },
              { id: 'petal-purple', label: '紫色花瓣', emoji: '🟣', x: 44, y: 72, reveal: '最里面还藏着紫色的小花瓣。' },
              { id: 'chrysanthemum-leaf', label: '绿叶', emoji: '🍃', x: 86, y: 66, reveal: '叶子是绿色的。它不是花瓣，但别忘了谢谢它给花送来养分。' },
            ],
          },
        },
      ],
    },
    /* 6. 动手探索：稻田里的金色（最难的一句，永远留一个出口） */
    {
      id: 'autumn-rice',
      kind: 'interaction',
      title: '稻田里的金色',
      instruction: '在秋天的稻田里，找出诗里说到的 2 样东西。',
      mascotLine: '诗里说，稻谷是金色的，还笑弯了腰。',
      knowledgePointIds: ['kp-autumn-rice'],
      interactions: [
        {
          kind: 'tap-target',
          prompt: '找出诗里说的 2 样东西',
          hint: '一样是金黄的颜色，一样是弯下去的样子。',
          successLine: '找得真准！金黄的稻谷，沉甸甸地笑弯了腰。',
          stars: 3,
          skippable: true,
          payload: {
            backgroundTone: 'life',
            requiredCount: 2,
            targets: [
              { id: 'rice', label: '金黄的稻谷', emoji: '🌾', x: 26, y: 38, correct: true },
              { id: 'bow', label: '笑弯了腰', emoji: '🙇', x: 68, y: 52, correct: true },
              { id: 'apple', label: '红苹果', emoji: '🍎', x: 14, y: 70, hint: '稻谷是金色的，红苹果是别的时候的水果哦。' },
              { id: 'snowflake', label: '雪花', emoji: '❄️', x: 82, y: 20, hint: '雪花是冬天的，再找找金色的东西。' },
            ],
          },
        },
      ],
    },
    /* 7. 小试身手：把四个朋友的回答送回颜色篮子 */
    {
      id: 'autumn-color-basket',
      kind: 'practice',
      title: '把颜色送回小篮子',
      instruction: '把每一样东西，拖到它说的那个颜色旁边。',
      mascotLine: '想不起来也没关系，回到上面再看一眼它们的卡片。',
      knowledgePointIds: ['kp-autumn-grass', 'kp-autumn-maple', 'kp-autumn-chrysanthemum', 'kp-autumn-rice'],
      interactions: [
        {
          kind: 'drag-drop',
          prompt: '把每一样东西放到它说的颜色里',
          hint: '小草说黄、枫叶说红、菊花说彩、稻谷说金，一个一个对过去。',
          successLine: '全都送对啦！黄色、红色、彩色、金色合起来，就是五彩缤纷的秋天。',
          stars: 3,
          payload: {
            // 框和物品都刻意**不给色调**：这一题问的就是颜色本身，
            // 一旦给底色，孩子不用读字、直接看颜色配对就答对了 —— 那就不是在学。
            zones: [
              { id: 'z-yellow', label: '黄色', emoji: '🟡', accepts: ['c-grass'] },
              { id: 'z-red', label: '红色', emoji: '🔴', accepts: ['c-maple'] },
              { id: 'z-colorful', label: '彩色', emoji: '🌈', accepts: ['c-chrysanthemum'] },
              { id: 'z-gold', label: '金色', emoji: '🌟', accepts: ['c-rice'] },
            ],
            items: [
              { id: 'c-grass', label: '小草', emoji: '🍃' },
              { id: 'c-maple', label: '枫叶', emoji: '🍁' },
              { id: 'c-chrysanthemum', label: '菊花', emoji: '🌼' },
              { id: 'c-rice', label: '稻谷', emoji: '🌾' },
            ],
          },
        },
      ],
    },
    /* 8. 挑战任务：把秋天念出来 —— 先排句子，再点重音 */
    {
      id: 'autumn-recite',
      kind: 'challenge',
      title: '挑战：把秋天念出来',
      instruction: '先把句子排好，再点出该念得重一点的词。',
      mascotLine: '念的时候，句子和句子之间停一停，会好听很多。',
      knowledgePointIds: ['kp-recital-pause', 'kp-recital-stress'],
      interactions: [
        {
          kind: 'drag-sort',
          prompt: '把秋天的句子按顺序排好',
          hint: '先从「秋天来了」开始，最后一句在问：秋天到底是什么颜色？',
          successLine: '排得真好！这就是《秋天的颜色》的顺序。',
          stars: 2,
          skippable: true,
          payload: {
            axisHint: '从第一句到最后一句',
            items: [
              { id: 's5', label: '枫叶说：秋天是红色的', emoji: '🍁' },
              { id: 's1', label: '秋天来了', emoji: '🍂' },
              { id: 's8', label: '秋天，原来是五彩缤纷的！', emoji: '🌈' },
              { id: 's3', label: '小草说：秋天是黄色的', emoji: '🍃' },
              { id: 's6', label: '菊花说：秋天是彩色的', emoji: '🌼' },
              { id: 's2', label: '秋天，是什么颜色？', emoji: '❓' },
              { id: 's7', label: '稻谷说：秋天是金色的', emoji: '🌾' },
              { id: 's4', label: '你看，我的衣服变黄了', emoji: '🟡' },
            ],
            correctOrder: ['s1', 's2', 's3', 's4', 's5', 's6', 's7', 's8'],
          },
        },
        {
          kind: 'choose-many',
          prompt: '点出要念得重一点的词',
          hint: '表示颜色的那些词，念重一点最好听。',
          successLine: '对啦！把颜色念重一点，秋天的味道就出来了。',
          retryLine: '再想想，哪几个词是在说「什么颜色」？',
          stars: 3,
          skippable: true,
          payload: {
            columns: 3,
            requiredCount: 6,
            // 不给色调：全部走中性底色，免得「颜色 = 答案」又被说出来一次。
            options: [
              { id: 'w-autumn', label: '秋天', correct: true },
              { id: 'w-yellow', label: '黄色', correct: true },
              { id: 'w-red', label: '红色', correct: true },
              { id: 'w-colorful', label: '彩色', correct: true },
              { id: 'w-gold', label: '金色', correct: true },
              { id: 'w-rainbow', label: '五彩缤纷', correct: true },
              { id: 'w-grass', label: '小草', hint: '「小草」是在说谁，不是在说什么颜色。' },
              { id: 'w-say', label: '说', hint: '「说」只是动作，不用念重。' },
              { id: 'w-clothes', label: '衣服', hint: '「衣服」是在说东西，不是在说什么颜色。' },
            ],
          },
        },
      ],
    },
    /* 9. 领取奖励：说清楚孩子做到了什么 */
    {
      id: 'autumn-reward',
      kind: 'reward',
      title: '领取奖励',
      reward: {
        stars: 3,
        message: '你问过小草、枫叶、菊花和稻谷，找到了秋天的四种颜色。',
      },
    },
  ],
  reward: {
    stars: 3,
    badgeId: 'reading-star',
    message: '秋天的颜色探索完成！',
    unlocksTopicIds: ['nursery-language-autumn-colors-challenge'],
  },
}
