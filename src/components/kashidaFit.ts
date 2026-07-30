import { kashidaJoins } from './kashida'

/**
 * Working out how many tatweels bring a line of Persian up to a given width.
 *
 * Kashida rather than letter-spacing: prising the joins apart breaks the word,
 * where a tatweel elongates the connecting stroke and the letters stay joined.
 * See kashida.ts.
 *
 * Measured on a canvas rather than in the DOM — no layout, no reflow, and it
 * can be done at one fixed size instead of whatever size the card happens to
 * be at. The answer is the same either way: everything on the card is sized in
 * one unit, so the ratio between any two lines holds at every scale and the
 * counts only have to be worked out once, after the faces have loaded.
 */

/** The size the fit measures at — big, so rounding to a whole tatweel is a
 *  small error rather than a visible one. */
const MEASURE_PX = 400

/** ARABIC TATWEEL. The stroke whose width sets the granularity of the fit. */
const TATWEEL = 'ـ'

export type Measured = { style: CSSStyleDeclaration; text: string }

function measure(ctx: CanvasRenderingContext2D, style: CSSStyleDeclaration, px: number, text: string) {
  ctx.font = `${style.fontStyle} ${style.fontWeight} ${px}px ${style.fontFamily}`
  return ctx.measureText(text).width
}

/**
 * @param targets the line, or lines, to match. The widest of them is the mark;
 *   the first one's size is the scale everything else is measured against.
 * @param lines   the Persian to stretch.
 * @returns one count per line, to hand to `kashidaTotal`.
 *
 * Width grows linearly with the number of strokes — they all elongate the same
 * connector — so one division lands on the answer with no searching.
 */
export function kashidaCounts(targets: Measured[], lines: Measured[]): number[] {
  const ctx = document.createElement('canvas').getContext('2d')
  if (!ctx || !targets.length) return lines.map(() => 0)

  const reference = parseFloat(targets[0].style.fontSize)
  const target = Math.max(...targets.map((t) => measure(ctx, t.style, MEASURE_PX, t.text)))

  return lines.map(({ style, text }) => {
    // A line set larger or smaller than the target has to be measured at the
    // same ratio, or the two widths are not in the same coordinate space.
    const px = MEASURE_PX * (parseFloat(style.fontSize) / reference)

    const bare = measure(ctx, style, px, text)
    const stroke = measure(ctx, style, px, TATWEEL)
    if (stroke <= 0 || kashidaJoins(text) === 0) return 0

    // Floor, not round: the last stroke is worth several percent of a short
    // line, and rounding up puts it past the target. Whatever it is being
    // fitted to already fits the box, so landing under is always safe and
    // landing over is not — an overshoot on the narrowest card wraps the line
    // and takes the whole composition with it.
    return Math.max(0, Math.floor((target - bare) / stroke))
  })
}
