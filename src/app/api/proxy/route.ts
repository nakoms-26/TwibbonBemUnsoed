import { NextRequest, NextResponse } from "next/server";
import dns from "node:dns";

// Paksa Node.js mendahulukan IPv4 agar koneksi TLS tidak terkena ECONNRESET dari CDN edge IPv6
try {
  dns.setDefaultResultOrder("ipv4first");
} catch {
  // Abaikan jika tidak didukung
}

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  if (!url) {
    return new NextResponse("Missing URL", { status: 400 });
  }

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return new NextResponse(`Failed to fetch image: status ${response.status}`, {
        status: response.status,
      });
    }

    const contentType = response.headers.get("content-type") || "image/png";
    const arrayBuffer = await response.arrayBuffer();

    return new NextResponse(arrayBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("Proxy error:", error);
    const message = error instanceof Error ? error.message : String(error);
    return new NextResponse(`Proxy error: ${message}`, { status: 500 });
  }
}
