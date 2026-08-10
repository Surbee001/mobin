import { SmoothScroll } from '@/components/SmoothScroll'
import { Opening } from '@/components/Opening'
import { Hero } from '@/components/Hero'
import { Aya } from '@/components/Aya'
import { Poem } from '@/components/Poem'
import { Invitation } from '@/components/Invitation'
import { Location } from '@/components/Location'
import { Countdown } from '@/components/Countdown'
import { Confetti } from '@/components/Confetti'
import { ScrollCue } from '@/components/ScrollCue'
import { Music } from '@/components/Music'
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

      {/* Says there is more below, until there isn't. */}
      <ScrollCue />

      {/* Fires once, when the clock comes into view. */}
      <Confetti trigger="#countdown" />

      {/* Starts under the recitation, then loops. */}
      <Music />
    </SmoothScroll>
  )
}
