import { Invite } from '@/components/Invite'

/**
 * The same invitation with the invitation-card hero — the names stacked over
 * two lines, three columns of detail at the foot — at its own address, so the
 * designs can be compared by switching tabs.
 *
 * It used to be the one at `/`. The pattern is that whichever design
 * `site.design.hero` names lives at the root and every other one gets its own
 * URL, so promoting the monogram moved this here and freed `/monogram`.
 *
 * Not indexed: it is the same event as `/`, and several addresses for one
 * invitation is several more than a guest should be offered.
 */
export const metadata = { robots: { index: false, follow: false } }

export default function CardDesign() {
  return <Invite design="card" />
}
