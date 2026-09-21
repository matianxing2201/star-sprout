import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'

import { useProgressStore } from '@/stores'
import { useLessonSession } from './useLessonSession'

/**
 * 课程会话的端到端测试
 * ==================
 *
 * 它验证的是整条“教案 → 可玩课程 → 学习记录 → 成长数据”的链路：
 *   内容包 → 会话状态机 → 进度仓储 → 成长推导
 *
 * 这条链路是产品的核心，任何一环断了，家长端看到的数字都会不对。
 */
const LESSON_ID = 'nursery-language-chunxiao-1'

describe('useLessonSession', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  it('能从内容包里取到课程与全部步骤', () => {
    const session = useLessonSession(LESSON_ID)

    expect(session.lesson.value?.id).toBe(LESSON_ID)
    expect(session.taskCount.value).toBe(6)
    expect(session.tasks.value[0]?.kind).toBe('intro')
    expect(session.tasks.value.at(-1)?.kind).toBe('reward')
  })

  it('推进一步会记录已完成的任务，进度随之增长', () => {
    const session = useLessonSession(LESSON_ID)

    expect(session.stepRatio.value).toBe(0)
    session.next()

    expect(session.cursor.value).toBe(1)
    expect(session.doneTaskIds.value).toHaveLength(1)
    expect(session.stepRatio.value).toBeGreaterThan(0)
  })

  it('作答会写进进度仓储，并带上知识点（家长端的薄弱点分析依赖它）', () => {
    const session = useLessonSession(LESSON_ID)
    const progress = useProgressStore()
    const task = session.tasks.value[2]

    session.submitInteraction(task, {
      interactionKind: 'choose-one',
      correct: false,
      attempts: 1,
      usedHint: false,
      skipped: false,
      stars: 0,
    })

    expect(progress.attempts).toHaveLength(1)
    expect(progress.attempts[0]?.lessonId).toBe(LESSON_ID)
    expect(progress.attempts[0]?.knowledgePointIds.length).toBeGreaterThan(0)
    expect(progress.attempts[0]?.correct).toBe(false)
  })

  it('走完整节课会结算星星、写入完成记录并更新成长数据', () => {
    const session = useLessonSession(LESSON_ID)
    const progress = useProgressStore()

    // 把每一步都做对
    for (const task of session.tasks.value) {
      if (task.kind === 'interaction' || task.kind === 'practice' || task.kind === 'challenge') {
        for (const interaction of task.interactions) {
          session.submitInteraction(task, {
            interactionKind: interaction.kind,
            correct: true,
            attempts: 1,
            usedHint: false,
            skipped: false,
            stars: interaction.stars ?? 1,
          })
        }
      }
      session.next()
    }

    expect(session.finished.value).toBe(true)
    expect(progress.completions).toHaveLength(1)
    expect(progress.completions[0]?.stars).toBe(3)
    expect(progress.growth.stars).toBeGreaterThan(0)
    expect(progress.growth.lessonsCompleted).toBe(1)
    expect(progress.growth.exploredWorldIds.length).toBeGreaterThan(0)
  })

  it('用过提示就拿不到三颗星', () => {
    const session = useLessonSession(LESSON_ID)

    for (const task of session.tasks.value) {
      if (task.kind === 'interaction' || task.kind === 'practice' || task.kind === 'challenge') {
        for (const interaction of task.interactions) {
          session.submitInteraction(task, {
            interactionKind: interaction.kind,
            correct: true,
            attempts: 2,
            usedHint: true,
            skipped: false,
            stars: 1,
          })
        }
      }
      session.next()
    }

    expect(session.settledStars.value).toBeLessThanOrEqual(2)
  })

  it('完成课程后，该主题在地图上变成已完成', () => {
    const session = useLessonSession(LESSON_ID)
    const progress = useProgressStore()

    // 只推进步骤、不做任何作答，也应该能走完并结算
    for (let index = 0; index < session.taskCount.value; index += 1)
      session.next()

    expect(progress.topicProgressOf('nursery-language-chunxiao').status).toBe('completed')
  })

  it('重新开始会清空本次作答，但不影响已保存的进度', () => {
    const session = useLessonSession(LESSON_ID)
    const progress = useProgressStore()

    session.next()
    session.restart()

    expect(session.cursor.value).toBe(0)
    expect(session.doneTaskIds.value).toHaveLength(0)
    expect(progress.attempts).toHaveLength(0)
  })

  it('课程 id 不存在时不会抛错（地址栏乱输也不会白屏）', () => {
    const session = useLessonSession('does-not-exist')

    expect(session.lesson.value).toBeUndefined()
    expect(session.taskCount.value).toBe(0)
    expect(session.currentTask.value).toBeUndefined()
  })
})
