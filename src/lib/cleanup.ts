import { readdir, unlink, stat } from "fs/promises";
import path from "path";
import os from "os";

const TEMP_DIR = path.join(os.tmpdir(), "twibbon-renders");
const MAX_AGE_MS = 10 * 60 * 1000; // 10 minutes

/**
 * Remove temp files older than MAX_AGE_MS.
 * Safe to call before each render — non-blocking, best-effort.
 */
export async function cleanupOldTempFiles(): Promise<number> {
  let cleaned = 0;

  try {
    const files = await readdir(TEMP_DIR);
    const now = Date.now();

    for (const file of files) {
      try {
        const filePath = path.join(TEMP_DIR, file);
        const fileStat = await stat(filePath);
        const age = now - fileStat.mtimeMs;

        if (age > MAX_AGE_MS) {
          await unlink(filePath);
          cleaned++;
        }
      } catch {
        // Individual file cleanup failure is non-critical
      }
    }
  } catch {
    // Directory may not exist yet, that's fine
  }

  return cleaned;
}
