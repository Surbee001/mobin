'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
// The `Icon`-suffixed export, not the bare `CaretDoubleDown` — the unsuffixed
// names are deprecated in @phosphor-icons/react v2 and go in the next major.
import { CaretDoubleDownIcon } from '@phosphor-icons/react'
import { site } from '@/site.config'
import { useScroll } from './SmoothScroll'

gsap.registerPlugin(useGSAP)

/**
 * How far the page has to move before the written hint counts as read.
 *
 * Not zero: Lenis reports fractional offsets while it settles, and a browser
 * restoring a position can fire a scroll event of its own before the guest has
 * touched anything. Far enough that only a deliberate scroll clears it.
 */
const ANSWERED_PX = 40

/**
 * How close to the foot of the page counts as arrived.
 *
 * Generous, because nothing lands on the last pixel: Lenis eases to a stop and
 * can settle a fraction short, mobile browsers change `innerHeight` as their
 * chrome slides away, and a sub-pixel document height rounds the wrong way. Too
 * tight and the caret is still pointing down at a page with nothing left below.
 */
const BOTTOM_PX = 64

/** Long enough that the card is standing still before anything asks for more. */
const APPEAR_DELAY = 1.1

/**
 * The nudge at the foot of the screen.
 *
 * The card lands filling the whole viewport and holds there — which is the
 * point of the design, and also the problem with it: nothing on screen admits
 * that there is a page underneath. This says so, and keeps saying it, in two
 * registers: the written line is for the guest who has not moved yet and goes
 * on the first scroll, and the caret stays for the whole descent and leaves
 * only once there is genuinely nothing below it.
 *
 * Fixed rather than placed in the hero, because the cue belongs to the bottom
 * of the SCREEN rather than to any one section of the page.
 */
export function ScrollCue() {
  const { locked } = useScroll()
  const scope = useRef<HTMLDivElement>(null)
  const hint = useRef<HTMLSpanElement>(null)
  const caret = useRef<SVGSVGElement>(null)
  const hintRead = useRef(false)
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
      // never stops moving is exactly what was asked against, and it now never
      // stops for the length of the whole page.
      if (!reduced) {
        gsap.to(caret.current, {
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

  useEffect(() => {
    if (locked) return

    // The written line has been read. It goes, and the caret stays behind to
    // carry the rest of the page on its own — a sentence held over the aya for
    // the length of the descent stops being an invitation and starts nagging.
    // Faded in place rather than removed, so the caret does not jump upward
    // into the room the line was occupying.
    const readHint = () => {
      if (hintRead.current) return
      hintRead.current = true
      gsap.to(hint.current, { opacity: 0, duration: 0.5, ease: 'power2.in' })
    }

    // Arrived. Fade the caret out and take it out of the tree — there is
    // nothing left under it to point at, and it does not come back if the
    // guest scrolls up again to re-read something.
    const dismiss = () => {
      if (dismissed.current) return
      dismissed.current = true

      // Both, and the fade-in especially: a guest who reaches the foot inside
      // the appearance delay has a tween still queued against them, and it
      // would bring the cue back up a beat after this took it away.
      gsap.killTweensOf(caret.current)
      gsap.killTweensOf(scope.current)

      gsap.to(scope.current, {
        opacity: 0,
        y: 10,
        duration: 0.45,
        ease: 'power2.in',
        onComplete: () => setGone(true),
      })
    }

    const check = () => {
      if (window.scrollY >= ANSWERED_PX) readHint()

      const bottom = document.documentElement.scrollHeight - window.innerHeight
      if (window.scrollY >= bottom - BOTTOM_PX) dismiss()
    }

    // Once on arrival as well as on every scroll, on the next frame: the page
    // has this instant grown from one viewport to its full height and the
    // measurements above are only true after that lands. It catches the case
    // where there is nowhere to scroll to at all — a cue pointing down a page
    // that ends at the fold would sit there for ever.
    const frame = requestAnimationFrame(check)

    window.addEventListener('scroll', check, { passive: true })
    // `innerHeight` moves on its own on mobile as the browser's chrome slides
    // away, which moves the foot of the page without a scroll event.
    window.addEventListener('resize', check)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', check)
      window.removeEventListener('resize', check)
    }
  }, [locked])

  // Nothing to cue while the envelope is still sealed — there is nowhere to
  // scroll to, and the page is being held at the top anyway.
  if (locked || gone) return null

  return (
    <div
      ref={scope}
      // A handle for scripts/og-shot.mjs, which hides the page's furniture
      // before photographing the card. Nothing styles off it.
      data-scroll-cue
      // Nothing here is clickable, and the card underneath is: a fixed strip
      // across the foot of the screen would otherwise swallow taps meant for
      // the page it is sitting on top of.
      className="pointer-events-none fixed inset-x-0 bottom-6 z-40 flex flex-col items-center gap-2 text-ink-soft sm:bottom-8"
      style={{ opacity: 0 }}
    >
      <span ref={hint} lang="fa" className="font-persian text-[0.95rem] font-light">
        {site.opening.scrollHint}
      </span>
      <CaretDoubleDownIcon ref={caret} size={18} weight="light" aria-hidden="true" />
    </div>
  )
}
