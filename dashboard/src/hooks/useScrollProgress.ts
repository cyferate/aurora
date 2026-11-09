import { useEffect, useState } from 'react'

/** Returns scroll progress from 0 to 1 */
export function useScrollProgress(): number {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const update = () => {
      const scrollEl = document.documentElement
      const max = scrollEl.scrollHeight - scrollEl.clientHeight
      if (max <= 0) { setProgress(0); return }
      setProgress(Math.min(1, scrollEl.scrollTop / max))
    }
    window.addEventListener('scroll', update, { passive: true })
    update()
    return () => window.removeEventListener('scroll', update)
  }, [])

  return progress
}
