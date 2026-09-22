/**
 * 范读声明标记
 * ============
 *
 * `audioText(...)` 是**给内容作者用的书写约定**，不是一个真的会执行的函数 ——
 * 它唯一的作用是让 scripts/generate-audio.mjs 能用一条正则
 * 从课程文件里把「要读的文字」扫出来。
 *
 *     audioText('nursery-literacy-autumn-words-cao', '草。')
 *     audioText('nursery-literacy-autumn-words-recital', '草、叶、花、谷。', '一字一顿，慢慢念。')
 *
 * 为什么不另建一份「文案清单」：那一定会和课程漂移 ——
 * 课上改了词，清单忘了改，孩子听到的就是上一版。把文字写在用到它的地方，
 * 生成脚本读同一份内容，「读的」和「写的」永远是一句话。
 *
 * 参数必须是**字面量**（脚本用正则读源码，不解析求值），
 * 因此这里返回 undefined、内容里也不要把它写进任何表达式的右边。
 */
export function audioText(
  _clipId: string,
  _text: string,
  _style?: string,
): undefined {
  return undefined
}
