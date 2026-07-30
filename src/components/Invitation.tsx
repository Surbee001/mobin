'use client'

import { useRef } from 'react'
import { site } from '@/site.config'
import { useWordReveal } from './useWordReveal'
import { kashida } from './kashida'

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
/** Tatweels per join. 3 is a long, editorial stretch. */
const KASHIDA = 3

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
      <div className="sticky top-0 flex h-[100dvh] items-center justify-center overflow-hidden px-6 sm:px-10">
        <div dir="rtl" className="relative mx-auto w-full max-w-3xl text-center">
          <p
            lang="fa"
            className="mb-9 font-persian font-light leading-[2.15] sm:mb-11"
            style={{ fontSize: 'clamp(1.4rem, 3.6vw, 2.5rem)' }}
          >
            <span data-reveal-text aria-hidden="true">
              {kashida(site.invitation.opening, KASHIDA)}
            </span>
            <span className="sr-only">{site.invitation.opening}</span>
          </p>

          {site.invitation.paragraphs.map((p, i) => (
            <p
              key={p}
              lang="fa"
              className={`font-persian font-light leading-[2.15] ${i > 0 ? 'mt-8 sm:mt-10' : ''}`}
              style={{ fontSize: 'clamp(1.4rem, 3.6vw, 2.5rem)' }}
            >
              {/* The stretched text is the one you see; the plain one is the
                  one screen readers get. A wall of tatweels read aloud is
                  nonsense, so only the visible copy carries them. */}
              <span data-reveal-text aria-hidden="true">
                {kashida(p, KASHIDA)}
              </span>
              <span className="sr-only">{p}</span>
            </p>
          ))}

          <span lang="fa" className="mt-12 block font-persian text-base font-light sm:mt-16">
            <span data-reveal-text aria-hidden="true">
              {kashida(site.invitation.signature, KASHIDA)}
            </span>
            <span className="sr-only">{site.invitation.signature}</span>
          </span>
        </div>
      </div>
    </section>
  )
}
