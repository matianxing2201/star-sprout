import type { GradeId } from '../catalog/types'
import type { AppIconName } from '../shared/icons'
import type { ToneKey } from '../shared/tone'

/**
 * 学习世界（LearningWorld）与学习地图（WorldMap）
 * ============================================
 *
 * 需求文档「不要把所有内容都做成学科」：孩子进入的不是“科目列表”，
 * 而是一片可以逛、可以迷路、可以发现隐藏角落的学习世界。
 *
 * 因此跨学科空间与学科空间共用同一个模型：
 *   - 学习世界只回答“这是什么地方、适合谁、包含哪些领域”；
 *   - 学习地图只回答“在地图上摆在哪里、怎么走”；
 *   - 具体学什么，仍然回到 catalog 的 分类 → 主题 → 课程。
 *
 * 这属于产品的领域语言（孩子和家长都会看到“学习世界”这个概念），
 * 所以定义在 domain 里，内容包只负责给出具体数据。
 */

/** 一个学习世界：孩子在地图上看到的“一块地方” */
export interface LearningWorld {
  /** kebab-case，例如 'reading-forest' */
  id: string
  /** 例如 '阅读森林' */
  name: string
  /** 地图节点上的图标；用矢量图标才能在地图上保持一致的粗细与尺寸 */
  icon: AppIconName
  tone: ToneKey
  /** 孩子能读懂的一句话 */
  tagline: string
  /** 面向家长的一句话说明 */
  description: string
  /** 这个空间适合哪些年级 */
  gradeIds: GradeId[]
  /** 属于这个空间的二级分类 id（跨年级，允许为空数组 —— 内容后续补充） */
  categoryIds: string[]
}

/** 学习地图上的一个节点 */
export interface WorldMapNode {
  worldId: string
  /** 相对容器的百分比坐标 0-100 */
  x: number
  y: number
  /** 视觉尺寸档位 */
  size: 'sm' | 'md' | 'lg'
  /** 还未解锁的节点在地图上显示为“迷雾” */
  lockedInFog?: boolean
}

/** 学习地图上的路径：节点之间用虚线小路连接 */
export interface WorldMapPath {
  from: string
  to: string
  /** 曲线方向，让地图看起来是自然蜿蜒的小路而不是流程图 */
  curve?: 'left' | 'right' | 'straight'
}

export interface WorldMapLayout {
  gradeId: GradeId
  /** 地图标题，例如 '中班的探索地图' */
  title: string
  nodes: WorldMapNode[]
  paths: WorldMapPath[]
}
