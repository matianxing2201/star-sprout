import type { Lesson } from '@/domain'

/**
 * 示例课程：中班 · 数学启蒙 · 数字朋友
 *
 * 这一节的玩法不是「算出答案」，而是「把答案推出来」：
 * 八个数字排成一排，有几个被遮住了，孩子靠四句话把它们逐个认回来。
 *
 * 推断链（也是题面唯一的解释，改题时照着走一遍）：
 *   数字池 2~9，八个数字互不相同 →
 *   最后一位最大，只能是 9 →
 *   第一位比 6 大，剩 6、7，只能是 7 →
 *   第二位比 5 大，剩 5、6，只能是 6 →
 *   第三位比 5 小，剩 2、5，只能是 2 →
 *   第四位就剩 5 ← 到这里八位全部确定，答案 7 6 2 5 3 8 4 9
 *
 * 中间三格露着半截笔画（数码管的段），既是给孩子的「抓手」，
 * 也是让这道题只有唯一解的钥匙 —— 内容侧改数字时，
 * schema 会挡下重复与无解，但「是否唯一」要自己按上面的链子推一遍。
 */
export const numberFriendsLesson: Lesson = {
  id: 'nursery-math-number-friends-1',
  gradeId: 'nursery',
  categoryId: 'nursery-math',
  topicId: 'nursery-math-number-friends',
  title: '数字朋友',
  icon: 'math-operations',
  question: '数字被遮住了一半，还能认出它是几吗？',
  mascot: 'fox',
  minutes: 10,
  tone: 'math',
  objectives: [
    '能听懂「比 6 大」「最大的数字」这样的条件，并照着找数',
    '能利用露出来的半截笔画，猜出被遮住的数字',
    '愿意一步一步地推，而不是随手乱贴',
  ],
  knowledgePoints: [
    { id: 'kp-number-compare', label: '比一个数大 / 小：在数字池里把符合的都挑出来' },
    { id: 'kp-number-largest', label: '最大的数字：数字池里排在最后的那一个' },
    { id: 'kp-number-different', label: '8 个数字各不相同：一个数用掉一次就不能再用' },
    { id: 'kp-number-reason', label: '先贴最确定的，剩下的会自己浮出来' },
  ],
  tasks: [
    {
      id: 'number-friends-intro',
      kind: 'intro',
      title: '小狐狸来信了',
      story: {
        mascot: 'fox',
        mood: 'curious',
        lines: [
          '你好！我是小狐狸。',
          '我在纸上写了 8 个数字朋友，它们排成一排。',
          '有几位的脸被我用树叶遮住了，只剩下半截笔画……',
          '你还认得它们吗？',
        ],
      },
    },
    {
      id: 'number-friends-discover',
      kind: 'discover',
      title: '先想明白两件事',
      instruction: '点一点卡片，看看「比 6 大」和「最大」要怎么找。',
      knowledgePointIds: ['kp-number-compare', 'kp-number-largest'],
      discovery: {
        cards: [
          {
            id: 'c-compare',
            icon: 'scales',
            tone: 'math',
            title: '比 6 大，是哪些？',
            body: '把 2 到 9 排成一队，站在 6 后面的都是「比 6 大」——有 7、8、9。',
            tip: '「比 5 小」就反过来，站在 5 前面的才算。',
          },
          {
            id: 'c-largest',
            icon: 'target',
            tone: 'explore',
            title: '谁是最大的？',
            body: '一队数字里，排在最后、谁也超不过它的那个，就是最大的数字。',
            tip: '8 个数字里最大的那个，一定只有一个。',
          },
          {
            id: 'c-different',
            icon: 'puzzle',
            tone: 'science',
            title: '每个数字只来一次',
            body: '这 8 个朋友各不相同。一个数字用掉一次，就不能再给别的格子了。',
            tip: '先用掉 9，后面就再也别想用 9 了。',
          },
        ],
      },
    },
    {
      id: 'number-friends-play',
      kind: 'interaction',
      title: '把数字贴回去',
      instruction: '看上面写着的条件，把数字块贴进方格。没被遮住的格子会露出半截笔画，帮你想起来它是几。',
      mascotLine: '先贴最确定的那个：最后一位是最大的数字。',
      knowledgePointIds: ['kp-number-reason', 'kp-number-different'],
      interactions: [
        {
          kind: 'number-tile',
          prompt: '把小狐狸的 8 个数字贴回方格里',
          hint: '先贴最后一位——它是最大的数字，只能是 9。',
          successLine: '一个格子都没错，你是一步一步推出来的！',
          retryLine: '别急，再看看条件，从最确定的那个格子重新开始。',
          stars: 3,
          payload: {
            clues: [
              '从左往右数，第一位数字比 6 大',
              '第二位数字比 5 大',
              '第三位数字比 5 小',
              '最后一位是最大的数字',
              '8 个数字都不一样',
            ],
            tiles: [2, 3, 4, 5, 6, 7, 8, 9],
            slots: [
              { id: 'slot-1', answer: 7, rule: '比 6 大的数字，除了留给最后一位的 9，还剩谁？' },
              { id: 'slot-2', answer: 6, rule: '要比 5 大。比 5 大的数里，7 已经被用掉了。' },
              { id: 'slot-3', answer: 2, rule: '这一位要比 5 小哦。' },
              { id: 'slot-4', answer: 5 },
              // 后四位里只有中间三格露出笔画，这是把答案锁死的那把钥匙；
              // 段号与 SevenSegmentDigit 的 SEGMENTS_OF 一一对应，改数字要一起改。
              { id: 'slot-5', answer: 3, visibleStrokes: [0, 1, 2, 3, 6], rule: '看看露出来的笔画，像不像 3？' },
              { id: 'slot-6', answer: 8, visibleStrokes: [0, 1, 2, 3, 4, 5, 6], rule: '这一位整整齐齐，七段都亮着。' },
              { id: 'slot-7', answer: 4, visibleStrokes: [1, 2, 5, 6] },
              { id: 'slot-8', answer: 9, rule: '最大的数字，就是数字池里最大的那个。' },
            ],
          },
        },
      ],
    },
    {
      id: 'number-friends-practice',
      kind: 'practice',
      title: '小试身手',
      instruction: '把比 5 大的数字都找出来。',
      knowledgePointIds: ['kp-number-compare'],
      interactions: [
        {
          kind: 'choose-many',
          prompt: '哪些数字比 5 大？全都选出来',
          hint: '在心里把 2 到 9 排一队，站在 5 后面的才算。',
          successLine: '全都找到了，一个都没多、一个都没漏！',
          stars: 2,
          payload: {
            columns: 4,
            options: [
              { id: 'n2', label: '2', emoji: '2️⃣', correct: false, hint: '2 排在 5 的前面，比 5 小。', tone: 'think' },
              { id: 'n6', label: '6', emoji: '6️⃣', correct: true, tone: 'math' },
              { id: 'n4', label: '4', emoji: '4️⃣', correct: false, hint: '4 比 5 小一点。', tone: 'life' },
              { id: 'n8', label: '8', emoji: '8️⃣', correct: true, tone: 'explore' },
              { id: 'n5', label: '5', emoji: '5️⃣', correct: false, hint: '5 和 5 一样大，不是「比 5 大」。', tone: 'art' },
              { id: 'n9', label: '9', emoji: '9️⃣', correct: true, tone: 'science' },
              { id: 'n3', label: '3', emoji: '3️⃣', correct: false, hint: '3 排在 5 的前面。', tone: 'social' },
              { id: 'n7', label: '7', emoji: '7️⃣', correct: true, tone: 'language' },
            ],
          },
        },
      ],
    },
    {
      id: 'number-friends-challenge',
      kind: 'challenge',
      title: '挑战：换个问法',
      instruction: '这次没有笔画帮忙了，全靠条件推。',
      mascotLine: '难一点也没关系，试试从最大的那个开始。',
      knowledgePointIds: ['kp-number-reason', 'kp-number-largest'],
      interactions: [
        {
          kind: 'number-tile',
          prompt: '三位数字，全部靠条件推出来',
          hint: '总共三个数字，其中一个是最大的数字。',
          successLine: '没有笔画帮忙也推出来了，真了不起！',
          skippable: true,
          stars: 3,
          payload: {
            clues: [
              '一共有 3 个数字，从左往右排',
              '第一位是最小的数字',
              '第三位是最大的数字',
              '第二位比第一位大，比第三位小',
              '3 个数字都不一样，从 4、5、6 里挑',
            ],
            tiles: [4, 5, 6],
            slots: [
              { id: 'c-slot-1', answer: 4, rule: '4、5、6 里最小的就是它。' },
              { id: 'c-slot-2', answer: 5, rule: '夹在中间的那个。' },
              { id: 'c-slot-3', answer: 6, rule: '4、5、6 里最大的就是它。' },
            ],
          },
        },
      ],
    },
    {
      id: 'number-friends-reward',
      kind: 'reward',
      title: '领取奖励',
      reward: { stars: 3, message: '你把 8 个数字朋友全都认回来了。' },
    },
  ],
  reward: {
    stars: 3,
    message: '数字朋友都回家啦！',
    badgeId: 'math-explorer',
  },
}
