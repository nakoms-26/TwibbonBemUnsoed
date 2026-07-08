import Link from "next/link";

type TwibbonCardProps = {
  twibbon: {
    id: number | string;
    slug: string;
    title: string;
    description: string | null;
    type: string;
    thumbnail: string | null;
  };
};

export default function TwibbonCard({ twibbon }: TwibbonCardProps) {
  return (
    <Link
      href={`/${twibbon.slug}`}
      className="relative group flex flex-col bg-white rounded-[2rem] border-4 border-gray-900 shadow-[8px_8px_0px_#CCFF00] hover:shadow-[12px_12px_0px_#0038FF] transition-all hover:-translate-y-2 overflow-hidden h-full"
    >
      {/* Video Badge */}
      {twibbon.type === "VIDEO" && (
        <div className="absolute top-4 right-4 z-20 bg-gray-900 text-[#CCFF00] text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-widest border-2 border-gray-900 shadow-[4px_4px_0px_#0038FF] group-hover:scale-110 transition-transform">
          VIDEO 🎥
        </div>
      )}

      {/* Image Stage */}
      <div className="relative aspect-square w-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] bg-white border-b-4 border-gray-900 flex items-center justify-center p-6">
        {twibbon.thumbnail ? (
          <div className="relative w-full h-full drop-shadow-xl group-hover:scale-105 transition-transform duration-500">
            <img
              src={twibbon.thumbnail}
              alt={twibbon.title}
              className="object-contain w-full h-full"
            />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full w-full bg-gray-100 rounded-2xl border-4 border-gray-900 border-dashed text-5xl font-black text-gray-300">
            ?
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="flex flex-col p-6 flex-1 bg-white">
        <h3 className="text-2xl font-black text-gray-900 uppercase leading-tight line-clamp-2 mb-2 group-hover:text-[#0038FF] transition-colors">
          {twibbon.title}
        </h3>
        <p className="text-sm font-bold text-gray-500 line-clamp-3 leading-relaxed mb-4">
          {twibbon.description || "Dukung kampanye ini sekarang dengan memasang foto profil Anda!"}
        </p>
      </div>

      {/* Full-width CTA Button */}
      <div className="mt-auto bg-[#CCFF00] border-t-4 border-gray-900 p-5 flex items-center justify-center gap-2 group-hover:bg-[#0038FF] group-hover:text-white text-gray-900 transition-colors">
        <span className="font-black text-sm uppercase tracking-widest">
          IKUTI KAMPANYE
        </span>
        <svg
          className="w-6 h-6 group-hover:translate-x-2 transition-transform"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="3"
            d="M14 5l7 7m0 0l-7 7m7-7H3"
          ></path>
        </svg>
      </div>
    </Link>
  );
}
