import { Invite } from '@/components/Invite'

/**
 * The same invitation with the alternate hero, at its own address, so the two
 * designs can be looked at side by side without editing anything.
 *
 * Not indexed: it is the same event as `/`, and two addresses for one
 * invitation is one more than a guest should ever be offered.
 */
export const metadata = { robots: { index: false, follow: false } }

export default function VerseDesign() {
  return <Invite design="verse" />
}
