import { ArrowYellowLeft, ArrowYellowRight, CircularBadge } from "@/components/ui/Accents";
import { Archivo_Black } from "next/font/google";

const archivoBlack = Archivo_Black({
  weight: "400",
  subsets: ["latin"],
});
export default function HeroSection({ compact = false }: { compact?: boolean }) {
  return (
    <main className={`relative z-10 px-4 flex flex-col items-center justify-center w-full max-w-[1440px] mx-auto ${compact ? 'pt-12 pb-16 md:pt-16 md:pb-24' : 'flex-1 pt-28 pb-16 md:pt-36 md:pb-20'}`}>
      <div className="relative w-full max-w-5xl mx-auto flex flex-col items-center justify-center text-center z-10 mt-4 mb-8">
        {/* Massive Typography */}
        <div className="w-full flex flex-col items-center relative z-10 space-y-2 md:space-y-4">
          <div className="w-full flex justify-start pl-[10%] md:pl-[20%] relative z-30">
            <h1
              className={`text-[clamp(4rem,11vw,140px)] leading-[0.85] tracking-tighter text-[#CCFF00] m-0 p-0 uppercase ${archivoBlack.className}`}
              style={{
                textShadow:
                  "1px 1px 0 #001A99,2px 2px 0 #001A99,3px 3px 0 #001A99,4px 4px 0 #001A99,5px 5px 0 #001A99,6px 6px 0 #001A99,8px 8px 0 #001A99,10px 10px 0 #001A99,12px 12px 0 #001A99",
              }}
            >
              #BEM
            </h1>
          </div>

          <div className="w-full flex justify-center relative z-20">
            <h1
              className={`text-[clamp(4.5rem,14vw,200px)] leading-[0.85] tracking-tighter text-white m-0 p-0 uppercase ${archivoBlack.className}`}
              style={{
                textShadow:
                  "1px 1px 0 #001A99,2px 2px 0 #001A99,3px 3px 0 #001A99,4px 4px 0 #001A99,5px 5px 0 #001A99,6px 6px 0 #001A99,8px 8px 0 #001A99,10px 10px 0 #001A99,12px 12px 0 #001A99",
              }}
            >
              UNSOED
            </h1>
          </div>

          <div className="w-full flex justify-end pr-[5%] md:pr-[20%] relative z-10">
            <h1
              className={`text-[clamp(4rem,11vw,140px)] leading-[0.85] tracking-tighter text-white m-0 p-0 uppercase ${archivoBlack.className}`}
              style={{
                textShadow:
                  "1px 1px 0 #001A99,2px 2px 0 #001A99,3px 3px 0 #001A99,4px 4px 0 #001A99,5px 5px 0 #001A99,6px 6px 0 #001A99,8px 8px 0 #001A99,10px 10px 0 #001A99,12px 12px 0 #001A99",
              }}
            >
              twibbon
            </h1>
          </div>
        </div>

        {/* Absolute Overlays */}
        <div className="absolute inset-0 w-full h-full pointer-events-none">
          {/* Decorative arrows */}
          <div className="absolute bottom-[5%] left-[2%] md:bottom-[15%] md:left-[10%] w-20 h-20 md:w-32 md:h-32 z-20 opacity-80">
            <ArrowYellowLeft />
          </div>
          <div className="absolute top-[10%] right-[2%] md:top-[20%] md:right-[10%] w-20 h-20 md:w-32 md:h-32 z-20 opacity-80">
            <ArrowYellowRight />
          </div>

          {/* Circular Badge */}
          <div className="absolute bottom-[-30%] right-[0%] md:bottom-[-10%] md:right-[12%] z-40 pointer-events-auto scale-75 md:scale-100 origin-bottom-right">
            <CircularBadge />
          </div>
        </div>
      </div>
    </main>
  );
}
