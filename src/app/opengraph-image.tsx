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

export default async function Image() {
  const [tobias, markazi, seal, arch] = await Promise.all([
    readFile(join(process.cwd(), 'src/fonts/TobiasVF-TRIAL.woff2')),
    fetch(
      'https://fonts.gstatic.com/s/markazitext/v18/SykgA19X7nSxSWyOWMO12g.woff2',
    ).then((res) => res.arrayBuffer()),
    readFile(join(process.cwd(), 'public/seal-swans.webp')),
    readFile(join(process.cwd(), 'public/garden-arch.webp')),
  ])

  const sealSrc = `data:image/webp;base64,${seal.toString('base64')}`
  const archSrc = `data:image/webp;base64,${arch.toString('base64')}`

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
              inset: 0,
              backgroundColor: '#ebd1c8',
            }}
          />

          {/* Card peeking from the pocket — monogram ground colour. */}
          <div
            style={{
              position: 'absolute',
              left: `${ENV_W * 0.06}px`,
              right: `${ENV_W * 0.06}px`,
              bottom: `${ENV_H * 0.04}px`,
              height: `${ENV_H * 0.88}px`,
              backgroundColor: '#f2dcd4',
              zIndex: 1,
            }}
          />

          {/* Front pocket with chevron cut. */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: '#d9b6a9',
              clipPath: `polygon(0 0, 50% ${FLAP * 100}%, 100% 0, 100% 100%, 0 100%)`,
              zIndex: 2,
              overflow: 'hidden',
              display: 'flex',
            }}
          >
            <img
              src={archSrc}
              alt=""
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '119.49%',
                objectFit: 'cover',
                objectPosition: '50% 100%',
                opacity: 0.47,
              }}
            />
          </div>

          {/* Flap, closed. */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: `${FLAP * 100}%`,
              zIndex: 3,
              display: 'flex',
            }}
          >
            <div
              style={{
                width: '100%',
                height: '100%',
                backgroundColor: '#e3c4b9',
                clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
              }}
            />
          </div>

          {/* Wax seal on the flap join. */}
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: `${FLAP * 100}%`,
              width: `${ENV_W * 0.19}px`,
              height: `${ENV_W * 0.19}px`,
              transform: 'translate(-50%, -50%)',
              zIndex: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <img
              src={sealSrc}
              alt=""
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
              }}
            />
          </div>
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
            {site.opening.prompt}
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
