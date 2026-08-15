import type { Metadata, Viewport } from 'next'
import { Amiri, Markazi_Text, Pinyon_Script, Vazirmatn } from 'next/font/google'
import localFont from 'next/font/local'
// The `/next` entry, not the bare package — it reads the App Router's own
// navigation hooks to count a client-side route change as a page view. The
// bare one would only ever see the first load.
import { Analytics } from '@vercel/analytics/next'
import { LightSource } from '@/components/LightSource'
import { site } from '@/site.config'
import './globals.css'

/**
 * Tobias (Dinamo) carries every line of English on the site.
 *
 * The variable cut covers weights 100–900 upright; Tobias draws a true
 * italic rather than a slant, so the italics are loaded as separate static
 * cuts instead of riding the VF's `slnt` axis.
 *
 * NOTE: these are the TRIAL files — evaluation only, not licensed for a
 * public deployment. A retail licence is needed before this goes live.
 */
const tobias = localFont({
  src: [
    { path: '../fonts/TobiasVF-TRIAL.woff2', weight: '100 900', style: 'normal' },
    { path: '../fonts/Tobias-TRIAL-ThinItalic.woff2', weight: '100', style: 'italic' },
    { path: '../fonts/Tobias-TRIAL-LightItalic.woff2', weight: '300', style: 'italic' },
    { path: '../fonts/Tobias-TRIAL-RegularItalic.woff2', weight: '400', style: 'italic' },
  ],
  variable: '--font-tobias',
  display: 'swap',
})

/** The aya. Amiri is a classical naskh, cut for Qur'anic setting. */
const amiri = Amiri({
  weight: ['400', '700'],
  subsets: ['arabic'],
  variable: '--font-amiri',
  display: 'swap',
})

/**
 * Persian, in Iran Nastaliq.
 *
 * Nastaliq is a calligraphic hand rather than a text face: the baseline falls
 * away to the left as a word is written, so a line occupies far more vertical
 * room than a naskh or a sans does at the same point size. Every Persian
 * `line-height` on the site is set generously for that reason — tighten one
 * and the descending tail of one line will run into the head of the next.
 *
 * Loaded locally as woff2 (424KB from a 2.3MB TTF).
 */
const nastaliq = localFont({
  src: [{ path: '../fonts/IranNastaliq.woff2', weight: '400', style: 'normal' }],
  variable: '--font-nastaliq',
  display: 'swap',
})

/** Kept for the OG image, which cannot shape Nastaliq. */
const markazi = Markazi_Text({
  weight: ['400', '500', '600'],
  subsets: ['arabic'],
  variable: '--font-markazi',
  display: 'swap',
})

/**
 * The Persian setting of the two names on the card, and nothing else.
 *
 * Markazi sets every other word of Persian on the site, but its lightest cut
 * is 400 and the names are set at 100 — beside a Tobias hairline it arrives
 * looking bold. Vazirmatn is Persian-first too and carries a true Thin, so
 * the two settings of the name can stand in for one another without the
 * weight jumping as they swap.
 */
const vazir = Vazirmatn({
  weight: ['100'],
  subsets: ['arabic'],
  variable: '--font-vazir',
  display: 'swap',
})

/**
 * The engraved script on the card: the pair of full names along the top, and
 * the heading of each of the three columns at the foot.
 *
 * Pinyon is a copperplate — the hand an engraver cuts, which is the hand a
 * printed invitation has used for two centuries. It exists on the card as the
 * counterweight to the capitals: everything formal is set in Tobias, and the
 * three or four lines that are addressed to the guest personally are written.
 */
const pinyon = Pinyon_Script({
  weight: ['400'],
  subsets: ['latin'],
  variable: '--font-script',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ??
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'),
  ),
  title: site.meta.title,
  description: site.meta.description,
  openGraph: {
    title: site.meta.title,
    description: site.meta.description,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: site.meta.title,
    description: site.meta.description,
  },
  // Stops Chrome offering to translate the page. The invitation is meant to
  // be read in the language it was written in — a machine translation of the
  // aya or of the families' own wording would be worse than none.
  other: { google: 'notranslate' },
}

export const viewport: Viewport = {
  // The paper, so the browser chrome runs on into the page. One value and not
  // a light/dark pair: the invitation is printed on cream whatever the phone
  // is set to, and a dark bar above a cream page is worse than no match at
  // all. The tab ICON does answer the theme — see app/icon.svg — because that
  // one sits in the browser's furniture rather than against the page.
  themeColor: '#f2efdc',
  // Refuses Chrome-for-Android's Auto Dark Theme, which repaints a page that
  // declares no dark scheme of its own and takes the envelope apart doing it.
  // `only light` is the opt-out; plain `light` is not. The stylesheet says the
  // same thing on `html`, at length — see the note there. This meta is the
  // copy that is read before the stylesheet has loaded.
  colorScheme: 'only light',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fa" dir="rtl" translate="no" className="notranslate h-full">
      <body
        className={`${tobias.variable} ${amiri.variable} ${nastaliq.variable} ${markazi.variable} ${vazir.variable} ${pinyon.variable} min-h-full antialiased`}
      >
        {/* Renders nothing. It hangs the lamp the whole page is lit by —
            see components/light.ts. */}
        <LightSource />
        {children}
        {/* Renders nothing either — it injects the counting script. Last in the
            body so it is the last thing asked for: the invitation is opened on
            phones on Iranian and Omani mobile data, and nothing here is worth a
            millisecond of the card's arrival. It no-ops off Vercel, so `npm run
            dev` and the OG screenshot are unaffected. */}
        <Analytics />
      </body>
    </html>
  )
}
