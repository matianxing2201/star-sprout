import type { CategoryId, GradeId } from '../catalog/types'

export type QuestionDifficulty = 'basic' | 'standard' | 'advanced'

export interface QuestionChoice {
  id: string
  text: string
}

export interface MultipleChoiceQuestion {
  id: string
  knowledgePointId: string
  difficulty: QuestionDifficulty
  prompt: string
  choices: QuestionChoice[]
  answerId: string
  explanation: string
  illustration: string
}

export interface CurriculumKnowledgePoint {
  id: string
  title: string
  domain: string
  description: string
  masteryCriteria: string[]
  questions: MultipleChoiceQuestion[]
}

export interface TextbookUnit {
  id: string
  title: string
  order: number
  knowledgePoints: CurriculumKnowledgePoint[]
}

export interface QuestionBankAttribution {
  repository: string
  repositoryUrl: string
  creator: string
  license: string
  licenseUrl: string
  sourceQualityNote: string
  changes: string
}

export interface TextbookQuestionBank {
  gradeId: GradeId
  categoryId: CategoryId
  semester: '上册' | '下册'
  units: TextbookUnit[]
  attribution: QuestionBankAttribution
}

/** 题库练习的跨页面记录；答案过程归题库专属仓储，不混入正式课程进度。 */
export interface QuestionBankProgressSnapshot {
  attemptsByQuestionId: Record<string, number>
  firstTryCorrectByQuestionId: Record<string, boolean>
  completedQuestionIds: string[]
  missedQuestionIds: string[]
  completedPointIds: string[]
  celebratedPointIds: string[]
  currentUnitId: string | null
  currentPointId: string | null
}

export const EMPTY_QUESTION_BANK_PROGRESS: QuestionBankProgressSnapshot = {
  attemptsByQuestionId: {},
  firstTryCorrectByQuestionId: {},
  completedQuestionIds: [],
  missedQuestionIds: [],
  completedPointIds: [],
  celebratedPointIds: [],
  currentUnitId: null,
  currentPointId: null,
}
