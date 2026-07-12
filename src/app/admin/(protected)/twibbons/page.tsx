import prisma from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import DeleteButton from "./DeleteButton";

export default async function TwibbonsListPage() {
  const twibbons = await prisma.twibbon.findMany({
    orderBy: { createdAt: "desc" }
  });

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <h1 className="text-4xl md:text-5xl font-black text-gray-900 uppercase tracking-tighter">Kelola Twibbon</h1>
        <Link 
          href="/admin/twibbons/create" 
          className="bg-[#CCFF00] hover:scale-[1.02] text-black px-6 py-4 rounded-full font-black text-sm uppercase tracking-wider transition-all shadow-md border-b-4 border-yellow-500 active:border-b-0 active:translate-y-1"
        >
          + TAMBAH TWIBBON
        </Link>
      </div>

      <div className="bg-white border-2 border-gray-100 rounded-[2rem] shadow-xl overflow-hidden">
        {twibbons.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-4">📸</div>
            <h3 className="text-2xl font-black text-gray-900 mb-2 uppercase">Belum ada Twibbon</h3>
            <p className="text-gray-500 max-w-sm mx-auto mb-6 font-bold">Mulai buat kampanye pertama Anda dengan menambahkan twibbon baru.</p>
            <Link 
              href="/admin/twibbons/create" 
              className="inline-flex items-center text-sm font-black text-[#0038FF] hover:text-blue-800 uppercase tracking-wider"
            >
              BUAT SEKARANG &rarr;
            </Link>
          </div>
        ) : (
          <div className="p-6 md:p-8 bg-gray-50/20">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {twibbons.map((twibbon) => (
                <div key={twibbon.id} className="bg-white p-6 rounded-2xl border-2 border-gray-100 shadow-sm flex flex-col hover:border-blue-200 transition-colors">
                  <div className="flex justify-between items-start mb-4">
                    <div className="relative h-16 w-16 bg-gray-100 rounded-xl overflow-hidden border-2 border-gray-200 shrink-0 mr-4">
                      {twibbon.thumbnail ? (
                        <Image src={twibbon.thumbnail} alt={twibbon.title} fill className="object-contain p-1" sizes="64px" />
                      ) : (
                        <div className="flex items-center justify-center h-full w-full text-gray-400 font-black text-xl">?</div>
                      )}
                    </div>
                    <div className="flex flex-col flex-1">
                      <span className="text-lg font-black text-gray-900 uppercase leading-tight line-clamp-1">{twibbon.title}</span>
                      <span className="text-xs font-bold text-gray-400 mb-1">/{twibbon.slug}</span>
                      <span className="text-xs font-bold text-gray-500 line-clamp-1">{twibbon.description}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 mb-6">
                    <span className={`px-3 py-1.5 inline-flex text-[10px] uppercase tracking-widest font-black rounded-md ${twibbon.isActive ? 'bg-[#CCFF00] text-black' : 'bg-red-100 text-red-800'}`}>
                      {twibbon.isActive ? 'AKTIF' : 'NONAKTIF'}
                    </span>
                    <span className="px-3 py-1.5 inline-flex text-[10px] uppercase tracking-widest font-black rounded-md bg-blue-100 text-[#0038FF]">
                      {twibbon.type}
                    </span>
                  </div>

                  <div className="mt-auto grid grid-cols-3 gap-3 border-t-2 border-gray-50 pt-4">
                    <Link href={`/admin/twibbons/${twibbon.id}/edit`} className="text-center bg-blue-50 text-[#0038FF] hover:bg-blue-100 hover:text-blue-800 font-black uppercase tracking-widest text-xs px-3 py-3 rounded-xl transition-colors">
                      EDIT
                    </Link>
                    <a href={`/${twibbon.slug}`} target="_blank" rel="noreferrer" className="text-center bg-gray-100 text-gray-900 hover:bg-gray-200 hover:text-black font-black uppercase tracking-widest text-xs px-3 py-3 rounded-xl transition-colors">
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
