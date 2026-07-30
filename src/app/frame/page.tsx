import { Invite } from '@/components/Invite'

/**
 * The same invitation with the third hero — the names alone inside the
 * engraved border — at its own address, so the designs can be compared by
 * switching tabs.
 *
 * Not indexed: it is the same event as `/`, and several addresses for one
 * invitation is several more than a guest should be offered.
 */
export const metadata = { robots: { index: false, follow: false } }

export default function FrameDesign() {
  return <Invite design="frame" />
}
