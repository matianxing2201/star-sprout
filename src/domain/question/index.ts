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
