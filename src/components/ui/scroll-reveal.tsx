"use client";

import React from "react";
import { motion, type Variants } from "framer-motion";

const easeOut = [0.22, 1, 0.36, 1] as const;

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  y?: number;
  as?: keyof typeof motion;
}

const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  className = "",
  delay = 0,
  duration = 0.55,
  y = 28,
  as = "div",
}) => {
  const Component = motion[as] as typeof motion.div;

  const variants: Variants = {
    hidden: { opacity: 0, y },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration, delay, ease: easeOut },
    },
  };

  return (
    <Component
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15, margin: "-60px" }}
      variants={variants}
    >
      {children}
    </Component>
  );
};

export default ScrollReveal;
