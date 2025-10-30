import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';

const brandText = 'CRXANODE';

export const SplashScreen = () => {
  const [hasError, setHasError] = useState(false);

  const letters = useMemo(() => brandText.split(''), []);

  return (
    <motion.div
      className="fixed inset-0 z-[999] flex items-center justify-center bg-base-100/95 backdrop-blur-sm"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <motion.div
        className="relative flex flex-col items-center justify-center gap-6"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <motion.div
          className="absolute inset-0 h-64 w-64 rounded-full bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 blur-3xl"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 10, ease: 'linear' }}
        />

        <motion.div
          className="relative flex h-28 w-28 items-center justify-center rounded-full border border-primary/40 bg-base-100 shadow-2xl shadow-primary/20"
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
        >
          {hasError ? (
            <span className="text-3xl font-bold text-primary">CR</span>
          ) : (
            <img
              src="/logo.png"
              alt="Crxanode"
              className="h-20 w-20 rounded-full object-cover"
              onError={() => setHasError(true)}
            />
          )}
        </motion.div>

        <motion.div
          className="relative flex gap-1 text-2xl font-semibold tracking-[0.4em] text-primary"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.08,
                delayChildren: 0.3
              }
            }
          }}
        >
          {letters.map((letter, index) => (
            <motion.span
              key={`${letter}-${index}`}
              className="inline-block"
              variants={{
                hidden: { opacity: 0, y: 10 },
                visible: { opacity: 1, y: 0 }
              }}
            >
              {letter}
            </motion.span>
          ))}
        </motion.div>
      </motion.div>
    </motion.div>
  );
};
