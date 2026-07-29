'use client'

import { useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { site } from '@/site.config'
import { kashida } from './kashida'

gsap.registerPlugin(ScrollTrigger, useGSAP)

/**
 * The couplet, on the one dark panel.
 *
 * It arrives the way the other panels do — climbing up over the one before
 * it — because that is the language the page has already established and
 * breaking it here would read as a mistake rather than a variation. What is
 * different is what happens once it lands.
 *
 * The verse resolves word by word out of the panel colour. This does the
 * opposite: the lines are already at full strength and instead arrive at
 * different rates, each starting further down than the one above it and all
 * settling together. That difference in rate is the whole effect — it is
 * what makes them read as sitting at different depths rather than as one
 * block sliding up.
 */

/**
 * Total scroll length, in viewport heights: one for the pane itself, DRIFT_VH
 * for the lines to settle, a HOLD where the couplet simply sits there whole,
 * and one more for the next panel to climb up over this one.
 *
 * The hold is not padding. Without it the last line lands on almost the same
 * frame the invitation starts covering the panel, and the couplet is never
 * once on screen finished and uninterrupted.
 */
const PANEL_VH = 2.9
/** How much of that the lines take to settle. */
const DRIFT_VH = 0.45
/** Tatweels per join — the couplet is stretched on the card it came from. */
const KASHIDA = 2

export function Poem() {
  const scope = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const lines = gsap.utils.toArray<HTMLElement>('[data-poem-line]')

      lines.forEach((line, i) => {
        gsap.fromTo(
          line,
          // Each line starts further away than the one above it, so over the
          // same scroll distance it has further to travel — which is to say
          // it moves faster. Same finish, different speeds.
          //
          // Document order sets the index, so the basmala is i = 0: it has
          // the least distance to cover and settles first, which is the right
          // reading order for an invocation.
          { y: () => window.innerHeight * (0.3 + i * 0.22), opacity: 0 },
          {
            y: 0,
            opacity: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: scope.current,
              start: 'top top',
              end: () => '+=' + window.innerHeight * DRIFT_VH,
              scrub: 0.5,
              invalidateOnRefresh: true,
            },
          },
        )
      })
    },
    { scope },
  )

  return (
    <section
      ref={scope}
      // Climbs over the verse panel exactly as the verse climbs over the hero.
      className="relative z-20 -mt-[100dvh] bg-panel-poem"
      style={{ height: `${PANEL_VH * 100}dvh` }}
    >
      <div className="sticky top-0 flex h-[100dvh] items-center justify-center overflow-hidden px-6 sm:px-10">
        <div dir="rtl" className="mx-auto w-full max-w-4xl text-center">
          {/* The invocation. Smaller and set back from the couplet, because it
              opens the panel rather than belonging to the verse.

              Deliberately NOT kashida-stretched: the couplet is stretched
              because that is how it was set on the card it came from, but the
              basmala is a fixed formula and opening it out programmatically
              is not mine to do.

              The opacity lives on the paragraph, so the drift below can still
              animate the span from 0 to 1 without overwriting it. */}
          <p
            lang="ar"
            className="mb-14 font-arabic leading-[1.8] text-poem-ink opacity-75 sm:mb-20"
            style={{ fontSize: 'clamp(1rem, 2.3vw, 1.6rem)' }}
          >
            <span data-poem-line className="block">
              {site.poem.bismillah}
            </span>
          </p>

          {site.poem.lines.map((line) => (
            <p
              key={line}
              lang="ar"
              className="mb-9 font-arabic leading-[1.9] text-poem-ink last:mb-0 sm:mb-12"
              style={{ fontSize: 'clamp(1.35rem, 3.4vw, 2.4rem)' }}
            >
              {/* The stretched copy is the one you see; the plain one is what
                  a screen reader gets, since a run of tatweels read aloud is
                  nonsense. */}
              <span data-poem-line className="block" aria-hidden="true">
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
