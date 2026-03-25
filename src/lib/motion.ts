import type { Variants, Transition } from 'motion/react';

// ─── Base transitions ──────────────────────────────────────────────────────
export const fastTransition: Transition = {
  duration: 0.15,
  ease: [0.4, 0, 0.2, 1],
};

export const baseTransition: Transition = {
  duration: 0.2,
  ease: [0.4, 0, 0.2, 1],
};

export const slowTransition: Transition = {
  duration: 0.3,
  ease: [0.4, 0, 0.2, 1],
};

export const springTransition: Transition = {
  type: 'spring',
  stiffness: 320,
  damping: 28,
};

export const elasticTransition: Transition = {
  type: 'spring',
  stiffness: 400,
  damping: 24,
};

// ─── Page / view transitions ────────────────────────────────────────────────
export const pageVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.22, ease: [0.4, 0, 0.2, 1] },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.15, ease: [0.4, 0, 1, 1] },
  },
};

// ─── Staggered list container ────────────────────────────────────────────────
export const listContainerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.05,
    },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.15 },
  },
};

// Faster stagger for dense lists (analytics, library grid)
export const denseListVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.02,
    },
  },
  exit: { opacity: 0, transition: { duration: 0.12 } },
};

// ─── List items ──────────────────────────────────────────────────────────────
export const listItemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 24 },
  },
  exit: { opacity: 0, y: -8, transition: fastTransition },
};

export const fadeInVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: baseTransition },
  exit: { opacity: 0, transition: fastTransition },
};

export const scaleInVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  show: {
    opacity: 1,
    scale: 1,
    transition: elasticTransition,
  },
  exit: { opacity: 0, scale: 0.96, transition: fastTransition },
};

// ─── Slide variants (drawer/sidebar) ────────────────────────────────────────
export const slideFromLeftVariants: Variants = {
  hidden: { x: '-100%', opacity: 0 },
  show: {
    x: 0,
    opacity: 1,
    transition: springTransition,
  },
  exit: {
    x: '-100%',
    opacity: 0,
    transition: { ...springTransition, duration: 0.2 },
  },
};

export const slideFromRightVariants: Variants = {
  hidden: { x: '100%', opacity: 0 },
  show: { x: 0, opacity: 1, transition: springTransition },
  exit: { x: '100%', opacity: 0, transition: { ...springTransition, duration: 0.2 } },
};

export const slideFromBottomVariants: Variants = {
  hidden: { y: '100%', opacity: 0 },
  show: { y: 0, opacity: 1, transition: springTransition },
  exit: { y: '100%', opacity: 0, transition: { ...springTransition, duration: 0.2 } },
};

// ─── Hover / tap helpers (use with whileHover / whileTap) ───────────────────
export const hoverLift = { scale: 1.02, transition: fastTransition };
export const hoverGlow = { scale: 1.01, transition: fastTransition };
export const tapPress = { scale: 0.97, transition: fastTransition };
export const tapShrink = { scale: 0.95, transition: fastTransition };
