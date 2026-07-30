'use client'

import { createContext, useContext, useEffect, useRef, useState } from 'react'
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

type ScrollApi = {
  /** True until the envelope has been opened. */
  locked: boolean
  /** Called once the card has finished becoming the hero. */
  unlock: () => void
}

const ScrollContext = createContext<ScrollApi>({ locked: true, unlock: () => {} })

export const useScroll = () => useContext(ScrollContext)

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const [locked, setLocked] = useState(true)
  const lenisRef = useRef<Lenis | null>(null)

  useEffect(() => {
    // Browsers restore the previous scroll position on a reload, and Next
    // restores it on a back-navigation. Either one lands a returning guest
    // part-way down the page — so when the envelope opens, the card is handed
    // over to a hero that has already been scrolled past, and the whole
    // sequence starts in the middle of itself.
    //
    // Taking manual control has to happen before the first paint's scroll is
    // applied, and the reset has to be `instant`: a smooth scroll here would
    // still be travelling when Lenis takes over.
    const previous = history.scrollRestoration
    history.scrollRestoration = 'manual'
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })

    const lenis = new Lenis({
      duration: 1.4,
      // A long, flat tail — the page keeps gliding after the finger lifts.
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      touchMultiplier: 1.6,
      wheelMultiplier: 0.9,
    })
    lenisRef.current = lenis
    lenis.stop()

    // One clock for both, so ScrollTrigger never reads a stale scroll position.
    lenis.on('scroll', ScrollTrigger.update)
    const tick = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    // Lenis keeps its own idea of where the page is, so the DOM reset above
    // is not enough on its own — without this it starts from the restored
    // offset and snaps back to it on the first wheel event.
    lenis.scrollTo(0, { immediate: true, force: true })

    return () => {
      gsap.ticker.remove(tick)
      lenis.destroy()
      lenisRef.current = null
      history.scrollRestoration = previous
    }
  }, [])

  // Hold the page still behind the sealed envelope.
  useEffect(() => {
    document.body.dataset.locked = String(locked)

    // While the envelope is sealed the page belongs at the top, and it has to
    // be *held* there rather than simply put there once. Next re-asserts its
    // own scroll restoration after hydration — flipping
    // `history.scrollRestoration` back to `auto` and reapplying the offset the
    // guest left on — which lands well after any one-shot reset in an effect.
    // Snapping back on every scroll event wins that race whatever order it
    // happens in, and costs nothing: the listener only exists while locked,
    // and while locked nothing is supposed to be scrolling anyway.
    if (locked) {
      const top = () => {
        if (window.scrollY !== 0) window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
      }
      top()
      window.addEventListener('scroll', top, { passive: true })
      lenisRef.current?.stop()
      return () => window.removeEventListener('scroll', top)
    }

    lenisRef.current?.start()
    // The page just grew from one viewport to full height, and BOTH of these
    // cache what they measured. Lenis especially: while the envelope was
    // sealed the document element was clamped to 100dvh, so it recorded a
    // scrollable height of one screen — leave it at that and the page simply
    // refuses to move, silently, with no error anywhere.
    lenisRef.current?.resize()
    ScrollTrigger.refresh()
  }, [locked])

  return (
    <ScrollContext.Provider value={{ locked, unlock: () => setLocked(false) }}>
      {children}
    </ScrollContext.Provider>
  )
}
