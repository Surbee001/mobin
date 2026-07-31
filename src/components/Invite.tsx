import { SmoothScroll } from '@/components/SmoothScroll'
import { Opening } from '@/components/Opening'
import { Hero } from '@/components/Hero'
import { Aya } from '@/components/Aya'
import { Poem } from '@/components/Poem'
import { Invitation } from '@/components/Invitation'
import { Location } from '@/components/Location'
import { Countdown } from '@/components/Countdown'
import { Confetti } from '@/components/Confetti'
import { Music } from '@/components/Music'
import { EnvelopeEditor } from '@/components/EnvelopeEditor'
import { ThemeEditor } from '@/components/ThemeEditor'
import { site, type HeroDesign } from '@/site.config'

/**
 * The whole invitation, from the sealed envelope to the last section.
 *
 * It takes the hero design as an argument so that the two can be served at
 * two addresses and compared by switching tabs — `/` is whichever design
 * `site.design.hero` names, and `/verse` is always the poster. Everything
 * below the hero is the same either way.
 */
export function Invite({ design = site.design.hero }: { design?: HeroDesign }) {
  return (
    <SmoothScroll>
      {/* The sealed envelope, over everything, until it is opened. */}
      <Opening design={design} />

      <main>
        <Hero />
        <Aya />
        <Poem />
        <Invitation />
        <Countdown />
        <Location />
      </main>

      {/* Fires once, when the closing section comes into view. */}
      <Confetti trigger="#finale" />

      {/* Starts at the Persian invitation, then loops. */}
      <Music />

      {/* Development only — both return null in a production build. */}
      <EnvelopeEditor />
      <ThemeEditor />
    </SmoothScroll>
  )
}
