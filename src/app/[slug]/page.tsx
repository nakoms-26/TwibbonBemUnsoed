import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import TwibbonClientEditor from "./TwibbonClientEditor";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Metadata } from "next";
import { Archivo_Black } from "next/font/google";

const archivoBlack = Archivo_Black({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export const revalidate = 0;

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  let twibbon;
  try {
    twibbon = await prisma.twibbon.findUnique({
      where: { slug, isActive: true },
    });
  } catch {
    twibbon = null;
  }

  if (!twibbon) {
    return {
      title: "Kampanye Tidak Ditemukan - BEM Unsoed",
    };
  }

  const baseUrl = "https://www.twibbon.bem-unsoed.com";
  const timestamp = twibbon.updatedAt ? `?t=${new Date(twibbon.updatedAt).getTime()}` : "";
  const imageUrl = twibbon.thumbnail
    ? (twibbon.thumbnail.startsWith('http') ? `${twibbon.thumbnail}${timestamp}` : `${baseUrl}${twibbon.thumbnail}${timestamp}`)
    : `${baseUrl}/logo.png`;

  const pageTitle = `${twibbon.title.toUpperCase()} - BEM Unsoed`;
  const pageDesc = twibbon.description || `Dukung kampanye ${twibbon.title} bersama BEM Unsoed! Klik link ini untuk pasang foto kamu.`;

  return {
    title: pageTitle,
    description: pageDesc,
    openGraph: {
      title: pageTitle,
      description: pageDesc,
      url: `${baseUrl}/${slug}`,
      siteName: "Twibbon BEM Unsoed",
      images: [
        {
          url: imageUrl,
          width: 1080,
          height: 1080,
          alt: twibbon.title,
        },
      ],
      locale: "id_ID",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: pageDesc,
      images: [imageUrl],
    },
  };
}

export default async function PublicTwibbonPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Baca langsung dari DB — ID real dari Supabase, bukan dari mock
  let twibbon;
  try {
    twibbon = await prisma.twibbon.findUnique({
      where: { slug, isActive: true },
    });
  } catch {
    twibbon = null;
  }

  if (!twibbon) {
    notFound();
  }

  const downloadsCount = twibbon.downloadsCount;

  // Serialize to pass to client component safely
  const serializedTwibbon = {
    id: twibbon.id,
    title: twibbon.title,
    slug: twibbon.slug,
    description: twibbon.description,
    type: twibbon.type,
    overlayFile: twibbon.overlayFile,
    downloadsCount,
    config: typeof twibbon.config === 'string'
      ? JSON.parse(twibbon.config as string)
      : twibbon.config,
  };

  return (
    <div
      className="min-h-screen flex flex-col justify-between relative overflow-hidden font-sans"
      style={{
        background: "linear-gradient(160deg, #1e0a4a 0%, #2d1b69 40%, #1a0f3d 100%)",
      }}
    >
      {/* Grid Pattern Accent Overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.07]"
        style={{
          backgroundImage: `radial-gradient(rgba(255,255,255,0.4) 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
        }}
      />
      <Navbar />

      <main className="pt-28 md:pt-36 pb-12 px-4 sm:px-6 lg:px-8 relative z-10 flex-1">
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-6 md:mb-10 flex flex-col items-center">
            <h1
              className={`text-3xl md:text-5xl uppercase tracking-tight mb-2 ${archivoBlack.className}`}
              style={{
                color: "#FDB927",
                textShadow: "6px 6px 0px #0a031e",
              }}
            >
              {twibbon.title}
            </h1>
          </div>

          <div className="w-full">
            <TwibbonClientEditor twibbon={serializedTwibbon} />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
