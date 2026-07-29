/**
 * The engraved flourish that divides the three columns at the foot of the card.
 *
 * A serpentine spine with a curl at each end, drawn once and rendered twice —
 * upright for the three-column setting, laid on its side for the stacked one.
 * The two are swapped by the same container query that swaps the columns, so
 * both have to be in the DOM: a container query is CSS, and CSS cannot tell
 * React which of the two to render.
 *
 * Turning it on its side is done inside the SVG rather than with a CSS
 * rotation, because a CSS rotation leaves the layout box unrotated — a tall
 * thin element would still reserve a tall thin slot in a row of short wide
 * ones. `translate(61 0) rotate(90)` maps the upright drawing's 14×61 into
 * the 61×14 viewBox exactly.
 */

const SPINE = 'M7 8 C11 13 3 18 7 23 C11 28 3 33 7 38 C11 43 3 48 7 53'
const CURL_TOP = 'M7 8 C7 4.5 4.8 2.6 3.2 4 C1.9 5.2 2.9 7.2 4.6 6.6'
const CURL_BOTTOM = 'M7 53 C7 56.5 9.2 58.4 10.8 57 C12.1 55.8 11.1 53.8 9.4 54.4'

const marks = (
  <>
    <path d={SPINE} />
    <path d={CURL_TOP} />
    <path d={CURL_BOTTOM} />
  </>
)

const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1,
  strokeLinecap: 'round' as const,
}

/**
 * @param mirror turn it end for end. The pair either side of the middle column
 *   are the same drawing, so without this the right-hand one repeats the left
 *   rather than answering it; mirrored, the two curl away from the centre and
 *   the foot of the card is symmetrical about it.
 */
export function Flourish({ mirror = false }: { mirror?: boolean }) {
  return (
    <span className={`info-rule ${mirror ? 'info-rule-mirror' : ''}`} aria-hidden="true">
      <svg className="info-rule-h" viewBox="0 0 61 14" {...stroke}>
        <g transform="translate(61 0) rotate(90)">{marks}</g>
      </svg>
      <svg className="info-rule-v" viewBox="0 0 14 61" {...stroke}>
        {marks}
      </svg>
    </span>
  )
}
