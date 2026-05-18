"use client";

import { useEffect, useRef } from "react";
import { useInView, useMotionValue, useTransform, animate } from "framer-motion";

interface AnimatedNumberProps {
  value: number;
  formatOptions?: Intl.NumberFormatOptions;
  locale?: string;
  className?: string;
}

export default function AnimatedNumber({
  value,
  formatOptions,
  locale = "id-ID",
  className,
}: AnimatedNumberProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const motionValue = useMotionValue(0);

  useEffect(() => {
    if (!isInView) return;
    const controls = animate(motionValue, value, {
      duration: 1.5,
      ease: [0.25, 0.46, 0.45, 0.94],
    });
    return () => controls.stop();
  }, [isInView, value, motionValue]);

  useEffect(() => {
    const unsubscribe = motionValue.on("change", (latest) => {
      if (ref.current) {
        const rounded = Math.round(latest);
        ref.current.textContent = formatOptions
          ? rounded.toLocaleString(locale, formatOptions)
          : rounded.toLocaleString(locale);
      }
    });
    return unsubscribe;
  }, [motionValue, formatOptions, locale]);

  return (
    <span ref={ref} className={className}>
      0
    </span>
  );
}
