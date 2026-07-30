'use client'

import { forwardRef, useImperativeHandle, useRef } from 'react'
import { NameLines, type NameLine } from './NameLines'
import { site } from '@/site.config'

/**
 * The fourth hero — `design.hero: 'monogram'`.
 *
 * Two initials the height of the card, one at each opposite corner and both
 * run off the edge, with the notice held between them. Deep tan on a light
 * pink sheet, set a shade lighter than the envelope it is drawn out of.
 *
 * The initials are cropped ON PURPOSE. A letter that fits inside the trim
 * reads as a picture of a letter; one that runs off it reads as paper cut
 * from something larger, which is the entire effect being borrowed here.
 *
 * Same shape as the other three from the outside — the same `.card-frame` and
 * `.card` classes, the same forwarded ref — so the envelope, the Flip and the
 * hero slot cannot tell which of the four they are carrying.
 */

/** One line, so the names set side by side rather than stacked. */
const LINES: NameLine[] = [site.couple.pair]

/**
 * The date, spelled out, from the one field the whole schedule already comes
 * from. Derived rather than written down again — a second copy of a date is a
 * copy that can be left behind when the first one moves.
 *
 * Deterministic — a fixed instant, an explicit locale and an explicit zone —
 * so the server and the browser cannot render it differently.
 */
const DATE = new Intl.DateTimeFormat('en-GB', {
  dateStyle: 'full',
  timeZone: 'Asia/Tehran',
}).format(new Date(site.event.iso))

export const CardMonogram = forwardRef<HTMLDivElement, { className?: string }>(
  function CardMonogram({ className = '' }, ref) {
    const root = useRef<HTMLDivElement>(null)

    // Opening moves this node by hand, so the ref it is given has to be the
    // element itself.
    useImperativeHandle(ref, () => root.current as HTMLDivElement, [])

    return (
      <div ref={root} dir="ltr" className={`card-frame ${className}`}>
        <div className="card card-mono relative flex flex-col items-center justify-center overflow-hidden">
          {/* The two initials. Decorative — the names are set in full in the
              middle of the card, so a screen reader that read these as well
              would hear the letter M three times over. */}
          <span className="mono-initial mono-initial-top" aria-hidden="true">
            {site.couple.initials.one}
          </span>
          <span className="mono-initial mono-initial-bottom" aria-hidden="true">
            {site.couple.initials.two}
          </span>

          {/* The notice, over the top of both. */}
          <div className="mono-notice relative">
            {site.monogram.lead.map((line) => (
              <p key={line} className="mono-lead">
                {line}
              </p>
            ))}

            <NameLines lines={LINES} lineClassName="mono-name" />

            <p className="mono-date">{DATE}</p>
            <p className="mono-footer">{site.monogram.footer}</p>
          </div>
        </div>
      </div>
    )
  },
)
