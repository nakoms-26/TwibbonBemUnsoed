import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Twibbon BEM Unsoed - Platform Twibbon Resmi Kausa Cipta",
  description: "Dukung dan semarakkan berbagai kegiatan BEM Unsoed dengan menggunakan bingkai foto (twibbon) dan video resmi.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={geist.variable}>
      <body className={`${geist.className} min-h-screen antialiased flex flex-col justify-between selection:bg-[#7c5cbf] selection:text-white`}>
        {children}
      </body>
    </html>
  );
}
