import type { TextbookQuestionBank } from '@/domain'

import source from './chinese-question-bank.json'

/** 一年级上册语文题库：来源与许可信息随内容一并保留。 */
export const grade1ChineseQuestionBank = source as TextbookQuestionBank

export const grade1ChineseQuestionCount = grade1ChineseQuestionBank.units
  .flatMap(unit => unit.knowledgePoints)
  .reduce((sum, point) => sum + point.questions.length, 0)
