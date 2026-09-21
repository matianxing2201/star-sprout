import type { WorldMapLayout } from './types'
import type { GradeId } from '@/domain/catalog/types'

/**
 * 每个年级一张学习地图
 * ====================
 *
 * 需求文档：“不同年龄看到不同地图。” 因此这里不是一份布局换标题，而是八份真实不同的地图：
 *   中班/大班    —— 好玩的探索空间，小路绕着走；
 *   一年级/二年级 —— 学科世界登场，路线围着中间的探索岛收拢；
 *   三年级/四年级 —— 学科围成一圈，思维与编程藏在中间或深处；
 *   五年级/六年级 —— 阅读、科学、思维铺路，编程与探索压在最后。
 *
 * 约定（由 schema.ts 与 scripts 一起守卫）：
 *   - 坐标恒在 8~92 之间，相邻节点横纵间距都留足，标签不会叠在一起；
 *   - paths 只连接本图中出现过的世界；
 *   - 每张图留 1~2 个 lockedInFog 节点，表示“还有没解锁的地方”。
 */
export const WORLD_MAP_LAYOUTS: Record<GradeId, WorldMapLayout> = {
  'nursery': {
    gradeId: 'nursery',
    title: '中班的探索地图',
    nodes: [
      { worldId: 'language-forest', x: 20, y: 26, size: 'lg' },
      { worldId: 'creative-workshop', x: 54, y: 16, size: 'md' },
      { worldId: 'music-stage', x: 78, y: 40, size: 'md' },
      { worldId: 'science-lab', x: 50, y: 62, size: 'md', lockedInFog: true },
      { worldId: 'explore-world', x: 20, y: 82, size: 'sm' },
    ],
    paths: [
      { from: 'language-forest', to: 'creative-workshop', curve: 'right' },
      { from: 'creative-workshop', to: 'music-stage', curve: 'right' },
      { from: 'music-stage', to: 'science-lab', curve: 'left' },
      { from: 'science-lab', to: 'explore-world', curve: 'left' },
    ],
  },

  'preschool': {
    gradeId: 'preschool',
    title: '大班的发现地图',
    nodes: [
      { worldId: 'language-forest', x: 18, y: 70, size: 'lg' },
      { worldId: 'reading-forest', x: 44, y: 86, size: 'md' },
      { worldId: 'creative-workshop', x: 44, y: 14, size: 'md' },
      { worldId: 'math-castle', x: 62, y: 60, size: 'md' },
      { worldId: 'science-lab', x: 36, y: 40, size: 'sm' },
      { worldId: 'explore-world', x: 78, y: 34, size: 'sm', lockedInFog: true },
    ],
    paths: [
      { from: 'language-forest', to: 'reading-forest', curve: 'left' },
      { from: 'language-forest', to: 'science-lab', curve: 'right' },
      { from: 'reading-forest', to: 'math-castle', curve: 'right' },
      { from: 'science-lab', to: 'creative-workshop', curve: 'left' },
      { from: 'math-castle', to: 'explore-world', curve: 'right' },
    ],
  },

  'grade-1': {
    gradeId: 'grade-1',
    title: '一年级的成长地图',
    nodes: [
      { worldId: 'language-forest', x: 18, y: 20, size: 'lg' },
      { worldId: 'reading-forest', x: 76, y: 21, size: 'md' },
      { worldId: 'math-castle', x: 70, y: 47, size: 'md' },
      { worldId: 'science-lab', x: 21, y: 50, size: 'md' },
      { worldId: 'art-town', x: 18, y: 84, size: 'sm' },
      { worldId: 'music-stage', x: 76, y: 80, size: 'sm' },
      { worldId: 'programming-world', x: 47, y: 66, size: 'md', lockedInFog: true },
    ],
    paths: [
      { from: 'language-forest', to: 'reading-forest', curve: 'right' },
      { from: 'reading-forest', to: 'math-castle', curve: 'right' },
      { from: 'math-castle', to: 'science-lab', curve: 'left' },
      { from: 'science-lab', to: 'art-town', curve: 'left' },
      { from: 'art-town', to: 'programming-world', curve: 'right' },
      { from: 'programming-world', to: 'music-stage', curve: 'right' },
    ],
  },

  'grade-2': {
    gradeId: 'grade-2',
    title: '二年级的探索岛',
    nodes: [
      { worldId: 'explore-world', x: 50, y: 46, size: 'lg' },
      { worldId: 'language-forest', x: 20, y: 22, size: 'md' },
      { worldId: 'reading-forest', x: 80, y: 22, size: 'md' },
      { worldId: 'math-castle', x: 84, y: 62, size: 'md' },
      { worldId: 'science-lab', x: 52, y: 84, size: 'md' },
      { worldId: 'art-town', x: 16, y: 62, size: 'sm' },
      { worldId: 'programming-world', x: 28, y: 88, size: 'sm', lockedInFog: true },
    ],
    paths: [
      { from: 'language-forest', to: 'explore-world', curve: 'right' },
      { from: 'reading-forest', to: 'explore-world', curve: 'left' },
      { from: 'math-castle', to: 'explore-world', curve: 'left' },
      { from: 'science-lab', to: 'explore-world', curve: 'right' },
      { from: 'art-town', to: 'explore-world', curve: 'right' },
      { from: 'art-town', to: 'programming-world', curve: 'left' },
    ],
  },

  'grade-3': {
    gradeId: 'grade-3',
    title: '三年级的学科环岛',
    nodes: [
      { worldId: 'thinking-camp', x: 50, y: 28, size: 'lg' },
      { worldId: 'culture-hall', x: 26, y: 32, size: 'md' },
      { worldId: 'reading-forest', x: 74, y: 32, size: 'md' },
      { worldId: 'math-castle', x: 74, y: 62, size: 'md' },
      { worldId: 'science-lab', x: 26, y: 62, size: 'md' },
      { worldId: 'creative-workshop', x: 30, y: 86, size: 'sm' },
      { worldId: 'explore-world', x: 70, y: 86, size: 'sm' },
      { worldId: 'programming-world', x: 50, y: 62, size: 'sm', lockedInFog: true },
    ],
    paths: [
      { from: 'culture-hall', to: 'thinking-camp', curve: 'right' },
      { from: 'reading-forest', to: 'thinking-camp', curve: 'left' },
      { from: 'reading-forest', to: 'math-castle', curve: 'right' },
      { from: 'math-castle', to: 'explore-world', curve: 'right' },
      { from: 'science-lab', to: 'creative-workshop', curve: 'left' },
      { from: 'culture-hall', to: 'science-lab', curve: 'left' },
      { from: 'creative-workshop', to: 'programming-world', curve: 'right' },
      { from: 'explore-world', to: 'programming-world', curve: 'left' },
    ],
  },

  'grade-4': {
    gradeId: 'grade-4',
    title: '四年级的星空航线',
    nodes: [
      { worldId: 'science-lab', x: 20, y: 20, size: 'lg' },
      { worldId: 'reading-forest', x: 50, y: 14, size: 'md' },
      { worldId: 'math-castle', x: 80, y: 30, size: 'md' },
      { worldId: 'programming-world', x: 78, y: 66, size: 'md' },
      { worldId: 'thinking-camp', x: 46, y: 86, size: 'md' },
      { worldId: 'explore-world', x: 14, y: 62, size: 'sm' },
      { worldId: 'culture-hall', x: 42, y: 50, size: 'sm', lockedInFog: true },
    ],
    paths: [
      { from: 'science-lab', to: 'reading-forest', curve: 'right' },
      { from: 'reading-forest', to: 'math-castle', curve: 'right' },
      { from: 'math-castle', to: 'programming-world', curve: 'right' },
      { from: 'programming-world', to: 'thinking-camp', curve: 'left' },
      { from: 'thinking-camp', to: 'explore-world', curve: 'left' },
      { from: 'explore-world', to: 'science-lab', curve: 'left' },
      { from: 'reading-forest', to: 'culture-hall', curve: 'left' },
    ],
  },

  'grade-5': {
    gradeId: 'grade-5',
    title: '五年级的求知小径',
    nodes: [
      { worldId: 'reading-forest', x: 22, y: 20, size: 'lg' },
      { worldId: 'science-lab', x: 52, y: 26, size: 'md' },
      { worldId: 'explore-world', x: 82, y: 20, size: 'md' },
      { worldId: 'math-castle', x: 86, y: 60, size: 'md' },
      { worldId: 'programming-world', x: 50, y: 56, size: 'md' },
      { worldId: 'thinking-camp', x: 16, y: 60, size: 'sm' },
      { worldId: 'creative-workshop', x: 50, y: 88, size: 'sm', lockedInFog: true },
    ],
    paths: [
      { from: 'reading-forest', to: 'science-lab', curve: 'right' },
      { from: 'science-lab', to: 'explore-world', curve: 'right' },
      { from: 'explore-world', to: 'math-castle', curve: 'right' },
      { from: 'math-castle', to: 'programming-world', curve: 'left' },
      { from: 'programming-world', to: 'thinking-camp', curve: 'left' },
      { from: 'thinking-camp', to: 'reading-forest', curve: 'left' },
      { from: 'thinking-camp', to: 'creative-workshop', curve: 'right' },
    ],
  },

  'grade-6': {
    gradeId: 'grade-6',
    title: '六年级的毕业图鉴',
    nodes: [
      { worldId: 'math-castle', x: 22, y: 24, size: 'lg' },
      { worldId: 'reading-forest', x: 60, y: 24, size: 'md' },
      { worldId: 'explore-world', x: 86, y: 44, size: 'md' },
      { worldId: 'science-lab', x: 82, y: 86, size: 'md' },
      { worldId: 'programming-world', x: 50, y: 80, size: 'lg' },
      { worldId: 'thinking-camp', x: 18, y: 50, size: 'sm' },
      { worldId: 'culture-hall', x: 48, y: 50, size: 'sm' },
      { worldId: 'creative-workshop', x: 14, y: 86, size: 'sm', lockedInFog: true },
    ],
    paths: [
      { from: 'math-castle', to: 'reading-forest', curve: 'right' },
      { from: 'reading-forest', to: 'explore-world', curve: 'right' },
      { from: 'explore-world', to: 'science-lab', curve: 'right' },
      { from: 'science-lab', to: 'programming-world', curve: 'left' },
      { from: 'programming-world', to: 'thinking-camp', curve: 'left' },
      { from: 'thinking-camp', to: 'math-castle', curve: 'left' },
      { from: 'culture-hall', to: 'creative-workshop', curve: 'right' },
      { from: 'culture-hall', to: 'programming-world', curve: 'right' },
    ],
  },
}

export function getWorldMap(gradeId: GradeId): WorldMapLayout | undefined {
  return WORLD_MAP_LAYOUTS[gradeId]
}
