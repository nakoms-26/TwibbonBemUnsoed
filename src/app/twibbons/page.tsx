import prisma from "@/lib/prisma";
import Link from "next/link";
import { Metadata } from "next";
import TwibbonCard from "@/components/TwibbonCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Daftar Twibbon - BEM Unsoed",
  description: "Jelajahi dan ikuti berbagai twibbon resmi dari BEM Unsoed.",
};

export const revalidate = 0;

export default async function PublicTwibbonsCatalogPage() {
  const twibbons = await prisma.twibbon.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { downloads: true },
      },
    },
  });

  return (
    <div
      className="min-h-screen flex flex-col justify-between relative overflow-hidden font-sans"
      style={{
        background: "linear-gradient(135deg, #f5f3ff 0%, #ede9fe 50%, #ddd8f8 100%)",
      }}
    >
      <Navbar />

      <main className="pt-28 md:pt-36 pb-20 px-6 md:px-10 relative z-10 flex-1">
        <div className="max-w-[1440px] mx-auto w-full relative z-10">
          <div className="text-center mb-12 md:mb-16 flex flex-col items-center">
            <Link
              href="/"
              className="inline-block mb-6 px-6 py-2 rounded-full font-black text-xs uppercase tracking-widest transition-transform hover:scale-105 shadow-sm"
              style={{
                background: "rgba(255, 255, 255, 0.8)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                border: "1px solid rgba(79, 77, 154, 0.18)",
                color: "#4f4d9a",
              }}
            >
              ← KEMBALI KE BERANDA
            </Link>
            <h1
              className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-4"
              style={{ color: "#2f2f67" }}
            >
              TWIBBON KAMI
            </h1>
            <p className="font-bold max-w-2xl text-xs md:text-sm leading-relaxed" style={{ color: "#4f4d9a", opacity: 0.85 }}>
              Pilih dan dukung berbagai gerakan serta acara dari BEM Unsoed dengan
              menggunakan bingkai foto (Twibbon) spesial di bawah ini!
            </p>
          </div>

          {twibbons.length === 0 ? (
            <div
              className="rounded-[3rem] p-12 text-center max-w-md mx-auto"
              style={{
                background: "rgba(255, 255, 255, 0.65)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                border: "1px solid rgba(79, 77, 154, 0.12)",
              }}
            >
              <h2 className="text-xl font-extrabold uppercase tracking-wider mb-2" style={{ color: "#2f2f67" }}>
                Belum ada kampanye
              </h2>
              <p className="text-xs font-semibold" style={{ color: "#4f4d9a", opacity: 0.7 }}>
                Saat ini belum ada twibbon yang aktif. Silakan cek kembali nanti!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6 lg:gap-8">
              {twibbons.map((twibbon) => (
                <TwibbonCard key={twibbon.id} twibbon={twibbon} />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
