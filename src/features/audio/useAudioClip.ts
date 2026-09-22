import type { AudioClipId } from '@/domain'

import { computed, onBeforeUnmount, ref } from 'vue'
import { audioClipPath } from '@/domain'

/**
 * 范读播放
 * ========
 *
 * 播放的是**构建期生成好的静态文件**（见 domain/shared/audio.ts），
 * 运行时只有这一件事：把 mp3 放出来。不联网、不合成、不预加载一整本书。
 *
 * 三条刻意的规则
 * --------------
 * 1. **不自动播放**。声音是孩子自己点出来的 —— 他决定「我要再听一遍」，
 *    而不是被页面推着听。这也顺带避开了浏览器对自动播放的限制。
 *
 * 2. **同一个时刻只响一个片段**。否则连点几张字卡会叠在一起，
 *    孩子听到的是两三个字的重唱，比不听还糟。这里用一个模块级的
 *    「当前在响的那一个」，点新的就把旧的停掉。
 *
 * 3. **解码只做一次**。同一个 clipId 反复点（认字卡就是这样用的）
 *    不重复下载、不重复解码 —— 第二次点应当是立刻响的。
 */

/** 全局只保留一个正在发声的音频，避免多处声音叠在一起 */
let current: HTMLAudioElement | null = null
/** 同一个 clipId 只用一份已解码的音频，重复点不重复下载 */
const cache = new Map<AudioClipId, HTMLAudioElement>()

function resolve(clipId: AudioClipId): HTMLAudioElement {
  const cached = cache.get(clipId)
  if (cached)
    return cached

  const audio = new Audio(audioClipPath(clipId))
  // 关键，但不是为了性能：它让第二次点击**立刻**出声，
  // 而「点一下就响」正是孩子愿意反复点的原因。
  audio.preload = 'auto'
  cache.set(clipId, audio)
  return audio
}

export function useAudioClip() {
  /** 正在播放的片段 id；没有声音时为 null */
  const playingId = ref<AudioClipId | null>(null)
  /**
   * 已经开始加载但还没能出声的片段。
   * 分开记是因为两者的等待原因不同：playing 在响、loading 在网络 ——
   * 孩子看到「正在加载」和「正在念」应当是两种反馈。
   */
  const loadingId = ref<AudioClipId | null>(null)

  /** 播放过的片段：用来决定按钮要不要显示小喇叭（没播过时留着更安静） */
  const playedIds = ref<AudioClipId[]>([])

  const isPlaying = computed(() => playingId.value !== null)

  function stop(): void {
    if (current) {
      current.pause()
      // 回到开头，下次点同一个片段仍然从头念
      current.currentTime = 0
      current = null
    }
    playingId.value = null
    loadingId.value = null
  }

  function play(clipId: AudioClipId): void {
    // 点的是正在响的那一个 = 再听一遍，先把它停掉再从头放
    stop()

    const audio = resolve(clipId)
    playingId.value = clipId
    loadingId.value = clipId
    current = audio

    const onReady = () => {
      if (loadingId.value === clipId)
        loadingId.value = null
    }
    const onEnded = () => {
      if (playingId.value === clipId) {
        playingId.value = null
        loadingId.value = null
        current = null
      }
    }

    audio.addEventListener('playing', onReady)
    audio.addEventListener('ended', onEnded)

    // 同一个片段会放很多次，这两个监听器必须在结束时摘掉，
    // 否则每点一次就多挂一个（长按狂点会堆出几百个闭包）。
    const cleanup = () => {
      audio.removeEventListener('playing', onReady)
      audio.removeEventListener('ended', onEnded)
      audio.removeEventListener('pause', cleanup)
    }
    audio.addEventListener('pause', cleanup)
    audio.addEventListener('ended', cleanup)

    audio.currentTime = 0
    void audio.play().catch(() => {
      // 播放失败（文件还没生成 / 浏览器拦截）时不弹错：
      // 孩子看不懂，而且听不到声音这件事本身已经很清楚了。
      if (playingId.value === clipId) {
        playingId.value = null
        loadingId.value = null
        current = null
      }
    })

    if (!playedIds.value.includes(clipId))
      playedIds.value = [...playedIds.value, clipId]
  }

  /** 点一下：在响就停，没响就放 —— 孩子用同一个动作控制开关 */
  function toggle(clipId: AudioClipId): void {
    if (playingId.value === clipId)
      stop()
    else
      play(clipId)
  }

  function hasPlayed(clipId: AudioClipId): boolean {
    return playedIds.value.includes(clipId)
  }

  onBeforeUnmount(() => {
    // 只在自己就是那个发声者时才停：离开一个组件不该掐掉别处的声音
    if (current && playingId.value !== null)
      stop()
  })

  return {
    playingId,
    loadingId,
    isPlaying,
    hasPlayed,
    play,
    stop,
    toggle,
  }
}
