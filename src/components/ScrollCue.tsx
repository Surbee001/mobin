'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { CaretDown } from '@phosphor-icons/react'
import { site } from '@/site.config'
import { useScroll } from './SmoothScroll'

gsap.registerPlugin(useGSAP)

/**
 * How far the page has to move before the cue counts as answered.
 *
 * Not zero: Lenis reports fractional offsets while it settles, and a browser
 * restoring a position can fire a scroll event of its own before the guest has
 * touched anything. Far enough that only a deliberate scroll clears it.
 */
const ANSWERED_PX = 40

/** Long enough that the card is standing still before anything asks for more. */
const APPEAR_DELAY = 1.1

/**
 * The nudge at the foot of the hero.
 *
 * The card lands filling the whole viewport and holds there — which is the
 * point of the design, and also the problem with it: nothing on screen admits
 * that there is a page underneath. This says so, quietly, and leaves.
 *
 * Fixed rather than placed in the hero, because the hero's pane is sticky and
 * the cue belongs to the bottom of the SCREEN for as long as it is up. It is
 * never up for long enough for the difference to be academic.
 */
export function ScrollCue() {
  const { locked } = useScroll()
  const scope = useRef<HTMLDivElement>(null)
  const dismissed = useRef(false)
  const [gone, setGone] = useState(false)

  useGSAP(
    () => {
      if (locked) return
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

      gsap.to(scope.current, {
        opacity: 1,
        duration: 0.9,
        delay: APPEAR_DELAY,
        ease: 'power2.out',
      })

      // The caret breathes rather than bounces — it is an invitation, not an
      // instruction. Skipped outright under reduced motion, where a thing that
      // never stops moving is exactly what was asked against.
      if (!reduced) {
        gsap.to('[data-caret]', {
          y: 6,
          duration: 1.15,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: APPEAR_DELAY,
        })
      }
    },
    { scope, dependencies: [locked] },
  )

  // Answered. Fade it out and take it out of the tree — it has said its piece
  // and a second showing would be nagging.
  useEffect(() => {
    if (locked) return

    const onScroll = () => {
      if (dismissed.current || window.scrollY < ANSWERED_PX) return
      dismissed.current = true
      window.removeEventListener('scroll', onScroll)

      // Both, and the fade-in especially: a guest who scrolls inside the
      // appearance delay has a tween still queued against them, and it would
      // bring the cue back up a beat after this took it away.
      gsap.killTweensOf('[data-caret]')
      gsap.killTweensOf(scope.current)

      gsap.to(scope.current, {
        opacity: 0,
        y: 10,
        duration: 0.45,
        ease: 'power2.in',
        onComplete: () => setGone(true),
      })
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [locked])

  // Nothing to cue while the envelope is still sealed — there is nowhere to
  // scroll to, and the page is being held at the top anyway.
  if (locked || gone) return null

  return (
    <div
      ref={scope}
      // Nothing here is clickable, and the card underneath is: a fixed strip
      // across the foot of the hero would otherwise swallow taps meant for it.
      className="pointer-events-none fixed inset-x-0 bottom-6 z-40 flex flex-col items-center gap-2 text-ink-soft sm:bottom-8"
      style={{ opacity: 0 }}
    >
      <span lang="fa" className="font-persian text-[0.95rem] font-light">
        {site.opening.scrollHint}
      </span>
      <CaretDown data-caret size={18} weight="light" aria-hidden="true" />
    </div>
  )
}
