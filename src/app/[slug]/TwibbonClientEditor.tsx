"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import Cropper from "react-easy-crop";
import { renderChromaKey } from "@/lib/webglChroma";
import { Upload, RefreshCw, Copy, Download, CheckCircle } from "lucide-react";
import { Muxer, ArrayBufferTarget } from "mp4-muxer";

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
  const [renderProgress, setRenderProgress] = useState(0);
  const [renderStage, setRenderStage] = useState("");
  // Req 4: Deteksi dukungan WebCodecs saat mount
  const [webCodecsSupported, setWebCodecsSupported] = useState<boolean | null>(null);
  const isVideo = twibbon.type === "VIDEO";

  const [overlayDims, setOverlayDims] = useState<{
    width: number;
    height: number;
  } | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  // UX 3: Canvas untuk live preview frame saat encoding
  const livePreviewRef = useRef<HTMLCanvasElement>(null);

  const [containerSize, setContainerSize] = useState<{
    width: number;
    height: number;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Req 4: Feature detection on mount
  useEffect(() => {
    setWebCodecsSupported(typeof window !== 'undefined' && 'VideoEncoder' in window);
  }, []);

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
      } else {
        // For video: load video metadata to get dimensions
        const vid = document.createElement("video");
        vid.crossOrigin = "anonymous";
        vid.src = twibbon.overlayFile;
        vid.onloadedmetadata = () => {
          setOverlayDims({
            width: vid.videoWidth || 1080,
            height: vid.videoHeight || 1080,
          });
        };
        vid.onerror = () => {
          setOverlayDims({ width: 1080, height: 1080 });
        };
        vid.load();
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
    setRenderProgress(0);
    setRenderStage("");

    try {
      const userImg = await createImage(imageSrc);

      if (!isVideo) {
        // Client-side image compositing (unchanged)
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
        // Client-side video rendering via WebCodecs (Frame-by-Frame)
        if (!window.VideoEncoder) {
          throw new Error("Browser Anda belum mendukung fitur render video (WebCodecs API). Silakan gunakan Chrome/Edge/Safari terbaru.");
        }

        const videoElement = videoRef.current;
        if (!videoElement) throw new Error("Video elemen tidak ditemukan");

        setRenderStage("Menyiapkan Encoder...");
        setRenderProgress(1);

        const fps = 30;
        const duration = videoElement.duration && isFinite(videoElement.duration) ? videoElement.duration : 15;
        const totalFrames = Math.floor(duration * fps);

        // === Req 3: Deteksi & decode audio dari overlay video ===
        setRenderStage("Mendeteksi audio overlay...");
        let audioBuffer: AudioBuffer | null = null;
        let audioCtx: AudioContext | null = null;
        const hasAudioEncoder = typeof window !== 'undefined' && 'AudioEncoder' in window;

        if (hasAudioEncoder) {
          try {
            const response = await fetch(twibbon.overlayFile);
            const arrayBuffer = await response.arrayBuffer();
            audioCtx = new AudioContext();
            const decoded = await audioCtx.decodeAudioData(arrayBuffer);
            if (decoded.duration > 0 && decoded.numberOfChannels > 0) {
              audioBuffer = decoded;
            }
          } catch {
            // Overlay tidak memiliki audio atau gagal di-decode — lanjut tanpa audio
            audioBuffer = null;
            if (audioCtx) { audioCtx.close(); audioCtx = null; }
          }
        }
        const hasAudio = audioBuffer !== null;
        // === END audio detection ===

        // Canvas untuk compositing & chroma key — dimensi harus kelipatan 2 (H.264/HEVC requirement)
        const encodeWidth = Math.ceil(overlayDims.width / 2) * 2;
        const encodeHeight = Math.ceil(overlayDims.height / 2) * 2;

        const compCanvas = document.createElement("canvas");
        compCanvas.width = encodeWidth;
        compCanvas.height = encodeHeight;
        const compCtx = compCanvas.getContext("2d");
        if (!compCtx) throw new Error("Tidak dapat membuat canvas context");

        const chromaCanvas = document.createElement("canvas");
        chromaCanvas.width = encodeWidth;
        chromaCanvas.height = encodeHeight;

        // === Codec detection SEBELUM muxer dibuat ===
        // iOS Safari: HEVC lebih didukung via hardware encoder daripada H.264
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const codecCandidates = isIOS ? [
          'hvc1.1.6.L93.B0',  // HEVC Main 3.1 — iOS native hardware encoder
          'hvc1.1.6.L120.B0', // HEVC Main 4.0
          'avc1.42E01E',      // H.264 Baseline 3.0 (fallback)
          'avc1.4D001E',      // H.264 Main 3.0 (fallback)
        ] : [
          'avc1.42E01E',      // H.264 Baseline 3.0 — kompatibilitas terluas
          'avc1.4D001E',      // H.264 Main 3.0
          'avc1.640028',      // H.264 High 4.0
          'avc1.42001f',      // H.264 Baseline 3.1
        ];

        let encoderConfig: VideoEncoderConfig | null = null;
        for (const codec of codecCandidates) {
          const candidate: VideoEncoderConfig = {
            codec,
            width: encodeWidth,
            height: encodeHeight,
            bitrate: 2_000_000,
          };
          if ('isConfigSupported' in window.VideoEncoder) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const support = await (window.VideoEncoder as any).isConfigSupported(candidate);
            if (support.supported) { encoderConfig = candidate; break; }
          } else {
            encoderConfig = candidate;
            break;
          }
        }

        if (!encoderConfig) {
          throw new Error(
            'Browser Anda tidak mendukung encoding video. ' +
            'Silakan gunakan Chrome atau Safari terbaru.'
          );
        }

        // Tentukan codec muxer dari codec encoder yang dipilih
        const muxerVideoCodec = encoderConfig.codec.startsWith('hvc1') ? 'hevc' : 'avc';

        const muxer = new Muxer({
          target: new ArrayBufferTarget(),
          video: {
            codec: muxerVideoCodec,
            width: encodeWidth,
            height: encodeHeight,
          },
          ...(hasAudio && audioBuffer && {
            audio: {
              codec: 'aac',
              sampleRate: audioBuffer.sampleRate,
              numberOfChannels: audioBuffer.numberOfChannels,
            },
          }),
          fastStart: 'in-memory',
        });

        // Track error dari encoder (throw di dalam callback tidak propagate ke try-catch)
        let encoderError: Error | null = null;
        const encoder = new window.VideoEncoder({
          output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
          error: (e) => {
            console.error("VideoEncoder error:", e);
            encoderError = e instanceof Error ? e : new Error(String(e));
          },
        });

        encoder.configure(encoderConfig);

        const seekVideo = (time: number) => {
          return new Promise<void>((resolve) => {
            const onSeeked = () => {
              videoElement.removeEventListener('seeked', onSeeked);
              resolve();
            };
            videoElement.addEventListener('seeked', onSeeked);
            videoElement.currentTime = time;
          });
        };

        const originalPaused = videoElement.paused;
        videoElement.pause();

        for (let i = 0; i < totalFrames; i++) {
          // Progress video: 2-80% (sisakan 80-95% untuk audio)
          setRenderProgress(2 + Math.floor((i / totalFrames) * 78));
          setRenderStage(`Merender frame ${i + 1}/${totalFrames}...`);

          // 1. Seek overlay video to exact frame
          await seekVideo(i / fps);

          // 2. Process chroma key
          renderChromaKey(videoElement, chromaCanvas);

          // 3. Clear and draw user photo
          compCtx.clearRect(0, 0, encodeWidth, encodeHeight);
          compCtx.drawImage(
            userImg,
            croppedAreaPixels.x,
            croppedAreaPixels.y,
            croppedAreaPixels.width,
            croppedAreaPixels.height,
            0, 0,
            encodeWidth,
            encodeHeight
          );

          // 4. Draw processed chroma key overlay on top
          compCtx.drawImage(chromaCanvas, 0, 0, encodeWidth, encodeHeight);

          // 5. Create VideoFrame and encode
          // Periksa error encoder sebelum membuat frame baru
          if (encoderError) throw encoderError;
          const frame = new window.VideoFrame(compCanvas, {
            timestamp: (i * 1000000) / fps,
          });
          const keyFrame = i % fps === 0;
          encoder.encode(frame, { keyFrame });

          // GC: Segera close frame untuk lepas memori GPU
          frame.close();

          // UX 3: Tampilkan frame yang sedang di-encode sebagai live preview
          const liveCanvas = livePreviewRef.current;
          if (liveCanvas) {
            liveCanvas.width = overlayDims.width;
            liveCanvas.height = overlayDims.height;
            const liveCtx = liveCanvas.getContext('2d');
            if (liveCtx) liveCtx.drawImage(chromaCanvas, 0, 0);
          }

          // GC: Bersihkan pixel buffer canvas setelah di-encode
          compCtx.clearRect(0, 0, encodeWidth, encodeHeight);

          // GC: Drain encoder queue setiap ~1 detik untuk cegah penumpukan memori
          if (i > 0 && i % fps === 0) {
            await encoder.flush();
            if (encoderError) throw encoderError;
          }

          // Yield ke main thread untuk update UI & siklus GC
          await new Promise(r => setTimeout(r, 0));
        }

        setRenderStage("Finalisasi video frame...");
        setRenderProgress(82);

        await encoder.flush();
        // GC: Tutup encoder untuk lepas resource WebCodecs
        encoder.close();

        // GC: Reset dimensi canvas untuk lepas GPU texture memory
        compCanvas.width = 1;
        compCanvas.height = 1;
        chromaCanvas.width = 1;
        chromaCanvas.height = 1;

        // === Req 3: Encode audio track ===
        if (hasAudio && audioBuffer && audioCtx && hasAudioEncoder) {
          setRenderStage("Memproses audio...");
          setRenderProgress(85);

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const audioEncoder = new (window as any).AudioEncoder({
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            output: (chunk: any, meta: any) => muxer.addAudioChunk(chunk, meta),
            error: (e: Error) => console.error("AudioEncoder error:", e),
          });

          audioEncoder.configure({
            codec: 'mp4a.40.2', // AAC-LC
            sampleRate: audioBuffer.sampleRate,
            numberOfChannels: audioBuffer.numberOfChannels,
            bitrate: 128_000,
          });

          const CHUNK_FRAMES = 1024;
          // Potong audio sesuai durasi video yang di-render
          const maxSamples = Math.min(
            audioBuffer.length,
            Math.floor(duration * audioBuffer.sampleRate)
          );

          for (let offset = 0; offset < maxSamples; offset += CHUNK_FRAMES) {
            const frameCount = Math.min(CHUNK_FRAMES, maxSamples - offset);

            // Format f32-planar: [ch0_samples..., ch1_samples...]
            const planarData = new Float32Array(frameCount * audioBuffer.numberOfChannels);
            for (let c = 0; c < audioBuffer.numberOfChannels; c++) {
              planarData.set(
                audioBuffer.getChannelData(c).subarray(offset, offset + frameCount),
                c * frameCount
              );
            }

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const audioData = new (window as any).AudioData({
              format: 'f32-planar',
              sampleRate: audioBuffer.sampleRate,
              numberOfFrames: frameCount,
              numberOfChannels: audioBuffer.numberOfChannels,
              timestamp: Math.round((offset / audioBuffer.sampleRate) * 1_000_000),
              data: planarData,
            });

            audioEncoder.encode(audioData);
            audioData.close();

            // Yield setiap 32 chunk (~750ms audio) agar UI tidak freeze
            if (offset % (CHUNK_FRAMES * 32) === 0) {
              await new Promise(r => setTimeout(r, 0));
            }
          }

          setRenderProgress(93);
          await audioEncoder.flush();
          audioEncoder.close();
          audioCtx.close();
        }
        // === END audio encoding ===

        setRenderStage("Menyelesaikan video...");
        setRenderProgress(95);
        muxer.finalize();

        const { buffer } = muxer.target;
        const blob = new Blob([buffer], { type: "video/mp4" });
        const url = URL.createObjectURL(blob);

        setResultUrl(url);

        if (!originalPaused) {
          videoElement.play().catch(() => {});
        }
      }
    } catch (e: unknown) {
      console.error(e);
      const message = e instanceof Error ? e.message : "Kesalahan tidak diketahui";
      alert("Terjadi kesalahan saat memproses twibbon: " + message);
    } finally {
      setIsProcessing(false);
      setRenderProgress(0);
      setRenderStage("");
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

              {isProcessing && isVideo ? (
                /* === Progress Bar UI for Server-Side Video Rendering === */
                <div
                  className="rounded-2xl p-5 border"
                  style={{
                    background: "rgba(79, 77, 154, 0.04)",
                    borderColor: "rgba(79, 77, 154, 0.12)",
                  }}
                >
                  {/* Percentage Number */}
                  <div className="text-center mb-3">
                    <span
                      className="text-4xl font-extrabold tabular-nums"
                      style={{ color: "#4f4d9a" }}
                    >
                      {renderProgress}%
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div
                    className="w-full h-3 rounded-full overflow-hidden mb-3"
                    style={{ background: "rgba(79, 77, 154, 0.1)" }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${renderProgress}%`,
                        background: "linear-gradient(90deg, #4f4d9a 0%, #7c78c9 100%)",
                        transition: "width 0.3s ease",
                      }}
                    />
                  </div>

                  {/* UX 3: Live frame preview */}
                  <canvas
                    ref={livePreviewRef}
                    className="w-full rounded-xl mt-3 object-contain"
                    style={{
                      maxHeight: '140px',
                      background: '#1e1b4b',
                      border: '1px solid rgba(79,77,154,0.2)',
                    }}
                  />

                  {/* Stage Description */}
                  <p
                    className="text-xs font-semibold text-center"
                    style={{ color: "#4f4d9a", opacity: 0.8 }}
                  >
                    {renderStage || "Mempersiapkan..."}
                  </p>

                  {/* Warning: jangan tutup browser */}
                  <p
                    className="text-xs font-semibold text-center mt-3 leading-relaxed"
                    style={{ color: "#b45309", opacity: 0.9 }}
                  >
                    ⏳ Mohon jangan menutup browser atau berpindah aplikasi selama proses berlangsung.
                  </p>
                </div>
              ) : isVideo && webCodecsSupported === false ? (
                /* Req 4: Fallback warning — WebCodecs tidak didukung */
                <div
                  className="rounded-2xl p-5 border"
                  style={{
                    background: "rgba(180, 83, 9, 0.06)",
                    borderColor: "rgba(180, 83, 9, 0.25)",
                  }}
                >
                  <p className="text-sm font-extrabold mb-2" style={{ color: "#92400e" }}>
                    ⚠️ Browser Tidak Didukung
                  </p>
                  <p className="text-xs font-semibold leading-relaxed" style={{ color: "#78350f" }}>
                    Browser Anda tidak mendukung render video mulus (WebCodecs API).
                    Silakan gunakan <strong>Chrome</strong> atau <strong>Safari</strong> versi terbaru untuk menggunakan fitur ini.
                  </p>
                </div>
              ) : (
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
              )}
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
                download={`twibbon-${twibbon.slug || "hasil"}.${isVideo ? "mp4" : "png"}`}
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
