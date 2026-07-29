import { SmoothScroll } from '@/components/SmoothScroll'
import { Opening } from '@/components/Opening'
import { Hero } from '@/components/Hero'
import { Aya } from '@/components/Aya'
import { Invitation } from '@/components/Invitation'
import { Location } from '@/components/Location'
import { Countdown } from '@/components/Countdown'
import { ThemeEditor } from '@/components/ThemeEditor'

export default function Home() {
  return (
    <SmoothScroll>
      {/* The sealed envelope, over everything, until it is opened. */}
      <Opening />

      <main>
        <Hero />
        <Aya />
        <Invitation />
        <Location />
        <Countdown />
      </main>

      {/* Development only — it returns null in a production build. */}
      <ThemeEditor />
    </SmoothScroll>
  )
}
