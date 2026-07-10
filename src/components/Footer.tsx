"use client";

import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();
  
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <footer className="w-full bg-white py-8 border-t border-gray-50 z-20 relative mt-auto">
      <div className="max-w-[1440px] mx-auto px-6 md:px-10 flex flex-col items-center justify-center text-center text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest gap-2">
        <p className="text-gray-900">© {new Date().getFullYear()} BEM UNSOED.</p>
        <p className="leading-relaxed">
          Dibuat oleh <a href="https://www.instagram.com/nakomisme/" target="_blank" rel="noopener noreferrer" className="text-[#0038FF] hover:underline hover:text-blue-800 transition-colors">Kementerian Media dan Komunikasi</a><br className="md:hidden" />
          <span className="hidden md:inline"> — </span>Direktorat Jenderal Website
        </p>
      </div>
    </footer>
  );
}
