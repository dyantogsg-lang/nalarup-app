"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ROUTES } from "@/lib/constants/routes";

const NAV_LINKS = [
  { href: "#cara-kerja", label: "Cara Kerja" },
  { href: "#fitur", label: "Fitur" },
  { href: "#statistik", label: "Statistik" },
  { href: "#testimoni", label: "Testimoni" },
  { href: "#faq", label: "FAQ" },
];

export default function MobileNav() {
  const [open, setOpen] = useState(false);

  const close = useCallback(() => setOpen(false), []);

  // Close on escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [close]);

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {/* Hamburger button */}
      <button
        onClick={() => setOpen(!open)}
        className="lg:hidden flex items-center justify-center w-10 h-10 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
        aria-label={open ? "Tutup menu navigasi" : "Buka menu navigasi"}
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
      >
        {open ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        )}
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={close}
          aria-hidden="true"
        />
      )}

      {/* Slide-in panel */}
      <nav
        id="mobile-nav-panel"
        className={`fixed top-0 right-0 z-50 h-full w-72 max-w-[85vw] bg-[var(--bg-card)] border-l border-[var(--border)] shadow-xl transform transition-transform duration-300 ease-out lg:hidden ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Menu navigasi"
        aria-hidden={!open}
      >
        <div className="flex flex-col h-full p-6 pt-20 gap-2">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={close}
              className="block py-3 px-4 rounded-[var(--radius-lg)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card2)] font-medium text-base transition-colors"
            >
              {link.label}
            </a>
          ))}
          <hr className="my-4 border-[var(--border)]" />
          <Link
            href={ROUTES.login}
            onClick={close}
            className="block py-3 px-4 rounded-[var(--radius-lg)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card2)] font-medium text-base transition-colors"
          >
            Masuk
          </Link>
          <Link
            href={ROUTES.register}
            onClick={close}
            className="block mt-2"
          >
            <span className="btn-primary w-full py-3 text-base rounded-[var(--radius-xl)] cursor-pointer block text-center">
              Mulai Gratis
            </span>
          </Link>
        </div>
      </nav>
    </>
  );
}
