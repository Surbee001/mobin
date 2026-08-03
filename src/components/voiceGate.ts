'use client'

/**
 * Keeps the two audio tracks off each other.
 *
 * Both begin when the envelope opens: the recitation plays once, and the
 * music loops behind it for the rest of the visit. They are ten seconds and
 * an unbounded track sharing one pair of speakers, so something has to hold
 * the second until the first has said its piece.
 *
 * The gate is CLOSED until the recitation has actually finished. That
 * direction matters: an open-by-default gate only works if the voice is
 * guaranteed to have claimed it before the music asks, and it is not. Both
 * are armed by the same unlock, in whatever order React runs their effects,
 * and each has a `play()` promise of its own to settle. Closed by default,
 * none of that can produce a moment where the music is allowed through early.
 *
 * The deadlock that a closed gate invites — the music waiting on a voice that
 * never plays — is handled by making the music START the voice rather than
 * merely wait for it. Whoever arrives first, the order comes out the same.
 *
 * A module-level value rather than React state on purpose. The two live in
 * different branches of the tree with no common owner below the page, and
 * lifting a flag that high to coordinate two `<audio>` elements would put
 * playback state in a component that has nothing else to do with sound.
 */

type State = 'idle' | 'playing' | 'done'

let state: State = 'idle'
const waiting: Array<() => void> = []
/** Registered by the panel that owns the recitation. */
let start: (() => void) | null = null

/** The recitation's owner offers a way to begin it on demand. */
export function registerVoice(begin: () => void) {
  start = begin
}

/** Called the moment the recitation is committed to playing. */
export function voiceStarted() {
  if (state === 'idle') state = 'playing'
}

/**
 * Called when the recitation ends — and ALSO when it cannot start.
 *
 * The failure case matters: if a browser refuses to play it, there is nothing
 * to wait for, and a gate that stayed shut would silence the music for the
 * rest of the visit rather than merely delaying it.
 */
export function voiceFinished() {
  state = 'done'
  // Splice, so a callback that somehow re-enters cannot run twice.
  waiting.splice(0).forEach((fn) => fn())
}

/**
 * Run `fn` once the recitation is done — immediately if it already is.
 *
 * If it has not begun, this begins it. That is what stops a closed gate from
 * becoming a stuck one: the music can be armed and asking before the voice's
 * own effect has run at all, and the answer is to play the recitation now and
 * queue the music behind it, not to let the music win.
 */
export function afterVoice(fn: () => void) {
  if (state === 'done') {
    fn()
    return
  }

  waiting.push(fn)

  if (state === 'idle') {
    if (start) start()
    // Nobody owns a recitation on this page — nothing to wait for.
    else voiceFinished()
  }
}
