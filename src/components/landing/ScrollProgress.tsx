"use client";

import { useEffect, useState } from "react";

export default function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docHeight > 0 ? (scrollTop / docHeight) * 100 : 0);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        top: 64,
        left: 0,
        height: 3,
        width: `${progress}%`,
        background: "linear-gradient(90deg, var(--blue), var(--violet))",
        zIndex: 50,
        transition: "width 100ms linear",
        pointerEvents: "none",
      }}
      aria-hidden="true"
    />
  );
}
