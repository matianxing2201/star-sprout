import type { QuestionBankProgressSnapshot } from '@/domain'
import { defineStore } from 'pinia'

import { ref } from 'vue'
import { questionBankProgressRepository } from '@/data'

export const useQuestionBankProgressStore = defineStore('questionBankProgress', () => {
  const snapshot = ref(questionBankProgressRepository.load())

  function persist(next: QuestionBankProgressSnapshot): void {
    snapshot.value = next
    questionBankProgressRepository.save(next)
  }

  function setLocation(unitId: string, pointId: string): void {
    if (snapshot.value.currentUnitId === unitId && snapshot.value.currentPointId === pointId)
      return
    persist({ ...snapshot.value, currentUnitId: unitId, currentPointId: pointId })
  }

  function recordAttempt(questionId: string, correct: boolean): void {
    const previousAttempts = snapshot.value.attemptsByQuestionId[questionId] ?? 0
    const firstTryCorrectByQuestionId = { ...snapshot.value.firstTryCorrectByQuestionId }
    if (previousAttempts === 0)
      firstTryCorrectByQuestionId[questionId] = correct

    const missed = new Set(snapshot.value.missedQuestionIds)
    if (correct)
      missed.delete(questionId)
    else
      missed.add(questionId)

    persist({
      ...snapshot.value,
      attemptsByQuestionId: {
        ...snapshot.value.attemptsByQuestionId,
        [questionId]: previousAttempts + 1,
      },
      firstTryCorrectByQuestionId,
      missedQuestionIds: [...missed],
    })
  }

  function resolveQuestion(questionId: string, correct: boolean): void {
    const completed = new Set(snapshot.value.completedQuestionIds)
    const missed = new Set(snapshot.value.missedQuestionIds)
    completed.add(questionId)
    if (correct)
      missed.delete(questionId)
    else
      missed.add(questionId)

    persist({
      ...snapshot.value,
      completedQuestionIds: [...completed],
      missedQuestionIds: [...missed],
    })
  }

  function completePoint(pointId: string): void {
    if (snapshot.value.completedPointIds.includes(pointId))
      return
    persist({
      ...snapshot.value,
      completedPointIds: [...snapshot.value.completedPointIds, pointId],
    })
  }

  function markPointCelebrated(pointId: string): boolean {
    if (snapshot.value.celebratedPointIds.includes(pointId))
      return false
    persist({
      ...snapshot.value,
      celebratedPointIds: [...snapshot.value.celebratedPointIds, pointId],
    })
    return true
  }

  return {
    snapshot,
    setLocation,
    recordAttempt,
    resolveQuestion,
    completePoint,
    markPointCelebrated,
  }
})
