"use client";

import { createTwibbon } from "@/app/actions/twibbonActions";
import Link from "next/link";
import { useState } from "react";

export default function CreateTwibbonPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [type, setType] = useState<"IMAGE" | "VIDEO">("IMAGE");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setIsSubmitting(true);
    // form will naturally submit via action prop but we can just manage loading state here
  };

  return (
    <div className="max-w-4xl mx-auto pb-10">
      <div className="flex items-center space-x-4 mb-10">
        <Link
          href="/admin/twibbons"
          className="text-gray-400 hover:text-[#0038FF] transition-colors p-3 bg-white rounded-full shadow-sm hover:shadow-md"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="3"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            ></path>
          </svg>
        </Link>
        <h1 className="text-4xl md:text-5xl font-black font-sans text-gray-900 uppercase tracking-tighter">
          Tambah Twibbon Baru
        </h1>
      </div>

      <div className="bg-white rounded-[2rem] border-2 border-gray-100 shadow-xl overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-[#0038FF] to-[#CCFF00]" />

        <form
          action={createTwibbon}
          onSubmit={handleSubmit}
          className="p-8 md:p-12 space-y-10"
        >
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tight text-gray-900 mb-6">
                Informasi Dasar
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="title"
                    className="block text-xs font-black uppercase tracking-widest text-gray-900 mb-2"
                  >
                    Judul Kampanye <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    required
                    placeholder="Contoh: HUT RI 80"
                    className="appearance-none block w-full px-5 py-4 border-2 border-gray-200 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#0038FF]/20 focus:border-[#0038FF] font-bold transition-all shadow-sm"
                  />
                </div>

                <div>
                  <label
                    htmlFor="slug"
                    className="block text-xs font-black uppercase tracking-widest text-gray-900 mb-2"
                  >
                    Slug (URL) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="slug"
                    name="slug"
                    required
                    placeholder="contoh: hut-ri-80"
                    className="appearance-none block w-full px-5 py-4 border-2 border-gray-200 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#0038FF]/20 focus:border-[#0038FF] font-bold transition-all shadow-sm"
                  />
                  <p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                    URL Publik: /<span className="text-[#0038FF]">nama-slug</span>
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-xs font-black uppercase tracking-widest text-gray-900 mb-2"
              >
                Caption
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                placeholder="Ceritakan singkat tentang kampanye ini..."
                className="appearance-none block w-full px-5 py-4 border-2 border-gray-200 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#0038FF]/20 focus:border-[#0038FF] font-bold transition-all shadow-sm resize-none"
              ></textarea>
            </div>
          </div>

          <div className="border-t-2 border-gray-100 pt-10">
            <h2 className="text-2xl font-black uppercase tracking-tight text-gray-900 mb-6">
              Pengaturan Format
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-gray-900 mb-3">
                  Tipe Twibbon
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <label
                    className={`relative flex items-center justify-center p-4 border-2 rounded-xl cursor-pointer transition-all ${type === "IMAGE" ? "border-[#0038FF] bg-blue-50" : "border-gray-200 hover:border-gray-300"}`}
                  >
                    <input
                      type="radio"
                      name="type"
                      value="IMAGE"
                      checked={type === "IMAGE"}
                      onChange={() => setType("IMAGE")}
                      className="sr-only"
                    />
                    <span
                      className={`text-sm font-black uppercase tracking-widest ${type === "IMAGE" ? "text-[#0038FF]" : "text-gray-400"}`}
                    >
                      GAMBAR (STATIC)
                    </span>
                    {type === "IMAGE" && (
                      <div className="absolute top-2 right-2 w-3 h-3 bg-[#0038FF] rounded-full" />
                    )}
                  </label>
                  <label
                    className={`relative flex items-center justify-center p-4 border-2 rounded-xl cursor-pointer transition-all ${type === "VIDEO" ? "border-[#0038FF] bg-blue-50" : "border-gray-200 hover:border-gray-300"}`}
                  >
                    <input
                      type="radio"
                      name="type"
                      value="VIDEO"
                      checked={type === "VIDEO"}
                      onChange={() => setType("VIDEO")}
                      className="sr-only"
                    />
                    <span
                      className={`text-sm font-black uppercase tracking-widest ${type === "VIDEO" ? "text-[#0038FF]" : "text-gray-400"}`}
                    >
                      VIDEO (WEBGL)
                    </span>
                    {type === "VIDEO" && (
                      <div className="absolute top-2 right-2 w-3 h-3 bg-[#0038FF] rounded-full" />
                    )}
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-gray-900 mb-3">
                  Status Publikasi
                </label>
                <label className="relative flex items-center p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-gray-300 transition-all bg-gray-50 h-[60px]">
                  <input
                    type="checkbox"
                    name="isActive"
                    defaultChecked
                    className="h-6 w-6 text-[#CCFF00] border-2 border-gray-300 rounded focus:ring-[#CCFF00] focus:ring-offset-0 bg-white"
                  />
                  <span className="ml-3 text-sm font-black uppercase tracking-wider text-gray-900 mt-1">
                    Aktifkan Sekarang
                  </span>
                </label>
              </div>
            </div>
          </div>

          <div className="border-t-2 border-gray-100 pt-10">
            <h2 className="text-2xl font-black uppercase tracking-tight text-gray-900 mb-6">
              Unggah Berkas
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-blue-50/50 p-6 rounded-2xl border-2 border-blue-100 border-dashed">
                <label
                  htmlFor="layerFile"
                  className="block text-sm font-black uppercase tracking-widest text-[#0038FF] mb-3 flex items-center gap-2"
                >
                  <span className="text-2xl">🖼️</span> File Utama (Layer){" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  id="layerFile"
                  name="layerFile"
                  required
                  accept={
                    type === "VIDEO" ? "video/mp4,video/webm" : "image/png"
                  }
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-xs file:font-black file:uppercase file:tracking-widest file:bg-[#0038FF] file:text-white hover:file:bg-blue-800 transition-colors file:cursor-pointer"
                />
                <p className="mt-4 text-xs font-bold text-gray-500 leading-relaxed">
                  {type === "VIDEO"
                    ? "Format MP4/WebM. Gunakan latar belakang green screen solid untuk otomatis dihilangkan oleh sistem."
                    : "Format PNG. Pastikan area tempat foto pengguna berbentuk transparan murni."}
                </p>
              </div>

              <div className="bg-gray-50 p-6 rounded-2xl border-2 border-gray-200 border-dashed">
                <label
                  htmlFor="thumbnailFile"
                  className="block text-sm font-black uppercase tracking-widest text-gray-900 mb-3 flex items-center gap-2"
                >
                  <span className="text-2xl">📱</span> Thumbnail (Preview){" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  id="thumbnailFile"
                  name="thumbnailFile"
                  required
                  accept="image/jpeg,image/png,image/webp"
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-xs file:font-black file:uppercase file:tracking-widest file:bg-gray-200 file:text-black hover:file:bg-gray-300 transition-colors file:cursor-pointer"
                />
                <p className="mt-4 text-xs font-bold text-gray-500 leading-relaxed">
                  Format JPG/PNG. Gambar ini akan muncul di daftar twibbon dan
                  saat link disebar ke media sosial.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-10 flex flex-col md:flex-row justify-end items-center gap-4">
            <Link
              href="/admin/twibbons"
              className="w-full md:w-auto text-center px-8 py-4 rounded-full font-black text-sm uppercase tracking-wider text-gray-500 hover:text-black hover:bg-gray-100 transition-all"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full md:w-auto px-10 py-4 border-2 border-transparent text-sm font-black rounded-full text-black bg-[#CCFF00] hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-[#CCFF00]/50 transition-all shadow-lg border-b-4 border-yellow-500 active:border-b-0 active:translate-y-1 disabled:opacity-70 disabled:cursor-not-allowed uppercase tracking-wider"
            >
              {isSubmitting ? "Menyimpan..." : "SIMPAN KAMPANYE"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
