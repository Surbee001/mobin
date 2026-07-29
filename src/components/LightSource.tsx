'use client'

import { useEffect } from 'react'
import { watchLight } from './light'

/**
 * Mounts the light. Renders nothing and never re-renders — it exists only to
 * tie `watchLight`'s lifetime to the page's. See light.ts for what it does.
 */
export function LightSource() {
  useEffect(() => watchLight(), [])
  return null
}
