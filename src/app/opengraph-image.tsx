import { ImageResponse } from 'next/og'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { site } from '@/site.config'

export const alt = site.meta.description
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

/** Envelope proportions at the desktop breakpoint — 7:5 landscape. */
const ENV_W = 680
const ENV_H = Math.round((ENV_W * 5) / 7)
const FLAP = 0.46
/** The seal, at the share it takes of the envelope on the page. */
const SEAL = Math.round(ENV_W * 0.19)
/** Where the flap's point lands — the chevron's notch, and the seal's centre. */
const NOTCH = Math.round(ENV_H * FLAP)
/** The arch stands taller than the pocket, so its crop lands on the flowers. */
const ARCH_H = Math.round(ENV_H * 1.1949)

/**
 * A note on the clip-paths below, which are written in pixels rather than in
 * the percentages the page itself uses.
 *
 * Satori resolves the X of a percentage polygon point against the box's
 * HEIGHT, not its width. On the square boxes it is usually tested with that
 * is invisible; on this envelope the flap's `polygon(0 0, 100% 0, 50% 100%)`
 * came out a third of the width it should have been. Pixels sidestep it.
 */

/**
 * Everything this route draws with lives in `src/og/` and is used nowhere
 * else on the site — because Satori, which is what `next/og` renders through,
 * reads none of the formats the site itself is built out of.
 *
 * Fonts: Satori parses TTF, OTF and WOFF, and NOT WOFF2. Every face the page
 * loads is woff2, so these are TTF cuts of the same two files.
 *
 * They are also *static* cuts rather than the variable originals, because
 * Satori renders a variable font at its default instance and ignores the
 * weight asked for below. Tobias VF defaults to wght 100 — Thin — so the
 * prompt would have arrived several shades lighter than the sealed envelope
 * it is imitating. Cut at 300, which is the weight that screen uses.
 *
 * Images: Satori cannot read WebP — not a rendering difference, it cannot
 * size the image at all and throws. Every plate in `public/` is WebP, so the
 * seal and the arch are re-encoded here as PNG and JPEG, at roughly twice the
 * size they are actually drawn at. The seal keeps an alpha channel and so has
 * to be the PNG; the arch is laid over an opaque pocket and does not.
 *
 * All four are read from disk rather than fetched. This runs at build time,
 * and a build that needs a font server to be up is a build that can fail for
 * reasons that have nothing to do with the commit.
 */
const OG = 'src/og'

/**
 * Persian, laid out right to left by hand.
 *
 * Satori shapes and joins Arabic script correctly but does not reorder it:
 * it sets the words left to right, so a sentence arrives back to front while
 * every word in it is spelled perfectly. `dir="rtl"`, `direction: rtl` and
 * the Unicode bidi controls (RLE, RLM) were all tried — the first two change
 * nothing at all, and the controls render as tofu boxes in the line.
 *
 * Reversing the words is what is left. It is safe only because this is one
 * short line of pure Persian with no Latin or digits mixed in; a real bidi
 * run would need a real algorithm, not this. It lives here and nowhere near
 * the site itself, where the browser does the job properly.
 */
const rtl = (s: string) => s.split(' ').reverse().join(' ')

export default async function Image() {
  const [tobias, markazi, seal, arch] = await Promise.all([
    readFile(join(process.cwd(), OG, 'Tobias-Light.ttf')),
    readFile(join(process.cwd(), OG, 'MarkaziText-Regular.ttf')),
    readFile(join(process.cwd(), OG, 'seal.png')),
    readFile(join(process.cwd(), OG, 'arch.jpg')),
  ])

  const sealSrc = `data:image/png;base64,${seal.toString('base64')}`
  const archSrc = `data:image/jpeg;base64,${arch.toString('base64')}`

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          backgroundColor: '#f2efdc',
          fontFamily: 'Tobias',
        }}
      >
        {/* The sealed envelope.
            
            Every layer is positioned with explicit sides and no `zIndex`,
            because Satori supports neither the `inset` shorthand nor
            `z-index` — the first is silently dropped, which left each layer
            auto-sized and scattered, and the second it warns about and
            ignores. What stacks these is document order alone, so the five
            below are written back to front and must stay that way. */}
        <div
          style={{
            position: 'relative',
            width: ENV_W,
            height: ENV_H,
            display: 'flex',
          }}
        >
          {/* Inside back. */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: ENV_W,
              height: ENV_H,
              backgroundColor: '#ebd1c8',
            }}
          />

          {/* Card peeking from the pocket — monogram ground colour. */}
          <div
            style={{
              position: 'absolute',
              left: ENV_W * 0.06,
              top: ENV_H * 0.08,
              width: ENV_W * 0.88,
              height: ENV_H * 0.88,
              backgroundColor: '#f2dcd4',
            }}
          />

          {/* Front pocket with chevron cut.

              The arch is a BACKGROUND rather than a child <img>, because a
              positioned child is not clipped by its parent's clip-path here —
              it escaped the chevron and covered the whole envelope, flap and
              all. A background layer is painted inside the shape, so the cut
              holds. Its 47% wash over the pocket colour is baked into the
              JPEG, a background layer having no opacity of its own. */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: ENV_W,
              height: ENV_H,
              backgroundColor: '#d9b6a9',
              backgroundImage: `url(${archSrc})`,
              backgroundSize: `${ENV_W}px ${ARCH_H}px`,
              backgroundPosition: 'left bottom',
              clipPath: `polygon(0px 0px, ${ENV_W / 2}px ${NOTCH}px, ${ENV_W}px 0px, ${ENV_W}px ${ENV_H}px, 0px ${ENV_H}px)`,
            }}
          />

          {/* Flap, closed. */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: ENV_W,
              height: NOTCH,
              backgroundColor: '#e3c4b9',
              clipPath: `polygon(0px 0px, ${ENV_W}px 0px, ${ENV_W / 2}px ${NOTCH}px)`,
            }}
          />

          {/* Wax seal on the flap join. Centred by arithmetic, not by a
              translate — the transform origin Satori uses for a percentage
              translate is not the one the browser uses. */}
          <img
            src={sealSrc}
            alt=""
            width={SEAL}
            height={SEAL}
            style={{
              position: 'absolute',
              left: (ENV_W - SEAL) / 2,
              top: NOTCH - SEAL / 2,
            }}
          />
        </div>

        {/* Prompt — same stack as the sealed envelope screen. */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginTop: 36,
            gap: 8,
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 300,
              letterSpacing: '0.18em',
              color: '#a8825e',
            }}
          >
            {site.opening.promptEn}
          </div>
          <div
            style={{
              fontFamily: 'Markazi',
              fontSize: 15,
              fontWeight: 400,
              color: 'rgba(168, 130, 94, 0.7)',
            }}
          >
            {rtl(site.opening.prompt)}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: 'Tobias', data: tobias, style: 'normal', weight: 300 },
        { name: 'Markazi', data: markazi, style: 'normal', weight: 400 },
      ],
    },
  )
}
