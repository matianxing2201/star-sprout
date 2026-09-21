import type { Lesson } from '@/domain'

/**
 * 教案模板（可复制）
 * ================
 *
 * 把一份教案转成课程时，从这个文件复制一份到
 * `src/content/grades/<年级>/lessons/<课程名>.ts`，然后逐项填写。
 *
 * 它同时是**类型检查的活文档**：字段改了而模板没跟上，`pnpm typecheck` 会报错。
 * 注意它不参与内容包总装（`src/content/index.ts` 不会 import 它），因此可以安全保留。
 *
 * 六段式节奏（顺序固定，测试会断言首尾）：
 *   intro → discover → interaction → practice → challenge → reward
 */
export const lessonTemplate: Lesson = {
  // id 约定：<年级>-<领域>-<主题>-<序号>
  id: 'template-category-topic-1',
  gradeId: 'nursery',
  categoryId: 'nursery-language',
  topicId: 'template-topic',

  title: '课程名称（孩子看得懂的一句话）',
  emoji: '🌸',
  question: '今天要探索什么？（一个能勾住好奇心的问题）',

  // 陪孩子上这节课的角色
  mascot: 'bear',
  // 预计时长（分钟）。儿童单节课建议 5~10 分钟
  minutes: 8,
  // 该领域的色调，决定这一课的配色
  tone: 'language',

  // 学习目标：写给家长与教师看的，不直接展示给孩子
  objectives: [
    '能做到的第一件事',
    '能做到的第二件事',
  ],

  // 知识点：必须与主题的 knowledgePoints 对齐，否则家长端的薄弱点无法命名
  knowledgePoints: [
    { id: 'kp-template-a', label: '知识点 A' },
    { id: 'kp-template-b', label: '知识点 B' },
  ],

  tasks: [
    /* 1. 角色引入：三句话把孩子带进来，不解释课程结构 */
    {
      id: 'template-intro',
      kind: 'intro',
      title: '角色引入',
      story: {
        mascot: 'bear',
        mood: 'curious',
        lines: [
          '第一句：打招呼。',
          '第二句：抛出今天的问题。',
          '第三句：邀请孩子一起动手。',
        ],
      },
    },

    /* 2. 知识发现：一张卡只讲一件事，点开才出现正文 */
    {
      id: 'template-discover',
      kind: 'discover',
      title: '知识发现',
      instruction: '点一点每一张小卡片，看看藏着什么。',
      knowledgePointIds: ['kp-template-a'],
      discovery: {
        cards: [
          { id: 'card-1', emoji: '💡', title: '小标题', body: '一句话说清楚。', tone: 'think' },
          { id: 'card-2', emoji: '🔍', title: '小标题', body: '一句话说清楚。', tone: 'science' },
        ],
      },
    },

    /* 3. 动手探索：第一次动手，难度最低 */
    {
      id: 'template-interaction',
      kind: 'interaction',
      title: '动手探索',
      instruction: '给孩子的操作说明，一句话。',
      mascotLine: '角色在这一步说的话。',
      knowledgePointIds: ['kp-template-a'],
      interactions: [
        {
          kind: 'choose-one',
          prompt: '点一下你觉得对的答案',
          hint: '答错两次后出现的提示，只给方向不给答案。',
          successLine: '做对时角色说的话。',
          retryLine: '差一点点时角色说的话。',
          stars: 1,
          payload: {
            layout: 'scene',
            columns: 2,
            options: [
              { id: 'a', label: '正确答案', emoji: '✅', correct: true, tone: 'language' },
              { id: 'b', label: '干扰项', emoji: '❓', hint: '这个选项为什么不对。', tone: 'think' },
            ],
          },
        },
      ],
    },

    /* 4. 小试身手：练习，可以比互动稍难 */
    {
      id: 'template-practice',
      kind: 'practice',
      title: '小试身手',
      knowledgePointIds: ['kp-template-b'],
      interactions: [
        {
          kind: 'choose-many',
          prompt: '把它们全都找出来',
          stars: 2,
          payload: {
            columns: 3,
            options: [
              { id: 'x1', label: '对的', correct: true, tone: 'language' },
              { id: 'x2', label: '错的', correct: false, hint: '为什么不对。', tone: 'think' },
            ],
          },
        },
      ],
    },

    /* 5. 挑战任务：拔高，建议允许跳过（在 interaction 上写 skippable） */
    {
      id: 'template-challenge',
      kind: 'challenge',
      title: '挑战任务',
      knowledgePointIds: ['kp-template-b'],
      interactions: [
        {
          kind: 'drag-sort',
          prompt: '按顺序排一排',
          stars: 3,
          skippable: true,
          payload: {
            axisHint: '排序依据',
            items: [{ id: 's1', label: '第一项' }, { id: 's2', label: '第二项' }],
            correctOrder: ['s1', 's2'],
          },
        },
      ],
    },

    /* 6. 奖励：结算说明，固定收尾 */
    {
      id: 'template-reward',
      kind: 'reward',
      title: '领取奖励',
      reward: { stars: 3, message: '一句具体的、说出孩子做到了什么的话。' },
    },
  ],

  reward: {
    stars: 3,
    message: '课程完成！',
    // 可选：完成后点亮课程地图上的新节点
    unlocksTopicIds: [],
    // 可选：完成后授予徽章（id 见 domain/growth/types.ts 的 BADGE_IDS）
    // badgeId: 'reading-star',
  },
}
