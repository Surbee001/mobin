'use client'

import { useRef } from 'react'
import { site } from '@/site.config'
import { useWordReveal } from './useWordReveal'

/** Resolved from the stylesheet at run time, so there is one source. */
const DIM = '--color-verse-dim'
const LIT = '--color-verse-ink'

/**
 * The verse, on its own sage panel.
 *
 * PANEL_VH breaks down as: one viewport for the pane itself, REVEAL_VH for
 * the words to resolve, and one more viewport for the *next* panel to climb
 * up over this one — a climb always costs exactly one viewport, because that
 * is how far the incoming section travels from the bottom edge to the top.
 * The pane stays pinned throughout, so this panel sits perfectly still while
 * the next one covers it.
 */
const PANEL_VH = 2.45
const REVEAL_VH = 0.45

export function Aya() {
  const scope = useRef<HTMLElement>(null)

  useWordReveal({ scope, dim: DIM, lit: LIT, revealVh: REVEAL_VH })

  return (
    <section
      ref={scope}
      // -mt-[100dvh] is what makes it climb over the hero instead of
      // following it.
      className="relative z-10 -mt-[100dvh] bg-panel-verse"
      style={{ height: `${PANEL_VH * 100}dvh` }}
      aria-label={site.aya.reference}
    >
      <div className="sticky top-0 flex h-[100dvh] items-center justify-center overflow-hidden px-6 sm:px-10">
        <div className="mx-auto w-full max-w-5xl text-center">
          <p
            data-reveal-text
            dir="rtl"
            lang="ar"
            className="font-arabic text-balance leading-[2.05]"
            style={{ fontSize: 'clamp(1.7rem, 4.4vw, 3.1rem)' }}
          >
            {site.aya.arabic}
          </p>

          <span
            data-reveal-text
            dir="rtl"
            lang="fa"
            className="mt-12 block font-persian text-base font-light sm:mt-16"
          >
            {site.aya.reference}
          </span>
        </div>
      </div>
    </section>
  )
}
