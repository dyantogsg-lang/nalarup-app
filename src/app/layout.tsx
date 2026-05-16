import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NalarUp — Platform Tryout CASN",
  description:
    "Naikkan skor sampai aman passing grade lewat simulasi tryout realistis, analisis kelemahan, dan latihan perbaikan terarah.",
  icons: {
    icon: "/logo-icon.png",
    apple: "/logo-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('nalarup-theme');if(t==='dark'){document.documentElement.setAttribute('data-theme','dark')}else{document.documentElement.removeAttribute('data-theme')}}catch(e){}})();`,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
