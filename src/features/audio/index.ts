/**
 * 范读播放出口
 * ============
 *
 * 内容里只写 clipId，声音由这里放出来。
 * 用法只有两个：
 *   - 需要一枚播放按钮 → ListenButton；
 *   - 需要在自己的点击逻辑里发声（翻牌、连线）→ useAudioClip().play(clipId)。
 */
export { default as ListenButton } from './ListenButton.vue'
export { useAudioClip } from './useAudioClip'
