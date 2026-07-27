import { ArrowRight, Image as ImageIcon, Camera, Download } from "lucide-react";

export default function FeaturesSection() {
  return (
    <section className="px-6 pb-12 pt-4 md:px-10 md:pb-24 md:pt-8 relative z-20 mt-auto w-full bg-white">
      <div className="max-w-[1440px] mx-auto">
        {/* CTA Row */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 gap-6">
          <div>
            <p
              className="text-xs font-bold uppercase tracking-widest mb-2"
              style={{ color: "#2d1b69" }}
            >
              Platform Twibbon
            </p>
            <h2
              className="text-2xl sm:text-3xl md:text-4xl font-black leading-tight uppercase tracking-tight"
              style={{ color: "#1e0a4a" }}
            >
              Gabungkan foto Anda
              <br />
              dalam hitungan detik.
            </h2>
          </div>
        </div>

        {/* Feature Cards (Original 3-step layout) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div
            className="rounded-[2rem] p-8 flex flex-col relative h-60 transition-transform duration-300 hover:-translate-y-1"
            style={{
              background: "#f4f4f9",
              border: "1px solid rgba(45, 27, 105, 0.08)",
            }}
          >
            <h3
              className="text-xl md:text-2xl uppercase leading-tight mb-2 font-black"
              style={{ color: "#1e0a4a" }}
            >
              PILIH
              <br />
              TWIBBON
            </h3>
            <p
              className="text-xs font-bold"
              style={{ color: "#2d1b69", opacity: 0.8 }}
            >
              Temukan kampanye yang ingin Anda dukung
            </p>
            <div
              className="mt-auto flex items-center rounded-2xl p-2.5 text-white shadow-sm w-fit"
              style={{ background: "#2d1b69" }}
            >
              <ImageIcon size={18} className="mr-2 text-white" />
              <span className="text-xs font-bold mr-3">Kampanye Aktif</span>
              <span
                className="font-black text-[10px] px-2 py-0.5 rounded-lg uppercase tracking-wider text-[#2f2f67]"
                style={{ background: "#FDB927", color: "#1e0a4a" }}
              >
                LIVE
              </span>
            </div>
            <div
              className="hidden md:flex absolute -right-5 bottom-8 w-10 h-10 items-center justify-center rounded-full pointer-events-none z-30"
              style={{ background: "rgba(45, 27, 105, 0.1)", color: "#2d1b69" }}
            >
              <ArrowRight size={18} />
            </div>
          </div>

          {/* Card 2 */}
          <div
            className="rounded-[2rem] p-8 flex flex-col relative h-60 transition-transform duration-300 hover:-translate-y-1"
            style={{
              background: "#f4f4f9",
              border: "1px solid rgba(45, 27, 105, 0.08)",
            }}
          >
            <h3
              className="text-xl md:text-2xl uppercase leading-tight mb-2 font-black"
              style={{ color: "#1e0a4a" }}
            >
              UPLOAD
              <br />
              FOTO KAMU
            </h3>
            <p
              className="text-xs font-bold"
              style={{ color: "#2d1b69", opacity: 0.8 }}
            >
              Sesuaikan posisi dan ukuran sesukamu
            </p>
            <div
              className="mt-auto flex items-center rounded-full p-2 text-white shadow-sm w-fit"
              style={{ background: "#2d1b69" }}
            >
              <div
                className="font-bold text-xs px-3.5 py-1.5 rounded-full mr-2"
                style={{ background: "rgba(255, 255, 255, 0.2)" }}
              >
                Drag & Drop
              </div>
              <Camera size={18} className="mr-1.5" />
            </div>
            <div
              className="hidden md:flex absolute -right-5 bottom-8 w-10 h-10 items-center justify-center rounded-full pointer-events-none z-30"
              style={{ background: "rgba(45, 27, 105, 0.1)", color: "#2d1b69" }}
            >
              <ArrowRight size={18} />
            </div>
          </div>

          {/* Card 3 */}
          <div
            className="rounded-[2rem] p-8 flex flex-col relative h-60 transition-transform duration-300 hover:-translate-y-1"
            style={{
              background: "#f4f4f9",
              border: "1px solid rgba(45, 27, 105, 0.08)",
            }}
          >
            <h3
              className="text-xl md:text-2xl uppercase leading-tight mb-2 font-black"
              style={{ color: "#1e0a4a" }}
            >
              DOWNLOAD
              <br />& SHARE
            </h3>
            <p
              className="text-xs font-bold"
              style={{ color: "#2d1b69", opacity: 0.8 }}
            >
              Langsung selesai, tinggal upload ke medsos
            </p>
            <div
              className="flex flex-col items-start rounded-[1.5rem] px-5 py-3 text-[#1e0a4a] shadow-sm mt-auto relative w-fit"
              style={{ background: "#FDB927" }}
            >
              <p className="text-[9px] font-bold uppercase tracking-wider opacity-80">
                Hasil Resolusi Tinggi
              </p>
              <div className="flex items-center space-x-2 mt-0.5">
                <Download size={16} />
                <p className="text-sm font-black uppercase">PNG & MP4 HD</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
