'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { ArrowLeft, CalendarPlus } from '@phosphor-icons/react'
import { site } from '@/site.config'
import { Meadow } from './Meadow'
import { Sprigs } from './Sprigs'
import { phaseAt, type Phase } from './eventPhase'

gsap.registerPlugin(ScrollTrigger, useGSAP)

const { location, event } = site

/**
 * Google's embed works without an API key at this endpoint. Searching by the
 * place's name rather than by coordinates, because the shared link gave up
 * the name but not a latitude — and Google resolved that same string to this
 * place in the first place.
 */
const embedSrc = `https://www.google.com/maps?q=${encodeURIComponent(location.mapQuery)}&z=16&hl=fa&output=embed`

/**
 * Which phase of the day the page is in. Read once, on the client, after
 * mount — the server has no business guessing, and a mismatch here would be a
 * hydration error rather than a cosmetic one. Until it resolves the section
 * renders as `before`, which is the truthful default and the one that shows
 * the most.
 */
function useEventPhase() {
  const [phase, setPhase] = useState<Phase>('before')
  useEffect(() => {
    const tick = () => setPhase(phaseAt(Date.now()))
    tick()
    const id = setInterval(tick, 30_000)
    return () => clearInterval(id)
  }, [])
  return phase
}

export function Location() {
  const scope = useRef<HTMLElement>(null)
  const phase = useEventPhase()

  useGSAP(
    () => {
      gsap.from('[data-reveal]', {
        opacity: 0,
        y: 26,
        duration: 1.1,
        ease: 'power3.out',
        stagger: 0.12,
        scrollTrigger: { trigger: scope.current, start: 'top 70%' },
      })

      // Just a fade. A wipe made the map look like it was being built,
      // which is the wrong kind of attention for a thing you only need to
      // read an address off.
      gsap.from('[data-map]', {
        opacity: 0,
        duration: 1.1,
        ease: 'power2.out',
        scrollTrigger: { trigger: '[data-map]', start: 'top 82%' },
      })
    },
    { scope },
  )

  return (
    <section
      ref={scope}
      id="finale"
      dir="rtl"
      className="relative z-40 flex flex-col items-center overflow-hidden bg-paper px-6 pt-36 pb-[46vw] sm:px-10 sm:pt-52 sm:pb-[34vw]"
    >
      <Meadow phase={phase} />

      {/* When, above where. The day carries the block; the lunar date and the
          hour attend it, set smaller and either side of a hairline so the
          three lines read as one statement rather than three.

          All three sizes are fluid, and they have to be: fix the two smaller
          ones in rem while the first is clamped against the viewport and the
          gap between them grows with every pixel of window — the day arrives
          at its full size on a desktop with two captions under it. They are
          set as fractions of one scale instead, ~0.66 and ~0.72 of the day,
          which is the same hierarchy at every width.

          Generous fractions, because this face is small for its point size —
          the note on `.name-fa` in globals.css says the same thing. Anything
          set at the address line's 1.2rem reads as fine print, and none of
          these three lines is fine print. */}
      <div className="relative mb-20 w-full max-w-5xl text-center sm:mb-28">
        {/* The peonies stand either side of the date. First in the block and
            explicitly behind it — an absolutely positioned box paints over
            static siblings whatever the order, so every line below carries
            `relative` to climb back above the flowers rather than be read
            through them. */}
        <Sprigs phase={phase} />

        <p
          data-reveal
          lang="fa"
          className="relative z-10 font-persian font-medium leading-[1.55] text-ink"
          style={{ fontSize: 'clamp(2.2rem, 4.8vw, 3.2rem)' }}
        >
          {event.dateFa}
        </p>

        <p
          data-reveal
          lang="fa"
          className="relative z-10 mt-2 font-persian font-light leading-[1.7] text-ink-soft"
          style={{ fontSize: 'clamp(1.5rem, 3.1vw, 2.1rem)' }}
        >
          {event.dateHijriFa}
        </p>

        <span
          data-reveal
          aria-hidden="true"
          className="relative z-10 mx-auto mt-8 block h-px w-16 bg-accent/45"
        />

        <p
          data-reveal
          lang="fa"
          className="relative z-10 mt-6 font-persian font-light leading-[1.7] text-accent"
          style={{ fontSize: 'clamp(1.65rem, 3.4vw, 2.3rem)' }}
        >
          {event.timeFa}
        </p>
      </div>

      <div className="relative mx-auto grid w-full max-w-5xl gap-12 sm:grid-cols-5 sm:items-center sm:gap-16">
        {/* The written address. */}
        <div className="sm:col-span-2">
          <span data-reveal className="block font-persian text-xl font-light text-accent">
            {location.eyebrow}
          </span>

          <h2
            data-reveal
            lang="fa"
            className="mt-6 font-persian font-medium leading-[1.6] text-ink"
            style={{ fontSize: 'clamp(2.3rem, 5vw, 3.4rem)' }}
          >
            {location.name}
          </h2>

          {/* Only rendered once there is an address to render. */}
          {location.address && (
            <p
              data-reveal
              lang="fa"
              className="mt-4 font-persian text-[1.2rem] font-light leading-[1.95] text-ink-soft"
            >
              {location.address}
            </p>
          )}

          <a
            data-reveal
            href={location.mapUrl}
            target="_blank"
            rel="noreferrer"
            className="btn mt-9 font-persian text-[1.45rem] font-light"
          >
            {location.linkLabel}
            <ArrowLeft size={19} weight="bold" aria-hidden="true" />
          </a>
        </div>

        {/* The map, in its own colours and uncropped — Google's pan control,
            satellite switch and attribution all sit in the bottom strip, so
            there is nothing to trim without cutting one of them off. */}
        <div
          data-map
          className="overflow-hidden rounded-[5px] border border-accent/35 sm:col-span-3"
          style={{ height: 'clamp(300px, 42vw, 440px)' }}
        >
          <iframe
            src={embedSrc}
            title={location.name}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="block h-full w-full border-0"
          />
        </div>
      </div>

      {/* The calendar button closes the page. Only while it is still ahead:
          an entry for a party already under way is no use to anybody, and
          afterwards it is no use at all. The map link above stays either way,
          which is why this does not fall back to one — the day itself would
          otherwise show the same button twice. */}
      {(phase === 'before' || phase === 'today') && (
        <a
          data-reveal
          href="/api/calendar"
          className="btn relative mt-20 font-persian text-[1.15rem] font-light"
        >
          <CalendarPlus size={20} weight="bold" aria-hidden="true" />
          {site.calendar.label}
        </a>
      )}
    </section>
  )
}
