import React from 'react'

interface PingBadgeProps {
  url: string;
  label: string;
  className?: string;
}

export const PingBadge = ({ url, label, className = "" }: PingBadgeProps) => {
  const [ms, setMs] = React.useState<number | null>(null)
  const [ok, setOk] = React.useState<boolean | null>(null)

  React.useEffect(() => {
    let alive = true
      ; (async () => {
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
  }, [url])

  const tone = ok === null ? "badge-ghost"
    : ok ? "badge-success"
      : "badge-error"

  return (
    <span className={`badge ${tone} gap-2 ${className}`}>
      {/* <span>{label}</span> */}
      <span>{ms !== null ? `${ms} ms` : '—'}</span>
    </span>
  )
}