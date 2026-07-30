'use client'

import { forwardRef, useImperativeHandle, useRef } from 'react'
import { NameLines, type NameLine } from './NameLines'
import { site } from '@/site.config'

/**
 * The third hero — `design.hero: 'frame'`.
 *
 * A plate: the two names on one line, the date under them, an engraved border
 * around both, and nothing else at all.
 *
 * Same shape as the other two from the outside — the same `.card-frame` and
 * `.card` classes, the same forwarded ref — so the envelope, the Flip and the
 * hero slot cannot tell which of the three they are carrying.
 */

/** One line, so the names set side by side rather than stacked. */
const LINES: NameLine[] = [site.couple.pair]

/**
 * The date, spelled out, from the one field the whole schedule already comes
 * from. Derived rather than written down again: a second copy of a date is a
 * copy that can be left behind when the first one moves, which is exactly what
 * happened to the Persian line when this event shifted from September.
 *
 * Deterministic — a fixed instant, an explicit locale and an explicit zone —
 * so the server and the browser cannot render it differently.
 */
const DATE = new Intl.DateTimeFormat('en-GB', {
  dateStyle: 'full',
  timeZone: 'Asia/Tehran',
}).format(new Date(site.event.iso))

export const CardFramed = forwardRef<HTMLDivElement, { className?: string }>(function CardFramed(
  { className = '' },
  ref,
) {
  const root = useRef<HTMLDivElement>(null)

  // Opening moves this node by hand, so the ref it is given has to be the
  // element itself.
  useImperativeHandle(ref, () => root.current as HTMLDivElement, [])

  return (
    <div ref={root} dir="ltr" className={`card-frame ${className}`}>
      <div className="card card-plate paper relative flex flex-col items-center justify-center overflow-hidden">
        {/* The border. Not an image on the page but a mask over a flat fill:
            the artwork is a photograph of a white sheet with the ornament
            carried in its shading, and what it contributes here is only its
            shape. The colour comes from the palette, which is what lets the
            border stay in step with the rest of the site — and with the theme
            editor — instead of being fixed at whatever it was photographed as.
            See the note on `.plate-art` in globals.css. */}
        <div className="plate-art" aria-hidden="true" />

        <div className="plate-names relative">
          <NameLines lines={LINES} lineClassName="plate-name letterpress font-display text-ink" />
          <p className="plate-date relative text-ink-soft">{DATE}</p>
        </div>
      </div>
    </div>
  )
})
