import type { GradeContent } from '../types'
import { autumnColorsLesson } from './lessons/autumn-colors'
import { autumnWordsLesson } from './lessons/autumn-words'
import { bingQuNaErLeLesson } from './lessons/bing-qu-na-er-le'
import { chunXiaoLesson } from './lessons/chun-xiao'
import { measureWordsLesson } from './lessons/measure-words'
import { numberFriendsLesson } from './lessons/number-friends'
import { tuXingBaoBaoLesson } from './lessons/tu-xing-bao-bao'
import { categories, grade } from './taxonomy'
import { topics } from './topics'

/** 中班内容包：目录来自 taxonomy，主题与课程随教案逐步补充 */
export const nurseryContent: GradeContent = {
  grade,
  categories,
  topics,
  lessons: [chunXiaoLesson, tuXingBaoBaoLesson, numberFriendsLesson, bingQuNaErLeLesson, measureWordsLesson, autumnColorsLesson, autumnWordsLesson],
}
