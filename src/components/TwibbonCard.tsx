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
    updatedAt?: Date | string;
    downloadsCount?: number;
  };
  compactOnMobile?: boolean;
};

// Helper for formatting numbers
const formatCount = (count: number) => {
  if (count >= 1000) return (count / 1000).toFixed(1) + "K";
  return count;
};

export default function TwibbonCard({ twibbon, compactOnMobile = false }: TwibbonCardProps) {
  const timestamp = twibbon.updatedAt ? `?t=${new Date(twibbon.updatedAt).getTime()}` : "";
  return (
    <Link
      href={`/${twibbon.slug}`}
      className={`relative flex flex-col bg-white rounded-3xl border-[3px] border-[#0a031e] shadow-[4px_4px_0px_#1e0a4a] hover:shadow-[10px_10px_0px_#1e0a4a] hover:-translate-y-1.5 hover:-translate-x-1.5 transition-all duration-300 h-full group overflow-hidden p-3 ${
        compactOnMobile ? "max-sm:p-0" : ""
      }`}
    >
      {/* Image Stage */}
      <div 
        className={`relative w-full aspect-square border-[#0a031e] overflow-hidden bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:12px_12px] bg-white transition-transform group-hover:scale-[1.01] border-2 rounded-2xl ${
          compactOnMobile ? "max-sm:border-0 max-sm:border-b-[3px] max-sm:rounded-none" : ""
        }`}
      >
        {/* Video Badge */}
        {twibbon.type === "VIDEO" && (
          <div className="absolute top-2 right-2 z-20 bg-[#FDB927] text-[#0a031e] text-[10px] font-black px-2 py-1 rounded-md uppercase border-2 border-[#0a031e] shadow-[2px_2px_0px_#0a031e]">
            VIDEO
          </div>
        )}

        {twibbon.thumbnail ? (
          <Image
            src={`${twibbon.thumbnail}${timestamp}`}
            alt={twibbon.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1200px) 33vw, 25vw"
            className="object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full w-full text-5xl font-black text-gray-300">
            ?
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className={`flex flex-col pt-3 pb-1 px-1 ${
        compactOnMobile ? "max-sm:p-4" : ""
      }`}>
        <h3 className="text-[15px] font-black text-[#0a031e] leading-snug line-clamp-2 mb-1.5 group-hover:text-[#4f4d9a] transition-colors">
          {twibbon.title}
        </h3>
        


        <div className="flex items-center gap-1.5 text-gray-400">
          <Users size={13} strokeWidth={3} />
          <span className="text-xs font-bold">{twibbon.downloadsCount !== undefined ? formatCount(twibbon.downloadsCount) : 0} digunakan</span>
        </div>
      </div>
    </Link>
  );
}
