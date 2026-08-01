'use client'

import { useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { SpeakerSimpleHigh, SpeakerSimpleSlash } from '@phosphor-icons/react'
import { useScroll } from './SmoothScroll'
import { afterVoice } from './voiceGate'

gsap.registerPlugin(ScrollTrigger, useGSAP)

/** Where it settles. Background, not foreground. */
const VOLUME = 0.32
/** Long enough that it arrives rather than starts. */
const FADE_IN = 2.4

/**
 * The music.
 *
 * Starts when the Persian invitation comes into view, then loops.
 *
 * The whole difficulty is autoplay policy: a browser will not let a page make
 * sound until the guest has interacted with it, and by the time the
 * invitation panel is reached there has been no click for several seconds —
 * so calling `play()` there, cold, is rejected.
 *
 * What rescues it is that opening the envelope IS a gesture. The moment the
 * seal is tapped the element is primed — played muted for an instant and
 * paused again — which is enough to satisfy the policy. From then on the page
 * is allowed to start it whenever it likes, and the panel trigger works.
 *
 * If priming fails anyway (an unusually strict setting), the toggle in the
 * corner is a real click and will always work.
 */
export function Music() {
  const el = useRef<HTMLAudioElement>(null)
  const primed = useRef(false)
  const started = useRef(false)
  const [muted, setMuted] = useState(false)
  const [audible, setAudible] = useState(false)
  const { locked } = useScroll()

  // Prime on the gesture that opens the envelope — see the note above.
  useGSAP(
    () => {
      const audio = el.current
      if (!audio || locked || primed.current) return
      primed.current = true

      audio.muted = true
      audio
        .play()
        .then(() => {
          audio.pause()
          audio.currentTime = 0
          audio.muted = false
        })
        .catch(() => {
          // Nothing to do — the toggle is still there.
          audio.muted = false
        })
    },
    { dependencies: [locked] },
  )

  useGSAP(() => {
    const audio = el.current
    if (!audio) return

    const st = ScrollTrigger.create({
      trigger: '#invitation',
      start: 'top 60%',
      once: true,
      onEnter: () => {
        if (started.current || muted) return
        started.current = true

        // Held until the recitation on the panel above has finished. Reaching
        // the invitation is what schedules the music, not what starts it —
        // see voiceGate.ts.
        afterVoice(() => {
          if (muted) {
            started.current = false
            return
          }
          audio.volume = 0
          audio
            .play()
            .then(() => {
              setAudible(true)
              gsap.to(audio, { volume: VOLUME, duration: FADE_IN, ease: 'power1.inOut' })
            })
            .catch(() => {
              // Blocked after all. Let the toggle offer it instead.
              started.current = false
            })
        })
      },
    })

    return () => st.kill()
  })

  const toggle = () => {
    const audio = el.current
    if (!audio) return

    if (audio.paused) {
      audio.volume = 0
      audio.play().then(() => {
        setMuted(false)
        setAudible(true)
        started.current = true
        gsap.to(audio, { volume: VOLUME, duration: 0.8 })
      })
      return
    }

    gsap.to(audio, {
      volume: 0,
      duration: 0.5,
      onComplete: () => {
        audio.pause()
        setAudible(false)
      },
    })
    setMuted(true)
  }

  return (
    <>
      {/* `loop` is the whole ask: it plays under the rest of the page from the
          invitation onward. Not preloaded — nothing should be spent on it
          until the envelope has actually been opened. */}
      <audio ref={el} src="/music.mp3" loop preload="none" />

      {/* Only offered once the envelope is open. There is nothing to control
          before that, and a mute button on the sealed envelope would be a
          promise of sound that has not arrived yet. */}
      {!locked && (
        <button
          type="button"
          onClick={toggle}
          aria-label={audible ? 'قطع موسیقی' : 'پخش موسیقی'}
          aria-pressed={audible}
          className="fixed bottom-5 left-5 z-50 grid h-10 w-10 place-items-center rounded-full text-ink-soft transition-opacity hover:opacity-100"
          style={{ opacity: audible ? 0.55 : 0.35 }}
        >
          {audible ? (
            <SpeakerSimpleHigh size={19} weight="light" />
          ) : (
            <SpeakerSimpleSlash size={19} weight="light" />
          )}
        </button>
      )}
    </>
  )
}
