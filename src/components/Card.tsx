'use client'

import { forwardRef, Fragment, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { Flourish } from './Flourish'
import { kashidaJoins, kashidaTotal } from './kashida'
import { site } from '@/site.config'

gsap.registerPlugin(useGSAP)

/**
 * The invitation card — the one object the whole site is built around.
 *
 * Three things only: the pair of them either side of a rule, the names
 * themselves, and the date. No border: it is a piece of paper, not a frame.
 *
 * Portrait on phones, landscape once there is room. All sizing lives in the
 * `.card-*` classes in globals.css, driven by container queries.
 *
 * The names are set twice, in English and in Persian, stacked in one grid
 * cell; the loop below slides one out to the right as the other arrives from
 * the left. Neither setting ever fades — the window does the hiding, so the
 * type stays at full weight all the way through. Each Persian line is
 * stretched with kashidas until it comes out the width of the English line it
 * replaces, so the block holds its shape as the two swap.
 *
 * The loop is built paused and waits for CARD_LANDED. Nothing should be
 * changing inside the card while the card itself is still travelling from
 * the envelope to the hero — two movements at once reads as neither.
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
/** The second line follows the first, so the pair reads as one movement. */
const STAGGER = 0.08
/** Slightly past the window's own edge, so nothing clips a hair short. */
const TRAVEL = 110

/**
 * The two display lines, as they break on the card.
 *
 * The ampersand belongs to the English setting and travels with it; the
 * Persian brings its own conjunction. Nothing is held back to sit between
 * them — the whole line is replaced, so a mark pinned in place would have to
 * belong to both settings, and it cannot.
 */
const LINES = [
  { en: `${site.couple.one}&`, fa: site.couple.oneFa },
  { en: site.couple.two, fa: site.couple.twoFa },
]

/** The size the fit below measures at — big, so rounding to a whole tatweel
 *  is a small error rather than a visible one. */
const MEASURE_PX = 400

/**
 * How many tatweels each Persian line needs to come out the same width as the
 * English line it stands in for.
 *
 * Kashida rather than letter-spacing: prising the joins apart breaks the word,
 * where a tatweel elongates the connecting stroke and the letters stay joined.
 * See kashida.ts.
 *
 * Measured on a canvas rather than in the DOM — no layout, no reflow, and it
 * can be done at one fixed size instead of whatever size the card happens to
 * be at. The answer is the same either way: everything on the card is sized in
 * `cqw`, so the ratio between the two settings holds at every scale, and the
 * count only has to be worked out once.
 *
 * Width grows linearly with the number of strokes, so one division lands on
 * the answer with no searching.
 */
function useKashidaFit(root: React.RefObject<HTMLDivElement | null>) {
  const [stretch, setStretch] = useState<number[]>(() => LINES.map(() => 0))

  useEffect(() => {
    let alive = true

    const fit = () => {
      const ctx = document.createElement('canvas').getContext('2d')
      const en = root.current?.querySelectorAll<HTMLElement>('[data-name-en]')
      const fa = root.current?.querySelectorAll<HTMLElement>('[data-name-fa]')
      if (!alive || !ctx || !en || !fa) return

      const width = (style: CSSStyleDeclaration, px: number, text: string) => {
        ctx.font = `${style.fontStyle} ${style.fontWeight} ${px}px ${style.fontFamily}`
        return ctx.measureText(text).width
      }

      // One target for all four settings — the widest of them — so the two
      // lines come out the same width as each other, not merely each the width
      // of its own counterpart.
      const target = Math.max(...LINES.map((line, i) => width(getComputedStyle(en[i]), MEASURE_PX, line.en)))

      const next = LINES.map((line, i) => {
        const faStyle = getComputedStyle(fa[i])
        // The Persian is set larger than the Latin; measuring both at one
        // nominal size would throw that away, so carry the ratio across.
        const scale = parseFloat(faStyle.fontSize) / parseFloat(getComputedStyle(en[i]).fontSize)
        const px = MEASURE_PX * scale

        const bare = width(faStyle, px, line.fa)
        const stroke = width(faStyle, px, 'ـ')
        if (stroke <= 0 || kashidaJoins(line.fa) === 0) return 0

        return Math.max(0, Math.round((target - bare) / stroke))
      })

      setStretch(next)
    }

    // Not before the faces are in: measured against the fallback, every count
    // would be wrong, and wrong in a way that only shows on a slow connection.
    document.fonts.ready.then(fit)
    return () => {
      alive = false
    }
  }, [root])

  return stretch
}

export const Card = forwardRef<HTMLDivElement, { className?: string }>(function Card(
  { className = '' },
  ref,
) {
  const { couple, event } = site
  const lines = LINES
  const root = useRef<HTMLDivElement>(null)
  const stretch = useKashidaFit(root)

  // Opening moves this node by hand, so the ref it is given has to be the
  // element itself — while the effect below still needs its own handle on it.
  useImperativeHandle(ref, () => root.current as HTMLDivElement, [])

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

      // Held until the card has stopped moving. If the envelope is never
      // opened — a direct link to the hero, say — nothing here ever runs, and
      // the card simply stays in English.
      const start = () => tl.play()
      window.addEventListener(CARD_LANDED, start, { once: true })
      return () => window.removeEventListener(CARD_LANDED, start)
    },
    { scope: root },
  )

  return (
    // The frame is the query container; the card inside reads its width for
    // *both* its aspect ratio and its type scale, so the two can never
    // disagree the way a viewport breakpoint and a container query can.
    // Flip moves this element, so the container must live here.
    <div ref={root} dir="ltr" className={`card-frame ${className}`}>
      <div className="card paper relative flex flex-col justify-between overflow-hidden">
        {/* ── Top: the two of them, either side of a rule ───────── */}
        <header className="card-topline relative flex items-center">
          <span className="card-topname deboss text-ink">{couple.oneFull}</span>
          <span className="rule flex-1" />
          <span className="card-topname deboss text-ink">{couple.twoFull}</span>
        </header>

        {/* ── Middle: the names, set as one piece of type broken over two
              lines — the first name and the ampersand, then the second. The
              ampersand is closed up with no space and carries no styling of
              its own: same size, same weight, same colour. It also sits
              outside the sliding window, so it is the one thing on the card
              that holds still through a hand-over.

              The Persian setting is marked hidden: it says the same thing,
              and a screen reader should hear the pair once. ─────────── */}
        <div className="card-names relative flex w-full flex-col items-center">
          <div className="name-block">
            {lines.map((line, i) => (
              <h1 key={line.en} className="card-name name-row letterpress font-display text-ink">
                <span className="name-line">
                  <span className="name-setting" data-name-en>
                    {line.en}
                  </span>
                  <span className="name-setting name-fa" data-name-fa aria-hidden="true">
                    {kashidaTotal(line.fa, stretch[i])}
                  </span>
                </span>
              </h1>
            ))}
          </div>
        </div>

        {/* ── Bottom: why, when, where — the rest of the site, at a glance,
              divided by the engraved flourishes. ───────────────────── */}
        <footer className="card-info relative">
          {site.cardInfo.map((column, i) => (
            <Fragment key={i}>
              {/* The right-hand one is turned end for end, so the pair
                  answer each other across the middle column. */}
              {i > 0 && <Flourish mirror={i === 2} />}
              <div>
                {column.stamp ? (
                  <p className="card-date deboss text-ink-soft">{event.cardDate}</p>
                ) : (
                  column.lines.map((line) => (
                    <p key={line} className="info-line deboss text-ink-soft" dir="rtl" lang="fa">
                      {line}
                    </p>
                  ))
                )}
              </div>
            </Fragment>
          ))}
        </footer>
      </div>
    </div>
  )
})
