import { site } from '@/site.config'

/** iCalendar escaping: commas, semicolons, backslashes and newlines. */
const esc = (s: string) =>
  s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n')

/** 20260918T163000Z */
const stamp = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')

export function GET() {
  const start = new Date(site.event.iso)
  const end = new Date(start.getTime() + site.calendar.durationMinutes * 60_000)

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//mina-mobin//invitation//FA',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    // One UID for every guest, so a second download replaces the first rather
    // than sitting beside it — and SEQUENCE is what permits the replacement.
    // See `calendar.sequence` in site.config.
    //
    // This is the event's IDENTITY and not a description of it, so it is not
    // ordinarily safe to correct: a calendar holding the old string and handed
    // the new one has no way to know they are the same day, and keeps both.
    // It said `engagement` until the invitation had been sent to nobody, which
    // was the one moment it could be changed for free. Now that it has gone
    // out, it is frozen — whatever it says, and however the day is renamed
    // again, leave this line alone.
    'UID:mina-mobin-aghd@invitation',
    `SEQUENCE:${site.calendar.sequence}`,
    // When this invitation was last revised. It has to move when the event
    // does, or a calendar weighing two copies of the same UID has nothing to
    // tell them apart by; deriving it from the event itself means it can never
    // be forgotten. Not the current time: that would make the file different
    // on every request, and an unchanged invitation should download byte for
    // byte the same.
    `DTSTAMP:${stamp(start)}`,
    `DTSTART:${stamp(start)}`,
    `DTEND:${stamp(end)}`,
    `SUMMARY:${esc(site.calendar.eventTitle)}`,
    `LOCATION:${esc([site.location.name, site.location.address].filter(Boolean).join('، '))}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ]

  // iCalendar requires CRLF line endings.
  return new Response(lines.join('\r\n'), {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'attachment; filename="invitation.ics"',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
