'use client'

/**
 * Setting the level of an <audio> element on the phones this is read on.
 *
 * `HTMLMediaElement.volume` is READ-ONLY on iOS. Assigning to it is not an
 * error and not a warning — it is silently ignored, and the hardware buttons
 * on the side of the phone remain the only volume control the platform will
 * admit to. Every desktop browser honours it, which is what makes the bug so
 * easy to ship: the fades test perfectly and then do nothing whatsoever on
 * the device most guests will actually open the invitation on.
 *
 * The consequence was not a missing fade so much as an unattenuated one. The
 * recitation asks to start at 0 and swell; on an iPhone it started at 1 and
 * stayed there, arriving at whatever level the file happens to be mastered
 * at. The music asks to sit at 0.32 under the page and was playing at three
 * times that.
 *
 * A GainNode has no such restriction, so the fix is to stop asking the
 * element for a volume and put a real gain stage after it: the element is
 * routed through Web Audio once, and everything after that sets `gain.value`
 * instead. iOS applies it like anywhere else.
 *
 * Two things this deliberately does NOT do:
 *
 *   It does not tween. The ramps stay in GSAP, in the components that own
 *   them, driving `setLevel` from an `onUpdate` — Web Audio's own scheduling
 *   is smoother in principle, but it has no completion callback and the music
 *   toggle needs to pause the element at the END of its fade-out. One timing
 *   mechanism for both is worth more here than a sample-accurate ramp.
 *
 *   It does not throw or assert. Every failure — no AudioContext, a context
 *   that will not start, an element already routed elsewhere — falls back to
 *   `element.volume`, which is exactly the behaviour that was there before.
 *   Sound coming out at the wrong level is a blemish; sound not coming out is
 *   the invitation being broken.
 */

let shared: AudioContext | null = null
/** Latched once construction has failed, so it is not retried per call. */
let unavailable = false

/**
 * One context for the page, not one per element.
 *
 * Browsers cap how many an origin may hold open (Chrome at six), and a page
 * that leaks them stops being able to make any sound at all. Two tracks share
 * this one.
 */
function context(): AudioContext | null {
  if (shared || unavailable) return shared

  const Ctor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext

  if (!Ctor) {
    unavailable = true
    return null
  }

  try {
    shared = new Ctor()
  } catch {
    unavailable = true
  }

  return shared
}

/**
 * The gain stage for an element, made once and remembered.
 *
 * `createMediaElementSource` may be called only ONCE for a given element — a
 * second call throws InvalidStateError, and the element is left routed to the
 * first node either way. Hence the map: `prime` and `setLevel` can both ask
 * for this, from different effects and at any point in the visit, and only
 * the first of them actually builds anything.
 *
 * Weak, so an unmounted element takes its node with it.
 */
const gains = new WeakMap<HTMLMediaElement, GainNode>()

function gainFor(el: HTMLMediaElement): GainNode | null {
  const found = gains.get(el)
  if (found) return found

  const ctx = context()
  if (!ctx) return null

  try {
    const gain = ctx.createGain()
    ctx.createMediaElementSource(el).connect(gain).connect(ctx.destination)
    gains.set(el, gain)
    return gain
  } catch {
    // Already routed, or the element is cross-origin tainted. `setLevel` will
    // fall through to `volume` from here on.
    return null
  }
}

/**
 * Build the gain stage and get the context running. Call it ON the gesture.
 *
 * The timing is the whole point, and it is why this is separate from
 * `setLevel`. An AudioContext is born `suspended` and a suspended context
 * passes NO audio — so once an element is routed through one, priming late is
 * worse than never priming at all: it would take a track that used to play
 * and silence it. `resume()` is only granted inside a user gesture, and the
 * envelope being opened is the one gesture this page can count on.
 */
export function prime(el: HTMLMediaElement) {
  const gain = gainFor(el)
  if (!gain) return

  // Chrome hands back a running context and Safari a suspended one; asking
  // either way is harmless and the promise is deliberately unawaited — the
  // caller has a `play()` of its own to get on with.
  if (shared && shared.state !== 'running') void shared.resume()
}

/**
 * Set the level, 0–1. The gain stage if there is one, the element if not.
 *
 * Called from inside GSAP's `onUpdate`, so: no allocation, no scheduling, no
 * try/catch on the hot path.
 */
export function setLevel(el: HTMLMediaElement, value: number) {
  const gain = gains.get(el)
  if (gain) gain.gain.value = value
  else el.volume = value
}
