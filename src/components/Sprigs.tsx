'use client'

import Image from 'next/image'
import { MEADOW, MEADOW_FADE } from './Meadow'
import type { Phase } from './eventPhase'

/**
 * A pair of peonies standing either side of the date.
 *
 * Built to the same recipe as the meadow along the foot of the page — the
 * same line work, the same `multiply` that lets the paper print through it,
 * and the same two filters that warm on the day itself. The filters are
 * imported rather than restated so that when the page's warmth is retuned,
 * the flowers beside the date cannot drift away from the flowers at its foot.
 *
 * Two things here are NOT like the meadow, and both are forced.
 *
 * ── The bottom edge ──
 *
 * The meadow is a full-width band that runs off the page and never has to
 * end. These are two cut plants standing in the middle of it, and a stem that
 * stops has to stop convincingly: cut square it reads as a sticker, a stalk
 * severed in mid-air with a ruler.
 *
 * So the stems are not cut, they are dissolved — a mask takes the artwork
 * from opaque to nothing across its lower half and the stems thin out into
 * the paper. Nothing is trimmed off the plate to achieve it: the blooms, the
 * leaves and the full length of the stems are all in the file, and the mask
 * alone decides how much of the descent survives. Move the stops in
 * `DISSOLVE` and the flowers stand taller or shorter without the artwork
 * being touched.
 *
 * A mask and not a gradient the colour of the page, for the reason the meadow
 * gives: a cream gradient laid on top would itself be multiplied, and would
 * dirty the fade rather than clear it.
 *
 * ── Why the mask is on a wrapper and the blend is not ──
 *
 * These two used to ride on the same <img>, on the theory that a wrapper
 * carrying the mask would form a stacking context and seal the multiply
 * inside it. The meadow disproves that theory in the same page: its plate has
 * no alpha at all — line work on solid white — and it is masked by a wrapper
 * and multiplied on the image within, and the white drops out exactly as it
 * should. The blend reaches the paper through the wrapper.
 *
 * What mask-and-blend on one element DOES do is put the element on a
 * compositing path some engines flatten onto an opaque backing before
 * blending. The source alpha is lost on the way, the plate's transparent
 * ground comes back as the white it is stored as, the warm filter below tints
 * that white, and multiply prints the result over the page: a yellow rectangle
 * with four visible edges where two flowers should be.
 *
 * So the layers are split the way the meadow splits them — the wrapper takes
 * the position, the offset, the mirror and the mask; the image takes the
 * filter, the blend and the opacity. And the split is safe in the direction it
 * can fail: if an engine ever DOES isolate the wrapper, multiply against an
 * empty backdrop returns the source unchanged, so the worst case is the
 * flowers printing a shade lighter than intended. The plate is a cut-out, and
 * a cut-out needs no blend to sit on paper — the multiply is only here to sink
 * the ink into it.
 *
 * ── And why the plate carries alpha ──
 *
 * The meadow's artwork is line work on solid white, which `multiply` disposes
 * of because white multiplied by anything is that thing. That holds only
 * while the white is exactly white, and the filters above do not leave it
 * there: `sepia` alone tints white to (255,255,245) and `brightness(0.99)`
 * takes all three channels down again. Multiplied, that near-white prints a
 * faint warm rectangle over the paper.
 *
 * On the meadow it is invisible, because the meadow spans the full width and
 * a tint with no edge in view is just the page being slightly warmer. These
 * are narrow plates standing beside type, where the same tint has four edges
 * and reads immediately as a pasted-on box.
 *
 * So peonies-sprig.webp is cut out — alpha, not white, everywhere the paper
 * should show. The multiply below is then doing only what it is good for,
 * printing the ink into the paper, and there is no background left to leak.
 */

/**
 * Where the dissolve happens, as a share of the plate's height.
 *
 * The plate runs blooms → leaves → bare stems, top to bottom: the blooms sit
 * in roughly the top 46%, the leaves reach about 71%, and everything below is
 * stem. So the fade is held off until 52% — past the last petal — and is
 * complete by 94%, which spends the whole of the bare stem on the transition
 * and leaves no visible end to it.
 */
const DISSOLVE = 'linear-gradient(to bottom, black 52%, transparent 94%)'

/**
 * Where each plant stands.
 *
 * The horizontal offsets are the load-bearing part, and they are most of the
 * plate's own width — deliberately. These flank a centred block of Persian
 * that is nearly the full width of a phone, so there is no clear margin to
 * stand them in. Pushing them mostly out of frame is what makes it work: what
 * stays in view is one bloom and the stems beneath it, entering from the
 * edge, rather than a whole bouquet sitting behind the words. The section
 * clips whatever crosses the viewport edge, so the harder the push the less
 * there is to see. A phone gets the harder one — the text reaches closer to
 * the edge there, and the flowers give way to it.
 *
 * The mirror is what stops the two sides being the same drawing twice: each
 * leans away from the date it stands beside. Tailwind composes its transform
 * as translate-then-scale and CSS applies those right to left, so the flip
 * happens about the plate's own centre and the offset that follows is
 * unaffected by it — which is the order this needs.
 *
 * `-translate-y-[6%]` is a share of the plate's own HEIGHT, which is why the
 * lift is a transform rather than `top` or a negative margin: those resolve
 * their percentages against the parent instead — against its height and its
 * width respectively — and the parent here is a block of text whose size
 * moves with the viewport.
 *
 * Physical `left`/`right`, not logical start/end. The section is RTL, so
 * those two are the only names that mean the same thing in the code as they
 * do in the design.
 */
const SIDE = {
  start: 'left-0 -translate-x-[56%] -translate-y-[6%] sm:-translate-x-[42%]',
  end: 'right-0 translate-x-[56%] -translate-y-[6%] scale-x-[-1] sm:translate-x-[42%]',
}

function Sprig({ phase, side }: { phase: Phase; side: keyof typeof SIDE }) {
  return (
    // z-0 and first in the block: an absolutely positioned box paints over
    // static siblings whatever the source order, so the date's own lines
    // each carry `relative z-10` to stay in front of the flowers.
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute top-0 z-0 w-[38vw] max-w-[280px] select-none sm:w-[22vw] ${SIDE[side]}`}
      style={{ maskImage: DISSOLVE, WebkitMaskImage: DISSOLVE }}
    >
      <Image
        src="/peonies-sprig.webp"
        alt=""
        width={900}
        height={1199}
        sizes="(max-width: 640px) 38vw, 22vw"
        className="h-auto w-full mix-blend-multiply"
        style={{
          filter: phase === 'before' ? MEADOW.dim : MEADOW.bloom,
          transition: MEADOW_FADE,
          // Line this fine reads heavier beside type than it does as a band
          // under it. Held just off full so the date stays the loudest thing in
          // the block.
          opacity: 0.85,
        }}
      />
    </div>
  )
}

export function Sprigs({ phase }: { phase: Phase }) {
  return (
    <>
      <Sprig phase={phase} side="start" />
      <Sprig phase={phase} side="end" />
    </>
  )
}
