import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

const rateLimitMap = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 menit
const MAX_REQUESTS = 5; // Maks 5 download per menit

export async function POST(req: Request) {
  try {
    const forwardedFor = req.headers.get("x-forwarded-for");
    const ipAddress = forwardedFor ? forwardedFor.split(',')[0].trim() : "127.0.0.1";

    const now = Date.now();
    const rateLimitData = rateLimitMap.get(ipAddress) || { count: 0, lastReset: now };

    if (now - rateLimitData.lastReset > RATE_LIMIT_WINDOW) {
      rateLimitData.count = 1;
      rateLimitData.lastReset = now;
    } else {
      rateLimitData.count++;
    }
    rateLimitMap.set(ipAddress, rateLimitData);

    if (rateLimitData.count > MAX_REQUESTS) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    const { twibbonId } = await req.json();

    if (!twibbonId) {
      return NextResponse.json(
        { error: "Twibbon ID is required" },
        { status: 400 }
      );
    }

    // Increment dan ambil slug sekaligus untuk revalidasi cache
    const updated = await prisma.twibbon.update({
      where: { id: Number(twibbonId) },
      data: {
        downloadsCount: {
          increment: 1,
        },
      },
      select: { slug: true, downloadsCount: true },
    });

    // Bust Next.js cache agar halaman slug menampilkan angka terbaru
    revalidatePath(`/${updated.slug}`);
    revalidatePath("/twibbons");
    revalidatePath("/");

    return NextResponse.json(
      { success: true, downloadsCount: updated.downloadsCount },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error tracking download:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

