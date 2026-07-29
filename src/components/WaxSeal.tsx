'use client'

import { site } from '@/site.config'

/**
 * The wax seal.
 *
 * Drawn in SVG rather than CSS, because the thing that makes wax read as wax
 * is its *edge*: a struck blob never has a mathematically round outline. A
 * border-radius blob always does, however many decimals you give it.
 *
 * So the body is a union of four offset circles pushed around by a turbulence
 * displacement map — the outline comes out lumpy and slightly different on
 * every side, the way a poured blob does. A second, larger, more violently
 * displaced copy underneath is the wax that squeezed out from under the die.
 *
 * Everything that models light (the catch top-left, the pool of shadow at the
 * bottom, the thickness at the rim) lives *inside* the displaced group and is
 * clipped to the same union of circles — so the shading follows the irregular
 * edge instead of betraying the perfect circle underneath it.
 *
 * The die impression — the ring and the monogram — sits outside the filter,
 * crisp, because a steel die pressed into soft wax is the one part of this
 * that genuinely is regular.
 *
 * Geometry note: the blob is kept inside a radius of ~38 in a 120 box, because
 * displacement pushes pixels up to 12 units outward and the SVG viewport clips
 * anything past 120. So it covers about ⅔ of its own box — the caller has to
 * size the box accordingly.
 *
 * This and the paper texture are the only places on the site allowed gradients.
 *
 * Everything that models light here reads `--light-x` / `--light-y` rather
 * than a fixed offset — see light.ts. The cast shadow swings, the sheen
 * slides, and the two walls cut into the wax change which of them is the dark
 * one. It is done with CSS transforms rather than by recomputing the geometry
 * in React, because this component sits inside the envelope stage and must
 * not re-render while that timeline is running. At the light's rest position
 * every one of them resolves to the number it was originally written as.
 */
export function WaxSeal({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 120"
      className={className}
      aria-hidden="true"
      focusable="false"
      // Cast away from the lamp — hence the inverted sign — and at the same
      // 1.5 units it always fell.
      style={{
        filter:
          'drop-shadow(calc(var(--light-x) * -1.5px) calc(var(--light-y) * -1.5px) 2.5px rgba(124, 102, 66, 0.28))',
      }}
    >
      <defs>
        {/* Lit from the upper left, like everything else on the page.
            userSpaceOnUse so all four circles share one gradient instead of
            each getting its own and showing the seams.

            The range across it is deliberately narrow. A struck seal is a
            *flat* disc of wax — the die squashed it. Open this gradient up
            and shade the rim to match and you get a sphere sitting on the
            paper, which is the one thing it must not look like. */}
        {/* Gold, not wax — and the difference is the shape of this ramp, not
            the hue. Wax scatters light, so it darkens once, evenly, away from
            the source: three stops, bright to dark. Metal *reflects* what is
            around it, so a polished surface runs bright, dark, bright again,
            dark — those alternating bands are the environment showing up in
            it, and they are the whole tell. Flatten them back to a single
            falloff and it goes straight back to looking like a caramel. */}
        <linearGradient id="wax-dome" gradientUnits="userSpaceOnUse" x1="26" y1="24" x2="94" y2="98">
          <stop offset="0%" stopColor="#f4e9cf" />
          <stop offset="12%" stopColor="#e6d5a8" />
          <stop offset="26%" stopColor="#c4ab6d" />
          <stop offset="40%" stopColor="#eee1bb" />
          <stop offset="54%" stopColor="#bda468" />
          <stop offset="70%" stopColor="#a68d5c" />
          <stop offset="84%" stopColor="#cfb87f" />
          <stop offset="100%" stopColor="#917b52" />
        </linearGradient>

        {/* The union the blob is built from — reused as the clip so the
            shading inside can never spill past the edge. */}
        <clipPath id="wax-clip">
          <circle cx="60" cy="60" r="37" />
          <circle cx="54" cy="56" r="35" />
          <circle cx="66" cy="63" r="34" />
          <circle cx="59" cy="66" r="34" />
        </clipPath>

        {/* Wobble the outline, then dust the whole thing with a fine grain so
            the gradient does not read as airbrush. The grain is compressed to
            0.84–1.0 before it multiplies — full-range noise would turn the
            wax to mud. */}
        <filter
          id="wax-body"
          x="-20%"
          y="-20%"
          width="140%"
          height="140%"
          colorInterpolationFilters="sRGB"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.036"
            numOctaves="3"
            seed="9"
            result="warp"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="warp"
            scale="7"
            xChannelSelector="R"
            yChannelSelector="G"
            result="blob"
          />
          <feTurbulence
            type="fractalNoise"
            baseFrequency="1.05"
            numOctaves="2"
            seed="4"
            result="n"
          />
          <feColorMatrix in="n" type="saturate" values="0" result="grey" />
          <feComponentTransfer in="grey" result="soft">
            <feFuncR type="linear" slope="0.16" intercept="0.84" />
            <feFuncG type="linear" slope="0.16" intercept="0.84" />
            <feFuncB type="linear" slope="0.16" intercept="0.84" />
            <feFuncA type="linear" slope="0" intercept="1" />
          </feComponentTransfer>
          <feComposite in="soft" in2="blob" operator="in" result="grain" />
          <feBlend in="grain" in2="blob" mode="multiply" />
        </filter>

        {/* The squeeze-out gets pushed around harder — it is the part that ran. */}
        <filter
          id="wax-squeeze"
          x="-26%"
          y="-26%"
          width="152%"
          height="152%"
          colorInterpolationFilters="sRGB"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.027"
            numOctaves="3"
            seed="24"
            result="w"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="w"
            scale="12"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>

        <filter id="wax-soft" x="-70%" y="-70%" width="240%" height="240%">
          <feGaussianBlur stdDeviation="5" />
        </filter>

        {/* Tight blur, for the walls of the two things cut into the wax. */}
        <filter id="wax-groove" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="1.5" />
        </filter>

        {/* The field the die's ring encloses. */}
        <clipPath id="wax-field">
          <circle cx="60" cy="60" r="28" />
        </clipPath>
      </defs>

      {/* ── The wax that ran out from under the die ─────────────── */}
      <g filter="url(#wax-squeeze)" opacity="0.9">
        <circle cx="60" cy="60" r="39" fill="#c5af80" />
        <circle cx="52" cy="57" r="36" fill="#c5af80" />
        <circle cx="68" cy="64" r="36" fill="#c5af80" />
        <circle cx="60" cy="68" r="36" fill="#c5af80" />
      </g>

      {/* ── The dome, with its light modelled inside the same filter ── */}
      <g filter="url(#wax-body)">
        <g clipPath="url(#wax-clip)">
          <circle cx="60" cy="60" r="37" fill="url(#wax-dome)" />
          <circle cx="54" cy="56" r="35" fill="url(#wax-dome)" />
          <circle cx="66" cy="63" r="34" fill="url(#wax-dome)" />
          <circle cx="59" cy="66" r="34" fill="url(#wax-dome)" />

          {/* Thickness at the very edge only — a thin dark line where the wax
              turns down to meet the paper. Widen this and it immediately
              becomes the terminator of a sphere. */}
          <circle
            cx="60"
            cy="60"
            r="36"
            fill="none"
            stroke="#6d5836"
            strokeWidth="3.5"
            opacity="0.2"
            filter="url(#wax-groove)"
          />
          {/* A broad, flat sheen rather than a specular dot: the surface is a
              slab, so it takes light evenly.

              Drawn centred on the wax and carried out to where the light is,
              rather than parked at a fixed upper-left the way it used to be —
              the offset it once had is now simply what the rest position of
              the lamp produces. Clipped to the blob like everything else here,
              so it can slide right off the edge without spilling.

              Tighter and far brighter than it was as wax. A diffuse surface
              spreads a highlight out into a broad sheen; a specular one
              concentrates it, and the narrower and hotter it is the harder
              the material reads. */}
          <ellipse
            cx="60"
            cy="60"
            rx="21"
            ry="15"
            fill="#fdf6e4"
            opacity="0.26"
            filter="url(#wax-soft)"
            style={{
              transform: 'translate(calc(var(--light-x) * 15px), calc(var(--light-y) * 15px))',
            }}
          />
          {/* The hot core of that highlight, small and nearly white. */}
          <ellipse
            cx="60"
            cy="60"
            rx="8"
            ry="6"
            fill="#fdf8ea"
            opacity="0.24"
            filter="url(#wax-soft)"
            style={{
              transform: 'translate(calc(var(--light-x) * 19px), calc(var(--light-y) * 19px))',
            }}
          />
          {/* Bounce along the rim furthest from the lamp. Metal picks up the
              room on its shadow side; without this the far edge dies to flat
              brown and the whole thing reads as a moulded plastic. */}
          <ellipse
            cx="60"
            cy="60"
            rx="26"
            ry="21"
            fill="none"
            stroke="#f0e3c0"
            strokeWidth="4"
            opacity="0.34"
            filter="url(#wax-soft)"
            style={{
              transform: 'translate(calc(var(--light-x) * -13px), calc(var(--light-y) * -13px))',
            }}
          />
        </g>
      </g>

      {/* ── The die impression ──────────────────────────────────── */}
      {/* The only real relief on a struck seal is what the die cut into it.
          Everything here is a depression, so it shades the same way round:
          dark along the top wall, where the light cannot reach. That is drawn
          by shifting a stroked circle down and clipping it to where it started,
          so only its top edge survives. Shading the *bottom* wall to match
          takes a pale stroke, and a pale stroke on this palette reads as a
          white keyline around the field rather than as light — so the bottom
          wall is left to the flat tint alone. */}
      <g clipPath="url(#wax-field)">
        <circle cx="60" cy="60" r="28" fill="#6d5836" opacity="0.05" />
        {/* Shifted AWAY from the lamp, so the arc left inside the clip is the
            wall facing it. At rest that is the two units straight down this
            was drawn with; as the light swings, so does which side of the
            field is in shadow. */}
        <circle
          cx="60"
          cy="60"
          r="27.2"
          fill="none"
          stroke="#6d5836"
          strokeWidth="2.8"
          opacity="0.3"
          filter="url(#wax-groove)"
          style={{
            transform: 'translate(calc(var(--light-x) * -2px), calc(var(--light-y) * -2px))',
          }}
        />
      </g>
      {/* The cut edge of the groove itself. */}
      <circle cx="60" cy="60" r="28" fill="none" stroke="#7d6743" strokeWidth="1" opacity="0.3" />

      {/* The monogram, struck *into* the wax: dark along the top edge where the
          depression shades, light along the bottom where it catches.

          Set at the same hairline weight as the names on the card. A thin
          stroke can only carry a shallow impression before the two offset
          copies start to read as three separate letters instead of one
          pressed into the surface, so both offsets are kept under a unit and
          the face itself sits barely off the wax around it. */}
      <g
        className="font-display"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="16"
        fontWeight={100}
      >
        <text
          x="60"
          y="60"
          fill="#6d5836"
          opacity="0.5"
          style={{
            transform: 'translate(calc(var(--light-x) * 0.45px), calc(var(--light-y) * 0.45px))',
          }}
        >
          {site.couple.monogram}
        </text>
        <text
          x="60"
          y="60"
          fill="#f7edd6"
          opacity="0.26"
          style={{
            transform: 'translate(calc(var(--light-x) * -0.68px), calc(var(--light-y) * -0.68px))',
          }}
        >
          {site.couple.monogram}
        </text>
        <text x="60" y="60.1" fill="#ad9463">
          {site.couple.monogram}
        </text>
      </g>
    </svg>
  )
}
