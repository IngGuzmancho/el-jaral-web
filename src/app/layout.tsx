import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "El Jaral · Senepol",
  description: "Toros reproductores y genética Senepol — Cabaña El Jaral, Santa Cruz, Bolivia.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700&family=Barlow+Condensed:wght@600;700;800&display=swap"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
