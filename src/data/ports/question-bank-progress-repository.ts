import type { QuestionBankProgressSnapshot } from '@/domain'

export interface QuestionBankProgressRepository {
  load: () => QuestionBankProgressSnapshot
  save: (snapshot: QuestionBankProgressSnapshot) => void
}
