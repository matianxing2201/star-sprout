/**
 * 语义图标词汇表（Icon Vocabulary）
 * ================================
 *
 * 图标名属于**领域语言**，而不是某个图标库的实现细节：
 * 内容包里的 `Category.icon` / `Lesson.icon` 都是从这里取值，
 * 教案作者写的是「flask」这样的语义，而不是某个库的组件名。
 *
 * 因此词汇表定义在 domain，渲染（图标库映射）留在 ui/icons。
 * 两边靠 `satisfies Record<AppIconName, Component>` 对齐：
 *   - 这里加了一个名字但 ui 没给映射 → 编译期报错；
 *   - ui 里写了词汇表之外的名字 → 同样报错。
 *
 * 所以「换了图标库」不会牵动 domain，也不会漏掉任何一个名字。
 */
export const APP_ICON_NAMES = [
  /* 方向与操作 */
  'arrow-right',
  'arrow-left',
  'arrow-up-right',
  'check',
  'check-circle',
  'close',
  'plus',
  'minus',
  'refresh',
  'play',
  'drag-handle',
  'sort',
  'swap',
  'funnel',
  'magnifier',
  'cursor-click',
  'click-hand',

  /* 状态与反馈 */
  'star',
  'star-four',
  'sparkle',
  'energy',
  'fire',
  'trophy',
  'medal',
  'gift',
  'lightbulb',
  'lock',
  'lock-open',
  'key',
  'construction',
  'question',
  'info',
  'target',

  /* 导航与地点 */
  'home',
  'map',
  'compass',
  'island',
  'ladder',
  'castle',
  'forest',
  'tree',
  'plant',
  'acorn',
  'planet',
  'globe',
  'stage',
  'bank',
  'storefront',
  'backpack',
  'notebook',
  'car',
  'train',
  'stamp',
  'graduation-cap',
  'chalkboard',

  /* 学科与领域 */
  'book',
  'book-open',
  'books',
  'translate',
  'calculator',
  'math-operations',
  'shapes',
  'polygon',
  'cube',
  'ruler',
  'pencil-ruler',
  'flask',
  'test-tube',
  'atom',
  'dna',
  'microscope',
  'telescope',
  'binoculars',
  'palette',
  'brush',
  'pencil',
  'scissors',
  'music-notes',
  'music-note',
  'speaker',
  'microphone',
  'megaphone',
  'run',
  'brain',
  'code',
  'grid',
  'list-checks',
  'clock',
  'hourglass',
  'calendar',
  'chart-line',
  'trend-up',
  'users',
  'handshake',
  'heart',
  'scales',
  'wrench',
  'broom',
  'fork-knife',
  'detective',

  /* 能力与互动 */
  'puzzle',
  'link',
  'cards',
  'sliders',
  'basket',
  'rocket',
  'confetti',

  /* 自然与场景 */
  'leaf',
  'flower',
  'grains',
  'carrot',
  'bird',
  'butterfly',
  'fish',
  'sun',
  'moon',
  'cloud',
  'rain',
  'wind',
  'snowflake',
  'drop',
  'thermometer',
  'eye',
  'ear',
  'hand',
] as const

export type AppIconName = (typeof APP_ICON_NAMES)[number]

export function isAppIconName(value: string): value is AppIconName {
  return (APP_ICON_NAMES as readonly string[]).includes(value)
}
