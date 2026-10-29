import type { Topic } from "@/domain";

/** 一年级上册数学目录：源于 cn-math-taxonomy 的 26 个知识点；仅导入提纲，不含诊断题或练习题。 */
export const topics: Topic[] = [
  {
    id: "grade-1-math-u1",
    gradeId: "grade-1",
    categoryId: "grade-1-math",
    title: "第1单元 · 5以内数的认识和加、减法",
    kind: "standard",
    order: 1,
    level: 1,
    objectives: [
      "认识并读写 1 到 5，比较大小与顺序，学习数的分与合以及 5 以内加减。",
    ],
    knowledgePoints: [
      {
        id: "kp-cnm-p001",
        label: "1到5各数的认识",
        detail:
          "能在数量和数字之间来回，认读并写出 1 到 5。 学习表现：能按顺序数出 1 到 5；能说出一个数的前一个和后一个。",
      },
      {
        id: "kp-cnm-p002",
        label: "5以内数的大小",
        detail:
          "会用大于、小于、等于比较 5 以内的数。 学习表现：能判断两个 5 以内数谁大谁小；知道相等就是同样多。",
      },
      {
        id: "kp-cnm-p003",
        label: "几和第几",
        detail:
          "能分清「有几个」和「第几个」。 学习表现：能说出一共有几个；能指出从左边数第几个。",
      },
      {
        id: "kp-cnm-p004",
        label: "5以内数的分与合",
        detail:
          "知道 5 以内的数可以分成哪两个数，又可以合起来。 学习表现：能把 5 分成两个数；能把两个数合成一个数。",
      },
      {
        id: "kp-cnm-p005",
        label: "0的认识",
        detail:
          "知道 0 表示一个也没有，会读写 0。 学习表现：能说出 0 表示一个也没有；知道 0 比 1 小。",
      },
      {
        id: "kp-cnm-p006",
        label: "5以内的加法",
        detail:
          "会计算得数不超过 5 的加法。 学习表现：能算出 5 以内的加法；知道加法是把两部分合起来。",
      },
      {
        id: "kp-cnm-p007",
        label: "5以内的减法",
        detail:
          "会计算 5 以内的减法。 学习表现：能算出 5 以内的减法；知道减法是去掉一部分。",
      },
    ],
    lessonIds: [],
  },
  {
    id: "grade-1-math-u2",
    gradeId: "grade-1",
    categoryId: "grade-1-math",
    title: "第2单元 · 6～10的认识和加、减法",
    kind: "standard",
    order: 2,
    level: 2,
    objectives: [
      "认识 6～10，掌握 10 以内比较、加减、连加连减和加减混合，并解决简单情境问题。",
    ],
    knowledgePoints: [
      {
        id: "kp-cnm-p008",
        label: "6～10各数的认识",
        detail:
          "能认、读、写 6 到 10，知道 10 是由 10 个一组成的。 学习表现：能按顺序从 6 数到 10；知道 9 的后面是 10。",
      },
      {
        id: "kp-cnm-p009",
        label: "10以内数的比较",
        detail:
          "会比较 10 以内两个数的大小。 学习表现：能说出谁大谁小；会用减法求出多几或少几。",
      },
      {
        id: "kp-cnm-p010",
        label: "10以内的加法",
        detail:
          "会计算得数不超过 10 的加法。 学习表现：能口算 10 以内的加法；能解决把两部分合起来的简单问题。",
      },
      {
        id: "kp-cnm-p011",
        label: "10以内的减法",
        detail:
          "会计算 10 以内的减法。 学习表现：能口算 10 以内的减法；能解决从总数里去掉一部分的问题。",
      },
      {
        id: "kp-cnm-p012",
        label: "连加和连减",
        detail:
          "会计算三个数的连加、连减，从左往右算。 学习表现：能按从左到右计算连加；能按从左到右计算连减。",
      },
      {
        id: "kp-cnm-p013",
        label: "10以内加减混合",
        detail:
          "会计算 10 以内的加减混合，从左往右依次算。 学习表现：能按从左到右计算加减混合；能检查得数有没有超过 10。",
      },
      {
        id: "kp-cnm-p253",
        label: "用加减法解决问题",
        detail:
          "会从图画和生活情境中找出已知的数和要求的问题，用 10 以内的加法或减法解决，并说出得数的意思。 学习表现：能分清「合起来」用加法、「去掉」用减法；能列出算式并算出得数。",
      },
    ],
    lessonIds: [],
  },
  {
    id: "grade-1-math-u3",
    gradeId: "grade-1",
    categoryId: "grade-1-math",
    title: "第3单元 · 认识立体图形",
    kind: "standard",
    order: 3,
    level: 1,
    objectives: [
      "辨认长方体、正方体、圆柱和球，观察它们的面与滚动特点，并尝试用图形拼搭。",
    ],
    knowledgePoints: [
      {
        id: "kp-cnm-p014",
        label: "认识长方体、正方体、圆柱和球",
        detail:
          "能辨认长方体、正方体、圆柱和球，说出它们摸起来的大致特点。 学习表现：能从实物中指出这四种立体图形；知道球容易滚动、长方体有平平的面。",
      },
      {
        id: "kp-cnm-p254",
        label: "拼一拼",
        detail:
          "会用长方体、正方体、圆柱和球等立体图形拼搭简单的物体，知道哪些形状能稳稳叠放、哪些容易滚动。 学习表现：能用积木拼出简单的物体；知道球容易滚动，不适合叠在下面。",
      },
    ],
    lessonIds: [],
  },
  {
    id: "grade-1-math-game-position",
    gradeId: "grade-1",
    categoryId: "grade-1-math",
    title: "综合与实践 · 上下前后左右",
    kind: "standard",
    order: 4,
    level: 1,
    objectives: [
      "在具体场景中用上下、前后、左右描述位置，并注意观察方向改变时左右关系也会改变。",
    ],
    knowledgePoints: [
      {
        id: "kp-cnm-p015",
        label: "上下前后左右",
        detail:
          "会用上、下、前、后、左、右描述物体的相对位置。 学习表现：能用上下前后左右说出物体在哪里；知道换一个观察的人，左右可能不一样。",
      },
    ],
    lessonIds: [],
  },
  {
    id: "grade-1-math-u4",
    gradeId: "grade-1",
    categoryId: "grade-1-math",
    title: "第4单元 · 11～20的认识",
    kind: "standard",
    order: 5,
    level: 2,
    objectives: [
      "认识 11～20，理解十位和个位的含义，并进行 20 以内不进位加法。",
    ],
    knowledgePoints: [
      {
        id: "kp-cnm-p016",
        label: "11～20各数的认识",
        detail:
          "能认读写 11 到 20，知道十几是 1 个十和几个一。 学习表现：能读出 11 到 20；知道 20 是 2 个十。",
      },
      {
        id: "kp-cnm-p017",
        label: "十位和个位",
        detail:
          "知道两位数里十位上的数表示几个十，个位上的数表示几个一。 学习表现：能说出一个两位数的十位和个位；能根据十位、个位写出这个数。",
      },
      {
        id: "kp-cnm-p018",
        label: "20以内不进位加法",
        detail:
          "会计算十几加几、十几加整十这类不进位的加法。 学习表现：能算出不进位的十几加几；知道个位和个位相加。",
      },
    ],
    lessonIds: [],
  },
  {
    id: "grade-1-math-u5",
    gradeId: "grade-1",
    categoryId: "grade-1-math",
    title: "第5单元 · 20以内的进位加法",
    kind: "standard",
    order: 6,
    level: 3,
    objectives: [
      "理解凑十法，掌握 9、8、7、6、5、4、3、2 加几，并用加法解决已知总数求部分的问题。",
    ],
    knowledgePoints: [
      {
        id: "kp-cnm-p019",
        label: "凑十法",
        detail:
          "会把一个加数拆开，先凑成 10，再算进位加法。 学习表现：能说出先凑 10 再算剩下的；能用凑十算出 9 加几。",
      },
      {
        id: "kp-cnm-p020",
        label: "9加几",
        detail:
          "会用凑十法计算 9 加几。 学习表现：能口算 9 加几；能说出凑十的过程。",
      },
      {
        id: "kp-cnm-p021",
        label: "8、7、6加几",
        detail:
          "会用凑十法计算 8 加几、7 加几和 6 加几。 学习表现：能口算 8、7、6 加几；能把进位加法用在简单问题里。",
      },
      {
        id: "kp-cnm-p251",
        label: "5、4、3、2加几",
        detail:
          "会用凑十法计算 5、4、3、2 加几（得数在 11 到 14），如 4＋9、3＋8：可先把大数放在前面，再凑十。 学习表现：能把 4＋9 看成 9＋4 再凑十；能算出 5、4、3、2 加几的得数。",
      },
      {
        id: "kp-cnm-p252",
        label: "逆向用加法解决问题",
        detail:
          "已知总数和其中一部分，求另一部分时，会想「加几等于总数」来解决问题，如 9＋□＝15。 学习表现：能说出已知什么、要求什么；能用「想加算减」求出另一部分。",
      },
    ],
    lessonIds: [],
  },
  {
    id: "grade-1-math-game-classify",
    gradeId: "grade-1",
    categoryId: "grade-1-math",
    title: "综合与实践 · 找一找、分一分",
    kind: "standard",
    order: 7,
    level: 1,
    objectives: ["从校园和生活中观察、数数，并按清楚的标准将物品分类。"],
    knowledgePoints: [
      {
        id: "kp-cnm-p022",
        label: "找一找、分一分",
        detail:
          "能在校园、操场等地方找一找、数一数，用数介绍身边的事物，并按一种标准把物品分成两类。 学习表现：能用数说出身边事物的个数；能说出自己分类用的标准。",
      },
    ],
    lessonIds: [],
  },
];
