"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, stagger } from "./tokens/motion";

export function AnimatedSection({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <div className={`${motion.fadeUp} ${className}`} style={{ animationDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

export function Breathe({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`${motion.breathe} motion-reduce:animate-none ${className}`}>{children}</div>
  );
}

export function StaggerChildren({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`${className}`}>{children}</div>;
}

export function StaggerItem({
  index,
  children,
  className = "",
}: {
  index: number;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`${motion.fadeIn} opacity-0 ${className}`} style={stagger(index)}>
      {children}
    </div>
  );
}

export function CountUp({
  value,
  suffix = "",
  duration = 900,
  className = "",
}: {
  value: number;
  suffix?: string;
  duration?: number;
  className?: string;
}) {
  const [display, setDisplay] = useState(0);
  const reduced = useRef(false);

  useEffect(() => {
    reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced.current) {
      setDisplay(value);
      return;
    }
    const start = performance.now();
    let frame: number;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(value * eased));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, duration]);

  return (
    <span className={`tabular-nums ${className}`}>
      {display}
      {suffix}
    </span>
  );
}
