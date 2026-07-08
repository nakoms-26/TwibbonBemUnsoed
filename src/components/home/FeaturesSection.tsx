import Link from "next/link";
import { ArrowBlack } from "@/components/ui/Accents";

export default function FeaturesSection() {
  return (
    <section className="bg-white text-black rounded-t-[2.5rem] md:rounded-t-[3.5rem] px-6 py-12 md:px-10 md:py-16 relative z-20 shadow-[0_-20px_50px_rgba(0,0,0,0.2)] mt-auto w-full">
      <div className="max-w-6xl mx-auto">
        {/* CTA Row */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 gap-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
              Platform Twibbon
            </p>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight">
              Gabungkan foto Anda
              <br />
              dalam hitungan detik.
            </h2>
          </div>
          <Link
            href="/twibbons"
            className="w-full md:w-auto text-center shrink-0 px-8 py-4 rounded-full bg-[#0038FF] text-white font-black text-sm md:text-base hover:bg-blue-700 transition-colors shadow-lg"
          >
            Lihat Semua Twibbon →
          </Link>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-[#F8F9FA] rounded-[2rem] p-8 flex flex-col relative h-56 border border-gray-100">
            <h3 className="text-xl md:text-2xl uppercase leading-tight mb-2 font-black">
              PILIH
              <br />
              TWIBBON
            </h3>
            <p className="text-xs text-black/60 font-bold">
              Temukan kampanye yang ingin Anda dukung
            </p>
            <div className="mt-auto flex items-center bg-[#0038FF] rounded-2xl p-2 text-white shadow-md w-fit">
              <span className="text-2xl mr-2">🖼️</span>
              <span className="text-xs font-bold">Kampanye Aktif</span>
              <span className="ml-3 bg-[#CCFF00] text-black font-black text-[10px] px-2 py-1 rounded-lg">
                LIVE
              </span>
            </div>
            <div className="hidden md:block absolute -right-10 bottom-8 w-14 h-14 z-30">
              <ArrowBlack />
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-[#F8F9FA] rounded-[2rem] p-8 flex flex-col relative h-56 border border-gray-100">
            <h3 className="text-xl md:text-2xl uppercase leading-tight mb-2 font-black">
              UPLOAD
              <br />
              FOTO KAMU
            </h3>
            <p className="text-xs text-black/60 font-bold">
              Sesuaikan posisi dan ukuran sesukamu
            </p>
            <div className="mt-auto flex items-center bg-[#0038FF] rounded-full p-1.5 text-white shadow-md w-fit">
              <div className="bg-white/20 font-bold text-xs px-4 py-2 rounded-full mr-2">
                Drag & Drop
              </div>
              <span className="text-xl pr-2">📸</span>
            </div>
            <div className="hidden md:block absolute -right-10 bottom-8 w-14 h-14 z-30">
              <ArrowBlack />
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-[#F8F9FA] rounded-[2rem] p-8 flex flex-col relative h-56 border border-gray-100">
            <h3 className="text-xl md:text-2xl uppercase leading-tight mb-2 font-black">
              DOWNLOAD
              <br />& SHARE
            </h3>
            <p className="text-xs text-black/60 font-bold">
              Langsung selesai, tinggal upload ke medsos
            </p>
            <div className="flex flex-col items-center bg-[#CCFF00] rounded-[2rem] px-6 py-3 text-black shadow-md mt-auto relative w-fit">
              <p className="text-[9px] font-bold uppercase tracking-wider">
                Hasil Resolusi Tinggi
              </p>
              <p className="text-lg font-black">PNG 1080×1080</p>
              <div className="absolute -bottom-2 left-6 w-4 h-4 bg-[#CCFF00] transform rotate-45" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
