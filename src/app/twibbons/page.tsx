import prisma from "@/lib/prisma";
import Link from "next/link";
import { Metadata } from "next";
import TwibbonCard from "@/components/TwibbonCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Archivo_Black } from "next/font/google";

const archivoBlack = Archivo_Black({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Daftar Twibbon - BEM Unsoed",
  description: "Jelajahi dan ikuti berbagai twibbon resmi dari BEM Unsoed.",
};

export const revalidate = 0;

export default async function PublicTwibbonsCatalogPage() {
  const twibbons = await prisma.twibbon.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
  }).catch(() => []);

  return (
    <div
      className="min-h-screen flex flex-col justify-between relative overflow-hidden font-sans selection:bg-[#FDB927] selection:text-black"
      style={{
        background: "linear-gradient(160deg, #1e0a4a 0%, #2d1b69 40%, #1a0f3d 100%)",
      }}
    >
      {/* Grid Pattern Accent Overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.07]"
        style={{
          backgroundImage: `radial-gradient(rgba(255,255,255,0.4) 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
        }}
      />
      <Navbar />

      <main className="pt-28 md:pt-36 pb-20 px-6 md:px-10 relative z-10 flex-1">
        <div className="max-w-[1440px] mx-auto w-full relative z-10">
          <div className="text-center mb-12 md:mb-16 flex flex-col items-center">
            <Link
              href="/"
              className="inline-block mb-6 px-6 py-2 rounded-full font-black text-xs uppercase tracking-widest transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 hover:-translate-x-1 border-[2px] border-[#0a031e] shadow-[4px_4px_0px_#1e0a4a] hover:shadow-[6px_6px_0px_#1e0a4a]"
              style={{
                background: "#FDB927",
                color: "#0a031e",
              }}
            >
              ← KEMBALI KE BERANDA
            </Link>
            <h1
              className={`text-4xl md:text-6xl uppercase tracking-tight mb-4 ${archivoBlack.className}`}
              style={{ 
                color: "#FDB927",
                textShadow: "6px 6px 0px #0a031e",
              }}
            >
              TWIBBON KAMI
            </h1>
            <p className="font-bold max-w-2xl text-xs md:text-sm leading-relaxed" style={{ color: "#ede9fe", opacity: 0.85 }}>
              Pilih dan dukung berbagai gerakan serta acara dari BEM Unsoed dengan
              menggunakan bingkai foto (Twibbon) spesial di bawah ini!
            </p>
          </div>

          {twibbons.length === 0 ? (
            <div
              className="rounded-[3rem] p-12 text-center max-w-md mx-auto"
              style={{
                background: "#ffffff",
                border: "2px solid #0a031e",
                boxShadow: "6px 6px 0px #1e0a4a"
              }}
            >
              <h2 className="text-xl font-extrabold uppercase tracking-wider mb-2" style={{ color: "#1e0a4a" }}>
                Belum ada kampanye
              </h2>
              <p className="text-xs font-semibold" style={{ color: "#2d1b69", opacity: 0.7 }}>
                Saat ini belum ada twibbon yang aktif. Silakan cek kembali nanti!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6 lg:gap-8">
              {twibbons.map((twibbon) => (
                <TwibbonCard key={twibbon.id} twibbon={twibbon} compactOnMobile={true} />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
