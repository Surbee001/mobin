'use client'

import { useRef } from 'react'
import confetti from 'canvas-confetti'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger, useGSAP)

/**
 * Two cannons at the edges of the screen, fired once when the closing
 * section comes into view.
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

  useGSAP(() => {
    const el = canvas.current
    if (!el) return

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

    const st = ScrollTrigger.create({
      trigger,
      // Late on purpose. The closing section is tall, so its top crosses the
      // viewport well before the clock is what you are actually looking at —
      // firing on first contact spends the whole thing while the map is still
      // on screen.
      start: 'top 40%',
      once: true,
      onEnter: volley,
    })

    return () => {
      st.kill()
      // Clears the canvas and drops any particles still in flight, so a fast
      // unmount cannot leave them animating against a detached element.
      fire.reset()
    }
  })

  return (
    <canvas
      ref={canvas}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-50 h-full w-full"
    />
  )
}
