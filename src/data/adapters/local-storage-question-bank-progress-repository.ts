import type { QuestionBankProgressRepository } from '../ports/question-bank-progress-repository'
import type { QuestionBankProgressSnapshot } from '@/domain'
import { EMPTY_QUESTION_BANK_PROGRESS } from '@/domain'
import { readStorage, writeStorage } from '@/shared/utils'

const STORAGE_KEY = 'chinese-question-bank:grade-1:v1'

/** 题库独立于课程目录，单独保存练习痕迹，避免虚构正式课程记录。 */
export function createLocalStorageQuestionBankProgressRepository(): QuestionBankProgressRepository {
  return {
    load(): QuestionBankProgressSnapshot {
      const saved = readStorage<Partial<QuestionBankProgressSnapshot>>(STORAGE_KEY, {})
      return {
        attemptsByQuestionId: saved.attemptsByQuestionId ?? {},
        firstTryCorrectByQuestionId: saved.firstTryCorrectByQuestionId ?? {},
        completedQuestionIds: saved.completedQuestionIds ?? [],
        missedQuestionIds: saved.missedQuestionIds ?? [],
        completedPointIds: saved.completedPointIds ?? [],
        celebratedPointIds: saved.celebratedPointIds ?? [],
        currentUnitId: saved.currentUnitId ?? EMPTY_QUESTION_BANK_PROGRESS.currentUnitId,
        currentPointId: saved.currentPointId ?? EMPTY_QUESTION_BANK_PROGRESS.currentPointId,
      }
    },

    save(snapshot): void {
      writeStorage(STORAGE_KEY, snapshot)
    },
  }
}
