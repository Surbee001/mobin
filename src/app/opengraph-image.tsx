import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { site } from '@/site.config'

/**
 * The image a shared link unfurls into: a photograph of the invitation, taken
 * from the site itself.
 *
 * It used to be a drawing. `next/og` renders through Satori, and the whole
 * sealed envelope was rebuilt inside it in flat divs and clip-paths — which
 * worked, and was a forgery. Satori reads none of the formats the page is
 * actually built out of (no WOFF2, no WebP, no variable fonts, no blend modes,
 * no container queries), so every plate had to be re-encoded and every face
 * re-cut, and what came out was a careful approximation of a card rather than
 * the card. The engraved ground, the swans, the two initials running off the
 * edges — none of it could be in the picture at all.
 *
 * So this is a screenshot instead: real Chrome, real fonts, the real card at
 * the moment the envelope has finished opening and it fills the screen. It is
 * checked in as a file because it has to be — it cannot be rendered on a
 * server, only photographed on a machine with a browser.
 *
 * Which means it can go stale, silently, the moment the hero design changes.
 * `npm run og` retakes it: see scripts/og-shot.mjs.
 *
 * This stays a route rather than becoming a bare `opengraph-image.jpg`, which
 * Next would also accept, for one reason: the alt text. Every word on this site
 * lives in site.config, and the file convention would move this one into an
 * `opengraph-image.alt.txt` sitting off on its own.
 */

/** The JPEG's true pixel size — a 2× capture of the 1200×630 share frame. */
export const size = { width: 2400, height: 1260 }
export const contentType = 'image/jpeg'
export const alt = site.meta.description

export default async function Image() {
  const jpeg = await readFile(join(process.cwd(), 'src/og/card-open.jpg'))

  // A copy into a plain Uint8Array, not the Buffer itself: `Response` wants a
  // BodyInit, and a Buffer is a view onto a pooled ArrayBuffer that may be far
  // larger than the file.
  return new Response(new Uint8Array(jpeg), {
    headers: {
      'Content-Type': contentType,
      // Nothing behind this URL can change without the build that produced it
      // changing too — Next fingerprints the route in the meta tag it writes.
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}
