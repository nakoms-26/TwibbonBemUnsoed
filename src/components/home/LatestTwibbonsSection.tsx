import Link from "next/link";
import prisma from "@/lib/prisma";

import LatestTwibbonsCarousel from "./LatestTwibbonsCarousel";

export default async function LatestTwibbonsSection() {
  const twibbons = await prisma.twibbon.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
    take: 4,
    include: {
      _count: {
        select: { downloads: true }
      }
    }
  });

  if (twibbons.length === 0) return null;

  return (
    <section className="bg-white text-black rounded-t-[2.5rem] md:rounded-t-[3.5rem] px-6 py-12 md:px-10 md:py-16 relative z-20 shadow-[0_-20px_50px_rgba(0,0,0,0.2)] w-full">
      <div className="max-w-[1440px] mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4 border-b border-gray-100 pb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-2">Trending Campaigns</h2>
            <p className="text-sm font-bold text-gray-500">Discover popular Twibbons from the community</p>
          </div>
          <Link href="/twibbons" className="text-sm font-black text-gray-900 hover:text-[#0038FF] transition-colors flex items-center gap-2 group whitespace-nowrap">
            View All 
            <span className="group-hover:translate-x-1 transition-transform">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
              </svg>
            </span>
          </Link>
        </div>

        <LatestTwibbonsCarousel twibbons={twibbons} />
      </div>
    </section>
  );
}
