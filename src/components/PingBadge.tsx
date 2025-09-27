import React from 'react'
import { motion } from 'framer-motion'

interface PingBadgeProps {
  url: string;
  label: string;
  className?: string;
}

export const PingBadge = ({ url, label, className = "" }: PingBadgeProps) => {
  const [ms, setMs] = React.useState<number | null>(null)
  const [ok, setOk] = React.useState<boolean | null>(null)
  const [refreshKey, setRefreshKey] = React.useState(0)

  const refreshPing = () => {
    setRefreshKey(prevKey => prevKey + 1)
  }

  React.useEffect(() => {
    let alive = true
      ; (async () => {
        setMs(null)
        setOk(null)
        const t0 = performance.now()
        try {
          await fetch(url, { method: 'HEAD', mode: 'no-cors' })
          if (!alive) return
          setOk(true); setMs(Math.round(performance.now() - t0))
        } catch {
          if (!alive) return
          try {
            const t1 = performance.now()
            await fetch(url)
            if (!alive) return
            setOk(true); setMs(Math.round(performance.now() - t1))
          } catch { if (alive) { setOk(false); setMs(null) } }
        }
      })()
    return () => { alive = false }
  }, [url, refreshKey])

  const tone = ok === null ? "badge-ghost"
    : ok ? "badge-success"
      : "badge-error"

  return (
    <motion.span
      className={`badge ${tone} gap-2 cursor-pointer hover:opacity-75 ${className}`}
      onClick={refreshPing}
      whileTap={{ scale: 0.95 }}
    >
      {/* <span>{label} */}
      <span>{ms !== null ? `${ms} ms` : '—'}</span>
    </motion.span>
  )
}