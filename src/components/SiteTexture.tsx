'use client'

import { useScroll } from './SmoothScroll'

/**
 * The page's ground: a faint pink wash with a plaster garden relief pressed
 * into it.
 *
 * Rendered INSIDE the sections that want it, not once around the whole page.
 * A section paints its own background beneath every one of its children, so a
 * global layer behind them is simply covered; and stripping those backgrounds
 * to uncover it breaks anything inside them that blends, which is how the
 * meadow lost its `multiply` the first time this was tried. As a child it
 * sits above the section's paper and below its content, which is exactly
 * where a texture belongs.
 *
 * `absolute`, NOT `fixed`. More than one section renders this, and a fixed
 * layer covers the whole viewport permanently — so the copy belonging to the
 * last section painted straight over the one before it, from off screen. The
 * clock lost almost all its contrast to a texture that was nominally sitting
 * behind a different section entirely. Absolute keeps each copy inside the
 * section that owns it.
 *
 * Two layers, and they do different jobs:
 *
 *  - The WASH is a flat pink at low opacity. This is where "slightly pink"
 *    actually comes from. The relief alone could not do it: soft-light works
 *    from the colour beneath, so on a cream page it returns cream — lighter
 *    cream and darker cream — and never pink, whatever is done to the plate.
 *
 *  - The RELIEF is the plate, high-passed so its empty field sits on a true
 *    neutral, blended with `soft-light`. Below mid-grey it darkens what is
 *    under it, above it lightens; where the plate is blank it does neither,
 *    which is what keeps the open middle of the page perfectly clean.
 *
 * Only after the card. The envelope and the hero want plain paper under them
 * — the card is the object, and a garden behind it is competition. It fades
 * in once the envelope has been opened, by which point the card fills the
 * screen and is covering this anyway, so the first anyone sees of it is when
 * they scroll past the hero.
 */
export function SiteTexture() {
  const { locked } = useScroll()

  return (
    <div
      aria-hidden="true"
      // NEGATIVE z-index, and it has to be negative. Within a stacking context
      // the paint order is: the element's own background, then descendants
      // with a negative z-index, then in-flow content, then positioned
      // descendants at auto/0. Most of the text in these sections is
      // `position: static`, so it paints in that middle band — a texture at
      // z-0 is positioned and lands ABOVE it, which is exactly what happened:
      // the clock all but vanished under the plaster. At -1 the texture sits
      // above the section's paper and below every one of its children, with
      // nothing else needing to know it is there.
      className="pointer-events-none absolute inset-0 -z-10 select-none"
      style={{ opacity: locked ? 0 : 1, transition: 'opacity 1.6s ease 0.2s' }}
    >
      <div className="absolute inset-0 bg-texture-wash opacity-60" />

      <div
        className="absolute inset-0 mix-blend-soft-light"
        style={{
          backgroundImage: 'url(/garden-relief.webp)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: 0.7,
        }}
      />
    </div>
  )
}
