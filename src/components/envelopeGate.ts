'use client'

/**
 * The moment the seal is pressed.
 *
 * Both tracks used to be armed off `locked` — the flag the smooth-scroll
 * provider lowers when the card has finished becoming the hero. That is the
 * END of the opening, not the start of it: the envelope timeline, the Flip
 * into the hero slot and the slot's own expansion run back to back, so the
 * page stayed silent for around four seconds after the guest had already
 * opened it, and then the recitation began over a card that had long since
 * settled. Sound belongs to the gesture that asked for it.
 *
 * It is not only a matter of timing. Autoplay policy grants a page the right
 * to make sound inside the task the gesture started, and the AudioContext
 * behind both tracks (audioLevel.ts) may only be resumed there too. Arming on
 * the click means `play()` and `resume()` are called while that permission is
 * live, instead of four seconds later on the strength of a gesture the browser
 * has stopped counting.
 *
 * So this is deliberately NOT React state and deliberately not an event on
 * `window`: the callbacks have to run SYNCHRONOUSLY, inside the click, and a
 * state update would put them a render away from it. It is the same shape as
 * voiceGate.ts next door, for the same reason — the two tracks live in
 * different branches of the tree with no common owner below the page.
 */

let opened = false
const waiting: Array<() => void> = []

/** Called by the seal, on the click, before anything else. */
export function openEnvelope() {
  if (opened) return
  opened = true
  // Splice, so a callback that somehow re-enters cannot run twice.
  waiting.splice(0).forEach((fn) => fn())
}

/**
 * Run `fn` when the envelope is opened — at once if it already has been.
 *
 * Registered from an effect, so in development React's double-invoked effects
 * will queue the same work twice; every caller here is idempotent on a ref of
 * its own rather than relying on this to de-duplicate.
 */
export function whenOpened(fn: () => void) {
  if (opened) {
    fn()
    return
  }
  waiting.push(fn)
}
