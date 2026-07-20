import Link from "next/link";
import prisma from "@/lib/prisma";
import LatestTwibbonsCarousel from "./LatestTwibbonsCarousel";
import { ArrowRight } from "lucide-react";

export default async function LatestTwibbonsSection() {
  const twibbons = await prisma.twibbon.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
    take: 6,
    include: {
      _count: {
        select: { downloads: true }
      }
    }
  });

  if (twibbons.length === 0) return null;

  return (
    <section
      className="rounded-t-[2.5rem] md:rounded-t-[3.5rem] px-6 py-12 md:px-10 md:py-16 relative z-20 w-full"
      style={{
        background: "rgba(255, 255, 255, 0.65)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderTop: "1px solid rgba(79, 77, 154, 0.15)",
        boxShadow: "0 -16px 40px rgba(79, 77, 154, 0.08)",
      }}
    >
      <div className="max-w-[1440px] mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4 border-b pb-6" style={{ borderColor: "rgba(79, 77, 154, 0.1)" }}>
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold uppercase tracking-tight" style={{ color: "#2f2f67" }}>
              Kampanye Populer
            </h2>
            <p className="text-xs font-semibold mt-1" style={{ color: "#4f4d9a", opacity: 0.8 }}>
              Jelajahi twibbon dan video pilihan komunitas BEM Unsoed
            </p>
          </div>
          <Link
            href="/twibbons"
            className="text-xs font-extrabold uppercase tracking-wider transition-opacity hover:opacity-80 flex items-center gap-2 whitespace-nowrap"
            style={{ color: "#4f4d9a" }}
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
