"use client";

import { motion, useReducedMotion } from "framer-motion";
import * as React from "react";

export function Reveal({
  children,
  delay = 0,
  y = 24,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
    >
      {children}
    </motion.div>
  );
}

export function Stagger({
  children,
  className,
  delayStep = 0.08,
}: {
  children: React.ReactNode[];
  className?: string;
  delayStep?: number;
}) {
  return (
    <div className={className}>
      {React.Children.map(children, (child, i) => (
        <Reveal delay={i * delayStep}>{child}</Reveal>
      ))}
    </div>
  );
}
