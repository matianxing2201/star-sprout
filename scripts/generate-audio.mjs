/**
 * 范读音频生成脚本
 * ================
 *
 * 用法：pnpm audio:sync
 *
 * 为什么需要脚本
 * -------------
 * 「范读」是汉字、诗句的示范读音，它在产品里是**内容的一部分**，不是背景音乐。
 * 但项目是纯前端静态站点，没有服务端 —— 那就不能让浏览器在运行时去调 TTS：
 *   - 密钥会进浏览器，等于公开；
 *   - 孩子每点一次都发一次第三方请求，离线就听不到。
 *
 * 因此音频在**构建期**用 TTS 生成成静态文件，随站点一起发布；
 * 运行时只播放文件。理由与取舍见 docs/adr/0002。
 *
 * 文本从哪来
 * ----------
 * 不另建一份「文案清单」——那一定会和内容漂移。
 * 脚本直接扫 src/content 下的课程文件，按约定读取：
 *
 *   audioText('clip-id', '要读的文字')                   ← 单句
 *   audioText('clip-id', '要读的文字', '风格指令')         ← 带风格指令
 *
 * 内容作者把要读的文字写在课程文件里（紧挨着用到它的地方），
 * 脚本用同一份文字去生成音频。**改了文字，音频文件还在，所以会跳过** ——
 * 这是刻意的：重跑一次即可，但脚本不会在你没要求时烧 API 额度。
 * 想看哪些片段该重新生成：pnpm audio:sync --check
 *
 * 幂等
 * ----
 * 文件已存在就跳过（与 icons:sync 同一个哲学：脚本可反复跑，结果稳定）。
 * 想强制重新生成某一条：删掉 public/audio/<clip-id>.mp3 再跑。
 * 想全部重来：pnpm audio:sync --force
 *
 * 密钥
 * ----
 * 读根目录 .env.local 的 MIMO_API_KEY（该文件不进仓库）。
 * 拿不到密钥时脚本**只报告缺哪些文件、不报错退出**，
 * 这样 CI / 没配密钥的机器上仍然能跑 build。
 */

import { Buffer } from 'node:buffer'
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import process from 'node:process'

const root = process.cwd()

/* ------------------------------------------------------------------ */
/* 与 src/domain/shared/audio.ts 保持一致                              */
/* ------------------------------------------------------------------ */

/**
 * 音频路径规则必须和领域层一致。
 * 这里不 import .ts（脚本是 node 直跑，不做 TS 转译），
 * 因此 audio.spec.ts 会断言这两个常量和 domain 里的一致 —— 漂移即测试红。
 *
 * 注意 DIR 的写法不同：domain 那边是**站点路径**（'/audio'，给浏览器用），
 * 这边是**目录名**（'audio'，要 join 到 public 下）。两者是同一回事的两种形态，
 * spec 会把它们归一到同一形式再比。
 */
const AUDIO_CLIP_FORMAT = 'mp3'
const AUDIO_CLIP_DIR = 'audio'

const audioDir = join(root, 'public', AUDIO_CLIP_DIR)
const clipPath = clipId => join(audioDir, `${clipId}.${AUDIO_CLIP_FORMAT}`)

/* ------------------------------------------------------------------ */
/* MiMo TTS 接口                                                       */
/* ------------------------------------------------------------------ */

/**
 * MiMo 的 TTS 走 OpenAI 兼容的 chat/completions，不是常见的 /audio/speech：
 *   - 要读的文本放在 role: 'assistant'
 *   - 风格指令放在 role: 'user'（内容不会出现在语音里）
 *   - 音频以 base64 放在 choices[0].message.audio.data
 */
const MIMO_BASE_URL = process.env.MIMO_BASE_URL ?? 'https://api.xiaomimimo.com/v1'
const MIMO_MODEL = process.env.MIMO_MODEL ?? 'mimo-v2.5-tts'
const MIMO_VOICE = process.env.MIMO_VOICE ?? '冰糖'

/**
 * 默认风格指令。
 *
 * 识字课的对象是中班 4–5 岁，这一段是产品决策而不是技术默认：
 * 语速放慢、吐字清晰，孩子才听得出声调；温柔亲切，才愿意跟着念。
 */
const DEFAULT_STYLE = '语速放慢，吐字清晰，温柔亲切，像幼儿园老师带小朋友认字。'

/* ------------------------------------------------------------------ */
/* 读取内容里声明过的片段                                              */
/* ------------------------------------------------------------------ */

function walk(dir) {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry)
    if (statSync(path).isDirectory())
      return walk(path)
    if (!/\.ts$/.test(path) || /\.spec\.ts$/.test(path))
      return []
    return [path]
  })
}

/**
 * 从课程文件里抽取 audioText(...) 声明。
 *
 * 用正则而不是引入 TS 解析器：这里要的是「作者写了什么字」，
 * 不是「这段代码求值后是什么」—— audioText 的参数必须全是字面量，
 * 这一点由下面的校验强制。
 */
function collectClips() {
  // audio-text.ts 自己不能扫：里面是 marker 的说明与示例，
  // 扫下去会把注释里的示例当成真内容、凭空生成一堆没人引用的音频。
  const markerPath = join(root, 'src/content/audio-text.ts')
  const files = walk(join(root, 'src/content')).filter(file => file !== markerPath)
  const clips = new Map()
  const problems = []

  for (const file of files) {
    const source = readFileSync(file, 'utf8')
    const where = relative(root, file)

    // 片段 id 常常抽成常量（一处定义、多处引用：同一份范读既挂在字卡上、
    // 又挂在连线的节点上）。脚本不做 TS 求值，所以先把
    //   const CLIP_CAO = 'nursery-literacy-autumn-words-cao'
    // 这样的字符串常量收进来，遇到 audioText(CLIP_CAO, '草。') 才知道 id 是什么。
    const constants = new Map()
    for (const m of source.matchAll(/\bconst\s+([A-Za-z_$][\w$]*)\s*=\s*'([^']*)'/g))
      constants.set(m[1], m[2])

    // 参数既可以是字面量，也可以是本文件里的字符串常量
    const asArg = raw => raw.startsWith('\'') ? raw.slice(1, -1) : constants.get(raw)

    const callPattern = /audioText\(\s*('(?:[^'\\]|\\.)*'|[A-Za-z_$][\w$]*)\s*,\s*('(?:[^'\\]|\\.)*'|[A-Za-z_$][\w$]*)\s*(?:,\s*('(?:[^'\\]|\\.)*'|[A-Za-z_$][\w$]*)\s*)?\)/g

    for (const m of source.matchAll(callPattern)) {
      const [rawId, rawText, rawStyle] = m.slice(1)
      const id = asArg(rawId)
      const text = asArg(rawText)
      const style = rawStyle === undefined ? undefined : asArg(rawStyle)

      if (id === undefined) {
        problems.push(`${where}：audioText 的第一个参数「${rawId}」不是字面量、也不是本文件里能读到的字符串常量`)
        continue
      }
      if (text === undefined) {
        problems.push(`${where}：片段「${id}」的文字不是字面量，也没在本文件里找到对应的字符串常量`)
        continue
      }
      if (style === undefined && rawStyle !== undefined) {
        problems.push(`${where}：片段「${id}」的风格指令不是字面量，也没在本文件里找到对应的字符串常量`)
        continue
      }
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) {
        problems.push(`${where}：片段 id「${id}」不是 kebab-case（它会变成文件名）`)
        continue
      }
      if (text.trim() === '') {
        problems.push(`${where}：片段「${id}」的文字是空的`)
        continue
      }

      const existing = clips.get(id)
      if (existing) {
        // 同一个 id 在两处写了不同的字：这是内容错误，必须当场拦下
        if (existing.text !== text)
          problems.push(`${where}：片段「${id}」的文字与 ${existing.where} 不一致（「${existing.text}」vs「${text}」）`)
        continue
      }

      clips.set(id, { id, text, style: style ?? DEFAULT_STYLE, where })
    }
  }

  if (problems.length > 0)
    throw new Error(`范读声明有问题：\n  ${problems.join('\n  ')}`)

  return [...clips.values()].sort((a, b) => a.id.localeCompare(b.id))
}

/* ------------------------------------------------------------------ */
/* 密钥                                                               */
/* ------------------------------------------------------------------ */

/** 读 .env.local / .env（不引 dotenv：只需要最简单的 KEY=VALUE） */
function readApiKey() {
  if (process.env.MIMO_API_KEY)
    return process.env.MIMO_API_KEY

  for (const name of ['.env.local', '.env']) {
    const path = join(root, name)
    if (!existsSync(path))
      continue
    for (const line of readFileSync(path, 'utf8').split('\n')) {
      // 不用正则：`KEY = 值` 这种切分用 indexOf 一次就能切开，
      // 也不会有回溯规则（regexp/no-super-linear-backtracking）找上门
      const at = line.indexOf('=')
      if (at < 0 || line.slice(0, at).trim() !== 'MIMO_API_KEY')
        continue
      return line.slice(at + 1).trim().replace(/^["']|["']$/g, '')
    }
  }
  return null
}

/* ------------------------------------------------------------------ */
/* 合成                                                               */
/* ------------------------------------------------------------------ */

async function synthesize({ text, style }, apiKey) {
  const response = await fetch(`${MIMO_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'api-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MIMO_MODEL,
      messages: [
        { role: 'user', content: style },
        { role: 'assistant', content: text },
      ],
      audio: { format: AUDIO_CLIP_FORMAT, voice: MIMO_VOICE },
    }),
  })

  if (!response.ok) {
    const detail = await response.text().catch(() => '')
    throw new Error(`HTTP ${response.status} ${response.statusText} ${detail.slice(0, 300)}`)
  }

  const body = await response.json()
  const base64 = body?.choices?.[0]?.message?.audio?.data
  if (typeof base64 !== 'string' || base64.length === 0)
    throw new Error(`响应里没有音频数据：${JSON.stringify(body).slice(0, 300)}`)

  return Buffer.from(base64, 'base64')
}

/* ------------------------------------------------------------------ */
/* 主流程                                                             */
/* ------------------------------------------------------------------ */

async function main() {
  const argv = new Set(process.argv.slice(2))
  const checkOnly = argv.has('--check')
  const force = argv.has('--force')

  const clips = collectClips()
  if (clips.length === 0) {
    console.log('内容里没有 audioText(...) 声明，无需生成。')
    return
  }

  const missing = clips.filter(clip => force || !existsSync(clipPath(clip.id)))
  const present = clips.length - missing.length

  console.log(`范读片段共 ${clips.length} 条：已有 ${present} 条，待生成 ${missing.length} 条。`)

  if (missing.length === 0) {
    console.log('全部就绪，无需调用 TTS。')
    return
  }

  if (checkOnly) {
    console.log('\n--check 模式，只报告不生成。待生成：')
    for (const clip of missing)
      console.log(`  ${clip.id}  ← 「${clip.text}」  (${clip.where})`)
    console.log('\n去掉 --check 即开始生成。')
    return
  }

  const apiKey = readApiKey()
  if (!apiKey) {
    console.warn(`\n没有找到 MIMO_API_KEY，跳过生成。`)
    console.warn('在根目录 .env.local 里写一行 MIMO_API_KEY=你的密钥 即可。')
    console.warn(`这 ${missing.length} 条片段暂时听不到声音，但不影响构建。`)
    return
  }

  mkdirSync(audioDir, { recursive: true })

  let done = 0
  const failures = []

  for (const clip of missing) {
    try {
      const bytes = await synthesize(clip, apiKey)
      writeFileSync(clipPath(clip.id), bytes)
      done += 1
      console.log(`  ✓ ${clip.id}  「${clip.text}」  ${(bytes.length / 1024).toFixed(1)} kB`)
    }
    catch (error) {
      failures.push(`${clip.id}: ${error.message}`)
      console.error(`  ✗ ${clip.id}  ${error.message}`)
    }
  }

  console.log(`\n生成完成：成功 ${done} 条，失败 ${failures.length} 条。`)
  console.log(`音频目录：${relative(root, audioDir)}`)

  if (failures.length > 0) {
    console.error('\n失败的片段：')
    for (const item of failures)
      console.error(`  ${item}`)
    process.exitCode = 1
  }
}

main().catch((error) => {
  console.error(error.message)
  process.exitCode = 1
})
