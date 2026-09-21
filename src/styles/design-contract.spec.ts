import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

import { collectSourceFiles, readSourceLines, relPath } from './design-contract.helpers'

/**
 * 设计契约
 * ========
 *
 * 与「设计令牌契约」（tokens.spec.ts）、「样式层序契约」（layers.spec.ts）并列的
 * **源码级契约**。它守的不是某个组件的行为，而是设计系统的**结构决策**。
 *
 * 为什么需要它：这次视觉重建要治的病（全站只有一套表面配方、版式是平的、
 * 模板化装饰、常驻循环动画）全都是**会悄悄退化、且退化时不报错**的东西。
 * 行为测试断言不了它们 —— 挂载出来的 DOM 里看不出「这个界面没有取舍」。
 *
 * 为什么是源码级而不是组件级：这一层能一次覆盖全部组件。组件级的断言反而会
 * 绑住实现细节（某个 class 出现在某个组件里），那样重构就等于改测试。
 */

const srcRoot = resolve(process.cwd(), 'src')

/**
 * 允许出现「常驻循环动画」的位置。
 *
 * 规则：**只有角色可以一直动**。角色是活的，动就是生命感；
 * 其他任何元素一直动，都是在抢注意力 —— 那是表演努力，不是设计。
 */
const ALLOWED_LOOP_LOCATIONS = [
  {
    pattern: /^features\/mascot\//,
    why: '角色形象：它是唯一允许常驻循环的元素',
  },
  {
    pattern: /^styles\/tokens\.css$/,
    lineIncludes: '--animate-breathe',
    why: '角色 idle 动效的令牌定义本身',
  },
]

describe('设计契约 · 常驻循环动画', () => {
  it('除了角色，没有任何元素一直动', () => {
    const offenders: string[] = []

    for (const file of collectSourceFiles(srcRoot)) {
      const relative = relPath(srcRoot, file)
      const lines = readSourceLines(file)

      lines.forEach((line, index) => {
        if (!line.includes('infinite'))
          return

        const allowed = ALLOWED_LOOP_LOCATIONS.some((entry) => {
          if (!entry.pattern.test(relative))
            return false
          return entry.lineIncludes === undefined || line.includes(entry.lineIncludes)
        })

        if (!allowed)
          offenders.push(`${relative}:${index + 1}  ${line.trim().slice(0, 72)}`)
      })
    }

    expect(
      offenders,
      '「一直在动」只允许出现在角色上；其余元素请改成一次性动效或静态。\n'
      + '如果确实需要一个常驻动效，把它加进 ALLOWED_LOOP_LOCATIONS 并写清理由。',
    ).toEqual([])
  })

  it('常驻循环的动画令牌只被角色使用', () => {
    // 上一条测的是「定义」：不许有新的常驻循环。
    // 这一条测的是「使用」：已有的循环令牌也不能被角色之外的元素拿去用 ——
    // 否则规则会被绕过（令牌是合法的，用它的地方却不合法）。
    const tokensCss = readFileSync(resolve(srcRoot, 'styles/tokens.css'), 'utf-8')
    const loopingUtilities = [...tokensCss.matchAll(/--animate-([a-z-]+):[^;]*infinite/g)]
      .map(match => `animate-${match[1]}`)

    expect(loopingUtilities.length, '没有找到任何常驻循环令牌，说明这条断言已经失效').toBeGreaterThan(0)

    const offenders: string[] = []

    for (const file of collectSourceFiles(srcRoot)) {
      const relative = relPath(srcRoot, file)
      // 令牌定义本身不算使用
      if (relative === 'styles/tokens.css')
        continue
      if (ALLOWED_LOOP_LOCATIONS.some(entry => entry.pattern.test(relative)))
        continue

      const lines = readSourceLines(file)
      lines.forEach((line, index) => {
        for (const utility of loopingUtilities) {
          if (line.includes(utility))
            offenders.push(`${relative}:${index + 1}  用了 ${utility}  ${line.trim().slice(0, 60)}`)
        }
      })
    }

    expect(
      offenders,
      `常驻循环令牌（${loopingUtilities.join(' / ')}）只允许角色使用。`,
    ).toEqual([])
  })
})

/**
 * 动效预算
 * ========
 *
 * UI 动效要**快**。同一段 300ms 的动画，用对缓动会显得比用错缓动更快；
 * 而 400ms 的下拉永远比 180ms 的显得迟钝 —— 感知速度就是真实体验的一部分。
 *
 * 规则：
 *   - 界面动效时长 < 300ms；只有「庆祝」类可以更长（罕见图乐，PRD 允许 0.5–1.5s）
 *   - 不使用 `ease-in`：它起步慢，而起步那一刻正是用户看得最专注的时候
 *   - 回弹幅度要小（0.1–0.3 的过冲）；大回弹是玩具感，不是质感
 */
describe('设计契约 · 动效预算', () => {
  /** 上限：界面动效一律短于这个数 */
  const MS_LIMIT = 300

  /**
   * 唯一的例外。
   *
   * 这里扫的是**样式里出现的每一个毫秒字面量**，不只是 `--duration-*` 令牌 ——
   * 否则 `animation: wiggle 620ms` 这种直接写在规则里的时长会整条绕过契约
   * （评审就是这么发现它的）。
   */
  function isExcused(value: number, line: string): boolean {
    if (value === 0.01)
      return true
    // 庆祝令牌的定义值；只有它自己那一行可以出现这个数
    return value === 900 && line.includes('--duration-celebrate')
  }

  it('界面动效时长都在 300ms 以内（含 animation / transition 里的字面量）', () => {
    const offenders: string[] = []
    let scanned = 0

    for (const file of collectSourceFiles(srcRoot)) {
      const relative = relPath(srcRoot, file)

      readSourceLines(file).forEach((line, index) => {
        for (const match of line.matchAll(/(\d+(?:\.\d+)?)ms/g)) {
          scanned += 1
          const value = Number(match[1])
          if (value >= MS_LIMIT && !isExcused(value, line))
            offenders.push(`${relative}:${index + 1}  ${value}ms  ${line.trim().slice(0, 56)}`)
        }
      })
    }

    expect(scanned, '一个毫秒字面量都没扫到，这条断言已经失效').toBeGreaterThan(0)
    expect(
      offenders,
      '界面动效请压到 300ms 以内。只有庆祝类（--duration-celebrate）可以更长 —— '
      + '它只出现在完成课程/章节/连续学习时，属于罕见图乐。',
    ).toEqual([])
  })

  it('不使用 ease-in 关键字', () => {
    // **回归守卫**：当前代码已经是对的。
    // 它只能查关键字，查不出「用 cubic-bezier 手写出一个缓起曲线」——
    // 从曲线本身判断不了意图（同样是 y1=0 的曲线，用作入场是错的、用作屏上位移是对的），
    // 那部分只能靠人判断。不要假装这条断言覆盖了它。
    const offenders: string[] = []

    for (const file of collectSourceFiles(srcRoot)) {
      const relative = relPath(srcRoot, file)
      const lines = readSourceLines(file)

      lines.forEach((line, index) => {
        // 单独的 ease-in 关键字；ease-in-out 是允许的（屏幕上的位移用它更自然）
        if (/(?<![\w-])ease-in(?![\w-])/.test(line))
          offenders.push(`${relative}:${index + 1}  ${line.trim().slice(0, 72)}`)
      })
    }

    expect(offenders, '入场请用 ease-out；单屏位移用 ease-in-out。不要用 ease-in。').toEqual([])
  })

  it('回弹过冲在 0.1~0.3 之间', () => {
    // 大过冲（例如 y=1.56）是玩具感；但完全没有过冲的曲线也不该叫「回弹」。
    // 所以：所有曲线都不许超过 0.3，而名字里带 bounce 的那条必须真的落在 0.1~0.3 内。
    const tokensCss = readFileSync(resolve(srcRoot, 'styles/tokens.css'), 'utf-8')

    const curves = [...tokensCss.matchAll(/(--ease-[a-z-]+):\s*cubic-bezier\(([^)]+)\)/g)]
    expect(curves.length, '没有找到缓动曲线令牌，这条断言已经失效').toBeGreaterThan(0)

    const offenders: string[] = []
    let bounceCurves = 0

    for (const [, name, args] of curves) {
      const values = args.split(',').map(part => Number(part.trim()))
      // cubic-bezier(x1, y1, x2, y2)：y 轴是进度，过冲看 y 超出 1 的幅度
      const overshoot = Math.max(values[1] ?? 0, values[3] ?? 0) - 1

      if (overshoot > 0.3) {
        offenders.push(`${name} 过冲 ${overshoot.toFixed(2)} 超过 0.3（${args.trim()}）`)
        continue
      }

      if (name.includes('bounce')) {
        bounceCurves += 1
        if (overshoot < 0.1)
          offenders.push(`${name} 过冲只有 ${overshoot.toFixed(2)}，不到 0.1 —— 那就不叫回弹了`)
      }
    }

    expect(bounceCurves, '没有找到 bounce 曲线，这条断言的下半截已经失效').toBeGreaterThan(0)
    expect(
      offenders,
      '回弹过冲请控制在 0.1~0.3。需要「弹一下」的场合，0.2 左右就够了。',
    ).toEqual([])
  })
})

describe('设计契约 · 原型面隔离', () => {
  const PROTOTYPE_MODULE = '@/prototypes'

  it('原型面只通过动态导入引用，且引用处有 DEV 门控', () => {
    const offenders: string[] = []
    const referencedBy: string[] = []

    for (const file of collectSourceFiles(srcRoot)) {
      const relative = relPath(srcRoot, file)
      if (relative.startsWith('prototypes/'))
        continue

      const source = readFileSync(file, 'utf-8')
      // 必须是真的导入语句 —— 只是注释里提到模块名不算「被引用」，
      // 否则把原型整个摘掉、只剩一句注释，这条反向断言还会是绿的
      const importPattern = new RegExp(`(?:from|import\\()\\s*['"]${PROTOTYPE_MODULE}`)
      if (!importPattern.test(source))
        continue

      referencedBy.push(relative)

      // 静态导入会把原型打进首屏
      const staticImport = new RegExp(`from\\s+['"]${PROTOTYPE_MODULE}`)
      if (staticImport.test(source))
        offenders.push(`${relative}：用了静态导入，原型会被打进首屏`)

      // 没有 DEV 门控，普通用户也会看到切换器
      if (!source.includes('import.meta.env.DEV'))
        offenders.push(`${relative}：引用了原型面但没有 import.meta.env.DEV 门控`)
    }

    expect(
      offenders,
      '原型面必须动态导入且被 DEV 门控 —— 否则它会上生产。',
    ).toEqual([])

    // 反过来也要成立：如果没有任何地方引用原型面，这条契约就是在空转
    expect(
      referencedBy.length,
      '没有任何地方引用原型面，说明这条契约已经失效（原型被删了？）',
    ).toBeGreaterThan(0)
  })
})

/**
 * 装饰必须是**具体的**，不能是通用的。
 *
 * 大半径模糊光斑（`blur-2xl` / `blur-3xl`）是「渐变光斑」这一套模板化装饰的典型手法：
 * 它跟产品里任何一个具体的东西都无关，放到任何页面上都成立 —— 这正是
 * 「一眼像 AI 生成」的来源之一。
 *
 * 功能性模糊不在此列：弹层背后的 `backdrop-blur-*` 是在表达层级，不是在装饰。
 */
describe('设计契约 · 装饰', () => {
  it('没有模板化的模糊光斑', () => {
    const offenders: string[] = []
    // 固定档位，外加任意值写法（`blur-[80px]` 用同样的手法绕过档位）
    const namedBlur = ['blur-2xl', 'blur-3xl']
    const LARGE_BLUR_PX = 40

    for (const file of collectSourceFiles(srcRoot)) {
      const relative = relPath(srcRoot, file)
      const lines = readSourceLines(file)

      lines.forEach((line, index) => {
        for (const utility of namedBlur) {
          if (line.includes(utility))
            offenders.push(`${relative}:${index + 1}  ${line.trim().slice(0, 72)}`)
        }

        for (const match of line.matchAll(/blur-\[(\d+)px\]/g)) {
          if (Number(match[1]) >= LARGE_BLUR_PX)
            offenders.push(`${relative}:${index + 1}  blur-[${match[1]}px]  ${line.trim().slice(0, 56)}`)
        }
      })
    }

    expect(
      offenders,
      '装饰要与具体内容有关；通用的模糊光斑请换成「跟这个学习世界有关」的东西，或者干脆留白。',
    ).toEqual([])
  })
})
