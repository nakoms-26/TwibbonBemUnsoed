"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Cropper from "react-easy-crop";

// helper to load image for canvas
const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new window.Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });

export default function TwibbonClientEditor({ twibbon }: { twibbon: any }) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const isVideo = twibbon.type === "VIDEO";

  // Dynamic aspect ratio based on overlay
  const [overlayDims, setOverlayDims] = useState<{
    width: number;
    height: number;
  } | null>(null);

  // Refs for video & chroma key preview
  const videoRef = useRef<HTMLVideoElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  // Track container size so crop area EXACTLY fills the container
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState<{
    width: number;
    height: number;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load overlay dimensions
  useEffect(() => {
    const loadOverlay = async () => {
      if (!isVideo) {
        try {
          const img = await createImage(twibbon.overlayFile);
          setOverlayDims({ width: img.naturalWidth, height: img.naturalHeight });
        } catch (e) {
          console.error("Gagal memuat overlay", e);
          setOverlayDims({ width: 1080, height: 1080 });
        }
      }
    };
    loadOverlay();
  }, [twibbon.overlayFile, isVideo]);

  // Track container dimensions to force Cropper to fill it 100%
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

  // Live Chroma Key Preview for Video
  useEffect(() => {
    if (!isVideo || !videoRef.current || !previewCanvasRef.current) return;

    const video = videoRef.current;
    const canvas = previewCanvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    let animationId: number;

    const renderFrame = () => {
      if (video.paused || video.ended) {
        animationId = requestAnimationFrame(renderFrame);
        return;
      }

      if (canvas.width !== video.videoWidth) canvas.width = video.videoWidth;
      if (canvas.height !== video.videoHeight) canvas.height = video.videoHeight;

      if (video.videoWidth > 0 && video.videoHeight > 0) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = frame.data;

        // Specific Green Screen removal (Chroma Key)
        // Mencegah dedaunan hijau atau elemen kuning ikut terhapus
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          
          if (g > 120 && g > r * 1.6 && g > b * 1.6 && (g - Math.max(r, b)) > 50) {
            data[i + 3] = 0; // Alpha 0
          }
        }
        ctx.putImageData(frame, 0, 0);
      }
      animationId = requestAnimationFrame(renderFrame);
    };

    video.play().catch(() => {
       // Autoplay blocked handling
    });
    renderFrame();

    return () => cancelAnimationFrame(animationId);
  }, [isVideo, twibbon.overlayFile]);

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      let imageDataUrl = await readFile(file);
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
    (croppedArea: any, croppedAreaPixels: any) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    [],
  );

  const generateTwibbon = async () => {
    if (!imageSrc || !croppedAreaPixels || !overlayDims) return;
    setIsProcessing(true);

    try {
      if (isVideo) {
        await recordVideoTwibbon();
      } else {
        await renderStaticTwibbon();
      }
    } catch (e) {
      console.error(e);
      alert("Gagal memproses. Pastikan format file didukung.");
      setIsProcessing(false);
    }
  };

  const renderStaticTwibbon = async () => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("No 2d context");

    canvas.width = overlayDims!.width;
    canvas.height = overlayDims!.height;

    const userImg = await createImage(imageSrc!);

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

    const overlayImg = await createImage(twibbon.overlayFile);
    ctx.drawImage(overlayImg, 0, 0, canvas.width, canvas.height);

    const finalImage = canvas.toDataURL("image/png", 1.0);
    setResultUrl(finalImage);
    setIsProcessing(false);
  };

  const recordVideoTwibbon = async () => {
    return new Promise<void>(async (resolve, reject) => {
      const video = videoRef.current;
      if (!video) return reject("No video element");

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return reject("No 2d context");

      canvas.width = overlayDims!.width;
      canvas.height = overlayDims!.height;

      const userImg = await createImage(imageSrc!);
      const stream = (canvas as any).captureStream(30);
      let mimeType = 'video/webm';
      if (MediaRecorder.isTypeSupported('video/mp4')) {
        mimeType = 'video/mp4';
      }
      
      const recorder = new MediaRecorder(stream, { mimeType });
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: mimeType });
        const url = URL.createObjectURL(blob);
        setResultUrl(url);
        setIsProcessing(false);
        resolve();
      };

      const wasLooping = video.loop;
      video.loop = false;
      video.currentTime = 0;
      await video.play();
      recorder.start();

      let animationId: number;
      const renderFrame = () => {
        // Draw user img
        ctx.drawImage(
          userImg,
          croppedAreaPixels.x,
          croppedAreaPixels.y,
          croppedAreaPixels.width,
          croppedAreaPixels.height,
          0,
          0,
          canvas.width,
          canvas.height
        );

        // Draw video frame & chroma key
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const tCtx = tempCanvas.getContext('2d', { willReadFrequently: true });
        if (tCtx) {
           tCtx.drawImage(video, 0, 0, canvas.width, canvas.height);
           const frame = tCtx.getImageData(0, 0, canvas.width, canvas.height);
           const data = frame.data;
           for (let i = 0; i < data.length; i += 4) {
             const r = data[i];
             const g = data[i + 1];
             const b = data[i + 2];
             
             if (g > 120 && g > r * 1.6 && g > b * 1.6 && (g - Math.max(r, b)) > 50) {
               data[i + 3] = 0;
             }
           }
           tCtx.putImageData(frame, 0, 0);
           ctx.drawImage(tempCanvas, 0, 0);
        }

        if (!video.ended && video.currentTime < video.duration) {
          animationId = requestAnimationFrame(renderFrame);
        } else {
          recorder.stop();
        }
      };

      renderFrame();

      // Fallback
      setTimeout(() => {
        if(recorder.state === "recording") recorder.stop();
      }, (video.duration * 1000) + 1000);
    });
  };

  const currentAspectRatio = overlayDims
    ? overlayDims.width / overlayDims.height
    : 1;

  return (
    <div className="flex flex-col md:flex-row gap-6 md:gap-10 max-w-[1440px] mx-auto w-full px-4 md:px-10 py-2 md:py-10">
      {/* Kiri: Editor / Preview */}
      <div className="flex-1 w-full flex flex-col justify-center items-center">
        {resultUrl ? (
          <div
            className="relative w-full max-w-2xl rounded-[2rem] overflow-hidden border-[6px] border-[#0038FF] shadow-[20px_20px_0px_#CCFF00]"
            style={{ aspectRatio: currentAspectRatio }}
          >
            {isVideo ? (
               <video src={resultUrl} controls autoPlay loop className="w-full h-full object-contain bg-black" />
            ) : (
               <img src={resultUrl} alt="Twibbon Result" className="w-full h-full object-contain bg-white" />
            )}
          </div>
        ) : (
          <div
            ref={containerRef}
            className="relative w-full max-w-2xl rounded-[2rem] overflow-hidden bg-gray-50 border-4 border-dashed border-gray-300 transition-all hover:border-[#0038FF]/50 shadow-xl"
            style={{ aspectRatio: currentAspectRatio }}
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
                        containerStyle: { backgroundColor: "black" }
                      }}
                    />
                  )}
                </div>
                {/* Overlay Preview on top of Cropper */}
                <div className="absolute inset-0 pointer-events-none z-10">
                  {isVideo ? (
                    <>
                      <video 
                        ref={videoRef}
                        src={twibbon.overlayFile}
                        crossOrigin="anonymous"
                        muted
                        loop
                        playsInline
                        className="hidden"
                        onLoadedMetadata={(e) => {
                          setOverlayDims({ width: e.currentTarget.videoWidth, height: e.currentTarget.videoHeight });
                        }}
                      />
                      <canvas ref={previewCanvasRef} className="w-full h-full object-contain" />
                    </>
                  ) : (
                    <img
                      src={twibbon.overlayFile}
                      alt="Overlay"
                      className="object-contain opacity-100 absolute inset-0 w-full h-full"
                    />
                  )}
                </div>
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 bg-gray-100">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+CjxyZWN0IHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0iI2ZmZmZmZiIgLz4KPHJlY3Qgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjZTVlNWU1IiAvPgo8cmVjdCB4PSIxMCIgeT0iMTAiIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCIgZmlsbD0iI2U1ZTVlNSIgLz4KPC9zdmc+')] bg-repeat"></div>
                
                {/* Twibbon Overlay Preview */}
                {isVideo ? (
                  <video src={twibbon.overlayFile} muted loop autoPlay playsInline className="object-contain w-full h-full z-10 opacity-70" />
                ) : (
                  <img src={twibbon.overlayFile} alt="Overlay Preview" className="object-contain z-10 opacity-70 absolute inset-0 w-full h-full" />
                )}

                {/* Upload Prompt */}
                <div className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none">
                  <div className="bg-white/90 backdrop-blur-md px-8 py-6 rounded-[2rem] shadow-xl text-center border-4 border-white transform transition-transform hover:scale-105">
                    <div className="w-16 h-16 bg-[#0038FF] text-[#CCFF00] rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
                      </svg>
                    </div>
                    <p className="font-black text-gray-900 text-lg uppercase tracking-widest">Pilih Foto</p>
                    <p className="text-xs text-gray-500 mt-1 font-bold">Untuk dimasukkan ke bingkai</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Kanan: Controls */}
      <div className="w-full md:w-96 flex flex-col space-y-8 bg-white p-8 rounded-[2rem] border-2 border-gray-100 shadow-xl self-start h-full">
        {twibbon.description && (
          <div className="bg-gray-50 p-6 rounded-2xl border-2 border-gray-100">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Caption</h3>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(twibbon.description);
                  alert("Caption berhasil disalin!");
                }}
                className="text-[10px] flex items-center space-x-1 text-black hover:text-[#0038FF] font-black transition-colors bg-[#CCFF00] px-3 py-1.5 rounded-full uppercase tracking-wider"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                <span>Salin</span>
              </button>
            </div>
            <p className="text-sm font-bold text-gray-600 line-clamp-4 leading-relaxed">{twibbon.description}</p>
          </div>
        )}

        <div>
          <h3 className="text-lg font-black uppercase tracking-tight text-gray-900 mb-2">1. Pilih Foto</h3>
          <p className="text-xs font-bold text-gray-400 mb-4">Pilih foto terbaik Anda untuk digabungkan dengan bingkai ini.</p>
          <input
            type="file"
            accept="image/png, image/jpeg, image/webp"
            ref={fileInputRef}
            onChange={onFileChange}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-4 px-4 bg-white border-2 border-gray-200 text-gray-900 font-black uppercase tracking-widest rounded-xl hover:border-[#0038FF] hover:text-[#0038FF] transition-all shadow-sm"
          >
            {imageSrc ? "🔄 Ganti Foto Lain" : "📁 Pilih Foto"}
          </button>
        </div>

        {imageSrc && !resultUrl && (
          <div>
            <h3 className="text-lg font-black uppercase tracking-tight text-gray-900 mb-2">2. Sesuaikan Posisi</h3>
            <p className="text-xs font-bold text-gray-400 mb-4">Geser foto atau perbesar dengan slider.</p>
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#CCFF00]"
            />
          </div>
        )}

        <div className="pt-8 border-t-2 border-gray-100">
          {!resultUrl ? (
            <div>
              <h3 className="text-lg font-black uppercase tracking-tight text-gray-900 mb-4">3. Ekspor</h3>
              <button
                onClick={generateTwibbon}
                disabled={!imageSrc || isProcessing || !overlayDims}
                className="w-full py-5 px-6 bg-[#CCFF00] text-black font-black uppercase tracking-widest rounded-full shadow-lg hover:scale-[1.02] border-b-4 border-yellow-500 active:border-b-0 active:translate-y-1 transition-all flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Memproses...
                  </>
                ) : (
                  "CROP & GABUNGKAN"
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-lg font-black uppercase tracking-tight text-gray-900 mb-2">🎉 Selesai!</h3>
              <a
                href={resultUrl}
                download={`twibbon-${twibbon.slug}.${isVideo ? 'mp4' : 'png'}`}
                className="w-full py-5 px-6 bg-[#0038FF] text-white font-black uppercase tracking-widest rounded-full shadow-lg hover:scale-[1.02] transition-all flex justify-center items-center"
              >
                Unduh Hasil
              </a>
              <button
                onClick={() => setResultUrl(null)}
                className="w-full py-4 px-4 bg-white border-2 border-gray-200 text-gray-800 rounded-full text-sm font-black uppercase tracking-wider hover:bg-gray-50 transition-all flex justify-center items-center"
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
