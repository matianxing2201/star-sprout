/**
 * 图标变体表（此文件由 scripts/sync-icons.mjs 生成，请勿手工编辑）
 * =================================================================
 *
 * 重新生成：pnpm icons:sync
 *
 * 这是唯一直接依赖图标来源的文件。语义名来自 domain/shared/icons.ts，
 * 这里把它翻译成具体图标，并声明该图标需要哪几种字重：
 *   - 每个图标都内联 bold（界面控件默认字重）；
 *   - 「身份型」图标（领域 / 世界 / 主题 / 徽章 / 步骤）额外内联 duotone，
 *     双色调正是纸雕风格要的「主形 + 20% 副形」两层剪纸感；
 *   - star 额外内联 fill（表示「已经获得」）。
 *
 * satisfies Record<AppIconName, IconVariants> 是编译期保证：
 *   - 词汇表加了名字却忘了映射 → 报错（缺 key）；
 *   - 这里写了词汇表以外的名字 → 报错（多余 key）。
 * 因此不可能出现「跑到某个页面才发现图标是空白」。
 *
 * 为什么不用 iconfont（字体图标）：
 *   - 字体图标没有双色调，而本项目的视觉语言依赖双色调；
 *   - 小字号下抗锯齿差、基线对齐困难，还会受字体加载影响（FOUT）；
 *   - 它本质是文字：屏幕阅读器会念出乱码，复制粘贴也会污染文本。
 */

import type { Component } from 'vue'

import type { AppIconName } from '@/domain'

import IconAcornBold from '~icons/ph/acorn-bold'
import IconAcornDuotone from '~icons/ph/acorn-duotone'
import IconArrowLeftBold from '~icons/ph/arrow-left-bold'
import IconArrowRightBold from '~icons/ph/arrow-right-bold'
import IconArrowUpRightBold from '~icons/ph/arrow-up-right-bold'
import IconRefreshBold from '~icons/ph/arrows-clockwise-bold'
import IconAtomBold from '~icons/ph/atom-bold'
import IconBackpackBold from '~icons/ph/backpack-bold'
import IconBackpackDuotone from '~icons/ph/backpack-duotone'
import IconBankBold from '~icons/ph/bank-bold'
import IconBankDuotone from '~icons/ph/bank-duotone'
import IconBasketBold from '~icons/ph/basket-bold'
import IconTelescopeBold from '~icons/ph/binoculars-bold'
import IconBinocularsBold from '~icons/ph/binoculars-bold'
import IconBirdBold from '~icons/ph/bird-bold'
import IconBirdDuotone from '~icons/ph/bird-duotone'
import IconBookBold from '~icons/ph/book-bold'
import IconBookDuotone from '~icons/ph/book-duotone'
import IconBookOpenBold from '~icons/ph/book-open-bold'
import IconBookOpenDuotone from '~icons/ph/book-open-duotone'
import IconBooksBold from '~icons/ph/books-bold'
import IconBooksDuotone from '~icons/ph/books-duotone'
import IconBrainBold from '~icons/ph/brain-bold'
import IconBrainDuotone from '~icons/ph/brain-duotone'
import IconBroomBold from '~icons/ph/broom-bold'
import IconButterflyBold from '~icons/ph/butterfly-bold'
import IconCalculatorBold from '~icons/ph/calculator-bold'
import IconCalculatorDuotone from '~icons/ph/calculator-duotone'
import IconCalendarBold from '~icons/ph/calendar-blank-bold'
import IconCarBold from '~icons/ph/car-bold'
import IconCarDuotone from '~icons/ph/car-duotone'
import IconCardsBold from '~icons/ph/cards-bold'
import IconCarrotBold from '~icons/ph/carrot-bold'
import IconCarrotDuotone from '~icons/ph/carrot-duotone'
import IconCastleBold from '~icons/ph/castle-turret-bold'
import IconCastleDuotone from '~icons/ph/castle-turret-duotone'
import IconChalkboardBold from '~icons/ph/chalkboard-bold'
import IconChalkboardDuotone from '~icons/ph/chalkboard-duotone'
import IconChartLineBold from '~icons/ph/chart-line-bold'
import IconChartLineDuotone from '~icons/ph/chart-line-duotone'
import IconCheckBold from '~icons/ph/check-bold'
import IconCheckCircleBold from '~icons/ph/check-circle-bold'
import IconClockBold from '~icons/ph/clock-bold'
import IconClockDuotone from '~icons/ph/clock-duotone'
import IconCloudBold from '~icons/ph/cloud-bold'
import IconCloudDuotone from '~icons/ph/cloud-duotone'
import IconRainBold from '~icons/ph/cloud-rain-bold'
import IconRainDuotone from '~icons/ph/cloud-rain-duotone'
import IconCodeBold from '~icons/ph/code-bold'
import IconCodeDuotone from '~icons/ph/code-duotone'
import IconCompassBold from '~icons/ph/compass-bold'
import IconCompassDuotone from '~icons/ph/compass-duotone'
import IconConfettiBold from '~icons/ph/confetti-bold'
import IconCubeBold from '~icons/ph/cube-bold'
import IconCubeDuotone from '~icons/ph/cube-duotone'
import IconCursorClickBold from '~icons/ph/cursor-click-bold'
import IconDetectiveBold from '~icons/ph/detective-bold'
import IconDetectiveDuotone from '~icons/ph/detective-duotone'
import IconDnaBold from '~icons/ph/dna-bold'
import IconDragHandleBold from '~icons/ph/dots-six-vertical-bold'
import IconDropBold from '~icons/ph/drop-bold'
import IconEarBold from '~icons/ph/ear-bold'
import IconEyeBold from '~icons/ph/eye-bold'
import IconFireBold from '~icons/ph/fire-bold'
import IconFireDuotone from '~icons/ph/fire-duotone'
import IconFishBold from '~icons/ph/fish-bold'
import IconFlaskBold from '~icons/ph/flask-bold'
import IconFlaskDuotone from '~icons/ph/flask-duotone'
import IconFlowerBold from '~icons/ph/flower-bold'
import IconFlowerDuotone from '~icons/ph/flower-duotone'
import IconForkKnifeBold from '~icons/ph/fork-knife-bold'
import IconFunnelBold from '~icons/ph/funnel-bold'
import IconGiftBold from '~icons/ph/gift-bold'
import IconGiftDuotone from '~icons/ph/gift-duotone'
import IconPlanetBold from '~icons/ph/globe-bold'
import IconPlanetDuotone from '~icons/ph/globe-duotone'
import IconGlobeBold from '~icons/ph/globe-hemisphere-west-bold'
import IconGlobeDuotone from '~icons/ph/globe-hemisphere-west-duotone'
import IconGraduationCapBold from '~icons/ph/graduation-cap-bold'
import IconGraduationCapDuotone from '~icons/ph/graduation-cap-duotone'
import IconGridBold from '~icons/ph/grid-four-bold'
import IconHandBold from '~icons/ph/hand-bold'
import IconClickHandBold from '~icons/ph/hand-pointing-bold'
import IconClickHandDuotone from '~icons/ph/hand-pointing-duotone'
import IconHandshakeBold from '~icons/ph/handshake-bold'
import IconHandshakeDuotone from '~icons/ph/handshake-duotone'
import IconHeartBold from '~icons/ph/heart-bold'
import IconHourglassBold from '~icons/ph/hourglass-bold'
import IconHourglassDuotone from '~icons/ph/hourglass-duotone'
import IconHomeBold from '~icons/ph/house-bold'
import IconHomeDuotone from '~icons/ph/house-duotone'
import IconInfoBold from '~icons/ph/info-bold'
import IconIslandBold from '~icons/ph/island-bold'
import IconIslandDuotone from '~icons/ph/island-duotone'
import IconKeyBold from '~icons/ph/key-bold'
import IconKeyDuotone from '~icons/ph/key-duotone'
import IconLadderBold from '~icons/ph/ladder-bold'
import IconLeafBold from '~icons/ph/leaf-bold'
import IconLightbulbBold from '~icons/ph/lightbulb-bold'
import IconLightbulbDuotone from '~icons/ph/lightbulb-duotone'
import IconEnergyBold from '~icons/ph/lightning-bold'
import IconEnergyDuotone from '~icons/ph/lightning-duotone'
import IconLinkBold from '~icons/ph/link-bold'
import IconListChecksBold from '~icons/ph/list-checks-bold'
import IconLockBold from '~icons/ph/lock-bold'
import IconLockDuotone from '~icons/ph/lock-duotone'
import IconLockOpenBold from '~icons/ph/lock-open-bold'
import IconMagnifierBold from '~icons/ph/magnifying-glass-bold'
import IconMagnifierDuotone from '~icons/ph/magnifying-glass-duotone'
import IconMapBold from '~icons/ph/map-trifold-bold'
import IconMapDuotone from '~icons/ph/map-trifold-duotone'
import IconMathOperationsBold from '~icons/ph/math-operations-bold'
import IconMathOperationsDuotone from '~icons/ph/math-operations-duotone'
import IconMedalBold from '~icons/ph/medal-bold'
import IconMedalDuotone from '~icons/ph/medal-duotone'
import IconMegaphoneBold from '~icons/ph/megaphone-bold'
import IconStageBold from '~icons/ph/microphone-stage-bold'
import IconMicrophoneBold from '~icons/ph/microphone-stage-bold'
import IconStageDuotone from '~icons/ph/microphone-stage-duotone'
import IconMicrophoneDuotone from '~icons/ph/microphone-stage-duotone'
import IconMicroscopeBold from '~icons/ph/microscope-bold'
import IconMinusBold from '~icons/ph/minus-bold'
import IconMoonBold from '~icons/ph/moon-stars-bold'
import IconMoonDuotone from '~icons/ph/moon-stars-duotone'
import IconMusicNoteBold from '~icons/ph/music-note-bold'
import IconMusicNotesBold from '~icons/ph/music-notes-bold'
import IconMusicNotesDuotone from '~icons/ph/music-notes-duotone'
import IconNotebookBold from '~icons/ph/notebook-bold'
import IconBrushBold from '~icons/ph/paint-brush-broad-bold'
import IconBrushDuotone from '~icons/ph/paint-brush-broad-duotone'
import IconPaletteBold from '~icons/ph/palette-bold'
import IconPaletteDuotone from '~icons/ph/palette-duotone'
import IconPencilRulerBold from '~icons/ph/pencil-ruler-bold'
import IconPencilRulerDuotone from '~icons/ph/pencil-ruler-duotone'
import IconPencilBold from '~icons/ph/pencil-simple-bold'
import IconPencilDuotone from '~icons/ph/pencil-simple-duotone'
import IconRunBold from '~icons/ph/person-simple-run-bold'
import IconRunDuotone from '~icons/ph/person-simple-run-duotone'
import IconPlantBold from '~icons/ph/plant-bold'
import IconPlantDuotone from '~icons/ph/plant-duotone'
import IconPlayBold from '~icons/ph/play-bold'
import IconPlusBold from '~icons/ph/plus-bold'
import IconPolygonBold from '~icons/ph/polygon-bold'
import IconPuzzleBold from '~icons/ph/puzzle-piece-bold'
import IconPuzzleDuotone from '~icons/ph/puzzle-piece-duotone'
import IconQuestionBold from '~icons/ph/question-bold'
import IconRocketBold from '~icons/ph/rocket-bold'
import IconRocketDuotone from '~icons/ph/rocket-duotone'
import IconRulerBold from '~icons/ph/ruler-bold'
import IconScalesBold from '~icons/ph/scales-bold'
import IconScalesDuotone from '~icons/ph/scales-duotone'
import IconScissorsBold from '~icons/ph/scissors-bold'
import IconScissorsDuotone from '~icons/ph/scissors-duotone'
import IconShapesBold from '~icons/ph/shapes-bold'
import IconShapesDuotone from '~icons/ph/shapes-duotone'
import IconSlidersBold from '~icons/ph/sliders-bold'
import IconSnowflakeBold from '~icons/ph/snowflake-bold'
import IconSnowflakeDuotone from '~icons/ph/snowflake-duotone'
import IconSortBold from '~icons/ph/sort-ascending-bold'
import IconSparkleBold from '~icons/ph/sparkle-bold'
import IconSpeakerBold from '~icons/ph/speaker-high-bold'
import IconSpeakerDuotone from '~icons/ph/speaker-high-duotone'
import IconStampBold from '~icons/ph/stamp-bold'
import IconStampDuotone from '~icons/ph/stamp-duotone'
import IconStarBold from '~icons/ph/star-bold'
import IconStarDuotone from '~icons/ph/star-duotone'
import IconStarFill from '~icons/ph/star-fill'
import IconStarFourBold from '~icons/ph/star-four-bold'
import IconStarFourDuotone from '~icons/ph/star-four-duotone'
import IconStorefrontBold from '~icons/ph/storefront-bold'
import IconSunBold from '~icons/ph/sun-bold'
import IconSwapBold from '~icons/ph/swap-bold'
import IconTargetBold from '~icons/ph/target-bold'
import IconTargetDuotone from '~icons/ph/target-duotone'
import IconTestTubeBold from '~icons/ph/test-tube-bold'
import IconThermometerBold from '~icons/ph/thermometer-bold'
import IconTrainBold from '~icons/ph/train-bold'
import IconTrainDuotone from '~icons/ph/train-duotone'
import IconTranslateBold from '~icons/ph/translate-bold'
import IconTranslateDuotone from '~icons/ph/translate-duotone'
import IconTreeBold from '~icons/ph/tree-bold'
import IconTreeDuotone from '~icons/ph/tree-duotone'
import IconForestBold from '~icons/ph/tree-evergreen-bold'
import IconForestDuotone from '~icons/ph/tree-evergreen-duotone'
import IconTrendUpBold from '~icons/ph/trend-up-bold'
import IconTrophyBold from '~icons/ph/trophy-bold'
import IconTrophyDuotone from '~icons/ph/trophy-duotone'
import IconUsersBold from '~icons/ph/users-three-bold'
import IconConstructionBold from '~icons/ph/warning-bold'
import IconWindBold from '~icons/ph/wind-bold'
import IconWrenchBold from '~icons/ph/wrench-bold'
import IconWrenchDuotone from '~icons/ph/wrench-duotone'
import IconCloseBold from '~icons/ph/x-bold'

export interface IconVariants {
  bold: Component
  duotone?: Component
  fill?: Component
}

const ICON_VARIANTS = {
  'arrow-right': { bold: IconArrowRightBold },
  'arrow-left': { bold: IconArrowLeftBold },
  'arrow-up-right': { bold: IconArrowUpRightBold },
  'check': { bold: IconCheckBold },
  'check-circle': { bold: IconCheckCircleBold },
  'close': { bold: IconCloseBold },
  'plus': { bold: IconPlusBold },
  'minus': { bold: IconMinusBold },
  'refresh': { bold: IconRefreshBold },
  'play': { bold: IconPlayBold },
  'drag-handle': { bold: IconDragHandleBold },
  'sort': { bold: IconSortBold },
  'swap': { bold: IconSwapBold },
  'funnel': { bold: IconFunnelBold },
  'magnifier': { bold: IconMagnifierBold, duotone: IconMagnifierDuotone },
  'cursor-click': { bold: IconCursorClickBold },
  'click-hand': { bold: IconClickHandBold, duotone: IconClickHandDuotone },
  'star': { bold: IconStarBold, duotone: IconStarDuotone, fill: IconStarFill },
  'star-four': { bold: IconStarFourBold, duotone: IconStarFourDuotone },
  'sparkle': { bold: IconSparkleBold },
  'energy': { bold: IconEnergyBold, duotone: IconEnergyDuotone },
  'fire': { bold: IconFireBold, duotone: IconFireDuotone },
  'trophy': { bold: IconTrophyBold, duotone: IconTrophyDuotone },
  'medal': { bold: IconMedalBold, duotone: IconMedalDuotone },
  'gift': { bold: IconGiftBold, duotone: IconGiftDuotone },
  'lightbulb': { bold: IconLightbulbBold, duotone: IconLightbulbDuotone },
  'lock': { bold: IconLockBold, duotone: IconLockDuotone },
  'lock-open': { bold: IconLockOpenBold },
  'key': { bold: IconKeyBold, duotone: IconKeyDuotone },
  'construction': { bold: IconConstructionBold },
  'question': { bold: IconQuestionBold },
  'info': { bold: IconInfoBold },
  'target': { bold: IconTargetBold, duotone: IconTargetDuotone },
  'home': { bold: IconHomeBold, duotone: IconHomeDuotone },
  'map': { bold: IconMapBold, duotone: IconMapDuotone },
  'compass': { bold: IconCompassBold, duotone: IconCompassDuotone },
  'island': { bold: IconIslandBold, duotone: IconIslandDuotone },
  'ladder': { bold: IconLadderBold },
  'castle': { bold: IconCastleBold, duotone: IconCastleDuotone },
  'forest': { bold: IconForestBold, duotone: IconForestDuotone },
  'tree': { bold: IconTreeBold, duotone: IconTreeDuotone },
  'plant': { bold: IconPlantBold, duotone: IconPlantDuotone },
  'acorn': { bold: IconAcornBold, duotone: IconAcornDuotone },
  'planet': { bold: IconPlanetBold, duotone: IconPlanetDuotone },
  'globe': { bold: IconGlobeBold, duotone: IconGlobeDuotone },
  'stage': { bold: IconStageBold, duotone: IconStageDuotone },
  'bank': { bold: IconBankBold, duotone: IconBankDuotone },
  'storefront': { bold: IconStorefrontBold },
  'backpack': { bold: IconBackpackBold, duotone: IconBackpackDuotone },
  'notebook': { bold: IconNotebookBold },
  'car': { bold: IconCarBold, duotone: IconCarDuotone },
  'train': { bold: IconTrainBold, duotone: IconTrainDuotone },
  'stamp': { bold: IconStampBold, duotone: IconStampDuotone },
  'graduation-cap': { bold: IconGraduationCapBold, duotone: IconGraduationCapDuotone },
  'chalkboard': { bold: IconChalkboardBold, duotone: IconChalkboardDuotone },
  'book': { bold: IconBookBold, duotone: IconBookDuotone },
  'book-open': { bold: IconBookOpenBold, duotone: IconBookOpenDuotone },
  'books': { bold: IconBooksBold, duotone: IconBooksDuotone },
  'translate': { bold: IconTranslateBold, duotone: IconTranslateDuotone },
  'calculator': { bold: IconCalculatorBold, duotone: IconCalculatorDuotone },
  'math-operations': { bold: IconMathOperationsBold, duotone: IconMathOperationsDuotone },
  'shapes': { bold: IconShapesBold, duotone: IconShapesDuotone },
  'polygon': { bold: IconPolygonBold },
  'cube': { bold: IconCubeBold, duotone: IconCubeDuotone },
  'ruler': { bold: IconRulerBold },
  'pencil-ruler': { bold: IconPencilRulerBold, duotone: IconPencilRulerDuotone },
  'flask': { bold: IconFlaskBold, duotone: IconFlaskDuotone },
  'test-tube': { bold: IconTestTubeBold },
  'atom': { bold: IconAtomBold },
  'dna': { bold: IconDnaBold },
  'microscope': { bold: IconMicroscopeBold },
  'telescope': { bold: IconTelescopeBold },
  'binoculars': { bold: IconBinocularsBold },
  'palette': { bold: IconPaletteBold, duotone: IconPaletteDuotone },
  'brush': { bold: IconBrushBold, duotone: IconBrushDuotone },
  'pencil': { bold: IconPencilBold, duotone: IconPencilDuotone },
  'scissors': { bold: IconScissorsBold, duotone: IconScissorsDuotone },
  'music-notes': { bold: IconMusicNotesBold, duotone: IconMusicNotesDuotone },
  'music-note': { bold: IconMusicNoteBold },
  'speaker': { bold: IconSpeakerBold, duotone: IconSpeakerDuotone },
  'microphone': { bold: IconMicrophoneBold, duotone: IconMicrophoneDuotone },
  'megaphone': { bold: IconMegaphoneBold },
  'run': { bold: IconRunBold, duotone: IconRunDuotone },
  'brain': { bold: IconBrainBold, duotone: IconBrainDuotone },
  'code': { bold: IconCodeBold, duotone: IconCodeDuotone },
  'grid': { bold: IconGridBold },
  'list-checks': { bold: IconListChecksBold },
  'clock': { bold: IconClockBold, duotone: IconClockDuotone },
  'hourglass': { bold: IconHourglassBold, duotone: IconHourglassDuotone },
  'calendar': { bold: IconCalendarBold },
  'chart-line': { bold: IconChartLineBold, duotone: IconChartLineDuotone },
  'trend-up': { bold: IconTrendUpBold },
  'users': { bold: IconUsersBold },
  'handshake': { bold: IconHandshakeBold, duotone: IconHandshakeDuotone },
  'heart': { bold: IconHeartBold },
  'scales': { bold: IconScalesBold, duotone: IconScalesDuotone },
  'wrench': { bold: IconWrenchBold, duotone: IconWrenchDuotone },
  'broom': { bold: IconBroomBold },
  'fork-knife': { bold: IconForkKnifeBold },
  'detective': { bold: IconDetectiveBold, duotone: IconDetectiveDuotone },
  'puzzle': { bold: IconPuzzleBold, duotone: IconPuzzleDuotone },
  'link': { bold: IconLinkBold },
  'cards': { bold: IconCardsBold },
  'sliders': { bold: IconSlidersBold },
  'basket': { bold: IconBasketBold },
  'rocket': { bold: IconRocketBold, duotone: IconRocketDuotone },
  'confetti': { bold: IconConfettiBold },
  'leaf': { bold: IconLeafBold },
  'flower': { bold: IconFlowerBold, duotone: IconFlowerDuotone },
  'carrot': { bold: IconCarrotBold, duotone: IconCarrotDuotone },
  'bird': { bold: IconBirdBold, duotone: IconBirdDuotone },
  'butterfly': { bold: IconButterflyBold },
  'fish': { bold: IconFishBold },
  'sun': { bold: IconSunBold },
  'moon': { bold: IconMoonBold, duotone: IconMoonDuotone },
  'cloud': { bold: IconCloudBold, duotone: IconCloudDuotone },
  'rain': { bold: IconRainBold, duotone: IconRainDuotone },
  'wind': { bold: IconWindBold },
  'snowflake': { bold: IconSnowflakeBold, duotone: IconSnowflakeDuotone },
  'drop': { bold: IconDropBold },
  'thermometer': { bold: IconThermometerBold },
  'eye': { bold: IconEyeBold },
  'ear': { bold: IconEarBold },
  'hand': { bold: IconHandBold },
} as const satisfies Record<AppIconName, IconVariants>

export function resolveIconVariants(name: AppIconName): IconVariants {
  return ICON_VARIANTS[name]
}
