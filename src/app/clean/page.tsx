'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Brush eraser for the ink plates.
 *
 * Paint over a speck, it goes. Download the result.
 *
 * The plates are white ink on black, so erasing is painting black — the same
 * thing the `screen` blend already treats as nothing. Development only.
 */

const PLATES = [
  '/blessing-signature-v2.webp',
  '/blessing.webp',
  '/garden-relief-v2.webp',
  '/envelope-peonies-v2.webp',
]

export default function CleanPlate() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const painting = useRef(false)
  /** Snapshots for undo, taken at the start of each stroke. */
  const history = useRef<ImageData[]>([])

  const [src, setSrc] = useState(PLATES[0])
  const [custom, setCustom] = useState('')
  const [brush, setBrush] = useState(24)
  const [size, setSize] = useState({ w: 0, h: 0 })
  const [strokes, setStrokes] = useState(0)

  const load = useCallback((path: string) => {
    const img = new window.Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = canvasRef.current!
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      canvas.getContext('2d')!.drawImage(img, 0, 0)
      setSize({ w: img.naturalWidth, h: img.naturalHeight })
      history.current = []
      setStrokes(0)
    }
    img.src = path
  }, [])

  useEffect(() => {
    load(PLATES[0])
  }, [load])

  /**
   * Mouse position in the canvas's own pixels.
   *
   * The canvas is displayed scaled down to fit, so a click at 400px across a
   * 700px-wide element is not pixel 400 of a 900px plate. Without this the
   * brush lands somewhere near where you aimed and gets further off the
   * larger the plate is.
   */
  const at = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!
    const r = canvas.getBoundingClientRect()
    return {
      x: ((e.clientX - r.left) / r.width) * canvas.width,
      y: ((e.clientY - r.top) / r.height) * canvas.height,
    }
  }

  const dab = (x: number, y: number) => {
    const ctx = canvasRef.current!.getContext('2d')!
    ctx.fillStyle = '#000'
    ctx.beginPath()
    ctx.arc(x, y, brush / 2, 0, Math.PI * 2)
    ctx.fill()
  }

  const down = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d', { willReadFrequently: true })!
    history.current.push(ctx.getImageData(0, 0, canvas.width, canvas.height))
    if (history.current.length > 40) history.current.shift()
    setStrokes((n) => n + 1)

    painting.current = true
    canvas.setPointerCapture(e.pointerId)
    const { x, y } = at(e)
    dab(x, y)
  }

  const move = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!painting.current) return
    const { x, y } = at(e)
    dab(x, y)
  }

  const up = () => {
    painting.current = false
  }

  const undo = () => {
    const last = history.current.pop()
    if (!last) return
    canvasRef.current!.getContext('2d')!.putImageData(last, 0, 0)
    setStrokes((n) => Math.max(0, n - 1))
  }

  const download = () => {
    const a = document.createElement('a')
    a.download = src.replace(/^\//, '').replace(/\.\w+$/, '') + '-cleaned.png'
    a.href = canvasRef.current!.toDataURL('image/png')
    a.click()
  }

  if (process.env.NODE_ENV !== 'development') return null

  return (
    <div dir="ltr" className="min-h-screen bg-neutral-100 p-6 font-sans text-neutral-800">
      <div className="mx-auto max-w-5xl space-y-4">
        <div className="flex flex-wrap items-center gap-3 rounded-lg bg-white p-4 text-sm">
          <span className="font-medium">Erase</span>

          <div className="flex flex-wrap gap-1.5">
            {PLATES.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => {
                  setSrc(p)
                  load(p)
                }}
                className={`rounded border px-2 py-1 text-[11px] ${
                  src === p
                    ? 'border-neutral-800 bg-neutral-800 text-white'
                    : 'border-neutral-300 hover:bg-neutral-100'
                }`}
              >
                {p.replace('/', '')}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            <input
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              placeholder="/other.webp"
              spellCheck={false}
              className="w-40 rounded border border-neutral-300 px-2 py-1 font-mono text-[11px]"
            />
            <button
              type="button"
              onClick={() => {
                if (!custom) return
                setSrc(custom)
                load(custom)
              }}
              className="rounded border border-neutral-300 px-2 py-1 text-[11px] hover:bg-neutral-100"
            >
              load
            </button>
          </div>

          <label className="flex items-center gap-2 text-xs">
            Brush {brush}
            <input
              type="range"
              min={4}
              max={160}
              value={brush}
              onChange={(e) => setBrush(+e.target.value)}
              className="w-32"
            />
          </label>

          <button
            type="button"
            onClick={undo}
            disabled={!strokes}
            className="rounded border border-neutral-300 px-3 py-1.5 text-xs hover:bg-neutral-100 disabled:opacity-40"
          >
            Undo
          </button>

          <button
            type="button"
            onClick={() => load(src)}
            className="rounded border border-neutral-300 px-3 py-1.5 text-xs hover:bg-neutral-100"
          >
            Reset
          </button>

          <button
            type="button"
            onClick={download}
            className="ml-auto rounded bg-neutral-900 px-3 py-1.5 text-xs text-white hover:bg-neutral-700"
          >
            Download PNG
          </button>
        </div>

        <div className="rounded-lg bg-neutral-900 p-3">
          <canvas
            ref={canvasRef}
            onPointerDown={down}
            onPointerMove={move}
            onPointerUp={up}
            onPointerLeave={up}
            className="mx-auto block h-auto max-w-full cursor-crosshair touch-none"
          />
        </div>

        <p className="text-xs text-neutral-500">
          {size.w}×{size.h} · drag to paint out · black is what the page already treats as
          nothing, so anything you cover disappears from the panel
        </p>
      </div>
    </div>
  )
}
