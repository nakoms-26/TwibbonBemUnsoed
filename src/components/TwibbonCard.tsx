import Link from "next/link";
import Image from "next/image";
import { User, Users } from "lucide-react";

type TwibbonCardProps = {
  twibbon: {
    id: number | string;
    slug: string;
    title: string;
    description: string | null;
    type: string;
    thumbnail: string | null;
    _count?: {
      downloads: number;
    };
  };
};

// Helper for formatting numbers
const formatCount = (count: number) => {
  if (count >= 1000) return (count / 1000).toFixed(1) + "K";
  return count;
};

export default function TwibbonCard({ twibbon }: TwibbonCardProps) {
  return (
    <Link
      href={`/${twibbon.slug}`}
      className="relative flex flex-col bg-white rounded-3xl border-[3px] border-black shadow-[4px_4px_0px_#000] hover:shadow-[6px_6px_0px_#0038FF] hover:-translate-y-1 transition-all p-3 h-full group"
    >
      {/* Image Stage */}
      <div className="relative w-full aspect-square rounded-2xl border-2 border-black overflow-hidden bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:12px_12px] bg-white transition-transform group-hover:scale-[1.01]">
        {/* Video Badge */}
        {twibbon.type === "VIDEO" && (
          <div className="absolute top-2 right-2 z-20 bg-[#CCFF00] text-black text-[10px] font-black px-2 py-1 rounded-md uppercase border-2 border-black shadow-[2px_2px_0px_#000]">
            VIDEO
          </div>
        )}

        {twibbon.thumbnail ? (
          <Image
            src={twibbon.thumbnail}
            alt={twibbon.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full w-full text-5xl font-black text-gray-300">
            ?
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="flex flex-col pt-3 pb-1 px-1">
        <h3 className="text-[15px] font-black text-black leading-snug line-clamp-2 mb-1.5 group-hover:text-[#0038FF] transition-colors">
          {twibbon.title}
        </h3>
        


        <div className="flex items-center gap-1.5 text-gray-400">
          <Users size={13} strokeWidth={3} />
          <span className="text-xs font-bold">{twibbon._count ? formatCount(twibbon._count.downloads) : 0} digunakan</span>
        </div>
      </div>
    </Link>
  );
}
