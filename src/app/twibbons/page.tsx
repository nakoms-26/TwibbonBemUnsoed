import prisma from "@/lib/prisma";
import Link from "next/link";
import { Metadata } from "next";
import TwibbonCard from "@/components/TwibbonCard";

export const metadata: Metadata = {
  title: "Daftar Twibbon - BEM Unsoed",
  description: "Jelajahi dan ikuti berbagai twibbon resmi dari BEM Unsoed.",
};

export default async function PublicTwibbonsCatalogPage() {
  const twibbons = await prisma.twibbon.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-[#0038FF] pt-32 md:pt-40 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff15_1px,transparent_1px),linear-gradient(to_bottom,#ffffff15_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none z-0" />

      <div className="max-w-5xl mx-auto relative z-10">
        <div className="text-center mb-16 flex flex-col items-center">
          <Link
            href="/"
            className="inline-block mb-6 bg-white px-6 py-2 rounded-full font-black text-sm uppercase tracking-widest text-[#0038FF] shadow-sm hover:scale-105 transition-transform"
          >
            &larr; KEMBALI KE BERANDA
          </Link>
          <h1
            className="text-5xl md:text-7xl font-black text-[#CCFF00] mb-6 uppercase tracking-tighter"
            style={{
              fontFamily: '"Arial Black", Impact, sans-serif',
              textShadow:
                "1px 1px 0 #001A99, 2px 2px 0 #001A99, 3px 3px 0 #001A99, 4px 4px 0 #001A99, 5px 5px 0 #001A99",
            }}
          >
            TWIBBON KAMI
          </h1>
          <p className="text-white/80 font-bold max-w-2xl text-lg">
            Pilih dan dukung berbagai gerakan serta acara dari BEM Unsoed dengan
            menggunakan bingkai foto (Twibbon) spesial di bawah ini!
          </p>
        </div>

        {twibbons.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-md rounded-[3rem] p-16 text-center border border-white/20">
            <div className="text-6xl mb-6">🏜️</div>
            <h2 className="text-3xl font-black text-white uppercase tracking-wider mb-2">
              Belum ada kampanye
            </h2>
            <p className="text-white/70 font-bold">
              Saat ini belum ada twibbon yang aktif. Silakan cek kembali nanti!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {twibbons.map((twibbon) => (
              <TwibbonCard key={twibbon.id} twibbon={twibbon} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
