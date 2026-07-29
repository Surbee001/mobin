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

    return () => {
      gsap.ticker.remove(tick)
      lenis.destroy()
      lenisRef.current = null
    }
  }, [])

  // Hold the page still behind the sealed envelope.
  useEffect(() => {
    document.body.dataset.locked = String(locked)
    if (locked) lenisRef.current?.stop()
    else {
      lenisRef.current?.start()
      // The page just grew from one viewport to full height.
      ScrollTrigger.refresh()
    }
  }, [locked])

  return (
    <ScrollContext.Provider value={{ locked, unlock: () => setLocked(false) }}>
      {children}
    </ScrollContext.Provider>
  )
}
