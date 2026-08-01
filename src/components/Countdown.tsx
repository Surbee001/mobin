'use client'

import { Fragment, useRef, useSyncExternalStore } from 'react'
import Image from 'next/image'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { site } from '@/site.config'
import { phaseAt, START, type Phase } from './eventPhase'

gsap.registerPlugin(ScrollTrigger, useGSAP)

type Parts = { days: number; hours: number; minutes: number; seconds: number }

function remaining(now: number): Parts | null {
  const diff = START - now
  if (diff <= 0) return null
  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor(diff / 3_600_000) % 24,
    minutes: Math.floor(diff / 60_000) % 60,
    seconds: Math.floor(diff / 1000) % 60,
  }
}

/**
 * The clock, as an external store rather than state-in-an-effect.
 *
 * The snapshot is a plain number — whole seconds — so React can compare it
 * cheaply and only re-render on a tick. `getServerSnapshot` returns null, so
 * the server and the first client paint agree and hydration has nothing to
 * disagree about; the real time arrives on the very next render.
 *
 * That null is also what keeps the four settings below hydration-safe. Which
 * one the page is in depends on the clock, and the server has no business
 * guessing: until the first tick the section renders `before` with a blank
 * row of the right size, which is what it did when it had only one setting.
 */
const subscribe = (onChange: () => void) => {
  const id = setInterval(onChange, 1000)
  return () => clearInterval(id)
}
const getSnapshot = () => Math.floor(Date.now() / 1000)
const getServerSnapshot = () => null

/** Persian numerals, zero-padded to two places. */
const fa = (n: number) => n.toLocaleString('fa-IR', { minimumIntegerDigits: 2, useGrouping: false })

/** What stands above the clock, in each of the four settings. */
const EYEBROW: Record<Phase, string> = {
  before: site.countdown.eyebrow,
  today: site.countdown.eyebrowToday,
  during: site.countdown.eyebrowNow,
  after: site.countdown.eyebrowPassed,
}

/**
 * How long is left.
 *
 * No longer the last section — the address follows it, because an address is
 * what a guest comes back to look up and the clock is what they read once.
 * So the page's ending furniture (the meadow, the confetti, the calendar
 * button) lives on <Location> now, and this is the clock alone.
 *
 * It moves through four settings as the evening approaches and passes — see
 * eventPhase.ts for where the boundaries come from, and the note above
 * `countdown` in site.config.ts for what each one says.
 */
export function Countdown() {
  const scope = useRef<HTMLElement>(null)
  const nowSec = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const ready = nowSec !== null
  // Before the first tick there is no clock to read, and `before` is both the
  // truthful default and the one that reserves the most room.
  const phase = ready ? phaseAt(nowSec * 1000) : 'before'

  const counting = phase === 'before' || phase === 'today'
  const parts = ready && counting ? remaining(nowSec * 1000) : null

  useGSAP(
    () => {
      gsap.from('[data-reveal]', {
        opacity: 0,
        y: 24,
        duration: 1.1,
        ease: 'power3.out',
        stagger: 0.1,
        scrollTrigger: { trigger: scope.current, start: 'top 75%' },
      })
    },
    { scope },
  )

  const units = (
    [
      ['days', site.countdown.labels.days],
      ['hours', site.countdown.labels.hours],
      ['minutes', site.countdown.labels.minutes],
      ['seconds', site.countdown.labels.seconds],
    ] as Array<[keyof Parts, string]>
  )
    // A days column reading ۰۰ on the day itself is a column saying nothing.
    // Only ever dropped once the clock is actually running: while it is still
    // blank the full four hold the row at the width it is about to need.
    .filter(([key]) => !(key === 'days' && parts?.days === 0))

  return (
    <section
      ref={scope}
      dir="rtl"
      className="relative z-40 flex flex-col items-center justify-center bg-paper px-6 pb-32 pt-32 sm:pb-40 sm:pt-44"
    >
      <span
        data-reveal
        className="relative font-persian font-light text-accent"
        style={{ fontSize: 'clamp(1.5rem, 3vw, 2.1rem)' }}
      >
        {EYEBROW[phase]}
      </span>

      <div data-reveal className="rule relative mt-7 w-16" />

      {counting ? (
        <div
          className="relative mt-14 flex items-start gap-4 sm:mt-16 sm:gap-16"
          // Reserve the row before the clock arrives so nothing jumps.
          style={{ minHeight: '9rem' }}
        >
          {units.map(([key, label], i) => (
            // A Fragment, not a wrapper: a nested flex would add its own gap
            // on top of the parent's and double the spacing between units.
            <Fragment key={key}>
              {i > 0 && (
                <span aria-hidden="true" className="mt-4 font-serif text-xl text-accent/45 sm:mt-5 sm:text-2xl">
                  ·
                </span>
              )}
              <div className="flex flex-col items-center gap-3 sm:gap-4">
                <span
                  className="font-persian font-light leading-none tabular-nums text-ink"
                  style={{ fontSize: 'clamp(2.3rem, 11vw, 6rem)' }}
                >
                  {parts ? fa(parts[key]) : ' '}
                </span>
                <span className="font-persian text-[17px] font-light text-ink-soft sm:text-[22px]">{label}</span>
              </div>
            </Fragment>
          ))}
        </div>
      ) : (
        // Once there is nothing left to count, the line that stood in for the
        // clock takes the same vertical room the clock had, so the section
        // keeps its proportions on the night and after it.
        <p
          className="relative mt-16 flex items-center text-balance text-center font-persian font-light leading-[1.9] text-ink"
          style={{ minHeight: '9rem', fontSize: 'clamp(1.6rem, 4vw, 2.6rem)' }}
        >
          {phase === 'during' ? site.countdown.nowLine : site.countdown.passedLine}
        </p>
      )}

      {/* The blessing, under the clock.

          The plate was white ink on black and is stored negated, because this
          section sits on cream: screened onto a light ground white ink simply
          disappears. Inverted and multiplied it behaves the way the meadow and
          the peonies do — white multiplied by the page IS the page, so the
          ground drops away and only the writing survives, tinted by the paper
          it is printed on rather than arriving as its own colour. */}
      <Image
        data-reveal
        src="/mobarak-v3.webp"
        alt={site.countdown.blessingAlt}
        width={1400}
        height={539}
        sizes="(max-width: 640px) 72vw, 40vw"
        className="relative mt-6 h-auto w-[72vw] max-w-md mix-blend-multiply sm:mt-8 sm:w-[40vw]"
      />

    </section>
  )
}
