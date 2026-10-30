import type { InteractionSpec } from "@/domain";
import { publicAsset } from "@/shared/utils";

/** 单题预览：确认交互与视觉后，再决定如何导入本单元的完整题库。 */
export const grade1MathUnitTwoSample = {
  id: "cnm_p008_q1",
  knowledgePointId: "kp-cnm-p008",
  prompt: "9 的后面一个数是几？",
  answer: "10",
  explanation: "9 再添 1 是 10。",
  source: {
    name: "cn-math-taxonomy",
    url: "https://github.com/xiaoyang111222/cn-math-taxonomy/blob/main/data/questions.json",
    licenseUrl: "https://creativecommons.org/licenses/by-nc/4.0/",
  },
  interaction: {
    kind: "find-pattern",
    prompt: "9 的后面一个数是几？",
    payload: {
      sequence: [6, 7, 8, 9, 10],
      blankIndex: 4,
      options: [8, 10, 9],
    },
    hint: "从 9 开始，接着往后数一个数。",
    retryLine: "不着急，顺着数字再看一看。",
    successLine: "佩奇和你一起找到了 9 后面的数！",
  } satisfies InteractionSpec,
  pictureAnswer: "6",
  pictureExplanation: "5、6、7、8、9 按顺序排列，5 和 7 中间是 6。",
  pictureInteraction: {
    kind: "find-pattern",
    prompt: "5，？，7，8，9。空格里应该填几？",
    payload: {
      sequence: [5, 6, 7, 8, 9],
      blankIndex: 1,
      options: [4, 6, 8],
      hint: "从 5 开始往后数，再看看 7 前面一个数是什么。",
      illustration: {
        backgroundImage: publicAsset("images/activities/number-sequence-garden.webp"),
        characterImage: publicAsset("images/characters/peppa.png"),
        description: "佩奇在公园小路旁看着 5、空格、7、8、9 的数字石板。",
      },
    },
    hint: "先想一想，5 后面一个数是什么。",
    retryLine: "沿着数字小路再数一数。",
    successLine: "你帮佩奇找到了数字小路上缺少的数！",
  } satisfies InteractionSpec,
};
