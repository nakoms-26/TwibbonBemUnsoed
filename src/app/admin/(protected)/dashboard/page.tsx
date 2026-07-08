import prisma from "@/lib/prisma";
import Link from "next/link";

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
    <div>
      <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-8 uppercase tracking-tighter">
        DASHBOARD
      </h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white p-8 rounded-[2rem] border-2 border-gray-100 shadow-xl flex items-center space-x-6 relative overflow-hidden">
          <div className="p-4 bg-[#0038FF] text-white rounded-2xl shadow-inner">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Total Twibbon</p>
            <p className="text-4xl font-black text-gray-900">{totalTwibbons}</p>
          </div>
        </div>

        <div className="bg-[#CCFF00] p-8 rounded-[2rem] shadow-xl flex items-center space-x-6 relative overflow-hidden border-[3px] border-black/5">
          <div className="p-4 bg-black text-[#CCFF00] rounded-2xl shadow-inner">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-black/60 mb-1">Twibbon Aktif</p>
            <p className="text-4xl font-black text-black">{activeTwibbons}</p>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2rem] border-2 border-gray-100 shadow-xl flex items-center space-x-6 relative overflow-hidden">
          <div className="p-4 bg-purple-100 text-purple-600 rounded-2xl shadow-inner">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Total Download</p>
            <p className="text-4xl font-black text-gray-900">{totalDownloads}</p>
          </div>
        </div>
      </div>

      {/* Recent Twibbons Table */}
      <div className="bg-white rounded-[2rem] border-2 border-gray-100 shadow-xl overflow-hidden">
        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">TWIBBON TERBARU</h2>
          <Link href="/admin/twibbons" className="text-xs font-black px-4 py-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors uppercase tracking-wider">
            Lihat Semua &rarr;
          </Link>
        </div>
        <div className="p-6 md:p-8 bg-gray-50/20">
          {recentTwibbons.length === 0 ? (
            <div className="text-center py-10 text-gray-500 font-bold">
              Belum ada twibbon yang dibuat.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recentTwibbons.map((twibbon) => (
                <div key={twibbon.id} className="bg-white p-6 rounded-2xl border-2 border-gray-100 shadow-sm flex flex-col hover:border-blue-200 transition-colors">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex flex-col">
                      <span className="text-lg font-black text-gray-900 uppercase leading-tight line-clamp-1">{twibbon.title}</span>
                      <span className="text-xs font-bold text-gray-400">/{twibbon.slug}</span>
                    </div>
                    <span className={`px-3 py-1.5 inline-flex text-[10px] uppercase tracking-widest font-black rounded-md shrink-0 ${twibbon.isActive ? 'bg-[#CCFF00] text-black' : 'bg-red-100 text-red-800'}`}>
                      {twibbon.isActive ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </div>
                  <div className="mt-auto flex items-center justify-between border-t-2 border-gray-50 pt-4">
                    <span className="text-[10px] font-black text-[#0038FF] bg-blue-50 px-2 py-1 rounded uppercase tracking-wider">
                      {twibbon.type}
                    </span>
                    <span className="text-xs font-bold text-gray-400">
                      {new Date(twibbon.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
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
