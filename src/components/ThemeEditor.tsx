'use client'

import { useState } from 'react'

/**
 * A live colour editor for the page.
 *
 * Every swatch writes straight onto `document.documentElement` as a CSS
 * custom property, so the page repaints as you drag. That only works because
 * the colour half of the theme is declared WITHOUT `inline` — see the note at
 * the top of globals.css. If a colour ever stops responding here, that is the
 * first thing to check.
 *
 * Development only. This must never reach a guest.
 */

type Swatch = { token: string; label: string; note?: string }
type Group = { title: string; note?: string; swatches: Swatch[] }

const GROUPS: Group[] = [
  {
    title: 'Page',
    swatches: [
      { token: '--color-paper', label: 'Background' },
      { token: '--color-paper-warm', label: 'Card paper', note: 'sits under the texture' },
      { token: '--color-ink', label: 'Text' },
      { token: '--color-ink-soft', label: 'Secondary text' },
      { token: '--color-accent', label: 'Rules & marks' },
    ],
  },
  {
    title: 'Verse panel',
    note: 'Text colours are baked into the scroll tween — reload to see them.',
    swatches: [
      { token: '--color-panel-verse', label: 'Background' },
      { token: '--color-verse-ink', label: 'Text, revealed' },
      { token: '--color-verse-dim', label: 'Text, before' },
    ],
  },
  {
    title: 'Couplet panel',
    swatches: [
      { token: '--color-panel-poem', label: 'Background' },
      { token: '--color-poem-ink', label: 'Text' },
    ],
  },
  {
    title: 'Invitation panel',
    note: 'Text colours are baked into the scroll tween — reload to see them.',
    swatches: [
      { token: '--color-panel-letter', label: 'Background' },
      { token: '--color-letter-ink', label: 'Text, revealed' },
      { token: '--color-letter-dim', label: 'Text, before' },
    ],
  },
  {
    title: 'Monogram card',
    swatches: [
      { token: '--color-mono-ground', label: 'Card' },
      { token: '--color-mono-ink', label: 'Ink' },
    ],
  },
  {
    title: 'Envelope',
    swatches: [
      { token: '--color-blush', label: 'Back panel' },
      { token: '--color-blush-mid', label: 'Flap' },
      { token: '--color-blush-deep', label: 'Front pocket' },
    ],
  },
  {
    title: 'Buttons',
    swatches: [
      { token: '--color-olive', label: 'Fill' },
      { token: '--color-olive-deep', label: 'Fill, hover' },
      { token: '--color-cream', label: 'Label' },
    ],
  },
  {
    title: 'Palette',
    note: 'The source colours. Not used directly unless something above points at them.',
    swatches: [
      { token: '--color-chartreuse', label: 'Chartreuse' },
      { token: '--color-chartreuse-deep', label: 'Chartreuse, deep' },
      { token: '--color-tan', label: 'Tan' },
    ],
  },
]

const ALL = GROUPS.flatMap((g) => g.swatches.map((s) => s.token))

/** Normalise whatever the stylesheet holds into `#rrggbb` for the picker. */
function toHex(raw: string): string {
  const v = raw.trim()
  if (/^#[0-9a-f]{6}$/i.test(v)) return v.toLowerCase()
  if (/^#[0-9a-f]{3}$/i.test(v)) {
    return '#' + v.slice(1).split('').map((c) => c + c).join('').toLowerCase()
  }
  const m = v.match(/rgba?\(([^)]+)\)/)
  if (m) {
    const [r, g, b] = m[1].split(/[\s,/]+/).map(Number)
    return '#' + [r, g, b].map((n) => (n || 0).toString(16).padStart(2, '0')).join('')
  }
  return '#000000'
}

export function ThemeEditor() {
  const [open, setOpen] = useState(false)
  const [colors, setColors] = useState<Record<string, string>>({})
  const [base, setBase] = useState<Record<string, string>>({})
  const [copied, setCopied] = useState(false)

  /**
   * Read the stylesheet's own values on first open, so the panel shows what
   * the page actually is rather than a second copy of the list that can
   * drift. Done here rather than in an effect because it is a DOM read that
   * nothing needs until the panel is looked at — and because reopening must
   * not wipe edits already made.
   */
  const openPanel = () => {
    if (Object.keys(base).length === 0) {
      const cs = getComputedStyle(document.documentElement)
      const read = Object.fromEntries(ALL.map((t) => [t, toHex(cs.getPropertyValue(t))]))
      setBase(read)
      setColors(read)
    }
    setOpen(true)
  }

  const set = (token: string, value: string) => {
    document.documentElement.style.setProperty(token, value)
    setColors((c) => ({ ...c, [token]: value }))
  }

  const reset = () => {
    for (const token of ALL) document.documentElement.style.removeProperty(token)
    setColors(base)
  }

  const changed = ALL.filter((t) => colors[t] && colors[t] !== base[t])

  /** A block ready to paste over the colours in globals.css. */
  const asCss = () =>
    GROUPS.map((g) => {
      const lines = g.swatches
        .map((s) => `  ${s.token}: ${colors[s.token]};`)
        .join('\n')
      return `  /* ${g.title} */\n${lines}`
    }).join('\n\n')

  const copy = async () => {
    await navigator.clipboard.writeText(asCss())
    setCopied(true)
    setTimeout(() => setCopied(false), 1600)
  }

  if (process.env.NODE_ENV !== 'development') return null

  return (
    <div dir="ltr" // Bottom-RIGHT on purpose: Next's dev-tools indicator lives bottom-left
      // and its portal swallows clicks aimed at anything underneath it.
      className="fixed bottom-4 right-4 z-[100] flex flex-col items-end font-sans">
      {!open && (
        <button
          type="button"
          onClick={openPanel}
          className="rounded-md bg-neutral-900/85 px-3 py-2 text-xs text-white shadow-lg backdrop-blur hover:bg-neutral-900"
        >
          Colours{changed.length > 0 && ` · ${changed.length}`}
        </button>
      )}

      {open && (
        <div className="flex max-h-[85vh] w-[300px] flex-col rounded-lg bg-white text-neutral-800 shadow-2xl ring-1 ring-black/10">
          <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3">
            <span className="text-sm font-medium">Colours</span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={reset}
                disabled={changed.length === 0}
                className="rounded border border-neutral-300 px-2 py-1 text-[11px] hover:bg-neutral-100 disabled:opacity-35"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded border border-neutral-300 px-2 py-1 text-[11px] hover:bg-neutral-100"
              >
                Close
              </button>
            </div>
          </div>

          {/* `min-h-0` is load-bearing. A flex item defaults to `min-height: auto`,
              which refuses to shrink below its content — so `overflow-y-auto`
              here has nothing to overflow and the list just pushes the panel
              past its own max-height instead of scrolling. */}
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
            {GROUPS.map((group) => (
              <div key={group.title} className="mb-5 last:mb-0">
                <div className="mb-2">
                  <span className="text-[11px] font-medium uppercase tracking-wider text-neutral-500">
                    {group.title}
                  </span>
                  {group.note && (
                    <p className="mt-0.5 text-[10px] leading-snug text-neutral-400">
                      {group.note}
                    </p>
                  )}
                </div>

                {group.swatches.map((s) => (
                  <div key={s.token} className="mb-1.5 flex items-center gap-2">
                    <input
                      type="color"
                      value={colors[s.token] ?? '#000000'}
                      onChange={(e) => set(s.token, e.target.value)}
                      className="h-7 w-9 shrink-0 cursor-pointer rounded border border-neutral-300 bg-white"
                      aria-label={s.label}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[12px] leading-tight">{s.label}</div>
                      {s.note && (
                        <div className="truncate text-[10px] text-neutral-400">{s.note}</div>
                      )}
                    </div>
                    <input
                      type="text"
                      value={colors[s.token] ?? ''}
                      onChange={(e) => {
                        const v = e.target.value
                        setColors((c) => ({ ...c, [s.token]: v }))
                        if (/^#[0-9a-f]{6}$/i.test(v)) {
                          document.documentElement.style.setProperty(s.token, v)
                        }
                      }}
                      spellCheck={false}
                      className="w-[74px] shrink-0 rounded border border-neutral-300 px-1.5 py-1 font-mono text-[11px]"
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div className="border-t border-neutral-200 px-4 py-3">
            <button
              type="button"
              onClick={copy}
              className="w-full rounded bg-neutral-900 px-3 py-2 text-xs text-white hover:bg-neutral-700"
            >
              {copied ? 'Copied' : 'Copy for globals.css'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
