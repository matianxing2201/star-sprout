/**
 * 范读音频
 * ========
 *
 * 「范读」是一首诗、一首儿歌、一个字的**示范读音**。它回答的永远是同一个问题：
 * 「这个东西该怎么念？」——它不是背景音乐，不为了热闹而存在。
 *
 * 音频在构建期用 TTS 离线预生成成静态文件，随站点一起发布；
 * 运行时只播放文件：不联网、不合成、第三方密钥不进浏览器。
 * 理由见 docs/adr/0002。
 *
 * ## 为什么用 clipId 而不是直接存路径
 *
 * 内容里只写 `clipId`（例如 `nursery-literacy-autumn-words-grass`），
 * 由 `audioClipPath()` 推导出文件路径。这样做有两个好处：
 *   1. 生成脚本用同一个函数算文件名，**改路径规则时不会内容与文件对不上**；
 *   2. `clipId` 稳定，文案改了 id 不变 —— 生成脚本据此判断「这句要不要重新生成」。
 */

/** 音频片段的稳定标识：kebab-case，全局唯一，改了就等于换了一个片段 */
export type AudioClipId = string

/** 生成的音频文件格式。mp3 体积最小，且各浏览器都认 */
export const AUDIO_CLIP_FORMAT = 'mp3'

/** 音频文件在站点里的存放目录（public 下） */
export const AUDIO_CLIP_DIR = '/audio'

/**
 * 由片段 id 推导出站点内的音频路径。
 *
 * 生成脚本（scripts/generate-audio.mjs）与播放组件共用这一个函数，
 * 因此「文件写到哪」和「运行时去哪读」不可能漂移。
 */
export function audioClipPath(clipId: AudioClipId): string {
  return `${AUDIO_CLIP_DIR}/${clipId}.${AUDIO_CLIP_FORMAT}`
}

/**
 * clipId 的合法形状：kebab-case。
 *
 * 它会被直接当成文件名，写脏了就是一条不会被报错的死链
 * （文件在，只是名字对不上）。因此内容与脚本两边都要按同一个规则拦。
 */
export const AUDIO_CLIP_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export function isAudioClipId(value: string): value is AudioClipId {
  return AUDIO_CLIP_ID_PATTERN.test(value)
}
