import type { ClassValue } from 'clsx'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * 组合类名：clsx 处理条件，tailwind-merge 处理冲突覆盖。
 * 所有 ui/ 与 features/ 组件统一使用它，避免出现“类名打架”的样式 bug。
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
