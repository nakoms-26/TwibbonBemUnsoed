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

async function getTwibbon(slug: string) {
  return prisma.twibbon.findFirst({
    where: { slug, isActive: true },
  }).catch(() => null);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const twibbon = await getTwibbon(slug);

  if (!twibbon) {
    return {
      title: "Kampanye Tidak Ditemukan - BEM Unsoed",
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://twibbon.bem-unsoed.com";
  const timestamp = twibbon.updatedAt ? `?t=${new Date(twibbon.updatedAt).getTime()}` : "";
  const imageUrl = twibbon.thumbnail
    ? (twibbon.thumbnail.startsWith("http")
        ? `${twibbon.thumbnail}${timestamp}`
        : `${baseUrl}${twibbon.thumbnail}${timestamp}`)
    : `${baseUrl}/opengraph-image`;

  const pageTitle = twibbon.title.toUpperCase();
  const pageDesc =
    twibbon.description ||
    `Dukung kampanye ${twibbon.title} bersama BEM Unsoed! Klik link ini untuk memasang foto atau video twibbon kamu dengan mudah.`;

  return {
    title: pageTitle,
    description: pageDesc,
    alternates: {
      canonical: `/${slug}`,
    },
    keywords: [
      twibbon.title,
      `twibbon ${twibbon.title}`,
      "twibbon bem unsoed",
      "twibbon unsoed",
      "bingkai foto unsoed",
      "bem unsoed",
    ],
    openGraph: {
      title: `${pageTitle} | Twibbon BEM Unsoed`,
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
      title: `${pageTitle} | Twibbon BEM Unsoed`,
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
  const twibbon = await getTwibbon(slug);

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
    thumbnail: twibbon.thumbnail,
    downloadsCount,
    config: typeof twibbon.config === 'string'
      ? JSON.parse(twibbon.config as string)
      : twibbon.config,
  };

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://twibbon.bem-unsoed.com";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: twibbon.title,
    description: twibbon.description || `Twibbon resmi ${twibbon.title} oleh BEM Unsoed`,
    url: `${baseUrl}/${slug}`,
    applicationCategory: "MultimediaApplication",
    operatingSystem: "All",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "IDR",
    },
    image: twibbon.thumbnail
      ? (twibbon.thumbnail.startsWith("http")
          ? twibbon.thumbnail
          : `${baseUrl}${twibbon.thumbnail}`)
      : `${baseUrl}/logo.png`,
    publisher: {
      "@type": "Organization",
      name: "BEM Universitas Jenderal Soedirman",
      url: "https://bem-unsoed.com",
    },
  };

  return (
    <div
      className="min-h-screen flex flex-col justify-between relative overflow-hidden font-sans"
      style={{
        background: "linear-gradient(160deg, #1e0a4a 0%, #2d1b69 40%, #1a0f3d 100%)",
      }}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
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
