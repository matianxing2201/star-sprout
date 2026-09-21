/**
 * 穷尽性检查。
 * 用在 switch/if 的结尾：新增一种互动类型或任务类型却忘记处理时，
 * TypeScript 会直接报错，而不是在运行时静默失败。
 */
export function assertNever(value: never, message = '未处理的分支'): never {
  throw new Error(`${message}: ${JSON.stringify(value)}`)
}
