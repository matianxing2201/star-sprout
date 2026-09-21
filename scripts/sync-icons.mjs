/**
 * 图标注册表同步脚本
 * ==================
 *
 * 用法：pnpm icons:sync
 *
 * 为什么需要脚本
 * -------------
 * src/ui/icons/registry.ts 只内联「真正用到的字重」，以控制首屏体积：
 * 直接使用图标库的运行时包时，123 个图标 × 6 种字重会占掉首屏 JS 的 163 kB gzip（72%）；
 * 按需内联后约 41 kB gzip。
 *
 * 但「用到了哪些图标、哪些需要 duotone」会随着内容包和映射表变化，手工维护必然漂移。
 * 因此注册表整份由这个脚本生成（幂等，可反复运行）：
 *   - 词汇表里每个语义名都内联 bold（界面控件默认字重）；
 *   - 出现在映射表（TONE_ICONS / TOPIC_KIND_ICONS / TASK_KIND_ICONS / STAT_ICONS）
 *     或内容包 icon: '...' 里的图标额外内联 duotone（它们是「身份型」图标，会进色调方块）；
 *   - star 额外内联 fill。
 *
 * 新增内容图标后如果忘了跑脚本，src/ui/icons/icons.spec.ts 会失败并点名缺哪个，
 * 不会静默降级成 bold。
 */
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import process from 'node:process'

const root = process.cwd()
const registryPath = join(root, 'src/ui/icons/registry.ts')
const vocabularyPath = join(root, 'src/domain/shared/icons.ts')
const mappingsPath = join(root, 'src/ui/icons/mappings.ts')

/** Iconify 里名字与语义名不同的少数特例 */
const NAME_OVERRIDES = {
  home: 'house',
  refresh: 'arrows-clockwise',
  telescope: 'binoculars',
  microphone: 'microphone-stage',
  stage: 'microphone-stage',
  brush: 'paint-brush-broad',
  pencil: 'pencil-simple',
  castle: 'castle-turret',
  forest: 'tree-evergreen',
  planet: 'globe',
  globe: 'globe-hemisphere-west',
}

/** 即使当前没人用，也先备着 duotone —— 它们天然是身份型图标 */
const DUOTONE_RESERVE = ['lock']

const FILE_HEADER = [
  '/**',
  ' * 图标变体表（此文件由 scripts/sync-icons.mjs 生成，请勿手工编辑）',
  ' * =================================================================',
  ' *',
  ' * 重新生成：pnpm icons:sync',
  ' *',
  ' * 这是唯一直接依赖图标来源的文件。语义名来自 domain/shared/icons.ts，',
  ' * 这里把它翻译成具体图标，并声明该图标需要哪几种字重：',
  ' *   - 每个图标都内联 bold（界面控件默认字重）；',
  ' *   - 「身份型」图标（领域 / 世界 / 主题 / 徽章 / 步骤）额外内联 duotone，',
  ' *     双色调正是纸雕风格要的「主形 + 20% 副形」两层剪纸感；',
  ' *   - star 额外内联 fill（表示「已经获得」）。',
  ' *',
  ' * satisfies Record<AppIconName, IconVariants> 是编译期保证：',
  ' *   - 词汇表加了名字却忘了映射 → 报错（缺 key）；',
  ' *   - 这里写了词汇表以外的名字 → 报错（多余 key）。',
  ' * 因此不可能出现「跑到某个页面才发现图标是空白」。',
  ' *',
  ' * 为什么不用 iconfont（字体图标）：',
  ' *   - 字体图标没有双色调，而本项目的视觉语言依赖双色调；',
  ' *   - 小字号下抗锯齿差、基线对齐困难，还会受字体加载影响（FOUT）；',
  ' *   - 它本质是文字：屏幕阅读器会念出乱码，复制粘贴也会污染文本。',
  ' */',
].join('\n')

const INTERFACE_BLOCK = [
  'export interface IconVariants {',
  '  bold: Component',
  '  duotone?: Component',
  '  fill?: Component',
  '}',
].join('\n')

function readPhosphorSet() {
  const json = JSON.parse(readFileSync(join(root, 'node_modules/@iconify-json/ph/icons.json'), 'utf8'))
  return new Set([...Object.keys(json.icons), ...Object.keys(json.aliases ?? {})])
}

function readVocabulary() {
  return [...readFileSync(vocabularyPath, 'utf8').matchAll(/^\s*'([a-z0-9-]+)',$/gm)].map(m => m[1])
}

/** 已生成的来源名要沿用，避免每次跑脚本换一套图标 */
function readKnownSources() {
  const src = readFileSync(registryPath, 'utf8')
  const localToSource = new Map()
  // 两个捕获组都要：局部变量名 → 图标来源名
  for (const m of src.matchAll(/import\s+(Icon\w+)\s+from\s+'~icons\/ph\/([a-z0-9-]+?)-(?:bold|duotone|fill)'/g))
    localToSource.set(m[1], m[2])

  const known = new Map()
  for (const m of src.matchAll(/'([a-z0-9-]+)':\s*\{\s*bold:\s*(Icon\w+)(?:,|\s*\})/g)) {
    const source = localToSource.get(m[2])
    if (source)
      known.set(m[1], source)
  }
  return known
}

function walk(dir) {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry)
    if (statSync(path).isDirectory())
      return walk(path)
    return /\.(?:ts|vue)$/.test(path) ? [path] : []
  })
}

function collectIdentityIcons(vocabulary) {
  const names = new Set(vocabulary)
  const identity = new Set(DUOTONE_RESERVE)

  for (const m of readFileSync(mappingsPath, 'utf8').matchAll(/'([a-z0-9-]+)'/g)) {
    if (names.has(m[1]))
      identity.add(m[1])
  }

  for (const file of [...walk(join(root, 'src/content')), ...walk(join(root, 'src/domain'))]) {
    for (const m of readFileSync(file, 'utf8').matchAll(/\bicon:\s*'([a-z0-9-]+)'/g)) {
      if (names.has(m[1]))
        identity.add(m[1])
    }
  }

  return identity
}

function toPascal(semantic) {
  return semantic.split('-').map(part => part[0].toUpperCase() + part.slice(1)).join('')
}

function main() {
  const phNames = readPhosphorSet()
  const vocabulary = readVocabulary()
  const known = readKnownSources()
  const identity = collectIdentityIcons(vocabulary)

  if (vocabulary.length === 0)
    throw new Error('没能从 domain/shared/icons.ts 读到词汇表')

  const entries = vocabulary.map(semantic => ({
    semantic,
    source: known.get(semantic) ?? NAME_OVERRIDES[semantic] ?? semantic,
  }))

  const problems = []
  for (const { semantic, source } of entries) {
    if (!phNames.has(`${source}-bold`))
      problems.push(`${semantic} → ${source}-bold 不存在`)
    if (identity.has(semantic) && !phNames.has(`${source}-duotone`))
      problems.push(`${semantic} → ${source}-duotone 不存在（但它是身份型图标）`)
  }
  if (problems.length > 0)
    throw new Error(`图标来源不完整：\n  ${problems.join('\n  ')}`)

  const imports = []
  const variants = []

  /** 记录一条 import，稍后按模块路径排序输出 */
  function addImport(specifier, local) {
    imports.push({ specifier, line: `import ${local} from '~icons/ph/${specifier}'` })
  }
  const usedLocals = new Set()

  function local(semantic, suffix) {
    let name = `Icon${toPascal(semantic)}${suffix}`
    let n = 2
    while (usedLocals.has(name)) name = `Icon${toPascal(semantic)}${suffix}${n++}`
    usedLocals.add(name)
    return name
  }

  for (const { semantic, source } of entries) {
    const bold = local(semantic, 'Bold')
    addImport(`${source}-bold`, bold)

    const parts = [`bold: ${bold}`]

    if (identity.has(semantic)) {
      const duotone = local(semantic, 'Duotone')
      addImport(`${source}-duotone`, duotone)
      parts.push(`duotone: ${duotone}`)
    }

    if (semantic === 'star') {
      const fill = local(semantic, 'Fill')
      addImport(`${source}-fill`, fill)
      parts.push(`fill: ${fill}`)
    }

    variants.push(`  '${semantic}': { ${parts.join(', ')} },`)
  }

  const output = [
    FILE_HEADER,
    '',
    'import type { Component } from \'vue\'',
    '',
    'import type { AppIconName } from \'@/domain\'',
    '',
    // 按「模块路径」排序（不是按整行文本），保证生成物本身就能通过
    // lint 的 perfectionist/sort-imports，否则每次生成后都要再跑一次 eslint --fix
    [...imports]
      .sort((a, b) => a.specifier < b.specifier ? -1 : a.specifier > b.specifier ? 1 : 0)
      .map(entry => entry.line)
      .join('\n'),
    '',
    INTERFACE_BLOCK,
    '',
    'const ICON_VARIANTS = {',
    variants.join('\n'),
    '} as const satisfies Record<AppIconName, IconVariants>',
    '',
    'export function resolveIconVariants(name: AppIconName): IconVariants {',
    '  return ICON_VARIANTS[name]',
    '}',
    '',
  ].join('\n')

  writeFileSync(registryPath, output, 'utf8')

  const duotoneCount = variants.filter(line => line.includes('duotone:')).length
  console.log(`✓ 已同步 ${relative(root, registryPath)}`)
  console.log(`  图标 ${variants.length} 个 · bold ${variants.length} · duotone ${duotoneCount} · fill 1`)
}

main()
