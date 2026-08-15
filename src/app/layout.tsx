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

/* ─────────────────────────────────────────────────────────────
   WHAT IS PRELOADED, AND WHY MOST OF IT IS NOT

   next/font preloads every face it is given, and there are six families
   here — which put 1.03MB of woff2 into the <head> of the first screen as
   `<link rel=preload>`, all of it at the highest priority the browser has,
   all of it ahead of the one thing the first screen actually shows: the
   wax seal you have to press to open the envelope.

   The sealed envelope sets no Arabic and no Persian. Amiri is the aya,
   Markazi the card's three columns, Nastaliq every line of Persian prose —
   none of it is above the fold, and none of it is reachable until the seal
   has been pressed. So those carry `preload: false`: they are still
   declared, the stylesheet still asks for them, and the browser still
   fetches them as soon as it meets an element that needs one. It simply
   does that at the priority a font below the fold deserves, behind the
   seal instead of in front of it.

   `display: swap` is what makes that safe — the text is readable in the
   fallback from the first paint and re-sets when the face lands.

   The two that DO stay preloaded are the two the first screen paints:
   Tobias, and Pinyon on the monogram card showing through the notch in
   the envelope's front.
   ───────────────────────────────────────────────────────────── */

/**
 * Tobias (Dinamo) carries every line of English on the site.
 *
 * The variable cut covers weights 100–900 upright. Tobias draws a true italic
 * rather than a slant, so italics cannot ride the VF's `slnt` axis — they
 * would have to be loaded as three more static cuts. They were, and nothing
 * on the site ever set a word in them: the pair of full names at the head of
 * the card, which the italic was bought for, is written in Pinyon now. Three
 * preloaded files, 184KB, for no italic anywhere. They are out until there is
 * something to set in them; the woff2s are still in ../fonts.
 *
 * NOTE: these are the TRIAL files — evaluation only, not licensed for a
 * public deployment. A retail licence is needed before this goes live.
 */
const tobias = localFont({
  src: [{ path: '../fonts/TobiasVF-TRIAL.woff2', weight: '100 900', style: 'normal' }],
  variable: '--font-tobias',
  display: 'swap',
})

/** The aya. Amiri is a classical naskh, cut for Qur'anic setting. */
const amiri = Amiri({
  weight: ['400', '700'],
  subsets: ['arabic'],
  variable: '--font-amiri',
  display: 'swap',
  // Two cuts, 208KB, and the aya is three screens down. See the note above.
  preload: false,
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
 *
 * That 424KB is the largest single file the site serves, and it was the
 * largest thing in the first screen's preload list — ahead of the seal, for
 * type that begins two screens below the fold. It is the reason the note
 * above exists. A Nastaliq is heavy because the hand needs a separate glyph
 * for nearly every place a letter can fall in a word, so there is no lighter
 * cut of it to reach for; the only real lever is subsetting, and subsetting
 * to the exact words on the site saves 186KB in exchange for a font that
 * renders a box the first time anyone edits a line of Persian. Not worth it
 * for type that no longer blocks anything.
 */
const nastaliq = localFont({
  src: [{ path: '../fonts/IranNastaliq.woff2', weight: '400', style: 'normal' }],
  variable: '--font-nastaliq',
  display: 'swap',
  preload: false,
})

/** Kept for the OG image, which cannot shape Nastaliq. */
const markazi = Markazi_Text({
  weight: ['400', '500', '600'],
  subsets: ['arabic'],
  variable: '--font-markazi',
  display: 'swap',
  preload: false,
})

/**
 * The Persian setting of the two names on the card, and nothing else.
 *
 * Markazi sets every other word of Persian on the site, but its lightest cut
 * is 400 and the names are set at 100 — beside a Tobias hairline it arrives
 * looking bold. Vazirmatn is Persian-first too and carries a true Thin, so
 * the two settings of the name can stand in for one another without the
 * weight jumping as they swap.
 *
 * NOTE: nothing reads `--font-vazir` at the moment — `.name-fa` sets the pair
 * in Nastaliq instead. Left declared because the reasoning above is still the
 * reasoning, and `preload: false` means an unread variable now costs nothing:
 * no stylesheet asks for the face, so the face is never fetched.
 */
const vazir = Vazirmatn({
  weight: ['100'],
  subsets: ['arabic'],
  variable: '--font-vazir',
  display: 'swap',
  preload: false,
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
  // The paper, so the browser chrome runs on into the page.
  //
  // Written as a pair, and both halves are the same cream. That is not a
  // redundancy: a single unqualified `theme-color` is treated as the LIGHT
  // one, and a phone in dark mode falls back to darkening the bar itself —
  // which is the brown bar over a cream page in the report this came from.
  // Naming dark explicitly is what pins it, and it doubles as one more
  // statement that this page has a dark setting and does not need one made
  // for it. The tab ICON still answers the theme — see app/icon.svg —
  // because that one sits in the browser's furniture rather than against the
  // page.
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f2efdc' },
    { media: '(prefers-color-scheme: dark)', color: '#f2efdc' },
  ],
  // `light dark`, and it used to say `only light`. See the long note on `html`
  // in globals.css: `only light` is the documented opt-out from Chrome's Auto
  // Dark Theme, but to the two WebView darkening paths — which is what an
  // in-app browser is — it reads as the page having no dark theme, and that is
  // the condition for inventing one. Declaring both, and answering dark in
  // cream, is what leaves the invitation alone.
  //
  // This meta is the copy read before the stylesheet has arrived; the
  // stylesheet says the same thing again on `html`.
  colorScheme: 'light dark',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="fa"
      dir="rtl"
      translate="no"
      className="notranslate h-full"
      // The one inline style on the site, and it is here because it is the
      // only place it can do its job.
      //
      // Saying `color-scheme: light dark` tells the browser the page has a
      // dark setting, and a browser that believes that will paint its blank
      // canvas dark in the moment between the HTML arriving and the
      // stylesheet arriving — a flash of charcoal before the cream, on
      // exactly the slow connections this invitation is opened on. An
      // attribute on the document element is in that first packet, so the
      // canvas is cream from the first byte and the question never comes up.
      //
      // Hard-coded rather than `var(--color-paper)`: the variable is defined
      // in the stylesheet, which is the thing that has not arrived yet.
      style={{ backgroundColor: '#f2efdc' }}
    >
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
