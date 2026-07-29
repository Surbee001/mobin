import { site } from '@/site.config'

/**
 * Where the evening is, relative to now.
 *
 *   before — the ordinary state, and everything the site was built for
 *   today  — from midnight in Tehran on the day itself
 *   during — from the hour it begins until it is over
 *   after  — afterwards, for as long as the link stays up
 *
 * Every boundary is derived from `event.iso` and `calendar.durationMinutes`,
 * so moving the date in site.config moves all four of them together and there
 * is no second place to remember to edit.
 */
export type Phase = 'before' | 'today' | 'during' | 'after'

/** The instant it starts. */
export const START = new Date(site.event.iso).getTime()

/** And the instant it is over. */
export const END = START + site.calendar.durationMinutes * 60_000

/**
 * Midnight at the top of the event's own day.
 *
 * The event's own day, not the guest's: «امشب» has to mean tonight in Tehran
 * whichever city the phone reading it happens to be in, and a guest three
 * timezones west would otherwise see it a day early or a day late.
 *
 * The ISO string carries its own UTC offset, so the day boundary can be
 * rebuilt from the date part plus that offset alone — no timezone database,
 * nothing to keep in step, and it follows the date wherever it moves. If the
 * string is ever written in some shape this cannot read, the fallback is the
 * start of the event itself: the `today` window closes to nothing and the
 * countdown simply runs to the hour, which is the old behaviour.
 */
const stamp = /^(\d{4}-\d{2}-\d{2})T[\d:.]+([+-]\d{2}:\d{2}|Z)$/.exec(site.event.iso)
export const DAY_START = stamp ? new Date(`${stamp[1]}T00:00:00${stamp[2]}`).getTime() : START

export function phaseAt(now: number): Phase {
  if (now >= END) return 'after'
  if (now >= START) return 'during'
  if (now >= DAY_START) return 'today'
  return 'before'
}
