"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import Cropper from "react-easy-crop";
import { renderChromaKey } from "@/lib/webglChroma";
import { Upload, RefreshCw, Copy, Download, CheckCircle } from "lucide-react";

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new window.Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => {
      console.error("Image load error event:", error);
      reject(new Error(`Gagal memuat gambar. Pastikan server gambar mengizinkan CORS. URL: ${url}`));
    });
    
    if (url.startsWith("data:") || url.startsWith("blob:")) {
      image.src = url;
    } else {
      image.setAttribute("crossOrigin", "anonymous");
      const cacheBuster = url.includes("?") ? `&_cb=${Date.now()}` : `?_cb=${Date.now()}`;
      image.src = url + cacheBuster;
    }
  });

export default function TwibbonClientEditor({ twibbon }: { twibbon: Record<string, any> }) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Record<string, number> | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const isVideo = twibbon.type === "VIDEO";

  const [overlayDims, setOverlayDims] = useState<{
    width: number;
    height: number;
  } | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [containerSize, setContainerSize] = useState<{
    width: number;
    height: number;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadOverlay = async () => {
      if (!isVideo) {
        try {
          const img = await createImage(twibbon.overlayFile);
          setOverlayDims({
            width: img.naturalWidth,
            height: img.naturalHeight,
          });
        } catch (e) {
          console.error("Gagal memuat overlay", e);
          setOverlayDims({ width: 1080, height: 1080 });
        }
      }
    };
    loadOverlay();
  }, [twibbon.overlayFile, isVideo]);

  useEffect(() => {
    if (!containerRef.current) return;
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
  }, [resultUrl, imageSrc]);

  // Live Chroma Key Preview for Video (Continuous Playback during crop)
  useEffect(() => {
    if (!isVideo) return;

    let animationId: number;

    const renderFrame = () => {
      const video = videoRef.current;
      const canvas = previewCanvasRef.current;

      if (video && canvas) {
        if (video.paused) {
          video.play().catch(() => {});
        }
        if (video.videoWidth > 0 && video.videoHeight > 0) {
          try {
            renderChromaKey(video, canvas);
          } catch (e) {
            console.error("Chroma key render error:", e);
          }
        }
      }
      animationId = requestAnimationFrame(renderFrame);
    };

    animationId = requestAnimationFrame(renderFrame);
    return () => cancelAnimationFrame(animationId);
  }, [isVideo, twibbon.overlayFile, imageSrc]);

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const imageDataUrl = await readFile(file);
      setImageSrc(imageDataUrl);
      setResultUrl(null);
    }
  };

  const readFile = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.addEventListener(
        "load",
        () => resolve(reader.result as string),
        false,
      );
      reader.readAsDataURL(file);
    });
  };

  const onCropComplete = useCallback(
    (croppedArea: unknown, croppedAreaPixels: Record<string, number>) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    [],
  );

  const generateTwibbon = async () => {
    if (!imageSrc || !croppedAreaPixels || !overlayDims) return;
    setIsProcessing(true);

    try {
      const userImg = await createImage(imageSrc);

      if (!isVideo) {
        const overlayImg = await createImage(twibbon.overlayFile);
        const canvas = document.createElement("canvas");
        canvas.width = overlayDims.width;
        canvas.height = overlayDims.height;
        const ctx = canvas.getContext("2d");

        if (ctx) {
          ctx.drawImage(
            userImg,
            croppedAreaPixels.x,
            croppedAreaPixels.y,
            croppedAreaPixels.width,
            croppedAreaPixels.height,
            0,
            0,
            canvas.width,
            canvas.height,
          );
          ctx.drawImage(overlayImg, 0, 0, canvas.width, canvas.height);
          setResultUrl(canvas.toDataURL("image/png"));
        }
      } else {
        const res = await fetch(twibbon.overlayFile);
        const videoBlob = await res.blob();

        const formData = new FormData();
        formData.append("video", videoBlob, "overlay.mp4");
        formData.append("userImage", userImg.src);
        formData.append("cropX", croppedAreaPixels.x.toString());
        formData.append("cropY", croppedAreaPixels.y.toString());
        formData.append("cropW", croppedAreaPixels.width.toString());
        formData.append("cropH", croppedAreaPixels.height.toString());

        const uploadApiUrl = process.env.NEXT_PUBLIC_UPLOAD_API_URL || "https://apps.bem-unsoed.com/twibbon-backend/process.php";
        const backendRes = await fetch(uploadApiUrl, {
          method: "POST",
          body: formData,
        });

        const data = await backendRes.json();
        if (data.status === "success") {
          setResultUrl(data.url);
        } else {
          alert("Gagal memproses video: " + data.message);
        }
      }
    } catch (e: any) {
      console.error(e);
      alert("Terjadi kesalahan saat memproses twibbon: " + e.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const currentAspectRatio = overlayDims
    ? overlayDims.width / overlayDims.height
    : 1;

  return (
    <div className="flex flex-col md:flex-row items-center md:items-start justify-center gap-8 md:gap-12 max-w-6xl mx-auto">
      {/* Kiri: Canvas / Preview Stage */}
      <div className="w-full flex-1 flex flex-col items-center justify-center">
        {resultUrl ? (
          <div
            className="relative w-full max-w-2xl rounded-[2rem] overflow-hidden shadow-xl"
            style={{
              aspectRatio: currentAspectRatio,
              background: "rgba(255, 255, 255, 0.7)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: "1px solid rgba(79, 77, 154, 0.15)",
            }}
          >
            {isVideo ? (
              <video
                src={resultUrl}
                controls
                autoPlay
                loop
                className="w-full h-full object-contain bg-black"
              />
            ) : (
              <Image
                src={resultUrl}
                alt="Hasil Twibbon"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                unoptimized
                className="object-contain"
              />
            )}
          </div>
        ) : (
          <div
            ref={containerRef}
            className="relative w-full max-w-2xl rounded-[2rem] overflow-hidden border-2 border-dashed transition-all shadow-xl"
            style={{
              aspectRatio: currentAspectRatio,
              background: "rgba(255, 255, 255, 0.5)",
              borderColor: "rgba(79, 77, 154, 0.25)",
            }}
          >
            {imageSrc ? (
              <>
                <div className="absolute inset-0 z-0">
                  {containerSize && (
                    <Cropper
                      image={imageSrc}
                      crop={crop}
                      zoom={zoom}
                      cropSize={containerSize}
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
                <div className="absolute inset-0 pointer-events-none z-10">
                  {isVideo ? (
                    <>
                      <video
                        ref={videoRef}
                        src={twibbon.overlayFile}
                        crossOrigin="anonymous"
                        muted
                        loop
                        autoPlay
                        playsInline
                        style={{ position: "absolute", width: 1, height: 1, opacity: 0, pointerEvents: "none" }}
                        onLoadedMetadata={(e) => {
                          e.currentTarget.play().catch(() => {});
                          setOverlayDims({
                            width: e.currentTarget.videoWidth,
                            height: e.currentTarget.videoHeight,
                          });
                        }}
                      />
                      <canvas
                        ref={previewCanvasRef}
                        className="w-full h-full object-contain"
                      />
                    </>
                  ) : (
                    <Image
                      src={twibbon.overlayFile}
                      alt="Overlay"
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-contain opacity-100"
                    />
                  )}
                </div>
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                {isVideo ? (
                  <video
                    src={twibbon.overlayFile}
                    muted
                    loop
                    autoPlay
                    playsInline
                    className="object-contain w-full h-full z-10"
                    onLoadedMetadata={(e) => {
                      setOverlayDims({
                        width: e.currentTarget.videoWidth,
                        height: e.currentTarget.videoHeight,
                      });
                    }}
                  />
                ) : (
                  <Image
                    src={twibbon.overlayFile}
                    alt="Preview Overlay"
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-contain z-10"
                  />
                )}

                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 flex flex-col items-center justify-center z-20 cursor-pointer group"
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
                      className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3 text-white shadow-md transition-transform group-hover:-rotate-12"
                      style={{ background: "#4f4d9a" }}
                    >
                      <Upload size={24} />
                    </div>
                    <p className="font-extrabold text-base uppercase tracking-wider transition-colors" style={{ color: "#2f2f67" }}>
                      Pilih Foto
                    </p>
                    <p className="text-xs font-semibold mt-1" style={{ color: "#4f4d9a", opacity: 0.8 }}>
                      Klik area ini untuk mengunggah
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Kanan: Controls */}
      <div
        className="w-full md:w-96 flex flex-col space-y-6 md:space-y-8 p-6 md:p-8 rounded-[2rem] border shadow-xl self-start h-full"
        style={{
          background: "rgba(255, 255, 255, 0.65)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          borderColor: "rgba(79, 77, 154, 0.12)",
          boxShadow: "0 4px 24px rgba(79, 77, 154, 0.08)",
        }}
      >
        {twibbon.description && (
          <div
            className="p-5 rounded-2xl border"
            style={{
              background: "rgba(79, 77, 154, 0.04)",
              borderColor: "rgba(79, 77, 154, 0.12)",
            }}
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xs font-extrabold uppercase tracking-widest" style={{ color: "#4f4d9a" }}>
                Caption
              </h3>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(twibbon.description);
                  alert("Caption berhasil disalin!");
                }}
                className="text-[10px] flex items-center space-x-1 font-extrabold text-white transition-all px-3 py-1.5 rounded-full uppercase tracking-wider shadow-sm hover:scale-105"
                style={{ background: "#4f4d9a" }}
              >
                <Copy size={12} />
                <span>Salin</span>
              </button>
            </div>
            <p className="text-xs font-semibold line-clamp-4 leading-relaxed" style={{ color: "#2f2f67", opacity: 0.9 }}>
              {twibbon.description}
            </p>
          </div>
        )}

        <div>
          <h3 className="text-base font-extrabold uppercase tracking-tight mb-1" style={{ color: "#2f2f67" }}>
            1. Pilih Foto
          </h3>
          <p className="text-xs font-semibold mb-4" style={{ color: "#4f4d9a", opacity: 0.8 }}>
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
            className="w-full py-3.5 px-4 font-extrabold uppercase tracking-wider text-xs rounded-xl transition-all shadow-sm flex items-center justify-center space-x-2 border"
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
            <h3 className="text-base font-extrabold uppercase tracking-tight mb-1" style={{ color: "#2f2f67" }}>
              2. Sesuaikan Posisi
            </h3>
            <p className="text-xs font-semibold mb-4" style={{ color: "#4f4d9a", opacity: 0.8 }}>
              Geser foto atau perbesar dengan slider.
            </p>
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-[#4f4d9a]"
              style={{ background: "rgba(79, 77, 154, 0.15)" }}
            />
          </div>
        )}

        <div className="pt-6 border-t" style={{ borderColor: "rgba(79, 77, 154, 0.1)" }}>
          {!resultUrl ? (
            <div>
              <h3 className="text-base font-extrabold uppercase tracking-tight mb-4" style={{ color: "#2f2f67" }}>
                3. Ekspor
              </h3>
              <button
                onClick={generateTwibbon}
                disabled={!imageSrc || isProcessing || !overlayDims}
                className="w-full py-4 px-6 text-xs font-extrabold uppercase tracking-wider text-white rounded-full transition-all shadow-md hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center space-x-2"
                style={{
                  background: "#4f4d9a",
                  boxShadow: "0 4px 16px rgba(79, 77, 154, 0.3)",
                }}
              >
                {isProcessing ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span>Memproses...</span>
                  </>
                ) : (
                  <span>CROP & GABUNGKAN</span>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="text-green-600" size={20} />
                <h3 className="text-base font-extrabold uppercase tracking-tight" style={{ color: "#2f2f67" }}>
                  Selesai!
                </h3>
              </div>
              <a
                href={resultUrl}
                download={`twibbon-${twibbon.slug}.${isVideo ? "mp4" : "png"}`}
                onClick={() => {
                  fetch("/api/downloads", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ twibbonId: twibbon.id }),
                  }).catch(console.error);
                }}
                className="w-full py-4 px-6 text-xs font-extrabold uppercase tracking-wider text-white rounded-full transition-all shadow-md hover:scale-[1.02] active:scale-95 flex justify-center items-center space-x-2"
                style={{
                  background: "#4f4d9a",
                  boxShadow: "0 4px 16px rgba(79, 77, 154, 0.3)",
                }}
              >
                <Download size={16} />
                <span>Unduh Hasil</span>
              </a>
              <button
                onClick={() => setResultUrl(null)}
                className="w-full py-3.5 px-4 rounded-full text-xs font-extrabold uppercase tracking-wider transition-all border"
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
      </div>
    </div>
  );
}
