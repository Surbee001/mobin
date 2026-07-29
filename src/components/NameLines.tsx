'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { kashidaJoins, kashidaTotal } from './kashida'

gsap.registerPlugin(useGSAP)

/**
 * The names, set twice — once in English and once in Persian — and swapped on
 * a loop.
 *
 * Both settings live in one grid cell, and the cell is clipped so that one can
 * slide out to the right as the other arrives from the left. Neither ever
 * fades: the window does all the hiding, so the type stays at full weight the
 * whole way through.
 *
 * Shared by both hero designs — one gives it two lines, the other one — so
 * everything here is driven by what it is handed and nothing is hard-coded to
 * a particular arrangement of names.
 */

/** Fired by Opening once the card has finished becoming the hero. */
export const CARD_LANDED = 'card:landed'

/** How long each language holds still before it hands over. */
const HOLD = 3.4
/**
 * The two halves of a hand-over. LAG is all but the whole of OUT on purpose:
 * the outgoing line has to be gone before the incoming one starts, or the two
 * cross in the window and you get half of each language legible at once. One
 * leaves, then the other arrives — a delete, then a reveal, not a crossfade.
 */
const OUT = 0.5
const IN = 1.0
const LAG = 0.44
/** Later lines follow the first, so a pair reads as one movement. */
const STAGGER = 0.08
/** Slightly past the window's own edge, so nothing clips a hair short. */
const TRAVEL = 110

/** The size the fit below measures at — big, so rounding to a whole tatweel
 *  is a small error rather than a visible one. */
const MEASURE_PX = 400

export type NameLine = { en: string; fa: string }

/**
 * How many tatweels each Persian line needs to come out the same width as the
 * widest English line.
 *
 * Kashida rather than letter-spacing: prising the joins apart breaks the word,
 * where a tatweel elongates the connecting stroke and the letters stay joined.
 * See kashida.ts.
 *
 * Measured on a canvas rather than in the DOM — no layout, no reflow, and it
 * can be done at one fixed size instead of whatever size the card happens to
 * be at. The answer is the same either way: everything on the card is sized in
 * one unit, so the ratio between the two settings holds at every scale, and
 * the count only has to be worked out once.
 *
 * Width grows linearly with the number of strokes, so one division lands on
 * the answer with no searching.
 */
function useKashidaFit(root: React.RefObject<HTMLDivElement | null>, lines: NameLine[]) {
  const [stretch, setStretch] = useState<number[]>(() => lines.map(() => 0))

  useEffect(() => {
    let alive = true

    const fit = () => {
      const ctx = document.createElement('canvas').getContext('2d')
      const en = root.current?.querySelectorAll<HTMLElement>('[data-name-en]')
      const fa = root.current?.querySelectorAll<HTMLElement>('[data-name-fa]')
      if (!alive || !ctx || !en || !fa || en.length !== lines.length) return

      const width = (style: CSSStyleDeclaration, px: number, text: string) => {
        ctx.font = `${style.fontStyle} ${style.fontWeight} ${px}px ${style.fontFamily}`
        return ctx.measureText(text).width
      }

      // One target for every setting — the widest of them — so the lines come
      // out the same width as each other, not merely each the width of its own
      // counterpart.
      const target = Math.max(
        ...lines.map((line, i) => width(getComputedStyle(en[i]), MEASURE_PX, line.en)),
      )

      setStretch(
        lines.map((line, i) => {
          const faStyle = getComputedStyle(fa[i])
          // The Persian is set larger than the Latin; measuring both at one
          // nominal size would throw that away, so carry the ratio across.
          const scale = parseFloat(faStyle.fontSize) / parseFloat(getComputedStyle(en[i]).fontSize)
          const px = MEASURE_PX * scale

          const bare = width(faStyle, px, line.fa)
          const stroke = width(faStyle, px, 'ـ')
          if (stroke <= 0 || kashidaJoins(line.fa) === 0) return 0

          return Math.max(0, Math.round((target - bare) / stroke))
        }),
      )
    }

    // Not before the faces are in: measured against the fallback, every count
    // would be wrong, and wrong in a way that only shows on a slow connection.
    document.fonts.ready.then(fit)
    return () => {
      alive = false
    }
  }, [root, lines])

  return stretch
}

export function NameLines({
  lines,
  lineClassName = '',
}: {
  lines: NameLine[]
  /** Goes on each line: whatever sets its size, weight and colour. */
  lineClassName?: string
}) {
  const root = useRef<HTMLDivElement>(null)
  const stretch = useKashidaFit(root, lines)

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

      const EN = '[data-name-en]'
      const FA = '[data-name-fa]'

      // Persian waits its turn off the left edge. Everything travels the same
      // way round — out to the right, in from the left — so the swap reads as
      // one direction of movement rather than a shuffle.
      gsap.set(FA, { xPercent: -TRAVEL })

      // Each hand-over is timed from when the *incoming* line lands, not from
      // when the outgoing one leaves — so both languages get the same HOLD.
      // The timeline ends the instant English is back, with no tail: a tail
      // here would add to the hold at the top of the next repeat and leave
      // English sitting there twice as long as Persian.
      const SWAP1 = HOLD
      const SWAP2 = SWAP1 + LAG + IN + HOLD

      const tl = gsap.timeline({ repeat: -1, paused: true })

      // ── English out, Persian in ──
      tl.to(EN, { xPercent: TRAVEL, duration: OUT, ease: 'power2.in', stagger: STAGGER }, SWAP1)
        .to(FA, { xPercent: 0, duration: IN, ease: 'expo.out', stagger: STAGGER }, SWAP1 + LAG)
        // English comes back round to the left, ready for its own entrance.
        .set(EN, { xPercent: -TRAVEL }, SWAP1 + OUT + 0.3)

      // ── and back again ──
      tl.to(FA, { xPercent: TRAVEL, duration: OUT, ease: 'power2.in', stagger: STAGGER }, SWAP2)
        .to(EN, { xPercent: 0, duration: IN, ease: 'expo.out', stagger: STAGGER }, SWAP2 + LAG)
        .set(FA, { xPercent: -TRAVEL }, SWAP2 + OUT + 0.3)

      // Held until the card has stopped moving — nothing should be changing
      // inside the card while the card itself is still travelling from the
      // envelope to the hero. If the envelope is never opened, nothing here
      // ever runs and the names simply stay in English.
      const start = () => tl.play()
      window.addEventListener(CARD_LANDED, start, { once: true })
      return () => window.removeEventListener(CARD_LANDED, start)
    },
    { scope: root, dependencies: [lines] },
  )

  return (
    // As wide as the widest of the settings, with every line stretched to it,
    // so the block always sets as a clean rectangle rather than lines of
    // whatever width their letters happened to come to.
    <div ref={root} className="name-block">
      {lines.map((line, i) => (
        // An h1 rather than a p: on either design this is the one heading the
        // page has.
        <h1 key={line.en} className={`name-row ${lineClassName}`}>
          <span className="name-line">
            <span className="name-setting" data-name-en>
              {line.en}
            </span>
            {/* The Persian says the same thing; a screen reader should hear
                the pair once. */}
            <span className="name-setting name-fa" data-name-fa aria-hidden="true">
              {kashidaTotal(line.fa, stretch[i])}
            </span>
          </span>
        </h1>
      ))}
    </div>
  )
}
