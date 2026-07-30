'use client'

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { kashidaTotal } from './kashida'
import { kashidaCounts } from './kashidaFit'
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
const LINES: NameLine[] = [site.couple.pair]

/** Every line on the card, in the order they are rendered. */
const VERSE = [...site.verse.above, ...site.verse.below]

/**
 * How many tatweels bring each line up to the width of the names.
 *
 * This is what holds the design together: the four lines and the names are all
 * drawn to one measure, so the block reads as a single justified column rather
 * than five lines of whatever width their words happened to come to. The
 * stretching is heavy — these lines are set small and the names are the widest
 * thing on the card — which is the look, not a side effect. See kashidaFit.ts.
 */
function useVerseFit(root: React.RefObject<HTMLDivElement | null>) {
  const [stretch, setStretch] = useState<number[]>(() => VERSE.map(() => 0))

  useEffect(() => {
    let alive = true

    const fit = () => {
      const name = root.current?.querySelector<HTMLElement>('[data-name-en]')
      const lines = root.current?.querySelectorAll<HTMLElement>('.verse-line')
      if (!alive || !name || !lines || lines.length !== VERSE.length) return

      setStretch(
        kashidaCounts(
          [{ style: getComputedStyle(name), text: site.couple.pair.en }],
          VERSE.map((text, i) => ({ style: getComputedStyle(lines[i]), text })),
        ),
      )
    }

    document.fonts.ready.then(fit)
    return () => {
      alive = false
    }
  }, [root])

  return stretch
}

export const CardVerse = forwardRef<HTMLDivElement, { className?: string }>(function CardVerse(
  { className = '' },
  ref,
) {
  const { verse } = site
  const root = useRef<HTMLDivElement>(null)
  const stretch = useVerseFit(root)

  // Opening moves this node by hand, so the ref it is given has to be the
  // element itself.
  useImperativeHandle(ref, () => root.current as HTMLDivElement, [])

  /** `from` is where this block's lines start in VERSE — the fit returns one
   *  count per line across the whole card, in render order. */
  const block = (lines: readonly string[], from: number) => (
    <div className="verse-block">
      {lines.map((line, i) => (
        // aria-label carries the unstretched line: the tatweels are a
        // typographic device, and a screen reader should not have to read
        // them out as part of the word.
        <p key={line} className="verse-line deboss text-ink-soft" aria-label={line}>
          {kashidaTotal(line, stretch[from + i])}
        </p>
      ))}
    </div>
  )

  return (
    // `dir="rtl"` here, where Card sets `ltr`: on this design the Persian is
    // the setting the layout is built around, and the Latin is the guest.
    <div ref={root} dir="rtl" className={`card-frame ${className}`}>
      <div className="card card-verse paper relative flex flex-col justify-between overflow-hidden">
        {block(verse.above, 0)}

        <div className="verse-names">
          <NameLines lines={LINES} lineClassName="verse-name letterpress font-display text-ink" />
        </div>

        {block(verse.below, verse.above.length)}
      </div>
    </div>
  )
})
