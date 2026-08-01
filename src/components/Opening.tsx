'use client'

import { memo, useRef } from 'react'
import { gsap } from 'gsap'
import { Flip } from 'gsap/Flip'
import { useGSAP } from '@gsap/react'
import { Card } from './Card'
import { CardFramed } from './CardFramed'
import { CardMonogram } from './CardMonogram'
import { CardVerse } from './CardVerse'
import { CARD_LANDED } from './NameLines'
import { WaxSeal } from './WaxSeal'
import { useScroll } from './SmoothScroll'
import { site, type HeroDesign } from '@/site.config'

gsap.registerPlugin(Flip, useGSAP)

/**
 * React must never re-render the card — GSAP moves its DOM node by hand.
 *
 * Both are memoised here, at module load, and one of the two is picked per
 * render. Wrapping the chosen one in `memo()` inside the component would mint
 * a new component type on every render, and React unmounts and remounts a
 * subtree whose type changed — taking the card's DOM node with it, out from
 * under the Flip that is in the middle of moving it.
 */
const DESIGNS = {
  card: memo(Card),
  verse: memo(CardVerse),
  frame: memo(CardFramed),
  monogram: memo(CardMonogram),
} satisfies Record<HeroDesign, unknown>

/**
 * @param design which of the two the invitation is set in. Defaults to
 *   `site.design.hero`; /verse and /frame each pass their own, so the three
 *   can be looked at side by side without editing anything. All three are the
 *   same component shape, so the envelope, the Flip and the hero slot neither
 *   know nor care which is inside.
 */
export function Opening({ design = site.design.hero }: { design?: HeroDesign }) {
  const StableCard = DESIGNS[design]
  const scope = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const moved = useRef(false)
  const played = useRef(false)
  const tl = useRef<gsap.core.Timeline | null>(null)
  const { unlock } = useScroll()

  // The whole sequence is built once, paused, inside the effect — so the click
  // handler only has to press play, and nothing reads a ref during render.
  // Deliberately no React state anywhere in here: a re-render in the same tick
  // as the click is one more thing that can hitch the first frame.
  useGSAP(
    () => {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

      /** Lift the card out of the fixed stage and drop it into the hero. */
      const handoff = () => {
        const card = cardRef.current
        const slot = document.getElementById('hero-slot')
        if (!card || !slot || moved.current) return
        moved.current = true

        // Capture where the card is on screen *before* it moves.
        const state = Flip.getState(card)
        slot.appendChild(card)
        // Deliberately no clearProps: the card carries `container-type` via its
        // .card class, and GSAP only ever transformed the *holder*, not the card.

        // The stage is an opaque, full-screen sheet at z-50. The moment the card
        // leaves it, it has to go — or it covers the card it just handed over.
        gsap.set(scope.current, { display: 'none' })

        /** Everything is where it belongs; the card may start its own loop. */
        const landed = () => {
          unlock()
          window.dispatchEvent(new Event(CARD_LANDED))
        }

        /** Open the slot out to the whole pane, and let the card fill it. */
        const expand = () => {
          const pane = slot.parentElement
          if (reduced || !pane) {
            slot.dataset.hero = 'full'
            landed()
            return
          }
          // Real width and height, not a transform: the card's type is sized
          // in `cqw` off this box, so growing the box is what grows the type.
          // The step is a small one — the slot is already at the largest the
          // card could be while staying whole — so this is a handful of
          // reflows on six text nodes, not a scrubbed layout animation.
          gsap.to(slot, {
            width: pane.clientWidth,
            height: pane.clientHeight,
            duration: 0.7,
            ease: 'power2.inOut',
            onComplete: () => {
              // Hand the size back to CSS, so a later resize still works.
              slot.dataset.hero = 'full'
              gsap.set(slot, { clearProps: 'width,height' })
              landed()
            },
          })
        }

        Flip.from(state, {
          duration: reduced ? 0 : 1.05,
          ease: 'power3.inOut',
          scale: true,
          onComplete: expand,
        })
      }

      const timeline = gsap.timeline({
        paused: true,
        onStart: () => {
          // Kill the hit area the moment it starts, without a React re-render.
          if (scope.current) scope.current.style.pointerEvents = 'none'
        },
        onComplete: handoff,
      })

      if (reduced) {
        // Duration zero: playing it completes at once and hands straight off.
        timeline.set(
          ['[data-flap]', '[data-front]', '[data-back]', '[data-seal]'],
          { opacity: 0 },
        )
      } else {
        // Both measured as functions so they are read at play time, after any
        // resize or orientation change.
        //
        // A third of the card's own height: far enough to read as being drawn
        // out of the pocket, near enough that the top of it never leaves the
        // screen on a short viewport. It does not need to travel further — the
        // envelope is about to fall away underneath it, and the Flip into the
        // hero absorbs whatever offset is left.
        //
        // Clamped against the room actually above the card, because the
        // envelope is sized off its width alone: on a short, wide window it
        // already fills the height, and a third of the card on top of that
        // would post the names off the top of the screen.
        const lift = () => {
          const card = cardRef.current
          if (!card) return -160
          const room = card.getBoundingClientRect().top - window.innerHeight * 0.02
          return -Math.min(card.offsetHeight * 0.32, Math.max(0, room))
        }
        // Far enough that the envelope is gone even on a tall phone; it is
        // clipped by the stage, so this never makes the page scrollable.
        const drop = () => window.innerHeight * 1.15

        const FLAP_AT = 0.24
        const FLAP_DUR = 0.9

        timeline
          // The seal takes the strain, then gives.
          .to('[data-seal]', { scale: 1.06, duration: 0.18, ease: 'power2.out' }, 0)
          .to(
            '[data-seal]',
            { y: 26, rotate: -15, scale: 0.9, opacity: 0, duration: 0.46, ease: 'power2.in' },
            0.18,
          )
          // The flap falls back over the top edge. It stops just short of flat
          // so the fold keeps a little thickness instead of reading as a
          // perfectly flipped rectangle.
          .to('[data-flap]', { rotateX: -172, duration: FLAP_DUR, ease: 'power2.inOut' }, FLAP_AT)
          // Just past vertical it passes behind the envelope body — behind the
          // card too, so the card can slide out over it.
          .set('[data-flap]', { zIndex: 5 }, FLAP_AT + FLAP_DUR * 0.52)
          // The card draws itself out, overlapping the last of the fold.
          .to('[data-card-holder]', { y: lift, duration: 0.85, ease: 'power3.out' }, 0.9)
          // And the envelope drops out of the bottom of the screen. It falls,
          // it does not dissolve: accelerating ease, full opacity the whole way.
          // It starts while the card is still coming up, so the two read as one
          // move — the envelope leaving the card behind rather than two
          // separate events queued back to back.
          .to(
            ['[data-back]', '[data-front]', '[data-flap]'],
            { y: drop, duration: 0.78, ease: 'power2.in' },
            1.3,
          )
      }

      tl.current = timeline
    },
    { scope },
  )

  const open = () => {
    if (played.current) return
    played.current = true
    tl.current?.play()
  }

  return (
    <div
      ref={scope}
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-paper"
    >
      <div className="flex flex-col items-center">
        {/* ── The envelope ─────────────────────────────────────── */}
        {/* Portrait until 900px so it can hold the portrait card, landscape
            above. The widths are chosen so the card inside lands at ~334px
            below the switch and ~586px above it — comfortably either side of
            the card's own 560px container threshold, never on it.

            `--flap` is the depth of the flap, shared by the flap itself, the
            notch cut into the front pocket, and the seal sitting on the join;
            all three must stay in register at both orientations.

            The perspective lives HERE, on the flap's own parent, and nowhere
            else. Set it further up the tree and every element in between has
            to carry `preserve-3d` to pass it down — miss one and the browser
            flattens the whole subtree, at which point rotateX(-180°) renders
            as an orthographic squash: the flap collapses to a zero-height line
            at 90° and pops back at full size. Which looks exactly like the
            flap vanishing and reappearing, rather than opening. */}
        <div
          className="relative aspect-[5/7] w-[min(92vw,440px)] [--flap:34%] min-[900px]:aspect-[7/5] min-[900px]:w-[min(82vw,800px)] min-[900px]:[--flap:46%]"
          style={{ perspective: '1100px', perspectiveOrigin: '50% 25%' }}
        >
          {/* Inside back panel. */}
          <div data-back className="absolute inset-0 bg-blush" style={{ willChange: 'transform' }} />

          {/* The card, riding inside the pocket. */}
          <div
            data-card-holder
            className="absolute inset-x-[6%] bottom-[4%] z-10"
            style={{ willChange: 'transform' }}
          >
            <StableCard ref={cardRef} className="h-full w-full" />
          </div>

          {/* Front pocket — a rectangle with a chevron cut from its top edge. */}
          <div
            data-front
            className="absolute inset-0 z-20 overflow-hidden bg-blush-deep"
            style={{
              clipPath: 'polygon(0 0, 50% var(--flap), 100% 0, 100% 100%, 0 100%)',
              willChange: 'transform',
            }}
          >
            {/* The pattern, traced off the sheet in the envelope editor and
                built in from what it copied out. It rides INSIDE the pocket,
                so it inherits the chevron clip and travels with it when the
                envelope opens — same sheet of paper. */}
            <div className="pocket-pattern" aria-hidden="true" />
          </div>

          {/* The flap, hinged on the top edge — two-sided, so that folding it
              back shows the pale inside of the envelope rather than the same
              face mirrored. Both faces hide their own backs, so exactly one of
              them is ever painted. */}
          <div
            data-flap
            className="absolute inset-x-0 top-0 z-30 h-[var(--flap)]"
            style={{
              transformOrigin: 'top center',
              transformStyle: 'preserve-3d',
              willChange: 'transform',
            }}
          >
            <div
              data-flap-out
              className="absolute inset-0 bg-blush-mid"
              style={{
                clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
                backfaceVisibility: 'hidden',
              }}
            />
            {/* Mirrored clip: this face is turned over, so the triangle has to
                be authored upside down to land pointing down on screen. */}
            <div
              data-flap-in
              className="absolute inset-0 bg-blush"
              style={{
                clipPath: 'polygon(0 100%, 100% 100%, 50% 0)',
                transform: 'rotateX(180deg)',
                backfaceVisibility: 'hidden',
              }}
            />
          </div>

          {/* The wax seal, holding the flap to the pocket. Square, and sized off
              the width alone — a percentage height would turn it into an
              ellipse the moment the envelope goes portrait.

              These are smaller than they were for the SVG seal. That one only
              painted the middle ~⅔ of its own viewBox and the box was widened
              to compensate; the photograph fills its box edge to edge, so the
              box is now the seal. Padding on the button keeps the tap target
              the size it was without inflating the artwork.

              `mix-blend-darken` lives HERE rather than on the image, and it
              has to: the seal photograph is on a white ground, and darken is
              what drops it — but an element blends with the backdrop of its
              own stacking context, and this button is one. Put the blend on
              the image inside and it finds only the button's empty box behind
              it and does nothing at all. */}
          <button
            data-seal
            type="button"
            onClick={open}
            aria-label={site.opening.promptEn}
            className="absolute left-1/2 top-[var(--flap)] z-40 block aspect-square w-[24%] -translate-x-1/2 -translate-y-1/2 cursor-pointer p-[2.5%] mix-blend-darken min-[900px]:w-[19%]"
            style={{ willChange: 'transform' }}
          >
            <WaxSeal className="block h-full w-full" />
          </button>
        </div>

      </div>
    </div>
  )
}
