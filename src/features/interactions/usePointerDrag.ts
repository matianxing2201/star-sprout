import { onScopeDispose, ref } from 'vue'

/**
 * 指针拖拽（鼠标 / 触摸 / 触控笔通用）
 * ==================================
 *
 * 为什么不用 HTML5 的 dragstart/drop：
 * 它在触摸屏和平板上基本不可用，而产品明确要求未来兼容平板与触摸屏。
 * 这里用 Pointer Events 自己实现，一套代码同时覆盖鼠标与手指。
 *
 * 推荐用法（拖拽类互动都按这个模式写）：
 *
 *   const drag = usePointerDrag<string>({
 *     onDrop: (itemId, point) => {
 *       const zoneId = findDropTarget(point, 'data-drop-zone')
 *       if (!zoneId) return                     // 丢在空白处：什么也不发生，不算失败
 *       ...
 *     },
 *   })
 *
 *   <button @pointerdown="drag.start($event, item.id)">…</button>
 *   <div :data-drop-zone="zone.id">…</div>
 *
 * 关键设计：**拖到空白处不算失败**。儿童端不应因为手滑而得到负反馈。
 */
export interface DragPoint {
  x: number
  y: number
}

export interface UsePointerDragOptions<T> {
  /** 松手时回调。point 为视口坐标 */
  onDrop: (payload: T, point: DragPoint) => void
  /** 在判定“开始拖拽”之前的移动阈值（像素），避免误触 */
  threshold?: number
}

export function usePointerDrag<T>(options: UsePointerDragOptions<T>) {
  const { onDrop, threshold = 6 } = options

  const dragging = ref<T | null>(null)
  const point = ref<DragPoint>({ x: 0, y: 0 })
  /** 是否已经越过阈值 —— 用于给被拖元素加 .fx-dragging */
  const moved = ref(false)

  let origin: DragPoint | null = null
  let payload: T | null = null
  let activePointerId: number | null = null

  function cleanup(): void {
    window.removeEventListener('pointermove', handleMove)
    window.removeEventListener('pointerup', handleUp)
    window.removeEventListener('pointercancel', cancel)
    dragging.value = null
    moved.value = false
    origin = null
    payload = null
    activePointerId = null
  }

  function handleMove(event: PointerEvent): void {
    if (activePointerId !== null && event.pointerId !== activePointerId)
      return

    point.value = { x: event.clientX, y: event.clientY }

    if (!moved.value && origin) {
      const distance = Math.hypot(event.clientX - origin.x, event.clientY - origin.y)
      if (distance > threshold) {
        moved.value = true
        dragging.value = payload
      }
    }
  }

  function handleUp(event: PointerEvent): void {
    if (activePointerId !== null && event.pointerId !== activePointerId)
      return

    const dropped = payload
    const wasMoved = moved.value
    const dropPoint = { x: event.clientX, y: event.clientY }
    cleanup()

    if (dropped !== null && wasMoved)
      onDrop(dropped, dropPoint)
  }

  function cancel(): void {
    cleanup()
  }

  function start(event: PointerEvent, next: T): void {
    // 只响应主键（鼠标左键 / 单指）
    if (event.button !== 0)
      return

    event.preventDefault()
    origin = { x: event.clientX, y: event.clientY }
    point.value = { ...origin }
    payload = next
    activePointerId = event.pointerId
    moved.value = false

    window.addEventListener('pointermove', handleMove, { passive: true })
    window.addEventListener('pointerup', handleUp)
    window.addEventListener('pointercancel', cancel)
  }

  onScopeDispose(cleanup)

  return { dragging, point, moved, start, cancel }
}

/**
 * 找到松手位置下面的拖放目标。
 * 拖拽期间被拖的元素必须设置 `pointer-events: none`，
 * 否则 elementFromPoint 永远只会返回它自己。
 */
export function findDropTarget(point: DragPoint, attribute: string): string | null {
  if (typeof document === 'undefined')
    return null

  const element = document.elementFromPoint(point.x, point.y)
  const owner = element?.closest<HTMLElement>(`[${attribute}]`)
  return owner?.getAttribute(attribute) ?? null
}
