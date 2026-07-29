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
    'UID:mina-mobin-engagement@invitation',
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
