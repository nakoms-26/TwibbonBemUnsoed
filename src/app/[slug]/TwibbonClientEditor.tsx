"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import Cropper from "react-easy-crop";
import {
  Upload,
  RefreshCw,
  Copy,
  Download,
  CheckCircle,
  ExternalLink,
  Video,
} from "lucide-react";

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new window.Image();

    if (url.startsWith("data:") || url.startsWith("blob:") || url.startsWith("/")) {
      image.addEventListener("load", () => resolve(image));
      image.addEventListener("error", (error) => {
        console.error("Image load error event:", error);
        reject(new Error(`Gagal memuat gambar dari URL: ${url}`));
      });
      image.src = url;
      return;
    }

    image.setAttribute("crossOrigin", "anonymous");
    const proxyUrl = `/api/proxy?url=${encodeURIComponent(url)}`;

    const tryFallback = () => {
      const fallbackImg = new window.Image();
      fallbackImg.setAttribute("crossOrigin", "anonymous");
      fallbackImg.addEventListener("load", () => resolve(fallbackImg));
      fallbackImg.addEventListener("error", (err) => {
        console.error("Image fallback load error:", err);
        reject(
          new Error(
            `Gagal memuat gambar baik via proxy maupun langsung. Pastikan server gambar mengizinkan CORS. URL: ${url}`,
          ),
        );
      });
      fallbackImg.src = url;
    };

    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", () => {
      console.warn(`Proxy gagal memuat ${url}, mencoba fallback direct URL...`);
      tryFallback();
    });

    image.src = proxyUrl;
  });

export interface TwibbonData {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  type: string;
  overlayFile: string;
  thumbnail: string | null;
  downloadsCount?: number;
  config?: Record<string, unknown> | string | null;
}

export default function TwibbonClientEditor({
  twibbon,
}: {
  twibbon: TwibbonData;
}) {
  const isVideo = twibbon.type === "VIDEO";
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Record<
    string,
    number
  > | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [showFullCaption, setShowFullCaption] = useState(false);
  const [copiedCaption, setCopiedCaption] = useState(false);

  const [overlayDims, setOverlayDims] = useState<{
    width: number;
    height: number;
  } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [containerSize, setContainerSize] = useState<{
    width: number;
    height: number;
  } | null>(null);

  // Parse config if string
  const config =
    typeof twibbon.config === "string"
      ? (() => {
          try {
            return JSON.parse(twibbon.config);
          } catch {
            return {};
          }
        })()
      : twibbon.config || {};

  const capcutUrl: string =
    config.capcutUrl ||
    config.capcutLink ||
    config.templateUrl ||
    "https://www.capcut.com";

  // Hit download count / visit
  useEffect(() => {
    fetch("/api/downloads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ twibbonId: twibbon.id }),
    }).catch(() => {});
  }, [twibbon.id]);

  // Load overlay image dimensions (only for IMAGE mode)
  useEffect(() => {
    if (isVideo) return;
    const loadOverlay = async () => {
      try {
        const img = await createImage(twibbon.overlayFile);
        const width = img.naturalWidth || 1080;
        const height = Math.round(width * (5 / 4));
        setOverlayDims({ width, height });
      } catch (e) {
        console.error("Gagal memuat overlay", e);
        setOverlayDims({ width: 1080, height: 1350 });
      }
    };
    loadOverlay();
  }, [twibbon.overlayFile, isVideo]);

  // Container resize observer for responsive cropper
  useEffect(() => {
    if (isVideo || !containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0 && entry.contentRect.height > 0) {
          setContainerSize({
            width: entry.contentRect.width,
            height: entry.contentRect.height,
          });
        }
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [isVideo, resultUrl, imageSrc]);

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result as string);
        setResultUrl(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = useCallback(
    (_croppedArea: unknown, croppedPixels: Record<string, number>) => {
      setCroppedAreaPixels(croppedPixels);
    },
    [],
  );

  const handleCopyCaption = async () => {
    if (!twibbon.description) return;
    try {
      await navigator.clipboard.writeText(twibbon.description);
      setCopiedCaption(true);
      setTimeout(() => setCopiedCaption(false), 2000);
    } catch {
      alert("Caption berhasil disalin!");
    }
  };

  const generateTwibbon = async () => {
    if (!imageSrc || !croppedAreaPixels || !overlayDims) return;

    setIsProcessing(true);
    try {
      const userImg = await createImage(imageSrc);
      const overlayImg = await createImage(twibbon.overlayFile);
      const canvas = document.createElement("canvas");
      const canvasWidth = overlayDims.width || overlayImg.naturalWidth || 1080;
      const canvasHeight = Math.round(canvasWidth * (5 / 4));
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      const ctx = canvas.getContext("2d");

      if (ctx) {
        let sx = croppedAreaPixels.x;
        let sy = croppedAreaPixels.y;
        let sw = croppedAreaPixels.width;
        let sh = croppedAreaPixels.height;
        let dx = 0;
        let dy = 0;
        let dw = canvas.width;
        let dh = canvas.height;

        const scaleX = dw / sw;
        const scaleY = dh / sh;

        if (sx < 0) {
          const clip = -sx;
          dx += clip * scaleX;
          dw -= clip * scaleX;
          sw -= clip;
          sx = 0;
        }
        if (sy < 0) {
          const clip = -sy;
          dy += clip * scaleY;
          dh -= clip * scaleY;
          sh -= clip;
          sy = 0;
        }
        if (sx + sw > userImg.naturalWidth) {
          const clip = sx + sw - userImg.naturalWidth;
          dw -= clip * scaleX;
          sw -= clip;
        }
        if (sy + sh > userImg.naturalHeight) {
          const clip = sy + sh - userImg.naturalHeight;
          dh -= clip * scaleY;
          sh -= clip;
        }

        if (sw > 0 && sh > 0 && dw > 0 && dh > 0) {
          ctx.drawImage(userImg, sx, sy, sw, sh, dx, dy, dw, dh);
        }
        ctx.drawImage(overlayImg, 0, 0, canvas.width, canvas.height);
        setResultUrl(canvas.toDataURL("image/png"));
      }
    } catch (e: unknown) {
      console.error(e);
      const message =
        e instanceof Error ? e.message : "Kesalahan tidak diketahui";
      alert("Terjadi kesalahan saat memproses twibbon: " + message);
    } finally {
      setIsProcessing(false);
    }
  };

  const FIXED_ASPECT_RATIO = 4 / 5;
  const exactCropSize = containerSize
    ? {
        width:
          containerSize.width / containerSize.height > FIXED_ASPECT_RATIO
            ? containerSize.height * FIXED_ASPECT_RATIO
            : containerSize.width,
        height:
          containerSize.width / containerSize.height > FIXED_ASPECT_RATIO
            ? containerSize.height
            : containerSize.width / FIXED_ASPECT_RATIO,
      }
    : undefined;

  const getSafeSrc = (src?: string | null) => {
    if (!src) return "/logo.png";
    if (
      src.startsWith("http://") ||
      src.startsWith("https://") ||
      src.startsWith("/")
    ) {
      return src;
    }
    return `/${src}`;
  };

  const displayThumbnail = getSafeSrc(twibbon.thumbnail || twibbon.overlayFile);

  return (
    <div className="flex flex-col md:flex-row items-center md:items-start justify-center gap-8 md:gap-12 max-w-6xl mx-auto">
      {/* KIRI: Preview / Stage */}
      <div className="w-full flex-1 flex flex-col items-center justify-center">
        {isVideo ? (
          /* Video Twibbon: Thumbnail Statis Bersih 4:5 */
          <div
            className="relative w-full max-w-xl rounded-[2rem] overflow-hidden border-2 border-[#0a031e] shadow-[8px_8px_0px_#1e0a4a] bg-black"
            style={{ aspectRatio: "4 / 5" }}
          >
            <Image
              src={displayThumbnail}
              alt={twibbon.title || "Twibbon Video"}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
            <div className="absolute top-4 right-4 z-20 bg-[#FDB927] text-[#0a031e] text-xs font-black px-3 py-1.5 rounded-lg uppercase border-2 border-[#0a031e] shadow-[2px_2px_0px_#0a031e] flex items-center gap-1.5">
              <Video size={14} />
              <span>Video Twibbon</span>
            </div>
          </div>
        ) : resultUrl ? (
          <div
            className="relative w-full max-w-xl rounded-[2rem] overflow-hidden shadow-xl"
            style={{
              aspectRatio: "4 / 5",
              background: "#ffffff",
              border: "1px solid rgba(79, 77, 154, 0.15)",
            }}
          >
            <Image
              src={resultUrl}
              alt="Hasil Twibbon"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              unoptimized
              className="object-cover"
            />
          </div>
        ) : (
          <div
            ref={containerRef}
            className="relative w-full max-w-xl rounded-[2rem] overflow-hidden border-2 border-dashed transition-all shadow-xl"
            style={{
              aspectRatio: "4 / 5",
              background: "#ffffff",
              borderColor: "rgba(79, 77, 154, 0.25)",
            }}
          >
            {imageSrc && (
              <div className="absolute inset-0 z-0">
                {containerSize && (
                  <Cropper
                    image={imageSrc}
                    crop={crop}
                    zoom={zoom}
                    aspect={4 / 5}
                    minZoom={0.1}
                    maxZoom={5}
                    cropSize={exactCropSize}
                    onCropChange={setCrop}
                    onCropComplete={onCropComplete}
                    onZoomChange={setZoom}
                    showGrid={false}
                    restrictPosition={false}
                    style={{
                      cropAreaStyle: { border: 0, boxShadow: "none" },
                      containerStyle: { backgroundColor: "#1e1b4b" },
                    }}
                  />
                )}
              </div>
            )}

            <div className="absolute inset-0 pointer-events-none z-10">
              <Image
                src={getSafeSrc(twibbon.overlayFile)}
                alt="Overlay"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover opacity-100"
              />
            </div>

            {!imageSrc && (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 flex flex-col items-center justify-center z-20 group cursor-pointer"
              >
                <div
                  className="px-8 py-6 rounded-[2rem] shadow-xl text-center border transition-all group-hover:scale-105"
                  style={{
                    background: "rgba(255, 255, 255, 0.85)",
                    backdropFilter: "blur(16px)",
                    WebkitBackdropFilter: "blur(16px)",
                    borderColor: "rgba(79, 77, 154, 0.2)",
                  }}
                >
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner"
                    style={{ background: "rgba(79, 77, 154, 0.1)" }}
                  >
                    <Upload size={24} style={{ color: "#4f4d9a" }} />
                  </div>
                  <p
                    className="font-extrabold text-sm uppercase tracking-wider"
                    style={{ color: "#2f2f67" }}
                  >
                    Klik untuk Pilih Foto
                  </p>
                  <p
                    className="text-xs font-semibold mt-1"
                    style={{ color: "#4f4d9a", opacity: 0.7 }}
                  >
                    Mendukung JPG, PNG, atau WEBP
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* KANAN: Controls & Caption */}
      <div
        className="w-full md:w-[420px] rounded-[2.5rem] p-6 sm:p-8 space-y-6 border flex flex-col justify-between"
        style={{
          background: "#ffffff",
          borderColor: "rgba(79, 77, 154, 0.12)",
          boxShadow: "0 4px 24px rgba(79, 77, 154, 0.08)",
        }}
      >
        {/* Caption Instagram */}
        {twibbon.description && (
          <div
            className="p-5 rounded-2xl border"
            style={{
              background: "rgba(79, 77, 154, 0.04)",
              borderColor: "rgba(79, 77, 154, 0.12)",
            }}
          >
            <div className="flex justify-between items-center mb-3">
              <h3
                className="text-xs font-extrabold uppercase tracking-widest"
                style={{ color: "#4f4d9a" }}
              >
                Caption Instagram
              </h3>
              <button
                onClick={handleCopyCaption}
                className="text-[10px] flex items-center space-x-1 font-extrabold text-black transition-all px-3 py-1.5 rounded-full uppercase tracking-wider shadow-sm hover:scale-105 cursor-pointer"
                style={{ background: "#FDB927" }}
              >
                {copiedCaption ? <CheckCircle size={12} /> : <Copy size={12} />}
                <span>{copiedCaption ? "Tersalin!" : "Salin"}</span>
              </button>
            </div>
            <p
              className="text-xs font-semibold leading-relaxed whitespace-pre-line"
              style={{
                color: "#2f2f67",
                opacity: 0.9,
                display: "-webkit-box",
                WebkitBoxOrient: "vertical",
                WebkitLineClamp: showFullCaption ? "unset" : 4,
                overflow: showFullCaption ? "visible" : "hidden",
                transition: "all 0.3s ease",
              }}
            >
              {twibbon.description}
            </p>
            <button
              onClick={() => setShowFullCaption(!showFullCaption)}
              className="mt-2 text-[10px] font-semibold uppercase tracking-wider transition-all hover:opacity-70 cursor-pointer"
              style={{ color: "#4f4d9a" }}
            >
              {showFullCaption ? "Sembunyikan" : "Lihat Selengkapnya"}
            </button>
          </div>
        )}

        {/* Section Action: Video (CapCut) vs Image (Editor) */}
        {isVideo ? (
          <div className="space-y-4 pt-2">
            <div
              className="p-4 rounded-2xl border text-center space-y-2"
              style={{
                background: "rgba(253, 185, 39, 0.08)",
                borderColor: "rgba(253, 185, 39, 0.3)",
              }}
            >
              <p
                className="text-xs font-extrabold uppercase tracking-wider"
                style={{ color: "#1e0a4a" }}
              >
                Twibbon Format Video
              </p>
              <p
                className="text-xs font-semibold leading-relaxed"
                style={{ color: "#4f4d9a" }}
              >
                Twibbon video tidak dapat digenerate langsung di website ini.
                Gunakan template resmi CapCut untuk memasang foto/videomu!
              </p>
            </div>

            <a
              href={capcutUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-4 px-6 text-xs font-black uppercase tracking-wider text-black rounded-full transition-all shadow-md hover:scale-[1.02] active:scale-95 flex justify-center items-center space-x-2"
              style={{
                background: "#FDB927",
                boxShadow: "0 4px 16px rgba(253, 185, 39, 0.3)",
              }}
            >
              <span>BUKA TEMPLATE CAPCUT</span>
              <ExternalLink size={16} />
            </a>
          </div>
        ) : (
          /* Editor Gambar Standar */
          <>
            <div>
              <h3
                className="text-base font-extrabold uppercase tracking-tight mb-1"
                style={{ color: "#2f2f67" }}
              >
                1. Pilih Foto
              </h3>
              <p
                className="text-xs font-semibold mb-4"
                style={{ color: "#4f4d9a", opacity: 0.8 }}
              >
                Pilih foto terbaik Anda untuk digabungkan dengan bingkai ini.
              </p>
              <input
                type="file"
                accept="image/png, image/jpeg, image/webp"
                ref={fileInputRef}
                onChange={onFileChange}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-3.5 px-4 font-extrabold uppercase tracking-wider text-xs rounded-xl transition-all shadow-sm flex items-center justify-center space-x-2 border cursor-pointer"
                style={{
                  background: "rgba(255, 255, 255, 0.8)",
                  borderColor: "rgba(79, 77, 154, 0.2)",
                  color: "#2f2f67",
                }}
              >
                {imageSrc ? <RefreshCw size={14} /> : <Upload size={14} />}
                <span>{imageSrc ? "Ganti Foto Lain" : "Pilih Foto"}</span>
              </button>
            </div>

            {imageSrc && !resultUrl && (
              <div>
                <h3
                  className="text-base font-extrabold uppercase tracking-tight mb-1"
                  style={{ color: "#2f2f67" }}
                >
                  2. Sesuaikan Posisi
                </h3>
                <p
                  className="text-xs font-semibold mb-4"
                  style={{ color: "#4f4d9a", opacity: 0.8 }}
                >
                  Geser foto atau perbesar dengan slider.
                </p>
                <input
                  type="range"
                  value={zoom}
                  min={0.1}
                  max={5}
                  step={0.01}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-[#4f4d9a]"
                  style={{ background: "rgba(79, 77, 154, 0.15)" }}
                />
              </div>
            )}

            <div
              className="pt-6 border-t"
              style={{ borderColor: "rgba(79, 77, 154, 0.1)" }}
            >
              {!resultUrl ? (
                <div>
                  <h3
                    className="text-base font-extrabold uppercase tracking-tight mb-4"
                    style={{ color: "#2f2f67" }}
                  >
                    3. Ekspor
                  </h3>
                  <button
                    onClick={generateTwibbon}
                    disabled={!imageSrc || isProcessing || !overlayDims}
                    className="w-full py-4 px-6 text-xs font-extrabold uppercase tracking-wider text-black rounded-full transition-all shadow-md hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center space-x-2 cursor-pointer"
                    style={{
                      background: "#FDB927",
                      boxShadow: "0 4px 16px rgba(253, 185, 39, 0.3)",
                    }}
                  >
                    {isProcessing ? (
                      <span>Memproses...</span>
                    ) : (
                      <span>CROP & GABUNGKAN</span>
                    )}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="text-green-600" size={20} />
                    <h3
                      className="text-base font-extrabold uppercase tracking-tight"
                      style={{ color: "#2f2f67" }}
                    >
                      Selesai!
                    </h3>
                  </div>
                  <a
                    href={resultUrl}
                    download={`twibbon-${twibbon.slug || "hasil"}.png`}
                    className="w-full py-4 px-6 text-xs font-extrabold uppercase tracking-wider text-black rounded-full transition-all shadow-md hover:scale-[1.02] active:scale-95 flex justify-center items-center space-x-2"
                    style={{
                      background: "#FDB927",
                      boxShadow: "0 4px 16px rgba(253, 185, 39, 0.3)",
                    }}
                  >
                    <Download size={16} />
                    <span>Unduh Hasil</span>
                  </a>
                  <button
                    onClick={() => setResultUrl(null)}
                    className="w-full py-3.5 px-4 rounded-full text-xs font-extrabold uppercase tracking-wider transition-all border cursor-pointer"
                    style={{
                      background: "rgba(255, 255, 255, 0.8)",
                      borderColor: "rgba(79, 77, 154, 0.2)",
                      color: "#2f2f67",
                    }}
                  >
                    Kembali Edit
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
