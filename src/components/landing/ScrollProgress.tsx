"use client";

import { motion, useScroll, useTransform } from "framer-motion";

export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const width = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <motion.div
      className="fixed top-16 left-0 right-0 z-50 h-[3px] origin-left"
      style={{
        width,
        background: "linear-gradient(90deg, #2563EB, #7C3AED)",
      }}
      aria-hidden="true"
    />
  );
}
