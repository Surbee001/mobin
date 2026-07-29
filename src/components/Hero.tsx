/**
 * The hero.
 *
 * The card arrives from the envelope and stays: it *is* the hero, filling the
 * viewport edge to edge. Nothing here moves on scroll — the wrapper is simply
 * tall enough to keep the sticky pane pinned while the aya panel climbs up
 * over the top of it. The olive does all the moving; the card does none.
 *
 * The slot is authored at the size the card lands at — the largest it can be
 * while still keeping its own proportions and staying wholly on screen — and
 * Opening.tsx expands it the rest of the way to the full pane once the card
 * is in. Doing it in that order is what keeps the arrival undistorted: Flip
 * scales the card into a box of exactly its own aspect ratio, and only then
 * does the box change shape.
 *
 * The widths below are that fit, worked out in CSS rather than measured: a
 * 5:7 card fits a viewport of height H at 100dvh/1.4 = 71.43dvh wide, a 7:5
 * one at 140dvh — capped at the full width, for when width is the tighter of
 * the two.
 */

/** Total scroll length of the hero, in viewport heights: one to hold the card
 *  still, one for the aya to climb over it. */
const WRAP_VH = 2

export function Hero() {
  return (
    <div className="relative z-0" style={{ height: `${WRAP_VH * 100}dvh` }}>
      <div className="sticky top-0 flex h-[100dvh] items-center justify-center overflow-hidden">
        {/* The landing pad for the card. It carries the card's aspect ratio
            itself so it still has a measurable box while the card is away
            inside the envelope — otherwise there is nothing for Flip to
            land in. */}
        <div
          id="hero-slot"
          className="card-hero aspect-[5/7] w-[min(100%,71.43dvh)] min-[900px]:aspect-[7/5] min-[900px]:w-[min(100%,140dvh)]"
        />
      </div>
    </div>
  )
}
