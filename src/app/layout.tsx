import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
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
    <html lang="id" className={plusJakartaSans.variable}>
      <body className={`${plusJakartaSans.className} min-h-screen antialiased flex flex-col justify-between selection:bg-[#4f4d9a] selection:text-white`}>
        {children}
      </body>
    </html>
  );
}
