import prisma from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import DeleteButton from "./DeleteButton";

export const revalidate = 0;

export default async function TwibbonsListPage() {
  const twibbons = await prisma.twibbon.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight" style={{ color: "#2f2f67" }}>
          Kelola Twibbon
        </h1>
        <Link
          href="/admin/twibbons/create"
          className="px-6 py-4 rounded-full text-xs font-black uppercase tracking-wider text-white transition-all shadow-md hover:scale-105"
          style={{
            background: "#4f4d9a",
            boxShadow: "0 4px 16px rgba(79, 77, 154, 0.3)",
          }}
        >
          + TAMBAH TWIBBON
        </Link>
      </div>

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
        {twibbons.length === 0 ? (
          <div className="text-center py-16">
            <h3 className="text-2xl font-black uppercase mb-2" style={{ color: "#2f2f67" }}>
              Belum ada Twibbon
            </h3>
            <p className="max-w-sm mx-auto mb-6 text-xs font-bold" style={{ color: "#4f4d9a", opacity: 0.8 }}>
              Mulai buat kampanye pertama Anda dengan menambahkan twibbon baru.
            </p>
            <Link
              href="/admin/twibbons/create"
              className="inline-flex items-center text-xs font-extrabold uppercase tracking-wider transition-opacity hover:opacity-80"
              style={{ color: "#4f4d9a" }}
            >
              BUAT SEKARANG {"→"}
            </Link>
          </div>
        ) : (
          <div className="p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {twibbons.map((twibbon) => (
                <div
                  key={twibbon.id}
                  className="p-6 rounded-2xl border flex flex-col transition-all hover:shadow-sm"
                  style={{
                    background: "rgba(255, 255, 255, 0.7)",
                    borderColor: "rgba(79, 77, 154, 0.15)",
                  }}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div
                      className="relative h-16 w-16 rounded-xl overflow-hidden border shrink-0 mr-4"
                      style={{ background: "rgba(79, 77, 154, 0.06)", borderColor: "rgba(79, 77, 154, 0.15)" }}
                    >
                      {twibbon.thumbnail ? (
                        <Image src={twibbon.thumbnail} alt={twibbon.title} fill className="object-contain p-1" sizes="64px" />
                      ) : (
                        <div className="flex items-center justify-center h-full w-full font-black text-xl" style={{ color: "#4f4d9a" }}>?</div>
                      )}
                    </div>
                    <div className="flex flex-col flex-1">
                      <span className="text-lg font-black uppercase leading-tight line-clamp-1" style={{ color: "#2f2f67" }}>
                        {twibbon.title}
                      </span>
                      <span className="text-xs font-bold mb-1 opacity-75" style={{ color: "#4f4d9a" }}>
                        /{twibbon.slug}
                      </span>
                      <span className="text-xs font-semibold line-clamp-1 opacity-70" style={{ color: "#2f2f67" }}>
                        {twibbon.description}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 mb-6">
                    <span
                      className="px-3 py-1.5 inline-flex text-[10px] uppercase tracking-widest font-black rounded-lg"
                      style={
                        twibbon.isActive
                          ? { background: "rgba(34, 197, 94, 0.12)", color: "#16a34a" }
                          : { background: "rgba(239, 68, 68, 0.12)", color: "#dc2626" }
                      }
                    >
                      {twibbon.isActive ? "AKTIF" : "NONAKTIF"}
                    </span>
                    <span
                      className="px-3 py-1.5 inline-flex text-[10px] uppercase tracking-widest font-black rounded-lg"
                      style={
                        twibbon.type === "VIDEO"
                          ? { background: "rgba(107, 47, 90, 0.15)", color: "#6b2f5a" }
                          : { background: "rgba(79, 77, 154, 0.12)", color: "#4f4d9a" }
                      }
                    >
                      {twibbon.type}
                    </span>
                  </div>

                  <div className="mt-auto grid grid-cols-3 gap-3 border-t pt-4" style={{ borderColor: "rgba(79, 77, 154, 0.08)" }}>
                    <Link
                      href={`/admin/twibbons/${twibbon.id}/edit`}
                      className="text-center font-black uppercase tracking-widest text-xs px-3 py-2.5 rounded-xl transition-all"
                      style={{ background: "rgba(79, 77, 154, 0.12)", color: "#4f4d9a" }}
                    >
                      EDIT
                    </Link>
                    <a
                      href={`/${twibbon.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-center font-black uppercase tracking-widest text-xs px-3 py-2.5 rounded-xl transition-all"
                      style={{ background: "rgba(47, 47, 103, 0.08)", color: "#2f2f67" }}
                    >
                      LIHAT
                    </a>
                    <DeleteButton id={twibbon.id.toString()} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
