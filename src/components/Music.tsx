'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { SpeakerSimpleHigh, SpeakerSimpleSlash } from '@phosphor-icons/react'
import { useScroll } from './SmoothScroll'
import { prime, setLevel } from './audioLevel'
import { whenOpened } from './envelopeGate'
import { afterVoice } from './voiceGate'

/**
 * Where it settles. Background, not foreground.
 *
 * Every level here goes through `setLevel` rather than `audio.volume`, which
 * on iOS is read-only and ignores what it is given — so until that changed,
 * this 0.32 was a desktop-only instruction and the music came up under the
 * page at FULL volume on a phone. See audioLevel.ts.
 */
const VOLUME = 0.32
/** Long enough that it arrives rather than starts. */
const FADE_IN = 2.4

/**
 * The music.
 *
 * Armed when the envelope opens, and it comes up the moment the recitation
 * that started with it has finished — see voiceGate.ts. Then it loops for the
 * rest of the visit. Nothing about it is tied to the scroll any more: the two
 * tracks run back to back from the opening, whether the guest reads on or sits
 * on the card.
 *
 * The difficulty behind all of it is autoplay policy: a browser will not let a
 * page make sound until the guest has interacted with it. What rescues it is
 * that opening the envelope IS a gesture — the element is primed on the back
 * of it (played muted for an instant and paused again), which is enough to
 * satisfy the policy for the real start ten seconds later. Which is why this
 * arms on `whenOpened`, inside the click itself, rather than on the scroll
 * lock four seconds later: by then the gesture has stopped counting.
 *
 * The queue is joined only once priming has settled, and deliberately so: the
 * gate can open in the same tick when the recitation is blocked outright, and
 * priming's own `pause()` landing after that would stop the music dead a
 * moment after starting it.
 *
 * If priming fails anyway (an unusually strict setting), the toggle in the
 * corner is a real click and will always work.
 */
export function Music() {
  const el = useRef<HTMLAudioElement>(null)
  const armed = useRef(false)
  const started = useRef(false)
  /**
   * Turned off by hand, and not to be started again behind the guest's back.
   *
   * A ref rather than state: nothing renders off it — the button reads
   * `audible` — and the callbacks that consult it are queued on the gate and
   * on a `play()` promise, both of which outlive the render that made them.
   */
  const mutedRef = useRef(false)
  const [audible, setAudible] = useState(false)
  const { locked } = useScroll()

  useEffect(() => {
    whenOpened(() => {
      const audio = el.current
      if (!audio || armed.current) return
      armed.current = true

      const start = () => {
        if (started.current || mutedRef.current) return
        started.current = true

        setLevel(audio, 0)
        audio
          .play()
          .then(() => {
            setAudible(true)
            const fade = { v: 0 }
            gsap.to(fade, {
              v: VOLUME,
              duration: FADE_IN,
              ease: 'power1.inOut',
              onUpdate: () => setLevel(audio, fade.v),
            })
          })
          .catch(() => {
            // Blocked after all. Let the toggle offer it instead.
            started.current = false
          })
      }

      // Prime on the gesture that opened the envelope, then take a place in
      // the queue behind the recitation — see the note above for why in that
      // order. `prime` is the gain stage and has to happen on the gesture too,
      // for its own reasons (audioLevel.ts); the muted play below is the
      // autoplay one.
      prime(audio)
      audio.muted = true
      audio
        .play()
        .then(() => {
          audio.pause()
          audio.currentTime = 0
        })
        .catch(() => {
          // Nothing to do — the toggle is still there.
        })
        .finally(() => {
          audio.muted = false
          afterVoice(start)
        })
    })
  }, [])

  const toggle = () => {
    const audio = el.current
    if (!audio) return

    if (audio.paused) {
      setLevel(audio, 0)
      audio.play().then(() => {
        mutedRef.current = false
        setAudible(true)
        started.current = true
        const up = { v: 0 }
        gsap.to(up, { v: VOLUME, duration: 0.8, onUpdate: () => setLevel(audio, up.v) })
      })
      return
    }

    // Faded out and THEN paused, so the button never cuts the track dead.
    // The completion callback is why these ramps stay in GSAP rather than
    // moving to Web Audio's own scheduling, which has nothing like it.
    const down = { v: VOLUME }
    gsap.to(down, {
      v: 0,
      duration: 0.5,
      onUpdate: () => setLevel(audio, down.v),
      onComplete: () => {
        audio.pause()
        setAudible(false)
      },
    })
    mutedRef.current = true
  }

  return (
    <>
      {/* `loop` is the whole ask: it plays under the rest of the page from the
          end of the recitation onward. Not preloaded — nothing should be spent
          on it until the envelope has actually been opened. */}
      <audio ref={el} src="/music.mp3" loop preload="none" />

      {/* Still on the scroll lock rather than on the opening, even though the
          sound now starts a few seconds ahead of it. The opening stage is an
          opaque sheet at z-50 and so is this button: offered any earlier it
          would sit on top of the envelope falling away. Nothing is lost by
          waiting — what is playing over those seconds is the recitation, which
          is not what this button controls, and the music only comes up once
          the recitation has finished. */}
      {!locked && (
        <button
          type="button"
          onClick={toggle}
          // A handle for scripts/og-shot.mjs, which hides the page's furniture
          // before photographing the card. Nothing styles off it.
          data-music-toggle
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
