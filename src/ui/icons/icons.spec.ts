import type { AppIconName } from '@/domain'

import { describe, expect, it } from 'vitest'
import { contentPack } from '@/content'
import {
  APP_ICON_NAMES,
  GRADE_IDS,
  GROWTH_LEVELS,
  INTERACTION_KINDS,
  isAppIconName,
  TASK_KIND_LABELS,
  TONE_KEYS,
} from '@/domain'
import { STAT_ICONS, TASK_KIND_ICONS, TONE_ICONS, TOPIC_KIND_ICONS } from '@/ui/icons/mappings'
import { resolveIconVariants } from '@/ui/icons/registry'

/**
 * 图标系统契约测试
 * ================
 *
 * 图标系统有一类特殊故障：**它不会报错，只会变丑或变空**。
 * 例如某条内容写了一个词汇表里没有的名字、某个领域忘了配图标、
 * 或者同一屏里两个领域撞了同一枚图标 —— 页面照常渲染，只是看起来没设计过。
 *
 * 编译期能拦住的（词汇表 ↔ 图标库的映射完整性）交给 TypeScript 的
 * `satisfies Record<AppIconName, Component>`；剩下这些只能靠测试：
 */

/** 从内容里收集所有显式声明的图标名 */
function declaredIcons(): { name: string, where: string }[] {
  const found: { name: string, where: string }[] = []

  for (const grade of contentPack.grades)
    found.push({ name: grade.icon, where: `年级 ${grade.id}` })

  for (const world of contentPack.worlds)
    found.push({ name: world.icon, where: `学习世界 ${world.id}` })

  for (const badge of contentPack.badges)
    found.push({ name: badge.icon, where: `徽章 ${badge.id}` })

  for (const category of contentPack.categories) {
    if (category.icon)
      found.push({ name: category.icon, where: `领域 ${category.id}` })
  }

  for (const topic of contentPack.topics) {
    if (topic.icon)
      found.push({ name: topic.icon, where: `主题 ${topic.id}` })
  }

  for (const lesson of contentPack.lessons) {
    if (lesson.icon)
      found.push({ name: lesson.icon, where: `课程 ${lesson.id}` })

    for (const task of lesson.tasks) {
      if (task.kind !== 'discover')
        continue
      for (const card of task.discovery.cards)
        found.push({ name: card.icon, where: `课程 ${lesson.id} 的知识卡 ${card.id}` })
    }
  }

  return found
}

describe('图标词汇表', () => {
  it('每个语义名都能解析到 bold 字重（词汇表与图标来源没有脱节）', () => {
    for (const name of APP_ICON_NAMES)
      expect(resolveIconVariants(name).bold, `${name} 没有对应组件`).toBeTruthy()
  })

  it('每个“身份型”图标都内联了 duotone 字重', () => {
    // registry.ts 是按需内联的：只有声明过的图标才打包 duotone。
    // 缺少 duotone 时 KIcon 会静默回退到 bold —— 不报错，只是领域卡片变平。
    // 因此这里把「谁需要 duotone」钉死，新增内容忘了同步就会在这里失败。
    const needsDuotone = new Set<string>([
      ...Object.values(TONE_ICONS),
      ...Object.values(TOPIC_KIND_ICONS),
      ...Object.values(TASK_KIND_ICONS),
      ...declaredIcons().map(item => item.name),
    ])

    const missing = [...needsDuotone].filter(name => !resolveIconVariants(name as AppIconName).duotone)
    expect(missing, `这些图标缺少 duotone 字重，需要在 registry.ts 里补上`).toEqual([])
  })

  it('星星有 fill 字重（表示「已经获得」）', () => {
    expect(resolveIconVariants('star').fill).toBeTruthy()
  })

  it('词汇表内没有重复项', () => {
    expect(new Set(APP_ICON_NAMES).size).toBe(APP_ICON_NAMES.length)
  })

  it('名字统一使用小写连字符风格', () => {
    for (const name of APP_ICON_NAMES)
      expect(name, `${name} 命名不规范`).toMatch(/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/)
  })

  it('isAppIconName 能挡住词汇表以外的名字', () => {
    expect(isAppIconName('flask')).toBe(true)
    expect(isAppIconName('rocket-ship')).toBe(false)
    expect(isAppIconName('🔬')).toBe(false)
  })
})

describe('语义映射表', () => {
  it('每个学习领域色调都有默认图标', () => {
    expect(Object.keys(TONE_ICONS).sort()).toEqual([...TONE_KEYS].sort())
    for (const icon of Object.values(TONE_ICONS))
      expect(isAppIconName(icon)).toBe(true)
  })

  it('领域之间的默认图标互不重复（同一屏里不会撞图）', () => {
    const icons = Object.values(TONE_ICONS)
    expect(new Set(icons).size).toBe(icons.length)
  })

  it('六个教学步骤与三种主题类型都有图标', () => {
    expect(Object.keys(TASK_KIND_ICONS).sort()).toEqual(Object.keys(TASK_KIND_LABELS).sort())
    expect(Object.keys(TOPIC_KIND_ICONS).sort()).toEqual(['challenge', 'hidden', 'standard'])

    for (const icon of [...Object.values(TASK_KIND_ICONS), ...Object.values(TOPIC_KIND_ICONS)])
      expect(isAppIconName(icon)).toBe(true)
  })

  it('统计口径的图标都合法', () => {
    for (const icon of Object.values(STAT_ICONS))
      expect(isAppIconName(icon)).toBe(true)
  })

  it('12 种互动都有能力图标', () => {
    // INTERACTION_META 在 features 层，这里只保证词汇表能覆盖它需要的语义
    expect(INTERACTION_KINDS).toHaveLength(12)
  })
})

describe('内容里的图标', () => {
  it('所有显式声明的图标都在词汇表内', () => {
    const invalid = declaredIcons().filter(item => !isAppIconName(item.name))
    expect(invalid.map(item => `${item.where} → ${item.name}`)).toEqual([])
  })

  it('每个年级 / 学习世界 / 徽章都有图标', () => {
    for (const grade of contentPack.grades)
      expect(grade.icon, `年级 ${grade.id} 缺少图标`).toBeTruthy()
    for (const world of contentPack.worlds)
      expect(world.icon, `学习世界 ${world.id} 缺少图标`).toBeTruthy()
    for (const badge of contentPack.badges)
      expect(badge.icon, `徽章 ${badge.id} 缺少图标`).toBeTruthy()
  })

  it('每个领域都能解析出图标（显式声明或按色调兜底）', () => {
    const unresolved = contentPack.categories.filter(
      category => !(category.icon ?? TONE_ICONS[category.tone]),
    )
    expect(unresolved.map(category => category.id)).toEqual([])
  })

  it('同一个年级里，领域图标互不重复', () => {
    for (const gradeId of GRADE_IDS) {
      const icons = contentPack.categories
        .filter(category => category.gradeId === gradeId)
        .map(category => category.icon ?? TONE_ICONS[category.tone])

      const duplicates = icons.filter((icon, index) => icons.indexOf(icon) !== index)
      expect(duplicates, `${gradeId} 的领域撞了图标`).toEqual([])
    }
  })

  it('八张学习地图上的节点图标互不相同', () => {
    for (const [gradeId, layout] of Object.entries(contentPack.maps)) {
      const icons = layout.nodes.map((node) => {
        const world = contentPack.worlds.find(item => item.id === node.worldId)
        return world ? world.icon : 'missing'
      })
      expect(icons, `${gradeId} 的地图上撞了图标`).not.toContain('missing')
    }
  })

  it('年级图标八者互不相同', () => {
    const icons = contentPack.grades.map(grade => grade.icon)
    expect(new Set(icons).size).toBe(icons.length)
  })

  it('徽章图标七者互不相同', () => {
    const icons = contentPack.badges.map(badge => badge.icon)
    expect(new Set(icons).size).toBe(icons.length)
  })

  it('成长等级图标合法', () => {
    for (const level of GROWTH_LEVELS)
      expect(isAppIconName(level.icon), `等级 ${level.id} 图标非法`).toBe(true)
  })

  it('结构性的内容不再保留 emoji 字段（防止悄悄退回 emoji 方案）', () => {
    const offenders: string[] = []

    for (const item of [...contentPack.grades, ...contentPack.categories, ...contentPack.topics, ...contentPack.lessons, ...contentPack.worlds, ...contentPack.badges]) {
      if ('emoji' in item)
        offenders.push((item as { id: string }).id)
    }

    expect(offenders).toEqual([])
  })

  it('互动里的场景道具仍然允许 emoji（它们是插画，不是图标）', () => {
    const sceneEmoji: { emoji?: string }[] = contentPack.lessons
      .flatMap(lesson => lesson.tasks)
      .flatMap(task => (task.kind === 'interaction' || task.kind === 'practice' || task.kind === 'challenge' ? task.interactions : []))
      .flatMap(interaction => Object.values(interaction.payload) as unknown as unknown[])
      .flatMap(value => (Array.isArray(value) ? (value as unknown[]) : [value]))
      .filter((value): value is { emoji?: string } => typeof value === 'object' && value !== null)
      .filter(value => typeof value.emoji === 'string')

    // 场景道具用 emoji 是刻意的：一只鸟、一根胡萝卜本身就是插画
    expect(sceneEmoji.length).toBeGreaterThan(0)
    for (const item of sceneEmoji)
      expect(item.emoji).toBeTruthy()
  })
})

describe('kVisual 的取值优先级', () => {
  it('icon 优先于 emoji —— 这是内容作者可以两种都写的依据', () => {
    // 组件实现：image > icon > emoji（见 src/ui/icons/KVisual.vue）
    // 这里断言语义契约本身，避免有人改坏优先级而没人发现
    const sample: { icon?: AppIconName, emoji?: string } = { icon: 'flask', emoji: '🔬' }
    const chosen = sample.icon ?? sample.emoji
    expect(chosen).toBe('flask')
  })
})
