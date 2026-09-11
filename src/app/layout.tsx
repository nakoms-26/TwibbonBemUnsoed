import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://twibbon.bem-unsoed.com";

export const viewport: Viewport = {
  themeColor: "#1e0a4a",
  width: "device-width",
  initialScale: 1,
  colorScheme: "dark light",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Twibbon BEM Unsoed - Platform Twibbon Resmi",
    template: "%s | Twibbon BEM Unsoed",
  },
  description:
    "Platform resmi pembuatan twibbon foto dan video BEM Universitas Jenderal Soedirman (BEM Unsoed). Dukung dan semarakkan berbagai kegiatan kampus dengan mudah dan cepat.",
  keywords: [
    "twibbon bem unsoed",
    "twibbon unsoed",
    "twibbon kausa cipta",
    "twibbonize unsoed",
    "bingkai foto unsoed",
    "bem unsoed",
    "universitas jenderal soedirman",
    "twibbon generator",
    "twibbon video unsoed",
    "kampanye unsoed",
  ],
  authors: [
    {
      name: "Kementerian Media dan Komunikasi BEM Unsoed",
      url: "https://bem-unsoed.com",
    },
  ],
  creator: "BEM Universitas Jenderal Soedirman",
  publisher: "BEM Universitas Jenderal Soedirman",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/favicon.png", sizes: "any", type: "image/png" },
    ],
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: siteUrl,
    siteName: "Twibbon BEM Unsoed",
    title: "Twibbon BEM Unsoed - Platform Twibbon Resmi",
    description:
      "Platform resmi pembuatan twibbon foto dan video BEM Universitas Jenderal Soedirman. Pasang foto twibbon kegiatan kampus favoritmu sekarang!",
  },
  twitter: {
    card: "summary_large_image",
    title: "Twibbon BEM Unsoed - Platform Twibbon Resmi",
    description:
      "Platform resmi pembuatan twibbon foto dan video BEM Universitas Jenderal Soedirman.",
    creator: "@bem_unsoed",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
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
