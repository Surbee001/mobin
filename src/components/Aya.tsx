'use client'

import { useRef } from 'react'
import { gsap } from 'gsap'
import { site } from '@/site.config'
import { useWordReveal } from './useWordReveal'

/** Resolved from the stylesheet at run time, so there is one source. */
const DIM = '--color-verse-dim'
const LIT = '--color-verse-ink'

/**
 * The verse, on its own sage panel.
 *
 * PANEL_VH breaks down as: one viewport for the pane itself, REVEAL_VH for
 * the words to resolve, and one more viewport for the *next* panel to climb
 * up over this one — a climb always costs exactly one viewport, because that
 * is how far the incoming section travels from the bottom edge to the top.
 * The pane stays pinned throughout, so this panel sits perfectly still while
 * the next one covers it.
 *
 * Every word of it can be touched, and answers with what it means in Persian
 * on the line below. See `wireGlosses`.
 */
const PANEL_VH = 2.45
const REVEAL_VH = 0.45

/**
 * Make the verse's words answerable.
 *
 * Runs the instant SplitText has cut the panel into words, and undoes itself
 * before they are put back. Everything here is done to the DOM directly and
 * nothing is held in React state: the words belong to SplitText, and the
 * colour of each one belongs to a scrubbed tween. A re-render in the middle
 * of that would be a re-render of nodes neither of them expects to change
 * hands — so the gloss is written into its line with `textContent`, the same
 * way the card is moved by hand rather than by props.
 *
 * The words carry no button role and take no tab stop. Twenty-one of them
 * would turn one continuous passage into twenty-one controls for anyone
 * listening to the page rather than looking at it, and the verse itself — the
 * thing that actually matters here — would be the part that got harder to
 * read. This is a reward for touching the screen; it is not the invitation.
 */
function wireGlosses(words: HTMLElement[], root: HTMLElement | null, line: HTMLElement | null) {
  const verse = root?.querySelector<HTMLElement>('[data-verse]')
  if (!verse || !line) return

  // The split covers the reference line as well; only the verse is glossed.
  const own = words.filter((w) => verse.contains(w))

  // Position is the whole of the mapping, so a miscount is not a missing
  // gloss — it is every gloss after the error sitting on the wrong word.
  // Better to hand back a verse that does nothing than one that lies.
  if (own.length !== site.aya.gloss.length) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        `Aya: ${own.length} words split, ${site.aya.gloss.length} glosses in site.config — ` +
          'the two must match one to one. Touching the verse is off until they do.',
      )
    }
    return
  }

  own.forEach((word, i) => {
    const gloss = site.aya.gloss[i]
    // The pause mark has nothing to say, and should not look as though it has.
    if (!gloss) return
    word.dataset.gloss = gloss
    word.classList.add('word-touch')
  })

  let open: HTMLElement | null = null

  const show = (word: HTMLElement) => {
    const gloss = word.dataset.gloss
    if (!gloss || word === open) return

    open?.classList.remove('word-open')
    word.classList.add('word-open')
    open = word

    // Out, then in — never a crossfade. Two readings legible at once on a
    // single line is the one thing this cannot do.
    gsap.to(line, {
      opacity: 0,
      duration: 0.16,
      ease: 'power1.in',
      onComplete: () => {
        line.textContent = gloss
        gsap.to(line, { opacity: 1, duration: 0.32, ease: 'power2.out' })
      },
    })
  }

  const onClick = (e: Event) => {
    const word = (e.target as HTMLElement | null)?.closest<HTMLElement>('[data-gloss]')
    if (word) show(word)
  }

  verse.addEventListener('click', onClick)

  return () => {
    verse.removeEventListener('click', onClick)
    gsap.killTweensOf(line)
  }
}

export function Aya() {
  const scope = useRef<HTMLElement>(null)
  const line = useRef<HTMLSpanElement>(null)

  useWordReveal({
    scope,
    dim: DIM,
    lit: LIT,
    revealVh: REVEAL_VH,
    onSplit: (words) => wireGlosses(words, scope.current, line.current),
  })

  return (
    <section
      ref={scope}
      // -mt-[100dvh] is what makes it climb over the hero instead of
      // following it.
      className="relative z-10 -mt-[100dvh] bg-panel-verse"
      style={{ height: `${PANEL_VH * 100}dvh` }}
      aria-label={site.aya.reference}
    >
      <div className="sticky top-0 flex h-[100dvh] items-center justify-center overflow-hidden px-6 sm:px-10">
        <div className="mx-auto w-full max-w-5xl text-center">
          <p
            data-verse
            data-reveal-text
            dir="rtl"
            lang="ar"
            className="font-arabic text-balance leading-[2.05]"
            style={{ fontSize: 'clamp(1.7rem, 4.4vw, 3.1rem)' }}
          >
            {site.aya.arabic}
          </p>

          <span
            data-reveal-text
            dir="rtl"
            lang="fa"
            className="mt-12 block font-persian text-base font-light sm:mt-16"
          >
            {site.aya.reference}
          </span>

          {/* The answering line. Deliberately outside [data-reveal-text] — it
              is not part of the verse and must not dim with it, or the hint
              would stay invisible until the panel had been scrolled all the
              way through, by which point the hint has missed its moment.

              Its height is reserved for one line so the block never shifts as
              glosses of different lengths come and go, and it is the one
              element on the page React writes once and then leaves alone. */}
          <span
            ref={line}
            dir="rtl"
            lang="fa"
            aria-live="polite"
            className="mx-auto mt-6 block min-h-[1.9em] max-w-md font-persian text-lg font-light text-verse-ink/50 sm:mt-8 sm:text-xl"
          >
            {site.aya.glossPrompt}
          </span>
        </div>
      </div>
    </section>
  )
}
