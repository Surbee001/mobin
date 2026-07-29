import { SmoothScroll } from '@/components/SmoothScroll'
import { Opening } from '@/components/Opening'
import { Hero } from '@/components/Hero'
import { Aya } from '@/components/Aya'
import { Poem } from '@/components/Poem'
import { Invitation } from '@/components/Invitation'
import { Location } from '@/components/Location'
import { Countdown } from '@/components/Countdown'
import { Confetti } from '@/components/Confetti'
import { ThemeEditor } from '@/components/ThemeEditor'

export default function Home() {
  return (
    <SmoothScroll>
      {/* The sealed envelope, over everything, until it is opened. */}
      <Opening />

      <main>
        <Hero />
        <Aya />
        <Poem />
        <Invitation />
        <Location />
        <Countdown />
      </main>

      {/* Fires once, when the closing section comes into view. */}
      <Confetti trigger="#finale" />

      {/* Development only — it returns null in a production build. */}
      <ThemeEditor />
    </SmoothScroll>
  )
}
