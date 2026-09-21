import { Buffer } from 'node:buffer'
/**
 * 页面截图 / 布局体检脚本
 * ======================
 *
 * 用法：
 *   node scripts/shot.mjs <url> <宽> <高> <输出 png> [--mobile] [--full]
 *   node scripts/shot.mjs --doctor <url> <宽>
 *
 * 为什么需要它
 * -----------
 * 这个项目的界面问题（层叠、溢出、对齐）大多数肉眼一看就出来，但**看不到就只能猜**。
 * Chrome 的 `--window-size` 在 headless 下并不真正改变视口（实测最小约 500px），
 * 拿它截「手机尺寸」得到的其实是把宽页面裁掉右边 —— 会得出完全错误的结论
 * （本项目就因此误判过一次「移动端横向溢出」）。
 *
 * 所以这里走 CDP 的 Emulation.setDeviceMetricsOverride，强制真实视口宽度，
 * 顺带用 --doctor 把「谁超出了视口」量出来。
 */
import { spawn } from 'node:child_process'
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import process from 'node:process'

const args = process.argv.slice(2)
const doctor = args[0] === '--doctor'
const [url, widthArg, heightArg, outArg] = doctor ? args.slice(1) : args
const url1 = url ?? 'http://localhost:4173/'
const width = Number(widthArg ?? 390)
const height = Number(heightArg ?? 900)
const mobile = args.includes('--mobile')
const fullPage = args.includes('--full')

const PORT = 9333 + Math.floor(Math.random() * 400)
const profile = mkdtempSync(join(tmpdir(), 'dsh-shot-'))

const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
  '--headless=new',
  '--disable-gpu',
  '--no-sandbox',
  '--disable-breakpad',
  '--disable-crash-reporter',
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${profile}`,
  '--no-first-run',
  '--no-default-browser-check',
  '--hide-scrollbars',
  'about:blank',
], { stdio: 'ignore' })

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

async function targetUrl() {
  for (let i = 0; i < 60; i++) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json()
      const page = list.find(entry => entry.type === 'page')
      if (page)
        return page.webSocketDebuggerUrl
    }
    catch {}
    await sleep(200)
  }
  throw new Error('连不上 Chrome 调试端口')
}

const ws = new WebSocket(await targetUrl())
await new Promise(resolve => ws.addEventListener('open', resolve, { once: true }))

let nextId = 0
const pending = new Map()
ws.addEventListener('message', (event) => {
  const message = JSON.parse(event.data)
  if (message.id && pending.has(message.id)) {
    pending.get(message.id)(message)
    pending.delete(message.id)
  }
})

function send(method, params = {}) {
  const id = ++nextId
  ws.send(JSON.stringify({ id, method, params }))
  return new Promise(resolve => pending.set(id, resolve))
}

async function evaluate(expression) {
  const res = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })
  return res.result?.result?.value
}

await send('Page.enable')

// 关键：强制真实视口
await send('Emulation.setDeviceMetricsOverride', {
  width,
  height,
  deviceScaleFactor: 2,
  mobile,
})

await send('Page.navigate', { url: url1 })
await sleep(2600)

if (doctor) {
  const report = await evaluate(`(() => {
    const vw = document.documentElement.clientWidth
    const offenders = []
    for (const el of document.querySelectorAll('*')) {
      const r = el.getBoundingClientRect()
      if (r.width === 0 && r.height === 0) continue
      if (r.right > vw + 1 || r.left < -1) {
        offenders.push({
          tag: el.tagName.toLowerCase(),
          cls: String(el.className || '').slice(0, 120),
          left: Math.round(r.left), right: Math.round(r.right),
          text: (el.textContent || '').trim().slice(0, 24),
        })
      }
    }
    return { viewport: vw, scrollWidth: document.documentElement.scrollWidth, offenders: offenders.slice(0, 12), count: offenders.length }
  })()`)
  console.log(JSON.stringify(report, null, 2))
}
else {
  const shot = await send('Page.captureScreenshot', {
    format: 'png',
    captureBeyondViewport: fullPage,
  })
  const out = outArg ?? '/tmp/dsh-shots/shot.png'
  mkdirSync(dirname(out), { recursive: true })
  writeFileSync(out, Buffer.from(shot.result.data, 'base64'))
  const size = await evaluate('document.documentElement.scrollWidth + "x" + document.documentElement.scrollHeight')
  console.log(`✓ ${out}  视口 ${width}  ·  页面 ${size}`)
}

ws.close()
chrome.kill()
