import { Invite } from '@/components/Invite'

/**
 * The same invitation with the fourth hero — two initials the height of the
 * card, the notice held between them — at its own address, so the designs can
 * be compared by switching tabs.
 *
 * Not indexed: it is the same event as `/`, and several addresses for one
 * invitation is several more than a guest should be offered.
 */
export const metadata = { robots: { index: false, follow: false } }

export default function MonogramDesign() {
  return <Invite design="monogram" />
}
