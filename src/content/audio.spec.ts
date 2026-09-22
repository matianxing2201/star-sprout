import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import process from 'node:process'
import { describe, expect, it } from 'vitest'

import { contentPack } from '@/content'
import { AUDIO_CLIP_DIR, AUDIO_CLIP_FORMAT, audioClipPath, isAudioClipId } from '@/domain'

/**
 * 范读音频契约测试
 * ================
 *
 * 范读有一个和其他内容都不一样的地方：**它的产物不在代码里**。
 * 内容写的是 clipId，真正发声的是 public/audio 下的 mp3 ——
 * 两者对不上时不会报错，只会「点了没声音」。
 *
 * 音频由 scripts/generate-audio.mjs 在构建期生成（需要 MIMO_API_KEY），
 * CI 上没有密钥时它会跳过生成。因此这里只查「不依赖网络」的两件事：
 *
 *   1. 脚本里的路径规则与 domain 里的一致 —— 脚本是 node 直跑不转译 TS，
 *      常量只能抄一份，这份抄写必须被钉住，否则文件会写到运行时读不到的地方；
 *   2. 内容引用的 clipId 形状合法 —— 它直接变成文件名，写脏了就是一条死链。
 *
 * 「内容引用了片段、但文件还没生成」不在断言范围内：那正是 audio:sync 的职责，
 * 而且它取决于有没有配密钥，不能作为 CI 的失败条件。
 */

/** 脚本里重复声明了路径规则，这里读源码把它抄回来比对 */
const scriptPath = join(process.cwd(), 'scripts/generate-audio.mjs')

function readScriptConstant(name: string): string | undefined {
  const source = readFileSync(scriptPath, 'utf8')
  return source.match(new RegExp(`^const ${name} = '([^']*)'`, 'm'))?.[1]
}

/** 收集内容里所有显式声明过的 clipId，并记下它出现的位置 */
function declaredClipIds(): { id: string, where: string }[] {
  const found: { id: string, where: string }[] = []
  const add = (id: string | undefined, where: string) => {
    if (id !== undefined)
      found.push({ id, where })
  }

  for (const lesson of contentPack.lessons) {
    for (const task of lesson.tasks) {
      add(task.audioClipId, `课程 ${lesson.id} 的任务 ${task.id}`)

      if (task.kind !== 'interaction' && task.kind !== 'practice' && task.kind !== 'challenge')
        continue

      for (const interaction of task.interactions) {
        add(interaction.audioClipId, `课程 ${lesson.id} 的互动「${interaction.prompt}」`)

        // payload 的形状由 kind 决定，这里只当成「一堆可能含 audioClipId 的数组」
        // 遍历 —— 新增一种互动时不必回来改这个测试。
        for (const value of Object.values(interaction.payload as unknown as Record<string, unknown>)) {
          if (!Array.isArray(value))
            continue
          for (const item of value) {
            if (item !== null && typeof item === 'object')
              add((item as { audioClipId?: string }).audioClipId, `课程 ${lesson.id} 的互动「${interaction.prompt}」`)
          }
        }
      }
    }
  }

  return found
}

describe('范读路径规则', () => {
  it('生成脚本与领域层声明的是同一个目录与格式', () => {
    // 脚本不 import .ts（node 直跑，不做 TS 转译），所以常量是抄的第二份。
    // 这一条就是那份抄写的护栏：改了 domain 就得同步改脚本，否则测试红。
    //
    // 目录的写法两边不同（domain 是站点路径 '/audio'，脚本是要 join 的目录名 'audio'），
    // 这是刻意的：各写各的最自然形态，比较时归一到「纯目录名」即可。
    expect(readScriptConstant('AUDIO_CLIP_FORMAT'), '脚本里的格式与 domain/shared/audio.ts 不一致').toBe(AUDIO_CLIP_FORMAT)
    expect(readScriptConstant('AUDIO_CLIP_DIR'), '脚本里的目录与 domain/shared/audio.ts 不一致')
      .toBe(AUDIO_CLIP_DIR.replace(/^\//, ''))
  })

  it('clipId 推导出的路径与源文件位置一致（否则构建后读不到）', () => {
    // audioClipPath 给出的是**站点路径**（/audio/x.mp3），
    // 它对应的源文件必须是 public/audio/x.mp3 —— 这是 vite 的约定。
    // 两者错位时不会报错，只会「点了没声音」，所以在这里钉住。
    expect(audioClipPath('nursery-literacy-autumn-words-cao')).toBe('/audio/nursery-literacy-autumn-words-cao.mp3')
    expect(join(process.cwd(), 'public', AUDIO_CLIP_DIR)).toBe(join(process.cwd(), 'public/audio'))
  })
})

describe('内容里的范读', () => {
  it('每个 clipId 都是合法形状（它会直接变成文件名）', () => {
    const invalid = declaredClipIds().filter(item => !isAudioClipId(item.id))
    expect(invalid.map(item => `${item.where} → ${item.id}`)).toEqual([])
  })

  it('这一课确实用上了范读（识字启蒙的「声音」一环不能空着）', () => {
    // 识字启蒙的路线是「图片→汉字→声音→游戏→记忆」，
    // 范读要是没接上，「声音」这一环就是空的 —— 那这一课就没落地。
    const ids = declaredClipIds().map(item => item.id)
    expect(ids.length).toBeGreaterThan(0)
  })

  it('已生成的音频文件与声明的 clipId 对得上（没配密钥时跳过）', () => {
    // 这一条只在跑过 audio:sync 的机器上有意义：
    // CI 无密钥、不生成，此时它必须安静跳过而不是判失败。
    const audioDir = join(process.cwd(), 'public', AUDIO_CLIP_DIR)
    if (!existsSync(audioDir))
      return

    const orphans = [...new Set(declaredClipIds().map(item => item.id))]
      .filter(id => !existsSync(join(audioDir, `${id}.${AUDIO_CLIP_FORMAT}`)))

    // 只报告「声明了却没有文件」的，不报告「有文件却没声明」——
    // 后者是删了内容之后留下的旧文件，重跑 audio:sync 不会清理它，
    // 但也不影响任何孩子听到的东西。
    expect(orphans, `这些片段声明了但没有音频文件，重跑 pnpm audio:sync`).toEqual([])
  })
})
