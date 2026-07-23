import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { writeFile, copyFile, access } from "fs/promises";
import path from "path";
import {
  createRenderSession,
  downloadFile,
  getVideoDuration,
  renderVideoTwibbon,
  cleanupSession,
} from "@/lib/ffmpeg";
import { cleanupOldTempFiles } from "@/lib/cleanup";

/**
 * Resolve an overlay file path to a local temp copy.
 * Handles both absolute URLs (https://...) and relative paths (/uploads/...).
 *
 * For relative paths: tries local public/ directory first, then
 * constructs an absolute URL using the request origin or NEXTAUTH_URL.
 */
async function resolveOverlayFile(
  overlayFile: string,
  destPath: string,
  requestUrl: string,
): Promise<void> {
  // Case 1: Absolute URL — download it
  if (overlayFile.startsWith("http://") || overlayFile.startsWith("https://")) {
    await downloadFile(overlayFile, destPath);
    return;
  }

  // Case 2: Relative path — try local public/ directory first
  const localPath = path.join(process.cwd(), "public", overlayFile);
  try {
    await access(localPath);
    // File exists locally, copy it
    await copyFile(localPath, destPath);
    return;
  } catch {
    // Not found locally, construct absolute URL and download
  }

  // Case 3: Construct absolute URL from request origin or NEXTAUTH_URL
  const baseUrl =
    process.env.NEXTAUTH_URL ||
    new URL(requestUrl).origin;
  const absoluteUrl = new URL(overlayFile, baseUrl).toString();
  await downloadFile(absoluteUrl, destPath);
}

export const dynamic = "force-dynamic";
export const maxDuration = 60; // Set maximum execution time to 60 seconds on Vercel

/**
 * POST /api/render-video
 *
 * Accepts a cropped user image + twibbonId, renders a chroma-keyed
 * composited video server-side using FFmpeg, and streams progress
 * back via Server-Sent Events (SSE).
 *
 * Request body (JSON):
 *   - croppedImage: string (base64 data URL, e.g. "data:image/png;base64,...")
 *   - twibbonId: number
 *
 * Response: SSE stream with JSON events:
 *   data: {"progress": 0-100, "stage": "...", "message": "..."}
 *   data: {"progress": 100, "stage": "done", "videoUrl": "/api/render-video/result/<id>"}
 *   data: {"stage": "error", "error": "..."}
 */
export async function POST(request: NextRequest) {
  // Parse request body
  let body: { croppedImage: string; twibbonId: number };
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: "Body JSON tidak valid" },
      { status: 400 }
    );
  }

  const { croppedImage, twibbonId } = body;

  if (!croppedImage || !twibbonId) {
    return Response.json(
      { error: "croppedImage dan twibbonId wajib diisi" },
      { status: 400 }
    );
  }

  // Validate base64 image
  const base64Match = croppedImage.match(
    /^data:image\/(png|jpeg|jpg|webp);base64,(.+)$/
  );
  if (!base64Match) {
    return Response.json(
      { error: "Format croppedImage tidak valid. Harus base64 data URL" },
      { status: 400 }
    );
  }

  // Create SSE stream
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (data: Record<string, unknown>) => {
        try {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
          );
        } catch {
          // Stream may have been closed by client
        }
      };

      let session: Awaited<ReturnType<typeof createRenderSession>> | null = null;

      try {
        // === Stage: Preparing (0-10%) ===
        sendEvent({
          progress: 0,
          stage: "preparing",
          message: "Mempersiapkan render...",
        });

        // Clean up old temp files (non-blocking best-effort)
        cleanupOldTempFiles().catch(() => {});

        // Fetch twibbon data
        const twibbon = await prisma.twibbon.findUnique({
          where: { id: twibbonId },
        });

        if (!twibbon || twibbon.type !== "VIDEO") {
          sendEvent({
            progress: 0,
            stage: "error",
            error: "Twibbon video tidak ditemukan",
          });
          controller.close();
          return;
        }

        sendEvent({
          progress: 5,
          stage: "preparing",
          message: "Menyiapkan file...",
        });

        // Create render session
        session = await createRenderSession();

        // Save user image from base64
        const imageBuffer = Buffer.from(base64Match[2], "base64");
        await writeFile(session.userImagePath, imageBuffer);

        sendEvent({
          progress: 10,
          stage: "preparing",
          message: "Foto pengguna tersimpan",
        });

        // === Stage: Downloading (10-20%) ===
        sendEvent({
          progress: 12,
          stage: "downloading",
          message: "Mengunduh video overlay...",
        });

        // Download/resolve overlay video to temp
        await resolveOverlayFile(twibbon.overlayFile, session.overlayVideoPath, request.url);

        sendEvent({
          progress: 20,
          stage: "downloading",
          message: "Video overlay siap",
        });

        // Get video duration
        const duration = await getVideoDuration(session.overlayVideoPath);

        // === Stage: Rendering (20-95%) ===
        sendEvent({
          progress: 22,
          stage: "rendering",
          message: "Merender video...",
        });

        // Render with FFmpeg, streaming progress
        await renderVideoTwibbon(
          session.userImagePath,
          session.overlayVideoPath,
          session.outputPath,
          duration,
          (ffmpegPercent: number) => {
            // Map FFmpeg's 0-100% to our 20-95% range
            const mappedProgress = Math.round(20 + (ffmpegPercent / 100) * 75);
            sendEvent({
              progress: Math.min(mappedProgress, 95),
              stage: "rendering",
              message: `Merender video... ${ffmpegPercent}%`,
            });
          }
        );

        // === Stage: Finalizing (95-100%) ===
        sendEvent({
          progress: 96,
          stage: "finalizing",
          message: "Menyelesaikan...",
        });

        // Clean up input files (keep output)
        await cleanupSession(session);

        // === Done ===
        sendEvent({
          progress: 100,
          stage: "done",
          message: "Selesai!",
          videoUrl: `/api/render-video/result/${session.id}`,
        });
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "Terjadi kesalahan tidak diketahui";
        console.error("Render video error:", errorMessage);

        sendEvent({
          progress: 0,
          stage: "error",
          error: errorMessage,
        });

        // Clean up everything on error
        if (session) {
          cleanupSession(session).catch(() => {});
        }
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no", // Disable nginx buffering
    },
  });
}
