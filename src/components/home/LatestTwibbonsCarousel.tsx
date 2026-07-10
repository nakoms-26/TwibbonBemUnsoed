"use client";

import { useEffect, useRef } from "react";
import TwibbonCard from "@/components/TwibbonCard";

export default function LatestTwibbonsCarousel({ twibbons }: { twibbons: any[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    // Fungsi untuk cek apakah ini perangkat mobile (di bawah breakpoint 'sm' / 640px)
    const checkMobile = () => window.innerWidth < 640;
    
    let isMobile = checkMobile();
    let intervalId: NodeJS.Timeout;
    
    const startScroll = () => {
      if (!isMobile) return;
      
      let currentIndex = 0;
      
      intervalId = setInterval(() => {
        if (!container) return;
        
        const maxIndex = twibbons.length - 1;
        currentIndex = currentIndex >= maxIndex ? 0 : currentIndex + 1;
        
        // Asumsi ukuran item = 80vw + gap
        const itemWidth = window.innerWidth * 0.8 + 16;
        
        container.scrollTo({
          left: currentIndex * itemWidth,
          behavior: "smooth"
        });
        
      }, 3000);
    };

    startScroll();

    // Hentikan auto-scroll jika pengguna menyentuh layar
    const pauseScroll = () => clearInterval(intervalId);
    container.addEventListener('touchstart', pauseScroll, { passive: true });
    
    // Tangani resize window
    const handleResize = () => {
      const currentlyMobile = checkMobile();
      if (currentlyMobile !== isMobile) {
        isMobile = currentlyMobile;
        clearInterval(intervalId);
        if (isMobile) startScroll();
      }
    };
    window.addEventListener('resize', handleResize);
    
    return () => {
      clearInterval(intervalId);
      container.removeEventListener('touchstart', pauseScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, [twibbons.length]);

  return (
    <div 
      ref={scrollRef}
      className="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 overflow-x-auto snap-x snap-mandatory pb-8 sm:pb-0 -mx-6 px-6 sm:mx-0 sm:px-0 sm:overflow-x-visible [&::-webkit-scrollbar]:hidden" 
      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
    >
      {twibbons.map((twibbon) => (
        <div key={twibbon.id} className="w-[80vw] sm:w-auto shrink-0 snap-center sm:snap-align-none">
          <TwibbonCard twibbon={twibbon} />
        </div>
      ))}
    </div>
  );
}
