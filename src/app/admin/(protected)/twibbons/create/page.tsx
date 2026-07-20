"use client";

import { createTwibbon } from "@/app/actions/twibbonActions";
import Link from "next/link";
import { useState } from "react";
import { createTwibbonSchema } from "@/lib/schemas";

export default function CreateTwibbonPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>("");
  const [type, setType] = useState<"IMAGE" | "VIDEO">("IMAGE");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const formData = new FormData(e.currentTarget);
    const rawData = {
      title: formData.get("title"),
      slug: formData.get("slug"),
      description: formData.get("description") || undefined,
      type: formData.get("type"),
      isActive: formData.get("isActive") === "on",
      layerFile: formData.get("layerFile"),
      thumbnailFile: formData.get("thumbnailFile"),
    };

    const validatedFields = createTwibbonSchema.safeParse(rawData);
    if (!validatedFields.success) {
      e.preventDefault();
      setError(validatedFields.error.errors[0].message);
      return;
    }

    setError("");
    setIsSubmitting(true);
  };

  return (
    <div className="max-w-4xl mx-auto pb-10">
      <div className="flex items-center space-x-4 mb-8">
        <Link
          href="/admin/twibbons"
          className="p-3 rounded-full transition-all shadow-sm hover:shadow-md"
          style={{
            background: "rgba(255, 255, 255, 0.7)",
            border: "1px solid rgba(79, 77, 154, 0.15)",
            color: "#4f4d9a",
          }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
        </Link>
        <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight" style={{ color: "#2f2f67" }}>
          TAMBAH TWIBBON BARU
        </h1>
      </div>

      <div
        className="rounded-[2rem] overflow-hidden relative"
        style={{
          background: "rgba(255, 255, 255, 0.65)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1px solid rgba(79, 77, 154, 0.12)",
          boxShadow: "0 4px 24px rgba(79, 77, 154, 0.08)",
        }}
      >
        <form action={createTwibbon} onSubmit={handleSubmit} className="p-8 md:p-12 space-y-10">
          {error && (
            <div
              className="p-4 rounded-xl text-xs font-bold border"
              style={{
                background: "rgba(239, 68, 68, 0.08)",
                color: "#dc2626",
                borderColor: "rgba(239, 68, 68, 0.2)",
              }}
            >
              {error}
            </div>
          )}

          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tight mb-6" style={{ color: "#2f2f67" }}>
                Informasi Dasar
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="title" className="block text-xs font-extrabold uppercase tracking-widest mb-2" style={{ color: "#2f2f67" }}>
                    Judul Kampanye <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    required
                    placeholder="Contoh: HUT RI 80"
                    className="appearance-none block w-full px-5 py-3.5 border rounded-xl focus:outline-none sm:text-sm font-semibold transition-all shadow-sm"
                    style={{
                      background: "rgba(255, 255, 255, 0.8)",
                      borderColor: "rgba(79, 77, 154, 0.2)",
                      color: "#2f2f67",
                    }}
                  />
                </div>

                <div>
                  <label htmlFor="slug" className="block text-xs font-extrabold uppercase tracking-widest mb-2" style={{ color: "#2f2f67" }}>
                    Slug (URL) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="slug"
                    name="slug"
                    required
                    placeholder="contoh: hut-ri-80"
                    className="appearance-none block w-full px-5 py-3.5 border rounded-xl focus:outline-none sm:text-sm font-semibold transition-all shadow-sm"
                    style={{
                      background: "rgba(255, 255, 255, 0.8)",
                      borderColor: "rgba(79, 77, 154, 0.2)",
                      color: "#2f2f67",
                    }}
                  />
                  <p className="mt-2 text-[10px] font-bold uppercase tracking-wider" style={{ color: "#4f4d9a", opacity: 0.7 }}>
                    URL Publik: /<span style={{ color: "#4f4d9a" }}>nama-slug</span>
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-xs font-extrabold uppercase tracking-widest mb-2" style={{ color: "#2f2f67" }}>
                Caption
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                placeholder="Ceritakan singkat tentang kampanye ini..."
                className="appearance-none block w-full px-5 py-3.5 border rounded-xl focus:outline-none sm:text-sm font-semibold transition-all shadow-sm resize-none"
                style={{
                  background: "rgba(255, 255, 255, 0.8)",
                  borderColor: "rgba(79, 77, 154, 0.2)",
                  color: "#2f2f67",
                }}
              ></textarea>
            </div>
          </div>

          <div className="border-t pt-8" style={{ borderColor: "rgba(79, 77, 154, 0.1)" }}>
            <h2 className="text-2xl font-black uppercase tracking-tight mb-6" style={{ color: "#2f2f67" }}>
              Pengaturan Format
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-widest mb-3" style={{ color: "#2f2f67" }}>
                  Tipe Twibbon
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <label
                    className={`relative flex items-center justify-center p-4 border rounded-xl cursor-pointer transition-all ${
                      type === "IMAGE" ? "shadow-sm" : ""
                    }`}
                    style={
                      type === "IMAGE"
                        ? { borderColor: "#4f4d9a", background: "rgba(79, 77, 154, 0.08)" }
                        : { borderColor: "rgba(79, 77, 154, 0.2)", background: "rgba(255, 255, 255, 0.5)" }
                    }
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
                      className="text-xs font-black uppercase tracking-widest"
                      style={{ color: type === "IMAGE" ? "#4f4d9a" : "rgba(47, 47, 103, 0.5)" }}
                    >
                      GAMBAR (STATIC)
                    </span>
                  </label>
                  <label
                    className={`relative flex items-center justify-center p-4 border rounded-xl cursor-pointer transition-all ${
                      type === "VIDEO" ? "shadow-sm" : ""
                    }`}
                    style={
                      type === "VIDEO"
                        ? { borderColor: "#4f4d9a", background: "rgba(79, 77, 154, 0.08)" }
                        : { borderColor: "rgba(79, 77, 154, 0.2)", background: "rgba(255, 255, 255, 0.5)" }
                    }
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
                      className="text-xs font-black uppercase tracking-widest"
                      style={{ color: type === "VIDEO" ? "#4f4d9a" : "rgba(47, 47, 103, 0.5)" }}
                    >
                      VIDEO (WEBGL)
                    </span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase tracking-widest mb-3" style={{ color: "#2f2f67" }}>
                  Status Publikasi
                </label>
                <label
                  className="relative flex items-center p-4 border rounded-xl cursor-pointer transition-all h-[54px]"
                  style={{ background: "rgba(255, 255, 255, 0.6)", borderColor: "rgba(79, 77, 154, 0.2)" }}
                >
                  <input
                    type="checkbox"
                    name="isActive"
                    defaultChecked
                    className="h-5 w-5 rounded focus:ring-0 cursor-pointer"
                    style={{ accentColor: "#4f4d9a" }}
                  />
                  <span className="ml-3 text-xs font-extrabold uppercase tracking-wider" style={{ color: "#2f2f67" }}>
                    Aktifkan Sekarang
                  </span>
                </label>
              </div>
            </div>
          </div>

          <div className="border-t pt-8" style={{ borderColor: "rgba(79, 77, 154, 0.1)" }}>
            <h2 className="text-2xl font-black uppercase tracking-tight mb-6" style={{ color: "#2f2f67" }}>
              Unggah Berkas
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div
                className="p-6 rounded-2xl border border-dashed"
                style={{ background: "rgba(79, 77, 154, 0.04)", borderColor: "rgba(79, 77, 154, 0.25)" }}
              >
                <label htmlFor="layerFile" className="block text-xs font-extrabold uppercase tracking-widest mb-3" style={{ color: "#4f4d9a" }}>
                  File Utama (Layer) <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  id="layerFile"
                  name="layerFile"
                  required
                  accept={type === "VIDEO" ? "video/mp4,video/webm" : "image/png"}
                  className="block w-full text-xs text-gray-500 file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:text-xs file:font-extrabold file:uppercase file:tracking-widest transition-colors file:cursor-pointer"
                  style={{ color: "#2f2f67" }}
                />
                <p className="mt-4 text-xs font-semibold leading-relaxed" style={{ color: "#4f4d9a", opacity: 0.7 }}>
                  {type === "VIDEO"
                    ? "Format MP4/WebM. Gunakan latar belakang green screen solid untuk otomatis dihilangkan oleh sistem."
                    : "Format PNG. Pastikan area tempat foto pengguna berbentuk transparan murni."}
                </p>
              </div>

              <div
                className="p-6 rounded-2xl border border-dashed"
                style={{ background: "rgba(255, 255, 255, 0.4)", borderColor: "rgba(79, 77, 154, 0.2)" }}
              >
                <label htmlFor="thumbnailFile" className="block text-xs font-extrabold uppercase tracking-widest mb-3" style={{ color: "#2f2f67" }}>
                  Thumbnail (Preview) <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  id="thumbnailFile"
                  name="thumbnailFile"
                  required
                  accept="image/jpeg,image/png,image/webp"
                  className="block w-full text-xs text-gray-500 file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:text-xs file:font-extrabold file:uppercase file:tracking-widest transition-colors file:cursor-pointer"
                  style={{ color: "#2f2f67" }}
                />
                <p className="mt-4 text-xs font-semibold leading-relaxed" style={{ color: "#4f4d9a", opacity: 0.7 }}>
                  Format JPG/PNG. Gambar ini akan muncul di daftar twibbon dan saat link disebar ke media sosial.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-8 flex flex-col md:flex-row justify-end items-center gap-4">
            <Link
              href="/admin/twibbons"
              className="w-full md:w-auto text-center px-8 py-3.5 rounded-full font-extrabold text-xs uppercase tracking-wider transition-all"
              style={{ color: "#4f4d9a" }}
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full md:w-auto px-10 py-3.5 text-xs font-extrabold rounded-full text-white hover:scale-[1.02] focus:outline-none transition-all shadow-md disabled:opacity-70 disabled:cursor-not-allowed uppercase tracking-wider"
              style={{
                background: "#4f4d9a",
                boxShadow: "0 4px 16px rgba(79, 77, 154, 0.3)",
              }}
            >
              {isSubmitting ? "Menyimpan..." : "SIMPAN KAMPANYE"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
