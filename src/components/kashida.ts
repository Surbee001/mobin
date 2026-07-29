/**
 * Kashida (کشیده), a.k.a. tatweel.
 *
 * The traditional way to stretch Arabic-script type. `letter-spacing` prises
 * the joins apart and the word falls to pieces; a kashida instead elongates
 * the connecting stroke itself, so the letters stay joined and the join
 * becomes a long flat line along the baseline. It is what calligraphers use
 * to justify a line of naskh.
 *
 * Mechanically it is U+0640 ARABIC TATWEEL inserted between letters — but it
 * can only go where a join actually exists, which is the whole difficulty.
 */

const TATWEEL = 'ـ'

/**
 * Letters that join to the letter *before* them but not to the one after.
 * A kashida after any of these has nothing to connect to and renders as a
 * dash floating in the gap.
 */
const NO_FORWARD_JOIN = new Set(Array.from('اأإآٱدذرزژوؤةۀڈڑء'))

/** Arabic-script letters, including the Persian-only ones (پ چ ژ گ ک ی). */
const isLetter = (ch: string) =>
  /[ء-يٮ-ۓۮۯۺ-ۿ]/.test(ch)

/** Harakat and other combining marks. They belong to the letter before them. */
const isMark = (ch: string) => /[ً-ٰٟۖ-ۭ]/.test(ch)

type Cluster = { base: string; marks: string }

/**
 * Stretch a string with kashidas.
 *
 * @param text   the string to stretch
 * @param repeat how many tatweels per join — 1 is a gentle opening out,
 *               3–4 is properly editorial
 *
 * Marks are kept attached to the letter they sit on, and the kashida is
 * placed after them, so vowel points stay over the right letter instead of
 * sliding onto the stroke.
 */
export function kashida(text: string, repeat = 2): string {
  const stroke = Math.max(1, repeat)
  const clusters = split(text)
  return assemble(
    clusters,
    new Map(joinsIn(clusters).map((at) => [at, stroke])),
  )
}

/**
 * Stretch a string by EXACTLY `total` tatweels, dealt out over the joins it
 * has rather than repeated at every one of them.
 *
 * `kashida()` above puts the same number at each join, which is the right
 * shape for a paragraph but far too coarse for a single short word: a
 * four-letter name has three joins, so one repeat is three strokes and lands
 * most of a letter-width past wherever you were aiming. Here the count is the
 * whole budget, so a line can be brought to a target width one stroke at a
 * time.
 *
 * They are dealt from the end of the word backwards, which is where a hand
 * would open a word out first — the last join before the final letter is the
 * one with room to spare.
 */
export function kashidaTotal(text: string, total: number): string {
  if (total <= 0) return text

  const clusters = split(text)
  const joins = joinsIn(clusters)
  if (!joins.length) return text

  const counts = new Map<number, number>()
  for (let n = 0; n < total; n++) {
    const at = joins[joins.length - 1 - (n % joins.length)]
    counts.set(at, (counts.get(at) ?? 0) + 1)
  }

  return assemble(clusters, counts)
}

/** How many places in `text` a kashida can legally go. */
export function kashidaJoins(text: string): number {
  return joinsIn(split(text)).length
}

/** Group each base letter with any combining marks that follow it. */
function split(text: string): Cluster[] {
  const clusters: Cluster[] = []
  for (const ch of Array.from(text)) {
    if (isMark(ch) && clusters.length) clusters[clusters.length - 1].marks += ch
    else clusters.push({ base: ch, marks: '' })
  }
  return clusters
}

/**
 * The indices a kashida may follow. A join only exists between two letters,
 * and only if this one reaches forward. Everything else — spaces, digits,
 * punctuation, ا د ر و … — ends the run.
 */
function joinsIn(clusters: Cluster[]): number[] {
  const at: number[] = []
  clusters.forEach((cluster, i) => {
    const next = clusters[i + 1]
    if (!next) return
    if (!isLetter(cluster.base) || NO_FORWARD_JOIN.has(cluster.base)) return
    if (!isLetter(next.base)) return
    at.push(i)
  })
  return at
}

/** Marks stay attached to the letter they sit on; the stroke follows them. */
function assemble(clusters: Cluster[], counts: Map<number, number>): string {
  return clusters
    .map((cluster, i) => cluster.base + cluster.marks + TATWEEL.repeat(counts.get(i) ?? 0))
    .join('')
}
