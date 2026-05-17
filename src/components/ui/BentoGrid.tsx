import { type ReactNode } from "react";

interface BentoGridProps {
  children: ReactNode;
  className?: string;
}

/**
 * BentoGrid — Asymmetric grid layout component with named areas for game-style dashboards.
 * Children should use className="col-span-*" or "row-span-*" for asymmetric layouts.
 */
export function BentoGrid({ children, className = "" }: BentoGridProps) {
  return (
    <div
      role="grid"
      aria-label="Content grid"
      className={[
        "grid gap-4",
        "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
        "auto-rows-[minmax(140px,auto)]",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}

/* Helper component for grid items */
interface BentoItemProps {
  children: ReactNode;
  className?: string;
  span?: "1" | "2" | "3" | "4";
  rowSpan?: "1" | "2";
}

export function BentoItem({
  children,
  className = "",
  span = "1",
  rowSpan = "1",
}: BentoItemProps) {
  const colSpanMap = {
    "1": "col-span-1",
    "2": "sm:col-span-2",
    "3": "sm:col-span-2 lg:col-span-3",
    "4": "sm:col-span-2 lg:col-span-4",
  };

  const rowSpanMap = {
    "1": "row-span-1",
    "2": "row-span-2",
  };

  return (
    <div
      role="gridcell"
      className={`${colSpanMap[span]} ${rowSpanMap[rowSpan]} ${className}`}
    >
      {children}
    </div>
  );
}
