import prisma from "@/lib/prisma";
import Link from "next/link";
import { Image as ImageIcon, CheckCircle, Download } from "lucide-react";

export default async function DashboardPage() {
  // Ambil statistik dari database
  const totalTwibbons = await prisma.twibbon.count();
  const activeTwibbons = await prisma.twibbon.count({ where: { isActive: true } });
  const totalDownloads = await prisma.download.count();

  // Ambil 5 twibbon terakhir yang dibuat
  const recentTwibbons = await prisma.twibbon.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return (
    <div className="space-y-10 pb-10">
      <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight" style={{ color: "#2f2f67" }}>
        DASHBOARD
      </h1>

      {/* Stats Grid (Original 3-card structure) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {/* Card 1: Total Twibbon */}
        <div
          className="p-8 rounded-[2rem] flex items-center space-x-6 relative overflow-hidden transition-transform hover:-translate-y-1"
          style={{
            background: "rgba(255, 255, 255, 0.65)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid rgba(79, 77, 154, 0.12)",
            boxShadow: "0 4px 24px rgba(79, 77, 154, 0.08)",
          }}
        >
          <div className="p-4 rounded-2xl text-white shadow-sm" style={{ background: "#4f4d9a" }}>
            <ImageIcon className="w-8 h-8" />
          </div>
          <div>
            <p className="text-xs font-extrabold uppercase tracking-widest mb-1" style={{ color: "#4f4d9a" }}>
              Total Twibbon
            </p>
            <p className="text-4xl font-black" style={{ color: "#2f2f67" }}>
              {totalTwibbons}
            </p>
          </div>
        </div>

        {/* Card 2: Twibbon Aktif */}
        <div
          className="p-8 rounded-[2rem] flex items-center space-x-6 relative overflow-hidden transition-transform hover:-translate-y-1"
          style={{
            background: "rgba(255, 255, 255, 0.65)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid rgba(79, 77, 154, 0.12)",
            boxShadow: "0 4px 24px rgba(79, 77, 154, 0.08)",
          }}
        >
          <div className="p-4 rounded-2xl text-white shadow-sm" style={{ background: "#8ea8ea" }}>
            <CheckCircle className="w-8 h-8" />
          </div>
          <div>
            <p className="text-xs font-extrabold uppercase tracking-widest mb-1" style={{ color: "#4f4d9a" }}>
              Twibbon Aktif
            </p>
            <p className="text-4xl font-black" style={{ color: "#2f2f67" }}>
              {activeTwibbons}
            </p>
          </div>
        </div>

        {/* Card 3: Total Download */}
        <div
          className="p-8 rounded-[2rem] flex items-center space-x-6 relative overflow-hidden transition-transform hover:-translate-y-1"
          style={{
            background: "rgba(255, 255, 255, 0.65)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid rgba(79, 77, 154, 0.12)",
            boxShadow: "0 4px 24px rgba(79, 77, 154, 0.08)",
          }}
        >
          <div className="p-4 rounded-2xl text-white shadow-sm" style={{ background: "#6b2f5a" }}>
            <Download className="w-8 h-8" />
          </div>
          <div>
            <p className="text-xs font-extrabold uppercase tracking-widest mb-1" style={{ color: "#4f4d9a" }}>
              Total Download
            </p>
            <p className="text-4xl font-black" style={{ color: "#2f2f67" }}>
              {totalDownloads}
            </p>
          </div>
        </div>
      </div>

      {/* Recent Twibbons Section (Original card grid layout) */}
      <div
        className="rounded-[2rem] overflow-hidden"
        style={{
          background: "rgba(255, 255, 255, 0.65)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1px solid rgba(79, 77, 154, 0.12)",
          boxShadow: "0 4px 24px rgba(79, 77, 154, 0.08)",
        }}
      >
        <div
          className="px-8 py-6 flex justify-between items-center border-b"
          style={{ borderColor: "rgba(79, 77, 154, 0.1)", background: "rgba(255, 255, 255, 0.4)" }}
        >
          <h2 className="text-2xl font-black uppercase tracking-tight" style={{ color: "#2f2f67" }}>
            TWIBBON TERBARU
          </h2>
          <Link
            href="/admin/twibbons"
            className="text-xs font-extrabold px-5 py-2.5 rounded-full transition-all uppercase tracking-wider text-white shadow-sm hover:scale-105"
            style={{ background: "#4f4d9a" }}
          >
            Lihat Semua →
          </Link>
        </div>

        <div className="p-6 md:p-8">
          {recentTwibbons.length === 0 ? (
            <div className="text-center py-10 font-bold" style={{ color: "#4f4d9a", opacity: 0.7 }}>
              Belum ada twibbon yang dibuat.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recentTwibbons.map((twibbon) => (
                <div
                  key={twibbon.id}
                  className="p-6 rounded-2xl border flex flex-col transition-all hover:shadow-sm"
                  style={{
                    background: "rgba(255, 255, 255, 0.7)",
                    borderColor: "rgba(79, 77, 154, 0.15)",
                  }}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex flex-col">
                      <span className="text-lg font-black uppercase leading-tight line-clamp-1" style={{ color: "#2f2f67" }}>
                        {twibbon.title}
                      </span>
                      <span className="text-xs font-bold opacity-75" style={{ color: "#4f4d9a" }}>
                        /{twibbon.slug}
                      </span>
                    </div>
                    <span
                      className="px-3 py-1.5 inline-flex text-[10px] uppercase tracking-widest font-black rounded-lg shrink-0"
                      style={
                        twibbon.isActive
                          ? { background: "rgba(34, 197, 94, 0.12)", color: "#16a34a" }
                          : { background: "rgba(239, 68, 68, 0.12)", color: "#dc2626" }
                      }
                    >
                      {twibbon.isActive ? "Aktif" : "Nonaktif"}
                    </span>
                  </div>
                  <div
                    className="mt-auto flex items-center justify-between border-t pt-4"
                    style={{ borderColor: "rgba(79, 77, 154, 0.08)" }}
                  >
                    <span
                      className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md"
                      style={{ background: "rgba(79, 77, 154, 0.12)", color: "#4f4d9a" }}
                    >
                      {twibbon.type}
                    </span>
                    <span className="text-xs font-bold opacity-70" style={{ color: "#2f2f67" }}>
                      {new Date(twibbon.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
