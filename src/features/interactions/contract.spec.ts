import type { AppIconName } from '@/domain'

import { describe, expect, it } from 'vitest'

import { INTERACTION_KINDS, isAppIconName } from '@/domain'

import { INTERACTION_META } from './contract'
import { INTERACTION_REGISTRY } from './registry'

/**
 * 互动契约的完整性
 * ================
 *
 * 「加一种互动」在本项目里要动四处：类型、schema、注册表、能力图标。
 * 只要漏掉任何一处，页面不会报错 —— 只会安静地渲染不出东西。
 * 因此这里把「四处必须齐全」变成一条可执行的断言。
 */
describe('互动契约', () => {
  it('每种互动都有能力图标，且图标名在词汇表内', () => {
    const missing = INTERACTION_KINDS.filter(kind => INTERACTION_META[kind] === undefined)
    expect(missing, '这些互动没有 INTERACTION_META 条目，课程页会显示不出玩法标签').toEqual([])

    const badIcons = INTERACTION_KINDS
      .map(kind => INTERACTION_META[kind]?.icon)
      .filter((icon): icon is AppIconName => typeof icon === 'string')
      .filter(icon => !isAppIconName(icon))
    expect(badIcons, '能力图标不在图标词汇表里').toEqual([])
  })

  it('每种互动都注册了组件', () => {
    const missing = INTERACTION_KINDS.filter(kind => INTERACTION_REGISTRY[kind] === undefined)
    expect(missing, '这些互动没有对应组件，孩子会看到一片空白').toEqual([])
  })

  it('注册表里没有多余的键', () => {
    const known = new Set<string>(INTERACTION_KINDS)
    const extra = Object.keys(INTERACTION_REGISTRY).filter(key => !known.has(key))
    expect(extra, '注册表里有词汇表之外的互动类型').toEqual([])
  })

  it('能力标签与图标两两不重复（一屏里不会撞图）', () => {
    const icons = INTERACTION_KINDS.map(kind => INTERACTION_META[kind]?.icon)
    expect(new Set(icons).size).toBe(icons.length)
  })
})
