import { describe, expect, it } from 'vitest'
import { grade1MathUnitTwoTasks } from './math-unit-two-practice'
import { unitTwoAnswer, unitTwoChoices } from './math-unit-two-choice'

describe('第二单元选择题', () => {
  it.each(grade1MathUnitTwoTasks)('$id has four distinct choices and one correct answer', (task) => {
    const choices = unitTwoChoices(task)
    expect(choices).toHaveLength(4)
    expect(new Set(choices).size).toBe(4)
    expect(choices.filter(choice => choice === unitTwoAnswer(task))).toHaveLength(1)
    expect(choices).not.toContain('undefined')
  })
})
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { grade1MathUnitTwoOriginalTasks, grade1MathUnitTwoExtensionTasks } from './math-unit-two-practice'

it('每道题都有对应题图', () => {
  for (const task of [...grade1MathUnitTwoOriginalTasks, ...grade1MathUnitTwoExtensionTasks]) {
    const filename = task.sourceId?.startsWith('cnm_p008_q')
      ? `g1m-u2-p1-q${task.sourceId.slice(-1)}.png`
      : `u2-${task.sourceId ?? task.id}.png`
    expect(existsSync(resolve('public/images/questions/g1-math', filename)), task.id).toBe(true)
  }
})

