import type { MaybeRef } from 'vue'
import type { InteractionResult, LearningTask, Lesson, LessonCompletion, TaskId } from '@/domain'

import { computed, ref, toValue } from 'vue'
import { useCatalogStore, useFeedbackStore, useProgressStore } from '@/stores'

/**
 * 一次课程会话（useLessonSession）
 * ==============================
 *
 * 这是“教学过程”的运行时：它持有游标、记录每一次作答、决定什么时候算完成。
 * 页面与组件只渲染，不判断对错、不算星星 —— 全部逻辑都在这里，因此可以单测。
 *
 * 关键约定：
 *   - 每一步由内容数据驱动（LearningTask），播放器不认识任何具体课程；
 *   - 作答记录逐条写入进度仓储，家长端的薄弱点分析依赖它；
 *   - 完成课程时按“首次答对率”结算 1~3 颗星，用了提示会少一颗。
 */
export function useLessonSession(lessonId: MaybeRef<string>) {
  const catalog = useCatalogStore()
  const progress = useProgressStore()
  const feedback = useFeedbackStore()

  const lesson = computed<Lesson | undefined>(() => catalog.lesson(toValue(lessonId)))

  const cursor = ref(0)
  const startedAt = ref(Date.now())
  const finishedAt = ref<number | null>(null)

  /** 每个任务上产生的互动结果 */
  const resultsByTask = ref<Record<TaskId, InteractionResult[]>>({})
  /** 已经走完的任务（用于进度条与“完成后可以继续”） */
  const doneTaskIds = ref<TaskId[]>([])

  const tasks = computed<LearningTask[]>(() => lesson.value?.tasks ?? [])
  const currentTask = computed<LearningTask | undefined>(() => tasks.value[cursor.value])
  const taskCount = computed(() => tasks.value.length)

  const stepRatio = computed(() => {
    if (taskCount.value === 0)
      return 0
    return doneTaskIds.value.length / taskCount.value
  })

  const isLastTask = computed(() => cursor.value >= taskCount.value - 1)

  /** 本次会话的所有互动结果 */
  const allResults = computed(() => Object.values(resultsByTask.value).flat())

  const correctCount = computed(() => allResults.value.filter(result => result.correct).length)

  const accuracy = computed(() => {
    const answered = allResults.value.filter(result => !result.skipped)
    if (answered.length === 0)
      return 1
    return answered.filter(result => result.correct).length / answered.length
  })

  const usedHint = computed(() => allResults.value.some(result => result.usedHint))

  /** 已获得的星星（每次互动即时累加） */
  const earnedStars = computed(() =>
    allResults.value.reduce((sum, result) => sum + result.stars, 0),
  )

  /** 首次答对率决定 1~3 星；用过提示封顶 2 星 */
  function settleStars(): number {
    if (usedHint.value)
      return Math.min(2, Math.max(1, accuracy.value >= 0.6 ? 2 : 1))
    if (accuracy.value >= 0.9 && correctCount.value === allResults.value.length)
      return 3
    if (accuracy.value >= 0.6)
      return 2
    return 1
  }

  /** 记录一次互动结果 */
  function submitInteraction(task: LearningTask, result: InteractionResult): void {
    const list = resultsByTask.value[task.id] ?? []
    resultsByTask.value = { ...resultsByTask.value, [task.id]: [...list, result] }

    if (!lesson.value)
      return

    progress.recordAttempt({
      lessonId: lesson.value.id,
      topicId: lesson.value.topicId,
      gradeId: lesson.value.gradeId,
      categoryId: lesson.value.categoryId,
      taskId: task.id,
      taskKind: task.kind,
      knowledgePointIds: task.knowledgePointIds ?? [],
      correct: result.correct,
      attempts: result.attempts,
      usedHint: result.usedHint,
      skipped: result.skipped,
      at: Date.now(),
    })

    if (result.correct)
      feedback.celebrate({ tier: 'correct', mascot: lesson.value.mascot })
  }

  /** 标记当前任务完成（角色引入、知识发现、奖励这些非互动步骤用它） */
  function completeTask(task: LearningTask): void {
    if (!doneTaskIds.value.includes(task.id))
      doneTaskIds.value = [...doneTaskIds.value, task.id]
  }

  function goTo(index: number): void {
    const clamped = Math.max(0, Math.min(taskCount.value - 1, index))
    if (currentTask.value)
      completeTask(currentTask.value)
    cursor.value = clamped
  }

  function next(): void {
    if (currentTask.value)
      completeTask(currentTask.value)

    if (isLastTask.value) {
      finish()
      return
    }

    cursor.value += 1
  }

  function back(): void {
    cursor.value = Math.max(0, cursor.value - 1)
  }

  function finish(): void {
    const current = lesson.value
    if (!current || finishedAt.value !== null)
      return

    const at = Date.now()
    finishedAt.value = at
    if (currentTask.value)
      completeTask(currentTask.value)

    const seconds = Math.max(30, Math.round((at - startedAt.value) / 1000))
    const stars = settleStars()

    const completion: LessonCompletion = {
      lessonId: current.id,
      topicId: current.topicId,
      gradeId: current.gradeId,
      categoryId: current.categoryId,
      stars,
      seconds,
      completedAt: at,
    }
    progress.completeLesson(completion)

    // 完成课程 = 较高等级的奖励，由奖励体系统一决定强度
    feedback.celebrate({
      tier: 'lesson',
      mascot: current.mascot,
      stars: current.reward.stars,
      message: current.reward.message,
    })
  }

  function restart(): void {
    cursor.value = 0
    startedAt.value = Date.now()
    finishedAt.value = null
    resultsByTask.value = {}
    doneTaskIds.value = []
  }

  return {
    lesson,
    tasks,
    currentTask,
    cursor,
    taskCount,
    stepRatio,
    isLastTask,
    doneTaskIds,
    resultsByTask,
    allResults,
    accuracy,
    usedHint,
    earnedStars,
    settledStars: computed(() => settleStars()),
    finished: computed(() => finishedAt.value !== null),
    submitInteraction,
    completeTask,
    goTo,
    next,
    back,
    finish,
    restart,
  }
}
