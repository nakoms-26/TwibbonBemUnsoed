import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import TwibbonClientEditor from "./TwibbonClientEditor";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Metadata } from "next";

export const revalidate = 0;

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  
  const twibbon = await prisma.twibbon.findUnique({
    where: { slug }
  });

  if (!twibbon || !twibbon.isActive) {
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
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const { slug } = await params;

  const twibbon = await prisma.twibbon.findUnique({
    where: { slug }
  });

  if (!twibbon || !twibbon.isActive) {
    notFound();
  }

  // Serialize to pass to client component safely
  const serializedTwibbon = {
    id: twibbon.id,
    title: twibbon.title,
    slug: twibbon.slug,
    description: twibbon.description,
    type: twibbon.type,
    overlayFile: twibbon.overlayFile,
    config: typeof twibbon.config === 'string' ? JSON.parse(twibbon.config) : twibbon.config,
  };

  return (
    <div
      className="min-h-screen flex flex-col justify-between relative overflow-hidden font-sans"
      style={{
        background: "linear-gradient(135deg, #f5f3ff 0%, #ede9fe 50%, #ddd8f8 100%)",
      }}
    >
      <Navbar />

      <main className="pt-28 md:pt-36 pb-12 px-4 sm:px-6 lg:px-8 relative z-10 flex-1">
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-6 md:mb-10 flex flex-col items-center">
            <h1 
              className="text-3xl md:text-5xl font-extrabold uppercase tracking-tight mb-2"
              style={{ color: "#2f2f67" }}
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
