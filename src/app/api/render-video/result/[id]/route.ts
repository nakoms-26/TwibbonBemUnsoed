import { NextRequest } from "next/server";
import { readFile, unlink } from "fs/promises";
import { getOutputPath, outputExists } from "@/lib/ffmpeg";

export const dynamic = "force-dynamic";

/**
 * GET /api/render-video/result/[id]
 *
 * Serves a rendered video file by session ID.
 * After serving, schedules cleanup of the output file after 5 minutes.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Validate ID format (UUID)
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return Response.json({ error: "ID tidak valid" }, { status: 400 });
  }

  // Check if file exists
  const exists = await outputExists(id);
  if (!exists) {
    return Response.json(
      { error: "Video tidak ditemukan atau sudah kadaluarsa" },
      { status: 404 }
    );
  }

  const outputPath = getOutputPath(id);

  try {
    const fileBuffer = await readFile(outputPath);

    // Schedule cleanup after 5 minutes
    setTimeout(async () => {
      try {
        await unlink(outputPath);
      } catch {
        // File may already be deleted
      }
    }, 5 * 60 * 1000);

    return new Response(fileBuffer, {
      headers: {
        "Content-Type": "video/mp4",
        "Content-Disposition": `attachment; filename="twibbon-result.mp4"`,
        "Content-Length": fileBuffer.byteLength.toString(),
        "Cache-Control": "private, max-age=300", // Cache 5 minutes
      },
    });
  } catch (err) {
    console.error("Error serving rendered video:", err);
    return Response.json(
      { error: "Gagal membaca file video" },
      { status: 500 }
    );
  }
}
