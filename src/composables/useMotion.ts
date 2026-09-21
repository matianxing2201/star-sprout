import type { Ref } from 'vue'
import { onScopeDispose, ref } from 'vue'

/**
 * 动画体系（Web Animations API）
 * =============================
 *
 * 为什么不用动画库：
 *  - 儿童端的动效都是短促、分级的（40ms ~ 900ms），Web Animations API 足够；
 *  - 不引入动画库可以把首屏体积留给插画与交互；
 *  - 统一在这里处理 `prefers-reduced-motion`，全站只有一处需要关心无障碍。
 *
 * 动效时长令牌与 styles/tokens.css 保持一致。
 */

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function')
    return false
  return window.matchMedia(REDUCED_MOTION_QUERY).matches
}

/** 响应式地跟随系统设置变化 */
export function useReducedMotion(): Ref<boolean> {
  const reduced = ref(prefersReducedMotion())

  if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
    const query = window.matchMedia(REDUCED_MOTION_QUERY)
    const onChange = (event: MediaQueryListEvent) => {
      reduced.value = event.matches
    }
    query.addEventListener('change', onChange)
    onScopeDispose(() => query.removeEventListener('change', onChange))
  }

  return reduced
}

export interface MotionOptions {
  duration?: number
  delay?: number
  easing?: string
  fill?: FillMode
}

const DEFAULT_EASING = 'cubic-bezier(0.22, 1, 0.36, 1)'

/** 播放一段关键帧动画；在“减少动效”环境下直接跳过 */
export function play(
  element: Element | null | undefined,
  keyframes: Keyframe[] | PropertyIndexedKeyframes,
  options: MotionOptions = {},
): Animation | null {
  if (!element || prefersReducedMotion())
    return null

  const animation = element.animate(keyframes, {
    duration: options.duration ?? 320,
    delay: options.delay ?? 0,
    easing: options.easing ?? DEFAULT_EASING,
    fill: options.fill ?? 'both',
  })

  return animation
}

/** 答对：放大弹一下 */
export function pop(element: Element | null | undefined): void {
  play(element, [
    { transform: 'scale(0.86)', opacity: 0.6 },
    { transform: 'scale(1.08)', opacity: 1 },
    { transform: 'scale(1)' },
  ], { duration: 520, easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)' })
}

/** 差一点点：温柔地摇一摇，绝不出现红叉 */
export function gentlyShake(element: Element | null | undefined): void {
  play(element, [
    { transform: 'translateX(0)' },
    { transform: 'translateX(-7px) rotate(-1.5deg)' },
    { transform: 'translateX(6px) rotate(1.5deg)' },
    { transform: 'translateX(-3px)' },
    { transform: 'translateX(0)' },
  ], { duration: 460 })
}

/** 提示：轻微呼吸两次，把注意力引到目标上 */
export function breatheHint(element: Element | null | undefined): void {
  play(element, [
    { boxShadow: '0 0 0 0 rgb(233 162 59 / 45%)' },
    { boxShadow: '0 0 0 12px rgb(233 162 59 / 0%)' },
  ], { duration: 900, easing: 'ease-out' })
}

/** 星星飞行：从元素位置飞到收藏栏 */
export function flyFrom(element: Element | null | undefined, to: { x: number, y: number }, distance = 240): void {
  if (!element)
    return

  const rect = element.getBoundingClientRect()
  const dx = to.x - (rect.left + rect.width / 2)
  const dy = to.y - (rect.top + rect.height / 2)

  play(element, [
    { transform: 'translate(0, 0) scale(0.4)', opacity: 0 },
    { transform: `translate(${dx * 0.25}px, ${dy * 0.25 - distance * 0.35}px) scale(1.1)`, opacity: 1, offset: 0.35 },
    { transform: `translate(${dx}px, ${dy}px) scale(0.5)`, opacity: 0 },
  ], { duration: 900, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' })
}

/**
 * 组合式用法：`const motion = useMotion(() => cardRef.value)`
 * 把 ref 取值推迟到调用时，避免组件还未挂载就拿不到元素。
 */
export function useMotion(resolve: () => Element | null | undefined) {
  return {
    pop: () => pop(resolve()),
    gentlyShake: () => gentlyShake(resolve()),
    breatheHint: () => breatheHint(resolve()),
    play: (keyframes: Keyframe[] | PropertyIndexedKeyframes, options?: MotionOptions) =>
      play(resolve(), keyframes, options),
  }
}
