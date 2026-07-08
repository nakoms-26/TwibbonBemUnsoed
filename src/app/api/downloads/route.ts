import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { twibbonId } = await req.json();

    if (!twibbonId) {
      return NextResponse.json(
        { error: "Twibbon ID is required" },
        { status: 400 }
      );
    }

    // Capture user IP address. Depending on hosting (Vercel, cPanel), 
    // x-forwarded-for might be the reliable source.
    const forwardedFor = req.headers.get("x-forwarded-for");
    const ipAddress = forwardedFor ? forwardedFor.split(',')[0].trim() : "127.0.0.1";

    await prisma.download.create({
      data: {
        twibbonId: Number(twibbonId),
        ipAddress,
      },
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Error tracking download:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
