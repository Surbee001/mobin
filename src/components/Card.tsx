'use client'

import { forwardRef, Fragment, useImperativeHandle, useRef } from 'react'
import { Flourish } from './Flourish'
import { NameLines, type NameLine } from './NameLines'
import { site } from '@/site.config'

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

/**
 * The two display lines, as they break on the card.
 *
 * The ampersand belongs to the English setting and travels with it; the
 * Persian brings its own conjunction. Nothing is held back to sit between
 * them — the whole line is replaced, so a mark pinned in place would have to
 * belong to both settings, and it cannot.
 */
const LINES: NameLine[] = [
  { en: `${site.couple.one}&`, fa: site.couple.oneFa },
  { en: site.couple.two, fa: site.couple.twoFa },
]

export const Card = forwardRef<HTMLDivElement, { className?: string }>(function Card(
  { className = '' },
  ref,
) {
  const { couple, event } = site
  const root = useRef<HTMLDivElement>(null)

  // Opening moves this node by hand, so the ref it is given has to be the
  // element itself — while the effect below still needs its own handle on it.
  useImperativeHandle(ref, () => root.current as HTMLDivElement, [])


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
          <NameLines
            lines={LINES}
            lineClassName="card-name letterpress font-display text-ink"
          />
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
