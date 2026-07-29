'use client'

import { useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { ArrowLeft } from '@phosphor-icons/react'
import { site } from '@/site.config'
import { kashida } from './kashida'

gsap.registerPlugin(ScrollTrigger, useGSAP)

const { location } = site

/**
 * Google's embed works without an API key at this endpoint. Searching by the
 * place's name rather than by coordinates, because the shared link gave up
 * the name but not a latitude — and Google resolved that same string to this
 * place in the first place.
 */
const embedSrc = `https://www.google.com/maps?q=${encodeURIComponent(location.mapQuery)}&z=16&hl=fa&output=embed`

export function Location() {
  const scope = useRef<HTMLElement>(null)

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
      dir="rtl"
      className="relative z-30 flex items-center bg-paper px-6 py-36 sm:px-10 sm:py-52"
    >
      <div className="mx-auto grid w-full max-w-5xl gap-12 sm:grid-cols-5 sm:items-center sm:gap-16">
        {/* The written address. */}
        <div className="sm:col-span-2">
          {/* Stretched with kashidas. `aria-label` carries the unstretched
              string so assistive tech reads the word, not the strokes. */}
          <span
            data-reveal
            aria-label={location.eyebrow}
            className="block font-persian text-base font-light text-accent"
          >
            {kashida(location.eyebrow, 2)}
          </span>

          <h2
            data-reveal
            lang="fa"
            aria-label={location.name}
            className="mt-6 font-persian font-medium leading-[1.45] text-ink"
            style={{ fontSize: 'clamp(2rem, 4.4vw, 3rem)' }}
          >
            {kashida(location.name, 3)}
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
            className="btn mt-9 font-persian text-[1.15rem] font-light"
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
    </section>
  )
}
