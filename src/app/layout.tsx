import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

// Alias for heading to use Geist as well
const geistHeading = Geist({
  variable: "--font-heading",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TwibbonGen | Next-Gen Twibbon Maker",
  description: "Buat dan dukung kampanye dengan Twibbon gambar dan video real-time. Platform SaaS Twibbon terbaik.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={cn("h-full", "antialiased", geistHeading.variable, "font-sans", geist.variable)}>
      <body className="min-h-full flex flex-col font-sans bg-background text-foreground selection:bg-indigo-500/30">
        <Navbar />
        <main className="flex-grow flex flex-col">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
