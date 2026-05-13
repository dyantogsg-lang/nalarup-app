import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NalarUp — Platform Tryout CASN",
  description:
    "Naikkan skor sampai aman passing grade lewat simulasi tryout realistis, analisis kelemahan, dan latihan perbaikan terarah.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
