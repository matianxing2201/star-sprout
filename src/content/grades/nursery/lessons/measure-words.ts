import type { Lesson } from '@/domain'

/**
 * 示例课程：中班 · 语言表达 · 量词小魔法师
 *
 * 中文里给东西数数，要给东西戴上不同的「小帽子」——这就是量词。
 * 但孩子记不住搭配，不是因为他不够聪明，而是因为「搭配」这件事
 * 只有在嘴里说、在手里配的时候才学得会。
 *
 * 所以这一课没有一道选择题：
 *   盖印章（拿起量词盖到东西上）→ 拖回家（把大自然的东西送到量词旁边）
 *   → 连一连（把好吃的东西和量词牵起来）—— 三步全是「动手配一配」，
 *   最后把配好的短语连成一句话读出来，那才是这一课真正的学习结果。
 */
export const measureWordsLesson: Lesson = {
  id: 'nursery-language-measure-words-1',
  gradeId: 'nursery',
  categoryId: 'nursery-language',
  topicId: 'nursery-language-measure-words',
  title: '量词小魔法师',
  icon: 'stamp',
  question: '为什么说「一座城堡」，不说「一个城堡」？',
  mascot: 'fox',
  minutes: 10,
  tone: 'language',
  objectives: [
    '能把「座」「辆」「条」「列」「架」用到对应的东西上',
    '能给云、叶子、大树、山和河找到合适的量词',
    '愿意用量词把好几样东西连成一句话说一遍',
  ],
  knowledgePoints: [
    { id: 'kp-measure-concept', label: '量词就是数东西时用的那个词', detail: '例如「一座城堡」里的「座」' },
    { id: 'kp-measure-building', label: '建筑物量词：座', detail: '一座城堡、一座桥' },
    { id: 'kp-measure-vehicle', label: '交通工具量词：辆 / 条 / 列 / 架', detail: '一辆汽车、一条马路、一列火车、一架飞机' },
    { id: 'kp-measure-nature', label: '大自然与植物量词：朵 / 片 / 棵', detail: '一朵云、一片叶子、一棵大树、一座山、一条河' },
    { id: 'kp-measure-food', label: '食物量词：片 / 块 / 根 / 个 / 串', detail: '一片面包、一块蛋糕、一根胡萝卜、一个苹果、一串葡萄' },
  ],
  tasks: [
    /* 1. 角色引入：只把孩子带到问题面前，不讲语法 */
    {
      id: 'measure-intro',
      kind: 'intro',
      title: '小狐狸的印章盒',
      mascotLine: '跟我一起去盖印章吧！',
      story: {
        mascot: 'fox',
        mood: 'curious',
        lines: [
          '你好呀，我是小狐狸。',
          '我数东西的时候发现一件怪事：中文里数东西，要给每样东西戴上一顶「小帽子」。',
          '城堡戴「座」，汽车戴「辆」……你想不想亲手给它们盖一盖？',
        ],
      },
    },
    /* 2. 知识发现：五张卡，一张卡只讲一顶小帽子 */
    {
      id: 'measure-discover',
      kind: 'discover',
      title: '每样东西的小帽子',
      instruction: '点一点每一张小卡片，看看它们各戴哪顶小帽子。',
      mascotLine: '一顶一顶看，就不难啦。',
      knowledgePointIds: ['kp-measure-concept'],
      discovery: {
        cards: [
          {
            id: 'card-castle',
            icon: 'castle',
            tone: 'language',
            title: '一座城堡',
            body: '高高大大的房子、桥这样稳稳立着的东西，数它的时候说「一座」。',
          },
          {
            id: 'card-car',
            icon: 'car',
            tone: 'explore',
            title: '一辆汽车',
            body: '带轮子会跑的车子，数它的时候说「一辆」。',
          },
          {
            id: 'card-cloud',
            icon: 'cloud',
            tone: 'science',
            title: '一朵云',
            body: '天上飘着的、圆圆的轻软东西，数它的时候说「一朵」。',
          },
          {
            id: 'card-tree',
            icon: 'tree',
            tone: 'life',
            title: '一棵大树',
            body: '从地上长出来的一株植物，数它的时候说「一棵」。',
          },
          {
            id: 'card-hat',
            icon: 'speaker',
            tone: 'think',
            title: '自己的小帽子',
            body: '每样东西都有自己的小帽子，戴对了说起来才好听。',
          },
        ],
      },
    },
    /* 3. 动手探索：量词印章 —— 拿起一顶小帽子，盖到东西上 */
    {
      id: 'measure-stamp',
      kind: 'interaction',
      title: '盖量词印章',
      instruction: '先点一个量词印章，再点到东西上，把它盖好。',
      mascotLine: '拿不准也没关系，换一个印章再试试。',
      knowledgePointIds: ['kp-measure-concept', 'kp-measure-building', 'kp-measure-vehicle'],
      interactions: [
        {
          kind: 'measure-stamp',
          prompt: '给每样东西盖上对的印章',
          hint: '先看看它是稳稳立着的大东西，还是长长的一条，或者是会飞的，再挑印章。',
          successLine: '全都盖对啦！一座城堡、一辆汽车，这样说起来真好听。',
          stars: 3,
          payload: {
            measures: [
              { id: 'zuo', label: '座', tone: 'language' },
              { id: 'liang', label: '辆', tone: 'explore' },
              { id: 'tiao', label: '条', tone: 'math' },
              { id: 'lie', label: '列', tone: 'science' },
              { id: 'jia', label: '架', tone: 'think' },
            ],
            items: [
              { id: 'm-castle', label: '城堡', emoji: '🏰', measureId: 'zuo' },
              { id: 'm-car', label: '汽车', emoji: '🚗', measureId: 'liang' },
              { id: 'm-bridge', label: '桥', emoji: '🌉', measureId: 'zuo' },
              { id: 'm-road', label: '马路', emoji: '🛣️', measureId: 'tiao' },
              { id: 'm-train', label: '火车', emoji: '🚂', measureId: 'lie' },
              { id: 'm-plane', label: '飞机', emoji: '✈️', measureId: 'jia' },
            ],
            recital: '一座城堡、一辆汽车、一座桥、一条马路、一列火车、一架飞机。',
          },
        },
      ],
    },
    /* 4. 小试身手：把大自然的东西拖到量词旁边 */
    {
      id: 'measure-nature',
      kind: 'practice',
      title: '给大自然找量词',
      instruction: '把每样东西，拖到它自己的量词旁边。',
      mascotLine: '慢慢来，想一想它是圆圆的、薄薄的，还是高高的。',
      knowledgePointIds: ['kp-measure-nature'],
      interactions: [
        {
          kind: 'drag-drop',
          prompt: '把东西放到对的量词旁边',
          hint: '天上飘的、树上长的、又长又弯的，样子都不一样，看清楚再放。',
          successLine: '一朵云、一片叶子、一棵大树，你全放对啦！',
          stars: 2,
          payload: {
            zones: [
              { id: 'z-duo', label: '一朵', tone: 'science', accepts: ['n-cloud'] },
              { id: 'z-pian', label: '一片', tone: 'art', accepts: ['n-leaf'] },
              { id: 'z-ke', label: '一棵', tone: 'life', accepts: ['n-tree'] },
              { id: 'z-zuo', label: '一座', tone: 'language', accepts: ['n-mountain'] },
              { id: 'z-tiao', label: '一条', tone: 'explore', accepts: ['n-river'] },
            ],
            items: [
              // 物品的色调刻意与正确答案的框错开一位：
              // 颜色只是让画面好看，不能变成「看颜色就知道答案」的暗号。
              { id: 'n-cloud', label: '云', emoji: '☁️', tone: 'art' },
              { id: 'n-leaf', label: '叶子', emoji: '🍃', tone: 'life' },
              { id: 'n-tree', label: '大树', emoji: '🌳', tone: 'language' },
              { id: 'n-mountain', label: '山', emoji: '⛰️', tone: 'explore' },
              { id: 'n-river', label: '河', emoji: '🌊', tone: 'science' },
            ],
          },
        },
      ],
    },
    /* 5. 挑战任务：把好吃的东西和量词牵起来（最硬的一步，永远留一个出口） */
    {
      id: 'measure-food',
      kind: 'challenge',
      title: '给好吃的连一连',
      instruction: '把左边的量词，连到右边对的东西上。',
      mascotLine: '连错了线会自己擦掉，一点都不用怕。',
      knowledgePointIds: ['kp-measure-food'],
      interactions: [
        {
          kind: 'connect-line',
          prompt: '把量词和吃的东西连起来',
          hint: '想想哪样东西是薄薄一片、哪样是圆圆的一整个、哪样是一小颗一小颗串起来的。',
          successLine: '一片面包、一块蛋糕、一根胡萝卜，你连得真准！',
          stars: 3,
          skippable: true,
          payload: {
            left: [
              { id: 'l-pian', label: '一片' },
              { id: 'l-kuai', label: '一块' },
              { id: 'l-gen', label: '一根' },
              { id: 'l-ge', label: '一个' },
              { id: 'l-chuan', label: '一串' },
            ],
            right: [
              { id: 'r-bread', label: '面包', emoji: '🍞' },
              { id: 'r-cake', label: '蛋糕', emoji: '🍰' },
              { id: 'r-carrot', label: '胡萝卜', emoji: '🥕' },
              { id: 'r-apple', label: '苹果', emoji: '🍎' },
              { id: 'r-grape', label: '葡萄', emoji: '🍇' },
            ],
            pairs: [
              ['l-pian', 'r-bread'],
              ['l-kuai', 'r-cake'],
              ['l-gen', 'r-carrot'],
              ['l-ge', 'r-apple'],
              ['l-chuan', 'r-grape'],
            ],
          },
        },
      ],
    },
    /* 6. 领取奖励：说清楚孩子做到了什么 */
    {
      id: 'measure-reward',
      kind: 'reward',
      title: '领取奖励',
      reward: {
        stars: 3,
        message: '你给城堡、汽车、云朵、大树和好吃的东西，都戴上了对的量词。',
      },
    },
  ],
  reward: {
    stars: 3,
    message: '量词小魔法师完成！',
    unlocksTopicIds: ['nursery-language-measure-words-challenge'],
  },
}
