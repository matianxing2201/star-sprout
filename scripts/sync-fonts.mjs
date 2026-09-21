/**
 * 字体自托管同步脚本
 *
 * 背景：index.html 原先直接引 fonts.googleapis.com / fonts.gstatic.com，
 * 这两个域名在国内无法访问，会让首屏一直卡在字体请求上。改为把字体文件随构建产物一起发布。
 *
 * 产物（提交进仓库，由 Vite 打包并加 hash）：
 *   src/assets/fonts/baloo2-{500,700,800}-latin.woff2  数字/拉丁展示字体，Google 的 latin 子集已足够小
 *   src/assets/fonts/zcool-kuaile-subset.woff2         中文标题字体，按源码里实际出现的字符裁剪
 *
 * 两个刻意的取舍：
 *   1. 中文标题字体（ZCOOL KuaiLe）全量 6763 字、约 4MB，而本项目标题只用到源码里出现的那 1200 多个字，
 *      所以用 pyftsubset 裁剪，产物降到百 KB 级。**新增文案后要重跑本脚本**，否则新字会回落到系统字体。
 *   2. 中文正文字体不下载（Noto Sans SC 全量 10MB+），交给系统字体渲染：
 *      PingFang SC（macOS/iOS）/ Microsoft YaHei（Windows），观感差异很小。
 *
 * 依赖：python3 + fonttools + brotli（仅本机生成时用，构建和 CI 不需要）
 *   pip3 install fonttools brotli
 *
 * 用法：pnpm fonts:sync
 */
import { execFile } from 'node:child_process'
import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, extname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'

const run = promisify(execFile)
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const OUT_DIR = join(ROOT, 'src/assets/fonts')
const SRC_DIR = join(ROOT, 'src')

/** 用现代 UA 请求，Google 才会返回 woff2 而不是 ttf */
const MODERN_UA
  = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

const BALOO_WEIGHTS = [500, 700, 800]
/** ZCOOL KuaiLe 全量源字体。jsDelivr 有国内 CDN，优先；GitHub 直连容易超时，作为兜底 */
const ZCOOL_TTF_URLS = [
  'https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/zcoolkuaile/ZCOOLKuaiLe-Regular.ttf',
  'https://raw.githubusercontent.com/google/fonts/main/ofl/zcoolkuaile/ZCOOLKuaiLe-Regular.ttf',
]

/** 除源码字符外额外兜底的字形：ASCII、常用中英文标点，避免标点被裁掉后回落到系统字体 */
const BASELINE = ' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~'
  + '·—…‘’“”《》〈〉「」『』【】、。，！？：；（）％＋－×÷＝±°'

/** 源码里需要渲染的字符范围 */
const KEEP_RE = /[\u0020-\u007e\u00b7\u2010-\u2014\u2018-\u201d\u2026\u3000-\u303f\u4e00-\u9fff\uff00-\uffef]/

async function walk(dir) {
  const out = []
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory())
      out.push(...await walk(full))
    else if (['.vue', '.ts', '.css', '.html'].includes(extname(entry.name)))
      out.push(full)
  }
  return out
}

/** 收集源码里出现过的所有可渲染字符 */
async function collectChars() {
  const files = [...await walk(SRC_DIR), join(ROOT, 'index.html')]
  const chars = new Set(BASELINE)
  for (const file of files) {
    const text = await readFile(file, 'utf8')
    for (const ch of text) {
      if (KEEP_RE.test(ch))
        chars.add(ch)
    }
  }
  return [...chars].sort().join('')
}

/** 从 Google Fonts 的 CSS 里取出某个字族的 latin 子集 woff2 地址 */
async function latinWoff2Url(family, weight) {
  const url = `https://fonts.googleapis.com/css2?family=${family}:wght@${weight}&display=swap`
  const css = await (await fetch(url, { headers: { 'user-agent': MODERN_UA } })).text()
  // CSS 按 unicode-range 分段，每段前置 /* latin */ 之类的注释，取 latin 段
  const blocks = css.split('/*').map(part => part.slice(part.indexOf('*/') + 2))
  const latin = blocks.findLast(block => block.includes('@font-face') && /url\((.+?)\)/.test(block))
  const match = latin?.match(/url\((.+?)\)/)
  if (!match)
    throw new Error(`未能从 Google Fonts CSS 解析 family=${family} weight=${weight} 的 woff2 地址`)
  return match[1]
}

/** 依次尝试多个镜像下载，任一成功即返回 */
async function download(urls, dest, label) {
  const errors = []
  for (const url of urls) {
    try {
      const res = await fetch(url, { headers: { 'user-agent': MODERN_UA }, signal: AbortSignal.timeout(30_000) })
      if (!res.ok)
        throw new Error(`HTTP ${res.status}`)
      const buf = Buffer.from(await res.arrayBuffer())
      await writeFile(dest, buf)
      return buf.length
    }
    catch (error) {
      errors.push(`${url} → ${error.message}`)
    }
  }
  throw new Error(`下载${label}失败：\n  ${errors.join('\n  ')}`)
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true })
  const tmp = await mkdtemp(join(tmpdir(), 'star-sprout-fonts-'))

  try {
    // 1. 数字/拉丁展示字体：Google 的 latin 子集本身就只有几十 KB，直接下载
    for (const weight of BALOO_WEIGHTS) {
      const file = join(OUT_DIR, `baloo2-${weight}-latin.woff2`)
      const size = await download([await latinWoff2Url('Baloo+2', weight)], file, `Baloo 2 ${weight}`)
      console.log(`✔ baloo2-${weight}-latin.woff2  ${(size / 1024).toFixed(1)} KB`)
    }

    // 2. 中文标题字体：下载全量 TTF 后按源码字符裁剪
    const ttf = join(tmp, 'zcool-kuaile.ttf')
    await download(ZCOOL_TTF_URLS, ttf, 'ZCOOL KuaiLe 源字体')

    const charsFile = join(tmp, 'chars.txt')
    const chars = await collectChars()
    await writeFile(charsFile, chars)

    const subset = join(OUT_DIR, 'zcool-kuaile-subset.woff2')
    try {
      await run('pyftsubset', [
        ttf,
        `--text-file=${charsFile}`,
        '--flavor=woff2',
        '--layout-features=*',
        `--output-file=${subset}`,
      ])
    }
    catch (error) {
      if (error.code === 'ENOENT')
        throw new Error('未找到 pyftsubset，请先执行：pip3 install fonttools brotli')
      throw error
    }

    const subsetSize = (await readFile(subset)).length
    console.log(`✔ zcool-kuaile-subset.woff2  ${(subsetSize / 1024).toFixed(1)} KB（覆盖 ${chars.length} 个字符）`)
  }
  finally {
    await rm(tmp, { recursive: true, force: true })
  }
}

await main()
