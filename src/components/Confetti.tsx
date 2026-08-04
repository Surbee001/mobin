'use client'

import { useRef } from 'react'
import confetti from 'canvas-confetti'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { useScroll } from './SmoothScroll'

gsap.registerPlugin(ScrollTrigger, useGSAP)

/**
 * Two cannons at the edges of the screen, fired once when the clock comes
 * into view.
 *
 * The colours are read from the stylesheet rather than listed here, so the
 * confetti follows the palette — including anything changed in the theme
 * editor — instead of being a sixth copy of the hex values.
 *
 * Cream is deliberately not among them: the page it lands on is cream, and
 * a third of the confetti would simply be invisible.
 */
const PALETTE = [
  '--color-olive',
  '--color-chartreuse',
  '--color-chartreuse-deep',
  '--color-blush-deep',
  '--color-tan',
]

export function Confetti({ trigger }: { trigger: string }) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const { locked } = useScroll()

  useGSAP(() => {
    const el = canvas.current
    // Nothing is built while the envelope is still sealed, and that is the
    // fix for cannons that went off before anybody had opened anything.
    //
    // A sealed page is clamped to `height: 100dvh; overflow: hidden` (see
    // globals.css) so it cannot be scrolled behind the envelope, and its
    // maximum scroll offset is therefore ZERO — measured, not assumed. A
    // ScrollTrigger built against a scroll range with no room in it has no
    // honest answer to give: a start thousands of pixels down the page has to
    // resolve to somewhere inside [0, 0], which is the position the page is
    // already at. Whether that counts as met is left to the library's clamping,
    // and it is not a question worth having an opinion about — `once: true`
    // means being wrong costs the whole volley, and no later refresh can give
    // it back, because by then the trigger has fired and retired itself.
    //
    // So it is simply not built until there is a page to measure.
    if (!el || locked) return

    // Its own canvas rather than the library's global one, so the z-index is
    // ours and React can tear it down cleanly.
    // Deliberately NOT `useWorker`. Handing the canvas to an OffscreenCanvas
    // worker here drew nothing at all — silently, with no error — so the
    // particles run on the main thread. There are a few dozen of them for
    // four seconds, once; the worker was never buying much.
    const fire = confetti.create(el, { resize: true, useWorker: false })

    const cs = getComputedStyle(document.documentElement)
    const colors = PALETTE.map((token) => cs.getPropertyValue(token).trim()).filter(Boolean)

    /** One cannon. `x` is 0 for the left edge, 1 for the right. */
    const shoot = (x: 0 | 1, particleCount: number, startVelocity: number) =>
      fire({
        particleCount,
        // Angled inward and up, away from the edge it comes from.
        angle: x === 0 ? 58 : 122,
        spread: 64,
        startVelocity,
        decay: 0.91,
        gravity: 0.95,
        // Squares, not circles: it is paper.
        shapes: ['square'],
        scalar: 0.95,
        ticks: 260,
        origin: { x, y: 0.74 },
        colors,
        // The library's own check — nothing fires for a guest who has asked
        // their device for less motion.
        disableForReducedMotion: true,
      })

    const volley = () => {
      shoot(0, 38, 48)
      shoot(1, 38, 48)
      // Two lighter follow-ups, so it reads as a burst settling rather than
      // one flat pop.
      gsap.delayedCall(0.18, () => {
        shoot(0, 20, 40)
        shoot(1, 20, 40)
      })
      gsap.delayedCall(0.42, () => {
        shoot(0, 12, 34)
        shoot(1, 12, 34)
      })
    }

    let st: ScrollTrigger | null = null

    // One frame's grace before measuring. `locked` is lowered by the provider
    // ABOVE this component, and React runs a child's effects before its
    // parent's — so at this instant the <body> attribute that releases the
    // page is still saying it is sealed and the document is still one screen
    // tall. A frame later the lock is off, the provider's own
    // `ScrollTrigger.refresh()` has been and gone, and the page measures at
    // its full height.
    const frame = requestAnimationFrame(() => {
      st = ScrollTrigger.create({
        trigger,
        // Late on purpose. The section opens with a good deal of air above the
        // eyebrow, so its top crosses the viewport well before the clock is
        // what you are actually looking at — firing on first contact spends
        // the whole thing on an empty screen. At a third of the way up, the
        // digits are on their way in and the paper still has room above them
        // for the cannons to throw into.
        start: 'top 35%',
        once: true,
        onEnter: volley,
      })
    })

    return () => {
      cancelAnimationFrame(frame)
      // Built outside the callback, so gsap's own context is not tracking it
      // and this kill is the only one there will be.
      st?.kill()
      // Clears the canvas and drops any particles still in flight, so a fast
      // unmount cannot leave them animating against a detached element.
      fire.reset()
    }
  }, [locked])

  return (
    <canvas
      ref={canvas}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-50 h-full w-full"
    />
  )
}
