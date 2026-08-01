'use client'

/**
 * Keeps the two audio tracks off each other.
 *
 * The recitation plays once, on the blessing panel. The background music
 * loops, and starts a panel later on the invitation. Scrolled at a normal
 * pace those never meet — scrolled quickly they do, and then the music comes
 * up underneath a voice that is still speaking.
 *
 * The gate is CLOSED until the recitation has actually finished. That
 * direction matters: an open-by-default gate only works if the blessing's
 * scroll trigger is guaranteed to fire before the invitation's, and it is
 * not. Both can be evaluated in the same scroll update, a re-render can
 * rebuild either of them after the reader is already past both, and a jump
 * can skip a trigger's start position entirely. Closed by default, none of
 * that can produce a moment where the music is allowed through early.
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
 * becoming a stuck one: arriving at the music's trigger without having passed
 * the voice's is exactly the fast-scroll case, and the answer is to play the
 * recitation now and queue the music behind it, not to let the music win.
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
