'use client'

import { forwardRef, useImperativeHandle, useRef } from 'react'
import { kashida } from './kashida'
import { NameLines, type NameLine } from './NameLines'
import { site } from '@/site.config'

/**
 * The alternate hero — `design.hero: 'verse'`.
 *
 * A poster rather than a card: two lines of Persian, the pair of names on one
 * line, two lines more, and nothing else. No rule along the top, no columns at
 * the foot, no date. Everything the other design says in its margins, this one
 * leaves to the sections further down the page.
 *
 * It is the same shape as Card from the outside — the same `.card-frame` and
 * `.card` classes, the same forwarded ref — so the envelope, the Flip and the
 * hero slot cannot tell which of the two they are carrying. Switching designs
 * is one word in site.config.
 */

/** One line, so the names set side by side rather than stacked. */
const LINES: NameLine[] = [{ en: site.verse.names.en, fa: site.verse.names.fa }]

/**
 * A single tatweel per join. Enough to open the lines out and give them the
 * drawn-across look the design wants, without the width running away — at two
 * per join a sentence of this length grows by half again and wraps, and a
 * wrapped line takes the whole composition with it.
 */
const STRETCH = 1

export const CardVerse = forwardRef<HTMLDivElement, { className?: string }>(function CardVerse(
  { className = '' },
  ref,
) {
  const { verse } = site
  const root = useRef<HTMLDivElement>(null)

  // Opening moves this node by hand, so the ref it is given has to be the
  // element itself.
  useImperativeHandle(ref, () => root.current as HTMLDivElement, [])

  const block = (lines: readonly string[]) => (
    <div className="verse-block">
      {lines.map((line) => (
        // aria-label carries the unstretched line: the tatweels are a
        // typographic device, and a screen reader should not have to read
        // them out as part of the word.
        <p key={line} className="verse-line deboss text-ink-soft" aria-label={line}>
          {kashida(line, STRETCH)}
        </p>
      ))}
    </div>
  )

  return (
    // `dir="rtl"` here, where Card sets `ltr`: on this design the Persian is
    // the setting the layout is built around, and the Latin is the guest.
    <div ref={root} dir="rtl" className={`card-frame ${className}`}>
      <div className="card card-verse paper relative flex flex-col justify-between overflow-hidden">
        {block(verse.above)}

        <div className="verse-names">
          <NameLines lines={LINES} lineClassName="verse-name letterpress font-display text-ink" />
        </div>

        {block(verse.below)}
      </div>
    </div>
  )
})
