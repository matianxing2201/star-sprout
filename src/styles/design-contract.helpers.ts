import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

/**
 * 「设计契约」测试的共用工具
 * ==========================
 *
 * 契约测试要读源码，所以需要一组稳定的遍历工具。
 * 放在单独文件里，避免每个契约 spec 各写一份遍历逻辑（那样口径会漂）。
 */

/** 契约要检查的源码类型 */
const SOURCE_EXTENSIONS = ['.css', '.vue', '.ts']

/**
 * 递归收集 src 下的源码文件（绝对路径）。
 * 跳过 spec 自身：契约测试里会引用被禁止的字符串（例如 `infinite`），
 * 不排除的话它会把自己判成违规。
 */
export function collectSourceFiles(root: string): string[] {
  return readdirSync(root).flatMap((entry) => {
    const path = join(root, entry)
    if (statSync(path).isDirectory())
      return collectSourceFiles(path)
    if (path.endsWith('.spec.ts'))
      return []
    return SOURCE_EXTENSIONS.some(ext => path.endsWith(ext)) ? [path] : []
  })
}

/** 相对 src 的路径，统一用 posix 分隔符，便于匹配 */
export function relPath(root: string, file: string): string {
  return relative(root, file).split('\\').join('/')
}

/**
 * 把注释换成等长空白后按行返回 —— 行号保持不变。
 *
 * 为什么不逐行判断「这行是不是注释」：那样只认得出以 `*`、`//` 开头的行，
 * 而模板里的多行 HTML 注释（`<!-- ... -->` 的后续行）会漏掉，
 * 于是注释里提到的数字会被当成真的在使用。整体剥掉才可靠。
 */
export function readSourceLines(file: string): string[] {
  const blank = (match: string): string => match.replace(/[^\n]/g, ' ')

  const stripped = readFileSync(file, 'utf-8')
    .replace(/<!--[\s\S]*?-->/g, blank)
    .replace(/\/\*[\s\S]*?\*\//g, blank)
    .replace(/^[ \t]*\/\/.*$/gm, blank)

  return stripped.split('\n')
}
