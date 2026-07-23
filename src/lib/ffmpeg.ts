import { spawn } from "child_process";
import { existsSync } from "fs";
import { unlink, stat } from "fs/promises";
import path from "path";
import os from "os";
import { randomUUID } from "crypto";
import ffmpegStatic from "ffmpeg-static";
import ffprobeStatic from "ffprobe-static";

const TEMP_DIR = path.join(os.tmpdir(), "twibbon-renders");

export interface RenderProgress {
  progress: number; // 0-100
  stage: "preparing" | "downloading" | "rendering" | "finalizing" | "done" | "error";
  message: string;
  videoUrl?: string;
  error?: string;
}

/**
 * Ensure temp directory exists
 */
async function ensureTempDir() {
  const { mkdir } = await import("fs/promises");
  await mkdir(TEMP_DIR, { recursive: true });
}

/**
 * Download a remote file to a local temp path
 */
export async function downloadFile(url: string, destPath: string): Promise<void> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Gagal download file: ${url} (status ${response.status})`);
  }
  const arrayBuffer = await response.arrayBuffer();
  const { writeFile } = await import("fs/promises");
  await writeFile(destPath, Buffer.from(arrayBuffer));
}

/**
 * Resolves the path to ffmpeg or ffprobe executable.
 * Searches system PATH, environment variables, and common Windows install paths (e.g. WinGet).
 */
export function findExecutablePath(name: "ffmpeg" | "ffprobe"): string {
  const envVar = name === "ffmpeg" ? process.env.FFMPEG_PATH : process.env.FFPROBE_PATH;
  if (envVar && existsSync(envVar)) {
    return envVar;
  }

  // Check npm static packages (works on Vercel serverless / Linux / cross-platform)
  const staticPath = name === "ffmpeg"
    ? (typeof ffmpegStatic === "string" ? ffmpegStatic : null)
    : (ffprobeStatic && typeof ffprobeStatic.path === "string" ? ffprobeStatic.path : null);

  if (staticPath && existsSync(staticPath)) {
    return staticPath;
  }

  const exeName = process.platform === "win32" ? `${name}.exe` : name;

  // Search candidate paths on Windows
  if (process.platform === "win32") {
    const candidates: string[] = [];
    const localAppData = process.env.LOCALAPPDATA;
    const userProfile = process.env.USERPROFILE;

    if (localAppData) {
      candidates.push(path.join(localAppData, "Microsoft", "WinGet", "Links", exeName));
    }
    if (userProfile) {
      candidates.push(path.join(userProfile, "AppData", "Local", "Microsoft", "WinGet", "Links", exeName));
    }
    candidates.push(
      `C:\\Program Files\\ffmpeg\\bin\\${exeName}`,
      `C:\\ffmpeg\\bin\\${exeName}`
    );

    for (const candidate of candidates) {
      if (existsSync(candidate)) {
        return candidate;
      }
    }
  }

  // Fallback to plain name (assumes it is in system PATH)
  return name;
}

/**
 * Get video duration using ffprobe
 */
export async function getVideoDuration(videoPath: string): Promise<number> {
  const ffprobePath = findExecutablePath("ffprobe");

  return new Promise((resolve, reject) => {
    const proc = spawn(ffprobePath, [
      "-v", "error",
      "-show_entries", "format=duration",
      "-of", "default=noprint_wrappers=1:nokey=1",
      videoPath,
    ]);

    let output = "";
    proc.stdout.on("data", (data) => {
      output += data.toString();
    });

    let errOutput = "";
    proc.stderr.on("data", (data) => {
      errOutput += data.toString();
    });

    proc.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`ffprobe failed (code ${code}): ${errOutput}`));
        return;
      }
      const duration = parseFloat(output.trim());
      if (isNaN(duration)) {
        reject(new Error("Tidak bisa mendapatkan durasi video"));
        return;
      }
      resolve(duration);
    });

    proc.on("error", (err) => {
      reject(new Error(`ffprobe tidak ditemukan di '${ffprobePath}'. Pastikan FFmpeg sudah diinstall: ${err.message}`));
    });
  });
}

/**
 * Render video twibbon using FFmpeg with progress callback.
 * 
 * Composites a user photo behind a chroma-keyed video overlay.
 */
export async function renderVideoTwibbon(
  userImagePath: string,
  overlayVideoPath: string,
  outputPath: string,
  totalDuration: number,
  onProgress?: (percent: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const timeoutMs = 120_000; // 2 minutes max

    const args = [
      // Input 1: user photo looped as video
      "-loop", "1",
      "-i", userImagePath,
      // Input 2: overlay video with green screen
      "-i", overlayVideoPath,
      // Filter: chroma key on overlay, then composite over user photo
      "-filter_complex",
      [
        // Scale user photo to match overlay dimensions
        "[0:v]scale=iw:ih[base]",
        // Chroma key: remove green from overlay
        "[1:v]chromakey=0x00FF00:0.15:0.10[ckout]",
        // Overlay chroma-keyed video on top of user photo
        "[base][ckout]overlay=0:0:shortest=1[out]",
      ].join(";"),
      "-map", "[out]",
      // Encoding settings
      "-c:v", "libx264",
      "-preset", "fast",
      "-crf", "23",
      "-pix_fmt", "yuv420p",
      "-movflags", "+faststart",
      // Duration limit
      "-t", totalDuration.toString(),
      // Progress output to stderr in machine-readable format
      "-progress", "pipe:1",
      // Overwrite output
      "-y",
      outputPath,
    ];

    const ffmpegPath = findExecutablePath("ffmpeg");
    const proc = spawn(ffmpegPath, args);
    let killed = false;

    // Timeout protection
    const timeout = setTimeout(() => {
      killed = true;
      proc.kill("SIGKILL");
      reject(new Error("Render timeout: proses melebihi 2 menit"));
    }, timeoutMs);

    // Parse progress from stdout (ffmpeg -progress pipe:1 format)
    let progressBuffer = "";
    proc.stdout.on("data", (data) => {
      progressBuffer += data.toString();

      // FFmpeg progress output is key=value pairs separated by newlines
      // We look for out_time_us to calculate percentage
      const lines = progressBuffer.split("\n");
      for (const line of lines) {
        const match = line.match(/^out_time_us=(\d+)/);
        if (match) {
          const outTimeSec = parseInt(match[1]) / 1_000_000;
          const percent = Math.min(Math.round((outTimeSec / totalDuration) * 100), 100);
          onProgress?.(percent);
        }
      }

      // Keep only the last incomplete line in buffer
      if (progressBuffer.endsWith("\n")) {
        progressBuffer = "";
      } else {
        progressBuffer = lines[lines.length - 1];
      }
    });

    let stderrOutput = "";
    proc.stderr.on("data", (data) => {
      stderrOutput += data.toString();
    });

    proc.on("close", (code) => {
      clearTimeout(timeout);
      if (killed) return;

      if (code !== 0) {
        reject(new Error(`FFmpeg gagal (code ${code}): ${stderrOutput.slice(-500)}`));
        return;
      }
      resolve();
    });

    proc.on("error", (err) => {
      clearTimeout(timeout);
      reject(new Error(`FFmpeg tidak ditemukan. Pastikan FFmpeg sudah diinstall di server: ${err.message}`));
    });
  });
}

/**
 * Generate a unique render session with temp file paths
 */
export async function createRenderSession() {
  await ensureTempDir();
  const id = randomUUID();
  return {
    id,
    userImagePath: path.join(TEMP_DIR, `${id}-user.png`),
    overlayVideoPath: path.join(TEMP_DIR, `${id}-overlay.mp4`),
    outputPath: path.join(TEMP_DIR, `${id}-output.mp4`),
  };
}

/**
 * Clean up temp files for a render session
 */
export async function cleanupSession(session: {
  userImagePath: string;
  overlayVideoPath: string;
  outputPath?: string;
}) {
  const filesToDelete = [
    session.userImagePath,
    session.overlayVideoPath,
  ];

  for (const filePath of filesToDelete) {
    try {
      await unlink(filePath);
    } catch {
      // File may not exist, ignore
    }
  }
}

/**
 * Get the output file path for a render session ID
 */
export function getOutputPath(sessionId: string): string {
  return path.join(TEMP_DIR, `${sessionId}-output.mp4`);
}

/**
 * Check if output file exists
 */
export async function outputExists(sessionId: string): Promise<boolean> {
  try {
    await stat(getOutputPath(sessionId));
    return true;
  } catch {
    return false;
  }
}
