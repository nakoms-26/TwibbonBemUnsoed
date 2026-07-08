import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import TwibbonClientEditor from "./TwibbonClientEditor";
import { Metadata } from "next";

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
  const imageUrl = twibbon.thumbnail 
    ? (twibbon.thumbnail.startsWith('http') ? twibbon.thumbnail : `${baseUrl}${twibbon.thumbnail}`)
    : `${baseUrl}/favicon.ico`;

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
    description: twibbon.description,
    type: twibbon.type,
    overlayFile: twibbon.overlayFile,
    config: typeof twibbon.config === 'string' ? JSON.parse(twibbon.config) : twibbon.config,
  };

  return (
    <div className="min-h-screen bg-[#0038FF] pt-32 md:pt-40 pb-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff15_1px,transparent_1px),linear-gradient(to_bottom,#ffffff15_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none z-0" />
      
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-6 md:mb-12 flex flex-col items-center">
          <h1 
            className="text-4xl md:text-6xl font-black text-[#CCFF00] mb-4 uppercase tracking-tighter"
            style={{
              fontFamily: '"Arial Black", Impact, sans-serif',
              textShadow: "1px 1px 0 #001A99, 2px 2px 0 #001A99, 3px 3px 0 #001A99, 4px 4px 0 #001A99, 5px 5px 0 #001A99",
            }}
          >
            {twibbon.title}
          </h1>
        </div>

        <div className="w-full">
          <TwibbonClientEditor twibbon={serializedTwibbon} />
        </div>
      </div>
    </div>
  );
}
