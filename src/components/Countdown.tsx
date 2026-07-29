'use client'

import { Fragment, useRef, useSyncExternalStore } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import Image from 'next/image'
import { CalendarPlus, MapPin } from '@phosphor-icons/react'
import { site } from '@/site.config'
import { kashida } from './kashida'
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

/**
 * The meadow, before and after.
 *
 * The artwork is greyscale line work, so the warmth is entirely in the filter
 * — which means the flush on the day itself is a change of filter and nothing
 * else. `dim` is the everyday setting: a sepia that takes the blue off the
 * scan and lifts the ground a little. `bloom` pushes the same line work
 * rosier and a good deal richer, and it is what the section wears from
 * midnight on the day onward. The transition is slow enough that nobody
 * watches it happen; the page is simply warmer than it was last week.
 */
const MEADOW = {
  dim: 'sepia(0.62) saturate(1.35) hue-rotate(3deg) brightness(0.99)',
  bloom: 'sepia(0.78) saturate(2.5) hue-rotate(-13deg) brightness(1.02)',
}

/** What stands above the clock, in each of the four settings. */
const EYEBROW: Record<Phase, string> = {
  before: site.countdown.eyebrow,
  today: site.countdown.eyebrowToday,
  during: site.countdown.eyebrowNow,
  after: site.countdown.eyebrowPassed,
}

/**
 * The closing section: how long is left, and the one thing a guest might
 * want to do about it. There is no nav and no footer beyond this.
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
      id="finale"
      dir="rtl"
      className="relative z-40 flex flex-col items-center justify-center overflow-hidden bg-paper px-6 pb-[46vw] pt-32 sm:pb-[34vw] sm:pt-44"
    >
      {/* A meadow along the bottom edge.

          The artwork is line work on solid white, so `multiply` is what makes
          it sit on the page: white multiplied by the background *is* the
          background, so the paper shows straight through and only the drawn
          lines survive. No cut-out needed.

          The top is masked rather than covered with a gradient the colour of
          the page. Same look, but it keeps working if the background ever
          changes — and a cream gradient laid over a multiplying layer would
          have multiplied too, and dirtied the fade. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 select-none"
        style={{
          maskImage: 'linear-gradient(to top, black 32%, transparent 92%)',
          WebkitMaskImage: 'linear-gradient(to top, black 32%, transparent 92%)',
        }}
      >
        <Image
          src="/flowers.webp"
          alt=""
          width={2400}
          height={1326}
          sizes="100vw"
          className="w-full mix-blend-multiply"
          // Greyscale on disk, warmed here — it arrives blue, which would be
          // the only cool colour on an otherwise warm page. The sepia lifts
          // the white ground very slightly too, which reads as a soft warm
          // glow along the bottom edge rather than a flat cut-off. From the
          // day of the wedding onward it flushes; see MEADOW.
          style={{
            filter: phase === 'before' ? MEADOW.dim : MEADOW.bloom,
            transition: 'filter 2.6s ease',
          }}
        />
      </div>

      <span
        data-reveal
        aria-label={EYEBROW[phase]}
        className="relative font-persian font-light text-accent"
        style={{ fontSize: 'clamp(1.2rem, 2.4vw, 1.7rem)' }}
      >
        {kashida(EYEBROW[phase], 2)}
      </span>

      <div data-reveal className="rule relative mt-7 w-16" />

      {counting ? (
        <div
          className="relative mt-16 flex items-start gap-8 sm:gap-16"
          // Reserve the row before the clock arrives so nothing jumps.
          style={{ minHeight: '9rem' }}
        >
          {units.map(([key, label], i) => (
            // A Fragment, not a wrapper: a nested flex would add its own gap
            // on top of the parent's and double the spacing between units.
            <Fragment key={key}>
              {i > 0 && (
                <span aria-hidden="true" className="mt-5 font-serif text-2xl text-accent/45">
                  ·
                </span>
              )}
              <div className="flex flex-col items-center gap-4">
                <span
                  className="font-persian font-light leading-none tabular-nums text-ink"
                  style={{ fontSize: 'clamp(3rem, 9vw, 6rem)' }}
                >
                  {parts ? fa(parts[key]) : ' '}
                </span>
                <span className="font-persian text-[17px] font-light text-ink-soft">{label}</span>
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

      {/* On the night itself the only useful thing this page can offer is the
          way there — an entry in a calendar for an event already under way is
          no use to anybody. Afterwards it offers nothing at all. */}
      {phase === 'during' ? (
        <a
          data-reveal
          href={site.location.mapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn relative mt-20 font-persian text-[1.15rem] font-light"
        >
          <MapPin size={20} weight="bold" aria-hidden="true" />
          {site.location.linkLabel}
        </a>
      ) : phase === 'after' ? null : (
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
