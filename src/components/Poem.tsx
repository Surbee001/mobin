'use client'

import { useRef } from 'react'
import { site } from '@/site.config'
import { kashida } from './kashida'
import { useWordReveal } from './useWordReveal'

/**
 * The couplet, on the one dark panel.
 *
 * It arrives the way the other panels do — climbing up over the one before
 * it — and now it resolves the way they do too: word by word out of the panel
 * colour, rather than drifting up from below.
 *
 * The drift it used to have was a nice enough effect on its own, but it was
 * the only one of its kind on the page, and a reader has no way to know that
 * a different motion here means nothing in particular. One reveal, used
 * everywhere, reads as the site having a voice; two read as an accident.
 */

/** Resolved from the stylesheet at run time, so there is one source. */
const DIM = '--color-poem-dim'
const LIT = '--color-poem-ink'

/**
 * Total scroll length, in viewport heights: one for the pane itself, REVEAL_VH
 * for the words to resolve, a hold where the couplet simply sits there whole,
 * and one more for the next panel to climb up over this one.
 *
 * The hold is not padding. Without it the last word lands on almost the same
 * frame the invitation starts covering the panel, and the couplet is never
 * once on screen finished and uninterrupted.
 */
const PANEL_VH = 2.9
/** How much of that the words take to resolve. */
const REVEAL_VH = 0.45
/** Tatweels per join — the couplet is stretched on the card it came from. */
const KASHIDA = 2

export function Poem() {
  const scope = useRef<HTMLElement>(null)

  useWordReveal({ scope, dim: DIM, lit: LIT, revealVh: REVEAL_VH })

  return (
    <section
      ref={scope}
      // Climbs over the verse panel exactly as the verse climbs over the hero.
      className="relative z-20 -mt-[100dvh] bg-panel-poem"
      style={{ height: `${PANEL_VH * 100}dvh` }}
    >
      <div className="sticky top-0 flex h-[100dvh] items-center justify-center overflow-hidden px-6 sm:px-10">
        <div dir="rtl" className="mx-auto w-full max-w-4xl text-center">
          {site.poem.lines.map((line) => (
            <p
              key={line}
              lang="ar"
              className="mb-9 font-arabic leading-[1.9] last:mb-0 sm:mb-12"
              style={{ fontSize: 'clamp(1.35rem, 3.4vw, 2.4rem)' }}
            >
              {/* The stretched copy is the one you see; the plain one is what
                  a screen reader gets, since a run of tatweels read aloud is
                  nonsense. */}
              <span data-reveal-text className="block" aria-hidden="true">
                {kashida(line, KASHIDA)}
              </span>
              <span className="sr-only">{line}</span>
            </p>
          ))}
        </div>
      </div>
    </section>
  )
}
