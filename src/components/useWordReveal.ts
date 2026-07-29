'use client'

import type { RefObject } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP)

type Options = {
  /** The panel section. Doubles as the ScrollTrigger trigger and GSAP scope. */
  scope: RefObject<HTMLElement | null>
  /**
   * CSS custom properties, not literals — e.g. `--color-verse-dim`. Resolved
   * against the document when the split runs, so these track the stylesheet
   * (and the theme editor) instead of being a second copy of it that drifts.
   */
  dim: string
  /** Colour after. */
  lit: string
  /**
   * Scroll distance the reveal runs over, in viewport heights, measured from
   * the moment the panel lands square in the viewport. Keep this well short
   * of the panel's pinned range: the text must finish resolving with room to
   * spare, not on the frame it starts leaving the screen.
   */
  revealVh?: number
  /**
   * Handed the split words the moment they exist, before anything animates.
   * Return a teardown and it runs before the split is reverted.
   *
   * This is the only safe place to reach for the word elements: they do not
   * exist until SplitText has run, and they stop existing the instant it is
   * reverted. Anything wired to them from outside would be holding nodes that
   * are about to be thrown away.
   */
  onSplit?: (words: HTMLElement[]) => (() => void) | void
}

/**
 * Resolves every `[data-reveal-text]` inside the panel from `dim` to `lit`,
 * word by word, as the panel is scrolled through. Elements resolve in
 * document order, so the reading order is the reveal order.
 *
 * Split by *word*, never by character: Arabic and Persian letters change
 * shape depending on their neighbours, so cutting inside a word breaks the
 * joins and the script falls apart.
 */
export function useWordReveal({ scope, dim, lit, revealVh = 0.45, onSplit }: Options) {
  useGSAP(
    () => {
      const root = scope.current
      if (!root) return

      const els = Array.from(root.querySelectorAll<HTMLElement>('[data-reveal-text]'))
      if (!els.length) return

      // GSAP tweens to a concrete colour, so the tokens are read once here.
      // That means a live theme change lands on the next reload, not instantly.
      const cs = getComputedStyle(document.documentElement)
      const resolve = (v: string) => (v.startsWith('--') ? cs.getPropertyValue(v).trim() : v)
      const from = resolve(dim)
      const to = resolve(lit)

      const split = SplitText.create(els, { type: 'words', wordsClass: 'reveal-word' })
      gsap.set(split.words, { color: from })

      const teardown = onSplit?.(split.words as HTMLElement[])

      const tween = gsap.to(split.words, {
        color: to,
        ease: 'none',
        stagger: { each: 0.03 },
        scrollTrigger: {
          trigger: root,
          start: 'top top',
          end: () => '+=' + window.innerHeight * revealVh,
          scrub: 0.4,
          invalidateOnRefresh: true,
        },
      })

      return () => {
        teardown?.()
        tween.scrollTrigger?.kill()
        split.revert()
      }
    },
    { scope },
  )
}
