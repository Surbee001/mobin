/**
 * Retake the share image: `npm run og`.
 *
 * The image a shared link unfurls into is a photograph of the real card — see
 * src/app/opengraph-image.tsx for why it is a screenshot rather than something
 * drawn. This is what takes it. Run it whenever the hero design changes, or
 * the names, or the date; nothing else will notice that the picture and the
 * page have drifted apart.
 *
 * It builds the site, serves it, drives a real Chrome at it, opens the
 * envelope, and writes src/og/card-open.jpg. No dependencies: Node has had a
 * global WebSocket since 22, and Chrome speaks the DevTools protocol over one,
 * so there is no headless-browser package to install or keep up to date.
 *
 * macOS only, and knowingly — it is a one-machine authoring tool, not part of
 * the build. Point CHROME at another binary to run it elsewhere.
 */
import { spawn } from 'node:child_process'
import { mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const CHROME =
  process.env.CHROME ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const OUT = join(process.cwd(), 'src/og/card-open.jpg')

/** A port of its own, so a dev server on 3000 can stay up while this runs. */
const PORT = 3111
const DEBUG_PORT = 9333

/**
 * 1200×630 is the share frame every platform sizes for; the capture is 2× that
 * so it stays sharp where it is rendered large. `size` in the opengraph-image
 * route has to agree with what comes out here.
 */
const WIDTH = 1200
const HEIGHT = 630
const SCALE = 2
/** Visibly indistinguishable from the PNG at ~a third of its weight. */
const QUALITY = 92

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

/** Everything spawned, so a failure anywhere still tears the machinery down. */
const spawned = []
const cleanup = () => spawned.forEach((p) => p.kill())
process.on('exit', cleanup)
process.on('SIGINT', () => process.exit(1))

async function main() {
  const server = spawn('npx', ['next', 'start', '-p', String(PORT)], { stdio: 'ignore' })
  spawned.push(server)

  for (let i = 0; i < 120; i++) {
    try {
      await fetch(`http://127.0.0.1:${PORT}/`)
      break
    } catch {
      await sleep(250)
    }
  }

  const profile = await mkdtemp(join(tmpdir(), 'og-shot-'))
  const chrome = spawn(CHROME, [
    '--headless=new',
    `--remote-debugging-port=${DEBUG_PORT}`,
    `--user-data-dir=${profile}`,
    `--window-size=${WIDTH},${HEIGHT}`,
    '--hide-scrollbars',
    '--mute-audio',
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-extensions',
    'about:blank',
  ])
  chrome.stderr.on('data', () => {})
  spawned.push(chrome)

  let wsUrl = null
  for (let i = 0; i < 80 && !wsUrl; i++) {
    try {
      const targets = await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/list`).then((r) => r.json())
      wsUrl = targets.find((t) => t.type === 'page')?.webSocketDebuggerUrl ?? null
    } catch {
      /* not listening yet */
    }
    if (!wsUrl) await sleep(250)
  }
  if (!wsUrl) throw new Error('Chrome never opened a debugging port')

  const ws = new WebSocket(wsUrl)
  await new Promise((res, rej) => {
    ws.addEventListener('open', res, { once: true })
    ws.addEventListener('error', rej, { once: true })
  })

  let id = 0
  const pending = new Map()
  const seen = new Set()
  ws.addEventListener('message', (e) => {
    const msg = JSON.parse(e.data)
    if (msg.id === undefined) {
      seen.add(msg.method)
      return
    }
    const p = pending.get(msg.id)
    pending.delete(msg.id)
    if (msg.error) p.rej(new Error(msg.error.message))
    else p.res(msg.result)
  })

  const send = (method, params = {}) =>
    new Promise((res, rej) => {
      pending.set(++id, { res, rej })
      ws.send(JSON.stringify({ id, method, params }))
    })

  const evaluate = (expression, awaitPromise = false) =>
    send('Runtime.evaluate', { expression, awaitPromise, returnByValue: true }).then(
      (r) => r.result.value,
    )

  await send('Page.enable')
  await send('Runtime.enable')
  await send('Emulation.setDeviceMetricsOverride', {
    width: WIDTH,
    height: HEIGHT,
    deviceScaleFactor: SCALE,
    mobile: false,
  })

  // Reduced motion, and not out of politeness to a machine that cannot see:
  // it is what makes the frame REPRODUCIBLE. The envelope hands the card
  // straight to the hero instead of over four seconds of tweens, and the names
  // hold still in English instead of sliding to Persian and back on a loop —
  // so two runs a month apart produce the same picture rather than two frames
  // of an animation. Anything that renders differently under this query will
  // render differently here; that is the trade, and it is worth it.
  await send('Emulation.setEmulatedMedia', {
    features: [{ name: 'prefers-reduced-motion', value: 'reduce' }],
  })

  await send('Page.navigate', { url: `http://127.0.0.1:${PORT}/` })
  for (let i = 0; i < 100 && !seen.has('Page.loadEventFired'); i++) await sleep(100)

  // Nastaliq and Tobias have to be in before anything is measured — the two
  // settings of the names are scaled against each other on `fonts.ready`.
  await evaluate('document.fonts.ready.then(() => true)', true)
  await sleep(1500)

  const seal = await evaluate(`(() => {
    const el = document.querySelector('[data-seal]')
    if (!el) return false
    el.click()
    return true
  })()`)
  if (!seal) throw new Error('No wax seal on the page — nothing to open')

  await sleep(2500)

  // The furniture is not part of the invitation. The scroll cue and the music
  // toggle are controls for a page being read, and this is a still of a card.
  const hidden = await evaluate(`(() => {
    const els = document.querySelectorAll('[data-scroll-cue], [data-music-toggle]')
    els.forEach((el) => (el.style.display = 'none'))
    return els.length
  })()`)
  if (hidden < 2) console.warn(`only ${hidden} of the 2 fixed controls were found and hidden`)

  await sleep(400)

  const shot = await send('Page.captureScreenshot', {
    format: 'jpeg',
    quality: QUALITY,
    captureBeyondViewport: false,
  })
  await writeFile(OUT, Buffer.from(shot.data, 'base64'))

  console.log(`${OUT} — ${WIDTH * SCALE}×${HEIGHT * SCALE}`)
  ws.close()
}

await main()
process.exit(0)
