'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * A pattern editor for the envelope.
 *
 * Load a sheet of pattern, draw round the piece of it you want, and choose
 * which face of the envelope it lands on. Drag to trace freehand, or click
 * point to point for straight edges; both build the same closed shape. The
 * envelope behind the panel repaints as you go, so what you are looking at is
 * the real thing rather than a mock-up of it.
 *
 * When it looks right, Copy puts the whole arrangement on the clipboard as
 * text — a config block and the CSS it comes to — to hand back for building in
 * properly. Nothing here writes to the source; it is a place to decide, not a
 * place the design lives.
 *
 * It paints by appending one overlay element into each face rather than by
 * rendering into Opening's tree. Opening's DOM is moved about by hand — Flip
 * lifts the card out of it mid-flight — and a second component rendering into
 * the same nodes is the kind of thing that works until the day it does not.
 *
 * Development only. This must never reach a guest.
 */

type Face = { key: string; label: string; selector: string; note?: string }

/** The four surfaces of the sealed envelope, front to back. */
const FACES: Face[] = [
  { key: 'flapOut', label: 'Flap, outside', selector: '[data-flap-out]' },
  { key: 'front', label: 'Front pocket', selector: '[data-front]' },
  { key: 'flapIn', label: 'Flap, lining', selector: '[data-flap-in]', note: 'seen once it opens' },
  { key: 'back', label: 'Back panel', selector: '[data-back]', note: 'behind the card' },
]

const BLENDS = [
  'normal',
  'multiply',
  'screen',
  'overlay',
  'darken',
  'lighten',
  'color-burn',
  'color-dodge',
  'soft-light',
  'hard-light',
  'luminosity',
] as const

/** A point in the pattern sheet, 0–1 across and down it. */
type Point = { x: number; y: number }

type Piece = {
  points: Point[]
  blend: string
  opacity: number
  /** Cut the piece to the drawn outline, or just take its bounding box. */
  clip: boolean
  /** Repeat it across the face instead of stretching it to fit. */
  tile: boolean
  /** Percent of the face one repeat covers. Only read when tiling. */
  repeat: number
  /** Where it sits on the face, as a percentage of the face, from where the
   *  trace put it. Drag it about on the envelope, or use the sliders. */
  x: number
  y: number
  /** How big, and which way up. */
  size: number
  rotate: number
}

const EMPTY: Piece = {
  points: [],
  blend: 'multiply',
  opacity: 1,
  clip: true,
  tile: false,
  repeat: 100,
  x: 0,
  y: 0,
  size: 1,
  rotate: 0,
}

/** Everything except the trace itself — what Reset placement puts back. */
const PLACEMENT = { x: 0, y: 0, size: 1, rotate: 0 } as const

/** The drawn outline's bounding box, in the same 0–1 as the points. */
function boxOf(points: Point[]) {
  const xs = points.map((p) => p.x)
  const ys = points.map((p) => p.y)
  const x = Math.min(...xs)
  const y = Math.min(...ys)
  return { x, y, w: Math.max(...xs) - x, h: Math.max(...ys) - y }
}

/** Two decimals is finer than a pixel here, and reads as something a person
 *  could have typed rather than a float that escaped. */
const round = (n: number) => +n.toFixed(2)

/**
 * The CSS one piece comes to.
 *
 * `background-size` is the reciprocal of the box: to show a third of the sheet
 * across the whole face, the sheet has to be three times the face. And a
 * percentage `background-position` is a proportion of the LEFTOVER, not of the
 * element — which is why the offset is divided by what is left over rather
 * than used directly. Both fall back to the middle when there is nothing left
 * over to divide by.
 */
function cssFor(piece: Piece, src: string): Record<string, string> | null {
  if (piece.points.length < 3) return null
  const b = boxOf(piece.points)
  if (b.w <= 0 || b.h <= 0) return null

  const zoom = piece.tile ? piece.repeat / 100 : 1
  const style: Record<string, string> = {
    'background-image': `url('${src}')`,
    'background-size': `${round((100 / b.w) * zoom)}% ${round((100 / b.h) * zoom)}%`,
    'background-position': `${round(b.w < 1 ? (b.x / (1 - b.w)) * 100 : 50)}% ${round(
      b.h < 1 ? (b.y / (1 - b.h)) * 100 : 50,
    )}%`,
    'background-repeat': piece.tile ? 'repeat' : 'no-repeat',
    'mix-blend-mode': piece.blend,
    opacity: String(piece.opacity),
  }

  // Moving the whole layer rather than the background inside it, so the
  // outline goes with the pattern it was cut for — a background-position nudge
  // would slide the picture out from under its own clip. The face's own clip
  // still holds, so a piece pushed past the edge is trimmed by the envelope
  // rather than escaping it.
  const move = [
    piece.x || piece.y ? `translate(${round(piece.x)}%, ${round(piece.y)}%)` : '',
    piece.rotate ? `rotate(${round(piece.rotate)}deg)` : '',
    piece.size !== 1 ? `scale(${round(piece.size)})` : '',
  ]
    .filter(Boolean)
    .join(' ')
  if (move) style.transform = move

  if (piece.clip) {
    // The outline again, this time as a proportion of its own box — so the
    // shape drawn on the sheet is the shape that appears on the face.
    style['clip-path'] = `polygon(${piece.points
      .map((p) => `${(((p.x - b.x) / b.w) * 100).toFixed(2)}% ${(((p.y - b.y) / b.h) * 100).toFixed(2)}%`)
      .join(', ')})`
  }
  return style
}

export function EnvelopeEditor() {
  const [open, setOpen] = useState(false)
  const [src, setSrc] = useState('')
  /** What the copied config should call the file. The preview runs off a blob
   *  URL, which means nothing outside this browser tab. */
  const [path, setPath] = useState('/pattern.webp')
  const [face, setFace] = useState(FACES[0].key)
  const [pieces, setPieces] = useState<Record<string, Piece>>({})
  const [copied, setCopied] = useState(false)

  const sheet = useRef<HTMLDivElement>(null)
  const drawing = useRef(false)
  /** The live pieces, for the drag handlers — they are bound once and would
   *  otherwise close over whatever the state was at the time. Written in an
   *  effect, not during render: a ref set while rendering is a value React is
   *  entitled to have already read. */
  const latest = useRef(pieces)
  useEffect(() => {
    latest.current = pieces
  }, [pieces])

  const piece = pieces[face] ?? EMPTY
  const edit = (patch: Partial<Piece>) =>
    setPieces((all) => ({ ...all, [face]: { ...(all[face] ?? EMPTY), ...patch } }))

  // ── Paint every face, and clean up after itself ─────────────────
  useEffect(() => {
    const made: HTMLElement[] = []

    for (const f of FACES) {
      const host = document.querySelector<HTMLElement>(f.selector)
      if (!host) continue

      let layer = host.querySelector<HTMLElement>(':scope > [data-pattern]')
      const style = src ? cssFor(pieces[f.key] ?? EMPTY, src) : null

      if (!style) {
        layer?.remove()
        continue
      }
      if (!layer) {
        layer = document.createElement('div')
        layer.dataset.pattern = f.key
        layer.style.position = 'absolute'
        layer.style.inset = '0'
        layer.style.pointerEvents = 'none'
        host.appendChild(layer)
      }
      made.push(layer)
      // Wipe first: a property dropped from the new set has to go, not linger.
      layer.style.cssText = 'position:absolute;inset:0;pointer-events:none;'
      for (const [k, v] of Object.entries(style)) layer.style.setProperty(k, v)
    }

    return () => {
      for (const layer of made) layer.remove()
    }
  }, [pieces, src])

  // ── Dragging a piece about on the envelope itself ───────────────
  //
  // Bound to the faces rather than to an overlay of our own, because the
  // overlays are `pointer-events: none` — they have to be, or they would take
  // the click meant for the seal. The faces underneath are plain divs that
  // nothing else listens to, so this is the one place a drag can start.
  useEffect(() => {
    if (!open || !src) return
    const undo: (() => void)[] = []

    for (const f of FACES) {
      const host = document.querySelector<HTMLElement>(f.selector)
      if (!host) continue

      const down = (e: PointerEvent) => {
        const piece = latest.current[f.key]
        if (!piece || piece.points.length < 3) return
        e.preventDefault()
        setFace(f.key)

        const box = host.getBoundingClientRect()
        const from = { x: e.clientX, y: e.clientY, px: piece.x, py: piece.y }

        const move = (m: PointerEvent) => {
          setPieces((all) => ({
            ...all,
            [f.key]: {
              ...all[f.key],
              // Percent of the FACE, which is what the transform is in — so a
              // drag of half its width moves it half its width, whatever size
              // the envelope happens to be on screen.
              x: round(from.px + ((m.clientX - from.x) / box.width) * 100),
              y: round(from.py + ((m.clientY - from.y) / box.height) * 100),
            },
          }))
        }
        const up = () => {
          window.removeEventListener('pointermove', move)
          window.removeEventListener('pointerup', up)
        }
        window.addEventListener('pointermove', move)
        window.addEventListener('pointerup', up)
      }

      host.addEventListener('pointerdown', down)
      host.style.cursor = 'move'
      undo.push(() => {
        host.removeEventListener('pointerdown', down)
        host.style.removeProperty('cursor')
      })
    }

    return () => {
      for (const off of undo) off()
    }
  }, [open, src])

  // ── Drawing ─────────────────────────────────────────────────────
  const at = (e: React.PointerEvent): Point => {
    const r = sheet.current!.getBoundingClientRect()
    return {
      x: Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)),
      y: Math.min(1, Math.max(0, (e.clientY - r.top) / r.height)),
    }
  }

  const down = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    drawing.current = true
    edit({ points: [...piece.points, at(e)] })
  }

  const move = (e: React.PointerEvent) => {
    if (!drawing.current) return
    const p = at(e)
    const last = piece.points[piece.points.length - 1]
    // Only keep a point once the pointer has actually travelled — otherwise a
    // single drag lands hundreds of them on top of each other and the polygon
    // that comes out is unreadable.
    if (last && Math.hypot(p.x - last.x, p.y - last.y) < 0.015) return
    edit({ points: [...piece.points, p] })
  }

  const up = () => {
    drawing.current = false
  }

  const asText = () => {
    const used = FACES.filter((f) => (pieces[f.key]?.points.length ?? 0) >= 3)
    const config = used.map((f) => {
      const p = pieces[f.key]
      const b = boxOf(p.points)
      return {
        face: f.key,
        selector: f.selector,
        blend: p.blend,
        opacity: p.opacity,
        clip: p.clip,
        tile: p.tile,
        repeat: p.repeat,
        x: p.x,
        y: p.y,
        size: p.size,
        rotate: p.rotate,
        box: { x: +b.x.toFixed(4), y: +b.y.toFixed(4), w: +b.w.toFixed(4), h: +b.h.toFixed(4) },
        points: p.points.map((q) => [+q.x.toFixed(4), +q.y.toFixed(4)]),
      }
    })

    const css = used
      .map((f) => {
        const style = cssFor(pieces[f.key], path)!
        const body = Object.entries(style)
          .map(([k, v]) => `  ${k}: ${v};`)
          .join('\n')
        return `/* ${f.label} — ${f.selector} */\n${f.selector} > [data-pattern] {\n  position: absolute;\n  inset: 0;\n  pointer-events: none;\n${body}\n}`
      })
      .join('\n\n')

    return [
      `Envelope pattern — ${used.length} of ${FACES.length} faces.`,
      `Pattern sheet: ${path}  (put the file in public/ under this name)`,
      '',
      'CONFIG',
      JSON.stringify(config, null, 2),
      '',
      'CSS',
      css,
    ].join('\n')
  }

  const copy = async () => {
    await navigator.clipboard.writeText(asText())
    setCopied(true)
    setTimeout(() => setCopied(false), 1600)
  }

  if (process.env.NODE_ENV !== 'development') return null

  const drawn = FACES.filter((f) => (pieces[f.key]?.points.length ?? 0) >= 3).length

  return (
    <div
      dir="ltr"
      // Above the Colours button, which sits at bottom-4. Bottom-RIGHT because
      // Next's dev-tools indicator is bottom-left and swallows clicks.
      className="fixed bottom-16 right-4 z-[100] flex flex-col items-end font-sans"
    >
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-md bg-neutral-900/85 px-3 py-2 text-xs text-white shadow-lg backdrop-blur hover:bg-neutral-900"
        >
          Envelope{drawn > 0 && ` · ${drawn}`}
        </button>
      )}

      {open && (
        <div className="flex max-h-[85vh] w-[330px] flex-col rounded-lg bg-white text-neutral-800 shadow-2xl ring-1 ring-black/10">
          <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3">
            <span className="text-sm font-medium">Envelope pattern</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded border border-neutral-300 px-2 py-1 text-[11px] hover:bg-neutral-100"
            >
              Close
            </button>
          </div>

          {/* Lenis takes over the wheel for the whole document, so a panel that
              scrolls on its own has to say so. Without this the page behind
              moves and the list under the pointer does not. */}
          <div data-lenis-prevent className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-3">
            {/* ── The sheet ─────────────────────────────────────── */}
            <div className="space-y-2">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  setSrc(URL.createObjectURL(file))
                  setPath('/' + file.name)
                }}
                className="w-full text-[11px] file:mr-2 file:rounded file:border file:border-neutral-300 file:bg-neutral-50 file:px-2 file:py-1 file:text-[11px]"
              />
              <label className="block">
                <span className="text-[10px] uppercase tracking-wider text-neutral-500">
                  Name in public/
                </span>
                <input
                  value={path}
                  onChange={(e) => setPath(e.target.value)}
                  className="mt-1 w-full rounded border border-neutral-300 px-2 py-1 text-[11px]"
                />
              </label>
            </div>

            {/* ── Which face ────────────────────────────────────── */}
            <div className="grid grid-cols-2 gap-1.5">
              {FACES.map((f) => {
                const n = pieces[f.key]?.points.length ?? 0
                return (
                  <button
                    key={f.key}
                    type="button"
                    onClick={() => setFace(f.key)}
                    title={f.note}
                    className={`rounded border px-2 py-1.5 text-left text-[11px] leading-tight ${
                      face === f.key
                        ? 'border-neutral-800 bg-neutral-800 text-white'
                        : 'border-neutral-300 hover:bg-neutral-100'
                    }`}
                  >
                    {f.label}
                    {n >= 3 && <span className="opacity-60"> ·{n}</span>}
                  </button>
                )
              })}
            </div>

            {/* ── Drawing on the sheet ──────────────────────────── */}
            {src ? (
              <div className="space-y-2">
                <div
                  ref={sheet}
                  onPointerDown={down}
                  onPointerMove={move}
                  onPointerUp={up}
                  className="relative w-full cursor-crosshair touch-none select-none overflow-hidden rounded border border-neutral-300 bg-[repeating-conic-gradient(#f4f4f4_0_25%,#fff_0_50%)] bg-[length:16px_16px]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" draggable={false} className="block w-full select-none" />
                  <svg
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                    className="pointer-events-none absolute inset-0 h-full w-full"
                  >
                    {piece.points.length > 1 && (
                      <polygon
                        points={piece.points.map((p) => `${p.x * 100},${p.y * 100}`).join(' ')}
                        fill="rgba(37,99,235,0.22)"
                        stroke="#2563eb"
                        strokeWidth="0.4"
                        vectorEffect="non-scaling-stroke"
                      />
                    )}
                    {piece.points.map((p, i) => (
                      <circle key={i} cx={p.x * 100} cy={p.y * 100} r="0.7" fill="#2563eb" />
                    ))}
                  </svg>
                </div>
                <p className="text-[10px] leading-snug text-neutral-500">
                  Drag to trace, or click point to point. Three points make a shape.
                </p>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => edit({ points: piece.points.slice(0, -1) })}
                    disabled={piece.points.length === 0}
                    className="flex-1 rounded border border-neutral-300 px-2 py-1 text-[11px] hover:bg-neutral-100 disabled:opacity-35"
                  >
                    Undo point
                  </button>
                  <button
                    type="button"
                    onClick={() => edit({ points: [] })}
                    disabled={piece.points.length === 0}
                    className="flex-1 rounded border border-neutral-300 px-2 py-1 text-[11px] hover:bg-neutral-100 disabled:opacity-35"
                  >
                    Clear face
                  </button>
                </div>
              </div>
            ) : (
              <p className="rounded border border-dashed border-neutral-300 px-3 py-6 text-center text-[11px] text-neutral-500">
                Choose a pattern sheet to draw on.
              </p>
            )}

            {/* ── How it sits ───────────────────────────────────── */}
            <div className="space-y-2 border-t border-neutral-200 pt-3">
              <label className="flex items-center justify-between gap-2">
                <span className="text-[11px]">Blend</span>
                <select
                  value={piece.blend}
                  onChange={(e) => edit({ blend: e.target.value })}
                  className="rounded border border-neutral-300 px-1.5 py-1 text-[11px]"
                >
                  {BLENDS.map((b) => (
                    <option key={b}>{b}</option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-[11px]">Opacity · {piece.opacity.toFixed(2)}</span>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={piece.opacity}
                  onChange={(e) => edit({ opacity: Number(e.target.value) })}
                  className="mt-1 w-full"
                />
              </label>

              <label className="flex items-center gap-2 text-[11px]">
                <input
                  type="checkbox"
                  checked={piece.clip}
                  onChange={(e) => edit({ clip: e.target.checked })}
                />
                Cut to the drawn outline
              </label>

              <label className="flex items-center gap-2 text-[11px]">
                <input
                  type="checkbox"
                  checked={piece.tile}
                  onChange={(e) => edit({ tile: e.target.checked })}
                />
                Repeat across the face
              </label>

              {piece.tile && (
                <label className="block">
                  <span className="text-[11px]">Repeat size · {piece.repeat}%</span>
                  <input
                    type="range"
                    min={5}
                    max={100}
                    step={1}
                    value={piece.repeat}
                    onChange={(e) => edit({ repeat: Number(e.target.value) })}
                    className="mt-1 w-full"
                  />
                </label>
              )}
            </div>

            {/* ── Where it sits ─────────────────────────────────── */}
            <div className="space-y-2 border-t border-neutral-200 pt-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-wider text-neutral-500">
                  Placement
                </span>
                <button
                  type="button"
                  onClick={() => edit(PLACEMENT)}
                  className="rounded border border-neutral-300 px-2 py-0.5 text-[10px] hover:bg-neutral-100"
                >
                  Reset
                </button>
              </div>
              <p className="text-[10px] leading-snug text-neutral-500">
                Or drag the piece around on the envelope itself.
              </p>

              {(
                [
                  ['x', 'Across', -100, 100, 0.5, '%'],
                  ['y', 'Down', -100, 100, 0.5, '%'],
                  ['size', 'Size', 0.1, 3, 0.01, '\u00d7'],
                  ['rotate', 'Turn', -180, 180, 1, '\u00b0'],
                ] as const
              ).map(([key, label, min, max, step, unit]) => (
                <label key={key} className="block">
                  <span className="text-[11px]">
                    {label} · {piece[key]}
                    {unit}
                  </span>
                  <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={piece[key]}
                    onChange={(e) => edit({ [key]: Number(e.target.value) })}
                    className="mt-1 w-full"
                  />
                </label>
              ))}
            </div>
          </div>

          <div className="border-t border-neutral-200 px-4 py-3">
            <button
              type="button"
              onClick={copy}
              disabled={drawn === 0}
              className="w-full rounded bg-neutral-900 px-3 py-2 text-xs text-white hover:bg-neutral-800 disabled:opacity-35"
            >
              {copied ? 'Copied' : `Copy ${drawn} face${drawn === 1 ? '' : 's'}`}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
