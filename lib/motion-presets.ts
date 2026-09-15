// lib/motion-presets.ts

export const fadeInUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const },
};

export const cardHover = {
  whileHover: { scale: 1.03 },
  whileTap: { scale: 0.96 },
};

export const modalSpring = {
  initial: { scale: 0.9, opacity: 0, y: 10 },
  animate: { scale: 1, opacity: 1, y: 0 },
  exit: { scale: 0.9, opacity: 0, y: 10 },
  transition: { type: 'spring' as const, damping: 22, stiffness: 320 },
};

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.04,
    },
  },
};