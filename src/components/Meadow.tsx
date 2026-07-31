'use client'

import Image from 'next/image'
import type { Phase } from './eventPhase'

/**
 * The meadow along the bottom edge of whichever section ends the page.
 *
 * Lifted out of the countdown when the countdown stopped being the last
 * section. It belongs to the page's ending rather than to the clock, and now
 * that those are two different sections it needs to be a thing either can
 * carry.
 *
 * The artwork is line work on solid white, so `multiply` is what makes it sit
 * on the page: white multiplied by the background *is* the background, so the
 * paper shows straight through and only the drawn lines survive. No cut-out
 * needed.
 *
 * The top is masked rather than covered with a gradient the colour of the
 * page. Same look, but it keeps working if the background ever changes — and
 * a cream gradient laid over a multiplying layer would have multiplied too,
 * and dirtied the fade.
 *
 * The section that hosts this needs `position: relative`, `overflow: hidden`,
 * and enough bottom padding to clear the flowers.
 */

/**
 * Before and after.
 *
 * The artwork is greyscale, so the warmth is entirely in the filter — which
 * means the flush on the day itself is a change of filter and nothing else.
 * `dim` is the everyday setting: a sepia that takes the blue off the scan and
 * lifts the ground a little. `bloom` pushes the same line work rosier and a
 * good deal richer, and it is what the page wears from midnight on the day
 * onward. The transition is slow enough that nobody watches it happen; the
 * page is simply warmer than it was last week.
 */
const MEADOW = {
  dim: 'sepia(0.62) saturate(1.35) hue-rotate(3deg) brightness(0.99)',
  bloom: 'sepia(0.78) saturate(2.5) hue-rotate(-13deg) brightness(1.02)',
}

export function Meadow({ phase }: { phase: Phase }) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 bottom-0 select-none"
      style={{
        maskImage: 'linear-gradient(to top, black 32%, transparent 92%)',
        WebkitMaskImage: 'linear-gradient(to top, black 32%, transparent 92%)',
      }}
    >
      <Image
        src="/flowers.webp"
        alt=""
        width={2400}
        height={1326}
        sizes="100vw"
        className="w-full mix-blend-multiply"
        style={{
          filter: phase === 'before' ? MEADOW.dim : MEADOW.bloom,
          transition: 'filter 2.6s ease',
        }}
      />
    </div>
  )
}
