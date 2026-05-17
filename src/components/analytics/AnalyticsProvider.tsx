
"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Lightweight analytics tracker for NalarUp.
 * Tracks page views, time on page, and basic interactions.
 * Data stored in Supabase analytics table.
 */

interface PageView {
  path: string;
  referrer: string;
  timestamp: number;
  sessionId: string;
}

function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = sessionStorage.getItem("nalarup_session");
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem("nalarup_session", id);
  }
  return id;
}

async function trackPageView(path: string) {
  try {
    const payload: PageView = {
      path,
      referrer: document.referrer,
      timestamp: Date.now(),
      sessionId: getSessionId(),
    };
    
    // Use sendBeacon for reliability (survives page unload)
    const blob = new Blob([JSON.stringify(payload)], { type: "application/json" });
    navigator.sendBeacon("/api/analytics/pageview", blob);
  } catch {
    // Silent fail - analytics should never break the app
  }
}

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    trackPageView(pathname);
  }, [pathname]);

  // Track time on page
  useEffect(() => {
    const start = Date.now();
    
    const handleUnload = () => {
      const duration = Math.round((Date.now() - start) / 1000);
      const blob = new Blob(
        [JSON.stringify({ path: pathname, duration, sessionId: getSessionId() })],
        { type: "application/json" }
      );
      navigator.sendBeacon("/api/analytics/duration", blob);
    };

    window.addEventListener("pagehide", handleUnload);
    return () => window.removeEventListener("pagehide", handleUnload);
  }, [pathname]);

  return <>{children}</>;
}
