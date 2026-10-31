import type { UnitTwoTask } from './math-unit-two-practice'

export function unitTwoAnswer(task: UnitTwoTask): string {
  return task.sourceChoices?.find(choice => choice.key === task.answer)?.text ?? task.answer
}

export function unitTwoChoices(task: UnitTwoTask): string[] {
  if (task.sourceChoices?.length) {
    const choices = task.sourceChoices.map(choice => choice.text)
    return choices.length === 3 ? [...choices, '7加7'] : choices
  }
  const firstChoices: Record<string, string[]> = {
    cnm_p008_q1: ['8', '10', '9', '7'],
    cnm_p008_q2: ['6', '8', '7', '9'],
    cnm_p008_q3: ['8', '9', '10', '11'],
    cnm_p008_q4: ['4', '5', '6', '7'],
  }
  if (task.sourceId && firstChoices[task.sourceId])
    return firstChoices[task.sourceId]
  const answer = Number(task.answer)
  const distractors = [answer - 1, answer + 1, answer - 2, answer + 2, answer + 3].filter(n => n >= 0 && n !== answer)
  return [String(distractors[0]), String(answer), String(distractors[1]), String(distractors[2])]
}
