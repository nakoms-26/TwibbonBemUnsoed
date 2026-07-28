import Link from "next/link";
import prisma from "@/lib/prisma";
import LatestTwibbonsCarousel from "./LatestTwibbonsCarousel";
import { ArrowRight } from "lucide-react";
import { Archivo_Black } from "next/font/google";

const archivoBlack = Archivo_Black({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export default async function LatestTwibbonsSection() {
  const twibbons = await prisma.twibbon.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
    take: 6,
  });

  if (twibbons.length === 0) return null;

  return (
    <section
      className="rounded-t-[2.5rem] md:rounded-t-[3.5rem] px-6 py-12 md:px-10 md:py-16 relative z-20 w-full"
      style={{
        background: "#ffffff",
        borderTop: "1px solid rgba(45, 27, 105, 0.1)",
        boxShadow: "0 -20px 40px rgba(0, 0, 0, 0.2)",
      }}
    >
      <div className="max-w-[1440px] mx-auto">
        <div
          className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4 border-b pb-6"
          style={{ borderColor: "rgba(79, 77, 154, 0.1)" }}
        >
          <div>
            <h2
              className={`text-2xl md:text-3xl uppercase tracking-tight ${archivoBlack.className}`}
              style={{ color: "#1e0a4a" }}
            >
              Kampanye Populer
            </h2>
            <p
              className="text-xs font-bold mt-1"
              style={{ color: "#2d1b69", opacity: 0.8 }}
            >
              Jelajahi twibbon dan video pilihan
            </p>
          </div>
          <Link
            href="/twibbons"
            className="text-xs font-extrabold uppercase tracking-wider rounded-full text-white transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 px-6 py-3 shadow-sm w-full sm:w-auto"
            style={{
              background: "#2d1b69",
              boxShadow: "0 4px 12px rgba(45, 27, 105, 0.25)",
            }}
          >
            <span>Lihat Semua</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <LatestTwibbonsCarousel twibbons={twibbons} />
      </div>
    </section>
  );
}
