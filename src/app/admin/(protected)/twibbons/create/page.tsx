"use client";

import { createTwibbon } from "@/app/actions/twibbonActions";
import Link from "next/link";
import { useState } from "react";
import { createTwibbonSchema, MAX_VIDEO_SIZE, MAX_IMAGE_SIZE } from "@/lib/schemas";

export default function CreateTwibbonPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>("");
  const [type, setType] = useState<"IMAGE" | "VIDEO">("IMAGE");
  const [chromaColor, setChromaColor] = useState<string>("#00FF00");
  const [uploadProgress, setUploadProgress] = useState<{ percentage: number; loaded: string; total: string; fileName: string } | null>(null);

  const formatBytes = (bytes: number) => {
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  const uploadFile = (file: File, appName: string, secret: string, apiUrl: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", apiUrl, true);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percentComplete = Math.round((e.loaded / e.total) * 100);
          setUploadProgress({
            percentage: percentComplete,
            loaded: formatBytes(e.loaded),
            total: formatBytes(e.total),
            fileName: file.name
          });
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const res = JSON.parse(xhr.responseText);
            if (res.success) resolve(res.url);
            else reject(new Error(res.error || "Upload ditolak server"));
          } catch (err) {
            reject(new Error("Format response dari server tidak valid"));
          }
        } else {
          reject(new Error(`Server error: ${xhr.status}`));
        }
      };

      xhr.onerror = () => reject(new Error("Gagal menyambung ke server upload"));

      const fd = new FormData();
      fd.append("file", file);
      fd.append("app", appName);
      fd.append("secret", secret);
      xhr.send(fd);
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;

    setError("");
    setIsSubmitting(true);
    setUploadProgress(null);

    try {
      const formData = new FormData(e.currentTarget);
      
      const layerFile = formData.get("layerFile") as File;
      const thumbnailFile = formData.get("thumbnailFile") as File;
      const formType = formData.get("type") as string;

      // Validasi Ukuran File secara Manual sebelum upload
      const maxLayerSize = formType === "VIDEO" ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
      if (!layerFile || layerFile.size === 0) throw new Error("File layer wajib diupload");
      if (layerFile.size > maxLayerSize) throw new Error(`Ukuran file layer maksimal ${formType === "VIDEO" ? "100MB" : "10MB"}`);
      
      if (!thumbnailFile || thumbnailFile.size === 0) throw new Error("Thumbnail wajib diupload");
      if (thumbnailFile.size > MAX_IMAGE_SIZE) throw new Error("Ukuran thumbnail maksimal 10MB");

      // Ambil kredensial upload dari server
      setUploadProgress({ percentage: 0, loaded: "0 MB", total: "0 MB", fileName: "Menyiapkan server..." });
      const credRes = await fetch("/api/admin/upload-credentials");
      if (!credRes.ok) throw new Error("Gagal mendapatkan akses upload");
      const creds = await credRes.json();

      // Upload Layer
      const layerUrl = await uploadFile(layerFile, "twibbon", creds.secret, creds.url);
      
      // Upload Thumbnail
      const thumbnailUrl = await uploadFile(thumbnailFile, "twibbon", creds.secret, creds.url);

      setUploadProgress({ percentage: 100, loaded: "Selesai", total: "Selesai", fileName: "Menyimpan ke database..." });

      // Build data final untuk dikirim ke Server Action
      const finalFormData = new FormData();
      finalFormData.append("title", formData.get("title") as string);
      finalFormData.append("slug", formData.get("slug") as string);
      if (formData.get("description")) finalFormData.append("description", formData.get("description") as string);
      finalFormData.append("type", formType);
      finalFormData.append("isActive", formData.get("isActive") === "on" ? "true" : "false");
      if (formType === "VIDEO") {
        finalFormData.append("chromaColor", chromaColor);
      }
      finalFormData.append("layerUrl", layerUrl);
      finalFormData.append("thumbnailUrl", thumbnailUrl);

      // Panggil Server Action
      await createTwibbon(finalFormData);

    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan yang tidak diketahui");
      setIsSubmitting(false);
      setUploadProgress(null);
    }
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
        <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-10">
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

            {type === "VIDEO" && (
              <div className="pt-6">
                <label className="block text-xs font-extrabold uppercase tracking-widest mb-3" style={{ color: "#2f2f67" }}>
                  Warna Transparan (Chroma Key)
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="color"
                    value={chromaColor}
                    onChange={(e) => setChromaColor(e.target.value)}
                    className="w-14 h-14 rounded-xl cursor-pointer border-0 bg-transparent p-0"
                  />
                  <input
                    type="text"
                    value={chromaColor.toUpperCase()}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val.startsWith("#") && val.length <= 7) setChromaColor(val);
                    }}
                    placeholder="#00FF00"
                    className="appearance-none block w-full md:w-64 px-5 py-3.5 border rounded-xl focus:outline-none sm:text-sm font-semibold transition-all shadow-sm uppercase"
                    style={{
                      background: "rgba(255, 255, 255, 0.8)",
                      borderColor: "rgba(79, 77, 154, 0.2)",
                      color: "#2f2f67",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setChromaColor("#00FF00")}
                    className="px-4 py-3.5 rounded-xl text-xs font-bold border transition-all"
                    style={{ background: "rgba(0,255,0,0.1)", borderColor: "rgba(0,255,0,0.3)", color: "green" }}
                  >
                    Reset Hijau
                  </button>
                </div>
                <p className="mt-3 text-xs font-semibold" style={{ color: "#4f4d9a", opacity: 0.8 }}>
                  Pilih warna background pada video yang akan dihapus (dijadikan transparan) oleh sistem web. 
                  Sangat disarankan menggunakan warna Hijau Murni (#00FF00) atau Biru Murni (#0000FF).
                </p>
              </div>
            )}
          </div>

          <div className="border-t pt-8" style={{ borderColor: "rgba(79, 77, 154, 0.1)" }}>
            <h2 className="text-2xl font-black uppercase tracking-tight mb-6" style={{ color: "#2f2f67" }}>
              Unggah Berkas
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div
                className="p-6 rounded-2xl border border-dashed relative overflow-hidden"
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
                  className="block w-full text-xs text-gray-500 file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:text-xs file:font-extrabold file:uppercase file:tracking-widest transition-colors file:cursor-pointer relative z-10"
                  style={{ color: "#2f2f67" }}
                />
                <p className="mt-4 text-xs font-semibold leading-relaxed relative z-10" style={{ color: "#4f4d9a", opacity: 0.7 }}>
                  {type === "VIDEO"
                    ? "Format MP4/WebM. Gunakan latar belakang green screen solid untuk otomatis dihilangkan oleh sistem."
                    : "Format PNG. Pastikan area tempat foto pengguna berbentuk transparan murni."}
                </p>
              </div>

              <div
                className="p-6 rounded-2xl border border-dashed relative overflow-hidden"
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
                  className="block w-full text-xs text-gray-500 file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:text-xs file:font-extrabold file:uppercase file:tracking-widest transition-colors file:cursor-pointer relative z-10"
                  style={{ color: "#2f2f67" }}
                />
                <p className="mt-4 text-xs font-semibold leading-relaxed relative z-10" style={{ color: "#4f4d9a", opacity: 0.7 }}>
                  Format JPG/PNG. Gambar ini akan muncul di daftar twibbon dan saat link disebar ke media sosial.
                </p>
              </div>
            </div>
          </div>

          {/* PROGRESS BAR UI */}
          {isSubmitting && uploadProgress && (
            <div className="pt-6">
              <div className="p-5 rounded-2xl border border-solid" style={{ borderColor: "rgba(79, 77, 154, 0.2)", background: "rgba(255, 255, 255, 0.8)" }}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-extrabold uppercase tracking-widest" style={{ color: "#4f4d9a" }}>
                    Proses Upload: <span className="truncate max-w-[150px] inline-block align-bottom">{uploadProgress.fileName}</span>
                  </span>
                  <span className="text-xs font-black" style={{ color: "#2f2f67" }}>
                    {uploadProgress.percentage}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2 overflow-hidden relative">
                  <div className="h-2.5 rounded-full transition-all duration-300 ease-out" style={{ width: `${uploadProgress.percentage}%`, background: "#4f4d9a" }}></div>
                </div>
                <div className="text-[10px] font-bold text-right uppercase tracking-wider" style={{ color: "rgba(47, 47, 103, 0.6)" }}>
                  {uploadProgress.loaded} / {uploadProgress.total}
                </div>
              </div>
            </div>
          )}

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
