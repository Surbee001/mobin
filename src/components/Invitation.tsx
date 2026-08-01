'use client'

import { useRef } from 'react'
import Image from 'next/image'
import { site } from '@/site.config'
import { useWordReveal } from './useWordReveal'

/** Resolved from the stylesheet at run time, so there is one source. */
const DIM = '--color-letter-dim'
const LIT = '--color-letter-ink'

/**
 * The families addressing their guests — the same treatment as the verse,
 * one panel further down and in the blush half of the palette.
 *
 * Nothing climbs over this one, so it needs only its own viewport plus the
 * reveal; there is no third viewport to pay for.
 */
const PANEL_VH = 1.9
const REVEAL_VH = 0.45

export function Invitation() {
  const scope = useRef<HTMLElement>(null)

  useWordReveal({ scope, dim: DIM, lit: LIT, revealVh: REVEAL_VH })

  return (
    <section
      ref={scope}
      id="invitation"
      // Climbs over the aya panel exactly as the aya climbs over the hero.
      className="relative z-30 -mt-[100dvh] bg-panel-letter"
      style={{ height: `${PANEL_VH * 100}dvh` }}
    >
      {/* The panel colour is repeated on the sticky pane, not just on the
          section. `position: sticky` forms a stacking context, so the multiply
          on the calligraphy resolves against THIS box rather than the section
          behind it — and with nothing painted here its white ground has
          nothing to blend away into and sits there as a white rectangle. */}
      <div className="sticky top-0 flex h-[100dvh] items-center justify-center overflow-hidden bg-panel-letter px-6 sm:px-10">
        <div dir="rtl" className="relative mx-auto w-full max-w-3xl text-center">
          {/* The calligraphy, above the words.

              Stored negated and multiplied: the plate is white ink on black
              and this panel is light blush, so screened onto it the writing
              would simply vanish. Inverted, `multiply` drops the ground —
              white multiplied by the panel IS the panel — and the ink is
              pre-tinted so it lands on the panel's own colour rather than on
              black.

              It carries no reveal. The words below resolve; a photograph
              cannot, and fading it would show its ground on the way in. */}
          <Image
            src="/invitation-verse.webp"
            alt={site.invitation.verseAlt}
            width={1600}
            height={825}
            sizes="(max-width: 640px) 82vw, 58vw"
            className="mx-auto mb-9 h-auto w-[66vw] max-w-md mix-blend-multiply sm:mb-12 sm:w-[44vw]"
          />

          <p
            lang="fa"
            className="font-persian font-light leading-[2.15]"
            style={{ fontSize: 'clamp(1.4rem, 3.6vw, 2.5rem)' }}
          >
            {/* No kashida. Nastaliq already extends a word along its own falling
              baseline; a programmatic tatweel lays a flat horizontal stroke
              across that cascade and breaks it. The stretching this site used
              on Persian was for a naskh face and does not belong on this one. */}
            <span data-reveal-text>{site.invitation.line}</span>
          </p>

          <span lang="fa" className="mt-12 block font-persian text-base font-light sm:mt-16">
            <span data-reveal-text>{site.invitation.signature}</span>
          </span>
        </div>
      </div>
    </section>
  )
}
