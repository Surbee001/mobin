'use client'

/**
 * The light.
 *
 * Every shadow on this site is drawn against one assumption — that the light
 * falls from above — and the whole letterpress conceit rests on it. Type
 * pressed into paper darkens along its top wall and catches along its bottom
 * lip; the wax casts downward; the die impression shades the same way round.
 * Say it once, everywhere, and the page reads as an object rather than as a
 * drawing of one.
 *
 * This makes that one assumption movable. Two custom properties on the root
 * element, `--light-x` and `--light-y`, hold the direction the light comes
 * FROM as a unit vector in screen coordinates: +x to the right, +y down. At
 * rest it is (0, -1) — straight above, exactly where every one of those
 * shadows was authored — so with this module never mounted, or on a device
 * that asks for reduced motion, the page looks precisely as it did before.
 *
 * Nothing here goes through React. The numbers are written straight onto the
 * documentElement inside a rAF loop and CSS does the rest with `calc()`. A
 * pointer-driven re-render would be a re-render sixty times a second of the
 * one component — the card — that must never re-render at all.
 *
 * The light is never allowed below the horizon. Let it swing the whole way
 * round and every depression on the page inverts into a relief: the names
 * stop being pressed into the card and start standing off it, which is the
 * single thing the design is trying hardest not to look like. So the vertical
 * component is clamped to the upper half, and what the guest gets is a
 * wander, not a revolution.
 */

type Vec = { x: number; y: number }

/** Where the light sits when nothing is moving it: straight above. */
const REST: Vec = { x: 0, y: -1 }

/** How far to either side it is allowed to swing, before normalising. */
const SWING = 0.75

/**
 * The shallowest the light ever gets, as a fraction of straight overhead.
 * At 1 it is directly above; at this value it is grazing across the sheet,
 * which is as far as it can go before the impressions start to read oddly.
 */
const GRAZE = 0.28

/**
 * How far the light closes on its target each frame. Low enough that a flick
 * of the wrist arrives as a slide rather than a jump — the light is a heavy
 * thing hanging above the page, not a cursor.
 */
const EASE = 0.09

/** Below this the move is over; chasing it further is frames spent on nothing. */
const SETTLED = 0.0015

/**
 * How far the aim has to move before it counts as having moved at all.
 *
 * A gyroscope never reports the same number twice — a phone lying still on a
 * table still jitters in the third decimal place, every reading, forever. Take
 * each of those at face value and the target is never reached, the rAF loop
 * never stops, and the page repaints a full-screen gradient sixty times a
 * second to no visible effect for as long as it is open. This is the floor
 * that lets the light actually arrive somewhere and stay there.
 */
const DEADBAND = 0.012

let target: Vec = { ...REST }
let current: Vec = { ...REST }
let frame = 0

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n))

function write() {
  const root = document.documentElement.style
  root.setProperty('--light-x', current.x.toFixed(3))
  root.setProperty('--light-y', current.y.toFixed(3))
}

function tick() {
  const dx = target.x - current.x
  const dy = target.y - current.y

  if (Math.abs(dx) < SETTLED && Math.abs(dy) < SETTLED) {
    current = { ...target }
    write()
    frame = 0
    return
  }

  current = { x: current.x + dx * EASE, y: current.y + dy * EASE }
  write()
  frame = requestAnimationFrame(tick)
}

/**
 * Point the light. Normalised, so only its *direction* ever changes and the
 * shadows keep the same length whichever way round it is — a lamp swinging on
 * a cord, at a fixed height above the page.
 */
function aim(x: number, y: number) {
  const len = Math.hypot(x, y) || 1
  const next = { x: x / len, y: y / len }

  if (Math.abs(next.x - target.x) < DEADBAND && Math.abs(next.y - target.y) < DEADBAND) return

  target = next
  if (!frame) frame = requestAnimationFrame(tick)
}

/**
 * `depth` runs 0 at the top of the screen to 1 at the bottom, and carries the
 * light from straight overhead down to grazing. Both input paths hand their
 * reading over in these terms, so the two feel like the same light.
 */
const aimAt = (side: number, depth: number) =>
  aim(clamp(side, -1, 1) * SWING, -(1 - clamp(depth, 0, 1) * (1 - GRAZE)))

/** The pointer is the lamp: the page is lit from wherever it is. */
function onPointer(e: PointerEvent) {
  aimAt((e.clientX / window.innerWidth - 0.5) * 2, e.clientY / window.innerHeight)
}

/**
 * With a gyroscope the light stops being a cursor and becomes what it is
 * pretending to be — a fixed thing in the room, that the page turns under.
 *
 * `gamma` is the roll, in degrees, positive with the right edge dropping.
 * Roll the phone to the right and the world's "up" now lies off toward the
 * device's upper LEFT, so the sign is inverted. `beta` is the pitch: about
 * 90° held upright facing you, falling toward 0° as it is laid on its back,
 * which is also the axis along which a fixed lamp goes from grazing across
 * the sheet to standing straight over it.
 */
function onTilt(e: DeviceOrientationEvent) {
  if (e.gamma == null || e.beta == null) return
  // A device that reports orientation does not also need the pointer, and
  // letting both drive it means sixty gyroscope readings a second stamping
  // on every finger drag.
  window.removeEventListener('pointermove', onPointer)
  aimAt(-e.gamma / 45, (clamp((e.beta - 45) / 45, -1, 1) + 1) / 2)
}

/**
 * True on iOS, where the sensor sits behind a permission prompt.
 *
 * That prompt is the reason this site does not tilt on an iPhone. Safari will
 * only raise it from inside a user gesture, and there are exactly two on the
 * page: the tap that opens the envelope, which would put a system dialog over
 * the best two seconds here, and a tap on the card afterwards, which would
 * raise one out of nowhere for a guest who only meant to touch the paper.
 * Neither is worth it for an effect most people will never consciously notice.
 *
 * So on iOS the pointer path is the whole story, and a finger dragged across
 * the card moves the lamp directly — which is arguably the better version:
 * the light follows the hand rather than the room.
 *
 * Android and desktop hand the events over without asking, and get the real
 * thing. Note that `deviceorientation` is blocked outside a secure context
 * even there, so testing on a phone means HTTPS — `npm run dev:https`.
 */
const gated = () =>
  typeof (DeviceOrientationEvent as unknown as { requestPermission?: unknown })
    ?.requestPermission === 'function'

/**
 * Bind the light to whatever the device can tell us about where it is.
 * Returns its own teardown. Safe to call on the server; safe to call twice.
 */
export function watchLight() {
  if (typeof window === 'undefined') return () => {}
  // A guest who has asked for less motion gets the light nailed where every
  // shadow already expects it, and no listeners at all.
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return () => {}

  window.addEventListener('pointermove', onPointer, { passive: true })

  // Everywhere the sensor is simply handed over, take it. Where it is gated,
  // do not ask — see the note on `gated`.
  if (!gated()) window.addEventListener('deviceorientation', onTilt)

  return () => {
    window.removeEventListener('pointermove', onPointer)
    window.removeEventListener('deviceorientation', onTilt)
    if (frame) cancelAnimationFrame(frame)
    frame = 0
    current = { ...REST }
    target = { ...REST }
    write()
  }
}
