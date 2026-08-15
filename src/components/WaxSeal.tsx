'use client'

import Image from 'next/image'

/**
 * The wax seal.
 *
 * A photograph on a white field, dropped with `mix-blend-mode: darken`.
 *
 * Darken takes the darker of the two layers per channel, which is exactly the
 * operation wanted here. The white ground (254,254,254) is lighter than the
 * blush envelope, so the envelope wins and the white vanishes. The seal's face
 * (around 136,92,67) is darker, so the seal wins and comes through at the
 * value it was photographed at.
 *
 * Not `screen`, which lightens — white screened against anything stays white,
 * and the seal would arrive as a white square. That one drops BLACK grounds.
 * Not `multiply` either: it can only darken, so it would drag this seal's
 * mid-tone gold down to roughly 118,68,46, a muddy brown.
 *
 * The only thing darken costs is the few specular pixels brighter than the
 * paper, which clip to the paper — which reads as a highlight blowing out
 * into the page, so it is no loss.
 *
 * The blend itself is applied by the CALLER, not here. An element blends with
 * the backdrop of its own stacking context, and the button this sits inside
 * creates one (it is positioned, with a z-index) — so a `mix-blend-darken` on
 * this image would find nothing behind it but the button's empty box and do
 * precisely nothing. It has to go on the button, where the envelope is
 * genuinely the backdrop.
 *
 * No CSS shadow. The photograph was shot with its own, and a drop-shadow on
 * top of it reads as two shadows from two different lights. That does mean
 * this is the one element on the page that no longer swings with
 * `--light-x` / `--light-y` — its light is fixed at whatever the camera saw.
 *
 * Geometry note: unlike the SVG this replaced, the artwork fills its box edge
 * to edge. The caller sizes the box to the seal itself, with no slack to
 * allow for.
 *
 * ── `sizes`, and why it is not optional here ──
 *
 * Without it, Next has nothing to go on but the `width` prop and builds a
 * srcset of 1080w at 1x and 2048w at 2x. This seal is 24% of an envelope that
 * is at most 440px wide on a phone — about a hundred CSS pixels — so every
 * guest was fetching a 149KB plate to draw it at 105px, and fetching it
 * FIRST, because `priority` puts it at the head of the queue ahead of
 * everything else the first screen needs.
 *
 * The two figures are the widths the button is given in Opening.tsx, 24vw
 * below the envelope's 900px switch and 19vw above it, so what is asked for
 * is what is drawn. A phone at 3× now lands on the 384w cut: 27KB.
 *
 * `priority` stays, and belongs: this is the only thing on the first screen a
 * guest can act on, and a seal that arrives late is a page with nothing to
 * press. It is the SIZE that was wrong, not the urgency.
 */
export function WaxSeal({ className = '' }: { className?: string }) {
  return (
    <Image
      src="/seal-swans.webp"
      alt=""
      width={1000}
      height={1000}
      sizes="(max-width: 899px) 24vw, 19vw"
      priority
      className={className}
    />
  )
}
