'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import { site } from '@/site.config'
import { prime, setLevel } from './audioLevel'
import { whenOpened } from './envelopeGate'
import { registerVoice, voiceStarted, voiceFinished } from './voiceGate'

/**
 * The blessing, on the one dark panel.
 *
 * It arrives the way the other panels do — climbing up over the one before
 * it — and then simply sits there. No reveal of its own.
 *
 * The other panels resolve their words out of the panel colour, and this one
 * cannot: it is a photograph of handwriting, so there are no words to split,
 * only ink. A fade was the nearest equivalent and it was the wrong answer —
 * a plate that is white on black has to be blended to sit on the panel at
 * all, and fading it means watching it arrive as a black rectangle first.
 * The climb is already an entrance; the writing does not need a second one.
 *
 * The plate is white on black, and `screen` is what puts it on the panel:
 * black screened against anything returns that thing unchanged, so the field
 * drops away entirely and only the writing survives.
 *
 * Not `lighten`, which takes whichever is lighter per channel and would leave
 * the anti-aliased edge of every stroke fringed with grey. Screen lifts those
 * partial greys smoothly, which is what keeps a thin handwritten line looking
 * drawn rather than cut out.
 */

/**
 * Total scroll length, in viewport heights: one for the pane itself, a hold
 * where the writing sits there whole, and one more for the next panel to
 * climb up over this one.
 */
const PANEL_VH = 2.9

/**
 * Where the recitation sits. It starts there — there is no fade in.
 *
 * The level: this is the loudest thing on the site by some way, and it arrives
 * unannounced a moment after the envelope is opened. 0.8 takes a couple of dB
 * off the top, which is the difference between a voice speaking in the room
 * and one being played AT the guest. Turn it down further and the words stop
 * being clear on a phone speaker.
 *
 * And the fade that used to be here is gone, deliberately. There was never
 * room for one — decoded and measured in 20ms windows, blessing-voice.mp3
 * runs:
 *
 *     0.00–0.10s   −79 → −53 dB   silence
 *     0.12s        −29 dB         the first breath of the word
 *     0.16s        −18 dB         full speaking level
 *
 * A TENTH of a second of lead-in, and that is all there is. Any ramp long
 * enough to be heard as an entrance was therefore riding over speech, and the
 * only question was how much of the opening word it took with it — the 0.9s
 * `power2.out` this last carried was at ~25% when the voice began, so the
 * first word arrived from somewhere off in the distance. The word matters
 * more than the entrance. The track is now simply set to its level before
 * `play()` and starts at it, which is what the file was mastered for: it
 * opens on a tenth of a second of its own silence either way.
 *
 * If a fade is ever wanted back, it belongs in the FILE and not here — a
 * couple of frames of ramp printed into the audio ahead of the first breath
 * costs nothing and cannot land on top of a word.
 */
const VOICE_VOLUME = 0.8

export function Poem() {
  const voice = useRef<HTMLAudioElement>(null)
  const played = useRef(false)

  /**
   * The recitation starts when the envelope opens, not when this panel is
   * reached — it is the first thing a guest hears, under the card, and the
   * music comes up behind it once it has finished.
   *
   * Which also disposes of the autoplay problem rather than working around
   * it: opening the envelope IS the gesture, so this plays on the strength of
   * it instead of having to be primed muted and started cold a panel later.
   * The audio still lives on this section because the words are its words.
   *
   * Hung on `whenOpened` and not on the scroll lock. The lock is lowered when
   * the card has finished becoming the hero, which is the far end of a
   * four-second sequence — long enough that the voice arrived over a settled
   * page rather than over the envelope falling away, and long enough that the
   * click was no longer the current task when `play()` was called.
   */
  useEffect(() => {
    /**
     * Begin the recitation. Idempotent, and shared by the two things that can
     * ask for it: the envelope opening below, and the music's gate, which
     * starts the voice itself rather than wait forever on one that never ran.
     */
    const begin = () => {
      const audio = voice.current
      if (!audio || played.current) return
      played.current = true

      // Claimed BEFORE the play promise settles. The music arms itself on the
      // same unlock, and a gate that only closed on success would leave a
      // window where both are allowed to start.
      voiceStarted()

      // Build the gain stage while the opening gesture is still the current
      // task — see audioLevel.ts for why it cannot be done later.
      prime(audio)
      // Set BEFORE play(), not after it resolves. The gain stage is already
      // standing by this line, so the very first sample comes out at the level
      // it is meant to — there is no window in which the track is audible at
      // whatever the element was last left at.
      setLevel(audio, VOICE_VOLUME)

      audio.play().catch(() => {
        played.current = false
        // Nothing to wait for — let the music through rather than silencing
        // it for the rest of the visit.
        voiceFinished()
      })
    }

    registerVoice(begin)
    whenOpened(begin)
  }, [])

  return (
    <section
      id="blessing"
      // Climbs over the verse panel exactly as the verse climbs over the hero.
      className="relative z-20 -mt-[100dvh] bg-panel-poem"
      style={{ height: `${PANEL_VH * 100}dvh` }}
    >
      {/* Read once, when the envelope opens — no `loop`. The background music
          waits on its `ended`, so the two never overlap however fast the page
          is scrolled. Not preloaded: nothing is spent on it until the envelope
          has actually been opened, at which point playing it fetches it. */}
      <audio ref={voice} src="/blessing-voice.mp3" preload="none" onEnded={voiceFinished} />

      {/* The panel colour is repeated on the sticky pane, not just on the
          section. `position: sticky` forms a stacking context, so the blend
          above resolves against THIS box rather than the section behind it —
          and with nothing painted here the black field had nothing to screen
          away and simply sat there as a black rectangle. */}
      <div className="sticky top-0 flex h-[100dvh] items-center justify-center overflow-hidden bg-panel-poem px-6 sm:px-10">
        {/* The wrapper carries the width, so the signature can be aligned to
            the blessing's own left edge rather than to the pane. */}
        <div className="flex w-[80vw] max-w-2xl flex-col sm:w-[63vw]">
          <Image
            src="/blessing.webp"
            alt={site.poem.alt}
            width={1153}
            height={467}
            sizes="(max-width: 640px) 88vw, 70vw"
            className="h-auto w-full mix-blend-screen"
          />

          {/* Bottom left, as a signature sits — under the text and off to the
              side, not centred beneath it. Small: it is a name, not a second
              statement.

              `self-end`, not `self-start`. The document is RTL, so flex start
              is the RIGHT edge and a signature placed there lands under the
              beginning of the writing rather than the end of it. End is the
              physical left here — and it stays correct on its own terms if
              this is ever set in a left-to-right language, because a
              signature belongs wherever the reading finishes. */}
          <Image
            src="/blessing-signature-v4.webp"
            alt={site.poem.signatureAlt}
            width={900}
            height={680}
            sizes="(max-width: 640px) 30vw, 20vw"
            className="mt-2 h-auto w-[34%] self-end mix-blend-screen sm:mt-4 sm:w-[26%]"
          />
        </div>
      </div>
    </section>
  )
}
