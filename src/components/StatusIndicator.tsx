
import React from 'react';
import { motion } from 'framer-motion';

interface StatusIndicatorProps {
  url: string;
  className?: string;
}

export const StatusIndicator = ({ url, className = "" }: StatusIndicatorProps) => {
  const [ok, setOk] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    let alive = true;
    (async () => {
      setOk(null);
      try {
        await fetch(url, { method: 'HEAD', mode: 'no-cors' });
        if (!alive) return;
        setOk(true);
      } catch {
        if (!alive) return;
        try {
          await fetch(url);
          if (!alive) return;
          setOk(true);
        } catch {
          if (alive) {
            setOk(false);
          }
        }
      }
    })();
    return () => {
      alive = false;
    };
  }, [url]);

  const color = ok === null ? 'bg-gray-400' : ok ? 'bg-green-500' : 'bg-red-500';
  const shadowColor = ok === null ? 'rgba(0,0,0,0)' : ok ? 'rgba(0, 255, 0, 0.7)' : 'rgba(255, 0, 0, 0.7)';

  return (
    <motion.div
      className={`w-3 h-3 rounded-full ${color} ${className}`}
      title={ok === null ? 'Pinging...' : ok ? 'Online' : 'Offline'}
      animate={{
        boxShadow: [
          `0 0 0 0 ${shadowColor}`,
          `0 0 0 5px rgba(0,0,0,0)`,
        ],
      }}
      transition={{
        duration: 1.5,
        repeat: ok === null ? 0 : Infinity,
        ease: "easeInOut",
      }}
    />
  );
};
