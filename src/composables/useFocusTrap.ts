import type { Ref } from 'vue'
import { onBeforeUnmount, watch } from 'vue'

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

/**
 * 焦点陷阱。
 * 弹层打开时把键盘焦点关在里面，关闭后还给原来的元素 ——
 * 儿童端也要保证键盘可用，这样平板接键盘、家长操作都不会迷路。
 */
export function useFocusTrap(options: {
  container: Ref<HTMLElement | null>
  active: Ref<boolean>
  onEscape?: () => void
}) {
  const { container, active, onEscape } = options
  let lastFocused: HTMLElement | null = null

  function focusableElements(): HTMLElement[] {
    const root = container.value
    if (!root)
      return []
    return [...root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)].filter(
      element => element.offsetParent !== null || element === document.activeElement,
    )
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      event.stopPropagation()
      onEscape?.()
      return
    }

    if (event.key !== 'Tab')
      return

    const elements = focusableElements()
    if (elements.length === 0) {
      event.preventDefault()
      return
    }

    const first = elements[0]
    const last = elements.at(-1)!
    const current = document.activeElement as HTMLElement | null

    if (!event.shiftKey && current === last) {
      event.preventDefault()
      first.focus()
    }
    else if (event.shiftKey && (current === first || !container.value?.contains(current))) {
      event.preventDefault()
      last.focus()
    }
  }

  function activate() {
    lastFocused = document.activeElement as HTMLElement | null
    document.addEventListener('keydown', handleKeydown, true)
    // 等一帧，等 Teleport 的内容挂载完成
    requestAnimationFrame(() => {
      const elements = focusableElements()
      const target = elements[0] ?? container.value
      target?.focus()
    })
  }

  function deactivate() {
    document.removeEventListener('keydown', handleKeydown, true)
    lastFocused?.focus?.()
    lastFocused = null
  }

  watch(active, (value) => {
    if (value)
      activate()
    else
      deactivate()
  }, { immediate: true })

  onBeforeUnmount(deactivate)
}
